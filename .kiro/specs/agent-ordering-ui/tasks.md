# Implementation Plan: Agent Ordering UI

## Overview

This implementation adds drag-and-drop ordering capability to the agent selection interface. It replaces the current 2-column checkbox grid (`agent-grid`) with an ordered list component that displays selected agents first (in their stored order), followed by unselected agents. The order is persisted to `CouncilPreferences.selectedAgentKeys` but does not affect current Council execution behavior.

## Tasks

- [ ] 1. Create utility functions for agent ordering
  - [x] 1.1 Create `toggleAgent` function in App.tsx
    - Add new toggle logic: if agent is unselected, append to END of array
    - If agent is selected, remove while preserving order of remaining agents
    - _Requirements: 1.2, 1.3_
  
  - [x] 1.2 Create `reorderAgents` function
    - Implement reorder logic: move sourceKey to appear immediately before targetKey
    - Preserve relative order of all other agents
    - Return new array without mutating input
    - _Requirements: 3.3_
  
  - [x] 1.3 Create `getAgentOrderIndex` function
    - Return 1-based index if agent is selected
    - Return null if agent is not selected
    - _Requirements: 2.1_
  
  - [x] 1.4 Create `validateReorder` function
    - Validate sourceKey and targetKey are both selected and different
    - Return false for invalid operations
    - _Requirements: 6.3_

- [ ] 2. Create AgentOrderList component
  - [-] 2.1 Create `AgentOrderList.tsx` component file
    - Define `AgentOrderListProps` interface with agents, selectedKeys, judgeKey, onToggle, onReorder
    - Manage drag state: `draggedKey` and `dropTargetKey`
    - Sort agents: selected first (in stored order), then unselected
    - Exclude judge from the rendered list
    - _Requirements: 1.1, 4.1_
  
  - [~] 2.2 Implement drag event handlers
    - `handleDragStart`: set draggedKey, set `effectAllowed = "move"`
    - `handleDragOver`: set dropTargetKey, prevent default
    - `handleDrop`: call onReorder if valid, clear drag state
    - `handleDragEnd`: clear drag state on cancel
    - _Requirements: 3.1, 3.3, 3.5_
  
  - [~] 3. Checkpoint - Verify AgentOrderList renders correctly
    - Ensure selected agents appear first in correct order
    - Ensure unselected agents appear after selected agents
    - Ensure judge is excluded from the list
    - Ask the user if questions arise.

- [ ] 4. Create AgentItem component
  - [~] 4.1 Create `AgentItem.tsx` component file
    - Define `AgentItemProps` interface with agent, isSelected, orderIndex, isJudge, isDragged, isDropTarget, dragHandleProps, onToggle
    - Render checkbox, order badge (if selected), agent name, and drag handle
    - Apply visual states: disabled (judge), dragged (semi-transparent), drop target (highlighted)
    - _Requirements: 1.4, 2.1, 2.4, 6.1, 6.2_
  
  - [-] 4.2 Create `OrderBadge.tsx` component file
    - Render small circular badge with position number centered
    - Apply consistent styling
    - _Requirements: 2.4_
  
  - [-] 4.3 Create `DragHandle.tsx` component file
    - Render grip icon (Unicode or CSS)
    - Apply `draggable` attribute only if agent is selected and not judge
    - Forward drag event handlers from parent
    - Handle keyboard shortcuts: Alt+Up/Down for reordering
    - _Requirements: 3.1, 7.1, 7.2_

- [ ] 5. Integrate AgentOrderList into App.tsx
  - [~] 5.1 Replace agent-grid with AgentOrderList component
    - Import AgentOrderList component
    - Replace the `<div className="agent-grid">` block with `<AgentOrderList />`
    - Pass props: agentApps, selectedAgents, judgeKey, toggleAgent handler, reorderAgents handler
    - _Requirements: 1.1_
  
  - [~] 5.2 Update toggleAgent to use new ordering logic
    - Replace current toggleAgent implementation with the new end-of-array logic
    - Ensure judge exclusion is preserved
    - _Requirements: 1.2, 1.3_
  
  - [~] 5.3 Add onReorder handler to App.tsx
    - Create `handleReorder` function that calls `reorderAgents` and updates state
    - Pass to AgentOrderList as `onReorder` prop
    - Preferences save automatically via existing useEffect
    - _Requirements: 3.3, 5.2_

- [ ] 6. Add CSS styles for agent ordering UI
  - [~] 6.1 Add styles for AgentOrderList container
    - Replace `agent-grid` 2-column layout with single-column list
    - Add spacing between items
    - _Requirements: 1.1_
  
  - [~] 6.2 Add styles for AgentItem row
    - Layout: checkbox, order badge, agent name, drag handle
    - Visual states: hover, dragged (semi-transparent), drop target (highlighted)
    - _Requirements: 3.1, 3.2_
  
  - [~] 6.3 Add styles for OrderBadge
    - Small circular badge with centered number
    - Background color, border, typography
    - _Requirements: 2.4_
  
  - [~] 6.4 Add styles for DragHandle
    - Grip icon appearance
    - Cursor: grab/grabbing
    - Disabled state for unselected agents
    - _Requirements: 6.1, 6.2_

- [~] 7. Checkpoint - Verify drag-and-drop functionality
    - Ensure drag visual feedback works (semi-transparent source, drop indicator)
    - Ensure drop triggers correct reorder
    - Ensure preferences persist after reorder
    - Ask the user if questions arise.

- [ ] 8. Add keyboard accessibility for reordering
  - [~] 8.1 Implement Alt+Up and Alt+Down handlers in DragHandle
    - When focus is on drag handle of selected agent, listen for Alt+Up/Down
    - Call onReorder with appropriate source and target
    - Handle boundary conditions (first/last position)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 9. Verify existing functionality preserved
  - [~] 9.1 Verify judge exclusion still works
    - Judge should not appear in agent list
    - Changing judge should remove that agent from selectedAgents
    - Order of remaining agents should be preserved
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [~] 9.2 Verify Council execution unchanged
    - Run Council should work as before
    - agentKeys order in RunCouncilRequest should be preserved but execution behavior unchanged
    - Parallel mode should work as before
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [~] 9.3 Verify preferences persistence
    - Selected agents and order should persist across sessions
    - Side panel reopen should restore order from CouncilPreferences
    - _Requirements: 5.1, 5.2, 5.3_

- [~] 10. Final checkpoint - Ensure all tests pass
  - Ensure all functionality works correctly
  - Verify no regressions in existing behavior
  - Ask the user if questions arise.

## Notes

- All components use TypeScript and React 19.2.7
- No new dependencies required - using native HTML5 Drag and Drop API
- The order is stored in `CouncilPreferences.selectedAgentKeys` but NOT used by current Council execution
- Judge is always excluded from the agent list
- Keyboard accessibility uses Alt+Up/Down for reordering
- Each task references specific requirements for traceability

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "4.2", "4.3"] },
    { "id": 2, "tasks": ["2.2", "4.1"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3", "6.1"] },
    { "id": 4, "tasks": ["6.2", "6.3", "6.4", "8.1"] },
    { "id": 5, "tasks": ["9.1", "9.2", "9.3"] }
  ]
}
```
