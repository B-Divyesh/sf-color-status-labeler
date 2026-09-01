# Verification 13 — Color Status Labeler

## Result: PASS

Verified candidate commit `bf0bf1be1633887c04988514d7a7a926c51992d9` against the researched brief on 2026-09-01 UTC.

- Live URL: <https://color-status-labeler.sociobot.in/>
- Demo URL: <https://color-status-labeler.sociobot.in/demo/>
- Tested archive: `color-status-labeler-chrome-340e9a19f896f840.zip` (25,552 bytes)

## Cold first read

Confirm and check that a new visitor can identify the product, audience, and first action without scrolling. The live first screen states that it labels color-only dashboard statuses, names people with color-vision deficiency, and presents one visible **Try it with sample data** action. Its nearby outcome note says that it opens a sample dispatch board and leaves the visitor's own rules unchanged. This satisfies the plain-words and one-click demo requirement.

## Claim checks

Confirm and check that every exact command listed in `.factory/claims.json` passes from the clean candidate after `npm ci`. Each command used `npm test -- --grep @claim:<id>` and exited successfully. The subsequent full suite independently passed all of the same tagged checks.

| Claim id | Result | Observable evidence checked |
| --- | --- | --- |
| `color-vision-audience` | PASS | First screen names the intended audience and sample-data action. |
| `first-screen-demo` | PASS | Action and outcome note fit both stated cold laptop viewports. |
| `demo-sandbox` | PASS | `/demo/` starts with the sample board, keeps demo data in its separate key, resets, and leaves cleanly. |
| `download-extension` | PASS | Built ZIP validates and loads as the expected Manifest V3 extension. |
| `cache-freshness` | PASS | Current content-addressed download URL returns the current ZIP rather than a former fixed path. |
| `static-build-output` | PASS | Static output contains real routes, worker, designed 404, extension download, and cache rules. |
| `free-download` | PASS | Demo download serves the ZIP without a payment step. |
| `no-account` | PASS | Demo has no account form, cookie, or third-party request. |
| `site-runtime-privacy` | PASS | Home, demo, privacy, terms, and 404 use same-origin runtime resources and set no cookies. |
| `backup-transfer` | PASS | Popup exports valid JSON, rejects malformed JSON, and imports a valid current-site backup. |
| `rule-deletion` | PASS | Popup confirm-deletes, restores with undo, then clears the site rules after confirmation. |
| `page-unchanged` | PASS | Training leaves normal fields, password values, links, and form submission state unchanged. |
| `extension-runtime-privacy` | PASS | Fresh extension profile shows local extension/sample resources only, no cookies, no account fields, and no remote runtime activity. |
| `core-labeling` | PASS | Training a status produces its word badge, pattern, and legend entry. |
| `picker-style-properties` | PASS | Picker labels visible background, top-border, and text-color fixtures. |
| `color-matching-limits` | PASS | Nearby solid colors remain labeled; larger changes do not; gradients are not offered as a background sample. |
| `grayscale-legibility` | PASS | Sample legend retains distinct words and visible patterns under grayscale rendering. |
| `local-rules` | PASS | Saved rule is present only in the current-origin Chrome local storage record. |
| `click-through` | PASS | Rendered badge does not receive pointer input. |
| `rules-return` | PASS | Saved same-site rule returns after reload. |
| `offline-demo` | PASS | Dedicated offline context reloads the cached sample guide and offline notice. |

## Local build and product checks

Confirm and check that the clean install and repository gates complete successfully.

- `npm ci`: PASS — 264 packages installed; npm reported 0 vulnerabilities.
- `npm test`: PASS — 4 Vitest checks and 25 Playwright checks.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS — produced `dist/site/` and the installable ZIP above.

Confirm and check that the main job works through representative normal, boundary, invalid-input, and recovery paths. The real extension profile trains labels for three visible style properties; covers nearby versus materially changed colors and gradients; preserves page controls and values; restores rules after reload; exports/imports data; rejects malformed JSON; supports confirmed deletion, undo, and clear-all; and presents the badge and legend without receiving clicks.

Confirm and check that the published documentation, privacy page, terms page, MIT license, demo contract, visual thesis, and generated-asset provenance are present. The package declares only `storage` and `activeTab`; the product has no sign-in or server endpoint, so account-provider and request-allowance checks do not apply.

## Live deployment, privacy, and headers

Confirm and check that the live deployment is the candidate build. `npm run verify:deployment` passed after comparing live home, routes, assets, icons, service worker, and content-addressed ZIP with the fresh `dist/site/` output. The live ZIP byte-matched the local archive and loaded in a fresh Chromium extension profile.

Confirm and check that public-site runtime activity stays local to the assigned origin. Cold-browser request recording across home, demo, privacy, terms, and 404 observed only `https://color-status-labeler.sociobot.in`; no cookies or site web-storage entries were created. The extension-profile claim check independently recorded its sample/extension resources and confirmed no remote runtime activity.

Confirm and check that live responses include the declared protective and caching headers. Home and legal/demo pages supplied self-only CSP, restrictive Permissions Policy, `X-Content-Type-Options: nosniff`, and strict-origin referrer policy. `/sw.js` supplied `Cache-Control: no-cache` and `Service-Worker-Allowed: /`; immutable code and the content-addressed archive supplied one-year immutable caching. Unknown-route GET returns the designed 404 with HTTP 404.

## Usability, accessibility, and performance

Confirm and check that desktop and 390 px mobile layouts support the product flow. Live Playwright checks passed at both sizes; the inspected desktop home and mobile demo showed no clipping or horizontal overflow. The demo banner, sample dashboard, reset control, and start-for-real control are visible and usable on mobile.

Confirm and check that keyboard and motion behavior are usable. The skip link receives the first Tab focus; Space changes the labelled demo switch; measured focus indicators meet the 3 px and 3:1 thresholds; route and Back navigation focus and announce the destination heading; and reduced-motion mode removes smooth scrolling.

Confirm and check that accessibility fundamentals hold. Playwright AxeBuilder found no serious or critical findings on home, demo, privacy, terms, and 404. `/opt/fleet/lib/verify-url.sh` passed against the live home with a 577 ms observed load, no console/page errors, title, `lang=en`, one `h1`, main landmark, zero images without alternatives, and zero unnamed buttons.

Confirm and check that the static performance budgets are met. Production output reports 3.80 KB raw / 1.63 KB gzip initial JavaScript and 15.28 KB raw / 4.06 KB gzip CSS. The largest mobile hero WebP is 192,250 bytes. These are within the 200 KB JavaScript, 50 KB CSS, and 300 KB hero-image budgets.

## Defects by severity

| Severity | Finding |
| --- | --- |
| Critical | None found. |
| High | None found. |
| Medium | None found. |
| Low | None found. |

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run verify:deployment
npm run verify:browser
```
