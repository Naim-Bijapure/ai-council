## ADDED Requirements

### Requirement: Fixed Flow Input State
The side panel SHALL present this phase as a fixed ChatGPT-agent and DeepSeek-judge workflow.

#### Scenario: Fixed apps are visible
- **WHEN** the Council tab is displayed
- **THEN** it shows ChatGPT as the agent and DeepSeek as the judge

#### Scenario: App selectors are hidden for fixed phase
- **WHEN** the fixed-flow phase is active
- **THEN** the side panel does not require the user to choose agent apps or judge apps

### Requirement: Fixed Flow Running State
The side panel SHALL show progress for both the ChatGPT agent step and the DeepSeek judge step.

#### Scenario: ChatGPT status shown
- **WHEN** the ChatGPT agent step changes status
- **THEN** the side panel updates the ChatGPT status display

#### Scenario: DeepSeek status shown
- **WHEN** the DeepSeek judge step changes status
- **THEN** the side panel updates the DeepSeek status display

### Requirement: Minimal Judge Handoff State
The side panel SHALL show a minimal judge handoff state once the DeepSeek judge prompt is sent and confirmed, without displaying the judge response.

#### Scenario: Judge handoff shown
- **WHEN** the background reports the DeepSeek judge prompt as sent
- **THEN** the side panel shows "Judge is running in DeepSeek" with a "Switch to judge tab" button and a "New question" button

#### Scenario: Switch to judge tab
- **WHEN** the user clicks "Switch to judge tab"
- **THEN** the side panel activates the DeepSeek judge tab via `chrome.tabs.update`

#### Scenario: New question resets the panel
- **WHEN** the user clicks "New question"
- **THEN** the side panel resets to the fixed-flow input state

#### Scenario: Judge response is not displayed
- **WHEN** the minimal judge handoff state is shown
- **THEN** the side panel does not attempt to capture or display the DeepSeek judge response

### Requirement: Automation Errors Display
The side panel SHALL display ChatGPT and DeepSeek automation failure reasons using readable status text.

#### Scenario: ChatGPT automation error shown
- **WHEN** the background reports ChatGPT as `error` with an automation error reason
- **THEN** the side panel shows a readable ChatGPT error status

#### Scenario: DeepSeek automation error shown
- **WHEN** the background reports DeepSeek judge execution as `error` with an automation error reason
- **THEN** the side panel shows a readable DeepSeek error status
