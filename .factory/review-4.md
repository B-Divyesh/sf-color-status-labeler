# Adversarial first-read review 4 — Color Status Labeler

**Date:** 2026-09-01 UTC  
**Reviewer posture:** fresh visitor, 30 seconds, 390 × 844 phone and desktop  
**Live product:** <https://color-status-labeler.sociobot.in/>  
**Verdict: PASS**

There are no findings. This is a PASS because the cold read, sample path,
claims, privacy boundary, prior findings, structure, and copy audit all
completed without an outstanding defect or untested public claim.

## Cold first read

Before scrolling at 390 × 844, I understood the following.

- **What it does:** it adds readable words and patterns to dashboard and map
  statuses that otherwise rely on color.
- **For whom:** people with color-vision deficiency.
- **What to click first:** **Try it with sample data**.

The exact first-screen text that supplied this was **“Label color-only
dashboard statuses.”**, **“For people with color-vision deficiency who need
dashboard and map statuses shown with readable words and patterns.”**, and
**“Open a sample dispatch board. Change labels without changing your own
rules.”** The action was visible at y=505.4–558.2 px, the outcome note at
y=643.0–686.3 px, and all three facts ended at y=786.9 px. There was no
horizontal overflow or console error.

At 1365 × 768, the same answers were visible without scrolling. The action
was at y=497.9–550.7 px and its result note at y=562.7–606.1 px. The live
page had no console errors, no cookies, and requests only to
`https://color-status-labeler.sociobot.in` in fresh browser contexts.

## Copy audit

Word counts treat hyphenated words, URLs, file paths, and code values as one
word. The landing table covers every visible prose sentence; headings,
navigation, and controls are checked immediately after it. No prose sentence
exceeds 22 words. No jargon, inconsistent terminology, marketing adjective,
or uninformative mood heading remains.

### Landing page prose

| Words | Sentence | Check |
| ---: | --- | --- |
| 2 | You’re offline. | Clear status |
| 9 | This guide still works; the extension download may not. | `offline-demo` |
| 4 | Label color-only dashboard statuses. | Clear job headline |
| 17 | For people with color-vision deficiency who need dashboard and map statuses shown with readable words and patterns. | Clear audience and outcome; `color-vision-audience` |
| 5 | Open a sample dispatch board. | Clear outcome; `demo-sandbox` |
| 7 | Change labels without changing your own rules. | Clear isolation; `demo-sandbox` |
| 6 | Rules stay in Chrome local storage. | `local-rules` |
| 8 | Sample guide works offline after its first visit. | `offline-demo` |
| 3 | Free to download. | `free-download` |
| 7 | Patterns and labels make each status readable. | `core-labeling` |
| 7 | See words and patterns on sample statuses. | Clear section heading |
| 5 | Turn labels on or off. | Clear instruction |
| 5 | The underlying dashboard stays intact. | `page-unchanged` |
| 14 | Visit the dashboard or map, open the extension, and choose “Pick a status color.” | Clear instruction |
| 14 | Click a recurring status, give it a plain-language label, and choose a distinct pattern. | `core-labeling` |
| 9 | Matching statuses get badges that do not block clicks. | `click-through` |
| 6 | Your rules return on that site. | `rules-return` |
| 10 | Every labeled status gets text and a distinct graphic pattern. | `core-labeling` |
| 7 | The legend stays useful in grayscale. | `grayscale-legibility` |
| 4 | No account or analytics. | `no-account`, `extension-runtime-privacy` |
| 6 | Rules stay in local extension storage. | `local-rules` |
| 4 | Badges cannot receive clicks. | `click-through` |
| 10 | It does not read passwords, submit forms, or change page controls. | `page-unchanged` |
| 7 | A saved label follows nearby solid colors. | `color-matching-limits` |
| 8 | Gradients and larger color changes are not matched. | `color-matching-limits` |
| 7 | Check each label after a site changes. | Clear safety instruction |
| 9 | Confirm important status on the original dashboard or map. | Clear safety instruction |
| 6 | Use it to help read statuses. | Clear safety instruction |
| 10 | Do not use it to confirm accessibility or critical decisions. | Clear safety instruction |
| 11 | Unzip the download, then load the folder in Chrome’s Extensions page. | Clear installation instruction |
| 8 | Adds words and patterns to color-only dashboard statuses. | Clear footer description |
| 4 | Built by Param Factory. | Attribution |
| 2 | Version 1.0.0. | `release-identity` |
| 11 | Hero artwork was generated for this product with Azure AI Foundry. | `release-identity` |
| 7 | No third-party runtime assets or tracking scripts. | `site-runtime-privacy` |

