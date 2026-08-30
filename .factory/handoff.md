# Color Status Labeler — polish 1 handoff

## Status

Repair commit `d76dc04` fixes every finding in [review-1.md](review-1.md).
It has been pushed to `main`; final live deployment verification is pending the
static deployment update.

## What changed

- Added reliable destination-heading focus and polite route announcement for
  internal navigation and Back, without disrupting cold-load skip-link order.
- Rewrote the reviewed vague, decorative, technical, and overlong public copy.
- Made the compact mobile action explicitly say **Download extension**.
- Added real `grayscale-legibility` and public `site-runtime-privacy` claims,
  each with a tagged observable browser test. The demo’s missing Bars pattern
  now has an actual visual pattern.
- Kept the isolated `/demo/` and `?demo=1` path, persistent banner, reset, and
  start-for-real boundary intact.
- Added the required catalog description and updated the copy audit.

## Verification

From the fresh clone at `/tmp/color-status-labeler-clean.s4w09X`:

```sh
npm ci
npm run check
```

Both passed: 4 unit assertions, 19 Playwright tests, typecheck, lint, real
extension package build, static site build, Axe route scans, offline reload,
mobile/200% text checks, metadata/404 checks, and privacy request checks.
Every one of the 17 literal `claims.json` test commands also passed separately
in that clean clone. Local command logs and screenshots are committed under
`.factory/polish-artifacts/`. See [polish-1.md](polish-1.md) for the one-to-one
finding map and evidence.

`node scripts/verify-live-browser.mjs http://127.0.0.1:4173/` also passed
against the local production build, including the new route-focus and Back
checks.

## Deploy and verify

The deployable artifact remains `dist/site/`. After the static deployment
updates, run:

```sh
npm run verify:deployment
npm run verify:browser
```

Then visit `https://color-status-labeler.sociobot.in/` cold, use **Try the
demo**, navigate Back, and verify the destination `h1` receives focus.

## Known gaps

No product gaps remain locally. This handoff will be amended with the live
URL evidence once the pushed static deployment is observable.
