# Verification 1 — FAIL

Verified 2026-08-28 for work order `color-status-labeler-verify-1`.

- Candidate: `0fd1b396ebd47528d0a6d508c7a5d3d25d50a4f2`
- Repository state at start: clean checkout on that exact commit.
- Public URL: <https://color-status-labeler.sociobot.in/>
- Verdict: **FAIL**. The production download is not an extension archive, so a user cannot install the product from the public site. The deployed offline shell also does not register or serve an offline reload.

## Release-blocking findings

### Critical — public extension download is missing

`https://color-status-labeler.sociobot.in/downloads/color-status-labeler-chrome.zip` returns the landing page, not a ZIP:

- HTTP `200`, `content-type: text/html`, 7,279 bytes.
- SHA-256 of response: `08c2bc410bd7a7f93e334f7666c5d492f454d3469987c54806de6bf2ff507c80`, exactly the deployed `index.html`.
- The locally built candidate archive exists at `dist/site/downloads/color-status-labeler-chrome.zip`, is 25,064 bytes, and SHA-256 `23e8656a45cb66075fff62de2f9cfe9fd05c35b2f82d07957dc88a3fe108f406`.

The live download link therefore downloads HTML. It cannot be unzipped and loaded in Chrome/Edge, which breaks the brief's smallest useful product end to end. This is a deployment artifact omission/routing failure, not a source-build failure.

### High — deployed offline shell does not activate

On a fresh Chromium profile at the public HTTPS URL, after 12 seconds `navigator.serviceWorker.getRegistration()` was `null`; an offline reload failed with `net::ERR_INTERNET_DISCONNECTED`. The worker URL was fetched and a `csl-site-v1` cache existed, but no registration remained attached to the page. No browser-console or page errors were emitted.

The same local production build activates its worker and the repository's offline Playwright test passes. The live `sw.js` SHA-256 matches the candidate, so this is another deployment/runtime discrepancy. Service-worker update behavior cannot pass while first activation fails.

## Non-blocking findings

### Medium — invalid whitespace labels are silent

In the real extension picker, a label containing only spaces leaves the dialog open and refocuses `Status label`, but provides no visible error text or `aria-live` announcement. A keyboard or screen-reader user is not told why Save did nothing. Replacing it with `Ready` recovers and saves correctly. This does not meet the stated error-feedback/accessibility baseline.

### Medium — production response policy and cache lifetime are weak

The live homepage and hashed JS are served with `Cache-Control: public, must-revalidate, max-age=30`; hashed immutable assets are not long-lived/immutable. The checked responses have HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`, but no `Content-Security-Policy` or `Permissions-Policy`. This is not the cause of the broken download, but should be hardened before release.

## Local candidate verification

All commands were run after `npm ci` from the clean candidate checkout:

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 185 packages audited, 0 vulnerabilities. |
| `npm run typecheck` | Pass. |
| `npm test` | Pass: 4 Vitest assertions; 4 Playwright tests including an unpacked MV3 picker/overlay path, desktop/mobile site, legal pages, and local offline reload. |
| `npm run build` | Pass; produces `dist/site/` and `dist/site/downloads/color-status-labeler-chrome.zip`. |
| `npm audit --audit-level=critical` | Pass; 0 vulnerabilities. |

No lint script is defined in `package.json`; `typecheck` is the available static check.

Independent extension exercises against the production build passed:

- Picker cancellation works with Escape; dialog cancellation works with Escape.
- Pointer flow: sample a green status, choose dots, save `Ready`; a local-storage rule, non-intercepting badge, and compact legend appear.
- Keyboard flow: focus a colored button during picker mode and press Enter; `Keyboard status` saves and appears in the legend.
- Boundary: a requested 33-character label is constrained to 32 characters and saves at that limit.
- 390 px viewport: no document overflow; picker dialog was 358 px wide and legend 260 px wide.
- Popup protected-page state: title, one `h1`, and one `main` present; axe found no serious/critical violations and no page/console errors.

Privacy review found only `chrome.storage.local` for rules. The manifest requests only `storage` and `activeTab`; source and observed landing-page requests contain no analytics, remote API, third-party font, script, or tracking origin. Page requests were same-origin only.

## Accessibility, responsive, and performance evidence

- Local desktop and 390 x 844 mobile scans of `/`, `/privacy/`, and `/terms/`: one `h1`, one `main`, and zero axe serious/critical findings on every page.
- Keyboard activation of the landing-page Show labels switch works. Its visible focus is a 3 px solid `rgb(20, 91, 115)` outline.
- No horizontal overflow at 390 px. Under reduced motion, transition duration is `0s` and root scrolling is `auto`.
- Local console/page errors: none in independent page, popup, or extension-flow checks.
- Candidate output: initial site JS 1,134 B, CSS 10,698 B, mobile hero 65,156 B, desktop hero 192,250 B, unpacked extension 45,141 B. All are within the stated local bundle budgets.

## Deployment comparison and headers

The deployed candidate shell is otherwise current: `index.html`, both CSS/JS assets, both hero WebPs, `sw.js`, privacy page, and terms page each matched the local candidate byte-for-byte by SHA-256. The only checked expected artifact that differed was the omitted ZIP.

Live mobile browser check: correct title, one `h1`, one `main`, no horizontal overflow, zero axe serious/critical findings, no page/console errors, and same-origin requests only. The public response has HSTS/referrer/nosniff protections noted above, but lacks CSP and Permissions-Policy and does not cache hashed files immutably.

## Required next steps

1. Deploy `dist/site/downloads/color-status-labeler-chrome.zip` as a real binary file at the linked URL; verify ZIP MIME/content and an unpack/load flow in Chrome.
2. Diagnose why the production service-worker registration disappears, then verify first install, update, and offline reload on the public origin.
3. Add an announced validation message for an all-whitespace label.
4. Configure immutable caching for hashed assets and add CSP/Permissions-Policy at deployment.

