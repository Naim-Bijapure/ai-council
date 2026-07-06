# Design: Reactive Response Wait

## Problem

Fixed 180s response timeouts caused Qwen to fail during long thinking/search phases. Text stabilization on the wrong DOM container caused Claude to capture extended-thinking content instead of the final answer.

## Solution

Replace fixed-duration waiting with activity-aware idle timeout:

- While `isGenerationActive()` (stop button, generating indicators, disabled send after response started, recent text mutations) → reset idle clock, never complete
- Complete via stop-button disappearance (6s debounced) or text stabilization on **latest** monitor container
- Post-completion 2s verify — resume if generation restarts
- Timeout only after 120s sustained idle, or 30 min absolute ceiling

## Key changes

- `getLatestResponseContainer()` — consistent first/last container bug fix
- `isGenerationActive()` — multi-signal generation detection
- `responseMonitor` / `generating` / `responseExclude` selector groups
- Background `sendAgentRun` uses `maxResponseWaitMs` (30 min) not 180s