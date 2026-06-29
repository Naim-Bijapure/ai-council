import { createContentScriptBridge } from "../utils/automation/contentBridge";
import { runAgent, runJudge } from "../utils/automation/genericAdapter";
import { checkReadiness } from "../utils/automation/readiness";

export default defineContentScript({
  matches: ["https://chat.deepseek.com/*"],
  runAt: "document_idle",
  main() {
    createContentScriptBridge("deepseek", {
      async onAgentRun(prompt, selectors) {
        return runAgent("deepseek", prompt, selectors);
      },
      async onJudgeRun(prompt, selectors) {
        return runJudge("deepseek", prompt, selectors);
      },
      async onDiagnosticCheck(selectors) {
        return checkReadiness("deepseek", selectors);
      },
      onCancel() {}
    });
  }
});
