# First-read review 3 — Color Status Labeler

**Date:** 2026-09-01 UTC  
**Reviewed source:** `46d0395adb0fb703719285eb16d72f1c94e497ae`  
**Live product:** <https://color-status-labeler.sociobot.in/>  
**Verdict: FAIL**

Confirm and check that the product is clear and usable on its live first screen, the isolated demo works, the real extension flow works in the complete suite, and the public routes meet the structural and accessibility checks. The required clean-clone command for `color-matching-limits` failed once before passing on retry. Under this work order, any failed claim command is blocking. Six copy findings also remain. A PASS requires zero findings and no untested claim.

## Cold first read

### 390 × 844 phone

Before scrolling, in my own words:

- **What it does:** adds words and patterns to dashboard statuses that otherwise rely on color.
- **For whom:** people with color-vision deficiency who use dashboards and maps.
- **What to click first:** **Try it with sample data**.

Confirm and check that the exact supporting text is visible: **“Label color-only dashboard statuses.”**, **“For people with color-vision deficiency who need dashboard and map statuses shown with readable words and patterns.”**, and **“Open a sample dispatch board. Change labels without changing your own rules.”** The primary action occupies y=505.4–558.2 px. All three plain facts end at y=786.9 px. The document width and viewport width are both 390 px. No console error appeared.

### 1280 × 720 and 1365 × 768 desktop

Before scrolling, the same three answers are clear. At 1280 × 720, the sample action ends at y=521.0 px and its outcome note ends at y=576.3 px. At 1365 × 768, they end at y=550.7 px and y=606.1 px. The three facts also remain fully visible. No horizontal overflow or console error appeared.

Evidence: `review-3-artifacts/cold-mobile-390.png`, `cold-desktop-1280.png`, and `cold-desktop-1365.png`.

## Findings

### F-2-3 — BLOCKING, reopened — the required color-matching claim command is not reliable from a clean state

- **Location:** `.factory/claims.json`, claim `color-matching-limits`; `tests/e2e/extension.spec.ts`, test beginning at line 280.
- **Exact result:** the required command `npm test -- --grep @claim:color-matching-limits` failed in the clean clone with **“Could not establish connection. Receiving end does not exist.”** at the first `chrome.tabs.sendMessage(... START_PICKER ...)` call.
- **Why this remains blocking:** this claim was added to close F-2-3. Its literal verification command did not reliably reach the extension content receiver from the required clean setup. The full suite and one immediate retry passed, which confirms intermittent timing rather than dependable evidence. The work order treats any failed claim test as blocking.
- **Concrete fix:** in this test, record the page origin and replace both direct `startPicker()` messages with the existing `startPickerAfterReceiverReady(worker, origin)` helper. Confirm the claim command in several fresh extension profiles and from a fresh clone.

### F-3-1 — MINOR — “trained status” introduces a second term for a labeled status

- **Location/quote:** landing page, **Use more than color**: **“Every trained status gets text and a distinct graphic pattern.”**
- **Why this is unclear:** the page otherwise asks people to label a status and stores a rule. “Trained” adds an unexplained term and can suggest a different process.
- **Concrete fix:** **“Every labeled status gets text and a distinct graphic pattern.”**

### F-3-2 — MINOR — “source system” is unexplained operational jargon

- **Location/quote:** landing page, **Limits of color matching**: **“Confirm important status in the source system.”**
- **Why this is unclear:** a first-time visitor may not know whether this means the original dashboard, a database, or another tool.
- **Concrete fix:** **“Confirm important status on the original dashboard or map.”**

### F-3-3 — MINOR — the footer description does not state the product’s concrete job

- **Location/quote:** landing footer: **“A local utility for readable color status.”**
- **Why this is unclear:** “readable color status” is an abstract phrase and differs from the established term “color-only status.”
- **Concrete fix:** **“Adds words and patterns to color-only dashboard statuses.”**

### F-3-4 — MINOR — the README uses “content-addressed” and “digest” without explaining the install result

- **Location/quotes:** README, **Install the packaged build**: **“Unzip the content-addressed `dist/site/downloads/color-status-labeler-chrome-<digest>.zip` file.”** README, **Build outputs**: **“The digest changes with the package so returning users cannot receive an old release from cache.”**
- **Why this is unclear:** a person installing the extension does not need to decode package-addressing terms, and “digest” does not name the visible outcome.
- **Concrete fix:** **“Unzip the downloaded `color-status-labeler-chrome-<version>.zip` file.”** and **“Each package gets a new download URL, so Chrome does not reuse an older package.”** Keep the actual filename pattern in the build-output reference.

