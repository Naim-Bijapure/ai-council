import { getRedTeamJudgePromptTemplate } from "./redTeamJudgePromptTemplates";
import { getSupportedApp } from "./appRegistry";
import type { AgentResult } from "./types";

// ---------------------------------------------------------------------------
// Response budgets (soft, enforced via prompt instructions) + context caps
// (hard, enforced via trimming). Budgets are generous — most chat models cap a
// single response near ~8k output tokens (~6k words), so these stay well under
// while keeping the accumulated forward context below the ~15k-char step ceiling.
// ---------------------------------------------------------------------------
const AUTHOR_WORD_TARGET = 700;
const ATTACKER_WORD_TARGET = 500;
const ATTACKER_MAX_FINDINGS = 6;
const DEFENDER_DEFENSE_WORD_TARGET = 250;
const DEFENDER_ANSWER_WORD_TARGET = 700;

const STEP_PROMPT_LIMIT = 15_000;
const DRAFT_LIMIT = 6_000;
const FINDINGS_LIMIT = 6_000;
const SEVERE_DRAFT_LIMIT = 2_000;
const SEVERE_FINDINGS_LIMIT = 2_000;
const TRIM_SUFFIX = "...";

export interface RedTeamPromptResult {
  text: string;
  trimmed: boolean;
}

/** A single attacker's findings, kept for the defense phase and the judge. */
export interface RedTeamFinding {
  attackerName: string;
  attacksText: string;
}

function trimTo(text: string, maxChars: number, severeFloor: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(severeFloor, maxChars))}${TRIM_SUFFIX}`;
}

// ---------------------------------------------------------------------------
// Author — produces the initial answer to the target prompt.
// ---------------------------------------------------------------------------
export function buildRedTeamAuthorPrompt(question: string): string {
  return `You are the Author in a red-team review. Produce the best, most defensible answer you can to the request below — this answer will then be attacked by adversarial reviewers and hardened by defenders, so make it accurate, well-reasoned, and free of unsupported claims.

Keep it complete but focused: aim for roughly ${AUTHOR_WORD_TARGET} words or fewer. Do not pad.

Request:
${question.trim()}`;
}

// ---------------------------------------------------------------------------
// Attacker — independently tries to break the current draft.
// ---------------------------------------------------------------------------
interface BuildAttackerPromptInput {
  question: string;
  currentDraft: string;
  attackerName: string;
}

export function buildAttackerPrompt(input: BuildAttackerPromptInput): RedTeamPromptResult {
  const compose = (draft: string, note: string): string =>
    `You are ${input.attackerName}, an adversarial red-team reviewer. Your only job is to BREAK the proposed answer below — find the flaws the author missed.

Hunt for: factual errors, unsupported or fabricated claims, hidden or false assumptions, logical gaps, missing edge cases, failure modes, security/abuse vectors, and ways a real user or bad actor could make this fail. Be specific and concrete — a vague objection is worthless.

Constraints:
- List at most ${ATTACKER_MAX_FINDINGS} findings, strongest first.
- Keep your whole response under ~${ATTACKER_WORD_TARGET} words.
- Do NOT rewrite or fix the answer. Only attack it.

Original request:
${input.question}

Proposed answer to attack:
${draft}

${note ? `${note}\n\n` : ""}Respond with EXACTLY these two Markdown sections:

## Attacks
- [critical|high|medium|low] <short title> — how it fails + a concrete failure/exploit scenario
(one bullet per finding)

## Most critical
The single most damaging finding and why it matters most.`;

  let draft = input.currentDraft;
  let note = "";
  let trimmed = false;
  let text = compose(draft, note);

  if (text.length > STEP_PROMPT_LIMIT) {
    trimmed = true;
    note = "[Note: The proposed answer was trimmed to fit within length limits.]";
    const overhead = compose("", note).length;
    draft = trimTo(draft, STEP_PROMPT_LIMIT - overhead, SEVERE_DRAFT_LIMIT);
    text = compose(draft, note);
    if (text.length > STEP_PROMPT_LIMIT) {
      draft = draft.slice(0, SEVERE_DRAFT_LIMIT) + TRIM_SUFFIX;
      text = compose(draft, note);
    }
  }

  return { text, trimmed };
}

// ---------------------------------------------------------------------------
// Defender — rebuts invalid attacks, fixes valid ones, and hardens the draft.
// ---------------------------------------------------------------------------
interface BuildDefenderPromptInput {
  question: string;
  currentDraft: string;
  findings: RedTeamFinding[];
  defenderName: string;
  stepIndex: number;
}

export function buildDefenderPrompt(input: BuildDefenderPromptInput): RedTeamPromptResult {
  const compose = (draft: string, findingsSection: string, note: string): string =>
    `You are ${input.defenderName}, defending and hardening an answer against red-team attacks (defense step ${input.stepIndex}).

