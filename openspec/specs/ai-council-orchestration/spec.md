# ai-council-orchestration Specification

## Purpose

Defines the background orchestration behavior for AI Council sessions.

## Requirements

### Requirement: Run Request Validation
The background orchestrator SHALL validate every council run request before creating a session.

#### Scenario: Empty prompt rejected
- **WHEN** the side panel submits an empty or whitespace-only prompt
- **THEN** the orchestrator rejects the request with `Please enter a prompt`

#### Scenario: Missing agents rejected
- **WHEN** the side panel submits no selected agents
- **THEN** the orchestrator rejects the request with `Select at least one agent`

#### Scenario: Long prompt rejected
- **WHEN** the side panel submits a prompt longer than 10000 characters
- **THEN** the orchestrator rejects the request with `Prompt is too long (max 10,000 characters)`

#### Scenario: Same app as agent and judge accepted
- **WHEN** the selected judge app is also in the selected agents list
- **THEN** the orchestrator accepts the request

### Requirement: Single Active Session
The background orchestrator SHALL allow only one active council session at a time.

#### Scenario: Second run blocked while active
- **WHEN** a council session is already running
- **THEN** another run request is rejected until the active session is resolved or cancelled

### Requirement: Demo Agent Execution
The first implementation round SHALL simulate agent execution through the normal orchestration status model without automating external chat apps.

#### Scenario: Demo run emits live status updates
- **WHEN** a valid council run starts
- **THEN** each selected agent moves through observable statuses including `injecting`, `waiting`, and a resolved status

#### Scenario: Demo run produces response previews
- **WHEN** a demo agent resolves with `done`
- **THEN** the orchestrator includes response text that the side panel can preview and store

### Requirement: Judge Prompt Builder
The orchestrator SHALL build a structured judge prompt from the original user prompt and resolved agent results.

#### Scenario: Done agent response included
- **WHEN** an agent result has status `done`
- **THEN** the judge prompt includes that agent name and response text

#### Scenario: Timeout result included as unavailable
- **WHEN** an agent result has status `timeout`
- **THEN** the judge prompt states that the agent timed out

#### Scenario: Error result included as unavailable
- **WHEN** an agent result has status `error`
- **THEN** the judge prompt states that the agent encountered the recorded error reason

#### Scenario: All agents failed skips judge handoff
- **WHEN** every selected agent resolves as `timeout` or `error`
- **THEN** the orchestrator completes the session as `partial_failure` without judge handoff

### Requirement: Cancellation
The background orchestrator SHALL support cancellation of an active session.

#### Scenario: Cancel active session
- **WHEN** the side panel sends a cancel request during execution
- **THEN** the orchestrator stops demo execution, saves a cancelled session record, and clears the active session

### Requirement: State Broadcasts
The background orchestrator SHALL broadcast active session changes to the side panel.

#### Scenario: Side panel receives current state
- **WHEN** the side panel connects or asks for current state
- **THEN** the background returns the active session snapshot or an idle state

### Requirement: Fixed ChatGPT To DeepSeek Workflow
The background orchestrator SHALL run a fixed automation workflow with ChatGPT as the only agent and DeepSeek as the only judge.

#### Scenario: Valid fixed-flow run starts
- **WHEN** the side panel submits a valid prompt for the fixed-flow run
- **THEN** the orchestrator starts a session using ChatGPT as the agent and DeepSeek as the judge

#### Scenario: App selections are not required
- **WHEN** the fixed-flow side panel starts a run
- **THEN** the orchestrator does not require user-selected agent or judge app lists

### Requirement: ChatGPT Agent Then DeepSeek Judge Order
The background orchestrator SHALL complete the ChatGPT agent step before submitting the DeepSeek judge step.

#### Scenario: ChatGPT response succeeds
- **WHEN** ChatGPT automation returns response text
- **THEN** the orchestrator builds the judge prompt from the original user prompt and ChatGPT response

#### Scenario: ChatGPT response fails
- **WHEN** ChatGPT automation resolves as timeout or error
- **THEN** the orchestrator does not submit a DeepSeek judge prompt and completes the session with the recorded ChatGPT failure

#### Scenario: DeepSeek judge prompt sent
- **WHEN** DeepSeek automation confirms the judge prompt was sent
- **THEN** the orchestrator proceeds to judge chat URL capture and the minimal handoff state

### Requirement: Judge Chat URL Capture
The background orchestrator SHALL capture the DeepSeek conversation permalink using a `chrome.tabs.onUpdated` listener scoped to the judge tab.

#### Scenario: Permalink captured
- **WHEN** the judge tab URL changes away from the new-chat URL pattern within 30 seconds of injection
- **THEN** the orchestrator stores that URL as `judgeChatUrl` and removes the listener

#### Scenario: Permalink fallback read
- **WHEN** no URL change is detected within 30 seconds
- **THEN** the orchestrator reads the current judge tab URL one final time and stores it if it has changed, otherwise stores `judgeChatUrl: null`

#### Scenario: Null URL still completes the session
- **WHEN** `judgeChatUrl` is stored as null
- **THEN** the session still completes and its history row is visually dimmed as non-tappable

### Requirement: No Judge Response Capture
The orchestrator SHALL NOT wait for, extract, or store the DeepSeek judge response text.

#### Scenario: Judge response is not captured
- **WHEN** DeepSeek confirms the judge prompt was sent
- **THEN** the orchestrator does not wait for generation completion, does not extract judge response text, and does not store judge response text

### Requirement: Fixed Workflow Status Broadcasts
The background orchestrator SHALL broadcast ChatGPT agent and DeepSeek judge status changes through the side-panel snapshot model.

#### Scenario: ChatGPT progresses
- **WHEN** ChatGPT moves through readiness, injection, waiting, and completion
- **THEN** the side panel receives updated snapshots for the agent step

#### Scenario: DeepSeek progresses
- **WHEN** DeepSeek moves through readiness, injection, and send confirmation
- **THEN** the side panel receives updated snapshots for the judge step

#### Scenario: Fixed workflow fails
- **WHEN** ChatGPT or DeepSeek automation fails with a known error reason
- **THEN** the side panel receives an updated snapshot showing the failure without crashing the extension
