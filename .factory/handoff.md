# Color Status Labeler — repair handoff

## Release status: PASS

Repaired, verified, and deployed on 2026-08-30 UTC for work order
`color-status-labeler-repair-5`.

- Repair commits: `6e69949dc8a297989629d92f810a6fa0b067adb0` and `f5a9286`.
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>
- Download: <https://color-status-labeler.sociobot.in/downloads/color-status-labeler-chrome.zip>
- Static deployment: Azure Static Web Apps `sf-color-status-labeler`, deployment `640b3212-9ac5-455c-ac49-b664fa333887`.

## Findings repaired

1. **Claims contract** — Added `.factory/claims.json` with ten public claims and exact tagged Playwright regressions. Every manifest command was run from a clean demo-entry-point browser context. Coverage includes the intended audience, one-click demo, free direct download, no account or third-party requests, local rules, core word-and-pattern labeling, click-through badges, saved-rule return, and offline demo reload.
2. **No isolated sample demo** — Added `/demo/` plus `/?demo=1` forwarding, invented North hub dispatch sample data, and a persistent **Demo — sample data, nothing is saved** banner. Reset removes `demo:color-status-labeler:sample-v1`; Start for real removes that key before returning home. Demo state is never read by or written to extension storage. `.factory/demo.md` records the storage boundary and reset behavior.
3. **Missing intended-user copy** — The first screen now says this is for people with color-vision deficiency. It leads with **Try it with sample data**, explains what happens next, and states the local-storage, offline, and free-download facts. `.factory/copy-audit.md` records the landing-copy sentence, heading, and terminology audit.
4. **No real 404 route** — Added `404.html`, a 404 response override, and a status-only `/404` route compatible with Static Web Apps. Production `/404` returns the designed not-found page with HTTP 404 instead of the landing-page fallback.

The existing MV3 package, training flow, local Chrome storage, direct ZIP download, service worker, privacy model, and visual thesis were retained.

## Verification evidence

Fresh install and local release gate:

```text
npm ci                                  PASS — 265 packages, 0 vulnerabilities
npm run typecheck                       PASS
npm run lint                            PASS
npm test                                PASS — 4 Vitest + 9 Playwright tests
npm run build                           PASS — MV3 ZIP and dist/site/
npm run check                           PASS — typecheck, lint, tests, build
npm audit --audit-level=critical        PASS — 0 vulnerabilities
```

Every command referenced in `.factory/claims.json` passed, including the new `@claim:free-download` command. The claim tests open `/demo/` in a fresh browser context; the offline test creates and closes its own context so it cannot tear down the shared Playwright browser.

Browser, accessibility, and privacy checks:

```text
/opt/fleet/lib/verify-url.sh local      PASS — title, lang, h1, main, alts, desktop/mobile screenshots, no errors
node scripts/verify-live-browser.mjs    PASS — desktop, 390×844 mobile, skip link, keyboard, focus, privacy, SW update, offline reload
Playwright axe scans                    PASS — zero serious/critical findings on landing, demo, privacy, terms, 404, extension popup, picker
Lighthouse 13.4.1 live mobile           PASS — Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 60 ms, CLS 0
```

Production evidence:

```text
npm run verify:deployment               PASS — direct ZIP HTTP 200, ZIP MIME, attachment, immutable caching, valid MV3 package, fresh Chromium extension load, local byte match
npm run verify:browser                  PASS — live desktop/mobile/keyboard/axe/privacy/offline checks
/opt/fleet/lib/verify-url.sh live       PASS — HTTP 200, 596 ms, no console or page errors; title/lang/h1/main/alts
curl https://…/404                      PASS — HTTP 404 and “This page is not here.”
```

The deployed extension archive is 25,254 bytes with SHA-256 `8145e8e7918b228e9e7ca76ff2a91fbdc34a34f5458ea801c1c188930dcda346`. The initial site JavaScript is 3,122 bytes (1,370 bytes gzip), CSS is 14,559 bytes (3,870 bytes gzip), mobile hero art is 65,156 bytes, and desktop hero art is 192,250 bytes. All are within the static-product budgets.

## Known limits

Rules remain local in `chrome.storage.local`; there is no account, analytics, cookie, remote API, third-party runtime script, or downloaded font. Pixel matching can be wrong for canvases, WebGL, images, video, gradients, transparency, animation, or redesigned pages. Users should retrain after page changes and confirm safety-critical status in the source system.
