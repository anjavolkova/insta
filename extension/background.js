// Catches full page loads (typing a URL, opening a link, refreshing).
// In-app navigation (clicking around without a reload) is handled by content.js.
browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    var url = new URL(details.url);
    if (isAllowedPath(url.pathname)) return {};

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
