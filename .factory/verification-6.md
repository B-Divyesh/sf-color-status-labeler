# Color Status Labeler — independent verification 6

## Verdict: FAIL

Verified 2026-08-30 UTC for work order
`color-status-labeler-verify-6`.

- Candidate: `2d51ebbedf738d580015b5bd5a07df2e7e0c0978`
- Candidate state at start: clean `main` checkout at that exact commit
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>

The prior deployment-only failure is fixed. The live HTML, site assets,
service worker, and Chrome extension ZIP byte-match this candidate, and the
smallest useful labeling flow works. The candidate still fails the attached
acceptance contract because relied-on product claims are absent from the
mandatory claims catalog, keyboard focus is lost when the picker dialog
closes, and required social/route metadata is missing.

## Release-blocking findings

### High — the claims catalog does not cover all public product claims

`.factory/claims.json` exists and every listed command passes after the
lockfile install. However, the claims contract also requires every statement
a user can rely on to appear in the catalog with one tagged observable test.
The following shipped claims have no entry or matching tag:

- The popup advertises **Export backup** and **Import backup**. The privacy
  page says export creates a file, and that users can delete one rule or clear
  a site. There is no export, import, delete, or clear claim in
  `.factory/claims.json`.
- The landing page promises that forms, links, and page data are never
  changed. The privacy page additionally says the extension does not read
  passwords, submit forms, change server data, or send page contents. No
  claim test exercises a form/value before and after labeling or records
  extension-runtime network activity.
- README and privacy copy promise no remote APIs, telemetry, cookies,
  third-party runtime scripts, or downloaded fonts. `@claim:no-account`
  records only the companion demo page; it does not run the extension path.

There is also an under-proved listed claim. `download-extension` says the ZIP
is installable, but its tagged test checks only HTTP success, MIME, and the
four-byte ZIP signature. It does not unzip, validate the manifest, or load the
package in Chromium. The separate deployment verifier does those things, but
that command is not the test named by the claim manifest.

Independent QA confirmed these features currently work where observable:
export produced a two-rule JSON backup; malformed import announced an error;
valid import restored a rule and clamped tolerance to 50; delete/undo and
clear confirmation worked; the public ZIP loaded as Manifest V3. That does
not replace the required per-claim regression coverage.

### Medium — closing the picker dialog loses keyboard focus

In a fresh Chromium extension profile on the live demo, I started the picker,
focused **Apply sample label**, pressed Enter to choose it, and confirmed the
dialog initially focused **Status label**. Pressing Escape closed the dialog,
but `document.activeElement` became `<body>` instead of returning to the
sampled control. This fails the attached accessibility baseline for dialog
focus management and makes a keyboard user lose their place.

### Medium — mandatory route and social metadata is incomplete

Live inspection of `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html`
found no Open Graph title/image metadata, no Twitter card metadata, and no
Apple touch icon on any route. There is no product 1200×630 social image in
the built output. The privacy and terms pages also omit `theme-color`, and
the 404 page omits a canonical URL. Titles, descriptions, `lang`, one `h1`,
and one `main` otherwise pass. The missing fields violate the attached
site-structure contract.

## Mandatory claims preflight

The clean clone initially had no installed dependencies, so the literal first
invocation of each command returned exit 127 (`vitest: not found`). After the
required `npm ci` lockfile install, I reran all ten exact manifest commands.
These are the claim results used below.

| Claim | Exact manifest command | Result and observable evidence |
| --- | --- | --- |
| `color-vision-audience` | `npm test -- --grep @claim:color-vision-audience` | PASS — one Playwright test; intended user, h1, demo action, live preview, download and axe assertion. |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS — one test; only `demo:color-status-labeler:sample-v1` appeared, reload persisted it, Reset and Start for real removed it. |
| `download-extension` | `npm test -- --grep @claim:download-extension` | PASS as written — one test; HTTP/MIME/ZIP signature and static policy. Coverage gap noted above. |
| `free-download` | `npm test -- --grep @claim:free-download` | PASS — one test; direct ZIP returned without a payment route. |
| `no-account` | `npm test -- --grep @claim:no-account` | PASS — one test; demo had no account controls, cookies, initial storage, or third-party request. |
| `core-labeling` | `npm test -- --grep @claim:core-labeling` | PASS — one real extension-profile test; saved word/pattern badge and legend. |
| `local-rules` | `npm test -- --grep @claim:local-rules` | PASS — one real extension-profile test; origin-keyed `chrome.storage.local` rule. |
| `click-through` | `npm test -- --grep @claim:click-through` | PASS — one real extension-profile test; badge `pointer-events: none`. |
| `rules-return` | `npm test -- --grep @claim:rules-return` | PASS — one real extension-profile test; badge and legend returned after reload. |
| `offline-demo` | `npm test -- --grep @claim:offline-demo` | PASS — one dedicated-context test; active worker/cache and offline `/demo/` reload. |

Each claim tag occurs exactly once in `tests/`. The full suite reports four
Vitest assertions and nine Playwright tests passing.

## Cold first-read test

PASS for the explicit first-read gate.

