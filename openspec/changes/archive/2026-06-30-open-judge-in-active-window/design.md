## Context

The AI Council extension currently opens both agent tabs and the judge tab in new browser windows/tabs. While this works for agents that run in parallel off-screen, it is jarring for the judge step because the user expects to see the verdict arrive in the same context where they submitted the question from the side panel.

The side panel is attached to the active Chrome window. When the judge step starts, we know which window the user is currently using, so we can open the judge app there instead of in a detached new window.

## Goals / Non-Goals

**Goals:**
- Open the judge app in the same active window as the side panel.
- Reuse the current tab when it is already on the judge app's domain.
- Open a new tab in the active window when the current tab belongs to a different app or is a blank/new tab.
- Preserve existing agent behavior: agents still open in new tabs/windows and run in parallel.
- Keep `judgeChatUrl` capture and the minimal handoff UX unchanged.

**Non-Goals:**
- Changing agent tab behavior.
- Adding user preferences for judge window placement.
- Changing side-panel UI or session storage models.
- Capturing or displaying the judge response text.

## Decisions

### 1. Determine the active window from the background service worker
- **Decision:** Use `browser.windows.getLastFocused()` (WXT/browser abstraction) to identify the window that currently hosts the side panel.
- **Rationale:** The background service worker does not have a "current tab" concept. The last-focused window is the window the user interacted with most recently, which is the one that contains the side panel after they click the extension action.
- **Alternative considered:** Query all windows and pick the one with the side panel visible — not reliably detectable from the service worker.

### 2. Reuse current tab only when it matches the judge app
- **Decision:** If the active tab's URL hostname matches the judge app's domain, navigate that tab to the judge new-chat URL via `browser.tabs.update(tabId, { url })`. Otherwise, create a new tab in the active window via `browser.tabs.create({ windowId, url })`.
- **Rationale:** Reusing an unrelated tab would destroy the user's current page. Limiting reuse to the judge app's domain avoids data loss while still avoiding an extra tab when the user is already on the judge app.

### 3. Keep judge URL capture listener unchanged
- **Decision:** The `chrome.tabs.onUpdated` listener for capturing the judge permalink remains scoped to the judge tab ID, regardless of whether the tab was created or updated.
- **Rationale:** The capture mechanism is independent of how the tab was opened. Reusing a tab still produces a navigation event away from the new-chat URL that the listener can catch.

## Risks / Trade-offs

- **[Risk] Last-focused window is not the side panel window** → *Mitigation:* Fall back to opening a new tab in a new window (current behavior). Add a helper that attempts `getLastFocused()` and gracefully degrades.
- **[Risk] Navigating the current tab loses the user's context** → *Mitigation:* Only reuse tabs whose hostname matches the judge app domain. All other cases open a new tab in the same window.
- **[Risk] Multiple monitors / virtual desktops** → *Mitigation:* `getLastFocused()` returns the correct Chrome window object even across monitors. The tab is created in that window.

## Migration Plan

No migration needed. Existing session history and preferences remain compatible.

## Open Questions

- Should we expose a user preference later to let users opt into the old "judge in new window" behavior? (Out of scope for this change.)
