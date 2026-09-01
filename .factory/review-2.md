# Adversarial first-read review 2 — Color Status Labeler

**Date:** 2026-09-01 UTC  
**Reviewer posture:** fresh visitor, 30 seconds, 390 × 844 mobile and desktop  
**Verdict: FAIL**

This review reruns the checklist rather than relying on the earlier repair map. The review identifies one blocking first-screen issue, three unlisted-claim issues, and four minor copy issues. A PASS requires zero findings.

## Cold first read

### 390 × 844 mobile

Before scrolling, the screen states:

- **What it does:** It labels dashboard statuses that only use color with words and patterns.
- **For whom:** People with color-vision deficiency who use dashboards and maps.
- **What to click first:** **Try it with sample data**.

The heading, audience sentence, action, outcome note, and three facts are visible. The page width is 390 px with no horizontal overflow and no console errors. This viewport passes the cold-read check.

### Desktop

At 1440 × 900, the screen supplies the same three answers; the sample-data action is just inside the first viewport. At the common 1365 × 768 and 1280 × 720 desktop viewports, the large five-line heading pushes the intended primary action below the first viewport. The header link **“Try the demo”** is visible, but it is not adjacent to what happens after clicking and does not state the sample-data/storage boundary. This is finding F-2-1.

## Findings, ordered by severity

### F-2-1 — BLOCKING — the first-screen primary action is below the fold on common desktop viewports

- **Location/evidence:** live `/` at 1365 × 768: the `Try it with sample data` link begins at y=770.8 and ends at y=823.6. At 1280 × 720 it begins at y=744.2. The useful adjacent explanation, **“Open a sample dispatch board. Change labels without changing your own rules.”**, is also below the viewport.
- **Why this does not meet the first-read requirement:** the page's intended one-click, safe trial action is not visible before scrolling on ordinary laptop heights. The visible header link **“Try the demo”** gives neither the result nor the storage boundary required alongside the primary action.
- **Concrete fix:** reduce the desktop hero's title scale/vertical padding enough that the primary action and its two short outcome sentences are visible at 1280 × 720. Alternatively, make the visible header action read **“Try sample data — nothing is saved”** and retain the result note beside it. Add a 1280 × 720 browser assertion that the action and result note are fully in view on initial load.

### F-2-2 — MAJOR — README has an unlisted claim about which page styles the picker samples

- **Location/quote:** `README.md`, **What it does**: **“Samples a page’s visible background, border, or text color.”**
- **Why this needs a claim entry:** this describes three observable product capabilities. `.factory/claims.json` has no entry for this claim; `core-labeling` only observes a background-color sample in the supplied dispatch board. A visitor cannot confirm the stated border and text-color behavior from the declared claim suite.
- **Concrete fix:** add `picker-style-properties` to `.factory/claims.json` and a tagged extension test that trains one visible background, one border, and one text color, then confirms the selected property and resulting badge. Otherwise reduce the README statement to the tested background-color behavior.

### F-2-3 — MAJOR — color-matching limitations are claim-like but unlisted and untested

- **Location/quote:** landing **Limits of color matching**: **“The extension matches colors it can see on the screen.”** and **“Themes, gradients, images, and site redesigns can cause missed or incorrect labels.”** README has the equivalent **“Color matching is approximate.”** and **“Themes, gradients, animations, and site redesigns can cause missed or incorrect labels.”**
- **Why this needs a claim entry:** these sentences give visitors specific behavioral limits that they may rely on when deciding whether to use the extension. No claim entry checks the matching boundary or any listed limitation.
- **Concrete fix:** either add a `color-matching-limits` claim with fixtures for a theme change and non-solid background, or replace the statements with an actionable, non-technical warning: **“Check each label after a site changes. Confirm important status in the source system.”** Keep the existing source-system advice.

### F-2-4 — MAJOR — README deployment behavior is unlisted claim copy

- **Location/quote:** `README.md`, **Build outputs**: **“`staticwebapp.config.json` keeps the extension ZIP and service worker reachable.”**, **“It caches versioned downloads and code for a year.”**, and **“It rechecks fixed artwork and HTML.”**
- **Why this needs a claim entry:** these are operational promises to a deployer. `cache-freshness` verifies that a digest-named archive is fresh, but it does not claim or test these three configuration outcomes as written. The existing `free-download` test inspects source configuration while its manifest claim concerns payment, so it is not an entry for this copy.
- **Concrete fix:** add a `static-host-cache-policy` claim and test built `staticwebapp.config.json` for the ZIP, worker, HTML, and immutable-asset policy; or move these implementation details to an internal deployment note and retain only tested user-facing output instructions.

