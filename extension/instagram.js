// Instagram is a single-page app: clicking Home/Explore/Reels/a profile/a post
// changes the URL without a page load, so the background script never sees it.
// This watches the URL and kicks you back to the inbox the moment you go
// somewhere that isn't DMs or a post/reel opened from a DM.
(function () {
  // The background script already approved the page we loaded on.
  var prevPath = location.pathname;

  function mark() {
    // Lets hide.css hide "more posts" links while viewing a shared post.
    if (document.documentElement) {
      document.documentElement.dataset.dmsOnly = itemKey(location.pathname) ? "item" : "dm";
    }
  }

  function check() {
    var path = location.pathname;
    if (path === prevPath) return;
    if (isAllowedMove(prevPath, path)) {
      prevPath = path;
      mark();
    } else {
      location.replace(location.origin + DM_HOME);
    }
  }

  mark();
  document.addEventListener("DOMContentLoaded", mark);
  setInterval(check, 150);
  window.addEventListener("popstate", check);
  // Firefox versions with the Navigation API get notified instantly.
  if (window.navigation) {
    window.navigation.addEventListener("navigatesuccess", check);
  }
})();
