// Instagram is a single-page app: clicking Home/Explore/Reels/a profile/a post
// changes the URL without a page load, so the background script never sees it.
// This watches the URL and kicks you back to the inbox the moment it leaves DMs.
(function () {
  function check() {
    if (!isAllowedPath(location.pathname)) {
      location.replace(location.origin + DM_HOME);
    }
  }

  check();
  setInterval(check, 150);
  window.addEventListener("popstate", check);
  // Firefox versions with the Navigation API get notified instantly.
  if (window.navigation) {
    window.navigation.addEventListener("navigatesuccess", check);
  }
})();
