## ADDED Requirements

### Requirement: Claude Content Script Registration
The extension SHALL register a content script for Claude.ai pages through the WXT entrypoint structure.

#### Scenario: Claude content script is included in build output
- **WHEN** a developer runs the Chrome build
- **THEN** the generated extension output includes a content script entry that matches `https://claude.ai/*`

### Requirement: Claude Agent Adapter
The Claude content script SHALL support agent-mode automation using Claude-specific selector config.

#### Scenario: Claude agent run
- **WHEN** the background sends an AGENT_RUN command to the Claude content script
- **THEN** the adapter injects the prompt, sends it, waits for response completion, and extracts the response text

#### Scenario: Claude judge run
- **WHEN** the background sends a JUDGE_RUN command to the Claude content script
- **THEN** the adapter injects the judge prompt, sends it, and confirms the message was sent without extracting a response
