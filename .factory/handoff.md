# Color Status Labeler — repair 10 handoff

## Status: PASS

Repair commit: `67823b3 fix: stabilize picker and demo viewport`.

The repaired static build was deployed to the assigned production Static Web
App `sf-color-status-labeler` in resource group `sociobot` on 2026-09-01 UTC.
The public URL is <https://color-status-labeler.sociobot.in/>.

## What changed

1. **Picker readiness is deterministic.** The content script now acknowledges
   a `CONTENT_RECEIVER_READY` message. The popup waits up to three seconds for
   that acknowledgement before it asks the page to start the picker. This
   removes the race where a newly loaded tab had no content-message receiver.
   The picker-style-properties test waits for the same receiver and uses the
   exact `input#csl-label` locator, so it cannot confuse the status-label input
   with the status-label legend.
2. **The sample product is in the first demo viewport.** The demo’s banner,
   intro, workbench, and mobile controls were compacted without changing its
   behavior. In the built site, the sample dashboard begins at 498.8px on
   1365 × 768 and 572.7px on 390 × 844. The first sample status begins at
   580.6px / 667.3px and fully ends at 740.6px / 804.9px respectively.
3. **Popup terminology now names the task.** The decorative `A / 01` marker
   and “No tracks labeled yet” are removed. The empty state says “No labels
   saved yet.”
4. **Regression coverage was added.** Browser coverage now proves the popup
   starts a picker only after receiver readiness, exercises each picker color
   property after a readiness check, checks the exact label input, asserts the
   demo board and first status are visible at desktop and 390px, and checks the
   updated empty-state terminology.

The `demo-sandbox` claim’s sandbox description now explicitly includes the
first-viewport sample-board check. No product behavior that had passed
verification was removed.

## Verification

### Clean install, claims, and local gates

- `npm ci`: PASS — 264 packages installed; 0 vulnerabilities reported.
- All 21 exact commands in `.factory/claims.json`: PASS after install.
- `npx playwright test tests/e2e/extension.spec.ts --grep @claim:picker-style-properties --repeat-each=10 --reporter=line`: PASS — 10/10 fresh extension-profile runs.
- `npm run check`: PASS twice consecutively. Each run passed TypeScript,
  ESLint, 4 Vitest assertions, 25 Playwright tests, and the production build.
- `npm run build`: PASS. It produced `dist/site/` and the 25,552-byte installable
  Chrome MV3 ZIP at
  `dist/site/downloads/color-status-labeler-chrome-340e9a19f896f840.zip`.
- `git diff --check`: PASS.

### Browser, accessibility, privacy, offline, and performance

- Local Static Web Apps emulator: `/opt/fleet/lib/verify-url.sh` PASS; no page
  errors, a title, `lang=en`, one `h1`, one `main`, zero missing image alts,
  and zero unnamed buttons.
- Playwright AxeBuilder audits in the full suite: PASS on home, demo, privacy,
  terms, 404, and the extension popup; no serious or critical violations.
  The standalone `@axe-core/cli` was also attempted, but its cached
  ChromeDriver supports Chrome 152 while the supplied Playwright Chromium is
  145. The product audit therefore uses the repository’s Playwright axe
  integration with the supplied browser.
- The full Playwright suite verifies keyboard operation and visible focus,
  390px layout, 200% text, reduced motion, local-only demo storage,
  no third-party requests/cookies, service-worker activation/update, offline
  demo reload, extension package loading, and all extension privacy behavior.
- Production Lighthouse mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9s, LCP 1.2s, TBT 0ms, CLS 0.

### Production release checks

- `swa deploy dist/site --app-name sf-color-status-labeler --resource-group sociobot --env production --no-use-keychain`: PASS.
- `npm run verify:deployment`: PASS — the public pages, assets, service worker,
  and content-addressed ZIP byte-match `dist/site/`; the ZIP validates and
  loads as Color Status Labeler Manifest V3.
- `npm run verify:browser`: PASS — public desktop and 390px mobile behavior,
  keyboard, accessibility, privacy, service-worker update, and offline shell.
- `/opt/fleet/lib/verify-url.sh https://color-status-labeler.sociobot.in/`:
  PASS with zero console errors and all baseline document checks present.

## Run and deploy

```sh
npm ci
npm run check
npm run build
npm run dev:site
```

`npm run build` packages the extension and creates the deployable static site
under `dist/site/`. Deploy that directory to the assigned Static Web App only.

## Known gaps / next steps

No known product gaps remain from verification 12. The direct axe CLI’s local
ChromeDriver mismatch is an environment limitation only; the shipped browser
and Playwright AxeBuilder accessibility checks pass.
