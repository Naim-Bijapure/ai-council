## 1. Fixed Scope And Selector Config

- [x] 1.1 Add shared automation types for fixed ChatGPT-agent and DeepSeek-judge commands, content-script readiness messages, adapter results, send-confirmation results, timeouts, and execution modes
- [x] 1.2 Add selector config TypeScript types for ordered native-CSS input, send, response, completion, and optional blocked/login selector groups
- [x] 1.3 Add editable JSON selector config files for ChatGPT and DeepSeek (native CSS only, ordered priority arrays, best-effort defaults marked for user replacement)
- [x] 1.4 Add selector config loading and validation helpers that produce readable errors for missing selector groups and non-native-CSS values
- [x] 1.5 Update the app registry so ChatGPT is the only automation-supported agent and DeepSeek is the only automation-supported judge for this phase
- [x] 1.6 Stop for user review so selector JSON shape can be checked before manifest/content-script wiring

## 2. Manifest And Content Script Shells

- [x] 2.1 Add ChatGPT host permissions for `https://chat.openai.com/*` and `https://chatgpt.com/*`
- [x] 2.2 Add DeepSeek host permissions for `https://chat.deepseek.com/*`
- [x] 2.3 Add WXT content-script entrypoints for ChatGPT and DeepSeek with no real DOM submission yet
- [x] 2.4 Add a typed runtime message bridge between the background service worker and each content script (AGENT_RUN, JUDGE_RUN, DIAGNOSTIC_CHECK, CANCEL, CONTENT_READY, ADAPTER_RESULT, STATUS_UPDATE, DIAGNOSTIC_RESULT)
- [x] 2.5 Run compile/build and verify the generated manifest contains only ChatGPT and DeepSeek host permissions and content-script match patterns
- [x] 2.6 Stop for user review before adding readiness behavior

## 3. Readiness And Diagnostics

- [x] 3.1 Implement ChatGPT readiness detection using `chatgpt.json` selector config with a 10-second grace period polling the input element every 500ms
- [x] 3.2 Implement DeepSeek readiness detection using `deepseek.json` selector config with the same 10-second grace period polling
- [x] 3.3 Return clear readiness failures for missing config, missing input, likely login state (matched against known login/auth URL patterns), unexpected DOM state, and timeout
- [x] 3.4 Implement the CONTENT_READY handshake: content script sends CONTENT_READY on init; the service worker only sends commands after receiving it, with a 10-second timeout resolving as `content_script_timeout`
- [x] 3.5 Add background diagnostic helpers that can open ChatGPT and DeepSeek and confirm content-script handshakes without submitting prompts
- [x] 3.6 Run compile/build and manually verify readiness in Brave with logged-in ChatGPT and DeepSeek tabs
- [x] 3.7 Stop for user review so the user can update selector JSON from actual DOM inspection

## 4. Background Fixed Workflow Runner

- [x] 4.1 Add a fixed workflow runner that opens ChatGPT and DeepSeek tabs (visible, new-chat URLs, not reused), waits for load (`status: complete`, 15-second tab timeout), and waits for CONTENT_READY for each
- [x] 4.2 Run the ChatGPT agent step: send the user prompt, wait for the ChatGPT response, and capture the extracted response text
- [x] 4.3 Feed the ChatGPT response into the existing judge prompt builder (reuse `buildJudgePrompt`); if ChatGPT failed, skip the judge step and complete the session with the recorded failure
- [x] 4.4 Run the DeepSeek judge step: submit the judge prompt and confirm the message was sent (send button click succeeded AND URL begins to change OR response container appears)
- [x] 4.5 Capture the judge chat URL via a `chrome.tabs.onUpdated` listener scoped to the judge tab (URL change away from new-chat pattern), 30-second timeout with a final-URL fallback read; store null if unchanged
- [x] 4.6 Add bounded timeout handling for tab load (15s), content-script readiness (10s), prompt send (3s for send-button enable), response wait (45s), and URL capture (30s) for both apps
- [x] 4.7 Add cancellation cleanup for pending timers, tab listeners, ChatGPT work, DeepSeek work, and unresolved session results; close the judge tab if opened
- [x] 4.8 Broadcast fixed-workflow status updates through the existing `CouncilSnapshot` model (agent step and judge step shown separately)
- [x] 4.9 Stop for user review before real DOM submission/extraction is enabled