### F-3-5 — MINOR — the README deployment sentence uses internal hosting terms

- **Location/quote:** README, **Build outputs**: **“Its host configuration preserves the extension download, offline worker, real page routes, and designed 404.”**
- **Why this is unclear:** “offline worker,” “real page routes,” and “designed 404” name implementation pieces rather than the outcomes a maintainer checks.
- **Concrete fix:** **“The deployed site keeps the download, offline guide, page URLs, and custom not-found page working.”**

### F-3-6 — MAJOR — the README makes an unlisted isolation claim in implementation jargon

- **Location/quote:** README, **Architecture and privacy**: **“A content script runs on HTTP(S) pages to read computed colors and render isolated Shadow DOM overlays.”**
- **Why this is unclear:** “computed colors” and “isolated Shadow DOM overlays” require browser-extension knowledge but do not explain the user-visible result. No `claims.json` entry names or verifies the promised Shadow DOM isolation.
- **Concrete fix:** replace it with the already tested outcomes: **“The extension reads visible colors on the current web page. It adds labels without changing page controls.”** Otherwise add a dedicated claim and check that the live labels are rendered inside a shadow root.

## Copy audit

Word counts treat hyphenated terms, URLs, file paths, and inline-code values as one word. Controls and headings are included because the plain-words check applies to them. No sentence exceeds 22 words, and no banned marketing adjective appears.

### Landing page

| Sentence, heading, or control | Words | Check |
| --- | ---: | --- |
| You’re offline. | 2 | Clear |
| This guide still works; the extension download may not. | 9 | Clear; `offline-demo` |
| Browser extension. | 2 | Clear |
| Local rules. | 2 | Clear |
| Label color-only dashboard statuses. | 4 | Clear |
| For people with color-vision deficiency who need dashboard and map statuses shown with readable words and patterns. | 17 | Clear; `color-vision-audience` |
| Try it with sample data. | 5 | Result-naming action; `demo-sandbox` |
| Download for Chrome. | 3 | Result-naming action; `download-extension` |
| Open a sample dispatch board. | 5 | Clear; `demo-sandbox` |
| Change labels without changing your own rules. | 7 | Clear; `demo-sandbox` |
| Rules stay in Chrome local storage. | 6 | Clear; `local-rules` |
| Sample guide works offline after its first visit. | 8 | Clear; `offline-demo` |
| Free to download. | 3 | Clear; `free-download` |
| Patterns and labels make each status readable. | 7 | Clear; `core-labeling` |
| Sample dashboard preview. | 3 | Clear heading |
| See words and patterns on sample statuses. | 7 | Clear heading |
| Turn labels on or off. | 5 | Clear instruction |
| The underlying dashboard stays intact. | 5 | Covered by `page-unchanged` |
| Show labels. | 2 | Clear control |
| Status legend. | 2 | Clear label |
| Set up a status label. | 6 | Clear heading |
| Label a status in three steps. | 7 | Clear heading |
| Open the picker. | 3 | Clear heading |
| Visit the dashboard or map, open the extension, and choose “Pick a status color.” | 14 | Clear instruction |
| Choose a label and pattern. | 6 | Clear heading |
| Click a recurring status, give it a plain-language label, and choose a distinct pattern. | 14 | Clear instruction |
| Read labeled matching statuses. | 4 | Clear heading |
| Matching statuses get badges that do not block clicks. | 9 | Covered by `click-through` |
| Your rules return on that site. | 6 | Covered by `rules-return` |
| How labels stay readable and local. | 7 | Clear heading |
| Use more than color. | 4 | Clear heading |
| Every trained status gets text and a distinct graphic pattern. | 10 | F-3-1 |
| The legend stays useful in grayscale. | 7 | Covered by `grayscale-legibility` |
| Keep rules on your device. | 5 | Clear heading |
| No account or analytics. | 4 | Covered by privacy claims |
| Rules stay in local extension storage. | 6 | Covered by `local-rules` |
| Does not change page controls. | 5 | Clear heading |
| Badges cannot receive clicks. | 4 | Covered by `click-through` |
| Forms, links, and the data behind your page are never changed. | 11 | Covered by `page-unchanged` |
| Color-matching limits. | 2 | Clear navigation label |
| Limits of color matching. | 5 | Clear heading |
| A saved label follows nearby solid colors. | 7 | F-2-3; `color-matching-limits` |
| Gradients and larger color changes are not matched. | 8 | F-2-3; `color-matching-limits` |
| Check each label after a site changes. | 7 | Clear instruction |
| Confirm important status in the source system. | 7 | F-3-2 |
| It does not certify accessibility, inspect hidden business data, or modify server records. | 13 | Covered by `page-unchanged` and `extension-runtime-privacy` |
| Install in your browser. | 4 | Clear heading |
| Add readable labels to your statuses. | 6 | Clear heading |
| Download the extension. | 3 | Result-naming action |
| Unzip the download, then load the folder in Chrome’s Extensions page. | 11 | Clear instruction |
| A local utility for readable color status. | 7 | F-3-3 |
| Hero artwork was generated for this product with Azure AI Foundry. | 11 | Provenance recorded in `design.md` |
| No third-party runtime assets or tracking scripts. | 7 | Covered by `site-runtime-privacy` |

