// Shared by background.js and content.js.
// Any page path NOT starting with one of these prefixes gets sent to the DM inbox.
// If Instagram makes you do some login/verification step that keeps bouncing
// you to the inbox, add its path prefix here.
var ALLOWED_PREFIXES = [
  "/direct/",        // inbox, threads (/direct/t/...), message requests, new message
  "/accounts/",      // login, logout, 2FA, password reset, settings
  "/challenge/",     // "confirm it's you" security checks
  "/auth_platform/", // verification code entry
];

var DM_HOME = "/direct/inbox/";

function isAllowedPath(pathname) {
  // Instagram sometimes drops the trailing slash ("/direct/inbox").
  var p = pathname.endsWith("/") ? pathname : pathname + "/";
  return ALLOWED_PREFIXES.some(function (prefix) {
    return p.startsWith(prefix);
  });
}

if (typeof module !== "undefined") {
  module.exports = { isAllowedPath: isAllowedPath, DM_HOME: DM_HOME };
}
