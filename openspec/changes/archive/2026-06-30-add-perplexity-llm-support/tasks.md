## 1. App Registry and Permissions

- [ ] 1.1 Add Perplexity entry to `config/apps.json` with key `perplexity`, displayName `Perplexity`, domain `www.perplexity.ai`, match pattern `https://www.perplexity.ai/*`, newChatUrl `https://www.perplexity.ai/`, automationRoles `["agent", "judge"]`, loginUrlPatterns `["/login", "/signin"]`, enabled true
- [ ] 1.2 Add `https://www.perplexity.ai/*` to `host_permissions` in `wxt.config.ts`

## 2. Content Script Entrypoint

- [ ] 2.1 Create `entrypoints/perplexity.content.ts` matching `https://www.perplexity.ai/*` at `document_idle`, wiring `onAgentRun` / `onJudgeRun` to `runAgent` / `runJudge` from `genericAdapter`, `onDiagnosticCheck` to `checkReadiness`, and `onProbeRun` to `runProbeStatic` / `runProbeLive`

## 3. Selector Configuration

- [ ] 3.1 Create `config/selectors/perplexity.json` with `appKey: "perplexity"`, `selectors.input` (contenteditable textbox), `selectors.send` (send button selectors), `selectors.response` (assistant response container), `selectors.completion` (empty — rely on DOM stabilization), `selectors.blocked` (empty), `selectors.loginError` (sign-in modal hints)
- [ ] 3.2 Run selector probe (static + live) against Perplexity and confirm all groups pass
- [ ] 3.3 Iterate on selector values until probe live test shows green for input/injection/send/response_wait/response_preview

## 4. Build Verification

- [ ] 4.1 Run `npm run compile` and confirm zero TypeScript errors
- [ ] 4.2 Run `npm run build` and confirm extension bundle includes Perplexity content script

## 5. Spec Sync and Archive

- [ ] 5.1 Update `openspec/specs/ai-council-app-registry/spec.md` to enumerate Perplexity in the "supported apps" scenario (apply MODIFIED delta)
- [ ] 5.2 Verify `openspec/specs/ai-council-selector-config/spec.md` includes the Perplexity scenario (apply ADDED delta)
- [ ] 5.3 Run `openspec validate --change add-perplexity-llm-support` and confirm all checks pass
- [ ] 5.4 Run `openspec archive -y add-perplexity-llm-support` to archive the change
