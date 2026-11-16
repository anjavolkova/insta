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