### F-2-5 — MINOR — “Good to know” is not a useful navigation destination name

- **Location/quote:** landing header link: **“Good to know”**.
- **Why this is unclear:** a heading list or a first-time visitor cannot identify that the link leads to matching limits and safety guidance.
- **Concrete fix:** change the link text to **“Color-matching limits”**.

### F-2-6 — MINOR — “Designed for daily status checks” does not name the section contents

- **Location/quote:** landing `h2`: **“Designed for daily status checks”**.
- **Why this is unclear:** it is a broad assurance. It does not identify that the following content covers words and patterns, local rules, and unchanged controls.
- **Concrete fix:** use **“How labels stay readable and local”** or add a short section label that names those three topics.

### F-2-7 — MINOR — “Leaves controls alone” is vague

- **Location/quote:** landing feature-card heading: **“Leaves controls alone”**.
- **Why this is unclear:** a cold visitor has to read the paragraph to learn whether the extension changes form values, links, or clicks.
- **Concrete fix:** change the heading to **“Does not change page controls”**.

### F-2-8 — MINOR — README limitation wording uses unexplained standards jargon

- **Location/quote:** `README.md`: **“This is an operating aid, not a WCAG audit or a source of truth for safety-critical decisions.”**
- **Why this is unclear:** “operating aid” is abstract and “WCAG” is unexplained in the first product description.
- **Concrete fix:** **“Use it to help read statuses. Do not use it to confirm accessibility or critical decisions.”** Link to WCAG only where the standard needs to be explained.

## Copy audit

The tables list each visitor-facing landing and README sentence with its reviewed word count. Commands, file paths, standalone headings, navigation labels, and buttons are listed after the sentence tables. No reviewed sentence exceeds 22 words.

### Landing sentences

| Sentence | Words | Check |
| --- | ---: | --- |
| Label color-only dashboard statuses. | 4 | Pass |
| For people with color-vision deficiency who need dashboard and map statuses shown with readable words and patterns. | 17 | Pass |
| Open a sample dispatch board. | 5 | Pass |
| Change labels without changing your own rules. | 7 | Pass |
| Rules stay in Chrome local storage. | 6 | Pass |
| Sample guide works offline after its first visit. | 8 | Pass |
| Free to download. | 3 | Pass |
| Patterns and labels make each status readable. | 7 | Pass |
| See words and patterns on sample statuses. | 7 | Pass |
| Turn labels on or off. | 5 | Pass |
| The underlying dashboard stays intact. | 5 | Covered by `page-unchanged` |
| Label a status in three steps. | 6 | Pass |
| Visit the dashboard or map, open the extension, and choose “Pick a status color.” | 14 | Pass |
| Click a recurring status, give it a plain-language label, and choose a distinct pattern. | 14 | Pass |
| Matching statuses get badges that do not block clicks. | 9 | Covered by `click-through` |
| Your rules return on that site. | 6 | Covered by `rules-return` |
| Every trained status gets text and a distinct graphic pattern. | 10 | Covered by `core-labeling` |
| The legend stays useful in grayscale. | 7 | Covered by `grayscale-legibility` |
| No account or analytics. | 4 | Covered by privacy claims |
| Rules stay in local extension storage. | 6 | Covered by `local-rules` |
| Badges cannot receive clicks. | 4 | Covered by `click-through` |
| Forms, links, and the data behind your page are never changed. | 11 | Covered by `page-unchanged` |
| The extension matches colors it can see on the screen. | 10 | F-2-3 |
| Themes, gradients, images, and site redesigns can cause missed or incorrect labels. | 12 | F-2-3 |
| Confirm critical status in the source system, and retrain a rule whenever a site changes. | 15 | Useful instruction |
| It does not certify accessibility, inspect hidden business data, or modify server records. | 13 | Covered in part by privacy claims |
| Unzip the download, then load the folder in Chrome’s Extensions page. | 11 | Pass |
| A local utility for readable color status. | 11 | Pass |
| Hero artwork was generated for this product with Azure AI Foundry. | 11 | Provenance; see design record |
| No third-party runtime assets or tracking scripts. | 7 | Covered by `site-runtime-privacy` |

### README sentences

