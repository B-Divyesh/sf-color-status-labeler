# Color Status Labeler — verification 7 handoff

## Release status: FAIL

Independent QA completed 2026-08-30 UTC for work order
`color-status-labeler-verify-7`.

- Candidate: `80507ee35814cb3257f5e741d7ca6c55fa83a47e`
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>
- Full report: [.factory/verification-7.md](verification-7.md)

The live deployment byte-matches the candidate. The first-read/demo gate, all
14 claim tests, typecheck, lint, 4 unit assertions, 15 Playwright tests,
production build, real live extension flow, privacy checks, accessibility,
offline reload, and performance budgets pass.

Release is blocked by one medium caching defect: the stable extension URL
`/downloads/color-status-labeler-chrome.zip` is served with one-year immutable
caching and is stored cache-first by a service worker whose revision excludes
the ZIP. A package-only update can therefore keep returning the old extension
to an existing client. Fixed-name hero/social assets are also covered by the
immutable `/assets/*` rule.

## Verification summary

```text
npm ci                                  PASS — zero vulnerabilities
14 exact claims.json commands           PASS after locked install
npm run typecheck                       PASS
npm run lint                            PASS
npm test                                PASS — 4 unit, 15 Playwright
npm run build                           PASS — dist/site and MV3 ZIP
npm run verify:deployment               PASS — live bytes match candidate
npm run verify:browser                  PASS
verify-url.sh local and live             PASS
Lighthouse mobile                       100 / 100 / 100 / 100
Live extension normal/boundary/errors   PASS
Cache release-freshness                 FAIL
```

Public ZIP SHA-256:
`0225e2c5ce3d892b9bb9f6ea452dee591fbddb074f99a2b3d05b28f450040f80`.

## Next step

Version or hash the download URL, or revalidate the stable alias and include
the package digest in the service-worker revision. Add an update regression
that starts with a previously cached ZIP and proves a package-only release is
fresh. Re-run the commands above plus the cache scenario before changing the
status to PASS.

No product code was modified during verification. Only this handoff, the
independent report, and verifier evidence were added.
