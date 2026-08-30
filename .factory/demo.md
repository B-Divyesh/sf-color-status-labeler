# Color Status Labeler demo

## Entry points

- Landing action: **Try it with sample data**.
- Direct URL: `https://color-status-labeler.sociobot.in/demo/`.
- Compatibility entry: `https://color-status-labeler.sociobot.in/?demo=1` redirects directly to `/demo/`.

## Sample and isolation

The demo shows an invented North hub dispatch board with three recurring
statuses: Dock 03 is Ready, Gate 07 is Waiting, and Lift bank is Blocked.
Each status starts with a word and a distinct pattern. Visitors can change a
sample label or pattern to see the result in the board and legend.

Demo changes use only the browser local-storage key
`demo:color-status-labeler:sample-v1`. The extension does not read that key,
and the demo never writes to Chrome extension storage or any real rule key.
The persistent banner names this boundary.

## Reset and leaving

**Reset demo** removes the demo key and restores the shipped sample. **Start
for real** removes the demo key, returns to the landing page, and leaves the
visitor ready to download the extension. The extension itself continues to use
its separate `chrome.storage.local` keys named
`color-status-labeler:<site-origin>`.

The demo shell is precached by the site's service worker, so its sample guide
is also the entry point for the offline regression check.
