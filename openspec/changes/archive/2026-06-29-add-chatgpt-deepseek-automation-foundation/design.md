## Context

The current extension has a working WXT, React, TypeScript, and Manifest V3 side-panel foundation. The side panel sends typed messages to `entrypoints/background.ts`, the background owns one active council session, and the first AI Council round uses demo timers to simulate selected agents.

The previous proposal scoped the next phase to ChatGPT real-agent automation while keeping other apps in fallback/demo mode. The scope is now tighter and more concrete: exactly one agent and one judge. ChatGPT will answer the user's original prompt, then DeepSeek will receive a structured judge prompt. The extension confirms the judge prompt was sent and captures the DeepSeek conversation permalink, but it does NOT wait for or extract the DeepSeek judge response — the user reads the verdict directly in the judge tab.

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
            confirm message sent
            capture judge chat URL via tabs.onUpdated (30s, fallback final read)
            (no response wait, no extraction, no storage of judge text)
```

Selector ownership:

```text
config/selectors/chatgpt.json
    input selectors (native CSS, ordered priority)
    send selectors
    response selectors
    completion selectors
    blocked selectors (optional)
    login selectors (optional)

config/selectors/deepseek.json
    input selectors (native CSS, ordered priority)
    send selectors
    response selectors
    completion selectors
    blocked selectors (optional)
    login selectors (optional)