Landing headings name their content: **Sample dashboard preview**, **Set up a
status label**, **How labels stay readable and local**, and **Limits of color
matching**. The named controls are also clear and result-naming:
**Try it with sample data**, **Download for Chrome**, **Download extension**,
and **Download the extension**. The product uses *status*, *label*, *pattern*,
*rule*, *demo*, and *extension* consistently.

### README prose

| Words | Sentence or prose line | Check |
| ---: | --- | --- |
| 9 | A local browser extension for people with color-vision deficiency. | Clear audience |
| 10 | It adds words and patterns to dashboard and map statuses. | `core-labeling` |
| 7 | The companion site is designed for `https://color-status-labeler.sociobot.in`. | Clear reference |
| 10 | Samples a page’s visible background, top border, or text color. | `picker-style-properties` |
| 12 | Lets the user assign a plain-language label and one of four distinct patterns. | `core-labeling` |
| 14 | Finds matching statuses and adds badges that do not block clicks and a legend. | `core-labeling`, `click-through` |
| 9 | Restores saved rules when you return to the same site. | `rules-return` |
| 7 | Stores per-site rules only in `chrome.storage.local`. | `local-rules` |
| 7 | A saved label follows nearby solid colors. | `color-matching-limits` |
| 8 | Gradients and larger color changes are not matched. | `color-matching-limits` |
| 9 | Check and retrain each label after a site changes. | Clear safety instruction |
| 6 | Use it to help read statuses. | Clear safety instruction |
| 10 | Do not use it to confirm accessibility or critical decisions. | Clear safety instruction |
| 15 | Run `npm install && npm run build` or download the ZIP from the landing page. | Clear installation instruction |
| 6 | Unzip the downloaded extension ZIP file. | Clear installation instruction |
| 4 | Open `chrome://extensions` (or `edge://extensions`). | Clear installation instruction |
| 12 | Turn on Developer mode, choose **Load unpacked**, and select the unzipped folder. | Clear installation instruction |
| 12 | Open a dashboard, select the extension, and choose **Pick a status color**. | Clear installation instruction |
| 8 | The extension does not collect accounts or analytics. | `extension-runtime-privacy` |
| 10 | Its public site uses no third-party runtime assets or tracking scripts. | `site-runtime-privacy` |
| 16 | Open the sample dispatch board or choose **Try it with sample data** on the landing page. | `demo-sandbox` |
| 19 | The demo starts with three invented statuses and stores any practice changes only under the separate `demo:color-status-labeler:sample-v1` browser-storage key. | `demo-sandbox` |
| 5 | **Reset demo** restores the sample. | `demo-sandbox` |
| 13 | **Start for real** removes the demo key before returning to the installation page. | `demo-sandbox` |
| 8 | See `.factory/demo.md` for the sample and storage boundary. | Clear reference |
| 4 | Requirements: Node.js 22+ and npm. | Clear prerequisite |
| 13 | `npm test` uses Playwright 1.58.2 and expects its Chromium browser to be installed. | Clear development note |
| 13 | The factory image already provides it; elsewhere run `npx playwright install chromium` once. | Clear development instruction |
| 20 | `npm run build:site` is the deployment build: it packages the extension and places the installable ZIP in the static-site output. | Clear development note |
| 6 | The claim regression manifest is `.factory/claims.json`. | Clear reference |
| 4 | `.output/chrome-mv3/`: unpacked Manifest V3 extension. | Useful output description |
| 10 | `dist/site/`: deployable static site; `index.html` is at this exact root. | Useful output description |
| 7 | `dist/site/downloads/color-status-labeler-chrome-<digest>.zip`: packaged extension linked by the site. | Useful output description |
| 15 | Each package gets a new download URL, so browsers do not reuse an older package. | `cache-freshness` |
| 3 | Deploy only `dist/site/`. | Clear deployment instruction |
| 15 | The deployed site keeps the download, offline guide, page URLs, and custom not-found page working. | `static-build-output` |
| 9 | It caches versioned downloads and code for one year. | `static-build-output` |
| 8 | Infrastructure, DNS, and billing are outside this repository. | Clear scope |
| 7 | WXT + TypeScript, Manifest V3, no UI framework. | Useful technical description |
| 7 | Vite + vanilla TypeScript for the static site. | Useful technical description |
| 14 | Permissions: `storage` for local rules and `activeTab` for starting the picker from the popup. | Useful permission description |
| 14 | The extension reads visible page styles so it can find colors you taught it. | `picker-style-properties` |
| 7 | It adds labels without changing page controls. | `page-unchanged` |
| 11 | No account, analytics, cookies, remote APIs, third-party runtime scripts, or downloaded fonts. | `extension-runtime-privacy` |
| 10 | See privacy, terms, the visual system, demo documentation, and the handoff. | Clear references |
| 1 | MIT. | Clear license |
| 2 | See LICENSE. | Clear reference |

