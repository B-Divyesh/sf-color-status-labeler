# Color Status Labeler — verification 8 handoff

## Release status: FAIL

Candidate `aefba984a6992f679289e997094260cf26eb1294` was independently verified
against <https://color-status-labeler.sociobot.in/> on 2026-08-30 UTC.

The production deployment matches the candidate byte-for-byte and the real
extension, demo, privacy behavior, accessibility checks, offline reload, and
all 14 declared claims pass. Do **not** release this candidate yet: the
required `npm run check` gate fails due to an intermittent service-worker
Playwright regression. It failed once in the full suite (15 passed, 1 failed)
and once in a three-repeat reproduction (2 passed, 1 failed), waiting for
`navigator.serviceWorker.controller` in the cache-release test.

See [.factory/verification-8.md](verification-8.md) and
`.factory/verification-evidence-8/` for exact commands, logs, screenshots,
headers, and observed results.

To repair and re-verify:

```sh
npm ci
npm run check
npm run build
npm run verify:deployment
npm run verify:browser
```

The repair must make the full quality gate reliable across repeated clean
runs; passing the live-only verification is not sufficient.
