# Polish 2 — review repair map

Reviewed base: `6b508bdfc337560384b8764c66ddc3e3b4055518`.
Repair commits: `e5b2ca9436f55e8534ff9f6806380c29d9a429f0` and
`d292b20`. Production was deployed from `dist/site/` and verified at
<https://color-status-labeler.sociobot.in/> on 2026-09-01 UTC.

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Reduced the laptop headline scale and hero spacing, widened the copy track, and kept the sample action plus outcome note in the cold viewport. | `@claim:first-screen-demo`; `live-checks.json` records action/note bottoms at 550.7/606.1px in 1365×768 and 521.0/576.3px in 1280×720; `live-cold-1365x768.png`; `live-cold-1280x720.png`. |
| F-2-2 | Kept the README capability and added a real packaged-extension test for background, top-border, and text-color sampling. It saves each selected property and observes its badge. | `npm test -- --grep @claim:picker-style-properties`; clean-clone pass. |
| F-2-3 | Replaced vague limitation claims with exact behavior: nearby solid colors match; gradients and larger changes do not. The real extension test exercises all three cases. | `npm test -- --grep @claim:color-matching-limits`; live copy at `/#limits`. |
| F-2-4 | Rewrote deployment copy to the exact shipped behavior and registered `static-build-output`. The test checks the built host policy, routes, worker, ZIP policy, cache policy, and designed 404. | `npm test -- --grep @claim:static-build-output`; `npm run verify:deployment`; unknown live URL returns the designed page with HTTP 404. |
| F-2-5 | Renamed **Good to know** to **Color-matching limits**. | `npm run verify:browser`; live `/` check. |
| F-2-6 | Renamed the section **How labels stay readable and local**. | `npm run verify:browser`; live `/` check. |
| F-2-7 | Renamed the feature **Does not change page controls**. | `npm run verify:browser`; live `/` check. |
| F-2-8 | Replaced the README’s WCAG/operating-aid jargon with two direct safety instructions. | `.factory/copy-audit.md`; clean-clone lint and tests. |

## Earlier findings rechecked

| Finding | Current state | Evidence |
| --- | --- | --- |
| F-1-1 | Route navigation and Back focus and announce the destination `h1`. | `route navigation and Back place focus…`; production `npm run verify:browser`. |
| F-1-2 | README opening remains two short sentences. | `.factory/copy-audit.md`. |
| F-1-3 | Deployment copy is short, concrete, registered, and tested. | `@claim:static-build-output`. |
| F-1-4 | Preview label remains **Sample dashboard preview**. | Live `/`; `live-cold-1280x720.png`. |
| F-1-5 | Setup label remains **Set up a status label**. | Live `/`; full browser suite. |
| F-1-6 | Step 2 remains **Choose a label and pattern**. | Live `/`; full browser suite. |
| F-1-7 | Step 3 remains **Read labeled matching statuses**. | Live `/`; full browser suite. |
| F-1-8 | Warning stamp remains **COLOR-MATCHING LIMITS**. | Live `/`. |
| F-1-9 | Limits heading remains **Limits of color matching**. | Live `/`. |
| F-1-10 | Preview instruction remains **Turn labels on or off**. | `@claim:color-vision-audience`; keyboard switch test. |
| F-1-11 | Technical pixel wording is gone; the remaining matching language is exact and tested. | `@claim:picker-style-properties`; `@claim:color-matching-limits`. |
| F-1-12 | Copy says badges do not block clicks. | `@claim:click-through`. |
| F-1-13 | Grayscale wording remains registered and tested with distinct rendered patterns. | `@claim:grayscale-legibility`. |
| F-1-14 | Site runtime privacy remains registered across every public route. | `@claim:site-runtime-privacy`; `live-checks.json` contains only the product origin and no cookies. |
| F-1-15 | The compact action remains **Download extension** at 390px. | `live-cold-390x844.png`; 44px target regression. |

## Additional live defect closed

The final live pass found that an arbitrary unknown path still received the
home page with HTTP 200. This multi-page site no longer uses an SPA fallback,
and its service worker now preserves online 404 responses. A cold request to
`/not-a-real-route-polish-2` returns HTTP 404 with the title **Page not found —
Color Status Labeler**. This is recorded in `live-checks.json` and enforced by
`scripts/verify-live-browser.mjs`.

## Final evidence

- Clean clone: `/tmp/color-status-labeler-polish2-final.JGpyFL`, commit
  `d292b20`; `npm ci` and `npm run check` passed.
- Complete suite: 4 Vitest assertions and 24 Playwright tests passed.
- All 21 literal `.factory/claims.json` commands passed independently.
- Live identity: `npm run verify:deployment` passed; archive SHA-256
  `896d362ae8b82ab134e4808c4025bb9af1684fa355692d5156038b071b848d8e`.
- Live browser: `npm run verify:browser` and `/opt/fleet/lib/verify-url.sh`
  passed with no console errors.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.8s, LCP 1.2s, TBT 0ms, CLS 0.
- Evidence directory: `.factory/polish-2-artifacts/`.

No review finding remains open.