```

The JSON files are intentionally part of the repo so the user can update selector values after inspecting the actual DOM. TypeScript owns behavior and validation; JSON owns site-specific DOM values. All selectors MUST be valid for native `document.querySelector` (no Playwright-style `:has-text()` or `:has()` pseudo-selectors). The adapter tries each selector in an ordered priority array until one matches.

## Goals / Non-Goals

**Goals:**

- Implement only the fixed ChatGPT-agent -> DeepSeek-judge flow.
- Register ChatGPT and DeepSeek content scripts using WXT and narrow host permissions.
- Load adapter selector values from separate JSON files (native CSS, ordered priority arrays) instead of hard-coding DOM selectors in TypeScript.
- Add background tab runners that can open ChatGPT and DeepSeek, wait for content-script readiness, send prompts, receive results, timeout, and cancel.
- Add a ChatGPT adapter that submits the user prompt and extracts the final assistant response.
- Add a DeepSeek adapter that submits the generated judge prompt and confirms the message was sent. No response wait or extraction.
- Capture the DeepSeek judge chat permalink via `chrome.tabs.onUpdated` (30-second timeout, final-URL fallback) and store it as `judgeChatUrl`.
- Simplify the side panel for this phase so the user sees the fixed agent/judge pair clearly, ending in a minimal judge handoff state.
- Persist the original prompt, ChatGPT response, status, duration, captured judge chat URL (or null), and ChatGPT tab URL in local history. No judge response text is stored.
- Keep implementation steps separated so the user can test each phase before continuing.

**Non-Goals:**

- Multiple agents.
- User-selectable judges.
- Real automation for Claude, Gemini, Qwen, or Kimi.
- Capturing, displaying, or storing the DeepSeek judge response. The judge runs naturally in its own tab and the user reads the verdict there.
- A selector editing UI inside the extension.
- Remote selector configuration.
- CAPTCHA solving, login bypassing, or actions that work around site access restrictions.
- Multi-session concurrency.

## Decisions

### Use A Fixed ChatGPT-To-DeepSeek Workflow

The UI and orchestrator should stop pretending this phase supports all app combinations. Fixed scope makes testing easier: one prompt goes to ChatGPT, one judge prompt goes to DeepSeek, the permalink is captured, and the session completes with a minimal handoff.

Alternative considered: keep the previous broad agent/judge selectors and only automate one pair. That keeps the old UI, but it creates confusing behavior when users select unsupported apps.

### Minimal Judge Handoff (No Judge Response Capture)

DeepSeek receives the generated judge prompt automatically and the extension confirms the message was sent and captures the conversation permalink. The extension does NOT wait for, extract, or store the DeepSeek judge response. The panel moves to a minimal handoff state ("Judge is running in DeepSeek" + "Switch to judge tab" + "New question"). This matches the end-goal product spec: the judge adds value as a real tab the user reads, and the extension avoids the cost and fragility of capturing a second LLM response.

Alternative considered: capture and store the DeepSeek judge response. That tests more of the pipeline, but it contradicts the product spec, doubles extraction fragility, and provides no product value since the user reads the verdict in the judge tab anyway.

### Store Selectors In JSON As Native CSS

Adapters will read selector config from JSON files such as `config/selectors/chatgpt.json` and `config/selectors/deepseek.json`. Each file includes ordered selector arrays for input, send button, response containers, completion indicators, and optional blocked/login signals. All selectors MUST be valid for native `document.querySelector` — no Playwright-style `:has-text()` or `:has()` pseudo-selectors. The adapter tries each selector in priority order until one matches, falling back to the next if a selector matches nothing.

Alternative considered: hard-code selectors in adapter TypeScript. That is faster initially, but it makes every DOM tweak a code edit instead of a small data update.

Alternative considered: allow `:has-text()` pseudo-selectors and implement a resolver. That is more expressive, but it adds a custom parser and divergence from real CSS semantics. Native CSS keeps the adapter simple and predictable.

### Keep Adapter Logic Typed And Shared

ChatGPT and DeepSeek need different selector JSON, but they can share content-script helper behavior: query ordered native-CSS selectors, wait for an element, set input text, trigger send, wait for stable response text (ChatGPT only), and return normalized results. DeepSeek stops after send confirmation.

Alternative considered: write two completely separate adapters. That is simple at first but duplicates timeout, send, and error handling.

### Capture Judge URL Via tabs.onUpdated

The service worker registers a `chrome.tabs.onUpdated` listener scoped to the judge tab immediately after injection. When the judge tab's URL changes away from the new-chat URL pattern, that URL is the conversation permalink and is captured. Maximum wait is 30 seconds (apps change the URL only after the first response token). On timeout, fall back to reading the current tab URL one final time; if still unchanged, store `judgeChatUrl: null`.

Alternative considered: poll the tab URL on an interval. `tabs.onUpdated` is event-driven, cheaper, and the correct MV3 pattern.

## Risks / Trade-offs

- ChatGPT or DeepSeek DOM changes can break selectors -> keep selectors in JSON and fail with readable adapter errors.
- User-provided selectors may be incomplete at first -> validate selector config shape and report missing selector groups clearly.
- User may not be logged in -> detect missing inputs or blocked states and return `not_logged_in` or `dom_error` rather than waiting forever.
- DeepSeek may not change its URL after sending (notably slow responses) -> fall back to a final URL read and store null if unchanged; history row is dimmed but the session is still saved.
- Manifest host permissions increase scope -> add only ChatGPT and DeepSeek patterns for this round.
- MV3 service worker can suspend -> keep this first real workflow as one active in-memory session and persist completed records.

## Migration Plan

1. Add selector JSON schema/types and placeholder selector JSON files (native CSS) for ChatGPT and DeepSeek.
2. Add shared automation command/result contracts for agent run and judge send-confirmation.
3. Register ChatGPT and DeepSeek content scripts with narrow host permissions.
4. Add readiness checks that load and validate selector config without submitting prompts.
5. Add the background fixed-flow runner for ChatGPT -> judge prompt -> DeepSeek -> send confirmation -> URL capture.
6. Implement ChatGPT prompt submission and extraction using `chatgpt.json`.
7. Implement DeepSeek judge prompt submission and send confirmation using `deepseek.json`.
8. Simplify side panel controls for the fixed pair and add the minimal judge handoff state.
9. Persist judge chat URL (and ChatGPT tab URL) in history and update documentation.
10. Verify compile/build and manual Brave/Chrome behavior with logged-in ChatGPT and DeepSeek sessions.

Rollback is straightforward: disable the fixed real automation runner and return the side panel to the previous demo behavior, then remove the ChatGPT/DeepSeek content-script registration if needed.

## Open Questions

- Selector JSON lives under `config/selectors/` (repo-relative, bundled into the build). Confirmed: not under `utils/`, since selectors are data, not code.
- Placeholder selector JSON starts with best-effort native-CSS defaults that the user inspects and replaces after real DOM inspection in Phase 3.
- ChatGPT and DeepSeek automation tabs stay open after completion so the user can inspect the ChatGPT answer and read the DeepSeek verdict. The panel offers a "Switch to judge tab" button rather than auto-focusing.
