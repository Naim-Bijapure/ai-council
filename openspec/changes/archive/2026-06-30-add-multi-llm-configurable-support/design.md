## Context

The extension currently hardcodes ChatGPT as the only agent and DeepSeek as the only judge. The product spec defines six supported apps (ChatGPT, Claude, Gemini, DeepSeek, Qwen, Kimi), but only two have content scripts, selector configs, and adapters. The side panel shows a fixed flow with no user selection.

The previous phase proved the automation pattern works: JSON selectors, content-script bridge, shared adapter helpers, tab runner with readiness handshake, and minimal judge handoff. This phase generalizes that pattern to all six apps and restores the multi-agent selection UI.

Current state:
- `utils/appRegistry.ts` has a hardcoded `SUPPORTED_APPS` array with `automationRoles` per app.
- `config/selectors/chatgpt.json` and `deepseek.json` exist with verified selectors.
- `entrypoints/chatgpt.content.ts` and `deepseek.content.ts` exist with working adapters.
- `utils/automation/adapterHelpers.ts` has shared DOM helpers (inject, send, wait, extract).
- `utils/automation/fixedFlowRunner.ts` runs a fixed ChatGPT→DeepSeek pipeline.
- The side panel shows a fixed flow with no agent/judge selection.

## Goals / Non-Goals

**Goals:**
- Add a `config/apps.json` configuration file that lists all supported apps with metadata and automation role support.
- Load app registry from `config/apps.json` instead of a hardcoded TypeScript array.
- Add selector JSON config files for Claude, Gemini, Qwen, and Kimi (placeholder selectors, native CSS, ordered arrays).
- Add content-script entrypoints for Claude, Gemini, Qwen, and Kimi.
- Add host permissions for all supported apps.
- Restore the side panel UI with agent checkboxes and judge dropdown populated from configuration.
- Run multiple selected agents in parallel, collect responses, build judge prompt, send to selected judge.
- Generalize the tab runner and adapters so any configured app can be an agent or judge.
- Keep the minimal judge handoff model (no judge response capture).

**Non-Goals:**
- Remote selector configuration or app configuration.
- A selector editing UI inside the extension.
- Judge response capture or display.
- CAPTCHA solving or login bypassing.
- Multi-session concurrency.
- Per-app adapter-specific optimizations beyond selector config differences.
- Rate limiting or quota management across apps.

## Decisions

### Configuration-Driven App Registry

Load app metadata from `config/apps.json` instead of a hardcoded array in `utils/appRegistry.ts`. The JSON file contains: key, displayName, domain, matchPatterns, newChatUrl, automationRoles (which roles the app supports: agent, judge), and loginUrlPatterns. TypeScript types validate the config at load time.

Alternative considered: keep the hardcoded array and just add more entries. That works but makes adding/removing apps a code change instead of a data change. JSON config aligns with the selector config pattern already established.

### Generic Adapter Pattern

Instead of per-app adapter modules with custom logic, use a single generic adapter that reads from the app's selector JSON config. The ChatGPT and DeepSeek adapters already share helpers (`adapterHelpers.ts`). This phase makes the generic adapter the only adapter — each app's behavior is driven entirely by its selector JSON.

The content script for each app is a thin entrypoint that calls the generic adapter with its app key. The adapter loads the selector config, waits for input, injects, sends, waits for response (agent mode) or confirms send (judge mode), and extracts text.

Alternative considered: keep per-app adapter modules. That duplicates code and makes maintenance harder. The only app-specific logic is selector values, which are already in JSON.

### Parallel Agent Execution

The background orchestrator opens all selected agent tabs in parallel, waits for all to be ready, sends prompts in parallel, and collects responses as they complete. Once all agents resolve (done, timeout, or error), it builds the judge prompt from successful responses and sends it to the selected judge app.

This matches the product spec: "automates sending a single user prompt to multiple LLM chat applications simultaneously."

Alternative considered: sequential agent execution. That's simpler but much slower — running 6 agents sequentially could take 4+ minutes vs ~45 seconds in parallel.

### Judge As Agent Edge Case

If the same app is selected as both an agent and the judge, the orchestrator opens two separate tabs for that app (one for agent, one for judge). This is handled by the tab runner — each tab is a fresh new-chat URL, never reused.

### Placeholder Selectors For New Apps

Claude, Gemini, Qwen, and Kimi selector JSON files start with best-effort placeholder selectors. The user inspects each app's DOM and updates the JSON, same as the ChatGPT/DeepSeek workflow. The adapter fails with readable `dom_error` if selectors don't match, and the user runs diagnostics to verify.

## Risks / Trade-offs

- New app DOMs may differ significantly from ChatGPT/DeepSeek → placeholder selectors will likely fail initially; user must inspect and update each app's JSON. Diagnostics button helps verify readiness.
- Parallel tab opening may trigger rate limits or CAPTCHAs on some apps → adapter detects blocked state and reports `rate_limited`; user can reduce the number of selected agents.
- Some apps may use iframes or shadow DOM that `document.querySelector` can't reach → selectors may need `>>>` piercing or alternative approaches in a future phase.
- Host permissions for all 6 apps increase the install-time permission prompt → expected for this feature scope.
- MV3 service worker may suspend during long multi-agent runs → keep the workflow as one active in-memory session; persist completed records.

## Migration Plan

1. Add `config/apps.json` with all 6 apps' metadata.
2. Update `utils/appRegistry.ts` to load from JSON.
3. Add selector JSON files for Claude, Gemini, Qwen, Kimi.
4. Add content-script entrypoints for the 4 new apps.
5. Create the generic adapter module.
6. Update `wxt.config.ts` with all host permissions.
7. Rewrite the background orchestrator for multi-agent parallel execution.
8. Rewrite the side panel UI with agent checkboxes and judge dropdown.
9. Verify compile/build and manual test each app.
10. Update README and documentation.

Rollback: revert to the fixed ChatGPT→DeepSeek flow by restoring the previous `fixedFlowRunner.ts` and side panel UI. The selector JSON files and content scripts for new apps can remain — they're harmless if not referenced.

## Open Questions

- Should the app configuration support enabling/disabling apps without removing them from JSON? (Tentative: yes, via an `enabled` boolean per app.)
- Should the diagnostics button test all apps at once or let the user pick which to test? (Tentative: test all selected agents + judge.)
- Should there be a maximum number of concurrent agents to avoid overwhelming the browser? (Tentative: no hard cap — the user controls this via checkbox selection.)
