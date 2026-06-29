import { loadSelectorConfig } from "./selectorConfig";
import type { ReadinessResult, SelectorGroup } from "./types";
import { LOGIN_URL_PATTERNS } from "./types";
import type { AppKey } from "../types";

export interface ReadinessOptions {
  graceMs?: number;
  pollIntervalMs?: number;
}

const DEFAULT_READINESS_OPTIONS: Required<ReadinessOptions> = {
  graceMs: 10_000,
  pollIntervalMs: 500
};

export async function checkReadiness(
  appKey: AppKey,
  selectorsOverride?: SelectorGroup,
  options?: ReadinessOptions
): Promise<ReadinessResult> {
  let selectors: SelectorGroup;

  try {
    const config = loadSelectorConfig(appKey);
    selectors = selectorsOverride ?? config.selectors;
  } catch (error) {
    return {
      ready: false,
      errorReason: error instanceof Error ? error.message : "config_error"
    };
  }

  const { graceMs, pollIntervalMs } = { ...DEFAULT_READINESS_OPTIONS, ...options };
  const deadline = Date.now() + graceMs;

  while (Date.now() < deadline) {
    const input = queryOrderedSelectors(selectors.input);

    if (input) {
      return { ready: true };
    }

    await sleep(pollIntervalMs);
  }

  const loginError = detectLoginState(appKey);
  if (loginError) {
    return { ready: false, errorReason: loginError };
  }

  return { ready: false, errorReason: "dom_error" };
}

export function queryOrderedSelectors(selectors: string[]): Element | null {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    } catch {
      // Invalid selector — skip to next in priority order.
    }
  }
  return null;
}

function detectLoginState(appKey: AppKey): string | null {
  const patterns = LOGIN_URL_PATTERNS[appKey] ?? [];
  const url = window.location.href;
  const path = window.location.pathname + window.location.search;

  for (const pattern of patterns) {
    if (url.includes(pattern) || path.includes(pattern)) {
      return "not_logged_in";
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
