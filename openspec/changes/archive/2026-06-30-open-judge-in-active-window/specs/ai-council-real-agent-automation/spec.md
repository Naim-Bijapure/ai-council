## MODIFIED Requirements

### Requirement: Fixed App Tab Runner
The system SHALL provide reusable background tab runner behavior for any configured app as agent or judge.

#### Scenario: Agent tab runner starts
- **WHEN** the workflow starts the agent step for a selected app
- **THEN** the tab runner opens a new tab for that app's new-chat URL and waits for content-script readiness

#### Scenario: Judge tab runner starts in active window
- **WHEN** the workflow starts the judge step
- **THEN** the tab runner opens the judge app's new-chat URL in the active window (reusing the current tab if it matches the judge app, otherwise opening a new tab in that window) and waits for content-script readiness
