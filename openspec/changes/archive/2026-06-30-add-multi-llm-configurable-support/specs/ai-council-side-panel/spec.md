## MODIFIED Requirements

### Requirement: Configurable Agent And Judge Selection
The side panel SHALL present agent checkboxes and a judge dropdown populated from the app configuration, replacing the fixed ChatGPT→DeepSeek flow.

#### Scenario: Agent checkboxes shown
- **WHEN** the Council tab is displayed in the idle state
- **THEN** it shows a checkbox for each app configured with agent role support

#### Scenario: Judge dropdown shown
- **WHEN** the Council tab is displayed in the idle state
- **THEN** it shows a dropdown listing each app configured with judge role support

#### Scenario: Submit validation
- **WHEN** the user clicks Run council
- **THEN** the submit is disabled if no prompt is entered, no agent is selected, or no judge is selected

### Requirement: Multi-Agent Running State
The side panel SHALL show per-agent progress cards and a progress bar during execution.

#### Scenario: Agent cards update live
- **WHEN** an agent changes status during execution
- **THEN** the side panel updates that agent's card with the new status and response preview

#### Scenario: Progress bar reflects completion
- **WHEN** agents resolve one by one
- **THEN** the progress bar updates to show completed count over total selected agents

### Requirement: Minimal Judge Handoff State
The side panel SHALL show a minimal judge handoff state once the judge prompt is sent, without displaying the judge response.

#### Scenario: Judge handoff shown
- **WHEN** the background reports the judge prompt as sent
- **THEN** the side panel shows "Judge is running in [Judge App Name]" with a "Switch to judge tab" button and a "New question" button

#### Scenario: Switch to judge tab
- **WHEN** the user clicks "Switch to judge tab"
- **THEN** the side panel activates the judge tab

#### Scenario: New question resets the panel
- **WHEN** the user clicks "New question"
- **THEN** the side panel resets to the configurable input state

#### Scenario: Judge response is not displayed
- **WHEN** the minimal judge handoff state is shown
- **THEN** the side panel does not attempt to capture or display the judge response
