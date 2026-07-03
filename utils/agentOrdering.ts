import type { AppKey } from "./types";

/**
 * Toggles an agent's selection status.
 * - If agent is selected: removes it, preserving order of remaining agents
 * - If agent is not selected: adds it to the END of the array
 *
 * @param key - The agent key to toggle
 * @param selectedAgents - Current ordered array of selected agent keys
 * @param judgeKey - Current judge key (unused but kept for API consistency)
 * @returns New array with the toggle applied
 */
export function toggleAgent(
  key: AppKey,
  selectedAgents: AppKey[],
  judgeKey: AppKey
): AppKey[] {
  if (selectedAgents.includes(key)) {
    // Remove key, preserving order of remaining items
    return selectedAgents.filter((k) => k !== key);
  } else {
    // Add key to end of array
    return [...selectedAgents, key];
  }
}

/**
 * Reorders agents by moving sourceKey to appear immediately before targetKey.
 * Preserves relative order of all other agents.
 *
 * @param selectedAgents - Current ordered array of selected agent keys
 * @param sourceKey - The key of the agent being dragged
 * @param targetKey - The key of the drop target agent
 * @returns New array with sourceKey moved before targetKey
 */
export function reorderAgents(
  selectedAgents: AppKey[],
  sourceKey: AppKey,
  targetKey: AppKey
): AppKey[] {
  if (sourceKey === targetKey) {
    return selectedAgents; // No-op
  }

  const result: AppKey[] = [];
  let sourceInserted = false;

  for (const key of selectedAgents) {
    if (key === sourceKey) {
      // Skip sourceKey - we'll insert it before targetKey
      continue;
    }

    if (key === targetKey && !sourceInserted) {
      // Insert sourceKey before targetKey
      result.push(sourceKey);
      sourceInserted = true;
    }

    result.push(key);
  }

  return result;
}

/**
 * Returns 1-based index if agent is selected, null if not selected.
 *
 * @param key - The agent key to look up
 * @param selectedAgents - Current ordered array of selected agent keys
 * @returns 1-based position if selected, null otherwise
 */
export function getAgentOrderIndex(
  key: AppKey,
  selectedAgents: AppKey[]
): number | null {
  const index = selectedAgents.indexOf(key);
  return index === -1 ? null : index + 1; // Convert to 1-based
}

/**
 * Validates that a reorder operation is valid.
 * Returns true if both sourceKey and targetKey are in selectedAgents and are different.
 *
 * @param selectedAgents - Current ordered array of selected agent keys
 * @param sourceKey - The key of the agent being dragged
 * @param targetKey - The key of the drop target agent
 * @returns true if the reorder is valid, false otherwise
 */
export function validateReorder(
  selectedAgents: AppKey[],
  sourceKey: AppKey,
  targetKey: AppKey
): boolean {
  return (
    sourceKey !== targetKey &&
    selectedAgents.includes(sourceKey) &&
    selectedAgents.includes(targetKey)
  );
}
