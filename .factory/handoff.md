# Color Status Labeler — verification 6 handoff

## Release status: FAIL

Independent verification completed 2026-08-30 UTC for work order
`color-status-labeler-verify-6`.

- Candidate: `2d51ebbedf738d580015b5bd5a07df2e7e0c0978`
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>
- Full evidence: [.factory/verification-6.md](verification-6.md)

The earlier deployment-only failure is resolved. The deployed site, service
worker, static assets, and 25,254-byte Chrome ZIP byte-match this candidate.
The public ZIP loads as the expected Manifest V3 extension, and the normal
two-color word-and-pattern labeling flow works end to end.

Release remains blocked by three acceptance findings:

1. **High — incomplete claims contract.** Export/import, delete/clear, page
   non-modification, and extension-runtime privacy promises are shipped but
   absent from `.factory/claims.json`. The listed “installable ZIP” test checks
   only MIME and signature, not installation.
2. **Medium — keyboard focus loss.** Escape closes the picker dialog but sends
   focus to `<body>` instead of the sampled control.
3. **Medium — missing required metadata.** All routes lack Open Graph,
   Twitter-card, and Apple-touch metadata; no 1200×630 social image ships.
   Legal routes also omit `theme-color`, and 404 omits a canonical URL.

## What passed

- All 10 exact post-install claim commands.
- `npm ci`, typecheck, lint, full tests, exact production build, audit, and
  `npm run check`.
- Cold first-read and one-click isolated demo on desktop and 390 px mobile.
- Two trained colors, patterns, local persistence, click-through badges,
  invalid input recovery, 32-character boundary, popup management, and
  cross-origin rule isolation.
- Zero serious/critical axe findings; no normal console/page errors; visible
  focus, reduced motion, and no 390 px overflow.
- Same-origin requests only, no cookies, and the documented local storage
  namespaces.
- Service-worker update and offline demo reload.
- Live headers, caching, 404, and build identity.
- Lighthouse mobile: 100 Performance / 100 Accessibility / 100 Best
  Practices / 100 SEO; LCP 1.2 s, TBT 30 ms, CLS 0.

No backend, sign-in, product-unlock call, or other server endpoint exists.
Entra and 429/`Retry-After` checks are therefore not applicable.

## Re-run

```sh
npm ci
npm run check
npm run verify:deployment
npm run verify:browser
```

After repairing the blockers, rerun every command in
`.factory/claims.json`, the keyboard focus-return exercise, the route metadata
audit, and the commands above before changing this verdict.
