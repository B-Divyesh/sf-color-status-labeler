# Color Status Labeler — independent verification 9

## Verdict: FAIL

Verified on 2026-08-30 UTC for work order
`color-status-labeler-verify-9`.

- Candidate commit: `7b49b1dbb6afb4521911ada9ed0dd1e958d94009`
- Checkout at start: clean `main` checkout at that exact commit
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>

The deployment byte-matches the candidate, the complete required quality gate
passes, every declared claim test passes, and the previous service-worker test
race did not recur in 24 repetitions. The candidate is still not releasable:
one public README claim is missing from the mandatory claims registry, and the
landing page clips content when text is enlarged to 200% on a 390 px viewport.

## Release-blocking findings

### High — a public cache-freshness claim is absent from `claims.json`

README line 58 says:

> The digest changes with the package so returning users cannot receive an old
> release from cache.

That is a concrete outcome a user can rely on, but `.factory/claims.json` has
no cache-freshness entry. The related regression at
`tests/e2e/site.spec.ts:88` is not tagged `@claim:<id>` and therefore is not
discoverable or runnable through the claims contract. The supplied claims
rules state that an unlisted claim in README fails review even when an untagged
test happens to cover it.

Required repair: add this statement to `.factory/claims.json` with an exact
tagged test command, or remove the promise from README. The existing cache
regression can be tagged and referenced rather than duplicated.

### Medium — 200% text enlargement clips the landing page

In a fresh live Chromium context at 390 × 844, the normal page fit exactly:
`clientWidth = scrollWidth = 390`. After setting the root text size to 200%,
the document measured `clientWidth = 390`, `scrollWidth = 547`, while the body
retained `overflow-x: hidden`. The hero heading and both primary actions each
measured 521.89 px wide and ended at x=541.89. The right side of “DASHBOARD”,
“STATUSES”, the audience sentence, and the actions was visibly clipped.

This loses content and action text at the required 200% text size and fails the
attached accessibility baseline. The minimum-content width of the enlarged
hero is allowed to expand beyond the single-column mobile viewport.

Required repair: permit the mobile grid and hero children to shrink, and wrap
long display words and action text. Add a 390 px / 200% text regression that
asserts all content and controls remain within the viewport.

## Mandatory claims preflight

`.factory/claims.json` exists and contains 14 claims. I invoked every literal
test command before broader QA. The first invocation from the uninstalled
checkout could not start Vitest (`vitest: not found`); after the required
lockfile install with `npm ci`, every exact command passed in its own browser
run:

| Claim | Result |
| --- | --- |
| `color-vision-audience` | PASS |
| `demo-sandbox` | PASS |
| `download-extension` | PASS |
| `free-download` | PASS |
| `no-account` | PASS |
| `backup-transfer` | PASS |
| `rule-deletion` | PASS |
| `page-unchanged` | PASS |
| `extension-runtime-privacy` | PASS |
| `core-labeling` | PASS |
| `local-rules` | PASS |
| `click-through` | PASS |
| `rules-return` | PASS |
| `offline-demo` | PASS |

Each installed command ran four passing Vitest assertions and its selected
Playwright claim test. The separate unlisted-claim defect above remains a
claims-contract failure.

## Cold first read and end-to-end behavior

The mandatory first-read gate passes. A cold desktop visit says “Label
color-only dashboard statuses,” names people with color-vision deficiency,
and presents “Try it with sample data” as the primary action. Adjacent text
says the click opens a sample dispatch board without changing real rules. The
demo is one click away and shows the persistent “Demo — sample data, nothing
is saved” banner, Reset demo, and Start for real.

Fresh live exercise passed for normal, boundary, invalid, and recovery paths:

- Whitespace-only input produced “Enter a status label and choose a pattern,”
  set `aria-invalid=true`, and returned focus to the labelled field.
- A 32-character label with Bars was accepted and persisted only under
  `demo:color-status-labeler:sample-v1`; extra input was clipped by `maxlength`.
