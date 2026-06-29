## ADDED Requirements

### Requirement: Real Agent Runner
The system SHALL provide a reusable background real-agent runner that executes supported chat apps through browser tabs and content-script commands.

#### Scenario: Supported real agent starts through tab runner
- **WHEN** a selected agent has real automation available
- **THEN** the background orchestrator opens or targets that app's chat tab and starts execution through the real-agent runner

#### Scenario: Unsupported real agent is not sent to content script
- **WHEN** a selected agent does not have real automation available in the current build
- **THEN** the background orchestrator SHALL use the configured fallback path instead of sending a real automation command

### Requirement: Content Script Readiness
The real-agent runner SHALL verify content-script readiness before sending an automation command.

#### Scenario: Content script becomes ready
- **WHEN** the opened chat tab loads and the content script responds to a readiness probe
- **THEN** the runner marks the agent status as `injecting` and sends the prompt command

#### Scenario: Content script readiness times out
- **WHEN** the content script does not respond within the configured readiness timeout
- **THEN** the agent result resolves as `error` with reason `content_script_timeout`

### Requirement: Real Agent Timeouts
The real-agent runner SHALL enforce bounded timeouts for tab load, prompt send, response wait, and response extraction.

#### Scenario: Tab load timeout
- **WHEN** the chat tab does not reach a usable loading state within the configured tab timeout
- **THEN** the agent result resolves as `error` with reason `tab_load_timeout`

#### Scenario: Response wait timeout
- **WHEN** the chat app does not produce a final response before the configured response timeout
- **THEN** the agent result resolves as `timeout` and the session continues with other selected agents

### Requirement: Real Agent Cancellation
The real-agent runner SHALL stop pending real-agent work when the user cancels the active council session.

#### Scenario: User cancels during real automation
- **WHEN** the side panel sends `CANCEL_COUNCIL` during a real-agent run
- **THEN** pending automation timers and listeners are cleaned up and unresolved real-agent results are marked as `error` with reason `cancelled`

### Requirement: Real Agent Result Normalization
The real-agent runner SHALL normalize content-script outcomes into the existing `AgentResult` model.

#### Scenario: Real response extracted
- **WHEN** a content script returns final response text
- **THEN** the matching agent result is marked `done` with the extracted response text and a completion timestamp

#### Scenario: Real adapter error returned
- **WHEN** a content script returns an adapter error reason
- **THEN** the matching agent result is marked `error` with that reason and the session continues with other selected agents
