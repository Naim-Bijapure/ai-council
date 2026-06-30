# ai-council-selector-config Specification

## Purpose

Defines the editable JSON selector configuration files that supply app-specific DOM lookup values for all supported adapters.
## Requirements
### Requirement: Selector Config Files For All Supported Apps
The system SHALL store app-specific DOM selector values in editable JSON config files for every supported app.

#### Scenario: ChatGPT selector config exists
- **WHEN** the ChatGPT adapter is built
- **THEN** it reads DOM lookup values from a ChatGPT JSON selector config file

#### Scenario: DeepSeek selector config exists
- **WHEN** the DeepSeek adapter is built
- **THEN** it reads DOM lookup values from a DeepSeek JSON selector config file

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

#### Scenario: Native CSS only
- **WHEN** a selector value is loaded from config
- **THEN** it is valid for native `document.querySelector` and does not use Playwright-style pseudo-selectors such as `:has-text()` or `:has()`

### Requirement: Selector Config Shape
Each selector config file SHALL define ordered selector groups for the DOM interactions needed by automation.

#### Scenario: Required groups are present
- **WHEN** a selector config is loaded
- **THEN** it contains ordered selector arrays for input, send button, response containers, and completion detection

#### Scenario: Optional groups are present
- **WHEN** a selector config is loaded
- **THEN** it can include optional ordered arrays for login detection, blocked state detection, error state detection, and stop-generation controls

#### Scenario: Ordered priority resolution
- **WHEN** the adapter looks up an element for a group
- **THEN** it tries each selector in array order and uses the first one that matches a live element

### Requirement: Selector Config Validation
The system SHALL validate selector config before attempting DOM automation.

#### Scenario: Invalid config is rejected
- **WHEN** a selector config is missing required selector groups or contains empty required selectors
- **THEN** the adapter returns a readable config error

#### Scenario: User updates config
- **WHEN** the user changes selector values in the JSON config and reloads the extension build
- **THEN** the adapter uses the updated selector values without requiring TypeScript code changes

