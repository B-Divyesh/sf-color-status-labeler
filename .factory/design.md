# Color Status Labeler — visual thesis

## Direction: cassette-era field guide

The product looks like a useful mixtape insert annotated by someone who has to operate a difficult control room: warm paper, black registration marks, block labels, clipped corners, halftone texture, and hand-drawn signal paths. This fits the job because a cassette label turns an otherwise ambiguous object into an indexed sequence. Decoration always teaches the premise: a chromatic signal becomes a word plus a tactile pattern.

This is intentionally a single light treatment. The warm off-white paper is painted explicitly in the extension and site, while the extension's overlays remain high-contrast on pages of either theme. A dark theme would weaken the photocopied-paper metaphor; browser/OS forced-color modes receive semantic borders and system colors instead.

## Tokens

- Ink `#171512`: primary text and hard outlines (15.2:1 on paper).
- Paper `#F6F0DE`: page background.
- Tape `#E9DEBF`: raised utility surfaces.
- Muted ink `#5F594C`: supporting text (5.9:1 on paper).
- Signal blue `#145B73`: links, focus, primary action (6.6:1 on paper).
- Punch yellow `#F2C94C`: decorative/highlight only, always paired with ink.
- Signal red `#A83B32`: destructive controls and errors (5.4:1 on paper).
- Success ink `#28613D`: success copy (6.7:1 on paper).
- Pure white `#FFFFFF`: button text on signal blue.

The product never encodes meaning with these colors alone. Status examples always add text, an icon, and a distinct pattern.

## Typography

Two system stacks avoid font downloads and keep the extension tiny. Headings use `Arial Black`, `Helvetica Neue`, sans-serif: heavy, condensed cassette-sticker lettering. Body and controls use `ui-monospace`, `SFMono-Regular`, `Cascadia Mono`, `Liberation Mono`, monospace: a label-maker voice with highly distinct characters. The scale is 14 / 16 / 20 / 28 / 44–64px, body never below 16px on the site.

## Spacing and shape

An 8px base rhythm with 4px for optical nudges. Primary gaps: 8, 16, 24, 32, 48, 64px. Content measures at 72ch. Corners are 2px or clipped with `clip-path`, never soft SaaS pills. Borders are 2px ink; shadows offset 4px with no blur, like layered paper. Touch targets are at least 44px.

## Interaction grammar

- Primary actions resemble a labeled cassette eject key: solid blue, ink offset shadow, 2px press travel.
- Selection mode places an ink reticle around the element and a top instruction strip. Escape always exits.
- Applying a rule produces two redundant cues: a word badge and a pattern swatch. A fixed legend explains both.
- Deleting a learned rule requires a specific confirmation and offers an undo action in the popup.
- Empty, unavailable, and error states are written as helpful field notes, never dead ends.

## Motion

UI transitions last 160–220ms and change only opacity or transform. Badges arrive from their matched element by a 4px translation; button presses move 2px toward their shadow. Nothing loops or flashes. Under `prefers-reduced-motion: reduce`, all motion and smooth scrolling are removed. The content overlay also reads the page's preference before animating.

## Original asset plan and provenance

The hero is a generated editorial still life, used only on the landing page: an open transparent cassette shell whose internal tape path becomes four bold non-color patterns and label tabs. It explains transformation from hue-only status to redundant meaning without pretending to show the extension UI.

Prompt sheet:

- Subject: one open 1980s clear cassette, paper label tabs, patterned signal strips.
- World/materials: photocopied zine collage, torn warm paper, translucent plastic, ink registration marks, coarse halftone.
- Light/lens: overhead tabletop, hard side light, shallow physical shadow, wide editorial crop.
- Palette words: warm paper, carbon black, faded teal-blue, mustard, brick red.
- Negative list: people, hands, logos, brands, interface screenshot, legible text, watermark, gradients, glossy 3D, neon cyberpunk.

Generation prompt (2026-08-28): “Cassette-era zine editorial still life for an accessibility browser tool. One open transparent 1980s audio cassette on torn warm cream paper, its magnetic tape path transforming into four clearly different black graphic patterns: diagonal stripes, dots, crosshatch, and vertical bars. A few blank paper label tabs point to the patterned tracks. Photocopied risograph collage, coarse halftone, imperfect ink registration, carbon black with faded teal-blue, mustard and brick-red accents, tactile translucent plastic, overhead wide editorial composition, hard side light and shallow cut-paper shadows. No people, no hands, no logos, no brands, no interface screenshot, no legible text, no watermark, no gradients, no glossy 3D, no neon.”

- Generator: Azure AI Foundry `factory-image` via `/opt/fleet/lib/gen-image.sh`.
- License/provenance: original AI-generated asset created for this product; no reference images or third-party marks.
- Source PNG and prompt sidecar live in `assets/src/`; optimized WebP is shipped in `site/public/assets/`.
- The 1200×630 social card (`site/public/assets/color-status-labeler-social.jpg`) is a centered crop of that same original hero, made locally with ImageMagick on 2026-08-30. The 180×180 Apple touch icon (`site/public/icon/apple-touch-icon.png`) is a raster export of the hand-authored cassette `icon.svg`. Neither adds a third-party asset or a new visual direction.

Hand-authored geometric SVG icons and CSS patterns use only original primitive shapes and are documented inline. No third-party visual assets are used.
