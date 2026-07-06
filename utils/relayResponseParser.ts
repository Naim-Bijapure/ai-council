import type { RelayRole } from "./types";

export interface ParsedRelayResponse {
  critiqueText?: string;
  revisedAnswerText: string;
}

const CRITIQUE_HEADER = /(?:^|\n)#+\s*\*{0,2}Critique\*{0,2}\s*\n/i;
const REVISED_HEADER = /(?:^|\n)#+\s*\*{0,2}Revised\s+[Aa]nswer\*{0,2}\s*\n/i;

export function parseRelayResponse(responseText: string, role: RelayRole): ParsedRelayResponse {
  const trimmed = responseText.trim();
  if (!trimmed) {
    return { revisedAnswerText: "" };
  }

  if (role === "author") {
    return { revisedAnswerText: trimmed };
  }

  const revisedSplit = trimmed.split(REVISED_HEADER);
  if (revisedSplit.length >= 2) {
    const beforeRevised = revisedSplit[0];
    const revisedAnswerText = revisedSplit.slice(1).join("").trim();
    const critiqueParts = beforeRevised.split(CRITIQUE_HEADER);
    const critiqueText = critiqueParts.length >= 2
      ? critiqueParts.slice(1).join("").trim()
      : beforeRevised.trim() || undefined;

    return {
      critiqueText: critiqueText || undefined,
      revisedAnswerText: revisedAnswerText || trimmed
    };
  }

  const critiqueOnly = trimmed.split(CRITIQUE_HEADER);
  if (critiqueOnly.length >= 2) {
    return {
      critiqueText: critiqueOnly.slice(1).join("").trim() || undefined,
      revisedAnswerText: trimmed
    };
  }

  return { revisedAnswerText: trimmed };
}