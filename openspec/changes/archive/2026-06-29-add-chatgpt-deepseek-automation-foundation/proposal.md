## Why

AI Council is ready for its first real browser automation slice, but the next step should stay intentionally small. This phase will prove the workflow with exactly one agent and one judge: ChatGPT as the agent, DeepSeek as the judge. The extension automates ChatGPT prompt submission and response extraction, builds the structured judge prompt, injects it into DeepSeek, confirms the message was sent, and captures the DeepSeek conversation permalink for later review. The judge response itself is never captured or stored — the user reads it directly in the judge tab. Editable JSON selector config (native CSS only) lets DOM values be updated without changing TypeScript code.

## What Changes

- Restrict this implementation phase to a fixed workflow: one ChatGPT agent and one DeepSeek judge.
- Add a reusable browser automation boundary between the background orchestrator and app-specific content scripts.
- Add ChatGPT prompt submission, response waiting, response extraction, timeout handling, and cancellation behavior for the agent step.
- Add DeepSeek judge prompt submission, send confirmation, and judge chat URL capture (via `chrome.tabs.onUpdated`, 30-second timeout with final-URL fallback). The extension does NOT wait for, extract, or store the DeepSeek judge response.
- Store app DOM selectors in separate JSON config files (native CSS only, ordered priority arrays) so the user can update them after inspecting the real pages.
- Add narrow host permissions and content-script registration for ChatGPT and DeepSeek only.
- Update the side panel so this phase presents the fixed ChatGPT-to-DeepSeek flow with a minimal judge handoff state (State 3): "Judge is running in DeepSeek" + "Switch to judge tab" + "New question". No judge response is displayed.
- Save the original prompt, ChatGPT agent response, session status, duration, and the captured judge chat URL (or null) in local history. No judge response text is stored.
- Defer Claude, Gemini, Qwen, Kimi, multi-agent selection, multi-judge selection, judge response capture, remote selector config, selector editing UI, and all other app adapters to later changes.

## Capabilities

### New Capabilities

- `ai-council-real-agent-automation`: Browser-tab automation for a fixed ChatGPT agent run, including tab lifecycle, content-script readiness handshake, prompt send, response extraction, timeouts, cancellation, and judge chat URL capture via `chrome.tabs.onUpdated`.
- `ai-council-chatgpt-adapter`: ChatGPT-specific content-script adapter behavior for detecting usable chat UI, sending the user prompt, waiting for completion, and extracting the final assistant response.
- `ai-council-deepseek-judge-adapter`: DeepSeek-specific content-script adapter behavior for receiving the generated judge prompt, submitting it, and confirming the message was sent. No response wait or extraction.
- `ai-council-selector-config`: JSON-backed selector configuration (native CSS, ordered priority arrays) for ChatGPT and DeepSeek DOM values used by content-script adapters.

### Modified Capabilities

- `ai-council-orchestration`: Replace pure demo execution with a fixed real automation pipeline: user prompt -> ChatGPT agent -> judge prompt builder -> DeepSeek judge injection -> send confirmation -> judge chat URL capture.
- `ai-council-app-registry`: Mark ChatGPT as the only agent automation target and DeepSeek as the only judge automation target for this phase.
- `ai-council-side-panel`: Replace broad app selection in this phase with a simple fixed-flow UI that clearly shows ChatGPT as agent and DeepSeek as judge, ending in a minimal judge handoff state.
- `ai-council-storage`: Store the captured judge chat URL (or null) and the ChatGPT agent tab URL for fixed-flow sessions. Judge response text is never stored.
- `chrome-extension-foundation`: Add the minimal host permissions and content-script manifest behavior needed for ChatGPT and DeepSeek automation.

## Impact

- Affects WXT entrypoints by adding content scripts for ChatGPT and DeepSeek pages.
- Affects `entrypoints/background.ts` by introducing a real automation pipeline alongside or in place of the current demo runner for this phase, including a `chrome.tabs.onUpdated` listener for judge URL capture.
- Affects shared TypeScript contracts for automation commands, content-script events, selector config, agent execution, judge send confirmation, and error reasons.
- Affects `wxt.config.ts` by adding narrow ChatGPT and DeepSeek host permissions and content-script registration.
- Affects the side panel UI by simplifying the current full app selector into a fixed ChatGPT-agent and DeepSeek-judge workflow for this implementation round, with a minimal judge handoff state.
- Affects IndexedDB history shape by storing the judge chat URL and the ChatGPT tab URL for this fixed-flow phase. No judge response text field is added.
- Requires manual browser verification in Brave/Chrome with logged-in ChatGPT and DeepSeek sessions.