| Sentence | Words | Check |
| --- | ---: | --- |
| A local browser extension for people with color-vision deficiency. | 9 | Pass |
| It adds words and patterns to dashboard and map statuses. | 10 | Covered by `core-labeling` |
| Samples a page’s visible background, border, or text color. | 9 | F-2-2 |
| Lets the user assign a plain-language label and one of four distinct patterns. | 12 | Covered by `core-labeling` |
| Finds matching statuses and adds badges that do not block clicks and a legend. | 14 | Covered by `core-labeling` and `click-through` |
| Restores saved rules when you return to the same site. | 9 | Covered by `rules-return` |
| Stores per-site rules only in `chrome.storage.local`. | 7 | Covered by `local-rules` |
| Color matching is approximate. | 4 | F-2-3 |
| Themes, gradients, animations, and site redesigns can cause missed or incorrect labels. | 12 | F-2-3 |
| This is an operating aid, not a WCAG audit or a source of truth for safety-critical decisions. | 17 | F-2-8 |
| Run `npm install && npm run build` or download the ZIP from the landing page. | 15 | Pass |
| Unzip the content-addressed `dist/site/downloads/color-status-labeler-chrome-<digest>.zip` file. | 5 | Technical instruction |
| Open `chrome://extensions` (or `edge://extensions`). | 3 | Pass |
| Turn on Developer mode, choose **Load unpacked**, and select the unzipped folder. | 11 | Pass |
| Open a dashboard, select the extension, and choose **Pick a status color**. | 11 | Pass |
| The extension does not collect accounts or analytics. | 7 | Covered by `extension-runtime-privacy` |
| Its public site uses no third-party runtime assets or tracking scripts. | 10 | Covered by `site-runtime-privacy` |
| Open the sample dispatch board or choose **Try it with sample data** on the landing page. | 15 | Covered by `demo-sandbox` |
| The demo starts with three invented statuses and stores any practice changes only under the separate `demo:color-status-labeler:sample-v1` browser-storage key. | 17 | Covered by `demo-sandbox` |
| **Reset demo** restores the sample. | 4 | Covered by `demo-sandbox` |
| **Start for real** removes the demo key before returning to the installation page. | 12 | Covered by `demo-sandbox` |
| See `.factory/demo.md` for the sample and storage boundary. | 7 | Documentation link |
| Requirements: Node.js 22+ and npm. | 4 | Development prerequisite |
| `npm test` uses Playwright 1.58.2 and expects its Chromium browser to be installed. | 11 | Development prerequisite |
| The factory image already provides it; elsewhere run `npx playwright install chromium` once. | 12 | Development instruction |
| `npm run build:site` is the deployment build: it packages the extension and places the installable ZIP in the static-site output. | 20 | Build behavior |
| The claim regression manifest is `.factory/claims.json`. | 6 | Documentation statement |
| The digest changes with the package so returning users cannot receive an old release from cache. | 15 | Covered by `cache-freshness` |
| Deploy only `dist/site/`. | 3 | Development instruction |
| `staticwebapp.config.json` keeps the extension ZIP and service worker reachable. | 10 | F-2-4 |
| It caches versioned downloads and code for a year. | 10 | F-2-4 |
| It rechecks fixed artwork and HTML. | 6 | F-2-4 |
| Infrastructure, DNS, and billing are outside this repository. | 8 | Repository scope |
| A content script runs on HTTP(S) pages to read computed colors and render isolated Shadow DOM overlays. | 16 | Technical capability; add to F-2-2 test scope if retained |
| No account, analytics, cookies, remote APIs, third-party runtime scripts, or downloaded fonts. | 10 | Covered by privacy claims |
| See privacy, terms, the visual system, demo documentation, and the handoff. | 10 | Documentation links |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

### Headings, labels, and actions

| Text | Check |
| --- | --- |
| Browser extension; Local rules | Plain factual labels |
| Try it with sample data | Result-naming action; F-2-1 concerns desktop placement |
| Download for Chrome; Download the extension; Download extension | Result-naming actions |
| Sample dashboard preview; See words and patterns on sample statuses | Clear section labels |
| Set up a status label; Label a status in three steps; Open the picker; Choose a label and pattern; Read labeled matching statuses | Clear process outline |
| Designed for daily status checks | F-2-6 |
| Use more than color; Keep rules on your device | Useful, but their parent section needs a descriptive name |
| Leaves controls alone | F-2-7 |
| Limits of color matching; Install in your browser; Add readable labels to your statuses | Clear section labels |
| Good to know | F-2-5 |

The copy uses **status**, **label**, **pattern**, **rule**, **demo**, and **extension** consistently. No banned marketing adjective appears in the reviewed product copy. The documented original cassette-field-guide visual treatment is distinct from a generic SaaS template.

## Demo, sandbox, and privacy checks

The one-click path from `/` to `/demo/` opens a screen already showing the invented North hub dispatch board, with Ready, Waiting, and Blocked labels plus distinct patterns. The persistent banner reads **“Demo — sample data, nothing is saved”** and supplies **Reset demo** and **Start for real**.

