# Color Status Labeler — repair handoff

## Release status: **PASS**

Repaired and deployed on 2026-08-28 for work order `color-status-labeler-repair-1`.

- Failed verifier baseline: `0fd1b396ebd47528d0a6d508c7a5d3d25d50a4f2` / report commit `5a20246db764bfff51465ec0332963e8613968bd`.
- Repair code commit: `b5edd9a` (`fix: ship installable archive and reliable offline shell`).
- Production: <https://color-status-labeler.sociobot.in/>.
- Deployment: Azure Static Web Apps deployment `7ff555ed-d244-451a-b9c4-75da6f01f6d6`, uploaded from `dist/site/` with `/opt/fleet/lib/deploy-static.sh color-status-labeler dist/site`.

## Fixed verifier findings

1. The public Chrome download had been swallowed by the static host's navigation fallback and returned `index.html`. `site/public/staticwebapp.config.json` now excludes `/downloads/*` and `/sw.js` from that fallback. `npm run build` also checks the copied archive's ZIP signature. Production now serves `/downloads/color-status-labeler-chrome.zip` as `application/zip`, `Content-Disposition: attachment`, 25,237 bytes, and begins `PK 03 04`; `unzip -t` passes.
2. The previous service-worker generator used Rollup bundle names that Vite did not emit (`home-*.js`, `privacy-*.js`, and `terms-*.js`). A failed `cache.addAll()` left a cache behind but aborted installation, explaining the verifier's cache-with-no-registration result. The generator now reads the actual written assets, versions its cache from the full precache contents, and precaches only resolving URLs. The deployed worker activates at the production scope and offline reload works after first visit.
3. Whitespace-only status labels now leave the dialog open with a visible, announced `role="alert"` error and `aria-invalid="true"`; editing a valid label clears the error.
4. The deployment policy adds a self-only CSP, restrictive Permissions Policy, `X-Frame-Options: DENY`, no-cache worker updates, and immutable caching for `/assets/*` and `/downloads/*`.

## Regression coverage

- The extension browser test now unzips and loads the packaged Chrome ZIP, rather than only loading the build directory.
- It exercises the whitespace-only label failure and confirms the exact live announcement and recovery.
- The site test fetches the ZIP and requires an HTTP ZIP MIME type and `PK\x03\x04` signature; it also asserts the shipped Static Web Apps fallback/cache/security policy.
- The offline test waits for an active worker and versioned cache, verifies every generated precache URL succeeds, then reloads offline.

## Verification evidence

From a clean dependency install:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm audit --audit-level=critical
```

- `npm ci`: passed; 185 packages audited, 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm test`: passed — 4 Vitest unit tests and 5 Playwright tests (packaged-extension consumer, whitespace validation, desktop/mobile, legal pages, deploy artifact/policy, and offline worker flow).
- `npm run build`: passed; `dist/site/downloads/color-status-labeler-chrome.zip` is 25,237 bytes and `unzip -t` reports no errors.
- `npm audit --audit-level=critical`: passed; 0 vulnerabilities.
- `/opt/fleet/lib/verify-url.sh https://color-status-labeler.sociobot.in/ …`: passed; title, `lang="en"`, one `h1`, `main`, image alt text, and no browser errors.
- Fresh production Chromium profile: active worker at `https://color-status-labeler.sociobot.in/sw.js`, scope `/`, cache `csl-site-aeb5522e97eb`; offline reload showed “Stop guessing what the colors mean.” and the offline notice. Desktop/mobile console errors: none. At 390×844, no horizontal overflow, one `h1`, one `main`, and no serious/critical Playwright axe violations.
- Production response policy: ZIP `application/zip` + attachment + immutable cache; worker `text/javascript` + `Cache-Control: no-cache` + `Service-Worker-Allowed: /`; homepage has CSP, Permissions Policy, nosniff, referrer policy, and frame protection. All observed landing-page requests were same-origin.
- Lighthouse 13.4.1, production mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 40 ms, CLS 0, TTI 1.2 s. Initial JS remains 1.13 KB, CSS 10.70 KB, and mobile hero 65.16 KB.
- `npx @axe-core/cli` was invoked as required but its downloaded ChromeDriver only supports Chrome 152 while the factory's Playwright Chromium is 145, so the CLI could not create a browser session. The repository's pinned `@axe-core/playwright` scan passed locally and against production with zero serious/critical findings.

## Product and privacy scope preserved

- WXT + TypeScript Manifest V3 extension; static Vite landing site in `dist/site/`.
- Rules remain only in `chrome.storage.local`. No account, analytics, cookies, remote API, third-party script, or remote font was added.
- The established cassette-era field-guide visual system and original asset provenance in `.factory/design.md` are unchanged.

## Known limits and next steps

- Matching still relies on computed CSS colors and cannot reliably label colors baked into canvas, WebGL, video, raster images, gradients, or changing transparent composites.
- It intentionally caps inspection at 8,000 elements and rendered badges at 160; retrain after a site redesign and confirm critical status in the source system.
- The ZIP is an unpacked-development distribution; Chrome Web Store signing/submission remains a separate factory operation.
