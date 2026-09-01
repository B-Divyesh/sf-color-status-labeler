# Color Status Labeler — polish 2 handoff

## Status: PASS

Every finding in `.factory/review-1.md` and `.factory/review-2.md` is fixed,
tested, deployed, and rechecked on production. The repair is in commits
`e5b2ca9` and `d292b20` on `main`.

## What changed

- Moved the full sample-data decision path into the 1365×768 and 1280×720
  first viewport while preserving the cassette-era field-guide identity.
- Kept `/demo/` and `?demo=1` one-click, isolated, resettable, and visibly
  marked as sample data.
- Added four claim regressions: cold first-screen placement, picker support for
  background/top-border/text colors, exact color-matching limits, and static
  build/deployment behavior. All 21 claims have one matching test tag.
- Replaced every reviewed vague heading and the picker’s signal/hue jargon with
  direct status-label language.
- Removed the accidental SPA fallback. Unknown URLs now return the designed
  404 page with HTTP 404, while real page routes and offline demo reload remain
  intact.
- Updated the catalog description, copy audit, design note, README, claims
  manifest, and round-2 finding map.

## Verification

Fresh clone `/tmp/color-status-labeler-polish2-final.JGpyFL` at `d292b20`:

```sh
npm ci
npm run check
```

This passed typecheck, lint, 4 Vitest assertions, 24 Playwright tests, and the
production build. Each of the 21 literal claim commands in
`.factory/claims.json` then passed independently. `npm audit
--audit-level=critical` reports zero vulnerabilities.

The build produces `dist/site/`, a 46.43KB unpacked Manifest V3 extension, and
a 25,422-byte ZIP. Initial site JavaScript is 3,804 bytes, CSS is 14,959 bytes,
and the mobile hero is 65,156 bytes.

## Production evidence

Deployed the built `dist/site/` artifact to the existing
`sf-color-status-labeler` Static Web App without changing DNS or any other
resource.

- Site: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>
- `npm run verify:deployment`: pass; every deployed route, asset, worker, and
  extension ZIP matches the local build.
- `npm run verify:browser`: pass; desktop/mobile layout, viewport placement,
  focus and Back behavior, Axe, privacy, worker update, and offline reload.
- `/opt/fleet/lib/verify-url.sh`: pass; title, `lang`, `h1`, `main`, image text,
  buttons, and console checks.
- Cold viewport evidence: action bottom 550.7px and note bottom 606.1px at
  1365×768; action bottom 521.0px and note bottom 576.3px at 1280×720.
- `/not-a-real-route-polish-2`: HTTP 404 with the designed 404 title.
- `?demo=1`: redirects to `/demo/`; editing writes only
  `demo:color-status-labeler:sample-v1`; Reset removes it.
- Requests observed across the live route/demo flow: product origin only, no
  cookies, and no console errors.
- Live Lighthouse 12.8.2: 100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; FCP 0.8s, LCP 1.2s, TBT 0ms, CLS 0.

See `.factory/polish-2.md` for every finding mapped to its change and evidence.
Raw screenshots, Lighthouse JSON, and live checks are in
`.factory/polish-2-artifacts/`.

## Known gaps and next steps

None.
