# Color Status Labeler

Color Status Labeler is a free, local-first browser extension for people who cannot reliably infer dashboard or map status from red, green, or yellow alone. Teach it the recurring status colors on a site and it adds compact word-and-pattern badges plus a live legend.

The companion site is designed for `https://color-status-labeler.sociobot.in`.

## What it does

- Samples a rendered background, border, or text color from a page.
- Lets the user assign a plain-language label and one of four distinct patterns.
- Finds matching elements on that site and adds click-through badges and a legend.
- Watches dynamic pages for status changes without changing links, forms, or server data.
- Stores per-site rules only in `chrome.storage.local`.
- Exports and imports a JSON backup on explicit user action.

Color matching is approximate. Themes, gradients, animations, and site redesigns can cause missed or incorrect labels. This is an operating aid, not a WCAG audit or a source of truth for safety-critical decisions.

## Install the packaged build

1. Run `npm install && npm run build` or download the ZIP from the landing page.
2. Unzip `dist/site/downloads/color-status-labeler-chrome.zip`.
3. Open `chrome://extensions` (or `edge://extensions`).
4. Turn on Developer mode, choose **Load unpacked**, and select the unzipped folder.
5. Open a dashboard, select the extension, and choose **Pick a status color**.

Browser-protected pages such as extension stores and settings cannot be labeled.

## Develop and verify

Requirements: Node.js 22+ and npm.

```sh
npm install
npm run dev          # WXT extension development mode
npm run dev:site     # landing site development server
npm run typecheck
npm run lint
npm test             # unit, site accessibility, mobile, and real extension tests
npm run build        # extension ZIP + static site in dist/site/
```

`npm test` uses Playwright 1.58.2 and expects its Chromium browser to be installed. The factory image already provides it; elsewhere run `npx playwright install chromium` once. `npm run build:site` is the deployment build: it packages the extension and places the installable ZIP in the static-site output.

## Build outputs

- `.output/chrome-mv3/`: unpacked Manifest V3 extension.
- `dist/site/`: deployable static site; `index.html` is at this exact root.
- `dist/site/downloads/color-status-labeler-chrome.zip`: packaged extension linked by the site.

Deploy only `dist/site/`. Its included `staticwebapp.config.json` preserves the extension ZIP and service-worker routes, sets immutable caching for hashed assets, and applies the site response policy. Infrastructure, DNS, and billing are outside this repository.

## Architecture and privacy

- WXT + TypeScript, Manifest V3, no UI framework.
- Vite + vanilla TypeScript for the static site.
- Permissions: `storage` for local rules and `activeTab` for starting the picker from the popup. A content script runs on HTTP(S) pages to read computed colors and render isolated Shadow DOM overlays.
- No account, analytics, cookies, remote APIs, third-party runtime scripts, or downloaded fonts.
- See [privacy](site/privacy/index.html), [terms](site/terms/index.html), the [visual system](.factory/design.md), and the [handoff](.factory/handoff.md).

## License

MIT. See [LICENSE](LICENSE).
