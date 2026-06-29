import type { SelectorGroup } from "./types";
import { DEFAULT_AUTOMATION_TIMEOUTS } from "./types";

export function queryFirstSelector(selectors: string[]): Element | null {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) return element;
    } catch {
      // Invalid selector — skip to next in priority order.
    }
  }
  return null;
}

export function isContentEditable(element: HTMLElement): boolean {
  return element.tagName.toLowerCase() === "div" || element.isContentEditable;
}

export function setInputText(element: HTMLElement, text: string): void {
  if (isContentEditable(element)) {
    element.focus();

    // Clear existing content
    element.textContent = "";

    // Method 1: execCommand insertText (best for ProseMirror)
    if (typeof document.execCommand === "function") {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      document.execCommand("insertText", false, text);
    }

    // If execCommand didn't work, fall back to direct manipulation
    if ((element.textContent ?? "").trim() !== text.trim()) {
      element.textContent = text;
      element.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: text,
          inputType: "insertText"
        })
      );
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }
  } else if (element instanceof HTMLTextAreaElement) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    if (setter) {
      setter.call(element, text);
    } else {
      element.value = text;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (element instanceof HTMLInputElement) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (setter) {
      setter.call(element, text);
    } else {
      element.value = text;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

export async function waitForInput(
  selectors: string[],
  timeoutMs = DEFAULT_AUTOMATION_TIMEOUTS.loginGraceMs,
  pollIntervalMs = 500
): Promise<HTMLElement | null> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const element = queryFirstSelector(selectors) as HTMLElement | null;
    if (element && element.offsetParent !== null) {
      return element;
    }
    await sleep(pollIntervalMs);
  }

  // Last try — return even if not visible (might be in a loading state)
  return queryFirstSelector(selectors) as HTMLElement | null;
}

export async function waitForSendButtonEnabled(
  sendSelectors: string[],
  timeoutMs = DEFAULT_AUTOMATION_TIMEOUTS.sendButtonEnableMs,
  pollIntervalMs = DEFAULT_AUTOMATION_TIMEOUTS.sendButtonPollIntervalMs
): Promise<HTMLElement | null> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const button = queryFirstSelector(sendSelectors) as HTMLElement | null;
    if (button && !isDisabled(button)) {
      return button;
    }
    await sleep(pollIntervalMs);
  }

  return null;
}

export function isDisabled(element: HTMLElement): boolean {
  if (
    element.hasAttribute("disabled") ||
    element.getAttribute("aria-disabled") === "true" ||
    (element as HTMLButtonElement).disabled === true
  ) {
    return true;
  }

  const className = typeof element.className === "string" ? element.className : "";
  if (/disabled/i.test(className)) {
    return true;
  }

  return false;
}

export function clickElement(element: HTMLElement): void {
  element.click();
}

export async function waitForElement(
  selectors: string[],
  timeoutMs: number,
  pollIntervalMs = 500
): Promise<Element | null> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const element = queryFirstSelector(selectors);
    if (element) return element;
    await sleep(pollIntervalMs);
  }

  return null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getResponseContainer(responseSelectors: string[]): Element | null {
  return queryFirstSelector(responseSelectors);
}

export function extractTextFromElement(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  clone
    .querySelectorAll(
      "button, [data-testid], .copy-button, [aria-label='Copy'], [role='menu'], script, style, svg"
    )
    .forEach((el) => el.remove());
  return (clone.textContent ?? "").replace(/\s+\n/g, "\n").trim();
}

export function scrollResponseToBottom(container: Element): void {
  const scrollable = findScrollableParent(container);
  if (scrollable) {
    scrollable.scrollTop = scrollable.scrollHeight;
  } else {
    container.scrollTop = container.scrollHeight;
  }
  window.scrollTo(0, document.body.scrollHeight);
}

function findScrollableParent(element: Element): Element | null {
  let current: Element | null = element;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    if (
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

export function checkBlockedState(blockedSelectors: string[] | undefined): boolean {
  if (!blockedSelectors || blockedSelectors.length === 0) return false;
  return queryFirstSelector(blockedSelectors) !== null;
}

export function hasResponseStarted(responseContainer: Element | null): boolean {
  if (!responseContainer) return false;
  const text = responseContainer.textContent ?? "";
  return text.trim().length > 0;
}
