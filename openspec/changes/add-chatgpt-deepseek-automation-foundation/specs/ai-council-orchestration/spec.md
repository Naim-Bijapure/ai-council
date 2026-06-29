## ADDED Requirements

### Requirement: Mixed Real And Demo Agent Execution
The background orchestrator SHALL support a mixed execution model where ChatGPT can run through real automation while non-automated apps remain in the configured fallback path.

#### Scenario: ChatGPT selected as an agent
- **WHEN** a valid council run includes ChatGPT as a selected agent
- **THEN** the orchestrator runs ChatGPT through the real-agent automation path

#### Scenario: Non-automated app selected as an agent
- **WHEN** a valid council run includes an app without real automation support
- **THEN** the orchestrator resolves that app through the configured fallback behavior and does not block the ChatGPT real run

### Requirement: Real Agent Status Broadcasts
The background orchestrator SHALL broadcast real-agent status changes through the existing side-panel snapshot model.

#### Scenario: Real agent progresses
- **WHEN** a real ChatGPT agent moves through readiness, injection, waiting, and completion
- **THEN** the side panel receives updated snapshots using the existing agent status fields

#### Scenario: Real agent fails
- **WHEN** ChatGPT automation fails with a known error reason
- **THEN** the side panel receives an updated snapshot showing the agent error without crashing the session

### Requirement: Judge Prompt From Real Results
The background orchestrator SHALL include successful real-agent responses in the existing judge prompt builder.

#### Scenario: Real ChatGPT response succeeds
- **WHEN** ChatGPT automation returns response text and other selected agents have resolved
- **THEN** the generated judge prompt includes the real ChatGPT response text

#### Scenario: Real ChatGPT response fails
- **WHEN** ChatGPT automation resolves as timeout or error
- **THEN** the generated judge prompt represents ChatGPT as unavailable using the recorded status or error reason
