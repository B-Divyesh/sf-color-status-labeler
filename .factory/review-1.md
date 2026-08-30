# Adversarial first-read review 1 — Color Status Labeler

**Date:** 2026-08-30 UTC
**Reviewer posture:** fresh visitor, 30 seconds, 390 px mobile and desktop
**Verdict: FAIL**

The live product is understandable and tryable on first view, and all declared claim commands pass. It still has one blocking route-accessibility defect and copy defects. A PASS requires zero findings.

## First screen

At `https://color-status-labeler.sociobot.in/`, before scrolling on both a 390×844 fresh context and desktop:

- **What it does:** it adds words and patterns to dashboard statuses that only use colour.
- **For whom:** people with colour-vision deficiency who read dashboards and maps.
- **First click:** **Try it with sample data**.

The exact first-screen explanation is: “Label color-only dashboard statuses.” and “For people with color-vision deficiency who need dashboard and map statuses shown with readable words and patterns.” The action is adjacent to “Open a sample dispatch board. Change labels without changing your own rules.” This passes the cold-read requirement. The 390 px page had `scrollWidth === clientWidth === 390`; neither context logged a console error.

## Findings, ordered by severity

### F-1-1 — BLOCKING — navigation does not move focus to the new page heading

- **Location/evidence:** Live header navigation from `/` via **Try the demo** produces `/demo/`, and browser Back returns to `/`. After each navigation, `document.activeElement` is `BODY`, not the destination `h1`; the `h1` has no programmatic focus. `site/src/main.ts` contains no page-load route-focus handling.
- **Why this fails:** a keyboard or screen-reader visitor is left at the document body after every real route change and is not placed at the new page’s subject. This fails the required deep-link/back/focus behaviour.
- **Concrete fix:** give each route’s `h1` `tabindex="-1"`; on normal page loads, after the document is ready and when there is no hash target, focus that heading with `preventScroll: true` and announce the route in a polite live region. Add a browser test that follows a header link and Back, then asserts the destination `h1` is focused.

### F-1-2 — MAJOR — README opening sentence exceeds the 22-word hard cap

- **Location/quote:** `README.md`, opening paragraph: “Color Status Labeler is a local browser extension for people with color-vision deficiency who need dashboards and maps to show readable status words and patterns.” **25 words.**
- **Why this fails:** the first product description asks a cold reader to hold audience, surfaces, and outcome in one overlong sentence.
- **Concrete fix:** “A local browser extension for people with color-vision deficiency. It adds words and patterns to dashboard and map statuses.”

### F-1-3 — MAJOR — README deployment sentence is 33 words and uses internal jargon

- **Location/quote:** `README.md`, **Build outputs**: “Its included staticwebapp.config.json preserves the extension ZIP and service-worker routes, applies immutable caching only to content-addressed downloads and Vite’s hashed code bundles, revalidates fixed artwork, and applies the site response policy.” **33 words.**
- **Why this fails:** it exceeds the cap and requires readers to decode implementation names rather than learn the deployment result.
- **Concrete fix:** “`staticwebapp.config.json` keeps the extension ZIP and service worker reachable. It caches versioned downloads and code for a year. It rechecks fixed artwork and HTML.”

### F-1-4 — MINOR — “SIDE B · LIVE TEST” is decorative, not a section name

- **Location/quote:** landing page, immediately above the sample dashboard: “SIDE B · LIVE TEST”.
- **Why this fails:** a heading list or cold visitor cannot infer what content follows; cassette lore carries no product information.
- **Concrete fix:** replace with “Sample dashboard preview”.

### F-1-5 — MINOR — “MAKE YOUR OWN LEGEND” does not name the section

- **Location/quote:** landing page kicker above the three steps.
- **Why this fails:** it is a slogan rather than an out-of-context section label.
- **Concrete fix:** replace with “Set up a status label”.

### F-1-6 — MINOR — “NAME THE SIGNAL” uses unexplained terminology