- What it does: **“Label color-only dashboard statuses.”**
- Who it is for: **“For people with color-vision deficiency…”**
- First click: **“Try it with sample data”**, linking directly to `/demo/`.
- What happens next: it opens a sample dispatch board without changing real
  extension rules.

At 390×844, the job, audience, sample action, next-step copy, and all three
facts were fully visible without scrolling. At 1440×900, the job, audience,
and sample action were fully visible; the action note began at 865 px and the
three facts began below the 900 px fold. The explicit what/who/first-click
gate still passes, and the one-click demo exists.

## Clean local gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 265 packages audited; 0 vulnerabilities. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS. |
| `npm test` | PASS — 4 Vitest assertions; 9 Playwright tests. |
| `npm run build` | PASS — MV3 extension, ZIP, and `dist/site/`. |
| `npm audit --audit-level=critical` | PASS — 0 vulnerabilities. |
| `npm run check` | PASS — typecheck, lint, full tests, and production build. |

## Independent product exercise

Using the public 25,254-byte ZIP in a fresh Chromium extension profile on the
live demo:

- Saved `Ready` with stripes for `#4A985C` and `Waiting` with dots for
  `#B4A43C`; both badges and legend rows appeared and returned after reload.
- A click at a badge coordinate reached the underlying `<article>`, not the
  extension host.
- A whitespace-only label produced the visible alert “Enter a status label;
  spaces alone cannot name a signal.”, set `aria-invalid=true`, focused the
  field, and recovered after valid input.
- Keyboard input stopped at the 32-character limit when 33 characters were
  attempted.
- The popup paused and restored all labels, confirmed deletion, restored the
  deleted rule with U, exported two rules, rejected malformed JSON, imported
  a valid backup, clamped an imported tolerance of 999 to 50, and honored
  cancel/confirm when clearing the site.
- At 390×844 there was no horizontal overflow. The 260 px legend remained
  inside the viewport. With reduced motion, badge animation and transition
  durations were `0s`.
- A second origin had no legend or rules. Normal product flow made only
  `https://color-status-labeler.sociobot.in` requests and produced no console
  or page errors.
- Axe found zero serious/critical issues on the live demo, picker dialog, and
  extension popup. The focus-restoration defect remains outside axe coverage.

The standalone sample also handled a corrupt demo-storage value by showing
the shipped `Ready` sample, constrained keyboard input to 32 characters, and
announced/focused its invalid whitespace error.

## Live deployment, privacy, headers, and performance

`npm run verify:deployment` and `npm run verify:browser` both pass. The live
ZIP is a valid, loadable Manifest V3 archive and matches the local build:

- ZIP SHA-256:
  `8145e8e7918b228e9e7ca76ff2a91fbdc34a34f5458ea801c1c188930dcda346`
- `/`, `/demo/`, privacy, terms, 404, `sw.js`, icon, robots, sitemap, JS,
  CSS, and both hero images byte-match `dist/site/`.
- `/404` returns HTTP 404 with the designed page.

The live page sent only same-origin requests, set no cookies, and began with
empty local/session storage. Demo edits use only
`demo:color-status-labeler:sample-v1`; extension rules use only the matching
`color-status-labeler:<origin>` key in `chrome.storage.local`. Source and
bundled-code review found no analytics, API client, telemetry, external font,
or third-party runtime script. There are no sign-in or server-side product
endpoints, so Entra authority and 429/`Retry-After` checks are not applicable;
the observed API allowance is **N/A**.

Live response policy passes: self-only CSP, restrictive Permissions-Policy,
HSTS, `nosniff`, `DENY` framing, strict-origin referrer policy, immutable
one-year caching for hashed assets and the ZIP, and `no-cache` plus root scope
for `sw.js`. A fresh worker update retained an activated worker and offline
reload of `/demo/` showed the sample and offline notice from cache
`csl-site-fd2a1ce67643`.

Built budgets:

- Initial JS: 3,122 bytes raw / 1,379 bytes gzip (budget 200 KB).
- CSS: 14,559 bytes raw / 3,857 bytes gzip (budget 50 KB).
- Mobile hero: 65,156 bytes; desktop hero: 192,250 bytes (budget 300 KB).
- Extension unpacked: 45.88 KB; ZIP: 25,254 bytes.

Fresh Lighthouse 13.4.1 mobile scores were Performance 100, Accessibility
100, Best Practices 100, and SEO 100. FCP was 1.1 s, LCP 1.2 s, TBT 30 ms,
CLS 0, and Speed Index 1.1 s.

## Required remediation

1. Add claims and tagged observable demo/extension tests for export, import,
   delete/clear, page non-modification, and the full extension privacy claims.
   Make the installability claim test unzip and load the package in Chromium.
2. Restore focus to the sampled element, or another documented logical
   control, whenever the picker dialog closes by Escape, Cancel, backdrop, or
   successful save; add a keyboard regression.
3. Add route-appropriate Open Graph and Twitter metadata, an original
   1200×630 social image, a 180 px Apple touch icon, and the missing canonical
   and theme metadata; test them on every route.