### README

| Sentence or prose line | Words | Check |
| --- | ---: | --- |
| A local browser extension for people with color-vision deficiency. | 9 | Clear |
| It adds words and patterns to dashboard and map statuses. | 10 | Covered by `core-labeling` |
| The companion site is designed for `https://color-status-labeler.sociobot.in`. | 7 | Clear |
| Samples a page’s visible background, top border, or text color. | 10 | Covered by `picker-style-properties` |
| Lets the user assign a plain-language label and one of four distinct patterns. | 12 | Covered by `core-labeling` |
| Finds matching statuses and adds badges that do not block clicks and a legend. | 14 | Covered by `core-labeling` and `click-through` |
| Restores saved rules when you return to the same site. | 9 | Covered by `rules-return` |
| Stores per-site rules only in `chrome.storage.local`. | 7 | Covered by `local-rules` |
| A saved label follows nearby solid colors. | 7 | F-2-3; `color-matching-limits` |
| Gradients and larger color changes are not matched. | 8 | F-2-3; `color-matching-limits` |
| Check and retrain each label after a site changes. | 9 | Clear instruction |
| Use it to help read statuses. | 6 | Clear instruction |
| Do not use it to confirm accessibility or critical decisions. | 10 | Clear instruction |
| Run `npm install && npm run build` or download the ZIP from the landing page. | 15 | Clear instruction |
| Unzip the content-addressed `dist/site/downloads/color-status-labeler-chrome-<digest>.zip` file. | 5 | F-3-4 |
| Open `chrome://extensions` (or `edge://extensions`). | 4 | Clear instruction |
| Turn on Developer mode, choose **Load unpacked**, and select the unzipped folder. | 12 | Clear instruction |
| Open a dashboard, select the extension, and choose **Pick a status color**. | 12 | Clear instruction |
| The extension does not collect accounts or analytics. | 8 | Covered by `extension-runtime-privacy` |
| Its public site uses no third-party runtime assets or tracking scripts. | 10 | Covered by `site-runtime-privacy` |
| Open the sample dispatch board or choose **Try it with sample data** on the landing page. | 16 | Covered by `demo-sandbox` |
| The demo starts with three invented statuses and stores any practice changes only under the separate `demo:color-status-labeler:sample-v1` browser-storage key. | 19 | Covered by `demo-sandbox` |
| **Reset demo** restores the sample. | 5 | Covered by `demo-sandbox` |
| **Start for real** removes the demo key before returning to the installation page. | 13 | Covered by `demo-sandbox` |
| See `.factory/demo.md` for the sample and storage boundary. | 8 | Clear reference |
| Requirements: Node.js 22+ and npm. | 4 | Clear prerequisite |
| `npm test` uses Playwright 1.58.2 and expects its Chromium browser to be installed. | 13 | Clear development note |
| The factory image already provides it; elsewhere run `npx playwright install chromium` once. | 13 | Clear development instruction |
| `npm run build:site` is the deployment build: it packages the extension and places the installable ZIP in the static-site output. | 20 | Clear development note |
| The claim regression manifest is `.factory/claims.json`. | 6 | Clear reference |
| `.output/chrome-mv3/`: unpacked Manifest V3 extension. | 5 | Useful technical output |
| `dist/site/`: deployable static site; `index.html` is at this exact root. | 10 | Useful technical output |
| `dist/site/downloads/color-status-labeler-chrome-<digest>.zip`: packaged extension linked by the site. | 7 | Useful technical output |
| The digest changes with the package so returning users cannot receive an old release from cache. | 15 | F-3-4 |
| Deploy only `dist/site/`. | 3 | Clear instruction |
| Its host configuration preserves the extension download, offline worker, real page routes, and designed 404. | 15 | F-3-5 |
| It marks versioned downloads and code for one-year caching. | 9 | Covered by `static-build-output` |
| Infrastructure, DNS, and billing are outside this repository. | 8 | Clear scope |
| WXT + TypeScript, Manifest V3, no UI framework. | 8 | Useful technical stack |
| Vite + vanilla TypeScript for the static site. | 8 | Useful technical stack |
| Permissions: `storage` for local rules and `activeTab` for starting the picker from the popup. | 13 | Useful permission reference |
| A content script runs on HTTP(S) pages to read computed colors and render isolated Shadow DOM overlays. | 17 | F-3-6 |
| No account, analytics, cookies, remote APIs, third-party runtime scripts, or downloaded fonts. | 12 | Covered by privacy claims |
| See privacy, terms, the visual system, demo documentation, and the handoff. | 10 | Clear references |
| MIT. | 1 | Clear |
| See LICENSE. | 2 | Clear reference |