Your job:
1. Triage every attack — say which are valid and which are bogus/overstated, briefly.
2. Fix the valid ones and produce a hardened answer that survives the attacks while keeping everything that was already correct.

Constraints:
- Keep the defense triage under ~${DEFENDER_DEFENSE_WORD_TARGET} words.
- Keep the hardened answer under ~${DEFENDER_ANSWER_WORD_TARGET} words.
- Do not weaken correct content just to dodge an attack.

Original request:
${input.question}

Current answer to harden:
${draft}

Attacks raised by the red team:
${findingsSection}

${note ? `${note}\n\n` : ""}Respond with EXACTLY these two Markdown sections:

## Defense
Per-attack triage (valid vs bogus) and the fixes you applied.

## Revised answer
The complete hardened answer to the original request.`;

  let draft = trimTo(input.currentDraft, DRAFT_LIMIT, SEVERE_DRAFT_LIMIT);
  let findingsSection = formatFindingsForPrompt(input.findings);
  findingsSection = trimTo(findingsSection, FINDINGS_LIMIT, SEVERE_FINDINGS_LIMIT);
  let note = "";
  let trimmed = draft.length < input.currentDraft.length;
  let text = compose(draft, findingsSection, note);

  if (text.length > STEP_PROMPT_LIMIT) {
    trimmed = true;
    note = "[Note: Some content was trimmed to fit within length limits.]";
    // Trim findings first (they are the most compressible), then the draft.
    const draftOverhead = compose("", findingsSection, note).length;
    if (draftOverhead > STEP_PROMPT_LIMIT) {
      findingsSection = trimTo(findingsSection, SEVERE_FINDINGS_LIMIT, SEVERE_FINDINGS_LIMIT);
    }
    text = compose(draft, findingsSection, note);

    if (text.length > STEP_PROMPT_LIMIT) {
      const overhead = compose("", findingsSection, note).length;
      draft = trimTo(draft, STEP_PROMPT_LIMIT - overhead, SEVERE_DRAFT_LIMIT);
      text = compose(draft, findingsSection, note);
    }

    if (text.length > STEP_PROMPT_LIMIT) {
      draft = draft.slice(0, SEVERE_DRAFT_LIMIT) + TRIM_SUFFIX;
      findingsSection = findingsSection.slice(0, SEVERE_FINDINGS_LIMIT) + TRIM_SUFFIX;
      text = compose(draft, findingsSection, note);
    }
  }

  return { text, trimmed };
}

function formatFindingsForPrompt(findings: RedTeamFinding[]): string {
  if (findings.length === 0) {
    return "[No attacks were recorded — harden the answer against the most likely weaknesses you can find.]";
  }
  return findings
    .map((f) => `From ${f.attackerName}:\n${f.attacksText.trim()}`)
    .join("\n\n");
}

// ---------------------------------------------------------------------------
// Judge — synthesizes the whole session into the final deliverable.
// ---------------------------------------------------------------------------
const JUDGE_PROMPT_LIMIT = 15_000;
const JUDGE_STEP_CONTENT_LIMIT = 4_000;
const JUDGE_FINAL_DRAFT_LIMIT = 6_000;
const JUDGE_SEVERE_STEP_LIMIT = 2_000;
const JUDGE_MIN_TRIMMED_SECTION = JUDGE_SEVERE_STEP_LIMIT + TRIM_SUFFIX.length;
const JUDGE_MAX_TRIM_ITERATIONS = 64;

interface BuildRedTeamJudgePromptInput {
  prompt: string;
  agentResults: AgentResult[];
  finalDraft: string;
  templateId?: string;
}

export interface RedTeamJudgePromptResult {
  text: string;
  trimmed: boolean;
}

export function buildRedTeamJudgePrompt(input: BuildRedTeamJudgePromptInput): RedTeamJudgePromptResult {
  const composeFn = getRedTeamJudgePromptTemplate(input.templateId).compose;
  let stepSections = input.agentResults.map(formatRedTeamStep);
  let finalDraft = trimTo(input.finalDraft, JUDGE_FINAL_DRAFT_LIMIT, SEVERE_DRAFT_LIMIT);
  let note = "";
  let text = composeFn(input.prompt, stepSections, finalDraft, note);
  let trimmed = finalDraft.length < input.finalDraft.length;

  if (text.length > JUDGE_PROMPT_LIMIT) {
    trimmed = true;
    note = "[Note: Some red team steps were trimmed to fit within length limits.]";
    stepSections = trimLongestSections(input.prompt, stepSections, finalDraft, note, composeFn);
    text = composeFn(input.prompt, stepSections, finalDraft, note);

    if (text.length > JUDGE_PROMPT_LIMIT) {
      stepSections = stepSections.map((section) =>
        section.length > JUDGE_MIN_TRIMMED_SECTION
          ? `${section.slice(0, JUDGE_SEVERE_STEP_LIMIT)}${TRIM_SUFFIX}`
          : section
      );
      text = composeFn(input.prompt, stepSections, finalDraft, note);
    }

    if (text.length > JUDGE_PROMPT_LIMIT) {
      finalDraft = trimTo(
        finalDraft,
        Math.max(
          SEVERE_DRAFT_LIMIT,
          JUDGE_PROMPT_LIMIT - composeFn(input.prompt, stepSections, "", note).length - 500
        ),
        SEVERE_DRAFT_LIMIT
      );
      text = composeFn(input.prompt, stepSections, finalDraft, note);
    }
  }

  return { text, trimmed };
}

export async function buildRedTeamJudgePromptAsync(
  input: BuildRedTeamJudgePromptInput
): Promise<RedTeamJudgePromptResult> {
  await Promise.resolve();
  return buildRedTeamJudgePrompt(input);
}

function truncateForJudgeStep(text: string, limit = JUDGE_STEP_CONTENT_LIMIT): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}${TRIM_SUFFIX}`;
}

