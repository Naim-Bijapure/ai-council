## MODIFIED Requirements

### Requirement: Fixed App Tab Runner
The system SHALL provide reusable background tab runner behavior for any configured app as agent or judge.

#### Scenario: Agent tab runner starts as background tab
- **WHEN** the workflow starts the agent step for a selected app
- **THEN** the tab runner opens a new tab with `active: false` in the current window for that app's new-chat URL, and waits for content-script readiness

#### Scenario: Agent tab is briefly activated for injection
- **WHEN** the agent content script is ready and the runner is about to send the AGENT_RUN command
- **THEN** the tab runner activates the agent tab so that focus-dependent DOM operations (execCommand, click) work without Chrome background-tab throttling, then switches back to the user's original tab after injection

#### Scenario: Judge tab runner starts in active window
- **WHEN** the workflow starts the judge step
- **THEN** the tab runner opens the judge app's new-chat URL in the active window (reusing the current tab if it matches the judge app, otherwise opening a new tab in that window) and waits for content-script readiness

#### Scenario: Agent tab creation fallback
- **WHEN** creating a background tab fails
- **THEN** the tab runner falls back to opening a new tab with `active: true` in the current window
