## MODIFIED Requirements

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

#### Scenario: Perplexity selector config exists
- **WHEN** the Perplexity adapter is built
- **THEN** it reads DOM lookup values from a Perplexity JSON selector config file at `config/selectors/perplexity.json`

#### Scenario: Native CSS only
- **WHEN** a selector value is loaded from config
- **THEN** it is valid for native `document.querySelector` and does not use Playwright-style pseudo-selectors such as `:has-text()` or `:has()`
