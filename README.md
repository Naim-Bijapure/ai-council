# AI Council

A Chrome/Brave extension built with WXT, React, TypeScript, and Manifest V3.

The extension automates a fixed AI Council workflow: it sends your prompt to ChatGPT (agent), extracts the response, builds a structured judge prompt, submits it to DeepSeek (judge), confirms the message was sent, and captures the DeepSeek conversation permalink. The judge response is never captured — you read the verdict directly in the DeepSeek tab.

## Tech Stack

- WXT for extension entrypoints, manifest generation, development, build, and packaging
- React for the side panel UI
- TypeScript for application, background, and shared domain code
- Manifest V3 for the Chrome extension runtime
- `chrome.storage.sync` for lightweight preferences
- IndexedDB for local session history

## Setup

Install dependencies:

```bash
npm install
```

## Development

### Manual dev mode (recommended for real-site testing)

This mode builds the extension and watches files without launching a browser. Use it when you need to test against real ChatGPT and DeepSeek logins in your existing browser profile.

```bash
npm run dev:manual
```

Then:

1. Open your normal Brave/Chrome (the profile where you're logged in to ChatGPT and DeepSeek).
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

## Test The Workflow

### Prerequisites

- You must be **logged in to ChatGPT** (`chatgpt.com`) and **DeepSeek** (`chat.deepseek.com`) in the browser profile you use for testing.
- Run `npm run dev:manual` and load the extension as described above.

### Run diagnostics

Before running the full council, verify that the extension can detect the chat UIs:

1. Open the side panel.
2. Click **Run diagnostics**.
3. The extension opens ChatGPT and DeepSeek tabs and reports Ready/error status for each.
4. If either reports an error, inspect the real DOM and update the selector JSON (see below).

### Run the council

1. Enter a prompt in the textarea.
2. Click **Run council**.
3. The extension opens ChatGPT, sends your prompt, waits for the response, extracts it.
4. It builds a structured judge prompt and sends it to DeepSeek.
5. Once the judge prompt is sent, the panel shows **"Judge is running in DeepSeek"** with a **Switch to judge tab** button.
6. Click **Switch to judge tab** to open the DeepSeek conversation and read the verdict.
7. Click **New question** to reset and start over.
8. Use **Cancel** during execution to abort the run.
9. Check the **History** tab for saved sessions. Rows with a captured judge URL are tappable; rows with `Judge URL unavailable` are dimmed.

## Selector Configuration

DOM selectors for ChatGPT and DeepSeek are stored in editable JSON files:

```text
config/selectors/chatgpt.json
config/selectors/deepseek.json
```

Each file contains ordered selector arrays (native CSS only — no `:has-text()` or `:has()` pseudo-selectors). The adapter tries each selector in priority order until one matches a live element.

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

1. Open ChatGPT or DeepSeek in your browser.
2. Inspect the chat input element, send button, response container, and stop button.
3. Copy their CSS selectors into the corresponding JSON file.
4. Reload the extension (`Alt+R` or via `chrome://extensions`).
5. Run diagnostics again to verify.

The selector JSON is bundled at build time. After editing, the extension must be rebuilt (`npm run dev:manual` auto-rebuilds on file change).

## Timeouts

| Phase | Timeout |
|---|---|
| Tab load | 15 seconds |
| Content script readiness (CONTENT_READY handshake) | 10 seconds |
| Login grace period (polling for input element) | 10 seconds |
| Send button enable wait | 3 seconds |
| Agent response wait | 45 seconds |
| Judge URL capture | 30 seconds |

## Known Limitations

- Only ChatGPT (agent) and DeepSeek (judge) are automated in this phase. Claude, Gemini, Qwen, and Kimi are not yet supported.
- The DeepSeek judge response is never captured or stored. The user reads it directly in the DeepSeek tab.
- If DeepSeek doesn't change its URL within 30 seconds of sending the judge prompt, `judgeChatUrl` is stored as null and the history row is dimmed/non-tappable.
- One session at a time. The submit button is disabled while a session is in progress.
- Selector values are best-effort placeholders. Real DOM values must be updated after inspecting the actual ChatGPT and DeepSeek pages.

## Build

Run TypeScript and WXT compile checks:

```bash
npm run compile
```

Create a production build:

```bash
npm run build
```

Create a distributable zip archive:

```bash
npm run zip
```

## Load In Chrome Or Brave

For production output:

1. Run `npm run build`.
2. Open `chrome://extensions` or `brave://extensions`.
3. Enable Developer mode.
4. Select Load unpacked.
5. Choose the generated `.output/chrome-mv3` directory.

For live development output:

1. Run `npm run dev:manual`.
2. Keep that terminal running.
3. Open `chrome://extensions` or `brave://extensions`.
4. Enable Developer mode.
5. Select Load unpacked.
6. Choose `.output/chrome-mv3-dev`.

Do not choose the `.output` folder itself. Brave/Chrome must be pointed at the exact generated folder that contains `manifest.json`.
Do not use the zip file with Load unpacked; the zip is for distribution/upload workflows.

## Source Layout

```text
entrypoints/
  background.ts              # MV3 background service worker, fixed-flow orchestration
  chatgpt.content.ts         # ChatGPT content script (agent adapter)
  deepseek.content.ts        # DeepSeek content script (judge adapter)
  sidepanel/
    index.html               # Side panel document shell
    main.tsx                 # React side panel mount point
    App.tsx                  # Council and History UI
    style.css                # Side panel styles
config/
  selectors/
    chatgpt.json             # ChatGPT DOM selectors (native CSS, ordered arrays)
    deepseek.json            # DeepSeek DOM selectors (native CSS, ordered arrays)
utils/
  appRegistry.ts             # Supported AI app metadata + automation roles
  format.ts                  # UI formatting helpers
  history.ts                 # IndexedDB session storage
  judgePrompt.ts             # Structured judge prompt builder
  preferences.ts             # chrome.storage.sync preference helpers
  types.ts                   # Shared TypeScript contracts
  automation/
    types.ts                 # Automation types (timeouts, results, selectors)
    messages.ts              # Typed runtime message bridge (bg ↔ content scripts)
    selectorConfig.ts        # Selector JSON loader and validator
    readiness.ts             # Login grace period + input detection
    adapterHelpers.ts        # Shared DOM helpers (inject, send, extract)
    chatgptAdapter.ts        # ChatGPT agent adapter (inject, wait, extract)
    deepseekAdapter.ts       # DeepSeek judge adapter (inject, send, confirm)
    contentBridge.ts         # Content script message bridge factory
    diagnostics.ts           # Background diagnostic helpers (open tabs, handshake)
    fixedFlowRunner.ts       # Fixed ChatGPT→DeepSeek workflow runner
wxt.config.ts                # WXT and generated manifest configuration
tsconfig.json                # TypeScript configuration
```
