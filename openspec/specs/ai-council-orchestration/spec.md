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
The background orchestrator SHALL capture the judge conversation permalink by attaching a `chrome.tabs.onUpdated` listener scoped to the judge tab *before* the judge prompt is sent, so that SPA URL changes are not missed.

#### Scenario: Permalink captured
- **WHEN** the judge tab URL changes away from the new-chat URL pattern within 30 seconds of the listener being attached
- **THEN** the orchestrator stores that URL as `judgeChatUrl` and removes the listener

#### Scenario: URL already changed before listener attached
- **WHEN** the tab URL has already changed from the new-chat URL at the time the listener is attached
- **THEN** the orchestrator reads the current tab URL and stores it as `judgeChatUrl` without waiting for an onUpdated event

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

### Requirement: Judge Opens In Active Window
The background orchestrator SHALL open the judge step in the same browser window that currently hosts the extension side panel, instead of opening it in a separate new window.

#### Scenario: Judge opens in active window
- **WHEN** the orchestrator starts the judge step
- **THEN** it determines the active window of the side panel and opens the judge app there

#### Scenario: Judge reuses current tab if already on judge app
- **WHEN** the active tab in the side panel window is already on the judge app's domain
- **THEN** the orchestrator navigates that tab to the judge new-chat URL instead of opening a new tab

#### Scenario: Judge opens new tab in active window when current tab is not judge app
- **WHEN** the active tab in the side panel window is not on the judge app's domain
- **THEN** the orchestrator opens a new tab for the judge app within the same active window

