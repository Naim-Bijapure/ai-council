## Context

The AI Council extension automates a council workflow that opens multiple LLM web apps in tabs, injects a prompt, waits for each response, and (optionally) feeds those responses to a designated "judge" app. Adding a new LLM is a repeatable pattern: register the app in `config/apps.json`, grant the host permission in `wxt.config.ts`, create a content script that wires the shared `genericAdapter` and `probe` modules, and supply a JSON selector config with verified DOM selectors. This change adds Perplexity (`www.perplexity.ai`) following that exact pattern.

## Goals / Non-Goals

**Goals:**
- Add Perplexity as a first-class app supporting both `agent` and `judge` automation roles.
- Reuse the existing shared adapter (`utils/automation/genericAdapter.ts`) and probe (`utils/automation/probe.ts`) — no app-specific automation code.
- Provide a verified selector config so the probe can confirm DOM interaction works.
- Keep the change additive — no impact on existing apps.

**Non-Goals:**
- Custom Perplexity adapter logic (handled by `genericAdapter` like every other app).
- Auto-discovery of Perplexity DOM selectors (user verifies selectors via the probe tool).
- Support for Perplexity's Pro Search, file upload, or focus modes (text-only prompts).
- Modifying the sidepanel UI to highlight Perplexity differently.

## Decisions

- **Domain**: `www.perplexity.ai` is the canonical home. Add `https://www.perplexity.ai/*` to match patterns and host permissions. Skip `perplexity.ai/*` (root) since the chat app lives on `www`.
- **Selector config structure**: Mirror the Kimi shape (contenteditable input, optional completion selector, no login form). Perplexity uses a ProseMirror-like contenteditable at the bottom of the page.
- **Send mechanism**: Perplexity's send button only appears once text is typed, similar to Claude/Gemini. The shared `clickElement` plus the Enter-key backup added in the previous change handles this generically — no Perplexity-specific code needed.
- **Completion detection**: No stop button in Perplexity's DOM — rely on DOM stabilization heuristic (scoped `MutationObserver` + 2s quiet period), same as Kimi.
- **Login detection**: `a[href*='login']`, `a[href*='signin']` (Perplexity uses a sign-in modal, not a redirect to a separate page). We treat the presence of these as a soft "logged out" signal — the sidepanel can show a hint.
- **Registry/selector spec updates**: Add a single scenario to `ai-council-selector-config` and update the enumeration in `ai-council-app-registry`. These are delta updates because the spec structure stays the same.

## Risks / Trade-offs

- [Perplexity DOM changes] → Selectors verified at one point in time. If Perplexity ships a redesign, users will need to re-run the probe and update `config/selectors/perplexity.json`. This is the same risk every other app carries, mitigated by the probe tool.
- [Sign-in modal is non-blocking] → The probe may report `loginError: no match` even when the user is signed out, because the sign-in UI is a modal overlay (not a separate URL). Mitigation: include broad `a[href*='login']` / `a[href*='signin']` selectors in the config; users can rely on visual confirmation.
- [Send button race condition] → Like Claude/Gemini, the send button is conditionally rendered. The existing `clickElement` + Enter-key backup sequence in `genericAdapter` and `probe` is designed for exactly this pattern.
- [Spec enumeration drift] → `ai-council-app-registry` enumerates the list of supported apps in a scenario. Future app additions require updating that scenario. Acceptable: keeps the spec authoritative and prevents registry/UI drift.
