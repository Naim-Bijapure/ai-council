import { createContentScriptBridge } from "../utils/automation/contentBridge";
import { runAgent, runJudge } from "../utils/automation/genericAdapter";
import { checkReadiness } from "../utils/automation/readiness";

export default defineContentScript({
  matches: ["https://gemini.google.com/*"],
  runAt: "document_idle",
  main() {
    createContentScriptBridge("gemini", {
      async onAgentRun(prompt, selectors) {
        return runAgent("gemini", prompt, selectors);
      },
      async onJudgeRun(prompt, selectors) {
        return runJudge("gemini", prompt, selectors);
      },
      async onDiagnosticCheck(selectors) {
        return checkReadiness("gemini", selectors);
      },
      onCancel() {}
    });
  }
});