The terminology is otherwise consistent: **status** is the color-only state, **label** is its word, **pattern** is its non-color cue, **rule** is saved site configuration, **demo** is isolated sample data, and **extension** is the installed browser software.

## Demo and storage boundary

Confirm and check that one click from the landing page opens `/demo/`. At 390 × 844, the first viewport contains the persistent **“Demo — sample data, nothing is saved”** banner, the complete product headline, the North hub board heading, and the first Ready status card. At desktop size, the board and all three status labels begin in the first viewport.

Confirm and check that the sample is specific rather than placeholder content: Dock 03 / Forklift lane is Ready, Gate 07 / Inbound check is Waiting, and Lift bank / Service queue is Blocked. Changing Waiting to Queued with Bars creates only `demo:color-status-labeler:sample-v1`. **Reset demo** restores Waiting, removes the key, and retains focus on the Reset control. **Start for real** returns to `/` with no demo key. No cookie or other web-storage key was created.

Confirm and check that live demo requests use only `https://color-status-labeler.sociobot.in`. The live browser verifier also confirmed the service-worker-controlled offline reload and visible offline notice. Evidence: `review-3-artifacts/demo-mobile.png` and `demo-desktop.png`.

## Claims and clean-clone checks

The clean clone was `/tmp/color-status-labeler-review3.4aSYfg` at commit `46d0395`. Confirm and check that `npm ci`, `npm run build`, `npm run typecheck`, and `npm run lint` passed. The build produced `dist/site/` and `color-status-labeler-chrome-340e9a19f896f840.zip`. A separate complete `npm test` passed 4 unit checks and 25 Playwright checks.

Every literal claim command was run independently:

| Claim id | Result |
| --- | --- |
| color-vision-audience | Pass |
| first-screen-demo | Pass |
| demo-sandbox | Pass |
| download-extension | Pass |
| cache-freshness | Pass |
| static-build-output | Pass |
| free-download | Pass |
| no-account | Pass |
| site-runtime-privacy | Pass |
| backup-transfer | Pass |
| rule-deletion | Pass |
| page-unchanged | Pass |
| extension-runtime-privacy | Pass |
| core-labeling | Pass |
| picker-style-properties | Pass |
| color-matching-limits | **Fail on required clean run; pass on immediate retry — F-2-3 reopened** |
| grayscale-legibility | Pass |
| local-rules | Pass |
| click-through | Pass |
| rules-return | Pass |
| offline-demo | Pass |

The command summary and exact failure are preserved in `review-3-artifacts/claim-results.md`.

Confirm and check that each manifest id appears exactly once as an `@claim:<id>` tag in `tests/`. Cross-checking found one unlisted runtime statement: the Shadow DOM isolation wording in F-3-6. Artwork provenance, stack names, and developer setup statements are documentation facts rather than runtime promises.

## Earlier finding confirmation

