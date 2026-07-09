export interface RedTeamJudgePromptTemplate {
  id: string;
  name: string;
  description: string;
  compose: (prompt: string, stepSections: string[], finalDraft: string, note: string) => string;
}

const PREAMBLE = (role: string, mission: string) =>
  `You are the ${role} — the final authority in a red-team review. An Author drafted an answer, adversarial Attackers tried to break it, and Defenders rebutted the attacks and hardened the answer. ${mission}.

---

Original request:
\${prompt}

---

Hardened answer (output of the last defense step):
\${finalDraft}

---

Full red team transcript (author draft, attacks, and defenses):

\${stepSections}

\${note}---

`;

function tpl(role: string, mission: string, judging: string, structure: string): RedTeamJudgePromptTemplate["compose"] {
  const preamble = PREAMBLE(role, mission);
  return (prompt, stepSections, finalDraft, note) => {
    const body = preamble
      .replace("${prompt}", prompt)
      .replace("${finalDraft}", finalDraft)
      .replace("${stepSections}", stepSections.join("\n\n"))
      .replace("${note}", note ? `${note}\n\n` : "");
    return body + judging + "\n\nOutput your response in EXACTLY this structure, using Markdown headings:\n\n" + structure;
  };
}

const HARDENED = tpl(
  "Red Team Judge",
  "Your job is to deliver the strongest final answer the user can rely on, plus an honest account of the risks that remain",
  `How to judge:
- Start from the hardened answer, but verify it against the transcript — confirm that valid attacks were actually fixed and that no correct content was lost while defending.
- Discard bogus or overstated attacks; do not let noise weaken a sound answer. Call out any attack the defenders wrongly dismissed.
- Add any critical weakness that NEITHER the attackers nor defenders caught.
- Be honest about residual risk — the goal is a trustworthy answer, not a reassuring one.`,
  `## Final Answer
The definitive, hardened answer to the original request — written as your own complete response, not a summary of the review. Fold in every verified fix.

## Residual Risks
Bullet list of weaknesses, assumptions, or failure modes that still remain after hardening, ordered by severity. If none are material, write: "None material — the answer is robust."

## Review Assessment
2-4 bullets: which attacks were most damaging, whether the defenses actually resolved them, and how much to trust the final answer.`
);

const THREAT_REPORT = tpl(
  "Red Team Threat Analyst",
  "Your job is to produce a structured risk register from the review so the user understands exactly how this could fail",
  `How to judge:
- Consolidate and de-duplicate every attack across all attackers into a single ranked register.
- Normalize severity (critical/high/medium/low) using impact and likelihood — do not just trust each attacker's own rating.
- For each risk, note whether the defenders mitigated it, partially mitigated it, or left it open.
- Discard invalid or speculative "attacks" and say why.`,
  `## Summary
2-4 sentences on the overall robustness of the answer and the biggest threats.

## Risk Register
For each distinct risk, one entry:
- **[severity] <title>** — description · Status: mitigated / partial / open · who raised it.

## Recommended Hardening
Concrete actions to close the open and partial risks.

## Hardened Answer
The best current answer incorporating all effective defenses.`
);

const GO_NO_GO = tpl(
  "Red Team Decision Judge",
  "Your job is to make a clear go / no-go call on whether this answer is safe to rely on as-is",
  `How to judge:
- Weigh the surviving risks against the strength of the defenses. Be decisive but honest.
- A single unresolved critical risk is enough to withhold a "GO".
- Ignore bogus attacks; base the decision only on credible, unresolved weaknesses.`,
  `## Verdict
Exactly one of: "GO" (safe to rely on as-is), "GO WITH CAUTION" (usable if the noted conditions are met), or "NO-GO" (do not rely on it yet) — followed by one sentence of justification.

## Blocking Issues
The specific unresolved risks behind the verdict. If none, write "None."

## Conditions / Next Steps
What must be true or done before this answer is fully trustworthy.

## Final Answer
The hardened answer as it stands, with any caveats the user must know.`
);

export const RED_TEAM_JUDGE_PROMPT_TEMPLATES: RedTeamJudgePromptTemplate[] = [
  { id: "redteam-hardened", name: "Hardened Answer", description: "Default — verified final answer plus a ranked list of residual risks", compose: HARDENED },
  { id: "redteam-threat-report", name: "Threat Report", description: "A consolidated, severity-ranked risk register with mitigation status", compose: THREAT_REPORT },
  { id: "redteam-go-no-go", name: "Go / No-Go", description: "A decisive verdict on whether the answer is safe to rely on, with blocking issues", compose: GO_NO_GO }
];

export const DEFAULT_RED_TEAM_JUDGE_PROMPT_TEMPLATE_ID = "redteam-hardened";

export function getRedTeamJudgePromptTemplate(id?: string): RedTeamJudgePromptTemplate {
  if (!id) return RED_TEAM_JUDGE_PROMPT_TEMPLATES[0];
  return RED_TEAM_JUDGE_PROMPT_TEMPLATES.find((t) => t.id === id) ?? RED_TEAM_JUDGE_PROMPT_TEMPLATES[0];
}
