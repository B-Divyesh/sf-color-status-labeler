# Verification 14 — Color Status Labeler

## Result: PASS

Candidate `2627662980eed7e67f8b11fb6572160b2572bc22` satisfies the
researched brief and factory acceptance contract. Verification ran on
2026-09-01 UTC against <https://color-status-labeler.sociobot.in/> and its
one-click demo at <https://color-status-labeler.sociobot.in/demo/>.

No product code, deployment, infrastructure, settings, secrets, or other
product resources were read or changed.

## Cold first read

PASS. At 1365 × 768, before scrolling, the live page answers all three required
questions in plain words:

- What it does: **“Label color-only dashboard statuses.”**
- Who it is for: **“For people with color-vision deficiency…”**
- What to do first: **“Try it with sample data.”**

The adjacent note says the action opens a sample dispatch board and does not
change the visitor's own rules. One click opens `/demo/`, where a populated
three-status board and the persistent **Demo — sample data, nothing is saved**
banner are already visible. Evidence:
`verification-14-artifacts/live-first-read-1365x768.png`.

## Required claim tests

`.factory/claims.json` exists with 22 entries. Each claim id occurs exactly
once as a test tag. To obey the work order literally, every listed command was
first launched before any other repository action. Those invocations stopped
before test discovery because a clean clone has no `node_modules`
(`vitest: not found`). After the required `npm ci`, all 22 exact commands were
rerun independently and passed. No claim assertion or test failed.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `color-vision-audience` | PASS | Cold first screen names the audience and sample action. |
| `first-screen-demo` | PASS | Action and outcome fit 1365 × 768 and 1280 × 720 without scrolling. |
| `demo-sandbox` | PASS | Sample is populated, isolated under `demo:color-status-labeler:sample-v1`, resettable, and discarded on exit. |
| `download-extension` | PASS | ZIP validates and loads as the expected Manifest V3 extension. |
| `cache-freshness` | PASS | Content-addressed package URL bypasses an old cached package path. |
| `static-build-output` | PASS | Build retains real routes, download, 404, worker, and cache configuration. |
| `free-download` | PASS | Direct ZIP is available without account or payment. |
| `no-account` | PASS | Demo has no account UI, cookie, or third-party request. |
| `site-runtime-privacy` | PASS | All public routes use only same-origin runtime resources and no cookies. |
| `backup-transfer` | PASS | Popup exports JSON, rejects malformed JSON, and imports a valid current-site backup. |
| `rule-deletion` | PASS | Confirmed delete, keyboard undo, and confirmed clear all update saved rules. |
| `page-unchanged` | PASS | Training preserves form values, password read count, links, and submission state. |
| `extension-runtime-privacy` | PASS | Extension uses local resources/storage, no account or cookie flow, and no remote API. |
| `release-identity` | PASS | Public version, package version, artwork, and recorded provenance agree. |
| `core-labeling` | PASS | Trained color receives a word, pattern, badge, and legend entry. |
| `picker-style-properties` | PASS | Background, top-border, and text-color fixtures are labelable. |
| `color-matching-limits` | PASS | Nearby solid color matches; a larger change and gradient do not. |
| `grayscale-legibility` | PASS | Legend retains distinct words and patterns in grayscale. |
| `local-rules` | PASS | Rule exists only in the current-origin `chrome.storage.local` key. |
| `click-through` | PASS | Badge cannot receive pointer input. |
| `rules-return` | PASS | Rules and overlays return after reload on the same site. |
| `offline-demo` | PASS | A dedicated offline context reloads the cached sample and offline notice. |

The installed-run summary is in
`verification-14-artifacts/claim-results.tsv`.

## Clean local gates

- `npm ci`: PASS — 264 packages installed; 0 vulnerabilities.
- `npm audit --audit-level=critical`: PASS — 0 vulnerabilities.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm test`: PASS — 4 Vitest tests and 26 Playwright tests.
- `npm run build`: PASS — generated `dist/site/` and the extension archive.

The exact production build reports 3,804 bytes JavaScript (1,631 gzip) and
15,278 bytes CSS (4,055 gzip). The 768 px hero is 65,156 bytes and the largest
hero is 192,250 bytes. These are below the 200 KB JS, 50 KB CSS, and 300 KB
image budgets.

## Independent end-to-end exercise

The extension was downloaded from the live, content-addressed URL, unpacked,
and loaded into a fresh Chromium extension profile. It reports Manifest V3,
version 1.0.0, with only `storage` and `activeTab` permissions.

- Two colors were trained with distinct labels and patterns against a fresh
  20-state fixture. The result was 10 **Ready** and 10 **Waiting** badges:
  20/20 states identified without hue alone.
- The rules survived reload and remained under only
  `color-status-labeler:https://color-status-labeler.sociobot.in`.
