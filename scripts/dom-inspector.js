// AI Council — DOM Selector Inspector v3
// Paste this entire script into the browser console (F12) on the chat page.
// Prints everything as plain text so you can copy it all.
// Supports: ChatGPT, Claude, Gemini, DeepSeek, Qwen, Kimi

(function () {
  var host = window.location.hostname;
  var APP =
    host.indexOf("chatgpt") >= 0 || host.indexOf("openai") >= 0
      ? "ChatGPT"
      : host.indexOf("claude") >= 0
        ? "Claude"
        : host.indexOf("gemini") >= 0
          ? "Gemini"
          : host.indexOf("deepseek") >= 0
            ? "DeepSeek"
            : host.indexOf("qwen") >= 0
              ? "Qwen"
              : host.indexOf("kimi") >= 0 || host.indexOf("moonshot") >= 0
                ? "Kimi"
                : "Unknown";

  var APP_KEY = {
    ChatGPT: "chatgpt",
    Claude: "claude",
    Gemini: "gemini",
    DeepSeek: "deepseek",
    Qwen: "qwen",
    Kimi: "kimi"
  }[APP] || "unknown";

  var output = [];
  function log(msg) { output.push(msg); console.log(msg); }

  log("");
  log("============================================================");
  log("  AI Council DOM Inspector v3 — " + APP);
  log("  URL: " + window.location.href);
  log("  Date: " + new Date().toISOString());
  log("============================================================");
  log("");

  function describe(el, index, section) {
    var tag = el.tagName.toLowerCase();
    var id = el.id || "";
    var cls = (typeof el.className === "string" ? el.className : "").substring(0, 120);
    var testId = el.getAttribute("data-testid") || "";
    var ariaLabel = el.getAttribute("aria-label") || "";
    var ariaDescription = el.getAttribute("aria-description") || "";
    var role = el.getAttribute("role") || "";
    var contenteditable = el.getAttribute("contenteditable") || "";
    var placeholder = el.getAttribute("placeholder") || "";
    var type = el.getAttribute("type") || "";
    var name = el.getAttribute("name") || "";
    var disabled = el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true";
    var visible = el.offsetParent !== null;
    var text = (el.textContent || "").trim().substring(0, 60);

    var lines = [];
    lines.push("  [" + index + "] <" + tag + ">");
    lines.push("       id=\"" + id + "\"");
    lines.push("       class=\"" + cls + "\"");
    lines.push("       data-testid=\"" + testId + "\"");
    lines.push("       aria-label=\"" + ariaLabel + "\"");
    lines.push("       aria-description=\"" + ariaDescription + "\"");
    lines.push("       role=\"" + role + "\"");
    lines.push("       contenteditable=\"" + contenteditable + "\"");
    lines.push("       placeholder=\"" + placeholder + "\"");
    lines.push("       type=\"" + type + "\"");
    lines.push("       name=\"" + name + "\"");
    lines.push("       disabled=" + disabled + " visible=" + visible);
    lines.push("       text=\"" + text + "\"");

    // Suggested selectors (ordered by specificity/priority)
    var selectors = [];
    if (id) selectors.push(tag + "#" + id);
    if (testId) selectors.push(tag + "[data-testid='" + testId + "']");
    if (ariaLabel) selectors.push(tag + "[aria-label='" + ariaLabel + "']");
    if (ariaDescription) selectors.push(tag + "[aria-description='" + ariaDescription + "']");
    if (contenteditable === "true") selectors.push(tag + "[contenteditable='true']");
    if (placeholder) selectors.push(tag + "[placeholder*='" + placeholder.substring(0, 20) + "']");
    if (role && tag !== "div") selectors.push(tag + "[role='" + role + "']");
    if (type && tag === "button") selectors.push(tag + "[type='" + type + "']");
    if (name) selectors.push(tag + "[name='" + name + "']");
    // Fallback: class-based if nothing better
    if (selectors.length === 0 && cls) {
      var classes = cls.trim().split(/\s+/).filter(function(c) {
        return c.length > 3 && !c.match(/^(active|hover|focus|disabled|selected|open|show|hide|loaded|ready)/);
      }).slice(0, 2);
      if (classes.length > 0) selectors.push(tag + "." + classes.join("."));
    }

    lines.push("       SUGGESTED SELECTORS:");
    for (var i = 0; i < selectors.length; i++) {
      lines.push("         \"" + selectors[i] + "\"");
    }

    return lines.join("\n");
  }

  function printSection(title, els) {
    log("");
    log("--- " + title + " (" + els.length + " found) ---");
    if (els.length === 0) {
      log("  (none found)");
      return;
    }
    for (var i = 0; i < els.length; i++) {
      log(describe(els[i], i, title));
    }
  }

  // === INPUT ===
  // Broadest possible query: any element that could be a text input
  var inputEls = document.querySelectorAll(
    "textarea, div[contenteditable='true'], div[role='textbox'], input[type='text'], " +
    "div[class*='editor'], div[class*='input'], div[class*='prompt'], div[class*='composer']"
  );
  // Filter out tiny/invisible elements and non-input-looking divs
  var inputFiltered = [];
  for (var i = 0; i < inputEls.length; i++) {
    var el = inputEls[i];
    var tag = el.tagName.toLowerCase();
    if (!el.offsetParent && tag !== "textarea") continue;
    if (tag === "div") {
      var cls = (typeof el.className === "string" ? el.className : "");
      var role = el.getAttribute("role") || "";
      var ce = el.getAttribute("contenteditable") || "";
      var ariaInput = el.getAttribute("aria-multiline") || "";
      // Only include divs that look like input areas
      if (!ce && !role && !ariaInput && !cls.match(/editor|input|prompt|composer|chat|textbox/i)) continue;
    }
    inputFiltered.push(el);
  }
  printSection("INPUT (chat input)" + (inputFiltered.length !== inputEls.length ? " — filtered from " + inputEls.length + " candidates" : ""), inputFiltered);

  // === SEND ===
  // Broad: any clickable element that could be a send/submit button
  var sendEls = document.querySelectorAll(
    "button, div[role='button'], a[role='button'], input[type='submit'], input[type='button'], " +
    "button[type='submit'], button[data-testid*='send'], button[data-testid*='Send'], " +
    "button[aria-label*='send'], button[aria-label*='Send'], " +
    "button[aria-label*='Submit'], button[aria-label*='submit'], " +
    "div[data-testid*='send'], div[aria-label*='send'], div[aria-label*='Send']"
  );
  var sendFiltered = [];
  for (var i = 0; i < sendEls.length; i++) {
    var el = sendEls[i];
    var testId = (el.getAttribute("data-testid") || "").toLowerCase();
    var ariaLabel = (el.getAttribute("aria-label") || "").toLowerCase();
    var cls = (typeof el.className === "string" ? el.className : "").toLowerCase();
    var html = (el.innerHTML || "").toLowerCase();
    if (
      testId.indexOf("send") >= 0 ||
      testId.indexOf("submit") >= 0 ||
      testId.indexOf("composer") >= 0 ||
      ariaLabel.indexOf("send") >= 0 ||
      ariaLabel.indexOf("submit") >= 0 ||
      cls.indexOf("send") >= 0 ||
      cls.indexOf("submit") >= 0 ||
      html.indexOf("send") >= 0 ||
      html.indexOf("submit") >= 0 ||
      html.indexOf("arrow_upward") >= 0 ||
      html.indexOf("arrow_forward") >= 0 ||
      html.indexOf(">") <= 5  // tiny content likely icon-only
    ) {
      sendFiltered.push(el);
    }
  }
  if (sendFiltered.length === 0) {
    printSection("SEND (no send-like buttons found — showing ALL buttons / clickables)", sendEls);
  } else {
    printSection("SEND (send button candidates — filtered from " + sendEls.length + " total)", sendFiltered);
  }

  // === STOP ===
  var stopEls = document.querySelectorAll(
    "button[data-testid*='stop'], button[data-testid*='Stop'], " +
    "button[aria-label*='stop'], button[aria-label*='Stop'], " +
    "button[aria-label*='generat'], button[aria-label*='Generat'], " +
    "div[role='button'][aria-label*='stop'], div[role='button'][aria-label*='Stop'], " +
    "div[role='button'][aria-label*='generat'], " +
    "div[class*='stop'], div[class*='Stop'], " +
    "button[class*='stop'], button[class*='Stop'], " +
    "button svg:not([aria-hidden='true']), div[role='button'] svg:not([aria-hidden='true'])"
  );
  var stopFiltered = [];
  for (var i = 0; i < stopEls.length; i++) {
    var el = stopEls[i];
    var testId = (el.getAttribute("data-testid") || "").toLowerCase();
    var ariaLabel = (el.getAttribute("aria-label") || "").toLowerCase();
    var cls = (typeof el.className === "string" ? el.className : "").toLowerCase();
    if (
      testId.indexOf("stop") >= 0 ||
      ariaLabel.indexOf("stop") >= 0 ||
      ariaLabel.indexOf("generat") >= 0 ||
      cls.indexOf("stop") >= 0
    ) {
      stopFiltered.push(el);
    }
  }
  if (stopFiltered.length > 0) {
    printSection("STOP (stop-generation — only visible during generation)", stopFiltered);
  }
  // Also show raw results if filtered nothing but raw found something
  if (stopFiltered.length === 0 && stopEls.length > 0) {
    printSection("STOP (no explicit stop found — showing SVG buttons as candidates)", stopEls);
  } else if (stopFiltered.length === 0) {
    printSection("STOP (stop-generation — only visible during generation)", stopEls);
  }

  // === RESPONSE ===
  var responseEls = document.querySelectorAll(
    "div[data-message-author-role='assistant'], " +
    "div[data-message-author-role], " +
    "div.markdown, div.prose, " +
    "div[class*='markdown'], div[class*='prose'], " +
    "div[class*='assistant'], div[class*='response'], " +
    "div[class*='message'], div[class*='answer'], div[class*='reply'], " +
    "div[class*='turn'], div[class*='chat-bubble'], " +
    "div[class*='conversation'], div[class*='content'], " +
    "div[class*='output'], div[class*='result'], " +
    "div[role='region'][aria-label*='response'], " +
    "div[role='region'][aria-label*='Response'], " +
    "div[role='region'][aria-label*='message'], " +
    "div[role='region'][aria-label*='Message'], " +
    "article, section[class*='message']"
  );
  printSection("RESPONSE (assistant/response containers)", responseEls);

  // === BLOCKED (rate limit / captcha / login walls) ===
  var blockedEls = document.querySelectorAll(
    "div[data-testid*='rate'], div[class*='rate-limit'], div[class*='rate_limit'], " +
    "div[class*='captcha'], iframe[src*='captcha'], iframe[src*='recaptcha'], " +
    "div[class*='limit'], div[class*='error'], " +
    "div[role='alert'], div[aria-live='assertive']"
  );
  printSection("BLOCKED (rate limit / captcha / error banners)", blockedEls);

  // === LOGIN ===
  var loginEls = document.querySelectorAll(
    "a[href*='/auth/login'], a[href*='/auth/signup'], " +
    "a[href*='/login'], a[href*='/sign_in'], a[href*='/sign_up'], " +
    "a[href*='/signin'], a[href*='/signup'], " +
    "a[href*='accounts.google.com'], " +
    "a[aria-label*='login'], a[aria-label*='Login'], " +
    "a[aria-label*='sign in'], a[aria-label*='Sign in']"
  );
  printSection("LOGIN (login/auth links / buttons)", loginEls);

  // === SUMMARY ===
  log("");
  log("============================================================");
  log("  SUMMARY — " + APP);
  log("  Input: " + inputFiltered.length + ", Send: " + sendFiltered.length + ", Stop: " + stopEls.length + ", Response: " + responseEls.length);
  log("  URL: " + window.location.href);
  log("============================================================");
  log("");
  log(">>> Copy everything above (from the === header to here) <<<");
  log("");

  return output.join("\n");
})();
