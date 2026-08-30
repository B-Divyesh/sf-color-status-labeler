# Color Status Labeler — independent verification 10

## Verdict: PASS

Verified on 2026-08-30 UTC for work order
`color-status-labeler-verify-10`.

- Candidate commit: `924900e39658132d003f11fd90e986c995ae7b50`
- Checkout at start: clean `main` checkout at that exact commit
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>

The candidate satisfies the researched brief and factory acceptance contract.
The live deployment byte-matches the candidate, the installable extension does
the smallest useful job end to end, all declared claims pass, and no release-
blocking or lower-severity product defect was found.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Mandatory claims preflight

`.factory/claims.json` exists and contains 15 claims. From the clean checkout,
the first literal claim command could not start before dependencies were
installed (`vitest: not found`). This is expected clean-clone setup evidence,
not a product-test failure. After the required `npm ci`, I restarted at claim
1 and ran every literal manifest command independently. All 15 passed.

| Claim | Result | Evidence |
| --- | --- | --- |
| `color-vision-audience` | PASS | `.factory/verification-artifacts/claims/color-vision-audience.log` |
| `demo-sandbox` | PASS | `.factory/verification-artifacts/claims/demo-sandbox.log` |
| `download-extension` | PASS | `.factory/verification-artifacts/claims/download-extension.log` |
| `cache-freshness` | PASS | `.factory/verification-artifacts/claims/cache-freshness.log` |
| `free-download` | PASS | `.factory/verification-artifacts/claims/free-download.log` |
| `no-account` | PASS | `.factory/verification-artifacts/claims/no-account.log` |
| `backup-transfer` | PASS | `.factory/verification-artifacts/claims/backup-transfer.log` |
| `rule-deletion` | PASS | `.factory/verification-artifacts/claims/rule-deletion.log` |
| `page-unchanged` | PASS | `.factory/verification-artifacts/claims/page-unchanged.log` |
| `extension-runtime-privacy` | PASS | `.factory/verification-artifacts/claims/extension-runtime-privacy.log` |
| `core-labeling` | PASS | `.factory/verification-artifacts/claims/core-labeling.log` |
| `local-rules` | PASS | `.factory/verification-artifacts/claims/local-rules.log` |
| `click-through` | PASS | `.factory/verification-artifacts/claims/click-through.log` |
| `rules-return` | PASS | `.factory/verification-artifacts/claims/rules-return.log` |
| `offline-demo` | PASS | `.factory/verification-artifacts/claims/offline-demo.log` |

Each claim tag occurs exactly once in `tests/`. A fresh copy review of the
landing page, extension popup, privacy page, and README found no public claim
outside the manifest. The previously missing cache-freshness promise is now
listed and has its own tagged observable regression.

## Cold first read

PASS. Before scrolling, the live page says:

- What it does: **“Label color-only dashboard statuses.”**
- Who it is for: **“For people with color-vision deficiency…”**
- What to click: **“Try it with sample data.”**
- What happens: the adjacent copy says it opens a sample dispatch board and
  does not change the visitor's own rules.

The action opens `/demo/` in one click. The resulting screen already shows
three realistic dispatch statuses, the persistent “Demo — sample data,
nothing is saved” banner, **Reset demo**, and **Start for real**. Cold desktop
and full 390 px mobile captures are in
`.factory/verification-artifacts/live-cold-desktop.png` and
`.factory/verification-artifacts/live-mobile-390.png`.

## Clean local gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 264 packages installed; 0 vulnerabilities. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS. |
| `npm audit --audit-level=critical` | PASS — 0 vulnerabilities. |
| `npm test` | PASS — 4 Vitest assertions and 16 Playwright tests. |
| `npm run build` | PASS — exact production build created `dist/site/` and the extension ZIP. |
| `npm run check` | PASS — typecheck, lint, complete tests, and production build repeated successfully. |

The built extension is 46,439 bytes unpacked and 25,451 bytes zipped. The
public and local archive SHA-256 is
`0225e2c5ce3d892b9bb9f6ea452dee591fbddb074f99a2b3d05b28f450040f80`.
It contains only the expected ten extension files, passes `unzip -t`, loads in
a clean Chromium profile, and reports Manifest V3 version 1.0.0 with only
`storage` and `activeTab` permissions.

## End-to-end product exercise

Fresh normal, boundary, invalid, and recovery paths passed:

- The isolated demo changed Waiting to Queued with the Bars pattern, persisted
  only `demo:color-status-labeler:sample-v1`, survived reload, and Reset
  restored the shipped sample and removed the key.
- A whitespace-only label produced a visible `role=alert` error, set
  `aria-invalid=true`, focused the label field, and accepted corrected input.
