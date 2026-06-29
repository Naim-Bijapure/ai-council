import { createContentScriptBridge } from "../utils/automation/contentBridge";
import { runAgent, runJudge } from "../utils/automation/genericAdapter";
import { checkReadiness } from "../utils/automation/readiness";

export default defineContentScript({
  matches: ["https://chat.openai.com/*", "https://chatgpt.com/*"],
  runAt: "document_idle",
  main() {
    createContentScriptBridge("chatgpt", {
      async onAgentRun(prompt, selectors) {
        return runAgent("chatgpt", prompt, selectors);
      },
      async onJudgeRun(prompt, selectors) {
        return runJudge("chatgpt", prompt, selectors);
      },
      async onDiagnosticCheck(selectors) {
        return checkReadiness("chatgpt", selectors);
      },
      onCancel() {}
    });
  }
});
