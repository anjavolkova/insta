const assert = require("assert");
const { isAllowedPath, isAllowedMove } = require("./extension/rules.js");

const allowed = ["/direct/inbox/", "/direct/inbox", "/direct/t/12345/", "/direct/requests/",
  "/direct/new/", "/direct", "/accounts/login/", "/accounts/login", "/challenge/abc/"];
const blocked = ["/", "/explore/", "/reels/", "/reel/abc/", "/p/abc/", "/stories/someone/1/",
  "/someuser/", "/directx/", "/accountsfoo/"];
for (const p of allowed) assert.ok(isAllowedPath(p), "should allow " + p);
for (const p of blocked) assert.ok(!isAllowedPath(p), "should block " + p);

const moves = [
  // [from, to, allowed?]
  ["/direct/t/1/", "/p/ABC/", true],
  ["/direct/t/1/", "/reel/ABC/", true],
  ["/direct/t/1/", "/reels/ABC/", true],
  ["/direct/t/1/", "/someone/p/ABC/", true],
  ["/direct/t/1/", "/someone/reel/ABC/", true],
  ["/p/ABC/", "/p/ABC/comments/", true],     // same post
  ["/p/ABC/", "/direct/t/1/", true],         // back to DMs
  ["/p/ABC/", "/p/XYZ/", false],             // hop to another post
  ["/reel/ABC/", "/reel/XYZ/", false],       // scroll to next reel
  ["/reels/ABC/", "/reels/XYZ/", false],
  ["/p/ABC/", "/someone/", false],           // profile
  ["/direct/t/1/", "/reels/", false],        // Reels tab
  ["/direct/t/1/", "/someone/", false],
  ["/direct/t/1/", "/explore/", false],
  ["/", "/p/ABC/", false],
  [null, "/p/ABC/", false],                  // typed URL, no origin
  [null, "/direct/inbox/", true],
  ["/explore/", "/reel/ABC/", false],
];
for (const [a, b, ok] of moves) {
  assert.strictEqual(isAllowedMove(a, b), ok, `${a} -> ${b} should be ${ok ? "allowed" : "blocked"}`);
}
console.log("all", allowed.length + blocked.length + moves.length, "cases pass");

// ---- Reddit ----
const { redditThreadKey, isAllowedRedditLoad, redditThreadWindow } = require("./extension/rules.js");

assert.strictEqual(redditThreadKey("/r/foo/comments/abc123/some_title/"), "reddit:abc123");
assert.strictEqual(redditThreadKey("/r/foo/comments/ABC123"), "reddit:abc123");
assert.strictEqual(redditThreadKey("/comments/abc123/"), "reddit:abc123");
assert.strictEqual(redditThreadKey("/user/bob/comments/abc123/x/"), "reddit:abc123");
assert.strictEqual(redditThreadKey("/r/foo/comments/abc123/title/def456/"), "reddit:abc123"); // comment permalink
for (const p of ["/", "/r/foo/", "/r/popular/", "/r/all/", "/user/bob/", "/search/?q=x", "/r/foo/top/"]) {
  assert.strictEqual(redditThreadKey(p), null, p);
}

const T = "/r/foo/comments/abc123/title/";
const loads = [
  // [came from, path, allowed?]
  ["https://www.google.com/search?q=x", T, true],
  [null, T, true],                                           // pasted link / another app
  ["https://duckduckgo.com/", "/r/foo/s/AbCd123", true],     // share link from outside
  ["https://www.reddit.com/r/foo/comments/abc123/title/", T, true],               // reload
  ["https://old.reddit.com/r/foo/comments/abc123/title/", T + "def456/", true],  // comment link
  ["https://www.reddit.com/r/foo/comments/abc123/title/", "/r/foo/comments/zzz999/other/", false], // hop
  ["https://www.reddit.com/", T, false],                     // from front page
  ["https://www.reddit.com/r/foo/", T, false],               // from a subreddit
  ["https://www.google.com/", "/", false],                   // front page
  ["https://www.google.com/", "/r/foo/", false],             // subreddit from outside
  [null, "/r/popular/", false],
  ["https://www.reddit.com/r/foo/comments/abc123/t/", "/r/foo/s/AbCd123", false], // share link inside reddit
];
for (const [from, path, ok] of loads) {
  assert.strictEqual(isAllowedRedditLoad(from, path), ok, `${from} -> ${path}`);
}

const MIN = 60000;
assert.deepStrictEqual(redditThreadWindow(undefined, 0), { state: "new" });
assert.deepStrictEqual(redditThreadWindow(0, 4 * MIN), { state: "open", expiresAt: 5 * MIN });
assert.deepStrictEqual(redditThreadWindow(0, 5 * MIN), { state: "cooldown", until: 65 * MIN });
assert.deepStrictEqual(redditThreadWindow(0, 64 * MIN), { state: "cooldown", until: 65 * MIN });
assert.deepStrictEqual(redditThreadWindow(0, 65 * MIN), { state: "new" });
console.log("reddit cases pass");
