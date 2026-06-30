## MODIFIED Requirements

### Requirement: Multi-Agent Council Workflow
The background orchestrator SHALL run a configurable multi-agent workflow where the user selects which apps run as agents and which app runs as judge.

#### Scenario: Valid multi-agent run starts
- **WHEN** the side panel submits a valid prompt with selected agents and judge
- **THEN** the orchestrator starts a session using the selected agents and judge

#### Scenario: Agents run in parallel
- **WHEN** the session starts
- **THEN** the orchestrator opens tabs for all selected agents concurrently and sends the prompt to each

### Requirement: Agent Then Judge Order
The background orchestrator SHALL complete all agent steps before submitting the judge step.

#### Scenario: At least one agent succeeds
- **WHEN** at least one agent returns response text
- **THEN** the orchestrator builds the judge prompt from all successful agent responses

#### Scenario: All agents fail
- **WHEN** all agents resolve as timeout or error
- **THEN** the orchestrator does not submit a judge prompt and completes with `partial_failure` status

#### Scenario: Judge prompt sent
- **WHEN** the judge content script confirms the judge prompt was sent
- **THEN** the orchestrator proceeds to judge chat URL capture and the minimal handoff state

### Requirement: Judge Chat URL Capture
The background orchestrator SHALL capture the judge conversation permalink using a `chrome.tabs.onUpdated` listener scoped to the judge tab.

#### Scenario: Permalink captured
- **WHEN** the judge tab URL changes away from the new-chat URL pattern within 30 seconds of injection
- **THEN** the orchestrator stores that URL as `judgeChatUrl` and removes the listener

#### Scenario: Permalink not captured
- **WHEN** no URL change is detected within 30 seconds
- **THEN** the orchestrator stores `judgeChatUrl: null`

#### Scenario: Null URL still completes the session
- **WHEN** `judgeChatUrl` is stored as null
- **THEN** the session still completes and its history row is visually dimmed as non-tappable

### Requirement: No Judge Response Capture
The orchestrator SHALL NOT wait for, extract, or store the judge response text.

#### Scenario: Judge response is not captured
- **WHEN** the judge prompt is sent and confirmed
- **THEN** the orchestrator does not wait for generation completion or extract judge response text
