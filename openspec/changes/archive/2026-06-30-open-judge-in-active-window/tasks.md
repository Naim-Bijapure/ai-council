## 1. Window Context Helpers

- [x] 1.1 Add a helper in `utils/automation/windowContext.ts` (or similar) that resolves the active Chrome window via `browser.windows.getLastFocused()` with a fallback to `browser.windows.getCurrent()`.
- [x] 1.2 Add a helper that returns the active tab of a given window and checks whether its URL hostname matches a given app key's domain.
- [x] 1.3 Add unit-style sanity checks (compile-only) that the helpers handle undefined/null window results gracefully.

## 2. Tab Runner Update

- [x] 2.1 Update `utils/automation/councilRunner.ts` (or the reusable tab runner) to accept an optional `targetWindowId` for the judge step.
- [x] 2.2 Implement judge tab creation logic: if active tab matches judge app domain, call `browser.tabs.update(activeTabId, { url: newChatUrl })`; otherwise call `browser.tabs.create({ windowId: targetWindowId, url: newChatUrl })`.
- [x] 2.3 Ensure the judge tab ID returned to the caller is correct whether the tab was created or updated.
- [x] 2.4 Add a fallback path so that if resolving the active window fails, the judge tab opens the same way agents do (current behavior).

## 3. Orchestrator Integration

- [x] 3.1 Update the judge-step invocation in `utils/automation/councilRunner.ts` to resolve the active window before opening the judge tab.
- [x] 3.2 Ensure agent steps remain unchanged (still open in new tabs/windows).
- [x] 3.3 Ensure `judgeChatUrl` capture via `chrome.tabs.onUpdated` still works for both reused and newly-created judge tabs.
- [x] 3.4 Verify cancellation cleanup closes/removes the correct judge tab regardless of how it was opened.

## 4. Verification

- [x] 4.1 Run `npm run compile` and fix any TypeScript errors.
- [x] 4.2 Run `npm run build` and inspect the generated manifest for no regressions.
- [x] 4.3 Manually test a council run: confirm agents open in new tabs while the judge opens in the active window, and the "Switch to judge tab" button works.
- [x] 4.4 Stop for user review before marking complete.
