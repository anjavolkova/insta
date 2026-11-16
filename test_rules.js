const assert = require("assert");
const { isAllowedPath } = require("./extension/rules.js");

const allowed = ["/direct/inbox/", "/direct/inbox", "/direct/t/12345/", "/direct/requests/",
  "/direct/new/", "/direct", "/accounts/login/", "/accounts/login", "/challenge/abc/"];
const blocked = ["/", "/explore/", "/reels/", "/reel/abc/", "/p/abc/", "/stories/someone/1/",
  "/someuser/", "/directx/", "/accountsfoo/"];

for (const p of allowed) assert.ok(isAllowedPath(p), "should allow " + p);
for (const p of blocked) assert.ok(!isAllowedPath(p), "should block " + p);
console.log("all", allowed.length + blocked.length, "cases pass");
