## ADDED Requirements

### Requirement: ChatGPT Host Access
The extension SHALL declare only the ChatGPT host permissions required for the first real automation round.

#### Scenario: ChatGPT hosts are permitted
- **WHEN** the Chrome-targeted manifest is generated
- **THEN** the manifest includes host access for `https://chat.openai.com/*` and `https://chatgpt.com/*`

#### Scenario: Non-ChatGPT hosts remain unpermitted
- **WHEN** the Chrome-targeted manifest is generated for this change
- **THEN** it does not add host permissions for Claude, Gemini, DeepSeek, Qwen, or Kimi

### Requirement: ChatGPT Content Script Registration
The extension SHALL register a content script for ChatGPT pages through the WXT entrypoint structure.

#### Scenario: ChatGPT content script is included in build output
- **WHEN** a developer runs the Chrome build
- **THEN** the generated extension output includes a content script entry that matches the ChatGPT host patterns

#### Scenario: Non-ChatGPT pages are not matched
- **WHEN** the generated content script configuration is inspected
- **THEN** it does not match unrelated websites or unsupported chat apps