No landing or README claim-like sentence lacks a corresponding claims entry.

## Demo, sandbox, and privacy

One click from the landing page opens `/demo/`. The first screen already shows
the North hub dispatch board with the realistic invented sample: Dock 03 /
Forklift lane is Ready, Gate 07 / Inbound check is Waiting, and Lift bank /
Service queue is Blocked. The persistent banner says **“Demo — sample data,
nothing is saved”** and exposes **Reset demo** and **Start for real**.

In a fresh live context, changing Waiting to Queued with Bars created only
`demo:color-status-labeler:sample-v1`. Reset restored Waiting and removed that
key. Start for real returned to `/` with empty local and session storage. The
demo has no access to Chrome extension storage in its web context. Its request
log contained only the product origin and its cookie jar was empty.

`/?demo=1` redirected to `/demo/`. The live browser verifier also confirmed a
service-worker-controlled offline reload of the sample guide and its offline
notice. The demo therefore keeps practice data separate from real extension
rules.

## Claims and clean-clone verification

A fresh clone at `02e8083a1bcafa4c5d03acaf382baed9ca7ef0b0` was installed with
`npm ci`. I ran every literal command in `.factory/claims.json` independently;
all 22 passed. Each claim tag appears exactly once in the test sources.

| Claim ids verified |
| --- |
| `color-vision-audience`, `first-screen-demo`, `demo-sandbox`, `download-extension`, `cache-freshness`, `static-build-output`, `free-download`, `no-account`, `site-runtime-privacy`, `backup-transfer`, `rule-deletion` |
| `page-unchanged`, `extension-runtime-privacy`, `release-identity`, `core-labeling`, `picker-style-properties`, `color-matching-limits`, `grayscale-legibility`, `local-rules`, `click-through`, `rules-return`, `offline-demo` |

The complete `npm test` passed: 4 Vitest tests and 26 Playwright tests.
`npm run build`, `npm run typecheck`, and `npm run lint` also passed. The live
deployment verifier confirmed that the live 25,552-byte ZIP exactly matches the
fresh build and loads as the intended Manifest V3 extension.

## Earlier findings rechecked

