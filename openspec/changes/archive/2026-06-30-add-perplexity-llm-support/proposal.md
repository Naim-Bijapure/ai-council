## Why

The AI Council extension currently supports six LLM web apps (ChatGPT, Claude, Gemini, DeepSeek, Qwen, Kimi) but not Perplexity. Perplexity is a popular AI search assistant with a distinct web UI, and users want to include it as both an agent and a judge in their council workflows.

## What Changes

- Add `perplexity` app entry to `config/apps.json` with `key`, `displayName`, `domain` (`www.perplexity.ai`), match patterns, new-chat URL, and automation roles `["agent", "judge"]`.
- Add `perplexity.com` to `host_permissions` in `wxt.config.ts`.
- Create `entrypoints/perplexity.content.ts` content script that wires `onAgentRun`, `onJudgeRun`, `onDiagnosticCheck`, and `onProbeRun` to the shared `genericAdapter` and `probe` modules.
- Create `config/selectors/perplexity.json` with verified DOM selectors for input, send button, response container, completion, blocked, and login error states.
- Add Perplexity to the app registry spec (which currently enumerates supported apps) and selector-config spec (which lists every supported app's selector config).
- Add a new `ai-council-app-adapter-perplexity` spec capturing the content-script registration and adapter behavior.

## Capabilities

### New Capabilities
- `ai-council-app-adapter-perplexity`: Perplexity-specific content script registration, agent-mode prompt submission, judge-mode prompt submission, readiness detection, and probe wiring.

### Modified Capabilities
- `ai-council-app-registry`: Add Perplexity to the list of supported apps returned by the registry.
- `ai-council-selector-config`: Add a scenario requiring a Perplexity selector config file under `config/selectors/perplexity.json`.

## Impact

- `config/apps.json` — new `perplexity` entry
- `config/selectors/perplexity.json` — new file
- `wxt.config.ts` — new host permission for `www.perplexity.ai`
- `entrypoints/perplexity.content.ts` — new content-script entrypoint
- `openspec/specs/ai-council-app-registry/spec.md` — add Perplexity to enumeration
- `openspec/specs/ai-council-selector-config/spec.md` — add Perplexity scenario
- No changes to background, sidepanel, generic adapter, or probe modules — all work via the shared abstraction already in place.
