import { browser } from "wxt/browser";
import { getSupportedApp } from "../appRegistry";
import { buildJudgePrompt } from "../judgePrompt";
import { saveSession } from "../history";
import {
  type ActiveCouncilSession,
  type AgentResult,
  type AppKey,
  type JudgeStep,
  type StoredCouncilSession
} from "../types";
import { openTabAndListenForReady } from "./diagnostics";
import type { BgToContentMessage, ContentToBgMessage } from "./messages";
import { loadSelectorConfig } from "./selectorConfig";
import {
  DEFAULT_AUTOMATION_TIMEOUTS,
  type AdapterResult,
  type AutomationTimeouts,
  type SendConfirmationResult
} from "./types";

export interface CouncilRunnerCallbacks {
  onUpdate: (session: ActiveCouncilSession) => void;
  onComplete: (session: ActiveCouncilSession) => void;
  isCancelled: () => boolean;
}

interface ActiveRunState {
  sessionId: string;
  cancelled: boolean;
  timers: ReturnType<typeof setTimeout>[];
  tabListeners: Array<() => void>;
  messageListeners: Array<() => void>;
  agentTabIds: Map<AppKey, number>;
  judgeTabId: number | null;
}

export async function runCouncil(
  session: ActiveCouncilSession,
  callbacks: CouncilRunnerCallbacks,
  timeouts: AutomationTimeouts = DEFAULT_AUTOMATION_TIMEOUTS
): Promise<void> {
  const state: ActiveRunState = {
    sessionId: session.id,
    cancelled: false,
    timers: [],
    tabListeners: [],
    messageListeners: [],
    agentTabIds: new Map(),
    judgeTabId: null
  };

  const update = (patch: Partial<ActiveCouncilSession>): ActiveCouncilSession => {
    session = { ...session, ...patch };
    callbacks.onUpdate(session);
    return session;
  };

  const updateAgent = (agentKey: AppKey, patch: Partial<AgentResult>): void => {
    session = {
      ...session,
      agentResults: session.agentResults.map((r) =>
        r.agentKey === agentKey ? { ...r, ...patch } : r
      )
    };
    callbacks.onUpdate(session);
  };

  const updateJudge = (patch: Partial<JudgeStep>): void => {
    session = {
      ...session,
      judgeStep: { ...session.judgeStep, ...patch }
    };
    callbacks.onUpdate(session);
  };

  const checkCancelled = (): boolean => {
    if (callbacks.isCancelled() || state.cancelled) {
      cleanup(state);
      return true;
    }
    return false;
  };

  const agentKeys = session.agentsUsed;

  try {
    if (checkCancelled()) return;

    // Step 1: Open all agent tabs in parallel
    const agentTabResults = await Promise.all(
      agentKeys.map((key) =>
        openTabAndListenForReady(
          getSupportedApp(key).newChatUrl,
          timeouts.tabLoadMs,
          timeouts.contentReadyMs,
          key
        ).catch(() => null)
      )
    );

    if (checkCancelled()) return;

    agentKeys.forEach((key, i) => {
      const result = agentTabResults[i];
      if (result?.tabId != null) {
        state.agentTabIds.set(key, result.tabId);
      }
    });

    // Track first agent URL for agentTabUrl
    const firstLoaded = agentTabResults.find((r) => r?.tabUrl);
    if (firstLoaded) {
      session = update({ agentTabUrl: firstLoaded.tabUrl ?? null });
    }

    // Step 2: For each agent, check readiness and run
    const agentPromises = agentKeys.map(async (key, i) => {
      const result = agentTabResults[i];

      if (!result?.loaded) {
        updateAgent(key, {
          status: "error",
          errorReason: "tab_load_timeout",
          completedAt: Date.now()
        });
        return;
      }

      if (!result?.contentReady) {
        updateAgent(key, {
          status: "error",
          errorReason: "content_script_timeout",
          completedAt: Date.now()
        });
        return;
      }

      if (checkCancelled()) return;

      const tabId = state.agentTabIds.get(key);
      if (tabId == null) {
        updateAgent(key, {
          status: "error",
          errorReason: "tab_load_timeout",
          completedAt: Date.now()
        });
        return;
      }

      updateAgent(key, { status: "injecting", startedAt: Date.now() });

      const adapterResult = await sendAgentRun(key, tabId, session.prompt, timeouts, state);
      if (checkCancelled()) return;

      if (!adapterResult.success) {
        updateAgent(key, {
          status: "error",
          errorReason: adapterResult.errorReason ?? "dom_error",
          completedAt: Date.now()
        });
        return;
      }

      updateAgent(key, {
        status: "done",
        responseText: adapterResult.responseText ?? "",
        completedAt: adapterResult.completedAt ?? Date.now()
      });
    });

    // Step 3: Wait for all agents to complete
    await Promise.all(agentPromises);
    if (checkCancelled()) return;

    // Step 4: Check if any agent succeeded
    const successfulAgents = session.agentResults.filter((r) => r.status === "done");
    if (successfulAgents.length === 0) {
      await finalizeSession(session, callbacks, state);

      // Override status to partial_failure (finalizeSession may set "error")
      session = update({
        status: "partial_failure",
        errorMessage: "All agents failed to produce a response",
        durationMs: Date.now() - session.timestamp
      });

      // Re-save as partial_failure
      const stored: StoredCouncilSession = {
        timestamp: session.timestamp,
        prompt: session.prompt,
        agentsUsed: session.agentsUsed,
        judgeApp: session.judgeApp,
        judgeChatUrl: null,
        agentResults: session.agentResults,
        judgeStep: session.judgeStep,
        agentTabUrl: session.agentTabUrl,
        status: "partial_failure",
        durationMs: session.durationMs,
        judgePrompt: session.judgePrompt,
        errorMessage: session.errorMessage
      };

      await saveSession(stored);
      callbacks.onUpdate(session);
      callbacks.onComplete(session);
      return;
    }

    // Step 5: Build judge prompt from successful agent responses
    const judgePrompt = buildJudgePrompt({
      prompt: session.prompt,
      agentResults: session.agentResults
    });

    session = update({ judgePrompt: judgePrompt.text });

    // Step 6: Open judge tab
    const judgeKey = session.judgeApp;
    const judgeResult = await openTabAndListenForReady(
      getSupportedApp(judgeKey).newChatUrl,
      timeouts.tabLoadMs,
      timeouts.contentReadyMs,
      judgeKey
    ).catch(() => null);

    if (checkCancelled()) return;

    state.judgeTabId = judgeResult?.tabId ?? null;

    if (!judgeResult?.loaded) {
      updateJudge({
        status: "error",
        errorReason: "tab_load_timeout",
        startedAt: Date.now(),
        completedAt: Date.now()
      });
      await finalizeSession(session, callbacks, state);
      return;
    }

    if (!judgeResult?.contentReady) {
      updateJudge({
        status: "error",
        errorReason: "content_script_timeout",
        startedAt: Date.now(),
        completedAt: Date.now()
      });
      await finalizeSession(session, callbacks, state);
      return;
    }

    if (checkCancelled()) return;

    updateJudge({ status: "injecting", startedAt: Date.now() });

    const judgeSendResult = state.judgeTabId != null
      ? await sendJudgeRun(judgeKey, state.judgeTabId, judgePrompt.text, timeouts, state)
      : { sent: false, errorReason: "tab_load_timeout" as const };
    if (checkCancelled()) return;

    if (!judgeSendResult.sent) {
      updateJudge({
        status: "error",
        errorReason: judgeSendResult.errorReason ?? "send_failed",
        completedAt: Date.now()
      });
      await finalizeSession(session, callbacks, state);
      return;
    }

    updateJudge({ status: "sent", completedAt: Date.now() });

    // Step 7: Capture judge URL
    const judgeUrl = state.judgeTabId != null
      ? await captureJudgeUrl(state.judgeTabId, getSupportedApp(judgeKey).newChatUrl, timeouts.urlCaptureMs, state)
      : null;
    if (checkCancelled()) return;

    session = update({ judgeChatUrl: judgeUrl });
    await finalizeSession(session, callbacks, state);
  } catch (error) {
    session = update({
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unexpected error",
      durationMs: Date.now() - session.timestamp
    });
    callbacks.onComplete(session);
  } finally {
    cleanup(state);
  }
}

