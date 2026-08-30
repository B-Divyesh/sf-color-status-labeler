# Color Status Labeler

Color Status Labeler is a local browser extension for people with color-vision deficiency who need dashboards and maps to show readable status words and patterns. Teach it recurring status colors on a site and it adds a compact badge and legend.

The companion site is designed for `https://color-status-labeler.sociobot.in`.

## What it does

- Samples a rendered background, border, or text color from a page.
- Lets the user assign a plain-language label and one of four distinct patterns.
- Finds matching elements on that site and adds click-through badges and a legend.
- Restores saved rules when you return to the same site.
- Stores per-site rules only in `chrome.storage.local`.

Color matching is approximate. Themes, gradients, animations, and site redesigns can cause missed or incorrect labels. This is an operating aid, not a WCAG audit or a source of truth for safety-critical decisions.

## Install the packaged build

1. Run `npm install && npm run build` or download the ZIP from the landing page.
2. Unzip `dist/site/downloads/color-status-labeler-chrome.zip`.
3. Open `chrome://extensions` (or `edge://extensions`).
4. Turn on Developer mode, choose **Load unpacked**, and select the unzipped folder.
5. Open a dashboard, select the extension, and choose **Pick a status color**.

The extension does not collect accounts or analytics. Its public site makes no
third-party runtime request.

## Try the isolated sample

Open [the sample dispatch board](https://color-status-labeler.sociobot.in/demo/)
or choose **Try it with sample data** on the landing page. The demo starts with
three invented statuses and stores any practice changes only under the separate
`demo:color-status-labeler:sample-v1` browser-storage key. **Reset demo**
restores the sample. **Start for real** removes the demo key before returning
to the installation page. See [.factory/demo.md](.factory/demo.md) for the
sample and storage boundary.

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

`npm test` uses Playwright 1.58.2 and expects its Chromium browser to be installed. The factory image already provides it; elsewhere run `npx playwright install chromium` once. `npm run build:site` is the deployment build: it packages the extension and places the installable ZIP in the static-site output. The claim regression manifest is [.factory/claims.json](.factory/claims.json).

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
- See [privacy](site/privacy/index.html), [terms](site/terms/index.html), the [visual system](.factory/design.md), [.factory/demo.md](.factory/demo.md), and the [handoff](.factory/handoff.md).

## License

MIT. See [LICENSE](LICENSE).