- **Location/quote:** landing page, step 02 heading.
- **Why this fails:** the product calls the thing a “status” elsewhere; “signal” is an inconsistent metaphor.
- **Concrete fix:** replace with “Choose a label and pattern”.

### F-1-7 — MINOR — “USE THE LIVE LEGEND” is vague and uses an undefined adjective

- **Location/quote:** landing page, step 03 heading.
- **Why this fails:** “live” does not state what the visitor can do or what appears on the page.
- **Concrete fix:** replace with “Read labeled matching statuses”.

### F-1-8 — MINOR — “CHECK THE TAPE” is decorative copy with no product meaning

- **Location/quote:** landing page, warning stamp beside the limitations section.
- **Why this fails:** it is cassette-metaphor copy, not useful warning text.
- **Concrete fix:** remove it, or replace it with “Color-matching limits”.

### F-1-9 — MINOR — “A HELPER, NOT A GUARANTEE” is not an out-of-context heading

- **Location/quote:** landing page, limitations section `h2`.
- **Why this fails:** the heading does not say what is limited, so a heading list loses the subject.
- **Concrete fix:** replace with “Limits of color matching”.

### F-1-10 — MINOR — “Try the switch” is not a result-naming instruction

- **Location/quote:** landing preview: “Try the switch.”
- **Why this fails:** “the switch” gives no expected result to a first-time visitor.
- **Concrete fix:** replace with “Turn labels on or off.”

### F-1-11 — MINOR — technical terms make the colour-matching explanation harder than needed

- **Location/quote:** landing limitations: “The extension matches rendered pixel colors.” README **What it does**: “Samples a rendered background, border, or text color from a page.”
- **Why this fails:** “rendered pixel” is implementation language, not the observable behaviour a visitor needs to understand.
- **Concrete fix:** use “The extension matches colours it can see on the screen.” and “Samples a page’s visible background, border, or text colour.”

### F-1-12 — MINOR — “click-through badges” is unexplained jargon

- **Location/quote:** landing step 03 and README **What it does**: “Matching elements get click-through badges.”
- **Why this fails:** visitors do not need to know an implementation-style label; they need the safety result.
- **Concrete fix:** replace with “Matching statuses get badges that do not block clicks.”

### F-1-13 — MINOR — grayscale usefulness is an unlisted, untested claim

- **Location/quote:** landing, **Use more than color**: “Every trained status gets text and a graphic pattern, so the legend stays useful in grayscale.”
- **Why this fails:** `core-labeling` proves a word badge and a legend, but no `claims.json` entry or tagged test establishes a grayscale outcome.
- **Concrete fix:** either remove “so the legend stays useful in grayscale,” or add a `grayscale-legibility` claim and browser test that applies a grayscale rendering path and verifies distinct text/pattern information remains visible.

### F-1-14 — MINOR — the landing tracking/assets promise is not covered by a matching claim test

- **Location/quote:** landing footer: “No third-party assets or tracking scripts.” README privacy paragraph: “Its public site makes no third-party runtime request.”
- **Why this fails:** the `no-account` claim records requests only while visiting `/demo/`; it does not prove the landing page’s hero assets or all public-site routes make no third-party request. The prose also promises “no third-party assets,” which has no dedicated claim entry.
- **Concrete fix:** add a `site-runtime-privacy` claim that records requests across `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404`, asserting only the product origin and no cookies; or remove the broader wording.

### F-1-15 — MINOR — mobile header action does not name the downloaded result

- **Location/quote:** landing header at 390 px: “Download”.
- **Why this fails:** the link is visible before the more specific hero action and does not identify what will download.
- **Concrete fix:** label it “Download extension” (or “Download for Chrome”).

## Copy audit

Word counts use hyphenated compounds as one word. The tables include visible sentences and the hidden offline status sentence; headings and controls are audited below. `F-*` marks the finding above; all unmarked rows are within the 22-word cap and have no separate sentence-level issue.

