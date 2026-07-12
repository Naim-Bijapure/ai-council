# AI Council

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

A Chrome/Brave extension (`ai-council`) built with WXT, React, TypeScript, and Manifest V3.

**Many AIs. One verdict.** The extension runs a configurable multi-LLM council: it sends your prompt to selected **agents**, collects their responses, builds a structured judge prompt, submits it to a **judge** app, and captures the judge conversation permalink. The judge response is never scraped — you read the verdict in the judge tab.

Supported apps (agents and/or judge): **ChatGPT, Claude, Gemini, DeepSeek, Qwen, Kimi, Perplexity, Grok**. Availability is driven by `config/apps.json` plus per-app `config/selectors/*.json` and content scripts under `entrypoints/`.

> **Not affiliated** with OpenAI, Anthropic, Google, xAI, DeepSeek, Perplexity, Alibaba, Moonshot, or any other AI provider. Product names are trademarks of their respective owners. Use of third-party sites is subject to those services’ terms.

## Branding

Extension icon and brand mark live under `assets/brand/` (master logo) and `public/icon-{16,32,48,128}.png` (Chrome sizes). See [assets/brand/README.md](./assets/brand/README.md).

## Install (Developer mode)

This project is distributed as a **dev preview** (not on the Chrome Web Store).

**End users:** download the release zip and load it unpacked — see **[INSTALL.md](./INSTALL.md)**.

Short version:

1. Download `ai-council-vX.Y.Z.zip` from [GitHub Releases](../../releases).
2. Unzip to a permanent folder.
3. Open `chrome://extensions` (or `brave://extensions`) → enable **Developer mode**.
4. **Load unpacked** → select the folder that contains `manifest.json` (not the `.zip` itself).
5. Click the extension icon to open the side panel.

## Supported apps

| Key | Display name | Default domain | Selectors | Content script |
|-----|--------------|----------------|-----------|----------------|
| `chatgpt` | ChatGPT | chatgpt.com / chat.openai.com | `config/selectors/chatgpt.json` | `entrypoints/chatgpt.content.ts` |
| `claude` | Claude | claude.ai | `config/selectors/claude.json` | `entrypoints/claude.content.ts` |
| `gemini` | Gemini | gemini.google.com | `config/selectors/gemini.json` | `entrypoints/gemini.content.ts` |
| `deepseek` | DeepSeek | chat.deepseek.com | `config/selectors/deepseek.json` | `entrypoints/deepseek.content.ts` |
| `qwen` | Qwen | chat.qwen.ai | `config/selectors/qwen.json` | `entrypoints/qwen.content.ts` |
| `kimi` | Kimi | www.kimi.com | `config/selectors/kimi.json` | `entrypoints/kimi.content.ts` |
| `perplexity` | Perplexity | www.perplexity.ai | `config/selectors/perplexity.json` | `entrypoints/perplexity.content.ts` |
| `grok` | Grok | grok.com | `config/selectors/grok.json` | `entrypoints/grok.content.ts` |

Each app can act as **agent** and/or **judge** (`automationRoles` in `config/apps.json`). Host permissions live in `wxt.config.ts`.

## Council types

| Type | UI label | Behavior (summary) |
|------|----------|--------------------|
| `agentJudge` | Agent → Judge Council | Selected agents answer (typically in parallel); judge synthesizes |
| `relay` | Relay Council | Agents refine in sequence; judge finalizes |
| `redTeam` | Red Team Council | Author → attackers → defenders → judge |
| `promptRefiner` | Prompt Refiner | Progressive prompt improvement, then judge output |
| `debate` | Debate | Multi-round debate among agents; moderator/judge verdict |

Pick the type in the side panel (**Choose council**). Preferences (agents, judge, type, templates) persist via `chrome.storage.sync`.

## Tech Stack

- WXT for extension entrypoints, manifest generation, development, build, and packaging
- React for the side panel UI
- TypeScript for application, background, and shared domain code
- Manifest V3 for the Chrome extension runtime
- `chrome.storage.sync` for lightweight preferences
- IndexedDB for local session history
- JSON-driven app registry and selector configs (no hardcoded app lists)
## Setup

Install dependencies:

```bash
npm install
```

## Development

### Manual dev mode (recommended for real-site testing)

This mode builds the extension and watches files without launching a browser. Use it when you need to test against real logged-in LLM apps in your existing browser profile.

```bash
npm run dev:manual
```

Then:

