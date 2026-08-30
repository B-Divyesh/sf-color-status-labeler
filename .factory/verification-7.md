# Color Status Labeler — independent verification 7

## Verdict: FAIL

Verified 2026-08-30 UTC for work order
`color-status-labeler-verify-7`.

- Candidate: `80507ee35814cb3257f5e741d7ca6c55fa83a47e`
- Candidate state at start: clean `main` checkout at that exact commit
- Production: <https://color-status-labeler.sociobot.in/>
- Demo: <https://color-status-labeler.sociobot.in/demo/>

The prior deployment-only failure remains fixed. The production pages,
service worker, assets, and 25,451-byte Chrome extension ZIP byte-match the
candidate build. All 14 declared claims, the full local suite, the real live
extension flow, accessibility checks, privacy checks, offline reload, and
performance budgets pass.

The candidate nevertheless fails the caching requirement. The primary
download is published at an unversioned URL with a one-year immutable response
and is also stored by a cache-first service worker whose revision does not
include that ZIP. An extension-only release can therefore leave a returning
user downloading the old extension indefinitely.

## Release-blocking finding

### Medium — the unversioned extension download can remain stale across releases

The shipped install action always points to
`/downloads/color-status-labeler-chrome.zip`. Production serves that fixed URL
with:

```text
Cache-Control: public, max-age=31536000, immutable
```

The service worker is also cache-first for every same-origin non-navigation
request. After one controlled download, Cache Storage contained the ZIP in
`csl-site-1c663a190f91`; `registration.update()` retained the same entry. The
service-worker revision in `site/vite.config.ts` hashes the page shell and
`assets/`, but not `downloads/color-status-labeler-chrome.zip`. If only the
extension package changes, the worker URL, cache name, download URL, and
immutable HTTP cache key can all remain unchanged. The old ZIP can then be
returned without consulting the deployment.

This is not hypothetical caching metadata alone: the live Cache API inventory
in `.factory/verification-evidence-7/cache-behavior.json` records the fixed ZIP
inside the cache before and after the production update check. The response
headers are in `.factory/verification-evidence-7/response-headers.log`.

Impact: a returning user may install an outdated extension after a repair or
security update, even though the landing page offers the current download.
This violates the attached performance rule that immutable caching be limited
to content-hashed assets and makes release identity unreliable for existing
clients.

Required remediation: publish the ZIP at a content- or version-hashed URL and
update the page link, or include its digest in the service-worker revision and
use a network-first/non-immutable policy for the stable alias. Fixed-name hero
and social assets under the same immutable `/assets/*` rule should likewise be
hashed or revalidated.

## Mandatory claim preflight

`.factory/claims.json` exists and contains 14 entries. The literal first
command attempted before dependency installation exited 127 because the clean
clone had no `node_modules` (`vitest: not found`). After the required locked
install (`npm ci`, 264 packages, zero vulnerabilities), every exact manifest
command passed. This was an environment prerequisite failure, not a failed
claim assertion. The complete post-install output is
`.factory/verification-evidence-7/claims-after-install.log`.

| Claim | Result and observed evidence |
| --- | --- |
| `color-vision-audience` | PASS — first screen names the intended user, job, and sample action. |
| `demo-sandbox` | PASS — only `demo:color-status-labeler:sample-v1` is written; reset and leaving remove it. |
| `download-extension` | PASS — archive validates, has the expected MV3 manifest, and loads in Chromium. |
| `free-download` | PASS — the direct ZIP returns 200 without account or payment flow. |
| `no-account` | PASS — no account controls, cookies, or third-party demo request. |
| `backup-transfer` | PASS — JSON export succeeds, malformed import is rejected, and valid import restores a normalized rule. |
| `rule-deletion` | PASS — delete/undo and confirmed clear update stored rules. |
| `page-unchanged` | PASS — password, form, normal input, link, and submission state remain unchanged. |
| `extension-runtime-privacy` | PASS — only the tested site origin is contacted; no cookie/account flow or sensitive permission. |
| `core-labeling` | PASS — a trained color receives a word badge, pattern, and legend row. |
| `local-rules` | PASS — the rule is stored only under its origin key in `chrome.storage.local`. |
| `click-through` | PASS — rendered badges use `pointer-events: none`. |
| `rules-return` | PASS — the saved badge and legend return after reload. |
| `offline-demo` | PASS — the dedicated context reloads the sample and offline notice from the active cache. |

