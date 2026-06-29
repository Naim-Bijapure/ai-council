## ADDED Requirements

### Requirement: Qwen Content Script Registration
The extension SHALL register a content script for Qwen pages through the WXT entrypoint structure.

#### Scenario: Qwen content script is included in build output
- **WHEN** a developer runs the Chrome build
- **THEN** the generated extension output includes a content script entry that matches `https://chat.qwen.ai/*`

### Requirement: Qwen Agent Adapter
The Qwen content script SHALL support agent-mode automation using Qwen-specific selector config.

#### Scenario: Qwen agent run
- **WHEN** the background sends an AGENT_RUN command to the Qwen content script
- **THEN** the adapter injects the prompt, sends it, waits for response completion, and extracts the response text

#### Scenario: Qwen judge run
- **WHEN** the background sends a JUDGE_RUN command to the Qwen content script
- **THEN** the adapter injects the judge prompt, sends it, and confirms the message was sent without extracting a response
