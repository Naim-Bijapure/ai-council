# ai-council-storage Specification

## Purpose

Defines local AI Council preference and session history storage boundaries.
## Requirements
### Requirement: Preference Storage
The system SHALL persist lightweight AI Council preferences in `chrome.storage.sync`.

#### Scenario: Default preferences on first run
- **WHEN** no saved preferences exist
- **THEN** all supported apps are selected as agents and ChatGPT is selected as judge

#### Scenario: Agent preferences persist
- **WHEN** the user changes selected agents
- **THEN** the selected agent keys are saved and restored in later side panel sessions

#### Scenario: Judge preference persists
- **WHEN** the user changes the selected judge
- **THEN** the judge app key is saved and restored in later side panel sessions

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

### Requirement: Clear History
The system SHALL allow all saved session history to be cleared from IndexedDB.

#### Scenario: Confirmed clear deletes sessions
- **WHEN** the user confirms clearing history
- **THEN** all session records are deleted and the History tab shows an empty state

### Requirement: Storage Boundary
The system SHALL not store the judge's final answer text.

#### Scenario: Judge answer is absent from session record
- **WHEN** a session record is saved
- **THEN** it contains the judge chat URL or null but no captured judge response text

