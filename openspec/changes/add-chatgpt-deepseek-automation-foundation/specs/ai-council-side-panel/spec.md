## ADDED Requirements

### Requirement: Automation Mode Visibility
The side panel SHALL make the current execution mode understandable when real ChatGPT automation is available alongside demo/fallback execution.

#### Scenario: ChatGPT real automation is visible
- **WHEN** ChatGPT is selected as an agent for a council run
- **THEN** the side panel indicates that ChatGPT can run with real automation

#### Scenario: Non-automated app fallback is visible
- **WHEN** an app without real automation support is selected for a council run
- **THEN** the side panel indicates that the app uses demo or fallback execution in this round

### Requirement: Real Automation Errors Display
The side panel SHALL display real automation failure reasons using the existing agent-card error pattern.

#### Scenario: ChatGPT automation error shown
- **WHEN** the background reports ChatGPT as `error` with an automation error reason
- **THEN** the ChatGPT agent card shows a readable error status

#### Scenario: ChatGPT automation timeout shown
- **WHEN** the background reports ChatGPT as `timeout`
- **THEN** the ChatGPT agent card shows that the agent timed out
