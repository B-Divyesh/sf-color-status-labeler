# Polish 3 — complete repair map

Reviewed candidate: `46d0395adb0fb703719285eb16d72f1c94e497ae`  
Repair commit: `05e1c5a90bce99b7a1729c0b57025f8e85e1941e`  
Deployed production URL: <https://color-status-labeler.sociobot.in/>

All findings in `review-1.md`, `review-2.md`, and `review-3.md` were
rechecked. Evidence below names the test or live check that establishes the
result; screenshots are retained in `.factory/polish-3-artifacts/`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Every page `h1` remains focusable; same-site navigation and Back focus it and announce the route. | `route navigation and Back place focus on the destination heading and announce it`; live `npm run verify:browser`. |
| F-1-2 | README opening remains two short sentences. | `.factory/copy-audit.md`; clean-clone `npm run lint`. |
| F-1-3 | README deployment copy remains short and now uses the deployed result rather than host jargon. | `.factory/copy-audit.md`; `@claim:static-build-output`. |
| F-1-4 | The preview label is **Sample dashboard preview**. | [live-home-1280.png](polish-3-artifacts/live-home-1280.png); live `/`. |
| F-1-5 | The setup section is **Set up a status label**. | `@claim:color-vision-audience`; live `/`. |
| F-1-6 | Step 2 is **Choose a label and pattern**. | `@claim:core-labeling`; live `/`. |
| F-1-7 | Step 3 is **Read labeled matching statuses**. | `@claim:core-labeling`; live `/`. |
| F-1-8 | The limit stamp is **COLOR-MATCHING LIMITS**. | [live-home-1280.png](polish-3-artifacts/live-home-1280.png); live `/`. |
| F-1-9 | The limit heading is **Limits of color matching**. | `@claim:color-matching-limits`; live `/`. |
| F-1-10 | The preview instruction is **Turn labels on or off**. | `@claim:color-vision-audience`; live `/`. |
| F-1-11 | User copy says visible colors; style-property behavior is tested for background, top border, and text. | `@claim:picker-style-properties`; README audit. |
| F-1-12 | Copy says badges do not block clicks. | `@claim:click-through`. |
| F-1-13 | Grayscale copy is declared and checked with distinct words and patterns. | `@claim:grayscale-legibility`. |
| F-1-14 | Public runtime requests stay same-origin and set no cookies. | `@claim:site-runtime-privacy`; live `npm run verify:browser`. |
| F-1-15 | Compact navigation says **Download extension**. | [live-home-390.png](polish-3-artifacts/live-home-390.png); live 390 px check. |
| F-2-1 | The primary demo action and outcome remain inside 1280 × 720 and 1365 × 768 cold viewports. | `@claim:first-screen-demo`; [live-home-1280.png](polish-3-artifacts/live-home-1280.png). |
| F-2-2 | The picker capability is in `claims.json` and checks visible background, top-border, and text colors. | `@claim:picker-style-properties`. |
| F-2-3 | The matching-limit claim is declared and now waits for the content receiver before **both** picker starts. | `@claim:color-matching-limits` passed five successive fresh profiles and once from the clean clone. |
| F-2-4 | Static deployment behavior is declared; its test now loads every direct route, the custom 404, service worker, archive, and cache policy. | `@claim:static-build-output`; live `npm run verify:deployment`. |
| F-2-5 | The navigation link is **Color-matching limits**. | live `npm run verify:browser`. |
| F-2-6 | The feature section is **How labels stay readable and local**. | live `npm run verify:browser`. |
| F-2-7 | The feature heading is **Does not change page controls**. | live `npm run verify:browser`. |
| F-2-8 | The README safety instruction uses plain words. | `.factory/copy-audit.md`; clean-clone `npm run lint`. |
| F-3-1 | Replaced “trained status” with **labeled status**. | [live-home-1280.png](polish-3-artifacts/live-home-1280.png); `@claim:core-labeling`. |
| F-3-2 | Replaced “source system” with **original dashboard or map** on landing and terms. | [live-home-1280.png](polish-3-artifacts/live-home-1280.png); `.factory/copy-audit.md`. |
| F-3-3 | Replaced every abstract footer description with **Adds words and patterns to color-only dashboard statuses**. | [live-home-390.png](polish-3-artifacts/live-home-390.png); `@claim:core-labeling`. |
| F-3-4 | Rewrote install/cache wording as **downloaded extension ZIP** and **new download URL**. | `@claim:download-extension`; `@claim:cache-freshness`; README audit. |
| F-3-5 | Rewrote deployment wording as the working download, offline guide, page URLs, and custom not-found page. | `@claim:static-build-output`; live `npm run verify:deployment`. |
| F-3-6 | Removed the unlisted Shadow DOM implementation promise. README now states the already-tested visible-color and unchanged-controls outcomes. | `@claim:picker-style-properties`; `@claim:page-unchanged`; `@claim:extension-runtime-privacy`. |

## Public-claim coverage

`.factory/claims.json` has 22 entries, each with exactly one
`@claim:<id>` test. The new `release-identity` claim verifies the public
version and original-artwork disclosure against the shipped hero asset,
`package.json`, design record, and prompt sidecar. The refreshed
`cache-freshness` and `static-build-output` entries match the new plain
README copy. The claim-tag count is enforced by the clean-clone check.

## Verification and live recheck

- Fresh clone: `/tmp/color-status-labeler-polish3.KaCxYz/repo` at
  `05e1c5a`; `npm ci`, `npm run typecheck`, `npm run lint`, and `npm run build`
  passed. The build created `dist/site/` and
  `color-status-labeler-chrome-340e9a19f896f840.zip`.
- Every one of the 22 literal commands from `claims.json` passed in that
  clean clone; the full suite then passed 4 Vitest assertions and 26
  Playwright tests.
- The repaired matching-limit claim additionally passed five consecutive
  fresh-profile local runs before clean-clone verification.
- Production deployment used `swa deploy dist/site --env production` to the
  scoped `sf-color-status-labeler` resource. `npm run verify:deployment` and
  `npm run verify:browser` pass against production.
- `/opt/fleet/lib/verify-url.sh https://color-status-labeler.sociobot.in
  .factory/polish-3-artifacts` passed: title, `lang`, one `h1`, `main`, alt
  text, labels, no console errors on normal routes, and 744 ms response in its
  report. Playwright Axe checks passed on home, demo, privacy, terms, and 404.
- Cold live checks: home at 390 × 844 and 1280 × 720, demo at 390 × 844, and
  an unknown route at 1280 × 720. The unknown route returns HTTP 404 with the
  designed page; `?demo=1` opens `/demo/`, shows the persistent banner and
  reset controls, and **Start for real** clears the demo key and returns home.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 70 ms, CLS 0. The report is
  `polish-3-artifacts/lighthouse-live.json`.

No finding remains open.