function redTeamRoleLabel(role: AgentResult["redTeamRole"]): string {
  if (role === "author") return "Author";
  if (role === "attacker") return "Attacker";
  if (role === "defender") return "Defender";
  return "Agent";
}

function formatRedTeamStep(result: AgentResult): string {
  const appName = getSupportedApp(result.agentKey).displayName;
  const role = redTeamRoleLabel(result.redTeamRole);
  const header = `### ${appName} (${role})`;

  if (result.status !== "done") {
    if (result.status === "skipped") return `${header}\n[Skipped.]`;
    if (result.status === "timeout") return `${header}\n[No response — this step timed out.]`;
    return `${header}\n[No response — error: ${result.errorReason ?? "unknown"}.]`;
  }

  if (result.redTeamRole === "author") {
    const draft = result.revisedAnswerText ?? result.responseText;
    return `${header}\n**Initial answer:**\n${truncateForJudgeStep(draft)}`;
  }

  if (result.redTeamRole === "attacker") {
    const attacks = result.critiqueText ?? result.responseText;
    return `${header}\n**Attacks:**\n${truncateForJudgeStep(attacks)}`;
  }

  if (result.redTeamRole === "defender") {
    const parts = [header];
    if (result.critiqueText) {
      parts.push(`**Defense:**\n${truncateForJudgeStep(result.critiqueText)}`);
    }
    const answer = result.revisedAnswerText ?? result.responseText;
    parts.push(`**Hardened answer:**\n${truncateForJudgeStep(answer)}`);
    return parts.join("\n\n");
  }

  return `${header}\n${truncateForJudgeStep(result.responseText)}`;
}

function trimLongestSections(
  prompt: string,
  sections: string[],
  finalDraft: string,
  note: string,
  composeFn: (prompt: string, stepSections: string[], finalDraft: string, note: string) => string
): string[] {
  const next = [...sections];

  for (let iteration = 0; iteration < JUDGE_MAX_TRIM_ITERATIONS; iteration++) {
    const composedLength = composeFn(prompt, next, finalDraft, note).length;
    if (composedLength <= JUDGE_PROMPT_LIMIT) break;

    let longestIndex = 0;
    next.forEach((section, index) => {
      if (section.length > next[longestIndex].length) longestIndex = index;
    });

    const longest = next[longestIndex];
    if (longest.length <= JUDGE_MIN_TRIMMED_SECTION) break;

    const reduceBy = Math.max(250, Math.ceil((composedLength - JUDGE_PROMPT_LIMIT) / 2));
    const targetLength = Math.max(JUDGE_SEVERE_STEP_LIMIT, longest.length - reduceBy);
    const trimmed = `${longest.slice(0, targetLength)}${TRIM_SUFFIX}`;
    if (trimmed.length >= longest.length) break;

    next[longestIndex] = trimmed;
  }

  return next;
}
