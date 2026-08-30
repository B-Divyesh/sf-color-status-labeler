# Polish 1 — review repair map

Repair commit: `d76dc04` (base reviewed: `924900e39658132d003f11fd90e986c995ae7b50`).
Local evidence is retained under `.factory/polish-artifacts/`. The final live
recheck is recorded below after the static deployment picks up this commit.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Each route `h1` now has `tabindex="-1"`. Internal navigation and Back focus it without scrolling and update a polite route announcement. Cold entry preserves normal skip-link order. | `route navigation and Back place focus on the destination heading and announce it`; `screenshots/demo-route-focus.png`; live `/` → `/demo/` → Back check. |
| F-1-2 | Split the README opening into two short, plain sentences. | `.factory/copy-audit.md`; clean-clone `npm run check`. |
| F-1-3 | Replaced the 33-word deployment sentence with three concrete sentences. | `.factory/copy-audit.md`; clean-clone `npm run check`. |
| F-1-4 | Replaced “SIDE B · LIVE TEST” with “Sample dashboard preview.” | `screenshots/home-desktop.png`; live `/` check. |
| F-1-5 | Replaced “MAKE YOUR OWN LEGEND” with “Set up a status label.” | `screenshots/home-desktop.png`; live `/` check. |
| F-1-6 | Replaced “NAME THE SIGNAL” with “Choose a label and pattern.” | `screenshots/home-desktop.png`; live `/` check. |
| F-1-7 | Replaced “USE THE LIVE LEGEND” with “Read labeled matching statuses.” | `screenshots/home-desktop.png`; live `/` check. |
| F-1-8 | Replaced “CHECK THE TAPE” with “COLOR-MATCHING LIMITS.” | `screenshots/home-desktop.png`; live `/` check. |
| F-1-9 | Replaced “A HELPER, NOT A GUARANTEE” with “Limits of color matching.” | `screenshots/home-desktop.png`; live `/` check. |
| F-1-10 | Replaced “Try the switch” with “Turn labels on or off.” | `@claim:color-vision-audience`; `screenshots/home-mobile-390.png`; live `/` check. |
| F-1-11 | Replaced implementation wording with “colors it can see on the screen” and “visible background, border, or text color.” | `.factory/copy-audit.md`; live `/` and README review. |
| F-1-12 | Replaced “click-through badges” with “badges that do not block clicks.” | `npm test -- --grep @claim:click-through`; clean-clone claim log. |
| F-1-13 | Added `grayscale-legibility` to `claims.json`, tested under a grayscale filter, and added the missing Bars pattern rendering. | `npm test -- --grep @claim:grayscale-legibility`; `claims/grayscale-legibility.log`. |
| F-1-14 | Added `site-runtime-privacy` to `claims.json`; it records requests across every public route and asserts same-origin only plus no cookies. Footer and README now use matching runtime wording. | `npm test -- --grep @claim:site-runtime-privacy`; `claims/site-runtime-privacy.log`. |
| F-1-15 | Renamed every compact header action to “Download extension.” | `screenshots/home-mobile-390.png`; live 390 px `/` check. |

## Verification

- Clean clone: `/tmp/color-status-labeler-clean.s4w09X`, `npm ci`, then
  `npm run check` — pass (4 unit assertions, 19 Playwright tests, static build).
- Every literal command in `.factory/claims.json` ran independently in that
  clean clone — all 17 pass. The corresponding clean-clone logs are under
  `clean-claim-logs/` in that clone; committed local-command logs are under
  `polish-artifacts/claims/`.
- Local screenshots: `polish-artifacts/screenshots/home-desktop.png`,
  `home-mobile-390.png`, and `demo-route-focus.png`.
- Integrated Axe checks report no serious or critical finding on home, demo,
  privacy, terms, and 404. The suite covers offline reload, request privacy,
  390 px layout, 200% text, keyboard controls, route metadata, and the real
  MV3 extension flow.

## Live recheck

Pending deployment of `d76dc04` at the time this file was first written.
