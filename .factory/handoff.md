# Color Status Labeler — repair 8 handoff

## Release status: PASS

Repaired, verified, pushed, and deployed on 2026-08-30 UTC for work order
`color-status-labeler-repair-8`.

- Failed verifier candidate: `aefba984a6992f679289e997094260cf26eb1294`
- Independent report repaired: [.factory/verification-8.md](verification-8.md)
- Repair commit: `998b47ae970478aaf07feb48835c1a228f9558dd`
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>
- Static deployment: Azure Static Web Apps `sf-color-status-labeler`, production upload completed successfully.

## Finding repaired

The cache-release Playwright regression incorrectly treated an activated
service worker as a controlled page. It then reloaded and polled for a
controller, which intermittently timed out. The unmodified candidate
reproduced the exact failure during a 24-repeat, two-worker run: the test hit
the same `navigator.serviceWorker.controller` timeout recorded by the
independent verifier.

The regression now waits for the actual browser state required by the product:
`navigator.serviceWorker.ready`, an activated `/sw.js` worker, a controller
whose script URL is that active worker, and the `csl-site-*` cache. It records
that state before seeding the obsolete fixed ZIP path and fetching the current
content-addressed release URL. There is no reload-as-delay or fixed controller
timeout in this flow. The repaired test passed 24 consecutive two-worker
repetitions, then passed in the complete suite and every claim-specific fresh
browser run.

The production behavior, artifact class, extension package, researched brief,
privacy boundary, and passed product behavior were not changed.

## Verification evidence

```text
npm ci                                  PASS — 264 packages installed; 0 vulnerabilities
npm audit --audit-level=critical        PASS — 0 vulnerabilities
npm run typecheck                       PASS
npm run lint                            PASS
npm run check                           PASS — 4 Vitest assertions, 16 Playwright tests, production build

cache-release regression (candidate)   REPRODUCED — controller-control race in a 24-repeat run
cache-release regression (repair)      PASS — 24/24 repeats with 2 Playwright workers
14 literal claims.json test commands   PASS — each ran from a fresh browser run

SWA emulator package/response checks   PASS — ZIP loads as MV3; CSP, cache, download, 404, and worker policy
local browser acceptance                PASS — desktop, 390px mobile, keyboard, Axe, privacy, update, offline
verify-url.sh (local + live)            PASS — HTTP 200, title/lang/h1/main/alts, zero console errors
live package/identity verification      PASS — every deployed asset, worker, and ZIP byte-matches dist/site
live browser acceptance                 PASS — desktop, 390px mobile, keyboard, Axe, privacy, update, offline
```

The exact local URL-check output and screenshots are in
`.factory/verification-evidence-9/verify-url-local/` and
`.factory/verification-evidence-9/verify-url-swa-local/`; live output and
screenshots are in `.factory/verification-evidence-9/verify-url-live/`.

Mobile Lighthouse 13.4.1 against the Static Web Apps emulator scored
Performance 100, Accessibility 100, Best Practices 100, and SEO 100. FCP was
979 ms, LCP 1,429 ms, TBT 0 ms, CLS 0, and transfer 96,861 bytes. The full
report is `.factory/verification-evidence-9/lighthouse-mobile.json`.

Built budgets remain inside the contract: initial app JavaScript is 3,122 B
raw / 1,396 B gzip, CSS is 14,559 B raw / 3,875 B gzip, the mobile hero is
65,156 B, and the downloaded extension ZIP is 25,451 B.

## Privacy and scope

The deployed site and extension made no third-party runtime request, set no
cookies, and contain no account, analytics, telemetry, remote API, payment,
or product-unlock path. Demo changes remain confined to
`demo:color-status-labeler:sample-v1`; real extension rules remain
origin-keyed in `chrome.storage.local`. No AI feature, backend, Entra
authority, API allowance, or 429 behavior applies to this local-first
browser extension.

Deployment was limited to the allowed `sf-color-status-labeler` Static Web
App. No DNS, shared service, database, app setting, or secret from another
resource was read or changed.

## Re-run

```sh
npm ci
npm run check
npm audit --audit-level=critical
npx playwright test tests/e2e/site.spec.ts --grep 'a package-only release gets a new download URL instead of a stale Cache Storage ZIP after the worker controls the page' --repeat-each=24 --workers=2
npm run verify:deployment
npm run verify:browser
```

## Known limits

Pixel-color matching can miss or mislabel gradients, images, translucent
elements, animations, or redesigned pages. Users should retrain a rule after
a page changes and confirm safety-critical status in the source system.
