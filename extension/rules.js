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

// ---------------------------------------------------------------- Reddit ---
// Reddit is blocked except for a single thread opened from a link outside
// Reddit (a Google result, a link in a chat). Each thread gets a few minutes,
// then it's locked for a while.
var REDDIT_THREAD_MINUTES = 5;
var REDDIT_COOLDOWN_MINUTES = 60;

var REDDIT_HOST_RE = /(^|\.)reddit\.com$/i;
// /r/sub/comments/ID/..., /comments/ID/..., /user/name/comments/ID/...
var REDDIT_THREAD_RE = /^\/(?:(?:r|u|user)\/[^\/]+\/)?comments\/([a-z0-9]+)(?:\/|$)/i;
// Share links (/r/sub/s/CODE) redirect to a thread.
var REDDIT_SHARE_RE = /^\/r\/[^\/]+\/s\/[A-Za-z0-9]+\/?$/;

function redditThreadKey(pathname) {
  var m = REDDIT_THREAD_RE.exec(pathname);
  return m ? "reddit:" + m[1].toLowerCase() : null;
}

function isRedditHost(hostname) {
  return REDDIT_HOST_RE.test(hostname);
}

// prevUrl: the page the navigation came from (null if unknown, e.g. typed,
// opened from another app, or restored). Returns true if it may load.
function isAllowedRedditLoad(prevUrl, pathname) {
  var key = redditThreadKey(pathname);
  if (!key && !REDDIT_SHARE_RE.test(pathname)) return false; // not a thread
  var prev = null;
  try { prev = prevUrl ? new URL(prevUrl) : null; } catch (e) {}
  if (!prev || !isRedditHost(prev.hostname)) return true; // came from outside
  // Came from Reddit itself: only OK if it's the same thread (reload, comment link).
  return key !== null && redditThreadKey(prev.pathname) === key;
}

// Where a thread stands, given when it was first opened.
function redditThreadWindow(firstOpened, now) {
  var open = REDDIT_THREAD_MINUTES * 60000;
  var cool = REDDIT_COOLDOWN_MINUTES * 60000;
  if (firstOpened == null || now >= firstOpened + open + cool) return { state: "new" };
  if (now < firstOpened + open) return { state: "open", expiresAt: firstOpened + open };
  return { state: "cooldown", until: firstOpened + open + cool };
}

if (typeof module !== "undefined") {
  module.exports.redditThreadKey = redditThreadKey;
  module.exports.isAllowedRedditLoad = isAllowedRedditLoad;
  module.exports.redditThreadWindow = redditThreadWindow;
  module.exports.REDDIT_THREAD_MINUTES = REDDIT_THREAD_MINUTES;
  module.exports.REDDIT_COOLDOWN_MINUTES = REDDIT_COOLDOWN_MINUTES;
}