## 5. ChatGPT Agent Adapter

- [x] 5.1 Implement ChatGPT prompt injection using ordered native-CSS input selectors from `chatgpt.json` (try each in priority order; handle contenteditable vs textarea input types)
- [x] 5.2 Implement ChatGPT send triggering with disabled-send handling (poll `disabled`/`aria-disabled` every 100ms up to 3 seconds; error `send_button_disabled` if not enabled)
- [x] 5.3 Implement ChatGPT response wait logic using three-signal detection in priority order: stop-button disappears (poll 500ms), app-specific done indicator, DOM stabilisation fallback (MutationObserver with preconditions: at least one mutation observed AND extracted text >= 10 characters AND no mutations for 2 seconds); 45-second timeout resolves as `timeout` with partial text
- [x] 5.4 Implement ChatGPT latest assistant response extraction: scroll response container to bottom, wait 500ms for re-render, take text of the last assistant response block, strip UI chrome; handle empty-response with `dom_error`
- [x] 5.5 Implement user-interference detection during the wait (new input text not from extension, response container replaced/cleared, tab navigated away) resolving as `error: user_interference`
- [x] 5.6 Normalize ChatGPT success, timeout, and error outcomes into the existing agent result model
- [x] 5.7 Run compile/build and manually verify ChatGPT can receive a prompt and return extracted response text
- [x] 5.8 Stop for user review before enabling DeepSeek judge submission

## 6. DeepSeek Judge Adapter (Minimal Handoff)

- [x] 6.1 Implement DeepSeek judge prompt injection using ordered native-CSS input selectors from `deepseek.json`
- [x] 6.2 Implement DeepSeek send triggering with disabled-send handling (same 3-second enabled poll as ChatGPT; error `send_button_disabled`)
- [x] 6.3 Implement DeepSeek send confirmation only: send button click succeeded AND (the URL begins to change OR the response container appears in the DOM). No response wait, no extraction, no judge text returned
- [x] 6.4 Normalize DeepSeek send-confirmation success and error outcomes into the session result model (status, errorReason; no responseText)
- [x] 6.5 Run compile/build and manually verify DeepSeek can receive the generated judge prompt and the message-sent signal fires
- [x] 6.6 Stop for user review before UI/history polish

## 7. Side Panel And History

- [x] 7.1 Simplify the Council tab to show the fixed ChatGPT agent and DeepSeek judge instead of multi-agent and judge selectors
- [x] 7.2 Update running state labels so the user can see ChatGPT agent progress and DeepSeek judge progress separately
- [x] 7.3 Implement the minimal judge handoff state (State 3): once the judge prompt is sent and confirmed, show "Judge is running in DeepSeek" with a "Switch to judge tab" button (`chrome.tabs.update` active) and a "New question" button that resets to State 1. Do NOT display the judge response
- [x] 7.4 Store the captured `judgeChatUrl` (or null) and the ChatGPT tab URL in the IndexedDB session record. Do NOT add a judge response text field
- [x] 7.5 Update history rows so fixed-flow sessions can reopen the captured judge URL (dimmed and non-tappable when null) and show completion status clearly
- [x] 7.6 Run manual end-to-end tests for success, cancellation, ChatGPT timeout/error, DeepSeek send error, URL-not-captured (dimmed history row), and minimal handoff state
- [x] 7.7 Stop for user approval before considering more agents or judges

## 8. Documentation And Final Verification

- [x] 8.1 Update README with the fixed ChatGPT-agent to DeepSeek-judge dev/test flow and the minimal judge handoff behavior
- [x] 8.2 Document the selector JSON files, expected selector groups, the native-CSS-only constraint, and how the user can update DOM values
- [x] 8.3 Document required logged-in state for ChatGPT and DeepSeek, the 30-second URL capture behavior, and known limitations (no judge response capture, null URL rows)
- [x] 8.4 Run TypeScript compile checks
- [x] 8.5 Run production build
- [x] 8.6 Inspect generated manifest for MV3, side panel, storage/tabs permissions, ChatGPT/DeepSeek host permissions, and only ChatGPT/DeepSeek content scripts
- [x] 8.7 Run Brave/Chrome manual verification and record selector issues discovered during testing