async function sendAgentRun(
  appKey: AppKey,
  tabId: number,
  prompt: string,
  timeouts: AutomationTimeouts,
  state: ActiveRunState
): Promise<AdapterResult> {
  const selectors = loadSelectorConfig(appKey).selectors;

  return new Promise<AdapterResult>((resolve) => {
    const timer = setTimeout(() => {
      removeMessageListener();
      resolve({ success: false, errorReason: "timeout" });
    }, timeouts.responseWaitMs);

    const listener = (message: ContentToBgMessage, sender: Browser.runtime.MessageSender) => {
      if (message.type === "ADAPTER_RESULT" && message.appKey === appKey && sender.tab?.id === tabId) {
        clearTimeout(timer);
        removeMessageListener();
        resolve(message.result);
      }
    };

    const removeMessageListener = (): void => {
      browser.runtime.onMessage.removeListener(listener);
      state.messageListeners = state.messageListeners.filter((fn) => fn !== removeMessageListener);
    };

    state.messageListeners.push(removeMessageListener);
    browser.runtime.onMessage.addListener(listener);

    const bgMessage: BgToContentMessage = {
      type: "AGENT_RUN",
      appKey,
      prompt,
      selectors
    };

    void browser.tabs.sendMessage(tabId, bgMessage).catch(() => {
      clearTimeout(timer);
      removeMessageListener();
      resolve({ success: false, errorReason: "content_script_timeout" });
    });
  });
}

