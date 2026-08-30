# Color Status Labeler — repair 9 handoff

## Release status: PASS — deployed and verified

This repairs the two release blockers in independent verification 9 for
candidate `7b49b1dbb6afb4521911ada9ed0dd1e958d94009`.

- Repair commit: `06adc0bd06621281bf3cf489ad506d5eeae2fc9a`
- Deployment: `0d6c9152-2547-43be-9189-1a431f11ef35`
- Production: <https://color-status-labeler.sociobot.in/>

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
`staticwebapp.config.json` response policy. This repair was deployed with:

```sh
/opt/fleet/lib/deploy-static.sh color-status-labeler dist/site
```

Then verify:

```sh
npm run verify:deployment
npm run verify:browser
```

## Known gaps and next step

No known gaps remain. Live deployment verification passed:

- `npm run verify:deployment` byte-matched every release file, checked the
  immutable ZIP response, unpacked it, and loaded it as the expected MV3
  extension in Chromium.
- `npm run verify:browser` passed desktop and 390 px mobile layout, keyboard
  activation, Axe, same-origin requests, no cookies, service-worker update,
  and offline reload.
- `/opt/fleet/lib/verify-url.sh https://color-status-labeler.sociobot.in/
  <temp-dir>` passed with no console/page errors and the expected title,
  language, landmark, and image alternatives.
- The live homepage sends the self-only CSP, restrictive Permissions Policy,
  `strict-origin-when-cross-origin`, `nosniff`, and `DENY` framing policy.
- At live 390 × 844 with root text set to 200%, `clientWidth=390`,
  `scrollWidth=390`, and zero visible header/main/footer descendants clipped.
- The cache-freshness regression passed 24 repeats with two workers.
- Live Chromium Lighthouse 12.8.2: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.8 s, LCP 1.2 s, TBT 30 ms, CLS 0, 73 KiB
  transfer.

There is no backend, account, payment, API, AI runtime, or remote product
state to migrate or monitor. The extension and demo remain local-first.
