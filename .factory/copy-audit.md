# Color Status Labeler copy audit

Audited 2026-09-01 UTC after polish round 2. Every visible landing-page
sentence, heading, navigation label, and action is below the 22-word limit.
No banned plain-words term appears. Claim-like copy maps to
`.factory/claims.json`.

| Landing sentence or label | Words | Result |
| --- | ---: | --- |
| You’re offline. | 2 | Pass |
| This guide still works; the extension download may not. | 9 | Pass |
| Browser extension. | 2 | Pass |
| Local rules. | 2 | Pass |
| Label color-only dashboard statuses. | 4 | Pass |
| For people with color-vision deficiency who need dashboard and map statuses shown with readable words and patterns. | 17 | Pass |
| Try it with sample data. | 5 | Pass |
| Download for Chrome. | 3 | Pass |
| Open a sample dispatch board. | 5 | Pass |
| Change labels without changing your own rules. | 7 | Pass |
| Rules stay in Chrome local storage. | 6 | Pass |
| Sample guide works offline after its first visit. | 8 | Pass |
| Free to download. | 3 | Pass |
| Patterns and labels make each status readable. | 7 | Pass |
| Sample dashboard preview. | 3 | Pass |
| See words and patterns on sample statuses. | 7 | Pass |
| Turn labels on or off. | 5 | Pass |
| The underlying dashboard stays intact. | 5 | Pass |
| Show labels. | 2 | Pass |
| Status legend. | 2 | Pass |
| Set up a status label. | 6 | Pass |
| Label a status in three steps. | 7 | Pass |
| Open the picker. | 3 | Pass |
| Visit the dashboard or map, open the extension, and choose “Pick a status color.” | 14 | Pass |
| Choose a label and pattern. | 6 | Pass |
| Click a recurring status, give it a plain-language label, and choose a distinct pattern. | 14 | Pass |
| Read labeled matching statuses. | 4 | Pass |
| Matching statuses get badges that do not block clicks. | 9 | Pass |
| Your rules return on that site. | 6 | Pass |
| How labels stay readable and local. | 7 | Pass |
| Use more than color. | 4 | Pass |
| Every trained status gets text and a distinct graphic pattern. | 10 | Pass |
| The legend stays useful in grayscale. | 7 | Pass |
| Keep rules on your device. | 5 | Pass |
| No account or analytics. | 4 | Pass |
| Rules stay in local extension storage. | 6 | Pass |
| Does not change page controls. | 5 | Pass |
| Badges cannot receive clicks. | 4 | Pass |
| Forms, links, and the data behind your page are never changed. | 11 | Pass |
| Color-matching limits. | 2 | Pass |
| Limits of color matching. | 5 | Pass |
| A saved label follows nearby solid colors. | 7 | Pass |
| Gradients and larger color changes are not matched. | 8 | Pass |
| Check each label after a site changes. | 7 | Pass |
| Confirm important status in the source system. | 7 | Pass |
| It does not certify accessibility, inspect hidden business data, or modify server records. | 13 | Pass |
| Install in your browser. | 4 | Pass |
| Add readable labels to your statuses. | 6 | Pass |
| Download the extension. | 3 | Pass |
| Unzip the download, then load the folder in Chrome’s Extensions page. | 11 | Pass |
| A local utility for readable color status. | 7 | Pass |
| Hero artwork was generated for this product with Azure AI Foundry. | 11 | Pass |
| No third-party runtime assets or tracking scripts. | 7 | Pass |

## Terminology

| Concept | Product term |
| --- | --- |
| Color-only state shown by a page | status |
| User-written description of a status | label |
| Non-color visual distinction | pattern |
| Stored site-specific configuration | rule |
| Isolated practice data | demo |
| Browser software users install | extension |

The old metaphors “signal,” “hue,” “status tape,” and “A / LIVE” were removed
from the working UI. Cassette imagery remains visual texture, not product
terminology.

## README review

The complete README was read after the round-2 changes. No prose sentence
exceeds 22 words, and the review-specific revisions are:

| Sentence | Words | Result |
| --- | ---: | --- |
| Samples a page’s visible background, top border, or text color. | 10 | Pass; `picker-style-properties` |
| A saved label follows nearby solid colors. | 7 | Pass; `color-matching-limits` |
| Gradients and larger color changes are not matched. | 8 | Pass; `color-matching-limits` |
| Check and retrain each label after a site changes. | 9 | Pass |
| Use it to help read statuses. | 6 | Pass |
| Do not use it to confirm accessibility or critical decisions. | 10 | Pass |
| Its host configuration keeps the extension download and offline worker outside page routing. | 13 | Pass; `static-build-output` |
| It marks versioned downloads and code for one-year caching. | 9 | Pass; `static-build-output` |

All 21 manifest IDs occur exactly once as `@claim:<id>` tags in `tests/`.
