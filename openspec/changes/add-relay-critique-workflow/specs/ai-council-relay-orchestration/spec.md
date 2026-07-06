# ai-council-relay-orchestration Specification (Delta)

## ADDED Requirements

### Requirement: Relay Sequential Chain
The background orchestrator SHALL run relay sessions as an ordered critique chain where each agent step after the first receives the original question and the previous successful revised answer.

#### Scenario: Author answers first
- **WHEN** a relay session starts with ordered agents [A, B, C]
- **THEN** agent A receives only the original user question

#### Scenario: Reviewer refines previous draft
- **WHEN** agent B runs after agent A succeeds
- **THEN** agent B receives the original question and A's revised answer with instructions to critique and revise

#### Scenario: Draft passes through on failure
- **WHEN** a relay step fails, times out, or is skipped
- **THEN** the orchestrator passes the same draft unchanged to the next agent

### Requirement: Relay Judge Handoff
The orchestrator SHALL send a relay-specific judge prompt after the chain when at least one refined draft exists.

#### Scenario: Chain produces a draft
- **WHEN** the relay chain yields a non-empty final draft
- **THEN** the orchestrator builds a relay judge prompt from the chain and sends it to the selected judge

#### Scenario: No draft produced
- **WHEN** the relay chain yields no refined answer (e.g. author failed)
- **THEN** the orchestrator completes with `partial_failure` without judge handoff

### Requirement: Relay Session Persistence
Stored relay sessions SHALL include `councilType: "relay"`, per-step relay metadata, and `relayFinalDraft`.

#### Scenario: Relay session saved
- **WHEN** a relay session completes or fails
- **THEN** the stored record includes council type, agent relay roles, and the final refined draft when available

### Requirement: Relay UI
The side panel SHALL allow users to configure, run, and observe relay sessions.

#### Scenario: Run relay
- **WHEN** the user selects Relay Council, orders agents, selects a judge, and submits
- **THEN** the side panel starts a relay session and shows per-step Author/Reviewer progress

#### Scenario: View relay results
- **WHEN** a relay step completes with critique and revision
- **THEN** the side panel displays critique and revised answer separately when expanded