// Shared response-length budgets and a prompt wrapper used to keep agent
// responses bounded across all council types. This mirrors the per-role
// budgets used by the red team council, so relay and agentJudge agents stay
// within the same forward-context ceiling and never overflow the ~15k-char
// step/judge prompt limits.

/** Default word budget for a full answer (agentJudge agents, relay author). */
export const AGENT_ANSWER_WORD_TARGET = 700;

/** Word budget for the critique portion of a relay reviewer response. */
export const REVIEWER_CRITIQUE_WORD_TARGET = 250;

/** Word budget for the revised answer portion of a relay reviewer response. */
export const REVIEWER_ANSWER_WORD_TARGET = 700;

/**
 * Appends a soft response-length directive to a prompt. The directive is
 * additive and never touches any required output-format contract (e.g. relay's
 * "## Critique" / "## Revised answer" sections), so parsing stays intact.
 */
export function withResponseBudget(prompt: string, wordTarget = AGENT_ANSWER_WORD_TARGET): string {
  return `${prompt.trim()}

---
Response length: keep your answer focused and under roughly ${wordTarget} words. Prioritize accuracy and completeness over padding — do not add filler to reach the limit.`;
}
