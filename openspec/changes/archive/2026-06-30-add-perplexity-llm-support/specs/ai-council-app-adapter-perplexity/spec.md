# ai-council-app-adapter-perplexity Specification

## Purpose

Defines the Perplexity-specific content script and agent adapter behavior for AI Council automation.

## ADDED Requirements

### Requirement: Perplexity Content Script Registration
The extension SHALL register a content script for Perplexity pages through the WXT entrypoint structure.

#### Scenario: Perplexity content script is included in build output
- **WHEN** a developer runs the Chrome build
- **THEN** the generated extension output includes a content script entry that matches `https://www.perplexity.ai/*`

### Requirement: Perplexity Agent Adapter
The Perplexity content script SHALL support agent-mode automation using the Perplexity selector config.

#### Scenario: Perplexity agent run
- **WHEN** the background sends an AGENT_RUN command to the Perplexity content script
- **THEN** the adapter injects the prompt, sends it, waits for response completion, and extracts the response text

#### Scenario: Perplexity judge run
- **WHEN** the background sends a JUDGE_RUN command to the Perplexity content script
- **THEN** the adapter injects the judge prompt, sends it, and confirms the message was sent without extracting a response

### Requirement: Perplexity Readiness Detection
The Perplexity content script SHALL support the diagnostic readiness check used by the sidepanel and background orchestrator.

#### Scenario: Perplexity readiness check
- **WHEN** the background sends a DIAGNOSTIC_CHECK command to the Perplexity content script
- **THEN** the adapter reports whether the Perplexity page exposes a usable input and send control

### Requirement: Perplexity Probe Wiring
The Perplexity content script SHALL support the selector probe tool in both static and live modes.

#### Scenario: Perplexity static probe
- **WHEN** the user runs a static probe against Perplexity
- **THEN** the adapter evaluates the current DOM against the Perplexity selector config and reports which groups matched

#### Scenario: Perplexity live probe
- **WHEN** the user runs a live probe against Perplexity
- **THEN** the adapter injects a test prompt, submits it, waits for a response, and reports the extracted response preview
