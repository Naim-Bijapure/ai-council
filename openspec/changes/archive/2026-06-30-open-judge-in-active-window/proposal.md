## Why

Currently, when a user starts a council run, both agents and the judge open in new browser tabs/windows. This pulls the user away from their current context. The judge step should feel like a continuation of the user's current session: it should open in the same active window where the extension side panel is already attached, so the user can watch the verdict arrive without switching windows.

## What Changes

- Change the judge tab opening strategy in the background orchestrator:
  - Agents still open in new tabs/windows as they do today.
  - The judge app opens in the **active window** (the window that hosts the side panel's current tab).
  - If the active tab is already on the judge app's domain, reuse/navigate that tab for the judge prompt.
  - If the active tab is on a different page, open the judge app in a new tab within the same active window.
- Extend the tab runner / orchestration utilities to accept a target window/tab context for the judge step.
- Update session state tracking so `judgeChatUrl` and related fields still reflect the judge tab that was used.
- No breaking changes to the public side-panel API or session storage models.

## Capabilities

### New Capabilities
- *(none)*

### Modified Capabilities
- `ai-council-orchestration`: The background orchestrator SHALL open the judge step in the active window instead of a separate new window.
- `ai-council-real-agent-automation`: The reusable tab runner SHALL support opening a judge tab in the same active window as the side panel, with an option to reuse the current tab if it matches the judge app.

## Impact

- `entrypoints/background.ts` — judge tab creation logic.
- `utils/automation/councilRunner.ts` — judge step invocation and window context handling.
- `utils/automation/diagnostics.ts` / adapter helpers — possibly minor if new helper is needed to resolve active window/tab.
- Side panel UI (`entrypoints/sidepanel/App.tsx`) — no changes expected; the existing "Switch to judge tab" and handoff text remain valid.
