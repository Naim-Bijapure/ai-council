# ai-council-real-agent-automation Specification

## Purpose

Defines the reusable background tab runner behavior that drives real ChatGPT and DeepSeek automation steps for the fixed council workflow, including readiness handshake, timeouts, cancellation, and result normalization.

## Requirements

### Requirement: Fixed App Tab Runner
The system SHALL provide reusable background tab runner behavior for the fixed ChatGPT and DeepSeek automation steps.

#### Scenario: ChatGPT tab runner starts
- **WHEN** the fixed workflow starts the agent step
- **THEN** the tab runner opens a new ChatGPT chat tab (not reused) and waits for ChatGPT content-script readiness

#### Scenario: DeepSeek tab runner starts
- **WHEN** the fixed workflow starts the judge step
- **THEN** the tab runner opens a new DeepSeek chat tab (not reused) and waits for DeepSeek content-script readiness

### Requirement: Content Script Readiness Handshake
The tab runner SHALL verify content-script readiness via a CONTENT_READY handshake before sending automation commands.

#### Scenario: Content script becomes ready
- **WHEN** the opened chat tab loads and the matching content script sends CONTENT_READY
- **THEN** the runner sends the next automation command for that app

#### Scenario: Content script readiness times out
- **WHEN** CONTENT_READY is not received within 10 seconds of the tab reaching load complete
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
- **WHEN** ChatGPT does not produce a final response before the 45-second response timeout
- **THEN** the agent step resolves as `timeout` with any partial text

#### Scenario: URL capture timeout
- **WHEN** the DeepSeek tab URL does not change within 30 seconds
- **THEN** the runner falls back to a final URL read and stores null if unchanged

### Requirement: Fixed Workflow Cancellation
The tab runner SHALL stop pending automation work when the user cancels the active council session.

#### Scenario: User cancels during ChatGPT automation
- **WHEN** the side panel sends `CANCEL_COUNCIL` during the ChatGPT agent step
- **THEN** pending ChatGPT timers and listeners are cleaned up, the judge tab is closed if opened, and the session is marked cancelled

#### Scenario: User cancels during DeepSeek automation
- **WHEN** the side panel sends `CANCEL_COUNCIL` during the DeepSeek judge step
- **THEN** pending DeepSeek timers and listeners are cleaned up and the session is marked cancelled

### Requirement: Automation Result Normalization
The tab runner SHALL normalize content-script outcomes into the session model.

#### Scenario: ChatGPT response extracted
- **WHEN** the ChatGPT content script returns final response text
- **THEN** the ChatGPT agent result is marked `done` with the extracted response text and a completion timestamp

#### Scenario: DeepSeek judge prompt sent
- **WHEN** the DeepSeek content script confirms the judge prompt was sent
- **THEN** the session marks the judge step as sent and proceeds to URL capture without storing judge response text

#### Scenario: Adapter error returned
- **WHEN** a content script returns an adapter error reason
- **THEN** the active step is marked `error` with that reason