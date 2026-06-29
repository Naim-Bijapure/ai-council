## ADDED Requirements

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
