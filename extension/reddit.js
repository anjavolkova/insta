// Runs on Reddit thread pages. Shows a countdown, ends the visit when time's
// up, and blocks in-page navigation to anything but the same thread.
(function () {
  var blockedUrl = browser.runtime.getURL("blocked.html");
  var key = redditThreadKey(location.pathname);

  function leave(params) {
    location.replace(blockedUrl + "?" + new URLSearchParams(params));
  }

  // Share links redirect server-side, so there's nothing to do on them.
  if (!key) return;

  // Reddit sometimes changes the URL without reloading (clicking a related
  // post, the logo, a subreddit name). Only the same thread is allowed.
  setInterval(function () {
    if (redditThreadKey(location.pathname) !== key) leave({ reason: "reddit" });
  }, 150);

  browser.runtime.sendMessage({ type: "reddit-thread", key: key }).then(function (w) {
    if (w.state !== "open") return leave({ reason: "time", until: w.until });
    startCountdown(w.expiresAt);
  });

  function startCountdown(expiresAt) {
    var badge = document.createElement("div");
    badge.style.cssText =
      "position:fixed;right:16px;bottom:16px;z-index:2147483647;" +
      "padding:6px 10px;border-radius:8px;font:600 14px/1.2 system-ui,sans-serif;" +
      "background:#1a1a1b;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.3);pointer-events:none";

    function tick() {
      var left = expiresAt - Date.now();
      if (left <= 0) {
        return leave({ reason: "time", until: expiresAt + REDDIT_COOLDOWN_MINUTES * 60000 });
      }
      var s = Math.ceil(left / 1000);
      badge.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0") + " left";
      if (!badge.isConnected && document.body) document.body.appendChild(badge);
    }
    tick();
    setInterval(tick, 1000);
  }
})();
