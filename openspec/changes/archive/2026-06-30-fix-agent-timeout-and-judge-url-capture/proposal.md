## Why

Two regressions appeared after the `open-judge-in-active-window` change:
1. Agent tabs now open with `active: false`, causing Chrome to throttle them — `element.focus()` fails, `execCommand("insertText")` can't inject without focus, and the agent apps never produce a response, resulting in timeouts.
2. The judge conversation URL is not captured because `captureJudgeUrl` starts listening for `tabs.onUpdated` *after* the judge prompt is already sent. SPAs like ChatGPT change the URL immediately on send, so the `onUpdated` event fires before the listener is attached, and the URL is missed.

## What Changes

- Agent tabs shall open in a separate unfocused window (`browser.windows.create({ focused: false })`) so each agent is the active tab in its own window. This prevents Chrome's background-tab throttling while keeping the user's current window focused.
- The judge URL capture listener shall be attached *before* the judge prompt is sent, not after, so SPA URL changes are not missed.
- The fallback URL read at timeout shall also check if the URL already changed before the listener was attached (race-condition safety).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `ai-council-real-agent-automation`: Agent tab runner opens each agent in a separate unfocused window instead of a background tab in the current window, to prevent Chrome throttling.
- `ai-council-orchestration`: Judge chat URL capture listener is started before the judge prompt is sent, not after.

## Impact

- `utils/automation/diagnostics.ts` — `openTabAndListenForReady` gains a variant or new function that creates a window instead of a background tab.
- `utils/automation/councilRunner.ts` — agent tab opening logic changes; `captureJudgeUrl` is restructured to attach the listener before `sendJudgeRun`.
- `utils/automation/windowContext.ts` — may gain a helper for creating unfocused windows.
- No UI or storage changes.
- No manifest or permissions changes.
