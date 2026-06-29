import { createContentScriptBridge } from "../utils/automation/contentBridge";
import { runAgent, runJudge } from "../utils/automation/genericAdapter";
import { checkReadiness } from "../utils/automation/readiness";

export default defineContentScript({
  matches: ["https://kimi.moonshot.cn/*"],
  runAt: "document_idle",
  main() {
    createContentScriptBridge("kimi", {
      async onAgentRun(prompt, selectors) {
        return runAgent("kimi", prompt, selectors);
      },
      async onJudgeRun(prompt, selectors) {
        return runJudge("kimi", prompt, selectors);
      },
      async onDiagnosticCheck(selectors) {
        return checkReadiness("kimi", selectors);
      },
      onCancel() {}
    });
  }
});
