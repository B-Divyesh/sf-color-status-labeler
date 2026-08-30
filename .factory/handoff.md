# Color Status Labeler — polish 1 handoff

## Status

Repair commit `d76dc04` fixes every finding in [review-1.md](review-1.md).
It and the evidence commits `a35aeaa` and `65f2d06` are pushed to `main`.
The static host has not yet consumed those commits, so final live verification
is pending deployment propagation.

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

The deployable artifact remains `dist/site/`. The final cold check at
`https://color-status-labeler.sociobot.in/` still served the prior artifact:
it lacks “Download extension”, “COLOR-MATCHING LIMITS”, and
`#route-announcement`; the live verifier correctly fails while looking for
that missing route announcement. After the static deployment updates, run:

```sh
npm run verify:deployment
npm run verify:browser
```

Then visit `https://color-status-labeler.sociobot.in/` cold, use **Try the
demo**, navigate Back, and verify the destination `h1` receives focus.

## Known gaps

No source, test, build, or product gap remains locally. The only outstanding
item is static-host propagation of the already pushed `main` branch. Once the
host updates, the two commands above provide the required live evidence.
