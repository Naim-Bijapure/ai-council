## MODIFIED Requirements

### Requirement: Supported App Registry
The system SHALL define a shared registry of supported AI Council apps with stable app keys, display names, domains, and new-chat URLs.

#### Scenario: Registry exposes all supported apps
- **WHEN** the side panel or background requests the supported app list
- **THEN** the registry returns ChatGPT, Claude, Gemini, DeepSeek, Qwen, Kimi, and Perplexity

#### Scenario: Registry entries include routing data
- **WHEN** an app entry is read from the registry
- **THEN** it includes an app key, display name, domain match information, and a new-chat URL