- Clicking through the rendered badge activated the underlying control once.
- A nearby color retained 10 Ready matches. A larger change reduced it to 9.
- A whitespace-only label produced the explicit alert, set `aria-invalid`,
  and returned focus to the input. A 33-character entry was capped at 32.
- Extension backup/import, malformed-backup recovery, delete, undo, clear,
  background/top-border/text sampling, gradient rejection, page
  non-modification, and focus restoration all passed in the full suite.

The separate live demo exercise changed **Waiting** to **Queued** with bars,
persisted only the demo key, survived reload, rejected whitespace, rendered an
HTML-like label literally, recovered from corrupt stored JSON, reset to the
three shipped labels, and removed its demo key on **Start for real**.

## Live identity, privacy, headers, and caching

`npm run verify:deployment` passed after byte-comparing the live home, demo,
privacy, terms, 404 source, icons, assets, service worker, and extension ZIP
with the fresh candidate build. The live ZIP is 25,552 bytes and has SHA-256
`340e9a19f896f840df101adf3b12672d1c9c58e74a594b777ec9edc64171bc56`.

Fresh Playwright request logs for normal site/demo flows and the extension
contained only `https://color-status-labeler.sociobot.in`. No cookies,
third-party runtime request, analytics call, or unexpected console/page error
was observed. The sole console resource message in the route audit was the
intentional HTTP 404 document; normal routes and product flows were clean.

Live responses provide:

- self-only CSP with `frame-ancestors 'none'` and `object-src 'none'`;
- restrictive Permissions Policy, HSTS, `nosniff`, `DENY` framing, and
  `strict-origin-when-cross-origin`;
- 30-second revalidation for HTML, five-minute revalidation for artwork,
  one-year immutable caching for hashed JS/CSS and the versioned ZIP;
- `Cache-Control: no-cache` and `Service-Worker-Allowed: /` for `/sw.js`;
- HTTP-to-HTTPS 301 redirect and a designed unknown-route response with HTTP
  404.

This product has no server-side API, product-unlock call, sign-in, database,
or shared state. Rate-limit/429, Entra authority, backend concurrency,
persistence-boundary, and health endpoint checks are not applicable. The
observed API request allowance is **N/A**.

## Accessibility, responsive behavior, offline, and performance

- `npm run verify:browser` passed desktop, 390 px mobile, keyboard, privacy,
  service-worker update, and offline reload checks.
- `/opt/fleet/lib/verify-url.sh` passed: 771 ms observed load, no errors,
  title, `lang=en`, one `h1`, one `main`, no missing image alternatives, and
  no unnamed buttons.
- AxeBuilder found zero serious/critical findings on home, demo, privacy,
  terms, and the designed 404.
- Keyboard checks cover the first-focus skip link, Space-operated switch,
  dialog focus trap and restoration, route/Back focus, and visible 3 px focus
  indicators meeting 3:1 contrast.
- At 390 × 844 with 200% root text, `clientWidth` and `scrollWidth` were both
  390 px and no visible header/main/footer descendant was clipped. Reduced
  motion produced `scroll-behavior: auto`.
- A fresh service-worker update retained an active worker; `/demo/` reloaded
  offline with its populated sample and offline notice.
- Lighthouse 13.4.1 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.1 s, LCP 1.2 s, TBT 30 ms, CLS 0, Speed Index 1.1 s,
  75,414 bytes transferred. See
  `verification-14-artifacts/lighthouse-mobile.json`.

The documented single light treatment is intentional and supported by
forced-color behavior. The cassette-era field-guide identity, palette, type,
spacing, motion policy, generated artwork prompt, and provenance are recorded
in `.factory/design.md`. README, MIT license, privacy, terms, demo contract,
copy audit, robots, sitemap, metadata, and styled 404 are present.

## Defects by severity

| Severity | Finding |
| --- | --- |
| Critical | None found. |
| High | None found. |
| Medium | None found. |
| Low | None found. |

## Reproduce

```sh
npm ci
npm run typecheck
npm run lint
npm audit --audit-level=critical
npm test
npm run build
npm run verify:deployment
npm run verify:browser
/opt/fleet/lib/verify-url.sh https://color-status-labeler.sociobot.in <evidence-dir>
```
