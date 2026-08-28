# Verification 3 — FAIL

Verified 2026-08-28 for work order `color-status-labeler-verify-3`.

- Candidate commit: `8abf5c41e6b1844c1e1bbf94ae3d668f87596bff`
- Checkout at start: clean and exactly on the candidate
- Production URL: <https://color-status-labeler.sociobot.in/>
- Verdict: **FAIL — release blocked.** The candidate builds a working browser extension, but the public download still returns an HTML 404. A new user cannot install the product from any of the landing page's download links.

This is fresh evidence. It supersedes the prior handoff's PASS claim and independently reproduces the deployment-only failure reported in Verification 2.

## Defects by severity

### Critical — production does not serve the extension archive

At 2026-08-28 03:57 UTC:

```text
GET https://color-status-labeler.sociobot.in/downloads/color-status-labeler-chrome.zip
HTTP/2 404
content-type: text/html
content-length: 2400
first bytes: 3c 21 44 4f 43 54 59 50 45 (<!DOCTYPE)
SHA-256: 0a76274e99e285c9d7e18d094e71ea6fca1b0274e30c28492a24218e53c61cb3
```

`npm run verify:deployment` failed for that exact reason. The exact candidate build instead emits a valid 25,237-byte Manifest V3 archive at `dist/site/downloads/color-status-labeler-chrome.zip`, SHA-256 `8688c7a0d98ef0b02ff83136adb09786c48e8a737bb85d2b92753f0876131274`; `unzip -t` passes and it loads in a clean Chromium profile.

The deployment shell is the candidate, but the deployment is incomplete. Eleven checked shell resources (`/`, privacy, terms, JS, CSS, both hero images, worker, icon, robots, and sitemap) matched the candidate build byte-for-byte. The archive is the only checked expected artifact absent. The live response also necessarily lacks the configured ZIP MIME type, attachment disposition, and immutable cache policy.

### Medium — focus indicators do not consistently meet the required 3:1 contrast

Keyboard operation works, but several computed focus outlines fail the acceptance contract's 3:1 focus-indicator contrast:

- Final download CTA: `#145B73` outline on the identical `#145B73` section background, **1:1**; the focus change is visually lost.
- Demo switch: `#145B73` outline on `#171512`, **2.41:1**.
- Extension popup/dialog controls: `#F2C94C` outline on `#F6F0DE`, **1.39:1**. The picker cancel control can place yellow against the same yellow picker surface.

The skip link is good: Tab reaches it first and Chromium computed a 3px solid `#145B73` outline on paper. Axe and Lighthouse do not test focus-indicator contrast, which is why their scans remain clean.

### Medium — some non-inline navigation targets are under 44 CSS px high

At the 390px viewport, measured landing-page targets included the home brand at `190 × 35.5`, Privacy at `67.2 × 24.8`, and Terms at `47.5 × 24.8` CSS px. The extension popup's footer Privacy link measured `44 × 14`. These are below the supplied 44×44 touch-target baseline. Hidden mobile nav links and the 34px switch input were excluded; the switch's enclosing clickable label is 54px high.

## Clean local gates

All commands ran after fresh `npm ci` from the clean candidate checkout.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 185 packages audited, 0 vulnerabilities. |
| `npm audit --audit-level=critical` | Pass; 0 vulnerabilities. |
| `npm run check` | Pass: TypeScript, 4 Vitest unit tests, 5 Playwright integration/e2e tests, and exact production build. |
| `npm run build` | Pass; produces `dist/site/` and the installable Chrome ZIP. |
| Lint | No lint script is defined; `tsc --noEmit` is the available static check and passed. |

The five repository browser tests cover the packaged extension, picker validation/recovery, desktop/mobile site, policy/artifact routing, and offline reload. The unpacked extension is 45,756 bytes. Site budgets pass: initial JS 1,134 bytes, CSS 10,698 bytes, mobile hero 65,156 bytes, desktop hero 192,250 bytes, and no downloaded font.

## Independent end-to-end extension exercise

I unpacked the exact candidate ZIP into a new temporary directory and loaded it as the only extension in a fresh Chromium profile.