### Landing-page sentences

| # | Words | Sentence | Result |
| ---: | ---: | --- | --- |
| 1 | 2 | You’re offline. | Pass |
| 2 | 9 | This guide still works; the extension download may not. | Pass |
| 3 | 4 | Label color-only dashboard statuses. | Pass |
| 4 | 17 | For people with color-vision deficiency who need dashboard and map statuses shown with readable words and patterns. | Pass |
| 5 | 5 | Open a sample dispatch board. | Pass |
| 6 | 7 | Change labels without changing your own rules. | Pass |
| 7 | 6 | Rules stay in Chrome local storage. | Pass |
| 8 | 8 | Sample guide works offline after its first visit. | Pass |
| 9 | 3 | Free to download. | Pass |
| 10 | 7 | Patterns and labels make each status readable. | Pass |
| 11 | 7 | See words and patterns on sample statuses. | Pass |
| 12 | 3 | Try the switch. | F-1-10 |
| 13 | 5 | The underlying dashboard stays intact. | Pass |
| 14 | 14 | Visit the dashboard or map, open the extension, and choose “Pick a status color.” | Pass |
| 15 | 14 | Click a recurring status, give it a plain-language label, and choose a distinct pattern. | Pass |
| 16 | 5 | Matching elements get click-through badges. | F-1-12 |
| 17 | 6 | Your rules return on that site. | Pass |
| 18 | 16 | Every trained status gets text and a graphic pattern, so the legend stays useful in grayscale. | F-1-13 |
| 19 | 4 | No account or analytics. | Pass |
| 20 | 6 | Rules stay in local extension storage. | Pass |
| 21 | 4 | Badges cannot receive clicks. | Pass |
| 22 | 11 | Forms, links, and the data behind your page are never changed. | Pass |
| 23 | 6 | The extension matches rendered pixel colors. | F-1-11 |
| 24 | 12 | Themes, gradients, images, and site redesigns can cause missed or incorrect labels. | Pass |
| 25 | 15 | Confirm critical status in the source system, and retrain a rule whenever a site changes. | Pass |
| 26 | 13 | It does not certify accessibility, inspect hidden business data, or modify server records. | Pass |
| 27 | 6 | Add readable labels to your statuses. | Pass |
| 28 | 11 | Unzip the download, then load the folder in Chrome’s Extensions page. | Pass |
| 29 | 7 | A local utility for readable color status. | Pass |
| 30 | 11 | Hero artwork was generated for this product with Azure AI Foundry. | Pass |
| 31 | 6 | No third-party assets or tracking scripts. | F-1-14 |

### README sentences

