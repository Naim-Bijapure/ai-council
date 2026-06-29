## ADDED Requirements

### Requirement: Fixed Workflow URL Storage
The system SHALL persist the captured DeepSeek judge chat URL (or null) and the ChatGPT agent tab URL for fixed-flow sessions. The DeepSeek judge response text is never stored.

#### Scenario: Judge URL is saved
- **WHEN** the orchestrator captures a DeepSeek conversation permalink
- **THEN** the stored session record includes that URL as `judgeChatUrl`

#### Scenario: Null judge URL is saved
- **WHEN** the orchestrator cannot capture a DeepSeek permalink within the timeout
- **THEN** the stored session record stores `judgeChatUrl: null` and the session still completes

#### Scenario: ChatGPT URL is saved
- **WHEN** the ChatGPT agent tab URL is available during session completion
- **THEN** the stored session record includes the ChatGPT URL

#### Scenario: Judge failure is saved
- **WHEN** DeepSeek judge send confirmation fails or times out
- **THEN** the stored session record includes the DeepSeek status and error reason without judge response text