- Trained two colors on `http://127.0.0.1:4174`; all 20 representative status buttons received the correct word-and-pattern overlay (20/20).
- Changed one status dynamically from the first color to the second; after mutation refresh, classification remained 20/20 (9 first-label and 11 second-label matches).
- Trained a separate rule on `http://localhost:4174`; two distinct `chrome.storage.local` keys confirmed per-origin isolation and no rule leaked between sites.
- Submitted a whitespace-only label and received the visible `role="alert"` guidance, `aria-invalid="true"`, refocus, and successful recovery.
- A 33-character entry was constrained to the 32-character boundary and saved.
- Pointer and keyboard picker paths worked. Escape cancelled both picker and dialog. The dialog trapped forward/reverse Tab focus.
- At 390×844 the extension caused no horizontal overflow; legend width was 260px and dialog width 358px.
- Overlay badges were `aria-hidden`, `pointer-events: none`, and did not prevent the underlying test button click.
- The popup exported a valid version-1 JSON backup. Valid import kept the active origin, trimmed a label, rejected an invalid rule, clamped tolerance from 99 to 50, and regenerated the rule ID. Invalid JSON produced recovery guidance. Confirmed delete followed by `U` restored the rule.
- Popup and picker-dialog axe scans found zero serious/critical findings. No console/page errors occurred. Observed web requests were limited to the two exercised local origins.

This exceeds the brief's 95%/20-state pilot threshold in the controlled representative fixture. It does not remove the documented limitation that pixel matching can be wrong on real redesigned, composited, canvas, video, or image-based interfaces.

## Live browser, accessibility, privacy, and PWA evidence

`npm run verify:browser` passed on the live origin. An additional independent Chromium run found:

- `/`, `/privacy/`, and `/terms/`: correct titles, `lang="en"`, exactly one `h1`, one `main`, zero axe findings of any severity, and no console/page errors.
- Desktop and 390×844 screenshots were visually inspected; content is legible, responsive, and has no horizontal overflow (`scrollWidth = clientWidth = 390`).
- Tab reaches the visible skip link first; Space toggles Show labels. Reduced motion computes root scrolling and tested transitions to `auto`/`0s`.
- All seven observed request URLs were same-origin. Chromium had no cookies and empty local/session storage for the site. Source/runtime inspection found no analytics, telemetry, remote API, third-party font, or third-party script. The extension manifest requests only `storage` and `activeTab`; rules use `chrome.storage.local`.
- The live service worker was active, controlling the root scope, and `registration.update()` completed. It is served with `Cache-Control: no-cache` and `Service-Worker-Allowed: /`; source contains `skipWaiting()` and `clients.claim()`.
- Live offline reload rendered the guide and offline notice. A controlled local two-revision exercise replaced the active worker, activated the new cache, removed the prior cache, retained control, and then passed offline reload.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title/lang/main/alt/button checks, no browser errors, and 944ms observed load.

Fresh Lighthouse 13.4.1 mobile results: **99 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; FCP 1.1s, LCP 1.2s, TBT 90ms, CLS 0, interactive 1.3s, total transfer 71 KiB. Lighthouse has no lab INP value; TBT is recorded as the available responsiveness proxy.

## Response policy and caching

The live HTML and static assets carry the candidate's self-only CSP, restrictive Permissions Policy, HSTS, `nosniff`, strict-origin referrer policy, and frame denial. Hashed JS/CSS and hero assets use `public, max-age=31536000, immutable`; HTML uses 30-second revalidation; the worker uses `no-cache`. These pass the intended policy except at the missing download route, which is an unprotected HTML 404 rather than the configured immutable attachment.

## Required remediation

1. Publish the exact built archive as a real binary at `/downloads/color-status-labeler-chrome.zip`; verify HTTP 200, ZIP MIME, attachment disposition, immutable caching, `PK\x03\x04`, `unzip -t`, and a fresh browser load from the public response.
2. Fix focus indicator colors so every focused control has at least 3:1 contrast against adjacent pixels, including the final CTA, dark demo, popup, and picker dialog.
3. Increase non-inline navigation/link hit areas to at least 44×44 CSS px.
4. Re-run this complete live comparison before changing release status to PASS.
