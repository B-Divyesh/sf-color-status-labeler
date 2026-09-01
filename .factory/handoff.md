# Color Status Labeler — review 2 handoff

## Status: FAIL

This work order performed a read-only adversarial review. Product code was not modified. The review report is in `.factory/review-2.md`.

## Checks completed

- Opened the live site in fresh 390 × 844 mobile and desktop contexts.
- Confirmed the live demo's sample data, reset behavior, demo-only local-storage key, same-origin request log, and empty cookie jar.
- Confirmed live route focus and polite announcements after navigation and Back.
- Created a fresh local clone; ran `npm ci`, `npm run typecheck`, `npm run lint`, all 17 declared claim commands, `npm test`, and `npm run build`.
- Confirmed all declared claims passed. The complete suite passed 4 unit tests and 19 Playwright tests. `dist/site/` was produced.
- Checked all earlier review findings against current live behavior and source. Each F-1 finding is fixed.
- Checked public routes, metadata, designed 404, link responses, and current visual identity.

## Remaining review findings

- **F-2-1 (BLOCKING):** the intended sample-data action and its outcome text are below the initial viewport at 1365 × 768 and 1280 × 720 desktop sizes.
- **F-2-2 through F-2-4 (MAJOR):** README and landing contain claim-like behavior/deployment statements without matching `.factory/claims.json` entries and tests.
- **F-2-5 through F-2-8 (MINOR):** three vague landing labels and one README sentence with unexplained standards jargon need plain-language revisions.

## Reproduce

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Then run each `test` command in `.factory/claims.json` and perform fresh live checks at 390 × 844 and 1280 × 720.
