// Shared by background.js and content.js.

// Paths that are always allowed. If Instagram makes you do some login or
// verification step that keeps bouncing you to the inbox, add its prefix here.
var ALLOWED_PREFIXES = [
  "/direct/",        // inbox, threads (/direct/t/...), message requests, new message
  "/accounts/",      // login, logout, 2FA, password reset, settings
  "/challenge/",     // "confirm it's you" security checks
  "/auth_platform/", // verification code entry
];

var DM_HOME = "/direct/inbox/";

// A single post or reel: /p/ID/, /reel/ID/, /reels/ID/, optionally
// prefixed by a username (/someone/p/ID/). The bare Reels tab (/reels/) is
// not matched.
var ITEM_RE = /^\/(?:[^\/]+\/)?(p|reels?)\/([A-Za-z0-9_-]+)(?:\/|$)/;

function withSlash(pathname) {
  return pathname.endsWith("/") ? pathname : pathname + "/";
}

function isDmPath(pathname) {
  return withSlash(pathname).startsWith("/direct/");
}

function isAllowedPath(pathname) {
  var p = withSlash(pathname);
  return ALLOWED_PREFIXES.some(function (prefix) {
    return p.startsWith(prefix);
  });
}

// Returns an id like "p:ABC123" for a single post/reel, or null.
function itemKey(pathname) {
  var m = ITEM_RE.exec(pathname);
  if (!m) return null;
  var type = m[1] === "p" ? "p" : "reel";
  return type + ":" + m[2];
}

// Decide whether moving from prevPath to nextPath is allowed.
// Posts/reels are only OK when opened straight from DMs (or when staying on
// the same post, e.g. opening its comments). Hopping post-to-post is not.
function isAllowedMove(prevPath, nextPath) {
  if (isAllowedPath(nextPath)) return true;
  var next = itemKey(nextPath);
  if (!next) return false;
  if (prevPath == null) return false;
  return isDmPath(prevPath) || itemKey(prevPath) === next;
}

if (typeof module !== "undefined") {
  module.exports = {
    isAllowedPath: isAllowedPath,
    isAllowedMove: isAllowedMove,
    itemKey: itemKey,
    DM_HOME: DM_HOME,
  };
}
