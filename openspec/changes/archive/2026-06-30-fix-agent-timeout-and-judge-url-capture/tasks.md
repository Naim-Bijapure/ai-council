## 1. Fix Agent Tab Opening (Unfocused Window)

- [x] 1.1 Add a helper in `utils/automation/windowContext.ts` (or `diagnostics.ts`) that opens a tab in a new unfocused window via `browser.windows.create({ url, focused: false })` and returns the tab ID + window ID.
- [x] 1.2 Add a new `openTabInUnfocusedWindow` function (or update `openTabAndListenForReady`) that creates the window, then listens for tab load complete + CONTENT_READY using the same handshake logic as the existing function.
- [x] 1.3 Add a fallback: if `browser.windows.create` fails, fall back to `browser.tabs.create({ url, active: true })` (old behavior) so the agent still runs.
- [x] 1.4 Update `councilRunner.ts` to use the new unfocused-window function for agent tabs instead of `openTabAndListenForReady` with `active: false`.

## 2. Fix Judge URL Capture (Pre-Attach Listener)

- [x] 2.1 Refactor `captureJudgeUrl` in `councilRunner.ts` so the `tabs.onUpdated` listener is attached and an initial URL read is done *before* `sendJudgeRun` is called.
- [x] 2.2 Return a handle object from the pre-attach function so the caller can await the URL result after `sendJudgeRun` resolves, and clean up the listener if cancelled.
- [x] 2.3 Add a race-safety check: read the current tab URL at attach time. If it already differs from the new-chat URL, resolve immediately.
- [x] 2.4 Update the judge step in `runCouncil` to call the pre-attach function before `sendJudgeRun`, then await the URL capture result after send confirmation.

## 3. Verification

- [x] 3.1 Run `npm run compile` and fix any TypeScript errors.
- [x] 3.2 Run `npm run build` and inspect the generated manifest for no regressions.
- [x] 3.3 Manually test: agents open in separate unfocused windows, produce responses (no timeout), judge opens in the active window, and the judge URL is saved in history.
- [x] 3.4 Stop for user review before marking complete.
