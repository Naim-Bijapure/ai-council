## Why

AI Council is ready for its first real browser automation slice, but the next step should stay intentionally small. This phase will prove the workflow with exactly one agent and one judge: ChatGPT as the agent, DeepSeek as the judge, and editable JSON selector config so DOM details can be updated without changing TypeScript code.

## What Changes

- Restrict this implementation phase to a fixed workflow: one ChatGPT agent and one DeepSeek judge.
- Add a reusable browser automation boundary between the background orchestrator and app-specific content scripts.
- Add ChatGPT prompt submission, response waiting, response extraction, timeout handling, and cancellation behavior for the agent step.
- Add DeepSeek judge prompt submission, response waiting, response extraction, timeout handling, and cancellation behavior for the judge step.
- Store app DOM selectors and related DOM lookup values in separate JSON config files so the user can update them after inspecting the real pages.
- Add narrow host permissions and content-script registration for ChatGPT and DeepSeek only.
- Update the side panel so this phase presents the fixed ChatGPT-to-DeepSeek flow instead of the full multi-agent/multi-judge selector workflow.
- Save the ChatGPT agent response and DeepSeek judge response in local history for this fixed workflow.
- Defer Claude, Gemini, Qwen, Kimi, multi-agent selection, multi-judge selection, remote selector config, selector editing UI, and all other app adapters to later changes.

## Capabilities

### New Capabilities

- `ai-council-real-agent-automation`: Browser-tab automation for a fixed ChatGPT agent run, including tab lifecycle, content-script readiness, prompt send, response extraction, timeouts, and cancellation.
- `ai-council-chatgpt-adapter`: ChatGPT-specific content-script adapter behavior for detecting usable chat UI, sending the user prompt, waiting for completion, and extracting the final assistant response.
- `ai-council-deepseek-judge-adapter`: DeepSeek-specific content-script adapter behavior for receiving the generated judge prompt, submitting it, waiting for completion, and extracting the final judge response.
- `ai-council-selector-config`: JSON-backed selector configuration for ChatGPT and DeepSeek DOM values used by content-script adapters.

### Modified Capabilities

- `ai-council-orchestration`: Replace pure demo execution with a fixed real automation pipeline: user prompt -> ChatGPT agent -> judge prompt builder -> DeepSeek judge.
- `ai-council-app-registry`: Mark ChatGPT as the only agent automation target and DeepSeek as the only judge automation target for this phase.
- `ai-council-side-panel`: Replace broad app selection in this phase with a simple fixed-flow UI that clearly shows ChatGPT as agent and DeepSeek as judge.
- `ai-council-storage`: Store the DeepSeek judge response for fixed-flow sessions in addition to the ChatGPT agent response.
- `chrome-extension-foundation`: Add the minimal host permissions and content-script manifest behavior needed for ChatGPT and DeepSeek automation.

## Impact

- Affects WXT entrypoints by adding content scripts for ChatGPT and DeepSeek pages.
- Affects `entrypoints/background.ts` by introducing a real automation pipeline alongside or in place of the current demo runner for this phase.
- Affects shared TypeScript contracts for automation commands, content-script events, selector config, agent execution, judge execution, and error reasons.
- Affects `wxt.config.ts` by adding narrow ChatGPT and DeepSeek host permissions and content-script registration.
- Affects the side panel UI by simplifying the current full app selector into a fixed ChatGPT-agent and DeepSeek-judge workflow for this implementation round.
- Affects IndexedDB history shape by storing the judge response text for this fixed-flow phase.
- Requires manual browser verification in Brave/Chrome with logged-in ChatGPT and DeepSeek sessions.