1. Open your normal Brave/Chrome (the profile where you're logged in to the LLM apps you want to use).
2. Go to `chrome://extensions` (or `brave://extensions`).
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked**.
5. Select `.output/chrome-mv3-dev` (not `.output`, not the zip).
6. Pin the extension and open its side panel.
7. Edit files → WXT rebuilds → the extension auto-reloads via the dev server at `http://localhost:3001`.

### Flatpak Brave notes

If Brave is installed via Flatpak, it may not see your project directory by default. Grant filesystem access:

```bash
flatpak override --user --filesystem=home com.brave.Browser
```

Then fully quit Brave (`flatpak kill com.brave.Browser`) and relaunch it so the new permissions take effect. Closing tabs is not enough — the Flatpak sandbox process must restart.

### Auto-launch dev mode

```bash
npm run dev          # Chrome
npm run dev:brave    # Flatpak Brave (fresh temp profile, no logins)
```

Auto-launch mode starts a clean browser profile — use it for manifest/UI testing only, not for real site automation.

## App Configuration

Supported apps are listed in `config/apps.json`. Each entry defines its key, display name, domain, host match patterns, new-chat URL, and which automation roles it supports.

```json
{
  "apps": [
    {
      "key": "chatgpt",
      "displayName": "ChatGPT",
      "domain": "chat.openai.com",
      "matchPatterns": ["https://chat.openai.com/*", "https://chatgpt.com/*"],
      "newChatUrl": "https://chatgpt.com/",
      "automationRoles": ["agent", "judge"],
      "loginUrlPatterns": ["/auth/login", "/auth/signup"],
      "enabled": true
    }
  ]
}
```

| Field | Required | Purpose |
|---|---|---|
| `key` | Yes | Stable identifier used in selectors, preferences, and history |
| `displayName` | Yes | Human-readable name shown in the side panel |
| `domain` | Yes | Hostname used to match the active tab against an app |
| `matchPatterns` | Yes | Host permissions / content-script match patterns |
| `newChatUrl` | Yes | URL the runner opens to start a fresh conversation |
| `automationRoles` | Yes | Subset of `["agent", "judge"]` — controls availability in the UI |
| `loginUrlPatterns` | Optional | URL substrings that indicate a not-logged-in state |
| `enabled` | Optional (default `true`) | Set to `false` to hide the app from the UI |

### Adding or removing an app

To add a new app:

1. Add a new entry to `config/apps.json` with the fields above.
2. Add a corresponding `config/selectors/<key>.json` with native-CSS selectors.
3. Add a new WXT content-script entrypoint under `entrypoints/<key>.content.ts` that wires `createContentScriptBridge` to `runAgent` / `runJudge` from `utils/automation/genericAdapter.ts`.
4. Add the new match pattern to `wxt.config.ts` `hostPermissions`.

To remove an app, set its `enabled: false` (or delete its entry) — the side panel and the runner will skip it on the next build.

## Selector Configuration

DOM selectors for each app live in editable JSON files under `config/selectors/`:

```text
config/selectors/chatgpt.json
config/selectors/claude.json
config/selectors/deepseek.json
config/selectors/gemini.json
config/selectors/qwen.json
config/selectors/kimi.json
config/selectors/perplexity.json
config/selectors/grok.json
```

Each file contains ordered selector arrays (native CSS only — no `:has-text()` or `:has()` pseudo-selectors). The adapter tries each selector in priority order until one matches a live element. Comments in each JSON file note when selectors were last verified against the live DOM when known.

### Selector groups

| Group | Required | Purpose |
|---|---|---|
| `input` | Yes | CSS selectors for the chat input element (textarea or contenteditable div) |
| `send` | Yes | CSS selectors for the send button |
| `response` | Yes | CSS selectors for the assistant response container |
| `completion` | Yes | CSS selectors for the stop-generation button (used for completion detection) |
| `blocked` | Optional | CSS selectors for rate-limit/CAPTCHA UI |
| `loginError` | Optional | CSS selectors for login page elements |

### Updating selectors

If the extension reports `dom_error` or `not_logged_in` incorrectly:

1. Open the affected app in your browser.
2. Inspect the chat input element, send button, response container, and stop button.
3. Copy their CSS selectors into the corresponding JSON file.
4. Reload the extension (`Alt+R` or via `chrome://extensions`).
5. Run diagnostics again to verify.

The selector JSON is bundled at build time. After editing, the extension must be rebuilt (`npm run dev:manual` auto-rebuilds on file change).

## Test The Workflow

### Prerequisites

- You must be **logged in** to every app you select as agent or judge in the same browser profile you use for testing:

  | App | Typical URL |
  |-----|-------------|
  | ChatGPT | `chatgpt.com` |
  | Claude | `claude.ai` |
  | Gemini | `gemini.google.com` |
  | DeepSeek | `chat.deepseek.com` |
  | Qwen | `chat.qwen.ai` |
  | Kimi | `www.kimi.com` (also `kimi.moonshot.cn`) |
  | Perplexity | `www.perplexity.ai` |
  | Grok | `grok.com` |

- Run `npm run dev:manual` and load the extension as described above.

### Run diagnostics

Before a full council, verify that the extension can detect the chat UIs (when developer tools are enabled in the side panel):

1. Open the side panel.
2. Pick one or more agents in the **Agents** section.
3. Click **Run diagnostics**.
4. The extension opens tabs for the selected agents and reports Ready/error status for each.
5. If any report an error, inspect the real DOM and update that app's selector JSON.

### Run the council

1. Choose a **Council type** (Agent → Judge, Relay, Red Team, Prompt Refiner, or Debate).
2. Tick one or more **Agents** (and assign roles when the type requires them, e.g. Red Team).
3. Pick the **Judge** app and optional judge prompt template / style.
4. Enter a prompt in the editor.
5. Click **Run council**.
6. The extension opens tabs, drives each app via its content script, and tracks status in the panel (Pending / Done / Skipped / errors). You can **Skip** a stuck agent or **Cancel** the run.
7. After agent work finishes, it builds a structured judge prompt from successful responses and sends it to the judge app.
8. When the judge prompt is sent, use **Switch to judge tab** to read the verdict in that app.
9. Click **New question** to reset and start over.
10. Check the **History** tab for saved sessions (timestamp, status, agents, judge). Rows with a captured judge URL are tappable.

Your agent, judge, council type, and related preferences are saved to `chrome.storage.sync` and restored on the next side-panel open.

## Timeouts

Defaults from `utils/automation/types.ts` (`DEFAULT_AUTOMATION_TIMEOUTS`):

| Phase | Timeout |
|---|---|
| Tab load | 30 seconds |
| Content script readiness (CONTENT_READY handshake) | 20 seconds |
| Login grace period (polling for input element) | 10 seconds |
| Send button enable wait | 10 seconds |
| Response idle (no generation signals) | 120 seconds |
| Max response wait (absolute ceiling) | 30 minutes |
| Judge URL capture | 30 seconds |

## Known Limitations

- The judge response is never captured or stored. The user reads it directly in the judge app's tab.
- If the judge app doesn't change its URL within 30 seconds of sending the judge prompt, `judgeChatUrl` may be stored as null and the history row is dimmed/non-tappable.
- One active council session at a time while a run is in progress.
- Third-party chat UIs change often; selectors under `config/selectors/` (including `grok.json`, `perplexity.json`, etc.) may need updates when an app redesigns its DOM.
- Automation must comply with each site’s terms of use.

## Build

Run TypeScript and WXT compile checks:

```bash
npm run compile
```

Create a production build:

```bash
npm run build
```

Create a distributable zip and copy it to `releases/`:

```bash
npm run release
# → releases/ai-council-v0.1.0.zip
```

(`npm run zip` only builds the zip under `.output/` without copying.)

### Publish a GitHub Release (maintainers)

```bash
npm run release
gh release create v0.1.0 releases/ai-council-v0.1.0.zip \
  --title "v0.1.0 — Dev preview" \
  --notes "Pre-built extension for load-unpacked install. See INSTALL.md."
```

Or create the release in the GitHub UI and upload `releases/ai-council-v0.1.0.zip` as an asset.

## Load In Chrome Or Brave

**From a release zip:** follow [INSTALL.md](./INSTALL.md).

**From a local production build:**

1. Run `npm run build`.
2. Open `chrome://extensions` or `brave://extensions`.
3. Enable Developer mode.
4. Select Load unpacked.
5. Choose the generated `.output/chrome-mv3` directory.

**For live development output:**

1. Run `npm run dev:manual`.
2. Keep that terminal running.
3. Open `chrome://extensions` or `brave://extensions`.
4. Enable Developer mode.
5. Select Load unpacked.
6. Choose `.output/chrome-mv3-dev`.

Do not choose the `.output` folder itself. Brave/Chrome must be pointed at the exact generated folder that contains `manifest.json`.  
Do not use the zip file with Load unpacked — unzip first, then load the folder.

## Source Layout

```text
config/
  apps.json                    # All supported apps + automation roles
  selectors/
    chatgpt.json
    claude.json
    deepseek.json
    gemini.json
    qwen.json
    kimi.json
    perplexity.json
    grok.json                  # Grok (grok.com) DOM selectors
entrypoints/
  background.ts                # MV3 service worker / orchestrator
  chatgpt.content.ts
  claude.content.ts
  deepseek.content.ts
  gemini.content.ts
  qwen.content.ts
  kimi.content.ts
  perplexity.content.ts
  grok.content.ts
  sidepanel/
    App.tsx                    # Council types UI, run state, history
    components/                # Agent list, prompt editor, etc.
utils/
  appRegistry.ts               # Loads config/apps.json
  history.ts                   # IndexedDB session storage
  preferences.ts               # chrome.storage.sync helpers
  types.ts                     # Shared contracts (CouncilType, sessions, …)
  judgePrompt*.ts / relay* / redTeam* / debate* / promptRefiner*
                               # Per-council-type prompt builders & templates
  automation/
    selectorConfig.ts          # Loads all selector JSON files
    genericAdapter.ts          # Shared agent/judge automation
    councilRunner.ts           # Multi-agent / multi-type orchestrator
    diagnostics.ts / probe.ts  # Diagnostics & selector probe
    …
wxt.config.ts                  # Manifest V3, host_permissions (incl. Grok)
package.json
LICENSE / NOTICE / CONTRIBUTING.md / SECURITY.md / INSTALL.md
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Security reports: [SECURITY.md](./SECURITY.md).

## License

This project is open source under the [MIT License](./LICENSE).

Copyright (c) 2026 Naim Bijapure.

Third-party dependency notices and trademark disclaimers: [NOTICE](./NOTICE).
