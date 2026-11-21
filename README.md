# Insta DMs Only (Firefox extension)

## Instagram

Blocks all of Instagram except Direct Messages. Any page that isn't under
`/direct/` (feed, Explore, Reels, Stories, profiles, posts) sends you to
`instagram.com/direct/inbox/`. Login and security-check pages stay reachable
so you can still sign in.

### How it works
- `background.js` redirects full page loads (typed URLs, links, refreshes).
- `instagram.js` catches in-app navigation (Instagram changes the URL without
  reloading) and redirects within ~150 ms.
- `instagram.css` hides nav links to Home/Explore/Reels etc. This part is cosmetic;
  if Instagram changes its markup some links may reappear, but clicking them
  still gets redirected.
- Allowed paths are listed in `extension/rules.js`.

Posts and reels people send you open normally, but only straight from a DM:
moving from one to another post, reel or profile sends you back to the inbox.

## Reddit
Blocked: the front page, subreddits, r/popular, r/all, search, profiles.
Allowed: a single thread you open from a link outside Reddit (a Google result,
a link in a chat), for 5 minutes. A countdown shows in the corner. When it
hits zero the thread is locked for 60 minutes. Clicking from that thread to
another thread or subreddit is blocked. Both times are set at the top of the
Reddit section in `extension/rules.js`.

## Install
**Temporary (removed when Firefox restarts):** go to `about:debugging#/runtime/this-firefox`,
click "Load Temporary Add-on…", pick `extension/manifest.json`.

**Permanent:** regular Firefox only installs signed extensions. Either
- sign it for yourself (free, not published): make an addons.mozilla.org account,
  get API keys, and run
  `npx web-ext sign -s extension --channel unlisted --api-key ... --api-secret ...`,
  then open the resulting `.xpi` in Firefox; or
- use Firefox Developer Edition / Nightly, set `xpinstall.signatures.required`
  to `false` in `about:config`, and install `dist/insta_dms_only-1.2.1.zip`
  via `about:addons` → gear → "Install Add-on From File…".

## Test
`node test_rules.js`
