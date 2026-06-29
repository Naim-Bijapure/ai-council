import { createContentScriptBridge } from "../utils/automation/contentBridge";
import { runAgent, runJudge } from "../utils/automation/genericAdapter";
import { checkReadiness } from "../utils/automation/readiness";

export default defineContentScript({
  matches: ["https://claude.ai/*"],
  runAt: "document_idle",
  main() {
    createContentScriptBridge("claude", {
      async onAgentRun(prompt, selectors) {
        return runAgent("claude", prompt, selectors);
      },
      async onJudgeRun(prompt, selectors) {
        return runJudge("claude", prompt, selectors);
      },
      async onDiagnosticCheck(selectors) {
        return checkReadiness("claude", selectors);
      },
      onCancel() {}
    });
  }
});
