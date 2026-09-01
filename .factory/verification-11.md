# Color Status Labeler — independent verification 11

## Verdict: PASS

Verified on 2026-09-01 UTC for work order
`color-status-labeler-verify-11`.

- Candidate commit: `b896bc646510c0c021a6881311edba5a7b85232e`
- Checkout at start: clean `main` checkout at that exact commit
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>

The candidate satisfies the researched brief and supplied acceptance contract.
The deployed site and extension byte-match the candidate build, the downloaded
extension completes the smallest useful labeling job, and every declared claim
passes from a fresh installation.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Mandatory claims preflight

`.factory/claims.json` exists and contains 17 claims. As the first operation
from the uninstalled clean clone, the first literal command stopped before test
discovery with `vitest: not found`. After the required `npm ci`, which installed
the lockfile with zero reported vulnerabilities, I restarted at the first claim
and ran every listed command independently. All 17 passed:

| Claim | Result |
| --- | --- |
| `color-vision-audience` | PASS |
| `demo-sandbox` | PASS |
| `download-extension` | PASS |
| `cache-freshness` | PASS |
| `free-download` | PASS |
| `no-account` | PASS |
| `site-runtime-privacy` | PASS |
| `backup-transfer` | PASS |
| `rule-deletion` | PASS |
| `page-unchanged` | PASS |
| `extension-runtime-privacy` | PASS |
| `core-labeling` | PASS |
| `grayscale-legibility` | PASS |
| `local-rules` | PASS |
| `click-through` | PASS |
| `rules-return` | PASS |
| `offline-demo` | PASS |

Each claim tag occurs exactly once under `tests/`. A copy check of the landing
page, demo, privacy page, extension popup, and README found the public claims
represented in the manifest.

## Cold first read and one-click demo

PASS. The live first screen says what the product does, who it is for, and what
to select first:

- Job: **“Label color-only dashboard statuses.”**
- Audience: **“For people with color-vision deficiency…”** using dashboard and
  map statuses.
- First action: **“Try it with sample data.”** The adjacent note says it opens a
  sample dispatch board without changing the visitor's rules.

At 390 × 844, the job, audience, sample action, explanatory note, and three
plain facts all fit in the first viewport. The action opens `/demo/` in one
click. The persistent banner says **“Demo — sample data, nothing is saved”**
and includes **Reset demo** and **Start for real**.

## End-to-end behavior and recovery

The downloaded 25,451-byte live archive loaded as Color Status Labeler 1.0.0,
Manifest V3, with only `storage` and `activeTab` permissions. In a fresh
Chromium extension profile on the live sample board, I confirmed:

- Keyboard selection of a recurring status opens the label dialog.
- A 32-character label plus Bars produces matching word-and-pattern badges and
  a compact legend.
- The rule is stored under the current origin in `chrome.storage.local` and
  returns after reload.
- Rendered badges use `pointer-events: none` and do not block page controls.
- A whitespace-only label produces an announced error, marks the input invalid,
  and supports immediate correction.
- Input beyond 32 characters is limited to 32 before saving.
- Escape closes the dialog and restores focus to the selected page control.
- The 390px extension overlay does not introduce horizontal overflow.

Independent live demo checks also confirmed the normal sample update, the
32-character boundary, literal display of markup-like text, safe fallback from
corrupt demo JSON, keyboard reset, and clean exit to the real landing page.
Reset and exit remove `demo:color-status-labeler:sample-v1`; no other storage
key is written.

The complete repository suite additionally confirms popup backup export and
valid import, malformed backup recovery, delete/undo, clear confirmation,
page/form non-interference, local persistence, and grayscale distinction.

## Clean build and deployment identity

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 264 packages installed; 0 vulnerabilities. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS. |
| `npm test` | PASS — 4 Vitest assertions and 19 Playwright tests. |
| `npm run build` | PASS — exact production build created `dist/site/` and the MV3 ZIP. |
| `npm audit --audit-level=critical` | PASS — 0 vulnerabilities. |
| `npm run verify:deployment` | PASS — all deployed pages, assets, worker, and ZIP match `dist/site/`. |
| `npm run verify:browser` | PASS — desktop, 390px mobile, keyboard, Axe, privacy, worker update, and offline shell. |
| `/opt/fleet/lib/verify-url.sh` | PASS — HTTP 200, title, lang, main, image alternatives, and no console errors. |

The live archive SHA-256 is
`0225e2c5ce3d892b9bb9f6ea452dee591fbddb074f99a2b3d05b28f450040f80`.
It matches the candidate archive exactly. The live identity verifier also
byte-compared home, demo, privacy, terms, 404, icons, robots, sitemap, all
assets, the content-addressed download, and `sw.js`.

## Accessibility, mobile, and performance

- Home, demo, privacy, terms, and the designed 404 each have `lang=en`, one
  `h1`, one `main`, ordered headings, route-specific titles, and complete image
  alternatives.
- Playwright Axe found zero serious or critical findings on all five routes.
- The first Tab reaches the skip link. Space operates the status switch.
  Visible focus indicators meet the supplied 3px / 3:1 check, and route/back
  navigation focuses and announces the destination heading.
- Associated labels give the compact switch and radio inputs touch areas of at
  least 44px. Other non-inline mobile controls also meet 44px.
- At 390px, both normal and 200% root text have no horizontal overflow or
  clipped header, main, or footer content.
- `prefers-reduced-motion: reduce` yields no active animation or transition and
  changes scrolling to `auto`.
- Service-worker installation, update, control, and offline reload of the sample
  guide all pass in fresh browser contexts.
- Fresh Lighthouse 12.8.2 mobile result: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; FCP 0.84s, LCP 1.21s, TBT 91ms, CLS 0.
- Initial transfer was 75,439 bytes. Built application JavaScript is 3,804 bytes
  raw / 1.63KB gzip, CSS is 14,963 bytes raw / 4.01KB gzip, and the mobile hero
  is 65,156 bytes. These pass the supplied budgets.

## Privacy, requests, headers, and caching

Browser request logs across home, demo, privacy, terms, 404, and the complete
sample/extension flows contained only
`https://color-status-labeler.sociobot.in`. There were no cookies, third-party
resources, console errors, or page errors. Extension state remained in local
extension storage; demo state remained in its separate namespace.

Live HTML responses include a self-only CSP, `frame-ancestors 'none'`, HSTS,
`X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, and restrictive Permissions Policy. HTML
revalidates after 30 seconds. Hashed JS/CSS and the content-addressed ZIP use
one-year immutable caching; fixed artwork revalidates after 300 seconds;
`sw.js` is `no-cache` with root scope. Every crawled internal link returned
200, and `/404` returned the styled page with HTTP 404.

This product is a static companion site plus a local browser extension. It has
no backend, product-unlock call, payment route, account, or sign-in. Server
allowance / 429, Entra authority, backend concurrency, and SQLite persistence
checks are therefore not applicable. The deterministic labeling job does not
need a runtime AI feature; backup import/export already covers the useful
transfer step implied by the brief.

## Documentation and evidence

The repository includes the product-specific visual system and asset
provenance in `.factory/design.md`, demo isolation documentation, the copy
audit, README run/test/deploy instructions, MIT license, privacy and terms
routes, robots, sitemap, social image, and designed 404.

Fresh committed evidence:

- `.factory/verification-evidence-11/verify.json`
- `.factory/verification-evidence-11/screenshot-desktop.png`
- `.factory/verification-evidence-11/screenshot-mobile.png`
- `.factory/verification-evidence-11/lighthouse-mobile.json`

No product code, deployment, infrastructure, app setting, database, secret, or
out-of-scope service was read or changed during this verification.
