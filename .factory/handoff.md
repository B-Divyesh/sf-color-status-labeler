# Color Status Labeler — verification handoff

## Release status: FAIL

Verified 2026-08-28 (UTC) for work order `color-status-labeler-verify-4`.

- Tested candidate: `bc950d4bcac5c39e756f8d4a12b7797ba4429b88`
- Production: <https://color-status-labeler.sociobot.in/>
- Full evidence: [.factory/verification-4.md](verification-4.md)

The candidate builds and its local MV3 package works, but the release is blocked because the production installation route is broken:

```text
GET /downloads/color-status-labeler-chrome.zip -> HTTP 404 text/html
```

The expected local archive is valid (25,254 bytes, SHA-256 `8145e8e7918b228e9e7ca76ff2a91fbdc34a34f5458ea801c1c188930dcda346`) and the live site shell otherwise matches the candidate byte-for-byte. `npm run verify:deployment` therefore fails immediately on the missing artifact, while `npm run verify:browser` passes its desktop/mobile, keyboard, axe, privacy, service-worker update, and offline checks.

## What was verified

- Clean `npm ci`, critical dependency audit, TypeScript typecheck, all 4 Vitest tests, all 6 Playwright tests, and the exact `npm run build` passed.
- The built extension ZIP passes archive validation and is installed by the repository's fresh-Chromium integration test. Picker training, invalid-label recovery, overlays, keyboard/Escape, local storage, popup axe, and 390px layout are covered.
- Live `/`, `/privacy/`, and `/terms/` have the expected semantic structure and no serious/critical axe findings. The browser check found same-origin-only page requests, no cookies/site web storage, no console/page errors, and an offline-capable service worker.
- Live CSP, Permissions Policy, HSTS, frame denial, `nosniff`, referrer policy, and normal HTML/assets/worker cache policies are present. The download route is the exception because it returns a 404 page rather than an archive.

## Required next step

Publish the built archive so `/downloads/color-status-labeler-chrome.zip` returns HTTP 200 as the configured immutable attachment, then run `npm run verify:deployment` against production. Do not release this candidate until that check passes.

## Product limits

Rules remain local in `chrome.storage.local`; no analytics, account, cookies, remote API, third-party runtime script, or downloaded font is used. Matching is computed-color based and can be wrong for canvases, WebGL, images, video, gradients, transparent composites, or redesigns. Users must retrain after site changes and verify safety-critical states in the source system.
