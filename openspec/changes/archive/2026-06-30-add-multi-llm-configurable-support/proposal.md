## Why

The current extension hardcodes ChatGPT as the only agent and DeepSeek as the only judge. The product spec defines six supported LLM apps, but the UI shows no selection — the user cannot choose which agents run or which app judges. To move toward the full AI Council workflow, we need configurable multi-LLM support driven by an internal JSON configuration file, with the side panel UI reflecting whatever apps are configured.

## What Changes

- Add an internal `config/apps.json` configuration file listing all supported LLM apps with their metadata (key, display name, domain, match patterns, new-chat URL, automation role support, login URL patterns).
- Replace the hardcoded `FIXED_AGENT_KEY`/`FIXED_JUDGE_KEY` constants with configuration-driven app selection.
- Update the side panel UI to show agent checkboxes and a judge dropdown populated from `config/apps.json` — the user selects which agents to run and which app judges.
- Add selector JSON config files for Claude, Gemini, Qwen, and Kimi (placeholder selectors, native CSS, ordered arrays — same format as existing ChatGPT/DeepSeek configs).
- Add content-script entrypoints for Claude, Gemini, Qwen, and Kimi with the same adapter pattern as ChatGPT/DeepSeek.
- Add host permissions for all supported apps in the manifest.
- Update the background orchestrator to run multiple selected agents in parallel, collect their responses, build the judge prompt from all successful agent responses, and send it to the selected judge app.
- Each agent adapter reuses the shared adapter helpers (inject, send, wait, extract) with app-specific selector JSON.
- The judge adapter is generic — whichever app is selected as judge uses the same minimal handoff flow (inject, send, confirm, URL capture).
- Remove the "Run diagnostics" button from the main form (move to a settings/diagnostic area or keep as a secondary action).
- **BREAKING**: The fixed ChatGPT→DeepSeek flow is replaced by the configurable multi-agent flow. Old session records without `judgeStep` are handled with defensive defaults.

## Capabilities

### New Capabilities
- `ai-council-multi-agent-orchestration`: Background orchestration for running multiple selected agent apps in parallel, collecting responses, and routing the judge prompt to a user-selected judge app.
- `ai-council-app-adapter-claude`: Claude-specific content-script adapter for prompt submission, response waiting, and response extraction.
- `ai-council-app-adapter-gemini`: Gemini-specific content-script adapter for prompt submission, response waiting, and response extraction.
- `ai-council-app-adapter-qwen`: Qwen-specific content-script adapter for prompt submission, response waiting, and response extraction.
- `ai-council-app-adapter-kimi`: Kimi-specific content-script adapter for prompt submission, response waiting, and response extraction.
- `ai-council-app-config`: JSON-backed app configuration file listing all supported LLM apps with metadata and automation role support.

### Modified Capabilities
- `ai-council-app-registry`: Replace hardcoded fixed agent/judge keys with configuration-driven app metadata loaded from `config/apps.json`.
- `ai-council-side-panel`: Replace fixed-flow UI with configurable agent checkboxes and judge dropdown populated from app configuration.
- `ai-council-orchestration`: Replace fixed ChatGPT→DeepSeek workflow with multi-agent parallel execution and configurable judge selection.
- `ai-council-selector-config`: Add selector config files for Claude, Gemini, Qwen, and Kimi alongside existing ChatGPT and DeepSeek configs.
- `ai-council-real-agent-automation`: Generalize the tab runner to support any configured app as agent or judge, not just ChatGPT/DeepSeek.
- `chrome-extension-foundation`: Add host permissions and content-script registration for all supported apps.
- `ai-council-storage`: Store the list of selected agent keys and judge key in session records (already partially supported, now actually used).

## Impact

- Affects `config/apps.json` (new file) — central app configuration.
- Affects `config/selectors/` — adds `claude.json`, `gemini.json`, `qwen.json`, `kimi.json`.
- Affects `entrypoints/` — adds `claude.content.ts`, `gemini.content.ts`, `qwen.content.ts`, `kimi.content.ts`.
- Affects `utils/appRegistry.ts` — loads from `config/apps.json` instead of hardcoded array.
- Affects `utils/automation/` — generalizes adapters and runner for any app.
- Affects `entrypoints/background.ts` — multi-agent parallel orchestration replaces fixed flow.
- Affects `entrypoints/sidepanel/App.tsx` — configurable agent/judge selection UI.
- Affects `wxt.config.ts` — host permissions for all supported apps.
- Requires manual browser verification with logged-in sessions for each supported app.
