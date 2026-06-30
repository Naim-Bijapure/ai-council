## ADDED Requirements

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
