## MODIFIED Requirements

### Requirement: Fixed App Tab Runner
The system SHALL provide reusable background tab runner behavior for any configured app as agent or judge.

#### Scenario: Agent tab runner starts
- **WHEN** the workflow starts the agent step for a selected app
- **THEN** the tab runner opens a new tab for that app's new-chat URL and waits for content-script readiness

#### Scenario: Judge tab runner starts
- **WHEN** the workflow starts the judge step
- **THEN** the tab runner opens a new tab for the judge app's new-chat URL and waits for content-script readiness

### Requirement: Content Script Readiness Handshake
The tab runner SHALL verify content-script readiness via a CONTENT_READY handshake before sending automation commands.

#### Scenario: Content script becomes ready
- **WHEN** the opened chat tab loads and the matching content script sends CONTENT_READY
- **THEN** the runner sends the next automation command for that app

#### Scenario: Content script readiness times out
- **WHEN** CONTENT_READY is not received within 10 seconds
- **THEN** the active step resolves as `error` with reason `content_script_timeout`

### Requirement: Automation Timeouts
The tab runner SHALL enforce bounded timeouts for tab load, prompt send, response wait, and URL capture.

#### Scenario: Tab load timeout
- **WHEN** the chat tab does not reach load complete within 15 seconds
- **THEN** the active step resolves as `error` with reason `tab_load_timeout`

#### Scenario: Send button enable timeout
- **WHEN** the send control does not become enabled within 3 seconds of injection
- **THEN** the active step resolves as `error` with reason `send_button_disabled`

#### Scenario: Response wait timeout
- **WHEN** an agent does not produce a final response before the 45-second timeout
- **THEN** the agent step resolves as `timeout` with any partial text

#### Scenario: URL capture timeout
- **WHEN** the judge tab URL does not change within 30 seconds
- **THEN** the runner falls back to a final URL read and stores null if unchanged

### Requirement: Automation Result Normalization
The tab runner SHALL normalize content-script outcomes into the session model for any app.

#### Scenario: Agent response extracted
- **WHEN** an agent content script returns final response text
- **THEN** the agent result is marked `done` with the extracted response text and a completion timestamp

#### Scenario: Judge prompt sent
- **WHEN** the judge content script confirms the judge prompt was sent
- **THEN** the session marks the judge step as sent and proceeds to URL capture

#### Scenario: Adapter error returned
- **WHEN** a content script returns an adapter error reason
- **THEN** the active step is marked `error` with that reason
