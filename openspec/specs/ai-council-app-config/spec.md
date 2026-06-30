# ai-council-app-config Specification

## Purpose

Defines the JSON-driven application configuration that determines which LLM apps are supported and how they are used by the UI and orchestration.
## Requirements
### Requirement: JSON App Configuration File
The system SHALL store supported LLM app metadata in an editable JSON configuration file.

#### Scenario: Apps config file exists
- **WHEN** the extension loads
- **THEN** it reads app metadata from `config/apps.json`

#### Scenario: App config shape
- **WHEN** the apps config is loaded
- **THEN** each app entry contains key, displayName, domain, matchPatterns, newChatUrl, automationRoles, and loginUrlPatterns

### Requirement: App Config Validation
The system SHALL validate the app configuration before using it.

#### Scenario: Invalid app config is rejected
- **WHEN** the apps config is missing required fields or contains invalid values
- **THEN** the extension reports a readable config error and does not proceed with automation

#### Scenario: User updates app config
- **WHEN** the user changes app metadata in `config/apps.json` and reloads the extension
- **THEN** the extension uses the updated app metadata without requiring TypeScript code changes

### Requirement: App Config Drives UI And Orchestration
The side panel and orchestrator SHALL use the app configuration to determine which apps to show and run.

#### Scenario: UI shows configured apps
- **WHEN** the side panel loads
- **THEN** agent checkboxes and the judge dropdown are populated from the app configuration

#### Scenario: Orchestrator uses configured apps
- **WHEN** the user starts a council
- **THEN** the orchestrator opens tabs and runs adapters for the apps selected by the user, using metadata from the app configuration