async function sendJudgeRun(
  appKey: AppKey,
  tabId: number,
  prompt: string,
  timeouts: AutomationTimeouts,
  state: ActiveRunState
): Promise<SendConfirmationResult> {
  const selectors = loadSelectorConfig(appKey).selectors;

  return new Promise<SendConfirmationResult>((resolve) => {
    const timer = setTimeout(() => {
      removeMessageListener();
      resolve({ sent: false, errorReason: "timeout" });
    }, timeouts.responseWaitMs);

    const listener = (message: ContentToBgMessage, sender: Browser.runtime.MessageSender) => {
      if (message.type === "SEND_CONFIRMED" && message.appKey === appKey && sender.tab?.id === tabId) {
        clearTimeout(timer);
        removeMessageListener();
        resolve(message.result);
      }
    };

    const removeMessageListener = (): void => {
      browser.runtime.onMessage.removeListener(listener);
      state.messageListeners = state.messageListeners.filter((fn) => fn !== removeMessageListener);
    };

    state.messageListeners.push(removeMessageListener);
    browser.runtime.onMessage.addListener(listener);

    const bgMessage: BgToContentMessage = {
      type: "JUDGE_RUN",
      appKey,
      prompt,
      selectors
    };

    void browser.tabs.sendMessage(tabId, bgMessage).catch(() => {
      clearTimeout(timer);
      removeMessageListener();
      resolve({ sent: false, errorReason: "content_script_timeout" });
    });
  });
}

async function captureJudgeUrl(
  tabId: number,
  newChatUrl: string,
  timeoutMs: number,
  state: ActiveRunState
): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    let settled = false;

    const finish = (url: string | null): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      browser.tabs.onUpdated.removeListener(listener);
      state.tabListeners = state.tabListeners.filter((fn) => fn !== removeListener);
      resolve(url);
    };

    const removeListener = (): void => {
      browser.tabs.onUpdated.removeListener(listener);
    };

    const timer = setTimeout(() => {
      void browser.tabs.get(tabId).then((tab) => {
        const currentUrl = tab.url ?? "";
        if (currentUrl && currentUrl !== newChatUrl && !isNewChatUrl(currentUrl, newChatUrl)) {
          finish(currentUrl);
        } else {
          finish(null);
        }
      }).catch(() => finish(null));
    }, timeoutMs);

    const listener = (
      updatedTabId: number,
      changeInfo: Browser.tabs.OnUpdatedInfo,
      updatedTab: Browser.tabs.Tab
    ) => {
      if (updatedTabId === tabId && changeInfo.url) {
        const url = changeInfo.url;
        if (!isNewChatUrl(url, newChatUrl)) {
          finish(url);
        }
      }
    };

    state.tabListeners.push(removeListener);
    browser.tabs.onUpdated.addListener(listener);
  });
}

function isNewChatUrl(url: string, newChatUrl: string): boolean {
  if (url === newChatUrl) return true;
  try {
    const parsed = new URL(url);
    const newParsed = new URL(newChatUrl);
    return parsed.origin === newParsed.origin && parsed.pathname === newParsed.pathname && !parsed.search;
  } catch {
    return false;
  }
}

async function finalizeSession(
  session: ActiveCouncilSession,
  callbacks: CouncilRunnerCallbacks,
  state: ActiveRunState
): Promise<void> {
  const durationMs = Date.now() - session.timestamp;
  const anyAgentDone = session.agentResults.some((r) => r.status === "done");
  const judgeSent = session.judgeStep.status === "sent";

  let status: ActiveCouncilSession["status"];
  if (judgeSent) {
    status = session.judgeChatUrl ? "done" : "partial";
  } else if (anyAgentDone) {
    status = "partial_failure";
  } else {
    status = "error";
  }

  const finalSession: ActiveCouncilSession = {
    ...session,
    status,
    durationMs
  };

  const stored: StoredCouncilSession = {
    timestamp: finalSession.timestamp,
    prompt: finalSession.prompt,
    agentsUsed: finalSession.agentsUsed,
    judgeApp: finalSession.judgeApp,
    judgeChatUrl: finalSession.judgeChatUrl,
    agentResults: finalSession.agentResults,
    judgeStep: finalSession.judgeStep,
    agentTabUrl: finalSession.agentTabUrl,
    status: finalSession.status,
    durationMs: finalSession.durationMs,
    judgePrompt: finalSession.judgePrompt,
    errorMessage: finalSession.errorMessage
  };

  await saveSession(stored);
  callbacks.onUpdate(finalSession);
  callbacks.onComplete(finalSession);
}

function cleanup(state: ActiveRunState): void {
  state.timers.forEach((t) => clearTimeout(t));
  state.timers = [];
  state.tabListeners.forEach((fn) => fn());
  state.tabListeners = [];
  state.messageListeners.forEach((fn) => fn());
  state.messageListeners = [];
}
