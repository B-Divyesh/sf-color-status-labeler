# Color Status Labeler — repair 9 handoff

## Release status: ready for deployment verification

This repairs the two release blockers in independent verification 9 for
candidate `7b49b1dbb6afb4521911ada9ed0dd1e958d94009`.

## What changed

- Registered the README's content-addressed-release promise as the new
  `cache-freshness` claim in `.factory/claims.json` and tagged its existing
  end-to-end regression. The test waits for the controlled worker, places a
  stale archive at the former fixed URL, then proves that the current
  content-addressed download returns a real ZIP instead.
- Fixed the 390 px / 200% text layout. Mobile grid children can now shrink,
  display headings may wrap long words, and hero buttons wrap their text.
  The exact regression checks document width and every visible header, main,
  and footer descendant/control bounding box after root text is set to 200%.

## How verified locally

- `npm ci` — pass; 264 packages installed, 0 vulnerabilities.
- Every literal command in `.factory/claims.json` — pass. This includes all
  15 claims, including `npm test -- --grep @claim:cache-freshness`.
- `npm run check` — pass: TypeScript, ESLint, 4 unit assertions, 16 Playwright
  tests, MV3 package build, and static production build.
- `npm audit --audit-level=critical` — pass; 0 vulnerabilities.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ <temp-dir>` — pass:
  HTTP 200, title, `lang=en`, one main landmark, image alternatives, and no
  browser console/page errors.
- `npm run verify:browser -- http://127.0.0.1:4173/` — pass: desktop and
  390 px mobile, keyboard, Axe serious/critical checks, privacy request and
  cookie checks, service-worker update, and offline reload.
- Chromium Lighthouse 12.8.2 against the production preview — Performance
  100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s,
  TBT 0 ms, CLS 0, 74 KiB transfer.
- The built `dist/site/downloads/color-status-labeler-chrome-0225e2c5ce3d892b.zip`
  passed `unzip -tqq`; its Manifest V3 package loaded in Chromium and declares
  only `storage` and `activeTab`.

## Build and deploy

```sh
npm ci
npm run check
npm run build
```

Deploy `dist/site/`. It contains the content-addressed extension ZIP and
`staticwebapp.config.json` response policy. After deployment, run:

```sh
npm run verify:deployment
npm run verify:browser
```

## Known gaps and next step

No known product gaps remain locally. The remaining step is to push this
repair through the configured static deployment and record the live identity,
browser, response-policy, cache, and offline checks below.
