# ai-council-app-registry Specification

## Purpose

Defines the supported AI app registry used by the side panel and orchestration layers.
## Requirements
### Requirement: Supported App Registry
The system SHALL define a shared registry of supported AI Council apps with stable app keys, display names, domains, and new-chat URLs.

#### Scenario: Registry exposes all supported apps
- **WHEN** the side panel or background requests the supported app list
- **THEN** the registry returns ChatGPT, Claude, Gemini, DeepSeek, Qwen, and Kimi

#### Scenario: Registry entries include routing data
- **WHEN** an app entry is read from the registry
- **THEN** it includes an app key, display name, domain match information, and a new-chat URL

### Requirement: Agent And Judge Options
The system SHALL use the same supported app registry for agent selection and judge selection.

#### Scenario: Same app can be selected as agent and judge
- **WHEN** the user selects an app as both an agent and the judge
- **THEN** the selection is accepted by validation

#### Scenario: UI labels come from registry
- **WHEN** the side panel renders agent checkboxes and judge options
- **THEN** visible app names match the shared registry display names

### Requirement: Future Adapter Boundary
The system SHALL keep app-specific automation details separate from core app identity metadata.

#### Scenario: Registry does not require selectors in Round 1
- **WHEN** the first foundation round is implemented
- **THEN** the registry can be used without CSS selectors or DOM automation code

### Requirement: Fixed Automation Role Metadata
The app registry SHALL load app metadata from `config/apps.json` and expose which apps support automation roles based on that configuration.

#### Scenario: ChatGPT marked as automation-supported
- **WHEN** the system reads the ChatGPT registry entry from config
- **THEN** the entry indicates that ChatGPT supports agent and/or judge roles as configured

#### Scenario: All configured apps available
- **WHEN** the system reads the app registry
- **THEN** every app listed in `config/apps.json` with `enabled: true` is available for its configured automation roles

#### Scenario: Orchestrator uses config-driven roles
- **WHEN** the background orchestrator starts a council run
- **THEN** it uses the user-selected agents and judge from the configuration-driven app registry

### Requirement: Config-Driven App Lookup
The app registry SHALL provide lookup functions that read from the loaded JSON configuration.

#### Scenario: Get supported app by key
- **WHEN** the system calls `getSupportedApp` with a valid app key
- **THEN** it returns the app metadata from the loaded configuration

#### Scenario: Unknown app key
- **WHEN** the system calls `getSupportedApp` with an unknown app key
- **THEN** it throws a readable error