Every prior review, polish record, and handoff was read. Each prior finding
was confirmed against current live behavior and current source rather than
accepted from a prior status label.

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 | Header navigation and Back focus the destination `h1` and announce it in `#route-announcement`. |
| F-1-2 | README opening is two short sentences. |
| F-1-3 | Old deployment jargon is absent; current deployment copy is short and tested. |
| F-1-4 | Preview label is **Sample dashboard preview**. |
| F-1-5 | Setup label is **Set up a status label**. |
| F-1-6 | Step 2 is **Choose a label and pattern**. |
| F-1-7 | Step 3 is **Read labeled matching statuses**. |
| F-1-8 | Warning label is **COLOR-MATCHING LIMITS**. |
| F-1-9 | Limits heading is **Limits of color matching**. |
| F-1-10 | Preview instruction is **Turn labels on or off**. |
| F-1-11 | Technical rendered-pixel wording is absent; visible style properties are tested. |
| F-1-12 | Copy says badges do not block clicks and the claim passes. |
| F-1-13 | Grayscale wording has a passing distinct-pattern test. |
| F-1-14 | Public-route requests are same-origin and set no cookies. |
| F-1-15 | Compact mobile header action is **Download extension**. |
| F-2-1 | The primary sample action and outcome note fit both required laptop viewports. |
| F-2-2 | Background, top-border, and text-color picking have a passing claim test. |
| F-2-3 | The matching-limit test is stable in this clean run and passes. |
| F-2-4 | Download, cache, worker, routes, and custom 404 are declared and tested. |
| F-2-5 | Navigation says **Color-matching limits**. |
| F-2-6 | The feature section says **How labels stay readable and local**. |
| F-2-7 | The feature heading says **Does not change page controls**. |
| F-2-8 | README safety guidance uses plain language. |
| F-3-1 | Current copy uses **labeled status**, not trained status. |
| F-3-2 | Current safety copy says **original dashboard or map**, not source system. |
| F-3-3 | Footer states the concrete word-plus-pattern job. |
| F-3-4 | README says downloaded ZIP and new download URL, not content-addressing jargon. |
| F-3-5 | README describes working user outcomes, not internal host terms. |
| F-3-6 | Unlisted Shadow DOM implementation promise is absent. |

## Structure, accessibility, and visual identity

Live `/`, `/demo/`, `/privacy/`, `/terms/`, and the designed 404 each have a
route-specific title, one `h1`, one `main`, `lang="en"`, description,
canonical URL, Open Graph/Twitter metadata, favicon, and Apple touch icon.
The compatibility URL, deep links, Back navigation, route focus, and polite
announcement work. An unknown route returns the designed 404 with HTTP 404.

All crawled internal links and the extension ZIP returned HTTP 200. The header
and footer are consistent, with Home/Demo/Privacy access in the header as
appropriate and Demo, Privacy, Terms, Param Factory attribution, and version
in the footer. `robots.txt`, `sitemap.xml`, restrictive headers, and the
self-only CSP are present. The live browser verification passed keyboard,
390 px layout, 44 px navigation targets, focus visibility, reduced motion,
offline shell, no console errors, and Axe serious/critical checks.

The warm-paper cassette field-guide art, hard registration borders,
monospace label-maker body type, black offset shadows, and pattern strips are
distinct from a generic SaaS template. They directly communicate the product’s
word-plus-pattern status-labeling job and match `.factory/design.md`.

## Missed leverage

No missed-feature finding. The brief calls for a local, deterministic browser
extension; an AI feature would add cost, data disclosure, and network behavior
without improving the core job. The expected useful transfer feature exists as
tested JSON backup export/import, including invalid-backup handling. Sync would
conflict with the stated local-first scope.

## What would make this perfect

Keep this review result true: retain the one-click isolated demo, run all
claims from a clean clone for each release, and remove or test any future
visitor-facing promise before it ships. No product change is required for this
review round.