| # | Words | Sentence | Result |
| ---: | ---: | --- | --- |
| 1 | 25 | Color Status Labeler is a local browser extension for people with color-vision deficiency who need dashboards and maps to show readable status words and patterns. | F-1-2 |
| 2 | 16 | Teach it recurring status colors on a site and it adds a compact badge and legend. | Pass |
| 3 | 10 | The companion site is designed for `https://color-status-labeler.sociobot.in`. | Pass |
| 4 | 11 | Samples a rendered background, border, or text color from a page. | F-1-11 |
| 5 | 13 | Lets the user assign a plain-language label and one of four distinct patterns. | Pass |
| 6 | 13 | Finds matching elements on that site and adds click-through badges and a legend. | F-1-12 |
| 7 | 10 | Restores saved rules when you return to the same site. | Pass |
| 8 | 8 | Stores per-site rules only in `chrome.storage.local`. | Pass |
| 9 | 4 | Color matching is approximate. | Pass |
| 10 | 12 | Themes, gradients, animations, and site redesigns can cause missed or incorrect labels. | Pass |
| 11 | 17 | This is an operating aid, not a WCAG audit or a source of truth for safety-critical decisions. | Pass |
| 12 | 14 | Run `npm install && npm run build` or download the ZIP from the landing page. | Pass |
| 13 | 10 | Unzip the content-addressed `dist/site/downloads/color-status-labeler-chrome-<digest>.zip` file. | Pass |
| 14 | 6 | Open `chrome://extensions` (or `edge://extensions`). | Pass |
| 15 | 12 | Turn on Developer mode, choose **Load unpacked**, and select the unzipped folder. | Pass |
| 16 | 12 | Open a dashboard, select the extension, and choose **Pick a status color**. | Pass |
| 17 | 8 | The extension does not collect accounts or analytics. | Pass |
| 18 | 8 | Its public site makes no third-party runtime request. | F-1-14 |
| 19 | 16 | Open the sample dispatch board or choose **Try it with sample data** on the landing page. | Pass |
| 20 | 21 | The demo starts with three invented statuses and stores any practice changes only under the separate `demo:color-status-labeler:sample-v1` browser-storage key. | Pass |
| 21 | 5 | **Reset demo** restores the sample. | Pass |
| 22 | 13 | **Start for real** removes the demo key before returning to the installation page. | Pass |
| 23 | 10 | See `.factory/demo.md` for the sample and storage boundary. | Pass |
| 24 | 6 | Requirements: Node.js 22+ and npm. | Pass |
| 25 | 15 | `npm test` uses Playwright 1.58.2 and expects its Chromium browser to be installed. | Pass |
| 26 | 13 | The factory image already provides it; elsewhere run `npx playwright install chromium` once. | Pass |
| 27 | 21 | `npm run build:site` is the deployment build: it packages the extension and places the installable ZIP in the static-site output. | Pass |
| 28 | 8 | The claim regression manifest is `.factory/claims.json`. | Pass |
| 29 | 4 | Unpacked Manifest V3 extension. | Pass |
| 30 | 10 | Deployable static site; `index.html` is at this exact root. | Pass |
| 31 | 6 | Packaged extension linked by the site. | Pass |
| 32 | 16 | The digest changes with the package so returning users cannot receive an old release from cache. | Pass |
| 33 | 4 | Deploy only `dist/site/`. | Pass |
| 34 | 33 | Its included `staticwebapp.config.json` preserves the extension ZIP and service-worker routes, applies immutable caching only to content-addressed downloads and Vite’s hashed code bundles, revalidates fixed artwork, and applies the site response policy. | F-1-3 |
| 35 | 8 | Infrastructure, DNS, and billing are outside this repository. | Pass |
| 36 | 7 | WXT + TypeScript, Manifest V3, no UI framework. | Pass |
| 37 | 7 | Vite + vanilla TypeScript for the static site. | Pass |
| 38 | 14 | Permissions: `storage` for local rules and `activeTab` for starting the picker from the popup. | Pass |
| 39 | 18 | A content script runs on HTTP(S) pages to read computed colors and render isolated Shadow DOM overlays. | Pass |
| 40 | 12 | No account, analytics, cookies, remote APIs, third-party runtime scripts, or downloaded fonts. | Pass |
| 41 | 12 | See [privacy](site/privacy/index.html), [terms](site/terms/index.html), the visual system, `.factory/demo.md`, and the handoff. | Pass |
| 42 | 1 | MIT. | Pass |
| 43 | 2 | See [LICENSE](LICENSE). | Pass |

### Headings and actions checked separately

The product uses **status**, **label**, **pattern**, **rule**, **demo**, and **extension** consistently. The non-sentence labels with copy findings are “SIDE B · LIVE TEST” (F-1-4), “MAKE YOUR OWN LEGEND” (F-1-5), “NAME THE SIGNAL” (F-1-6), “USE THE LIVE LEGEND” (F-1-7), “CHECK THE TAPE” (F-1-8), and “A HELPER, NOT A GUARANTEE” (F-1-9). Primary action **Try it with sample data** is result-naming and clear. Header **Download** is F-1-15. Other headings and actions name their content or result.

## Demo, privacy, claims, and product exercise

