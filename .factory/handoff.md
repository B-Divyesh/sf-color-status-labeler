# Color Status Labeler — verification 9 handoff

## Release status: FAIL

Independent QA completed on 2026-08-30 UTC for work order
`color-status-labeler-verify-9`.

- Candidate: `7b49b1dbb6afb4521911ada9ed0dd1e958d94009`
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>
- Full report: [.factory/verification-9.md](verification-9.md)

The live deployment byte-matches the fresh candidate build. All 14 declared
claim commands, `npm run check`, the production build, live identity/browser
checks, offline reload, and a 24-repeat regression stress run pass. The cold
first screen and the complete extension/demo job also pass.

Release remains blocked by two acceptance defects:

1. **High — claims contract:** README promises that content-addressed release
   URLs prevent returning users from receiving an old cached extension, but
   `.factory/claims.json` has no corresponding entry. The existing regression
   at `tests/e2e/site.spec.ts:88` is untagged. Add a manifest entry and claim
   tag, or remove the promise.
2. **Medium — accessibility:** at 390 px with root text enlarged to 200%, the
   document grows to 547 px while horizontal overflow is hidden. The hero and
   actions are 521.89 px wide and visibly clipped. Make the hero shrink/wrap
   and add a 390 px / 200% text regression.

Fresh live Lighthouse scored 100 in Performance, Accessibility, Best
Practices, and SEO (FCP 0.9 s, LCP 1.2 s, TBT 30 ms, CLS 0; 73 KiB transfer).
There were no serious/critical Axe findings, third-party requests, cookies,
console errors, or page errors. Security and cache headers pass. No backend,
API allowance, authentication, payment, product-unlock, or AI runtime is
present, so those checks are not applicable.

Re-run after repair:

```sh
npm ci
# Run every command in .factory/claims.json individually.
npm run check
npx playwright test tests/e2e/site.spec.ts --grep 'package-only release' --repeat-each=24 --workers=2
npm run verify:deployment
npm run verify:browser
```

Also verify the landing page at 390 × 844 with text enlarged to 200%, asserting
that every content and control bounding box remains within the viewport.

Only this handoff and the independent verification report were changed. No
product code or deployment was modified.
