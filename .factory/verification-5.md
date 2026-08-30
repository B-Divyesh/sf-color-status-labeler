# Color Status Labeler — independent verification 5

**Verdict: FAIL — release blocked.**

Verified on 2026-08-30 UTC from clean checkout commit
`d1da786583eb9b11c2fe0a47c84dba25266f0920` against
<https://color-status-labeler.sociobot.in/>. This is fresh evidence and
supersedes the earlier deployment-only reports: the live artifact now does
match this candidate. The failure is against the mandatory claims, plain-words,
and demo-sandbox acceptance contract.

## Release blockers

### Critical — required claims contract is absent

The clean candidate has no `.factory/claims.json`. I checked it before running
any product test; consequently there were no declared claim-test commands to
run from the required demo entry point. The claims skill makes either condition
release-blocking: missing file, or any failing claim test.

This is material, not merely a missing document. The public page and README
make relied-on claims including “Local only”, “No account”, “Free forever”,
“No sign-in, server, analytics, or browsing-history collection”, local storage,
non-clicking badges, automatic return of rules, and offline guide availability.
None is listed in or exercised by a tagged `@claim:<id>` test in the required
claims manifest. Add the manifest and one observable demo-entry-point test per
claim, or remove claims that cannot be tested.

### Critical — no one-click, isolated sample-data demo

Cold desktop and 390px mobile visits show only **Download for Chrome** and
**See the 3-step setup**. There is no control named “Try it with sample data”,
no demo link, and no `data-demo` control. The visual “LIVE TEST” switch is a
landing-page illustration, not the extension’s user-trained picker and does
not enter an isolated workspace.

Both `/demo` and `/?demo=1` return the identical 7,279-byte landing page; no
persistent “Demo — sample data, nothing is saved” banner, Reset demo, or Start
for real control appears. `.factory/demo.md` is also absent. This directly
fails the mandatory demo-sandbox contract and the work order’s explicit rule
that the candidate fails without this one-click demo.

### Critical — first read does not name the intended user

The cold first screen says what it does (“Teach your browser that green means
‘ready’... It adds a word and a pattern”) and gives an installation action, but
it never says that it is for people with color-vision deficiency. The generic
“your dashboard” wording does not answer *for whom* in plain words. The
mandatory first-read test therefore fails independently of the missing demo.

### Medium — no real 404 route

`/404` returns HTTP 200 with the root landing page, not a styled 404 response.
The static configuration has no `responseOverrides` 404 rule or dedicated
`404.html`, despite the site-structure acceptance contract.

### Low — required copy-audit proof is absent

`.factory/copy-audit.md` is absent, so the required plain-words sentence and
terminology audit was not supplied. This is not counted separately from the
first-read blocker above.

## Required claims preflight

| Check | Result | Evidence |
| --- | --- | --- |
| `.factory/claims.json` exists | **FAIL** | `sed -n '1,240p' .factory/claims.json` returned “No such file or directory” in the clean checkout. |
| Every declared claim test from demo entry point | **Blocked / FAIL** | No manifest means no commands or required demo entry point exist. |
| `@claim:` tests in repository | **Absent** | No claim test tags or manifest were present. |

## Cold first-read result

On a new browser context the first-screen text was: “Stop guessing what the
colors mean. Teach your browser that green means ‘ready,’ yellow means
‘waiting,’ or whatever your dashboard actually means. It adds a word and a
pattern—without changing the page underneath.” The available primary action
is “Download for Chrome”.

My cold reading: it is a downloadable browser extension that adds textual and
pattern labels to color-only dashboard statuses; it appears aimed at dashboard
users; click Download for Chrome first. It does **not** plainly say it is for
people with color-vision deficiency, and it lacks the mandatory one-click
sample-data trial. Browser request log: only the product origin; no console or
page errors.

## Clean local gates and product exercise

| Command / exercise | Result |
| --- | --- |
| `npm ci` | PASS — 265 packages, 0 reported vulnerabilities. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS. |
| `npm test` | PASS — 4 Vitest assertions and 6 Playwright tests. |
| `npm run build` | PASS — builds MV3 package and `dist/site/`. |
| Public package installed in fresh Chromium profile | PASS — real downloaded ZIP loaded as Color Status Labeler MV3. |

Independent extension exercise using the public ZIP: opened the live page,
started the picker, sampled the green status, named it `Ready`, selected a
pattern, and saved it. A visible `Ready` badge and legend appeared; the badge
is non-intercepting. A whitespace-only label produced the visible `role=alert`
message “Enter a status label; spaces alone cannot name a signal.” with
`aria-invalid="true"`; replacing it with `Ready` saved normally. A 33-character
input was constrained to 32 characters and saved as
`12345678901234567890123456789012`. The overlay dialog had zero axe serious or
critical findings. No product console/page error occurred during this flow.

## Live deployment, privacy, accessibility, and performance

- `npm run verify:deployment` passed. The public download is HTTP 200,
  `application/zip`, attachment disposition, immutable one-year caching, has a
  `PK\x03\x04` signature, passes `unzip -tqq`, loads in fresh Chromium, and
  byte-matches the exact local build: 25,254 bytes, SHA-256
  `8145e8e7918b228e9e7ca76ff2a91fbdc34a34f5458ea801c1c188930dcda346`.
- The verifier also byte-matched live `/`, privacy, terms, service worker,
  icon, robots, sitemap, JS, CSS, and hero assets to this candidate. Thus the
  previously reported deployment-only artifact failure is fixed.
- `npm run verify:browser` passed: desktop and 390×844 mobile, skip link,
  Space operation, designed focus indicators, reduced motion, service-worker
  update, and offline reload all passed. No mobile horizontal overflow.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200; title; `lang=en`; exactly
  one h1; main landmark; no missing image alts; no console/page errors.
  Axe scans of `/`, `/privacy/`, `/terms/`, extension popup, and picker dialog
  found zero serious/critical findings.
- Production request logs contained only `https://color-status-labeler.sociobot.in`;
  the page set no cookies and left local/session storage empty. The manifest
  requests only `storage` and `activeTab`; source review found no analytics,
  remote API, telemetry, third-party script, or downloaded font. Rules use
  `chrome.storage.local`. There is no sign-in or server endpoint, so Entra and
  429/`Retry-After` checks are not applicable.
- Headers are appropriate: self-only CSP, restrictive Permissions-Policy, HSTS,
  `nosniff`, `DENY` framing, strict-origin referrer policy; hashed assets and
  ZIP are immutable; `sw.js` is `no-cache` with root worker scope.
- Built initial JS is 1,134 B (600 B gzip), CSS 10,952 B (3,172 B gzip), mobile
  hero 65,156 B, desktop hero 192,250 B; all are within the stated budgets.
  A fresh Lighthouse 13.4.1 mobile audit passed with Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s,
  TBT 60 ms, CLS 0.

## Required remediation before re-verification

1. Add `.factory/claims.json`, tagged observable tests for every relied-on
   public claim, and run each from a clean demo entry point.
2. Add `/demo` or `?demo=1` with a realistic extension sample flow in a
   separate storage namespace, the required persistent demo banner, Reset demo
   and Start for real controls, and `.factory/demo.md`.
3. Rewrite the first screen to name people with color-vision deficiency in
   plain words and place “Try it with sample data” on that first screen.
4. Add the required real 404 response and the copy audit, then rerun all gates.
