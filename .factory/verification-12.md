# Color Status Labeler — independent verification 12

## Verdict: FAIL

Verified on 2026-09-01 UTC for work order
`color-status-labeler-verify-12`.

- Candidate commit: `f83c1556d2f9ab8b047011d56400817e652cb4aa`
- Checkout at start: clean `main` checkout at that exact commit
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>

The live deployment byte-matches the candidate and the core extension works.
The candidate is not releasable because a required claim check is intermittent,
the aggregate quality gate failed, and the sample product is below the first
viewport after the one-click demo action.

## Defects by severity

### High — required claim check and aggregate gate are intermittent

The installed first pass of all 21 exact `.factory/claims.json` commands
passed. A standalone full `npm test` also passed all 4 Vitest assertions and
24 Playwright checks. However, the later required `npm run check` failed with
23 of 24 Playwright checks passing:

```text
tests/e2e/extension.spec.ts:172
@claim:picker-style-properties

locator('#color-status-labeler-root').getByLabel('Status label')
resolved to 2 elements: the “Status label legend” region and the text input.
```

The exact claim command passed on an immediate isolated retry. A focused
10-run repetition then passed 9 times and failed once at
`tests/e2e/extension.spec.ts:203` because the extension worker could not send
the picker message to a receiving page. These two independent reproductions
make the claim result non-deterministic. The acceptance contract requires
every claim check and the complete quality gate to pass.

Required repair: wait for the extension content receiver before sending the
picker message, use an exact input locator, and demonstrate repeated clean
`npm run check` results.

### High — the demo's first screen does not show the sample product

The landing action reaches the isolated demo in one click. The resulting first
screen contains the persistent demo banner and introduction, but the sample
dispatch board is below the viewport:

| Viewport | Demo dashboard top | First status top | Viewport height |
| --- | ---: | ---: | ---: |
| 1365 × 768 | 956.8 px | 1038.6 px | 768 px |
| 390 × 844 | 952.7 px | 1047.3 px | 844 px |

The demo contract requires the first screen after the click to already look
like the product in use. Evidence:
[`demo-1365.png`](verification-evidence-12/demo-1365.png) and
[`demo-390.png`](verification-evidence-12/demo-390.png).

Required repair: place a usable sample board or compact interactive preview in
the first demo viewport at desktop and 390 px mobile widths.

### Medium — the extension empty state uses unexplained cassette language

The popup still shows `A / 01` and “No tracks labeled yet.” in
`entrypoints/popup/index.html` lines 12 and 42. A new user is managing status
labels, not audio tracks. This conflicts with the plain-words rule for empty
states and with `.factory/copy-audit.md`, which says the old metaphors were
removed from the working UI.

Required repair: remove the decorative code and use the established words,
such as “No labels saved yet.”

## Mandatory claims

The manifest exists, contains 21 entries, and every ID occurs exactly once as
an `@claim:<id>` tag in `tests/`. As explicitly requested, every command was
first invoked before dependency installation; each stopped at the missing
local `vitest` executable. After `npm ci`, the complete manifest sweep passed.

| Claim | Installed sweep | Overall result |
| --- | --- | --- |
| `color-vision-audience` | PASS | PASS |
| `first-screen-demo` | PASS | PASS |
| `demo-sandbox` | PASS | PASS |
| `download-extension` | PASS | PASS |
| `cache-freshness` | PASS | PASS |
| `static-build-output` | PASS | PASS |
| `free-download` | PASS | PASS |
| `no-account` | PASS | PASS |
| `site-runtime-privacy` | PASS | PASS |
| `backup-transfer` | PASS | PASS |
| `rule-deletion` | PASS | PASS |
| `page-unchanged` | PASS | PASS |
| `extension-runtime-privacy` | PASS | PASS |
| `core-labeling` | PASS | PASS |
| `picker-style-properties` | PASS | **FAIL — later failures reproduced** |
| `color-matching-limits` | PASS | PASS |
| `grayscale-legibility` | PASS | PASS |
| `local-rules` | PASS | PASS |
| `click-through` | PASS | PASS |
| `rules-return` | PASS | PASS |
| `offline-demo` | PASS | PASS |

The public landing, demo, legal pages, README, popup, and manifest were checked
against the registry. No additional unlisted product promise was found.

## Cold first read

The live landing page passes the explicit first-read check:

- What it does: “Label color-only dashboard statuses.”
- Who it is for: “For people with color-vision deficiency…”
- First click: “Try it with sample data.”
- What happens: the adjacent note says it opens a sample dispatch board and
  does not change the visitor's own rules.

