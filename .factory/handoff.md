# Color Status Labeler — repair 7 handoff

## Release status: PASS

Repaired, verified, pushed, and deployed on 2026-08-30 UTC for work order
`color-status-labeler-repair-7`.

- Failed verifier candidate: `80507ee35814cb3257f5e741d7ca6c55fa83a47e`
- Independent report repaired: [.factory/verification-7.md](verification-7.md)
- Repair commit: `2a98011` (`fix: publish cache-safe extension releases`)
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>
- Static deployment: Azure Static Web Apps `sf-color-status-labeler`, deployment `214be8d5-2c43-46fc-abfd-7c83e1bbc3e2`.

## Finding repaired

The fixed extension URL had one-year immutable HTTP caching and was also
cached cache-first by the service worker. An extension-only release could
therefore leave a returning visitor downloading an old ZIP.

The packaging script now SHA-256 hashes the built MV3 archive before Vite
builds the site. Every rendered download link targets the digest-addressed
artifact, currently
`/downloads/color-status-labeler-chrome-0225e2c5ce3d892b.zip`; the complete
archive SHA-256 is
`0225e2c5ce3d892b9bb9f6ea452dee591fbddb074f99a2b3d05b28f450040f80`.
The service-worker revision includes that archive URL as well as the rendered
shell, so it changes on a package-only release without precaching the ZIP.

Immutable caching is now limited to content-addressed downloads and Vite
bundles under `/assets/immutable/`. Fixed hero and social artwork under
`/assets/` is `public, max-age=300, must-revalidate`.

The new browser regression seeds the active Cache Storage with the prior
stable ZIP path, then fetches the new digest URL and proves it returns a real
fresh ZIP. It also asserts the response policy, dynamic link format, and
revalidation policy for fixed artwork.

## Verification evidence

```text
npm ci                                  PASS — 264 packages installed; 0 vulnerabilities
14 exact claims.json commands           PASS after final build
npm run check                           PASS — typecheck, lint, 4 unit, 16 Playwright, package, site build
npm audit --audit-level=critical        PASS — 0 vulnerabilities
```

The final clean build produced the 25,451-byte MV3 archive, unpacked it, and
the package/consumer regression loaded it in a fresh Chromium extension
profile. Existing color sampling, local rules, popup handling, demo storage,
and all passed behavior from the verifier candidate remain unchanged.

```text
Static Web Apps emulator
  npm run verify:deployment             PASS — local byte identity and Chrome package install
  npm run verify:browser                PASS — desktop, 390px mobile, keyboard, Axe, privacy, SW update, offline reload
  verify-url.sh                         PASS — title/lang/h1/main/alts; zero page or console errors

Production
  npm run verify:deployment             PASS — live site, nested assets, SW, and digest ZIP byte-match dist/site
  npm run verify:browser                PASS — desktop/mobile, keyboard, accessibility, privacy, service-worker update and offline reload
  verify-url.sh                         PASS — HTTP 200; title/lang/one h1/main/alts; zero errors
  GET /404                              PASS — styled response with HTTP 404
```

Live response-policy checks confirm the release ZIP is `application/zip`,
attachment-disposed, and `public, max-age=31536000, immutable`; the Vite JS
bundle is likewise immutable; the fixed mobile hero is `max-age=300,
must-revalidate`. The self-only CSP, restrictive Permissions Policy,
`nosniff`, strict-origin referrer policy, `DENY` framing, and no-cache service
worker remain active.

Playwright Axe found zero serious or critical findings on the landing, demo,
legal, 404, picker, and popup screens. Live Lighthouse 13.4.1 scored
Performance 99, Accessibility 100, Best Practices 100, and SEO 100
(FCP 1.608 s, LCP 1.928 s, TBT 21 ms, CLS 0).

## Privacy and scope

Rules remain origin-keyed in `chrome.storage.local`; the demo writes only
`demo:color-status-labeler:sample-v1`. The deployed site and extension make
no third-party runtime request, set no cookies, and have no account,
analytics, telemetry, remote API, payment, backend, or product-unlock flow.
Entra authority, API allowance, and 429 handling are not applicable to this
local-first static browser extension.

## Re-run

```sh
npm ci
npm run check
npm audit --audit-level=critical
npm run verify:deployment
npm run verify:browser
```

## Known limits

Pixel-color matching can miss or mislabel gradients, images, translucent
elements, animations, or redesigned pages. Users should retrain a rule after
a page changes and confirm safety-critical status in the source system.
