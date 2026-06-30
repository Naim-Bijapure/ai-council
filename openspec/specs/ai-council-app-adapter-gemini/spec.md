# ai-council-app-adapter-gemini Specification

## Purpose

Defines the Gemini-specific content script and agent adapter behavior for AI Council automation.
## Requirements
### Requirement: Gemini Content Script Registration
The extension SHALL register a content script for Gemini pages through the WXT entrypoint structure.

#### Scenario: Gemini content script is included in build output
- **WHEN** a developer runs the Chrome build
- **THEN** the generated extension output includes a content script entry that matches `https://gemini.google.com/*`

### Requirement: Gemini Agent Adapter
The Gemini content script SHALL support agent-mode automation using Gemini-specific selector config.

#### Scenario: Gemini agent run
- **WHEN** the background sends an AGENT_RUN command to the Gemini content script
- **THEN** the adapter injects the prompt, sends it, waits for response completion, and extracts the response text

#### Scenario: Gemini judge run
- **WHEN** the background sends a JUDGE_RUN command to the Gemini content script
- **THEN** the adapter injects the judge prompt, sends it, and confirms the message was sent without extracting a response