`/demo/` passes the sample-data path check. One click from the live landing page opens a screen already showing three realistic dispatch statuses with words and patterns. It has the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, and **Start for real**. Editing Waiting to Queued/Bars created only `demo:color-status-labeler:sample-v1`; Reset removed the key and restored the shipped labels. Entering `/?demo=1` redirected to `/demo/`.

Fresh live request logging for the demo and offline reload found only `https://color-status-labeler.sociobot.in`, no cookies, no console errors, and no real-storage keys. After the first visit, setting the context offline and reloading `/demo/` showed the sample heading and offline notice. The extension tests exercise its separate `chrome.storage.local` namespace; the demo does not read or write it.

I ran `npm ci`, `npm run build`, then every literal command in `.factory/claims.json` from the clean checkout. All passed. `npm test` also passed four times total (one standalone run and three consecutive runs), each with 4 unit assertions and 16 Playwright tests. `npm run typecheck` and `npm run lint` passed.

| Claim id | Result |
| --- | --- |
| color-vision-audience | Pass |
| demo-sandbox | Pass |
| download-extension | Pass |
| cache-freshness | Pass |
| free-download | Pass |
| no-account | Pass |
| backup-transfer | Pass |
| rule-deletion | Pass |
| page-unchanged | Pass |
| extension-runtime-privacy | Pass |
| core-labeling | Pass |
| local-rules | Pass |
| click-through | Pass |
| rules-return | Pass |
| offline-demo | Pass |

The public content-addressed archive returned HTTP 200, `application/zip`, `Content-Disposition: attachment`, and the expected ZIP signature. It was verified by the declared package test. The existing import and export backup flow meets the brief’s obvious transfer expectation. Runtime AI would not improve this deterministic local labeling task, so no AI feature is missing.

## Structure and live routes

Home, demo, privacy, terms, and the designed 404 page each had one `h1`, one `main`, `lang="en"`, a route-specific title/description/canonical/social metadata, favicon, and Apple touch icon. `/404` returned HTTP 404; direct `/404.html` returned the designed source page. The link crawl returned HTTP 200 for every internal destination and `application/zip` for the download; hash and `mailto:` links were intentionally exempt. Header/footer legal links are present and consistent. The cassette field-guide art, sharp borders, paper palette, and self-hosted asset are product-specific rather than a generic SaaS template.

This does **not** clear F-1-1: valid deep URLs and Back navigation exist, but the destination heading is not focused.

## Earlier-review history

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read the existing handoff and verification history as additional evidence. The earlier defects were checked live and in code rather than accepted from their “fixed” labels:

| Earlier finding group | Current verification |
| --- | --- |
| v1–v5 public archive absent | Current content-addressed download is HTTP 200, an attachment ZIP, and `download-extension` passes. |
| v1 offline shell absent | Fresh live `/demo/` controlled service worker and offline reload passed. |
| v1 whitespace validation; v3 focus contrast/target size | Current extension/site tests cover the validation recovery and focus/touch thresholds. |
| v5 missing claims/demo/audience/404/copy audit | Manifest, demo, audience wording, designed 404, and copy-audit artifact exist; this fresh audit identifies the separate current copy defects above. |
| v6 claim coverage, picker focus, and metadata | All declared commands pass; extension tests restore picker focus; route metadata is present. F-1-1 is a separate full-page route-focus failure. |
| v7 stale fixed-name ZIP | Current page links a digest-named ZIP and `cache-freshness` passes. |
| v8 flaky full suite | Three consecutive full `npm test` runs passed in this review. |
| v9 cache claim and 200% clipping | `cache-freshness` is declared/tested; the current mobile test and live 390 px check found no overflow. |

## What would make this perfect

Focus and announce each real route destination; remove the cassette-mood headings and unexplained technical words; split the two overlong README sentences; give the header download its object; and either test or remove each broad grayscale and site-runtime-privacy promise. Then rerun this full review from a clean browser context and clean dependency install.
