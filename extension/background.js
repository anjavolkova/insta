// Catches full page loads (typing a URL, opening a link, refreshing).
// In-page navigation (clicking around without a reload) is handled by the
// content scripts.

function originOf(details) {
  return details.originUrl || null;
}

function blockedPage(params) {
  return browser.runtime.getURL("blocked.html") + "?" + new URLSearchParams(params);
}

// ---- Reddit thread timers (kept across browser restarts) ----
var threads = {}; // key -> time first opened (ms)
var ready = browser.storage.local.get("threads").then(function (r) {
  threads = (r && r.threads) || {};
  var now = Date.now();
  Object.keys(threads).forEach(function (k) {
    if (redditThreadWindow(threads[k], now).state === "new") delete threads[k];
  });
});

function threadStatus(key) {
  var now = Date.now();
  var w = redditThreadWindow(threads[key], now);
  if (w.state === "new") {
    threads[key] = now;
    browser.storage.local.set({ threads: threads });
    w = redditThreadWindow(now, now);
  }
  return w;
}

browser.runtime.onMessage.addListener(function (msg) {
  if (msg && msg.type === "reddit-thread" && typeof msg.key === "string") {
    return ready.then(function () { return threadStatus(msg.key); });
  }
});

// ---- Instagram ----
browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    var url = new URL(details.url);
    var prevPath = null;
    var origin = originOf(details);
    if (origin) {
      var o = new URL(origin);
      if (/(^|\.)instagram\.com$/.test(o.hostname)) prevPath = o.pathname;
    }
    if (isAllowedMove(prevPath, url.pathname)) return {};
    if (details.type === "main_frame") return { redirectUrl: url.origin + DM_HOME };
    return { cancel: true }; // embedded Instagram iframes on other sites
  },
  {
    urls: ["*://instagram.com/*", "*://*.instagram.com/*"],
    types: ["main_frame", "sub_frame"],
  },
  ["blocking"]
);

// ---- Reddit ----
browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    var url = new URL(details.url);
    if (!isAllowedRedditLoad(originOf(details), url.pathname)) {
      return { redirectUrl: blockedPage({ reason: "reddit" }) };
    }
    var key = redditThreadKey(url.pathname);
    if (!key) return {}; // share link; the thread it redirects to gets checked
    return ready.then(function () {
      var w = threadStatus(key);
      if (w.state === "cooldown") {
        return { redirectUrl: blockedPage({ reason: "time", until: w.until }) };
      }
      return {};
    });
  },
  {
    urls: ["*://reddit.com/*", "*://*.reddit.com/*"],
    types: ["main_frame"],
  },
  ["blocking"]
);