- An HTML-like label rendered as literal text and created no element.
- Reset restored Ready, focused Reset demo, and removed the demo key.
- Corrupt JSON fell back to the shipped sample; Start for real removed the bad
  demo key and returned home.
- All landing links and the content-addressed download returned 200. `/404`
  returned the styled page with HTTP 404.

The passing extension claim suite loads the real packaged Manifest V3 build in
a fresh Chromium profile and covers the complete useful flow: picker training,
word-and-pattern overlays, local origin-scoped persistence, reload, click-
through badges, keyboard selection and cancellation, backup export/import and
malformed recovery, delete/undo, clear confirmation, and page/form
non-interference. The live 25,451-byte archive also installed and reported the
expected manifest.

## Build and reliability evidence

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 264 packages installed; 0 vulnerabilities. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS. |
| `npm test` | PASS — 4 Vitest assertions and 16 Playwright tests. |
| `npm run build` | PASS — deployable `dist/site/` and MV3 ZIP produced. |
| `npm run check` | PASS — typecheck, lint, complete tests, and production build. |
| `npm audit --audit-level=critical` | PASS — 0 vulnerabilities. |
| Repaired cache regression, 24 repeats / 2 workers | PASS — 24/24 in 1.2 minutes. |
| `npm run verify:deployment` | PASS — live files and ZIP byte-match the candidate build. |
| `npm run verify:browser` | PASS — desktop, mobile, keyboard, Axe, privacy, worker update, offline reload. |
| `/opt/fleet/lib/verify-url.sh` against production | PASS — HTTP 200, title/lang/main/alts, no console errors. |

The extension archive SHA-256 is
`0225e2c5ce3d892b9bb9f6ea452dee591fbddb074f99a2b3d05b28f450040f80`.
It contains only the expected manifest, popup, scripts, CSS, and icons;
permissions are limited to `storage` and `activeTab`.

## Accessibility, mobile, and performance

- Playwright Axe found zero serious/critical issues on home, demo, privacy,
  terms, and the designed 404 page.
- Each route has `lang=en`, one `h1`, one `main`, route-specific title,
  canonical and social metadata, and image alternatives.
- First Tab reaches the skip link with a 3 px blue outline. After activation,
  the next Tab skips the header and reaches “Try it with sample data”. Space
  operates the labelled status switch. The extension dialog traps focus and
  restores it on close in the shipped tests.
- Normal 390 px home and demo pages have no horizontal overflow. Visible
  navigation/actions and labelled radio targets meet 44 px sizing. The 200%
  text defect is documented above.
- Reduced-motion mode removes site and extension transitions/animation.
- Fresh live Lighthouse 12.8.2: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 30 ms, CLS 0, total 73 KiB.
- Initial application JS is 3,122 B raw / 1,397 B gzip; CSS is 14,559 B raw /
  3,887 B gzip; mobile hero is 65,156 B; extension ZIP is 25,451 B. All stated
  static budgets pass.

## Privacy, requests, headers, and operational scope

The complete live route/demo flow recorded 30 browser requests, all to
`https://color-status-labeler.sociobot.in`. It set no cookies and produced no
console or page errors. Demo state used only its namespaced local-storage key;
extension tests found only origin-scoped `chrome.storage.local` rules and no
remote request, account control, telemetry, or sensitive permission.

Production responses include a self-only CSP, restrictive Permissions Policy,
`nosniff`, `DENY` framing, and `strict-origin-when-cross-origin`. HTML revalidates
after 30 seconds; hashed JS and the content-addressed ZIP are one-year
immutable; fixed artwork revalidates after 300 seconds; `sw.js` is `no-cache`
with root scope. Service-worker update and offline reload both pass.

This is a static site plus local browser extension. It has no server-side
endpoint, product-unlock call, payment path, account, or sign-in. API allowance,
429/`Retry-After`, backend concurrency, SQLite persistence, and Entra authority
checks are not applicable. The deterministic job does not benefit from an AI
runtime feature, so the missed-leverage check found none.

No product code, deployment, infrastructure, app setting, database, or secret
was changed or accessed during verification.
