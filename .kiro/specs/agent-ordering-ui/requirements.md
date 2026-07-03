# Requirements Document

## Introduction

The Agent Ordering UI feature adds drag-and-drop ordering capability to the agent selection interface in the AI Council side panel. It transforms the current 2-column checkbox grid into an ordered list where users can rearrange selected agents via drag-and-drop. The order is stored in `CouncilPreferences.selectedAgentKeys` but is NOT used by the current Council execution workflow—it is being implemented as a prerequisite for a future "Relay-Critique" workflow where agent execution order will matter.

## Glossary

- **Agent**: An AI assistant application (e.g., ChatGPT, Claude, Gemini) that can be selected to participate in a council session
- **AppKey**: A string identifier for an agent (e.g., "chatgpt", "claude", "gemini")
- **AgentOrderList**: A React component that renders the ordered list of agents with drag-and-drop capability
- **AgentItem**: A React component that renders a single agent row with checkbox, drag handle, and order badge
- **OrderBadge**: A visual indicator showing the agent's position in the order (numbered circle)
- **DragHandle**: A grip icon that serves as the draggable area for an agent
- **Judge**: A special agent role that evaluates council responses; excluded from the agent selection list
- **CouncilPreferences**: The stored user preferences including selected agents, judge, and parallel mode
- **selectedAgentKeys**: An ordered array of AppKey values representing the selected agents in their display order

## Requirements

### Requirement 1: Display Ordered Agent List

**User Story:** As a user, I want to see my selected agents in a vertically ordered list, so that I can understand the sequence in which agents will be used.

#### Acceptance Criteria

1. WHEN the agent selection UI is rendered, THE AgentOrderList SHALL display all selected agents first in their stored order, followed by unselected agents
2. WHEN an agent is selected, THE AgentOrderList SHALL append the agent to the end of the selected agents list
3. WHEN an agent is deselected, THE AgentOrderList SHALL remove the agent from the selected agents list while preserving the order of remaining agents
4. THE AgentOrderList SHALL display each agent with a checkbox, an order badge (if selected), and a drag handle

### Requirement 2: Show Order Badges for Selected Agents

**User Story:** As a user, I want to see numbered badges on my selected agents, so that I can quickly identify each agent's position in the order.

#### Acceptance Criteria

1. WHEN an agent is selected, THE OrderBadge SHALL display a 1-based index indicating the agent's position
2. WHEN an agent is unselected, THE OrderBadge SHALL NOT be displayed for that agent
3. WHEN the order of selected agents changes, THE OrderBadge SHALL update to reflect the new position for all affected agents
4. THE OrderBadge SHALL render as a small circular badge with the position number centered inside

### Requirement 3: Drag-and-Drop Reordering

**User Story:** As a user, I want to drag agents to reorder them, so that I can customize the execution sequence for future workflows.

#### Acceptance Criteria

1. WHEN a user starts dragging a selected agent's drag handle, THE AgentItem SHALL become semi-transparent to indicate it is being dragged
2. WHEN a dragged agent is hovered over another selected agent, THE AgentOrderList SHALL display a visual drop indicator
3. WHEN a user drops a dragged agent on a valid target, THE AgentOrderList SHALL move the source agent to appear immediately before the target agent
4. WHEN a user drops a dragged agent outside the valid drop area, THE AgentOrderList SHALL restore the original order without changes
5. WHEN a drag operation completes (drop or cancel), THE AgentOrderList SHALL clear the visual drag feedback

### Requirement 4: Exclude Judge from Agent Selection

**User Story:** As a user, I want the judge to be automatically excluded from the agent selection list, so that there is no conflict between judge and agent roles.

#### Acceptance Criteria

1. WHEN a judge is selected, THE AgentOrderList SHALL NOT display the judge in the list of selectable agents
2. WHEN the judge changes to an agent that was previously selected, THE AgentOrderList SHALL remove that agent from the selected agents while preserving the order of remaining agents
3. WHEN the judge changes, THE AgentOrderList SHALL reset any active drag operation

### Requirement 5: Persist Agent Order to Storage

**User Story:** As a user, I want my agent order to be saved automatically, so that my preferences persist across sessions.

#### Acceptance Criteria

1. WHEN an agent is selected or deselected, THE System SHALL persist the updated selectedAgentKeys array to CouncilPreferences
2. WHEN agents are reordered via drag-and-drop, THE System SHALL persist the new order to CouncilPreferences immediately
3. WHEN the side panel is reopened, THE AgentOrderList SHALL restore the agent order from the stored CouncilPreferences

### Requirement 6: Prevent Invalid Drag Operations

**User Story:** As a user, I want invalid drag operations to be blocked, so that I cannot create inconsistent state.

#### Acceptance Criteria

1. WHEN an unselected agent's drag handle is interacted with, THE DragHandle SHALL NOT initiate a drag operation
2. WHEN the judge's drag handle is interacted with, THE DragHandle SHALL NOT initiate a drag operation
3. WHEN a user attempts to drag an agent onto itself, THE AgentOrderList SHALL ignore the operation without changes

### Requirement 7: Keyboard Accessibility for Reordering

**User Story:** As a user, I want to reorder agents using keyboard shortcuts, so that I can use the feature without a mouse.

#### Acceptance Criteria

1. WHEN a selected agent's drag handle has focus and the user presses Alt+Up, THE AgentOrderList SHALL move the agent one position earlier in the order
2. WHEN a selected agent's drag handle has focus and the user presses Alt+Down, THE AgentOrderList SHALL move the agent one position later in the order
3. WHEN a selected agent is at the first position and the user presses Alt+Up, THE AgentOrderList SHALL not change the order
4. WHEN a selected agent is at the last position and the user presses Alt+Down, THE AgentOrderList SHALL not change the order

### Requirement 8: No Impact on Council Execution

**User Story:** As a system architect, I want the agent order to not affect Council mode execution, so that backward compatibility is maintained.

#### Acceptance Criteria

1. WHEN a council session is executed, THE System SHALL preserve the order of agentKeys in the RunCouncilRequest
2. WHEN a council session is executed in parallel mode, THE System SHALL run all agents simultaneously regardless of order
3. WHEN a council session is executed in sequential mode, THE System SHALL run agents one at a time but order SHALL NOT affect the execution behavior

