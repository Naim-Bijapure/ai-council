## 1. App Configuration And Registry

- [x] 1.1 Add `config/apps.json` with all 6 supported apps (ChatGPT, Claude, Gemini, DeepSeek, Qwen, Kimi) including key, displayName, domain, matchPatterns, newChatUrl, automationRoles, loginUrlPatterns, and enabled fields
- [x] 1.2 Add TypeScript types for the app configuration file (AppConfig, AppConfigFile)
- [x] 1.3 Add app config loading and validation helpers that produce readable errors for missing fields and invalid values
- [x] 1.4 Update `utils/appRegistry.ts` to load from `config/apps.json` instead of the hardcoded array, with config-driven automation role support
- [x] 1.5 Remove `FIXED_AGENT_KEY` and `FIXED_JUDGE_KEY` constants — app selection is now user-driven
- [x] 1.6 Stop for user review of the app config JSON shape

## 2. Selector Configs For New Apps

- [x] 2.1 Add `config/selectors/claude.json` with placeholder native-CSS selectors (input, send, response, completion, blocked, loginError)
- [x] 2.2 Add `config/selectors/gemini.json` with placeholder native-CSS selectors
- [x] 2.3 Add `config/selectors/qwen.json` with placeholder native-CSS selectors
- [x] 2.4 Add `config/selectors/kimi.json` with placeholder native-CSS selectors
- [x] 2.5 Update the selector config loader to support all 6 apps (not just ChatGPT and DeepSeek)
- [x] 2.6 Stop for user review so selector JSON files can be checked before content-script wiring

## 3. Manifest And Content Scripts For New Apps

- [x] 3.1 Add host permissions for Claude (`https://claude.ai/*`), Gemini (`https://gemini.google.com/*`), Qwen (`https://chat.qwen.ai/*`), and Kimi (`https://kimi.moonshot.cn/*`) to `wxt.config.ts`
- [x] 3.2 Add WXT content-script entrypoints for Claude, Gemini, Qwen, and Kimi using the generic adapter pattern
- [x] 3.3 Create a generic adapter module (`utils/automation/genericAdapter.ts`) that handles both agent and judge modes for any app using its selector config
- [x] 3.4 Update existing ChatGPT and DeepSeek content scripts to use the generic adapter instead of app-specific adapter modules
- [x] 3.5 Run compile/build and verify the generated manifest contains all 6 apps' host permissions and content-script match patterns
- [x] 3.6 Stop for user review before updating the orchestrator

## 4. Background Multi-Agent Orchestrator

- [x] 4.1 Replace `fixedFlowRunner.ts` with a `councilRunner.ts` that accepts a list of agent keys and a judge key from the user's selection
- [x] 4.2 Open all selected agent tabs in parallel, wait for load and CONTENT_READY for each
- [x] 4.3 Send the prompt to all agents in parallel and collect responses as they complete (live status updates to panel)
- [x] 4.4 Once all agents resolve, build the judge prompt from successful responses using the existing `buildJudgePrompt` helper
- [x] 4.5 Open the judge tab, wait for readiness, send the judge prompt, confirm sent, and capture the judge chat URL via `tabs.onUpdated` (30s timeout)
- [x] 4.6 Handle the edge case where the same app is selected as both agent and judge (two separate tabs)
- [x] 4.7 Add cancellation cleanup for all agent tabs, judge tab, timers, and listeners
- [x] 4.8 Broadcast multi-agent status updates through the `CouncilSnapshot` model with per-agent progress
- [x] 4.9 Stop for user review before UI changes

## 5. Side Panel UI Update

- [x] 5.1 Replace the fixed ChatGPT→DeepSeek flow display with agent checkboxes populated from `config/apps.json` (apps with agent role support)
- [x] 5.2 Add a judge dropdown populated from `config/apps.json` (apps with judge role support)
- [x] 5.3 Update the running state to show per-agent progress cards (status, response preview) and a progress bar (completed/total)
- [x] 5.4 Keep the minimal judge handoff state (State 3): "Judge is running in [App Name]" + "Switch to judge tab" + "New question"
- [x] 5.5 Update validation: submit disabled if no prompt, no agents selected, or no judge selected
- [x] 5.6 Save user's agent and judge selections to `chrome.storage.sync` preferences
- [x] 5.7 Stop for user review before final testing

## 6. History And Storage Update

- [x] 6.1 Update session record to store the full list of selected agent keys (not just a single agent)
- [x] 6.2 Update history rows to show agent count and judge app name
- [x] 6.3 Keep dimmed/non-tappable rows for sessions with `judgeChatUrl: null`
- [x] 6.4 Ensure old session records (from the fixed-flow phase) still display correctly with defensive defaults

## 7. Documentation And Final Verification

- [x] 7.1 Update README with the configurable multi-LLM flow, app configuration JSON, and how to add/remove apps
- [x] 7.2 Document all selector JSON files and the process for updating selectors per app
- [x] 7.3 Document required logged-in state for each supported app
- [x] 7.4 Run TypeScript compile checks
- [x] 7.5 Run production build
- [x] 7.6 Inspect generated manifest for MV3, all host permissions, all content scripts, side panel, and storage/tabs permissions
- [x] 7.7 Run manual verification for each supported app with diagnostics and at least one full council run