Every earlier review and polish report, plus the current handoff, was read. Each earlier finding was checked against the live site and current source.

| Earlier id | Current confirmation |
| --- | --- |
| F-1-1 | Fixed: internal navigation and Back focus the destination `h1` and update the polite route announcement. |
| F-1-2 | Fixed: the README opening remains two short sentences. |
| F-1-3 | Fixed: the old 33-word deployment sentence is absent. |
| F-1-4 | Fixed: the preview label is **Sample dashboard preview**. |
| F-1-5 | Fixed: the setup label is **Set up a status label**. |
| F-1-6 | Fixed: step 2 is **Choose a label and pattern**. |
| F-1-7 | Fixed: step 3 is **Read labeled matching statuses**. |
| F-1-8 | Fixed: the warning label is **COLOR-MATCHING LIMITS**. |
| F-1-9 | Fixed: the heading is **Limits of color matching**. |
| F-1-10 | Fixed: the instruction is **Turn labels on or off**. |
| F-1-11 | Fixed: the prior rendered-pixel wording is absent; exact style behavior has a claim test. |
| F-1-12 | Fixed: current copy says badges do not block clicks; the claim passes. |
| F-1-13 | Fixed: `grayscale-legibility` passes with distinct words and patterns. |
| F-1-14 | Fixed: live public-route requests are same-origin only, with no cookies. |
| F-1-15 | Fixed: the compact header action is **Download extension**. |
| F-2-1 | Fixed: the sample action and its outcome note fit 1280 × 720 and 1365 × 768. |
| F-2-2 | Fixed: `picker-style-properties` passes for background, top-border, and text colors. |
| F-2-3 | **Partly fixed and reopened:** the claim and behavior exist, but the required clean command failed once. |
| F-2-4 | Fixed: `static-build-output` passes and the live deployment matches the local build. |
| F-2-5 | Fixed: navigation says **Color-matching limits**. |
| F-2-6 | Fixed: the section says **How labels stay readable and local**. |
| F-2-7 | Fixed: the feature heading says **Does not change page controls**. |
| F-2-8 | Fixed: the README now gives two direct safety instructions without the former standards wording. |

## Structure, accessibility, privacy, and links

Confirm and check that `/`, `/demo/`, `/privacy/`, `/terms/`, and an unknown URL each have `lang="en"`, exactly one `h1`, exactly one `main`, a route-specific title, a plain meta description, canonical metadata, Open Graph and Twitter metadata, the product social image, SVG favicon, and Apple touch icon. All titles are under 60 characters. The unknown URL returns the designed page with HTTP 404.

Confirm and check that every crawled internal page and the content-addressed extension download returns 200. `robots.txt`, `sitemap.xml`, icons, and the 1200 × 630 social image also return 200. The footer consistently includes Demo, Privacy, Terms, the Param Factory credit, and version. The header retains the wordmark and no more than four navigation actions.

Confirm and check that `npm run verify:deployment`, `npm run verify:browser`, and `/opt/fleet/lib/verify-url.sh https://color-status-labeler.sociobot.in .factory/review-3-artifacts` pass. Integrated Axe checks report no serious or critical issue on home, demo, privacy, terms, or 404. Keyboard, 390 px layout, 200% text, visible focus, reduced motion, offline reload, and route focus checks pass. Live request recording found only the product origin, no cookies, and no console errors.

Confirm and check that the cassette-era field-guide identity is distinct from a generic product template. The warm paper palette, clipped shapes, registration marks, pattern tracks, hard shadows, and original cassette artwork directly explain the word-plus-pattern job and match `.factory/design.md`.

## Missed leverage

No missed feature finding is recorded. Confirm and check that backup export/import, malformed-backup recovery, one-rule deletion, undo, clear-all, and the installable ZIP are present and tested. Those functions cover the useful transfer and recovery step implied by locally stored rules. The core job is deterministic color sampling and labeling; an optional model step would add disclosure, cost, and network behavior without improving the stated job. Sync would conflict with the current local-first scope unless introduced as a separate, explicit product decision.

## What would make this perfect

Make the `color-matching-limits` claim command wait for the content receiver before both picker starts, then confirm repeated fresh-clone runs. Replace the six flagged copy items with the proposed plain-language wording. Rerun every claim command, the complete suite, the live route checks, and this full first-read review. A PASS is appropriate only when all commands pass on their required run and no copy finding remains.
