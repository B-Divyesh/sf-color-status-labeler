# Verification 4 — FAIL

Verified 2026-08-28 (UTC) for work order `color-status-labeler-verify-4`.

- Candidate commit: `bc950d4bcac5c39e756f8d4a12b7797ba4429b88`
- Checkout: clean at the requested candidate before verification
- Production URL: <https://color-status-labeler.sociobot.in/>
- Verdict: **FAIL — release blocked.** The production download linked by the product is still a 404 HTML page, so a new user cannot install the extension.

This is fresh evidence, not a reliance on the prior deployment report. The candidate's local package is valid, but production has not published it.

## Defects by severity

### Critical — the public installation artifact is absent

At 2026-08-28 05:06:53 UTC:

```text
GET https://color-status-labeler.sociobot.in/downloads/color-status-labeler-chrome.zip
HTTP/2 404
content-type: text/html
body: 2,400 bytes
first bytes: 3c 21 44 4f 43 54 59 50 45 20 68 74 6d 6c 3e 0d (<!DOCTYPE html...)
```

`npm run verify:deployment` independently failed at the same first requirement: expected HTTP 200 for that URL and received 404. Thus the route has neither a ZIP payload nor the required attachment disposition, ZIP MIME type, or immutable archive-cache policy. Every primary landing-page download link targets this URL, making the real job-to-be-done unavailable despite a working locally built package.

The exact production build does contain a valid archive:

```text
dist/site/downloads/color-status-labeler-chrome.zip
size: 25,254 bytes
SHA-256: 8145e8e7918b228e9e7ca76ff2a91fbdc34a34f5458ea801c1c188930dcda346
```

`unzip -tqq` passes during the build and the repository's Chromium extension test loads the ZIP in a fresh profile. `color-status-labeler-chrome.bin` is byte-identical locally, so the deployment's configured ZIP-to-BIN rewrite has not resulted in a served public file.

## Clean local gates

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 185 packages installed/audited. |
| `npm audit --audit-level=critical` | Pass; 0 vulnerabilities. |
| `npm run typecheck` | Pass. No lint script is defined; TypeScript is the available static check. |
| `npm test` | Pass; 4 Vitest unit tests and 6 Playwright browser tests. |
| `npm run build` | Pass; exact extension ZIP and deployable `dist/site/` produced. |

The extension build is 45.88 KB unpacked and 25,254 bytes zipped. The initial site JavaScript is 1,134 bytes and CSS 10,952 bytes; the mobile hero is 65,156 bytes and desktop hero 192,250 bytes. These are within the supplied static-product budgets; no remote font is loaded.

The shipped end-to-end coverage loads the packaged MV3 extension in Chromium and exercises picker selection, a whitespace-only label error and recovery, a saved word-and-pattern overlay, local storage, click-through badges, keyboard picker selection, Escape cancellation, popup axe, and 390px layout. The site tests cover the guide, artifact routing policy, mobile overflow, visible-focus measurements, and service-worker offline reload. I also inspected the build output and manifest: permissions are limited to `storage` and `activeTab`.

## Live verification evidence

`npm run verify:browser` **passed** against production. It verified the following on the live origin:

- Desktop and 390x844 mobile layouts have no horizontal overflow; keyboard Tab reaches the skip link first, Space operates the demo switch, focus indicators meet the script's 3px/3:1 check, and reduced-motion scrolling is disabled.
- `/`, `/privacy/`, and `/terms/` each have `lang="en"`, exactly one `h1`, exactly one `main`, and zero serious/critical axe findings. There were no console or page errors.
- All observed page requests were same-origin; Chromium recorded no cookies and empty local/session storage. Runtime/source review found no analytics, third-party runtime script, remote API, or downloaded font. Extension rules use `chrome.storage.local` per origin.
- The live service worker registers at root scope, passes an explicit `registration.update()`, and reloads the guide with the offline notice while offline.

`/opt/fleet/lib/verify-url.sh` also passed for the landing page: HTTP 200, 648 ms observed load, title present, `lang=en`, one `h1`, a main landmark, no missing image alt text, no unlabeled buttons, and no browser errors.

The normal live shell is exactly the candidate build. SHA-256 comparisons matched local and live copies of `/`, `/privacy/`, `/terms/`, `/sw.js`, the hashed JS and CSS, both hero images, `icon.svg`, `robots.txt`, and `sitemap.xml`. Response-policy spot checks found self-only CSP, restrictive Permissions Policy, HSTS, `nosniff`, frame denial, and strict-origin referrer policy. HTML has 30-second revalidation, hashed assets are one-year immutable, and `sw.js` is `no-cache` with `Service-Worker-Allowed: /`.

I attempted a fresh Lighthouse 13.4.1 run with the supplied Playwright Chromium. Lighthouse itself reported a browser-tab crash, while Playwright against that same Chromium completed all live checks above; no Lighthouse score is asserted from this run. This does not change the critical deployment verdict.

## Required remediation and re-verification

Publish the exact built archive bytes at the configured production route (or make the ZIP-to-BIN rewrite actually resolve) and then re-run `npm run verify:deployment`. The rerun must establish HTTP 200, ZIP signature, attachment disposition, ZIP MIME type, immutable caching, archive integrity, and fresh Chromium installation from the public response. Do not mark this candidate PASS until that succeeds.
