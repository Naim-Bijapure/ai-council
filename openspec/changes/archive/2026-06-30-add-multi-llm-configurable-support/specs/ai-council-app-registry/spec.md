## MODIFIED Requirements

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