Each `@claim:<id>` tag occurs exactly once in `tests/`. Cross-checking the
landing page, legal copy, extension popup, and README found the relied-on
claims represented by these entries. The candidate fails for caching, not for
a missing or failing declared product claim.

## Cold first-read test

PASS for the explicit first-read gate.

- What it does: **“Label color-only dashboard statuses.”**
- Who it is for: **“For people with color-vision deficiency…”**
- First click: **“Try it with sample data.”**
- What happens: the adjacent note says it opens a sample dispatch board
  without changing the user's rules.

The action reaches `/demo/` in one click. The persistent demo banner says
sample data is not saved and provides **Reset demo** and **Start for real**.
At 390×844 the job, audience, action, explanation, and all three product facts
fit in the first viewport. Evidence:
`.factory/verification-evidence-7/first-read-desktop.webp` and
`.factory/verification-evidence-7/first-read-mobile.png`.

## Clean local gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 264 packages installed; 265 audited; zero vulnerabilities. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS. |
| `npm test` | PASS — 4 Vitest assertions and 15 Playwright tests. |
| `npm run build` | PASS — WXT MV3 extension, ZIP, and `dist/site/`. |
| `npm audit --audit-level=critical` | PASS — zero vulnerabilities. |
| `/opt/fleet/lib/verify-url.sh` local and live | PASS — title, lang, one h1, main, alt text, and zero product errors. |

The production output contains `dist/site/` and
`dist/site/downloads/color-status-labeler-chrome.zip`. Full gate output is in
`.factory/verification-evidence-7/local-gates.log`; live verifier output is in
`.factory/verification-evidence-7/live-verifiers.log`.

## Independent product exercise

The public ZIP was downloaded, unpacked, and loaded into a fresh persistent
Chromium profile. Its SHA-256 is
`0225e2c5ce3d892b9bb9f6ea452dee591fbddb074f99a2b3d05b28f450040f80`,
identical to the candidate build.

- Trained the live demo's green status with a 32-character boundary label and
  bars pattern. The badge and legend appeared, survived reload, and a matching
  status inserted later was labeled after the mutation refresh.
- A whitespace-only label announced “Enter a status label; spaces alone cannot
  name a signal.”, set the invalid state, focused the field, and recovered.
  A 33rd typed character was rejected at the documented 32-character limit.
- The popup paused and resumed the site, persisting both states. The full suite
  separately passed malformed/valid backup import, export, delete/undo, and
  confirmed clear.
- Keyboard sampling opened the named modal, Escape returned focus to the
  sampled control, and reduced motion produced `0s` animation and transition.
- At 390 px the page had no horizontal overflow and the 260 px legend stayed
  inside the viewport. A second origin had zero badges and no stored rule.
- The standalone demo recovered from corrupt storage, rejected whitespace,
  enforced 32 characters, and then accepted a corrected label.

The live extension run had zero product console/page errors. Axe's injected
audit style caused one CSP console line while scanning the open Shadow DOM;
checkpointing before and after the audit proved it was instrumentation-only.
The product flow after clearing that audit artifact produced no error.
Detailed geometry, storage, focus, network, and error checkpoints are in
`.factory/verification-evidence-7/manual-live-extension.json`; standalone
invalid recovery is in
`.factory/verification-evidence-7/demo-invalid-recovery.json`.

## Accessibility and responsive behavior

