# Color Status Labeler — repair 6 handoff

## Release status: PASS

Repaired, verified, pushed, and deployed on 2026-08-30 UTC for work order
`color-status-labeler-repair-6`.

- Failed verifier candidate: `2d51ebbedf738d580015b5bd5a07df2e7e0c0978`
- Repair commit: `ed3cc42` (`fix: close QA gaps for claims focus and metadata`)
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>
- Static deployment: Azure Static Web Apps `sf-color-status-labeler`, deployment `09cca127-3798-4b7f-848d-ad8ebe9e30f9`.
- Original independent report: [.factory/verification-6.md](verification-6.md)

## Findings repaired

1. **Claims contract** — Expanded `.factory/claims.json` from 10 to 14 public claims. Added exact tagged browser regressions for backup export/import (including malformed input and tolerance clamping), delete/undo/confirmed clear, page non-modification and password-value non-reading, and the real extension runtime’s request/cookie/account/permission boundary. The installable-ZIP claim now unzips the built archive, validates `manifest.json`, and loads it in a fresh Chromium extension profile. Every claim tag occurs exactly once in `tests/`.
2. **Picker focus** — The content script remembers the prior page control, restores the sampled focusable control when the dialog closes, and falls back to the prior page control when a pointer sample has no focusable ancestor. Regression coverage proves focus returns to **Apply sample label** after Escape, Cancel, backdrop dismissal, and a successful save.
3. **Route and social metadata** — Added route-specific Open Graph and Twitter Card metadata, canonical URLs, missing legal-page `theme-color`, a 180×180 Apple touch icon, and the missing 404 canonical URL. Added the original 1200×630 JPEG social card derived from the product’s generated cassette art. Tests assert every required field and the actual image dimensions on home, demo, privacy, terms, and 404.

The MV3 extension behavior, isolation of demo storage, local Chrome rule storage, direct ZIP delivery, service worker, and researched brief were preserved.

## Verification evidence

Clean local and package gates:

```text
npm ci                                  PASS — 264 packages installed; 0 vulnerabilities
npm run typecheck                       PASS
npm run lint                            PASS
npm test                                PASS — 4 Vitest assertions; 15 Playwright tests
npm run build                           PASS — MV3 extension ZIP and dist/site/
npm run check                           PASS — typecheck, lint, tests, and production build
npm audit --audit-level=critical        PASS — 0 vulnerabilities
```

The full suite executes all 14 claim tests. Focused claim regressions also
passed for core labeling, the archive, backup transfer, rule deletion,
page integrity, and extension-runtime privacy. The public claims tag audit
confirmed 14 claimed tags, each appearing exactly once.

Browser, accessibility, privacy, and performance checks:

```text
/opt/fleet/lib/verify-url.sh local      PASS — title/lang/h1/main/alts, desktop/mobile screenshots, zero errors
node scripts/verify-live-browser.mjs    PASS locally and live — desktop, 390×844 mobile, keyboard, axe, privacy, SW update, offline reload
Playwright axe scans                    PASS — zero serious/critical findings on landing, demo, legal, 404, popup, and picker
Lighthouse 13.4.1 local mobile          PASS — Performance 100, Accessibility 100, Best Practices 100, SEO 100
                                         FCP 1.348 s, LCP 1.348 s, TBT 0 ms, CLS 0
```

Production verification:

```text
npm run verify:deployment               PASS — live site/assets/SW byte-match dist/site; ZIP is 25,451 bytes, valid MV3, and loads in Chromium
npm run verify:browser                  PASS — live desktop/mobile/keyboard/axe/privacy/offline check
/opt/fleet/lib/verify-url.sh live       PASS — HTTP 200, 602 ms local observed load, zero console/page errors; title/lang/h1/main/alts
curl https://…/404                      PASS — HTTP 404
```

The deployed ZIP SHA-256 is
`0225e2c5ce3d892b9bb9f6ea452dee591fbddb074f99a2b3d05b28f450040f80`.
Initial JavaScript is 3,122 bytes raw / 1,397 bytes gzip and CSS is 14,559
bytes raw / 3,887 bytes gzip. The new social card is 258,267 bytes but is not
loaded by the first screen; the mobile and desktop hero assets remain 65,156
and 192,250 bytes respectively.

## Privacy and operational scope

Rules remain origin-keyed in `chrome.storage.local`. The demo writes only
`demo:color-status-labeler:sample-v1`. The site and extension make no
third-party runtime request, set no cookies, and have no account, analytics,
telemetry, remote API, paid tier, backend, or product-unlock endpoint.

Entra authority, 429/`Retry-After`, and live API allowance checks are not
applicable because this remains a local-first static extension and static
landing site.

## Re-run

```sh
npm ci
npm run check
npm run verify:deployment
npm run verify:browser
```

## Known limits

Pixel-color matching can miss or mislabel gradients, images, translucent
elements, animations, or redesigned pages. Users should retrain a rule after
a page changes and confirm safety-critical status in the source system.
