## ADDED Requirements

### Requirement: Automation Availability Metadata
The app registry SHALL expose whether each supported app has real automation available in the current build.

#### Scenario: ChatGPT marked automation-supported
- **WHEN** the system reads the ChatGPT registry entry
- **THEN** the entry indicates that real agent automation is available

#### Scenario: Other apps marked not yet automated
- **WHEN** the system reads Claude, Gemini, DeepSeek, Qwen, or Kimi registry entries
- **THEN** each entry indicates that real agent automation is not yet available in this build

#### Scenario: Orchestrator chooses runner from registry
- **WHEN** the background orchestrator starts an agent run
- **THEN** it uses the registry automation metadata to choose between real automation and fallback execution