At 1365 × 768, the action ends at 550.7 px and its outcome note ends at
606.1 px. At 390 × 844, they end at 558.2 px and 686.3 px. Both are visible
without scrolling. The separate demo-page defect is recorded above.

## Product exercise

Fresh live-browser checks confirmed:

- The sample begins with Ready, Waiting, and Blocked word-and-pattern states.
- Changing Waiting to Delayed with Bars updates the card and legend and writes
  only `demo:color-status-labeler:sample-v1`.
- A spaces-only label announces “Enter a status label and choose a pattern,”
  sets `aria-invalid="true"`, and returns focus to the label input.
- A 32-character boundary label is preserved at 32 characters.
- `<b>Needs review</b>` renders as literal text with no child element.
- Invalid stored JSON falls back to the original three sample statuses.
- Reset restores the sample, clears the demo key, and retains button focus.
- Start for real returns home and leaves no demo storage key.

The extension checks loaded the real Manifest V3 archive in fresh Chromium
profiles and confirmed background, top-border, and text color training; word
and pattern overlays; per-origin persistence; JSON transfer and invalid-file
recovery; delete, undo, and clear; keyboard selection and cancellation; and
unchanged form, password, link, and submission state.

## Local gates and build

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 264 packages installed; 0 vulnerabilities. |
| All 21 exact installed claim commands | PASS on the initial sweep. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS. |
| `npm audit --audit-level=critical` | PASS — 0 vulnerabilities. |
| `npm test` | PASS once — 4 Vitest assertions and 24 Playwright checks. |
| `npm run build` | PASS — exact production output created `dist/site/`. |
| `npm run check` | **FAIL** — intermittent required claim check. |
| Focused claim repetition | **FAIL** — 9/10 passed. |

The build contains 3,804 bytes of JavaScript (1,659 gzip), 14,959 bytes of CSS
(4,021 gzip), a 65,156-byte mobile hero, a 46,431-byte unpacked extension, and
a 25,422-byte extension ZIP. These are within the stated budgets.

## Live deployment, privacy, and headers

`npm run verify:deployment` passed. Every checked live HTML page, public asset,
service worker, and content-addressed ZIP matches `dist/site/` byte for byte.
The archive downloads as `application/zip`, validates, and loads as Color
Status Labeler Manifest V3 with only `storage` and `activeTab` permissions.

Across the fresh landing, demo, privacy, terms, and designed-404 flow, all 44
observed requests stayed on `https://color-status-labeler.sociobot.in`. No
cookies were set. Normal routes produced no console or page errors. The only
browser message was the expected HTTP 404 for the deliberately requested
missing route.

Live responses include a self-only CSP, HSTS, `nosniff`, DENY framing,
`strict-origin-when-cross-origin`, and restrictive Permissions Policy.
Versioned JavaScript, CSS, and the ZIP use one-year immutable caching; HTML is
revalidated after 30 seconds; the service worker uses `no-cache` and root
scope. The product has no server-side API or sign-in flow, so request allowance
and identity-provider checks do not apply.

## Accessibility, responsive behavior, offline use, and performance

- Axe found zero serious or critical issues on home, demo, privacy, terms, and
  the designed 404 page.
- Each route has `lang="en"`, one `h1`, and one `main`; the standard URL
  verifier found no missing image text alternatives or unnamed buttons.
- Keyboard Tab reaches the skip link first. Space operates the status switch.
  Tested focus indicators are 3 px and visible.
- At 390 px, the page has no horizontal overflow. It also has no overflow at
  200% root text size. Associated labels provide at least 44 px hit areas for
  the visually smaller switch and radio inputs.
- Reduced-motion mode reports `scroll-behavior: auto` and zero-duration
  transitions and animations.
- Service-worker update retains an activated worker. `/demo/` reloads offline
  with its sample heading and visible offline notice.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.94 s, LCP 1.22 s, TBT 38 ms, CLS 0, transfer 75,378 bytes.

Fresh visual and Lighthouse evidence is in
`.factory/verification-evidence-12/`.

## Next steps

1. Make the extension claim check deterministic and pass repeated
   `npm run check` runs.
2. Move a usable sample product view into the initial demo viewport.
3. Replace the popup's cassette shorthand with established status-label words.
4. Re-run all 21 claim commands, the complete quality gate, the live browser
   checks, and deployment identity comparison.
