## MODIFIED Requirements

### Requirement: Multi-Agent Session Storage
The system SHALL persist the selected agent keys, judge key, and captured judge chat URL for each session.

#### Scenario: Session record contains workflow data
- **WHEN** a council session is saved
- **THEN** the record includes id, timestamp, prompt, agents used, judge app, judge chat URL, agent results, status, and duration

#### Scenario: Agent selections are saved
- **WHEN** a session completes
- **THEN** the stored session record includes the list of agent keys that were selected by the user

#### Scenario: Judge key is saved
- **WHEN** a session completes
- **THEN** the stored session record includes the judge app key selected by the user

#### Scenario: Judge URL is saved
- **WHEN** the orchestrator captures a judge conversation permalink
- **THEN** the stored session record includes that URL as `judgeChatUrl`

#### Scenario: Null judge URL is saved
- **WHEN** the orchestrator cannot capture a permalink
- **THEN** the stored session record stores `judgeChatUrl: null` and the session still completes
