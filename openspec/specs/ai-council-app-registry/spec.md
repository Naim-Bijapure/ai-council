# ai-council-app-registry Specification

## Purpose

Defines the supported AI app registry used by the side panel and orchestration layers.

## Requirements

### Requirement: Supported App Registry
The system SHALL define a shared registry of supported AI Council apps with stable app keys, display names, domains, and new-chat URLs.

#### Scenario: Registry exposes all supported apps
- **WHEN** the side panel or background requests the supported app list
- **THEN** the registry returns ChatGPT, Claude, Gemini, DeepSeek, Qwen, and Kimi

#### Scenario: Registry entries include routing data
- **WHEN** an app entry is read from the registry
- **THEN** it includes an app key, display name, domain match information, and a new-chat URL

### Requirement: Agent And Judge Options
The system SHALL use the same supported app registry for agent selection and judge selection.

#### Scenario: Same app can be selected as agent and judge
- **WHEN** the user selects an app as both an agent and the judge
- **THEN** the selection is accepted by validation

#### Scenario: UI labels come from registry
- **WHEN** the side panel renders agent checkboxes and judge options
- **THEN** visible app names match the shared registry display names

### Requirement: Future Adapter Boundary
The system SHALL keep app-specific automation details separate from core app identity metadata.

#### Scenario: Registry does not require selectors in Round 1
- **WHEN** the first foundation round is implemented
- **THEN** the registry can be used without CSS selectors or DOM automation code

### Requirement: Fixed Automation Role Metadata
The app registry SHALL expose which apps are supported for the fixed automation roles in this phase.

#### Scenario: ChatGPT marked as only automated agent
- **WHEN** the system reads the ChatGPT registry entry
- **THEN** the entry indicates that ChatGPT is available as the automated agent for this phase

#### Scenario: DeepSeek marked as only automated judge
- **WHEN** the system reads the DeepSeek registry entry
- **THEN** the entry indicates that DeepSeek is available as the automated judge for this phase

#### Scenario: Other apps not enabled for this phase
- **WHEN** the system reads Claude, Gemini, Qwen, or Kimi registry entries
- **THEN** each entry indicates that it is not enabled for fixed-flow automation in this phase

#### Scenario: Orchestrator uses fixed role metadata
- **WHEN** the background orchestrator starts a fixed-flow run
- **THEN** it uses ChatGPT for the agent role and DeepSeek for the judge role