In a fresh live 390 px context, changing Waiting to Queued with Bars created only `demo:color-status-labeler:sample-v1`. Reset returned the word to Waiting and removed the key. Start for real returned to `/` with no demo key. The live request log contained only `https://color-status-labeler.sociobot.in`; the context had no cookies. The declared extension tests separately confirm that this demo namespace does not write extension rules. This check passes.

## Claims and clean-clone verification

I created a fresh local clone, ran `npm ci`, `npm run build`, `npm run typecheck`, and `npm run lint`, then ran every literal command named by `.factory/claims.json`. All passed. A subsequent complete `npm test` passed 4 unit tests and 19 Playwright tests. A final `npm run build` produced `dist/site/`.

| Claim id | Result |
| --- | --- |
| color-vision-audience | Pass |
| demo-sandbox | Pass |
| download-extension | Pass |
| cache-freshness | Pass |
| free-download | Pass |
| no-account | Pass |
| site-runtime-privacy | Pass |
| backup-transfer | Pass |
| rule-deletion | Pass |
| page-unchanged | Pass |
| extension-runtime-privacy | Pass |
| core-labeling | Pass |
| grayscale-legibility | Pass |
| local-rules | Pass |
| click-through | Pass |
| rules-return | Pass |
| offline-demo | Pass |

The claim test results do not remove F-2-2 through F-2-4: their live/README statements have no matching claims-manifest entry as required by the claim check.

## Earlier review and polish checks

I read `.factory/review-1.md`, `.factory/polish-1.md`, and the previous handoff. The table confirms each earlier finding against the current live deployment and current source, rather than accepting the repair status.

| Earlier id | Current check |
| --- | --- |
| F-1-1 | Confirmed fixed. Live `/` → `/demo/` and browser Back focus the destination `h1` and update `#route-announcement`. |
| F-1-2 | Confirmed fixed. README opening is two 9- and 10-word sentences. |
| F-1-3 | Confirmed fixed. The prior 33-word deployment sentence is now three short sentences; F-2-4 is the separate manifest-coverage issue. |
| F-1-4 | Confirmed fixed. Live label is **Sample dashboard preview**. |
| F-1-5 | Confirmed fixed. Live label is **Set up a status label**. |
| F-1-6 | Confirmed fixed. Live step is **Choose a label and pattern**. |
| F-1-7 | Confirmed fixed. Live step is **Read labeled matching statuses**. |
| F-1-8 | Confirmed fixed. Live warning label is **COLOR-MATCHING LIMITS**. |
| F-1-9 | Confirmed fixed. Live heading is **Limits of color matching**. |
| F-1-10 | Confirmed fixed. Live control text is **Turn labels on or off**. |
| F-1-11 | Confirmed fixed. Current wording says colors visible on screen and visible page colors. |
| F-1-12 | Confirmed fixed. Current copy says badges do not block clicks; `click-through` passes. |
| F-1-13 | Confirmed fixed. `grayscale-legibility` passes and live samples have distinct words/patterns. |
| F-1-14 | Confirmed fixed. `site-runtime-privacy` passes; a fresh live request log is same-origin with no cookies. |
| F-1-15 | Confirmed fixed. Current header action says **Download extension**. |

No earlier finding is repeated. Findings F-2-1 through F-2-8 are new checks from this full review.

## Structure and route checks

- Home, demo, privacy, terms, and designed 404 each have one `h1`, a `main` landmark, `lang="en"`, route-specific title, description, canonical URL, Open Graph/Twitter metadata, favicon, and Apple touch icon.
- Live response checks: `/`, `/demo/`, `/privacy/`, `/terms/`, `/robots.txt`, `/sitemap.xml`, `/sw.js`, and the digest-named ZIP return 200; `/404` returns 404; `/404.html` returns the designed document.
- A live crawl confirmed 200 responses for home, demo, privacy, terms, and the ZIP. Fragment and `mailto:` links were intentionally exempt.
- Header/footer legal links are consistent. Direct URLs, Back navigation, focus, and polite route announcements work. The live content has no browser console errors in the reviewed flows.
- No obvious AI feature is missing. This is a deterministic, local color-labeling task; AI would not improve its core job. The extension already supplies the brief-implied backup export/import capability.

## What would make this perfect

Keep the sample-data action and its storage explanation inside a 1280 × 720 desktop first viewport. Add testable claim entries for picker style properties, matching limits, and deployment cache behavior or remove those promises. Rename the three vague headings/links and replace the README WCAG jargon. Re-run this full review from a clean clone and fresh live browser contexts after those changes.
