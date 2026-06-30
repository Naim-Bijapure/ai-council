## Context

After the `open-judge-in-active-window` change, two regressions appeared:

1. **Agent timeouts**: Agent tabs were changed to `active: false` to avoid stealing focus. Chrome aggressively throttles inactive tabs — `element.focus()` fails, `document.execCommand("insertText")` can't work without focus, `requestAnimationFrame` is paused, and timers are throttled to 1-second minimums. As a result, agent apps receive the prompt but never generate a response, causing a 45-second timeout.

2. **Judge URL not captured**: `captureJudgeUrl` attaches its `tabs.onUpdated` listener *after* `sendJudgeRun` resolves (i.e., after the prompt is sent). SPAs like ChatGPT change the URL via `history.pushState` immediately on send. If the URL change fires before the listener is attached, the event is missed and the URL is stored as null.

## Goals / Non-Goals

**Goals:**
- Agent tabs must be "active" enough for `focus()`, `execCommand`, and DOM rendering to work, without stealing focus from the user's current window.
- Judge URL capture must not miss SPA URL changes that happen immediately on prompt send.

**Non-Goals:**
- Changing the judge tab opening logic (already fixed in the prior change).
- Changing agent timeout values.
- Adding new UI elements.

## Decisions

### 1. Open each agent in a separate unfocused window

- **Decision**: Use `browser.windows.create({ url, focused: false })` for each agent instead of `browser.tabs.create({ url, active: false })`.
- **Rationale**: The active tab in a non-focused window is not subject to Chrome's background-tab throttling. `focus()` and `execCommand` work because the tab is the active tab in its window. The window's `focused: false` flag ensures the user's current window stays focused.
- **Alternative considered**: Open agent tabs as `active: true` in the current window and immediately switch back to the user's tab. Rejected because the tab would go to background after switching back and get throttled again.
- **Alternative considered**: Open all agents in a single unfocused window. Rejected because only one tab can be active per window — the rest would still be background tabs and get throttled.

### 2. Start URL capture listener before sending the judge prompt

- **Decision**: Restructure the judge step to attach the `tabs.onUpdated` listener *before* calling `sendJudgeRun`, then await the URL capture result after the prompt is confirmed sent.
- **Rationale**: If the listener is already attached when the SPA changes the URL, the event is captured regardless of timing.
- **Alternative considered**: Poll `browser.tabs.get(tabId)` every 500ms after sending. Rejected because polling is less efficient and might still miss a quick URL change between polls.

### 3. Read current URL at listener attach time for race safety

- **Decision**: When attaching the listener, also read the current tab URL. If it has already changed from the new-chat URL, resolve immediately without waiting for an `onUpdated` event.
- **Rationale**: Covers the edge case where the URL changed between the `sendJudgeRun` call and the listener attach.

## Risks / Trade-offs

- **[Risk] Multiple agent windows appear in the user's window list** → *Mitigation*: Windows are created with `focused: false`, so they don't steal attention. The user can ignore them. They could be minimized automatically in a future enhancement.
- **[Risk] Some Chrome versions may still throttle unfocused windows** → *Mitigation*: The active tab in a non-focused window is treated differently from a background tab. If throttling persists, a fallback could activate the tab briefly before injection.
- **[Risk] `browser.windows.create` may not be available in all contexts** → *Mitigation*: Fall back to `browser.tabs.create({ active: true })` (old behavior) if window creation fails.

## Migration Plan

No migration needed. Existing session history and preferences remain compatible.

## Open Questions

- Should agent windows be automatically closed after the agent responds? (Out of scope — current behavior leaves tabs open. Could be a future enhancement.)
- Should agent windows be created as `type: "popup"` to make them less intrusive? (Out of scope for this fix.)
