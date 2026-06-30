## MODIFIED Requirements

### Requirement: Judge Chat URL Capture
The background orchestrator SHALL capture the judge conversation permalink by attaching a `chrome.tabs.onUpdated` listener scoped to the judge tab *before* the judge prompt is sent, so that SPA URL changes are not missed.

#### Scenario: Permalink captured
- **WHEN** the judge tab URL changes away from the new-chat URL pattern within 30 seconds of the listener being attached
- **THEN** the orchestrator stores that URL as `judgeChatUrl` and removes the listener

#### Scenario: URL already changed before listener attached
- **WHEN** the tab URL has already changed from the new-chat URL at the time the listener is attached
- **THEN** the orchestrator reads the current tab URL and stores it as `judgeChatUrl` without waiting for an onUpdated event

#### Scenario: Permalink not captured
- **WHEN** no URL change is detected within 30 seconds
- **THEN** the orchestrator stores `judgeChatUrl: null`

#### Scenario: Null URL still completes the session
- **WHEN** `judgeChatUrl` is stored as null
- **THEN** the session still completes and its history row is visually dimmed as non-tappable
