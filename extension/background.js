// Catches full page loads (typing a URL, opening a link, refreshing).
// In-app navigation (clicking around without a reload) is handled by content.js.
browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    var url = new URL(details.url);

    // Where the load came from, if it came from an Instagram page
    // (e.g. middle-clicking a shared post in a DM to open a new tab).
    var prevPath = null;
    if (details.originUrl) {
      var origin = new URL(details.originUrl);
      if (/(^|\.)instagram\.com$/.test(origin.hostname)) prevPath = origin.pathname;
    }

    if (isAllowedMove(prevPath, url.pathname)) return {};

    if (details.type === "main_frame") {
      return { redirectUrl: url.origin + DM_HOME };
    }
    return { cancel: true }; // embedded Instagram iframes on other sites
  },
  {
    urls: ["*://instagram.com/*", "*://*.instagram.com/*"],
    types: ["main_frame", "sub_frame"],
  },
  ["blocking"]
);
