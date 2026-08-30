# Color Status Labeler — independent verification 8

## Verdict: FAIL

Verified on 2026-08-30 UTC for work order `color-status-labeler-verify-8`.

- Candidate commit: `aefba984a6992f679289e997094260cf26eb1294`
- Checkout at start: clean and at that exact commit
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>

The deployed site and extension byte-match this candidate, and the product flow
works. The candidate is nevertheless not releasable because the required
`npm run check` quality gate fails. A dedicated three-repeat reproduction also
failed one of three attempts. The failure is an intermittent service-worker
control race in an untagged Playwright regression, but a non-deterministic
required test is still a failed local quality gate.

## Release-blocking defect

### High — required full test suite is flaky and fails

`npm run check` ran `typecheck`, `lint`, unit tests, and the full browser suite.
Typecheck and lint passed; Vitest passed all 4 assertions; Playwright passed 15
tests and failed 1:

```text
tests/e2e/site.spec.ts:63
a package-only release gets a new download URL instead of a stale Cache Storage ZIP

Expected: true
Received: false
Timeout 5000ms exceeded while waiting on
Boolean(navigator.serviceWorker.controller)
```

The same exact regression was repeated three times: **2 passed, 1 failed** at
the same assertion. This is not a deployment mismatch: the standalone live
service-worker update and offline-reload verification passes. It is a local
test reliability failure that blocks the mandatory `npm test` / `npm run check`
gate.

Required repair: make the service-worker test establish and verify a controlled
fresh context deterministically before asserting cache behavior (or otherwise
remove the race), then demonstrate repeated clean `npm run check` success.

Evidence: `verification-evidence-8/local-check.log` and
`verification-evidence-8/service-worker-repeat.log`.

## Mandatory claim preflight

`.factory/claims.json` exists and declares 14 claims. After `npm ci` (264
packages, 265 audited, zero vulnerabilities), every literal claim command was
run separately from the product demo entry point and passed:

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

Individual exact-command output is retained as
`verification-evidence-8/claim-*.log`. The initial aggregate claim runner
stopped on a transient failure; the clean individual rerun above is the
authoritative complete result. No claim test is a current blocker.

## Cold first read and product exercise

**PASS.** On a cold live landing page, the first screen says what it does:
“Label color-only dashboard statuses”; names who it is for: people with
color-vision deficiency; and offers the first click: “Try it with sample
data.” The adjacent copy says it opens a sample dispatch board without
changing the visitor's rules. The visible one-click demo meets the sandbox
requirement, with persistent “Demo — sample data, nothing is saved”, Reset
demo, and Start for real controls.

Live end-to-end exercise passed:

- A normal sample edit changed Waiting to **Delayed** with the Bars pattern and
  persisted only `demo:color-status-labeler:sample-v1`.
- Whitespace-only input announced “Enter a status label and choose a pattern.”,
  set `aria-invalid="true"`, and returned focus to the labelled input.
- Keyboard Enter reset the sample to Waiting and removed its demo key.
- All landing-page links returned HTTP 200, including the content-addressed
  downloadable ZIP.
- The browser request log contained only
  `https://color-status-labeler.sociobot.in`; no cookies, console errors, or
  page errors were observed.

The real packaged MV3 extension was also exercised by the passing claim suite:
it loads in a fresh Chromium profile, trains a label/pattern, restores local
origin rules, leaves controls and form values untouched, supports JSON
backup/import validation and delete/undo, and uses click-through badges.

## Local and production checks

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 0 reported vulnerabilities. |
| All 14 exact claim commands | PASS. |
| `npm run typecheck` | PASS (within `npm run check`). |
| `npm run lint` | PASS (within `npm run check`). |
| `npm test` / `npm run check` | **FAIL** — 15/16 Playwright tests pass; service-worker test fails as above. |
| `npm run build` | PASS — creates `dist/site/` and a 25,451-byte MV3 ZIP. |
| `npm run verify:deployment` | PASS — live HTML, assets, service worker, and extension ZIP byte-match `dist/site/`. |
| `npm run verify:browser` | PASS — desktop, 390px mobile, keyboard, Axe, privacy, update, and offline shell. |

Production response checks found self-only CSP, `nosniff`,
`strict-origin-when-cross-origin`, restrictive Permissions Policy, HTML
revalidation at 30 seconds, `sw.js` `no-cache` with root scope, and immutable
content-addressed JS/ZIP caching. `GET /404` is verified by the deployment
script as a styled HTTP 404 (the platform returns 200 to a HEAD request).

The landing's initial mobile transfer was 72,230 bytes: JavaScript 1,339 bytes
encoded, CSS 3,999 bytes encoded, and the 65,156-byte mobile hero. This is
well inside the 200 KB initial-JS and 300 KB hero budgets. At 390 px there is
no layout overflow. A simulated 200% root-text capture preserved all controls
and content; the measured 37px document scroll-width surplus came from
decorative box shadows, with no element's rendered bounds crossing the 390px
viewport.

Playwright Axe reported zero serious or critical findings on home, demo,
privacy, terms, and the designed 404 page. The first Tab reaches the skip
link; Space toggles labels; tested focus outlines meet 3px / 3:1; and
`prefers-reduced-motion` disables smooth scrolling. The live browser verifier
also confirms service-worker update and offline `/demo/` reload.

There is no backend, payment, account, sign-in, product-unlock endpoint, or
AI feature. Entra authority, API allowance / 429 behavior, and backend
concurrency checks are not applicable.

## Evidence files

- `verification-evidence-8/first-read-live-desktop.png`
- `verification-evidence-8/demo-invalid-recovery-live.png`
- `verification-evidence-8/demo-mobile-simulated-200-root-text.png`
- `verification-evidence-8/local-check.log`
- `verification-evidence-8/build.log`
- `verification-evidence-8/live-deployment.log`
- `verification-evidence-8/live-browser.log`
- `verification-evidence-8/service-worker-repeat.log`