- Playwright axe: zero serious/critical findings on home, demo, privacy,
  terms, 404, the picker dialog, and the extension popup.
- Lighthouse accessibility: 100.
- Every route has `lang=en`, one h1, one main landmark, ordered headings,
  titles, descriptions, canonicals, social metadata, and image alt text.
- First Tab reaches the skip link. The complete landing tab cycle exposes a
  designed 3 px focus outline; Enter/Space operate the tested controls.
- Form labels, invalid states, live regions, modal name/state, focus trap, and
  focus restoration pass. Radio choices use 48 px label targets.
- At 390 px there is no content overflow. A 200% text-size capture retained all
  controls and content; excess measured layout width came only from clipped
  decorative offsets and created no horizontal scroll or content loss.
- `prefers-reduced-motion: reduce` removes site and extension motion.

The live route/link/axe/focus evidence is in
`.factory/verification-evidence-7/route-a11y-privacy-audit.json` and the mobile
extension capture is
`.factory/verification-evidence-7/live-extension-mobile.png`.

## Privacy, headers, offline behavior, and operational scope

The full live site/demo exercise contacted only
`https://color-status-labeler.sociobot.in`, set no cookies, and used no session
storage. Demo edits used only the documented `demo:` key. The extension used
only `color-status-labeler:<origin>` in `chrome.storage.local`; the manifest
has only `storage` and `activeTab`. No analytics, telemetry, third-party font,
remote API, Azure endpoint, or sign-in flow exists.

Production sends a self-only CSP, restrictive Permissions Policy, HSTS,
`nosniff`, `DENY` framing, and strict-origin referrer policy. HTML revalidates
after 30 seconds; `sw.js` uses `no-cache` and root scope. The problematic
immutable policy is the release blocker above.

The service worker remained activated after `registration.update()`. With a
fresh dedicated context offline, `/demo/` reloaded with the sample heading and
visible offline notice from `csl-site-1c663a190f91`. Evidence is in
`.factory/verification-evidence-7/offline-update.json`.

There is no backend, product-unlock call, or other server-side product
endpoint. Entra authority and API throttling checks are therefore not
applicable; observed request allowance: **N/A**. No missed AI feature is
indicated by this local deterministic utility.

## Deployment identity and performance

`npm run verify:deployment` and `npm run verify:browser` pass. The live HTML,
all built assets, social image, icon, service worker, and extension archive
byte-match `dist/site/`; `/404` returns the designed page with HTTP 404.

Fresh Lighthouse 13.4.1 mobile results:

- Performance 100; Accessibility 100; Best Practices 100; SEO 100.
- FCP 866 ms; LCP 1,218 ms; TBT 31 ms; CLS 0; Speed Index 866 ms.
- A measured `Show labels` interaction took 24 ms, below the 200 ms INP
  budget.
- Initial transfer was 74,911 bytes.

The Lighthouse summary and interaction entries are in
`.factory/verification-evidence-7/lighthouse-summary.json` and
`.factory/verification-evidence-7/interaction-timing.json`.

Built budgets:

- JavaScript: 3,122 bytes raw / 1,368 bytes gzip (budget 200 KB).
- CSS: 14,559 bytes raw / 3,871 bytes gzip (budget 50 KB).
- Mobile hero: 65,156 bytes; desktop hero: 192,250 bytes (budget 300 KB).
- Extension: 46.44 KB unpacked / 25,451-byte ZIP.

## Required remediation

1. Give the extension package a content/version-hashed URL, or make the stable
   download alias revalidate and ensure the ZIP digest changes the service
   worker cache revision. Do not cache-first an unversioned release artifact
   indefinitely.
2. Restrict one-year immutable caching to content-hashed assets, or rename the
   fixed hero/social files when their contents change.
3. Add a regression that seeds the old download in Cache Storage, simulates a
   package-only release, and proves the next download returns the new archive.