- A 33-character entry was limited to 32 characters.
- An HTML-like label rendered as literal text and created no injected element.
- Corrupt demo JSON fell back to the shipped sample. **Start for real** removed
  the corrupt key and returned home.
- Keyboard Enter operated Reset and Start for real.
- The packaged extension's popup exported a version-1 JSON backup, rejected
  malformed JSON with recovery guidance, imported a valid rule for the active
  origin, clamped tolerance to 50, deleted and undid one rule, and confirmed
  clearing all rules.
- The picker validates whitespace, supports pointer and keyboard selection,
  traps dialog focus, restores focus after Escape/Cancel/backdrop/save, and
  leaves form values, password values, links, and submission state unchanged.

I also downloaded the public ZIP and loaded it independently against a fresh
20-state fixture. Two trained colors produced 10 Ready and 10 Waiting badges
(20/20 correct, exceeding the brief's 95% target). After one live status color
changed, the extension refreshed to 9 Ready and 11 Waiting badges. The badge
did not block the underlying button click. Rules survived return to the first
origin and did not appear on a second origin; `chrome.storage.local` contained
only the first origin's namespaced configuration. No console errors occurred.

## Live deployment identity and operations

- `npm run verify:deployment` passed. `/`, demo, privacy, terms, 404, worker,
  metadata assets, artwork, bundles, and the extension ZIP byte-match the exact
  local candidate build.
- `npm run verify:browser` passed desktop, 390 px mobile, keyboard, Axe,
  privacy, service-worker update, and offline reload.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, expected title, `lang=en`,
  one main landmark, image alternatives, and no console/page errors.
- Every crawled internal link returned 200. `/404` returns the styled page with
  HTTP 404; direct `/404.html` is the static source and returns 200.
- The content-addressed ZIP returns 200 as `application/zip`, has attachment
  disposition, and uses one-year immutable caching. Hashed JS is also
  immutable; fixed artwork revalidates after five minutes; HTML revalidates
  after 30 seconds; `sw.js` is `no-cache` with root scope.
- The service worker activates updates immediately, precaches the shell, and
  the demo reloads offline with its sample and offline notice.

## Accessibility, responsive behavior, and performance

- Home, demo, privacy, terms, and 404 each have `lang=en`, one `h1`, one
  `main`, ordered headings, route-specific title/canonical/social metadata,
  alternative text, and zero Axe serious/critical findings.
- The first Tab reaches the visible skip link. Activating it skips the header;
  the next Tab reaches **Try it with sample data**. Space operates the sample
  switch. Focus indicators meet the supplied 3:1 and 3 px thresholds.
- At 390×844, normal and 200% root text both measured
  `clientWidth=scrollWidth=390` with zero clipped visible header/main/footer
  descendants. Visible navigation and demo controls meet their touch target
  requirement; the 34 px switch input is inside a larger clickable label.
- Reduced-motion mode produced `scroll-behavior:auto` and no element with a
  material animation or transition duration.
- Initial JS is 3,122 bytes raw / 1.37 KiB gzip; CSS is 14,736 bytes raw /
  3.94 KiB gzip; the mobile hero is 65,156 bytes; no font is downloaded. All
  static budgets pass.
- Fresh Lighthouse 12.8.2: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.1 s, LCP 1.2 s, TBT 60 ms, CLS 0, 73 KiB transfer. Raw
  output: `.factory/verification-artifacts/lighthouse-live.json`.

## Privacy and security evidence

The complete live route/demo exercise recorded 40 browser requests, all to
`https://color-status-labeler.sociobot.in`. It set no cookies and produced no
console or page errors. One favicon request was browser-aborted only because
the test immediately navigated between routes; it was separately fetched with
HTTP 200 and byte-matched. Demo storage remained namespaced, while extension
rules remained in origin-scoped `chrome.storage.local`. The extension path
made requests only to the two deliberately exercised local fixture origins.

Live HTML and assets send a self-only CSP, restrictive Permissions Policy,
`strict-origin-when-cross-origin`, `nosniff`, `DENY` framing, and HSTS. No
third-party font, script, analytics, API, account, payment, or telemetry path
was observed.

This product is a static site plus a local browser extension. It has no
server-side endpoint, unlock call, sign-in, backend, database, or shared state.
API allowance/429/`Retry-After`, concurrency, SQLite persistence, health/build
identity, and Entra authority checks are therefore not applicable. The job is
deterministic and does not benefit from a runtime AI feature; the missed-
leverage check found no gap.

No product code, deployment, infrastructure, app setting, database, service,
or secret was changed or accessed during verification.
