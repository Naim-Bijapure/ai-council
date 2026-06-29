## ADDED Requirements

### Requirement: Parallel Multi-Agent Execution
The background orchestrator SHALL run all user-selected agent apps in parallel, sending the same prompt to each and collecting responses as they complete.

#### Scenario: Multiple agents selected
- **WHEN** the user selects multiple agent apps and submits a prompt
- **THEN** the orchestrator opens a tab for each selected agent and sends the prompt to all of them concurrently

#### Scenario: Agents complete at different times
- **WHEN** some agents finish before others
- **THEN** the orchestrator collects each response as it completes and updates the side panel live

#### Scenario: All agents resolved
- **WHEN** every agent has resolved as done, timeout, or error
- **THEN** the orchestrator proceeds to build the judge prompt from successful responses

### Requirement: Configurable Judge Selection
The orchestrator SHALL send the judge prompt to the user-selected judge app, not a hardcoded app.

#### Scenario: User selects a judge
- **WHEN** the user selects a judge app from the dropdown and starts a council
- **THEN** the orchestrator opens a tab for that judge app and sends the judge prompt to it

#### Scenario: Same app as agent and judge
- **WHEN** the user selects the same app as both an agent and the judge
- **THEN** the orchestrator opens two separate tabs for that app — one for the agent role and one for the judge role

### Requirement: Partial Failure Handling
The orchestrator SHALL proceed with the judge step if at least one agent succeeded, and skip the judge step if all agents failed.

#### Scenario: At least one agent succeeds
- **WHEN** at least one agent returns a successful response
- **THEN** the orchestrator builds the judge prompt from successful responses and sends it to the judge app

#### Scenario: All agents fail
- **WHEN** every agent resolves as timeout or error
- **THEN** the orchestrator does not send a judge prompt and completes the session with `partial_failure` status

### Requirement: Live Multi-Agent Status Broadcasts
The orchestrator SHALL broadcast per-agent status updates to the side panel as each agent progresses.

#### Scenario: Agent status changes
- **WHEN** any agent changes status (injecting, waiting, done, timeout, error)
- **THEN** the side panel receives an updated snapshot showing that agent's new status
