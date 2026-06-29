## 1. Fixed Scope And Selector Config

- [ ] 1.1 Add shared automation types for fixed ChatGPT-agent and DeepSeek-judge commands, readiness responses, adapter results, timeouts, and execution modes
- [ ] 1.2 Add selector config TypeScript types for ordered input, send, response, completion, blocked/login, and error selector groups
- [ ] 1.3 Add editable JSON selector config files for ChatGPT and DeepSeek with documented placeholder keys
- [ ] 1.4 Add selector config loading and validation helpers that produce readable errors for missing selector groups
- [ ] 1.5 Update the app registry so ChatGPT is the only automation-supported agent and DeepSeek is the only automation-supported judge for this phase
- [ ] 1.6 Stop for user review so selector JSON shape can be checked before manifest/content-script wiring

## 2. Manifest And Content Script Shells

- [ ] 2.1 Add ChatGPT host permissions for `https://chat.openai.com/*` and `https://chatgpt.com/*`
- [ ] 2.2 Add DeepSeek host permissions for `https://chat.deepseek.com/*`
- [ ] 2.3 Add WXT content-script entrypoints for ChatGPT and DeepSeek with no real DOM submission yet
- [ ] 2.4 Add a typed runtime message bridge between the background service worker and each content script
- [ ] 2.5 Run compile/build and verify the generated manifest contains only ChatGPT and DeepSeek host permissions and content-script match patterns
- [ ] 2.6 Stop for user review before adding readiness behavior

## 3. Readiness And Diagnostics

- [ ] 3.1 Implement ChatGPT readiness detection using `chatgpt.json` selector config
- [ ] 3.2 Implement DeepSeek readiness detection using `deepseek.json` selector config
- [ ] 3.3 Return clear readiness failures for missing config, missing input, likely login state, unexpected DOM state, and timeout
- [ ] 3.4 Add background diagnostic helpers that can open ChatGPT and DeepSeek and confirm content-script handshakes without submitting prompts
- [ ] 3.5 Run compile/build and manually verify readiness in Brave with logged-in ChatGPT and DeepSeek tabs
- [ ] 3.6 Stop for user review so the user can update selector JSON from actual DOM inspection

## 4. Background Fixed Workflow Runner

- [ ] 4.1 Add a fixed workflow runner that opens ChatGPT, waits for readiness, runs the agent prompt, and captures the ChatGPT response
- [ ] 4.2 Feed the ChatGPT response into the existing judge prompt builder
- [ ] 4.3 Open DeepSeek, wait for readiness, submit the judge prompt, and capture the DeepSeek judge response
- [ ] 4.4 Add bounded timeout handling for tab load, content-script readiness, prompt send, response wait, and extraction for both apps
- [ ] 4.5 Add cancellation cleanup for pending timers, tab listeners, ChatGPT work, DeepSeek work, and unresolved session results
- [ ] 4.6 Broadcast fixed-workflow status updates through the existing `CouncilSnapshot` model
- [ ] 4.7 Stop for user review before real DOM submission/extraction is enabled

## 5. ChatGPT Agent Adapter

- [ ] 5.1 Implement ChatGPT prompt injection using selectors from `chatgpt.json`
- [ ] 5.2 Implement ChatGPT send triggering with disabled-send handling
- [ ] 5.3 Implement ChatGPT response wait logic that detects generation completion or stable final response text
- [ ] 5.4 Implement ChatGPT latest assistant response extraction with empty-response and DOM-error handling
- [ ] 5.5 Normalize ChatGPT success, timeout, and error outcomes into the existing agent result model
- [ ] 5.6 Run compile/build and manually verify ChatGPT can receive a prompt and return extracted response text
- [ ] 5.7 Stop for user review before enabling DeepSeek judge submission

## 6. DeepSeek Judge Adapter

- [ ] 6.1 Implement DeepSeek judge prompt injection using selectors from `deepseek.json`
- [ ] 6.2 Implement DeepSeek send triggering with disabled-send handling
- [ ] 6.3 Implement DeepSeek response wait logic that detects generation completion or stable final response text
- [ ] 6.4 Implement DeepSeek latest judge response extraction with empty-response and DOM-error handling
- [ ] 6.5 Normalize DeepSeek success, timeout, and error outcomes into the session result model
- [ ] 6.6 Run compile/build and manually verify DeepSeek can receive the generated judge prompt and return extracted judge response text
- [ ] 6.7 Stop for user review before UI/history polish

## 7. Side Panel And History

- [ ] 7.1 Simplify the Council tab to show fixed ChatGPT agent and DeepSeek judge instead of multi-agent and judge selectors
- [ ] 7.2 Update running state labels so the user can see ChatGPT agent progress and DeepSeek judge progress separately
- [ ] 7.3 Show the final DeepSeek judge response in the side panel after workflow completion
- [ ] 7.4 Store the DeepSeek judge response and relevant ChatGPT/DeepSeek URLs in IndexedDB history
- [ ] 7.5 Update history rows so fixed-flow sessions can reopen the relevant judge URL and show completion status clearly
- [ ] 7.6 Run manual end-to-end tests for success, cancellation, ChatGPT timeout/error, DeepSeek timeout/error, final judge display, and history rows
- [ ] 7.7 Stop for user approval before considering more agents or judges

## 8. Documentation And Final Verification

- [ ] 8.1 Update README with the fixed ChatGPT-agent to DeepSeek-judge dev/test flow
- [ ] 8.2 Document the selector JSON files, expected selector groups, and how the user can update DOM values
- [ ] 8.3 Document required logged-in state for ChatGPT and DeepSeek and known limitations
- [ ] 8.4 Run TypeScript compile checks
- [ ] 8.5 Run production build
- [ ] 8.6 Inspect generated manifest for MV3, side panel, storage/tabs permissions, ChatGPT/DeepSeek host permissions, and only ChatGPT/DeepSeek content scripts
- [ ] 8.7 Run Brave/Chrome manual verification and record selector issues discovered during testing
