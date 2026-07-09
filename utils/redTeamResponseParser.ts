import type { RedTeamRole } from "./types";

export interface ParsedAttackerResponse {
  attacksText: string;
}

export interface ParsedDefenderResponse {
  defenseText?: string;
  revisedAnswerText: string;
}

const ATTACKS_HEADER = /(?:^|\n)#+\s*\*{0,2}Attacks\*{0,2}\s*\n/i;
const DEFENSE_HEADER = /(?:^|\n)#+\s*\*{0,2}Defense\*{0,2}\s*\n/i;
const REVISED_HEADER = /(?:^|\n)#+\s*\*{0,2}(?:Revised|Hardened)\s+[Aa]nswer\*{0,2}\s*\n/i;

/**
 * Attacker output: keep everything from the "## Attacks" header onward (which
 * includes the "## Most critical" section). Falls back to the whole response.
 */
export function parseAttackerResponse(responseText: string): ParsedAttackerResponse {
  const trimmed = responseText.trim();
  if (!trimmed) return { attacksText: "" };

  const match = ATTACKS_HEADER.exec(trimmed);
  if (match) {
    // Keep the "## Attacks" heading and everything after it.
    return { attacksText: trimmed.slice(match.index).trim() };
  }

  return { attacksText: trimmed };
}

/**
 * Defender output: split into the "## Defense" triage and the
 * "## Revised answer" (or "## Hardened answer") hardened draft.
 */
export function parseDefenderResponse(responseText: string): ParsedDefenderResponse {
  const trimmed = responseText.trim();
  if (!trimmed) return { revisedAnswerText: "" };

  const revisedSplit = trimmed.split(REVISED_HEADER);
  if (revisedSplit.length >= 2) {
    const beforeRevised = revisedSplit[0];
    const revisedAnswerText = revisedSplit.slice(1).join("").trim();
    const defenseParts = beforeRevised.split(DEFENSE_HEADER);
    const defenseText = defenseParts.length >= 2
      ? defenseParts.slice(1).join("").trim()
      : beforeRevised.trim() || undefined;

    return {
      defenseText: defenseText || undefined,
      revisedAnswerText: revisedAnswerText || trimmed
    };
  }

  // No revised-answer header — treat any defense section as triage and leave
  // the hardened draft empty so the runner keeps the previous draft.
  const defenseOnly = trimmed.split(DEFENSE_HEADER);
  if (defenseOnly.length >= 2) {
    return {
      defenseText: defenseOnly.slice(1).join("").trim() || undefined,
      revisedAnswerText: ""
    };
  }

  // Unstructured response — use it as the hardened draft.
  return { revisedAnswerText: trimmed };
}

/**
 * Convenience dispatcher used by the runner.
 * Author responses are treated as the raw draft.
 */
export function parseRedTeamResponse(
  responseText: string,
  role: RedTeamRole
): { critiqueText?: string; revisedAnswerText: string } {
  const trimmed = responseText.trim();

  if (role === "author") {
    return { revisedAnswerText: trimmed };
  }

  if (role === "attacker") {
    const parsed = parseAttackerResponse(trimmed);
    return { critiqueText: parsed.attacksText, revisedAnswerText: "" };
  }

  const parsed = parseDefenderResponse(trimmed);
  return { critiqueText: parsed.defenseText, revisedAnswerText: parsed.revisedAnswerText };
}
