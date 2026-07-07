import { getJudgePromptTemplate } from "./judgePromptTemplates";
import { getSupportedApp } from "./appRegistry";
import type { AgentResult } from "./types";

const JUDGE_PROMPT_LIMIT = 15_000;
const SEVERE_AGENT_LIMIT = 2_000;
const TRIM_SUFFIX = "...";
const MIN_TRIMMED_SECTION_LENGTH = SEVERE_AGENT_LIMIT + TRIM_SUFFIX.length;
const MAX_TRIM_ITERATIONS = 64;

interface BuildJudgePromptInput {
  prompt: string;
  agentResults: AgentResult[];
  templateId?: string;
}

export interface JudgePromptResult {
  text: string;
  trimmed: boolean;
  severelyTrimmed: boolean;
}

export function buildJudgePrompt(input: BuildJudgePromptInput): JudgePromptResult {
  const composeFn = getJudgePromptTemplate(input.templateId).compose;
  const sections = input.agentResults.map(formatAgentResult);
  let note = "";
  let text = composeFn(input.prompt, sections, note);
  let trimmed = false;
  let severelyTrimmed = false;

  if (text.length > JUDGE_PROMPT_LIMIT) {
    trimmed = true;
    note = "[Note: Some agent responses were trimmed to fit within length limits.]";
    const trimmedSections = trimLongestSections(input.prompt, sections, note, composeFn);
    text = composeFn(input.prompt, trimmedSections, note);

    if (text.length > JUDGE_PROMPT_LIMIT) {
      severelyTrimmed = true;
      const cappedSections = trimmedSections.map((section) =>
        section.length > SEVERE_AGENT_LIMIT ? `${section.slice(0, SEVERE_AGENT_LIMIT)}...` : section
      );
      text = composeFn(input.prompt, cappedSections, note);
    }
  }

  return { text, trimmed, severelyTrimmed };
}

export async function buildJudgePromptAsync(input: BuildJudgePromptInput): Promise<JudgePromptResult> {
  await Promise.resolve();
  return buildJudgePrompt(input);
}

function formatAgentResult(result: AgentResult): string {
  const appName = getSupportedApp(result.agentKey).displayName;

  if (result.status === "done") {
    return `### ${appName}\n${result.responseText}`;
  }

  if (result.status === "timeout") {
    return `### ${appName}\n[No response - this agent timed out.]`;
  }

  return `### ${appName}\n[No response - this agent encountered an error: ${result.errorReason ?? "unknown"}.]`;
}

function trimLongestSections(
  prompt: string,
  sections: string[],
  note: string,
  composeFn: (prompt: string, sections: string[], note: string) => string
): string[] {
  const nextSections = [...sections];

  for (let iteration = 0; iteration < MAX_TRIM_ITERATIONS; iteration++) {
    const composedLength = composeFn(prompt, nextSections, note).length;
    if (composedLength <= JUDGE_PROMPT_LIMIT) {
      break;
    }

    let longestIndex = 0;
    nextSections.forEach((section, index) => {
      if (section.length > nextSections[longestIndex].length) {
        longestIndex = index;
      }
    });

    const longest = nextSections[longestIndex];
    if (longest.length <= MIN_TRIMMED_SECTION_LENGTH) {
      break;
    }

    const reduceBy = Math.max(250, Math.ceil((composedLength - JUDGE_PROMPT_LIMIT) / 2));
    const targetLength = Math.max(SEVERE_AGENT_LIMIT, longest.length - reduceBy);
    const trimmed = `${longest.slice(0, targetLength)}${TRIM_SUFFIX}`;
    if (trimmed.length >= longest.length) {
      break;
    }

    nextSections[longestIndex] = trimmed;
  }

  return nextSections;
}
