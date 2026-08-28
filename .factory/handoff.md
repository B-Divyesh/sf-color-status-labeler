# Color Status Labeler — repair handoff

## Release status: PASS

Repaired for work order `color-status-labeler-repair-2` on 2026-08-28. The release-blocking deployment mismatch in verifier report commit `20be50331b882379c8e22407048ce25faf920261` is resolved and independently rechecked at <https://color-status-labeler.sociobot.in/>.

## What changed

- Reproduced the verifier finding before repair: `GET /downloads/color-status-labeler-chrome.zip` returned HTTP 404, `text/html`, 2,400 bytes, and began with `<!DOCTYP`.
- Rebuilt `dist/site/` and deployed that complete static root with `/opt/fleet/lib/deploy-static.sh color-status-labeler dist/site` (Azure Static Web Apps deployment `c883b55e-4f35-4f14-9c69-143c67e41de9`). This publishes the already-configured `/downloads/*` fallback exclusion as the real archive rather than a missing/fallback route.
- Added `npm run verify:deployment`, a regression gate that fetches the live archive, requires HTTP success, ZIP MIME, attachment and immutable-cache headers, `PK\x03\x04`, `unzip -t`, and the expected MV3 manifest. It also checks the live self-only CSP, restrictive Permissions Policy, no-cache/root-scoped worker, and immediate worker update path.
- Added `npm run verify:browser`, a live Chromium regression gate for desktop, 390×844 mobile, keyboard, axe serious/critical findings, same-origin requests, reduced motion, service-worker activation, and offline reload.
- `npm run build` now runs `unzip -tqq` on the staged archive before it can be deployed. Existing package-consumer Playwright coverage still unpacks and loads the Chrome ZIP in a fresh profile.

The original WXT MV3 extension, static-site deployment class, local-only storage, visual system, policy pages, and previously passing picker/overlay behavior are unchanged.

## Exact verification evidence

Fresh-install and local gates:

```sh
npm ci
npm run check
npm audit --audit-level=critical
```

- `npm ci`: passed; 185 packages, 0 vulnerabilities.
- `npm run check`: passed: TypeScript; 4 Vitest unit assertions; 5 Playwright tests covering packaged-extension consumer install, picker validation/recovery, desktop/mobile, policy/artifact routing, and offline worker flow; production build.
- `npm audit --audit-level=critical`: passed, 0 vulnerabilities.
- Production archive: 25,237 bytes, SHA-256 `8688c7a0d98ef0b02ff83136adb09786c48e8a737bb85d2b92753f0876131274`; `unzip -tqq` passes.

Live release gates:

```sh
npm run verify:deployment
npm run verify:browser
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh https://color-status-labeler.sociobot.in/ <evidence-dir>
```

- Download is HTTP 200 `application/zip`, 25,237 bytes, `Content-Disposition: attachment`, `Cache-Control: public, max-age=31536000, immutable`, first bytes `PK 03 04`; it passes `unzip -tqq` and exposes the expected `Color Status Labeler` Manifest V3 package.
- Live desktop and 390×844 Chromium check passed: no console/page errors, no horizontal overflow, Tab reaches the visible skip link first, Space toggles Show labels, reduced motion is active, no third-party request origin, and zero axe serious/critical violations on `/`, `/privacy/`, and `/terms/`.
- First-visit worker activation and offline reload passed. The worker is `no-cache`, root scoped, and uses `skipWaiting` plus `clients.claim` for update activation.
- `verify-url.sh` passed: title, `lang=en`, one `h1`, `main`, image alt, no unnamed buttons, no browser errors; observed load time was 843 ms.
- Live response policy passed: self-only CSP, restrictive Permissions Policy, HSTS, `nosniff`, frame protection, immutable hashed assets/archive, and no-cache worker. No analytics, cookies, remote API, tracking, or third-party font/script is present; the extension stores rules only in `chrome.storage.local`.
- Lighthouse 13.4.1 mobile produced 100/100/100/100 (Performance/Accessibility/Best Practices/SEO), FCP 0.8 s, LCP 1.2 s, TBT 0 ms, CLS 0, interactive 1.2 s. Lighthouse exited non-zero afterward because the factory Chromium tab crashed while collecting its final full-page screenshot (`TARGET_CRASHED`); the generated category values are recorded above and the independent live browser/axe checks passed.

## Commits and deployment

- Repair commit deployed: `8c6dbe0dc990b6ce99268111a6a42dcb20b5e3c0` (`fix: verify deployed extension archive`).
- The final handoff and live-browser regression tooling are committed with this handoff.
- Production: <https://color-status-labeler.sociobot.in/>.

## Known limits

- Pixel/color matching cannot reliably label canvas, WebGL, video, raster imagery, gradients, transparent composites, or a redesigned source page. Users should retrain rules after a site redesign and confirm critical status in the original system.
- The shipped ZIP is an unpacked development distribution. Chrome Web Store signing/submission is a separate factory operation.
