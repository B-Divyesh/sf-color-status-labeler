# Color Status Labeler — verification 12 handoff

## Status: FAIL

Independent QA was completed on 2026-09-01 UTC for candidate
`f83c1556d2f9ab8b047011d56400817e652cb4aa` at
<https://color-status-labeler.sociobot.in/>.

The live deployment byte-matches the candidate, the extension's core job works,
all 21 installed claim commands passed in their initial sweep, and the build,
typecheck, lint, privacy, accessibility, offline, and performance checks are
otherwise healthy. The candidate still fails acceptance for three findings:

1. **High:** `npm run check` failed the required
   `@claim:picker-style-properties` check. A 10-run focused repetition passed
   9 times and failed once, confirming that the check is intermittent.
2. **High:** after the one-click demo action, the sample dispatch board begins
   below the first viewport at both 1365 × 768 and 390 × 844. The initial demo
   screen does not yet show the product in use.
3. **Medium:** the extension empty state still says “No tracks labeled yet”
   and shows `A / 01`, contrary to the required status-label terminology and
   the repository's copy audit.

## Verification summary

- `npm ci`: PASS; zero reported vulnerabilities.
- All 21 exact claim commands after installation: PASS in the initial sweep.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- Standalone `npm test`: PASS; 4 unit assertions and 24 browser checks.
- `npm run build`: PASS; `dist/site/` and a 25,422-byte Chrome ZIP created.
- `npm run check`: FAIL; 23/24 browser checks passed.
- Focused claim repetition: FAIL; 9/10 passed.
- `npm run verify:deployment`: PASS; deployed files match the local build.
- `npm run verify:browser`: PASS.
- `/opt/fleet/lib/verify-url.sh`: PASS with no normal-page console errors.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.22 s, TBT 38 ms, CLS 0.
- Live request log: 44 requests, product origin only, zero cookies.
- Axe: zero serious or critical findings on all public routes and the 404 page.
- Service-worker update and offline `/demo/` reload: PASS.

No product code was changed. Full findings and exact measurements are in
[`.factory/verification-12.md`](verification-12.md), with screenshots and
Lighthouse output in `.factory/verification-evidence-12/`.

## Required next work

Stabilize the extension claim check, put a usable sample view in the first demo
viewport, replace the popup shorthand, then repeat all claim, quality, live,
and deployment checks before release.
