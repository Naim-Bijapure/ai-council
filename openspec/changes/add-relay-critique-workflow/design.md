# Design: Relay-Critique Workflow

## Overview

Relay mode runs selected agents in strict order. Each step after the first receives the original question plus the previous step's revised answer, critiques it, and produces an improved draft. After the chain completes, a dedicated relay judge receives the full chain and final draft.

Council (`agentJudge`) mode is unchanged.

## Orchestration

Reuses the existing single-tab sequential runner in `councilRunner.ts`:

1. Open one tab for agent #1
2. Navigate → inject → capture for each agent in order
3. Navigate to judge → inject relay judge prompt → capture URL

### Draft state machine

```
currentDraft = ""

for each agent i in ordered chain:
  prompt = author prompt (i=0) OR reviewer prompt (question + currentDraft)
  result = run agent

  if success:
    parse critique + revised answer
    currentDraft = revisedAnswerText
  if error/timeout/skipped:
    currentDraft unchanged (draft passes through)

relayFinalDraft = currentDraft

if currentDraft empty → partial_failure, skip judge
else → buildRelayJudgePrompt → judge handoff
```

## Prompts

| Step | Builder | Notes |
|------|---------|-------|
| Author | `buildAuthorPrompt` | Raw user question |
| Reviewer | `buildReviewerPrompt` | Requires `## Critique` + `## Revised answer` sections |
| Judge | `buildRelayJudgePrompt` | Sees chain history + final draft; distinct from council judge |

Reviewer and judge prompts include length trimming when drafts exceed limits.

## Response parsing

`parseRelayResponse` splits reviewer output on section headers. Fallback: entire response becomes the next draft.

## Data model

- `councilType: "agentJudge" | "relay"` on session and run request
- `AgentResult` relay fields: `relayRole`, `inputDraft`, `critiqueText`, `revisedAnswerText`
- `relayFinalDraft` on session for judge input and UI highlight

## UI

- Workflow selector already exists; relay form now mirrors council form with role labels
- Session view shows Author/Reviewer badges, step progress, final draft card
- History rows show Relay vs Council badge

## Non-goals

- No change to council parallel flow
- No multi-branch debate structures
- No configurable reviewer personas (future work)