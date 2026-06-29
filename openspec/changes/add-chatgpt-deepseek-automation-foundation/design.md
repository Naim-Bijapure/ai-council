## Context

The current extension has a working WXT, React, TypeScript, and Manifest V3 side-panel foundation. The side panel sends typed messages to `entrypoints/background.ts`, the background owns one active council session, and the first AI Council round uses demo timers to simulate selected agents.

The previous proposal scoped the next phase to ChatGPT real-agent automation while keeping other apps in fallback/demo mode. The scope is now tighter and more concrete: exactly one agent and one judge. ChatGPT will answer the user's original prompt, then DeepSeek will judge the generated answer from a structured judge prompt.

Target shape for this change:

```text
Side Panel
    |
    v
Background Orchestrator
    |
    +--> ChatGPT Agent Runner
    |       open ChatGPT tab
    |       load chatgpt selectors JSON
    |       submit user prompt
    |       extract agent response
    |
    +--> Judge Prompt Builder
    |
    +--> DeepSeek Judge Runner
            open DeepSeek tab
            load deepseek selectors JSON
            submit judge prompt
            extract judge response
```

Selector ownership:

```text
config/selectors/chatgpt.json
    input selectors
    send selectors
    response selectors
    completion selectors

config/selectors/deepseek.json
    input selectors
    send selectors
    response selectors
    completion selectors
```

The JSON files are intentionally part of the repo so the user can update selector values after inspecting the actual DOM. TypeScript owns behavior and validation; JSON owns site-specific DOM values.

## Goals / Non-Goals

**Goals:**

- Implement only the fixed ChatGPT-agent -> DeepSeek-judge flow.
- Register ChatGPT and DeepSeek content scripts using WXT and narrow host permissions.
- Load adapter selector values from separate JSON files instead of hard-coding DOM selectors in TypeScript.
- Add background tab runners that can open ChatGPT and DeepSeek, wait for content-script readiness, send prompts, receive results, timeout, and cancel.
- Add a ChatGPT adapter that submits the user prompt and extracts the final assistant response.
- Add a DeepSeek adapter that submits the generated judge prompt and extracts the final judge response.
- Simplify the side panel for this phase so the user sees the fixed agent/judge pair clearly.
- Persist the original prompt, ChatGPT response, DeepSeek judge response, status, duration, and relevant URLs in local history.
- Keep implementation steps separated so the user can test each phase before continuing.

**Non-Goals:**

- Multiple agents.
- User-selectable judges.
- Real automation for Claude, Gemini, Qwen, or Kimi.
- A selector editing UI inside the extension.
- Remote selector configuration.
- CAPTCHA solving, login bypassing, or actions that work around site access restrictions.
- Multi-session concurrency.

## Decisions

### Use A Fixed ChatGPT-To-DeepSeek Workflow

The UI and orchestrator should stop pretending this phase supports all app combinations. Fixed scope makes testing easier: one prompt goes to ChatGPT, one judge prompt goes to DeepSeek, then the session completes.

Alternative considered: keep the previous broad agent/judge selectors and only automate one pair. That keeps the old UI, but it creates confusing behavior when users select unsupported apps.

### Store Selectors In JSON

Adapters will read selector config from JSON files such as `config/selectors/chatgpt.json` and `config/selectors/deepseek.json`. Each file should include ordered selector arrays for input, send button, response containers, completion indicators, and optional blocked/login/error signals.

Alternative considered: hard-code selectors in adapter TypeScript. That is faster initially, but it makes every DOM tweak a code edit instead of a small data update.

### Keep Adapter Logic Typed And Shared

ChatGPT and DeepSeek need different selector JSON, but they can share content-script helper behavior: query ordered selectors, wait for an element, set input text, trigger send, wait for stable response text, and return normalized results.

Alternative considered: write two completely separate adapters. That is simple at first but duplicates timeout, extraction, and error handling.

### Automate The Judge In This Phase

DeepSeek should receive the generated judge prompt automatically and return a final judge response to the extension. This turns the phase into a complete fixed workflow rather than stopping at manual judge handoff.

Alternative considered: open DeepSeek with manual handoff only. That avoids a second adapter, but it does not test the full council workflow.

### Use Narrow Host Permissions

The manifest should include ChatGPT and DeepSeek host permissions only. Other supported app host permissions should remain absent until their adapters exist.

Alternative considered: add all future app host permissions now. That is broader than needed and makes permission prompts noisier.

## Risks / Trade-offs

- ChatGPT or DeepSeek DOM changes can break selectors -> keep selectors in JSON and fail with readable adapter errors.
- User-provided selectors may be incomplete at first -> validate selector config shape and report missing selector groups clearly.
- User may not be logged in -> detect missing inputs or blocked states and return `not_logged_in` or `dom_error` rather than waiting forever.
- DeepSeek response extraction may differ from ChatGPT -> share the generic helper but keep app-specific selector files separate.
- Manifest host permissions increase scope -> add only ChatGPT and DeepSeek patterns for this round.
- MV3 service worker can suspend -> keep this first real workflow as one active in-memory session and persist completed records.

## Migration Plan

1. Add selector JSON schema/types and placeholder selector JSON files for ChatGPT and DeepSeek.
2. Add shared automation command/result contracts for agent and judge runs.
3. Register ChatGPT and DeepSeek content scripts with narrow host permissions.
4. Add readiness checks that load and validate selector config without submitting prompts.
5. Add the background fixed-flow runner for ChatGPT -> judge prompt -> DeepSeek.
6. Implement ChatGPT prompt submission and extraction using `chatgpt.json`.
7. Implement DeepSeek judge prompt submission and extraction using `deepseek.json`.
8. Simplify side panel controls for the fixed pair.
9. Persist judge response in history and update documentation.
10. Verify compile/build and manual Brave/Chrome behavior with logged-in ChatGPT and DeepSeek sessions.

Rollback is straightforward: disable the fixed real automation runner and return the side panel to the previous demo behavior, then remove the ChatGPT/DeepSeek content-script registration if needed.

## Open Questions

- Should selector JSON live under `config/selectors/` or closer to content scripts under `utils/automation/selectors/`?
- Should the placeholder selector JSON start mostly empty for the user to fill, or include best-effort defaults that the user can replace?
- Should ChatGPT and DeepSeek automation tabs stay open after completion for inspection, or should the extension focus back to the side panel/result state?
