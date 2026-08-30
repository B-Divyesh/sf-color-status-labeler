# Color Status Labeler — repair handoff

## Release status: PASS

Verified and deployed 2026-08-30 (UTC) for work order
`color-status-labeler-repair-4`.

- Repaired commit: `8455a4d` (`fix: package extension in static deployment build`), pushed to `main`.
- Production: <https://color-status-labeler.sociobot.in/>
- Artifact: <https://color-status-labeler.sociobot.in/downloads/color-status-labeler-chrome.zip>

## Root cause and repair

The deployment contract invokes `npm run build:site`, but that script previously
ran only Vite. The extension ZIP was copied into `dist/site/downloads/` only by
the separate `npm run build` wrapper, so the deployed static output had no
archive. The prior ZIP-to-BIN rewrite could not help because neither file was
in the deployment build.

`npm run build:site` is now the complete deployment build: it builds/zips the
MV3 extension, builds the site, validates the archive with `unzip -tqq`, and
copies the real ZIP directly to
`dist/site/downloads/color-status-labeler-chrome.zip`. The static route now
serves that file directly with ZIP MIME type, attachment disposition, and
one-year immutable caching. The ineffective `.bin` rewrite was removed.

Regression coverage runs the exact `build:site` command used for deployment and
asserts that the preview serves a real `PK\x03\x04` ZIP, that the direct ZIP
route has the required response policy, and that no `.bin` rewrite remains.
The repair also adds a real ESLint gate and removes the one unused type import
it found.

## Verification evidence

Fresh clean install and release gate:

```text
npm ci                                  PASS — 265 packages, 0 vulnerabilities
npm run typecheck                       PASS
npm run lint                            PASS
npm test                                PASS — 4 Vitest + 6 Playwright tests
npm run build                           PASS — deployable dist/site/
npm run check                           PASS
npm audit --audit-level=critical        PASS — 0 vulnerabilities
```

The local deployment build emits a 25,254-byte extension ZIP with SHA-256
`8145e8e7918b228e9e7ca76ff2a91fbdc34a34f5458ea801c1c188930dcda346`.
The static site remains within budget: initial JavaScript is 1,134 bytes,
CSS is 10,952 bytes, mobile hero image is 65,156 bytes, and desktop hero image
is 192,250 bytes.

Production checks:

```text
npm run verify:deployment              PASS — HTTP 200, 25,254-byte ZIP,
                                           matching local SHA-256; unzip,
                                           Manifest V3 inspection, and fresh
                                           Chromium extension load all pass
npm run verify:browser                 PASS — desktop and 390×844 mobile,
                                           keyboard, axe, privacy, SW update,
                                           and offline reload
/opt/fleet/lib/verify-url.sh <url>     PASS — HTTP 200, 592 ms, no page or
                                           console errors; title/lang/one h1/
                                           main/alt/button checks pass
Lighthouse 13.4.1 mobile               PASS — Performance 100, Accessibility
                                           100, Best Practices 100, SEO 100;
                                           FCP 0.8 s, LCP 1.2 s, TBT 20 ms,
                                           CLS 0
```

The live artifact response is `200 application/zip`, begins with `PK 03 04`,
and includes `Content-Disposition: attachment; filename="color-status-labeler-chrome.zip"`
and `Cache-Control: public, max-age=31536000, immutable`. Live identity checks
match the locally built archive and site files. CSP, restrictive Permissions
Policy, HSTS, frame denial, nosniff, referrer policy, service-worker update
headers, same-origin-only site requests, no site cookies/web storage, and local
extension storage behavior all pass.

## Reported finding coverage

- Missing public archive: fixed and verified from the public origin.
- Whitespace-only label feedback: visible `role="alert"`, `aria-invalid`,
  focus recovery, and successful retry are covered in packaged-extension tests.
- Focus contrast and 44px targets: desktop/mobile and popup/picker checks cover
  the reported controls.
- Offline/service-worker activation and update: local and live checks cover
  registration, update, and offline reload.
- Response policy/cache lifetime: direct artifact, hashed assets, and worker
  policies are asserted and verified live.

## Known product limits

Rules stay local in `chrome.storage.local`; no analytics, account, cookie,
remote API, third-party runtime script, or downloaded font is used. Matching
uses computed colors and can be wrong for canvases, WebGL, images, video,
gradients, transparent composites, animations, or redesigned pages. Users must
retrain after site changes and confirm safety-critical status in the source
system.
