## ADDED Requirements

### Requirement: Kimi Content Script Registration
The extension SHALL register a content script for Kimi pages through the WXT entrypoint structure.

#### Scenario: Kimi content script is included in build output
- **WHEN** a developer runs the Chrome build
- **THEN** the generated extension output includes a content script entry that matches `https://kimi.moonshot.cn/*`

### Requirement: Kimi Agent Adapter
The Kimi content script SHALL support agent-mode automation using Kimi-specific selector config.

#### Scenario: Kimi agent run
- **WHEN** the background sends an AGENT_RUN command to the Kimi content script
- **THEN** the adapter injects the prompt, sends it, waits for response completion, and extracts the response text

#### Scenario: Kimi judge run
- **WHEN** the background sends a JUDGE_RUN command to the Kimi content script
- **THEN** the adapter injects the judge prompt, sends it, and confirms the message was sent without extracting a response
