# Tasks: Relay-Critique Workflow

- [x] Extend types with `councilType`, relay fields on `AgentResult`, `relayFinalDraft`, `toStoredSession`
- [x] Create `utils/relayPrompt.ts` — author, reviewer, relay judge builders
- [x] Create `utils/relayResponseParser.ts` — parse critique + revised answer
- [x] Add relay branch in `councilRunner.ts` with draft state machine and skip-on-failure
- [x] Wire `councilType` through `background.ts` session creation
- [x] Replace relay placeholder UI with full form and enabled Run relay button
- [x] Relay-aware SessionView: role badges, step progress, final draft highlight
- [x] History rows show Relay vs Council
- [x] OpenSpec design, spec delta, tasks
- [ ] Manual test: 3-agent relay end-to-end
- [ ] Manual test: mid-chain skip preserves draft
- [ ] Manual test: author failure → partial_failure
- [ ] Manual test: council mode regression