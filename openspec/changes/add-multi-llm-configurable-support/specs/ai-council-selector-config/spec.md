## ADDED Requirements

### Requirement: Selector Config Files For All Supported Apps
The system SHALL store app-specific DOM selector values in editable JSON config files for every supported app.

#### Scenario: Claude selector config exists
- **WHEN** the Claude adapter is built
- **THEN** it reads DOM lookup values from a Claude JSON selector config file

#### Scenario: Gemini selector config exists
- **WHEN** the Gemini adapter is built
- **THEN** it reads DOM lookup values from a Gemini JSON selector config file

#### Scenario: Qwen selector config exists
- **WHEN** the Qwen adapter is built
- **THEN** it reads DOM lookup values from a Qwen JSON selector config file

#### Scenario: Kimi selector config exists
- **WHEN** the Kimi adapter is built
- **THEN** it reads DOM lookup values from a Kimi JSON selector config file
