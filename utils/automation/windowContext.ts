import { browser } from "wxt/browser";
import type { AppKey } from "../types";
import { getSupportedApp } from "../appRegistry";

/**
 * Resolve the active Chrome window that most likely hosts the extension side panel.
 * Uses the last-focused window first, then falls back to the current window.
 */
export async function getActiveWindowId(): Promise<number | null> {
  try {
    const window = await browser.windows.getLastFocused();
    if (window.id != null) {
      return window.id;
    }
  } catch {
    // ignore and fall back
  }

  try {
    const current = await browser.windows.getCurrent();
    if (current.id != null) {
      return current.id;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Return the active tab of the given window and whether its hostname matches
 * the app key's domain.
 */
export async function findMatchingTabInWindow(
  windowId: number,
  appKey: AppKey
): Promise<{ tabId: number | null; tabUrl: string | null; matches: boolean }> {
  const app = getSupportedApp(appKey);
  const domain = app.domain;

  try {
    const tabs = await browser.tabs.query({ windowId, active: true });
    const activeTab = tabs[0];
    if (!activeTab) {
      return { tabId: null, tabUrl: null, matches: false };
    }

    const tabUrl = activeTab.url ?? null;
    const tabId = activeTab.id ?? null;
    const matches = tabUrl ? isMatchingDomain(tabUrl, domain) : false;

    return { tabId, tabUrl, matches };
  } catch {
    return { tabId: null, tabUrl: null, matches: false };
  }
}

/**
 * Return the active tab ID of the given window, or null if unavailable.
 */
export async function getActiveTabIdInWindow(windowId: number): Promise<number | null> {
  try {
    const tabs = await browser.tabs.query({ windowId, active: true });
    return tabs[0]?.id ?? null;
  } catch {
    return null;
  }
}

function isMatchingDomain(url: string, domain: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}
