# Weft design system

The locked visual language. Source of truth for the *decisions* is this file;
source of truth for the *drawings* is the Weft Figma file
(`figma.com/design/Zsu7bJzH3CbzeeXNjbVYpG/Weft`), where James designs the card
component, icons, and custom nodes. Code (`style.css` `:root`, `js/nodes.js`
CATS/TYPE_COLORS, `js/icons.js`) mirrors what's written here.

## Decision log

| # | Decision | Locked | How |
|---|---|---|---|
| D1 | **Node silhouette** — one uniform card for every role: 13px radius, 1px `dark/300` border, icon + title + preview-eye header, body band with inputs left / outputs right (outputs settle to the bottom edge). Four params are **chromeless**: Boolean Toggle, Number Slider, Colour Swatch, Note Pad — the control *is* the node, ports overlay its edges. | 2026-07-13 | designed in Figma (supersedes the D1 option board) |
| D2 | **Category colour** — a gradient wash: category colour at 40% alpha entering from the card's left edge, fading out by 50% width, over `dark/200`. The header icon is stroked in the category colour. No header tint, no edge stripe. | 2026-07-13 | Figma |
| D3 | **Port encoding** — colour per type only (no shapes yet); dots grow to 13px with a 2px canvas-colour ring. Type palette rebuilt (see tokens). | 2026-07-13 | Figma |
| D4 | **Icon style** — 27×27 grid, 1px stroke, geometric-literal (a clock for Time, a hexagon for Polygon), stroked in the node's category colour via `currentColor`. Partial coverage is fine: nodes without a glyph fall back to the small category dot. | 2026-07-13 | Figma (12 drawn so far) |
| D6 | **Typography** — UI: Neue Kabel (Book for titles at 15–16px, Regular for port labels at 12px), falling back to Inter. Values & readouts: Consolas 11px. Output readouts inline in the out-row at `white/40`. | 2026-07-13 | Figma |
| D5 | Wire language — carried over unchanged (colour = source type, 2px). Trigger/list ideas still open. | — | pending |
| D7 | Cloth & atmosphere — current dark canvas kept. | — | pending |
| D8 | Brand mark — deferred to the Phase 6 naming decision. | — | pending |

## Tokens

### Darks & text

| token | value | use |
|---|---|---|
| `dark/100` | `#0a0d13` | app + canvas background, Note Pad sheet |
| `dark/150` | `#121724` | value-field background |
| `dark/200` | `#151b29` | card background (under the wash); body band at 70% alpha |
| `dark/300` | `#1e2533` | card border, header underline |
| `dark/400` | `#232b3c` | value-field border, app chrome lines |
| `white/100` | `#ffffff` | titles, port labels |
| `white/80` | `rgba(255,255,255,.8)` | field values |
| `white/40` | `rgba(255,255,255,.4)` | output readouts, ghost text |
| `Primary` | `#2dd4bf` | selection, slider fill/thumb/value, toggle |
| eye-on | `#14c50e` | preview-eye when showing |

### Category colours (`Node Groups/*`, → `CATS` in nodes.js)

| category | hex |
|---|---|
| Input | `#03a514` |
| Params | `#2dd4bf` |
| State | `#c1362e` |
| Maths | `#3b5dba` |
| Sets | `#7831be` |
| Vector | `#7cbe25` |
| Curve | `#fbac00` |
| Transform | `#ff6767` |
| Display | `#f009fc` |

### Type colours (`Line Types/*`, → `TYPE_COLORS` in nodes.js — ports AND wires)

| type | hex |
|---|---|
| number | `#3e9aff` |
| bool | `#ff3b41` |
| string | `#fbbb00` |
| point | `#fb6c09` |
| vector | `#8cff14` |
| color | `#d730f8` |
| geometry | `#7057ff` |
| any | `#8ea4c3` |

## Card anatomy (reference: Figma "Node Card" component / the Polygon instance)

- **Card**: min 150px wide, radius 13, border 1px `dark/300`, drop shadow, background = `linear-gradient(90deg, cat 40% → transparent 50%)` over `dark/200`.
- **Header**: padding 5px (9px right), 27px icon slot (glyph in category colour, category dot as fallback), title 15px `white/100`, spacer, 13px preview-eye (green shown / dim hidden) on geometry-producing nodes.
- **Body**: `rgba(21,27,41,.7)` band, radius 12 bottom. Two columns: inputs stack top-left (gap 4), outputs stack bottom-right. Rows 19px min-height.
- **Ports**: 13px dots, type colour, 2px `dark/100` ring, centered on the card edge (±7px overhang).
- **Fields**: 42px wide, `dark/150` bg, 1px `dark/400`, radius 3, Consolas 11 `white/80`. Hidden when the input is wired.
- **Readouts**: per-output, inline, Consolas 11 `white/40` (`LM.fmt` first item + ×count).
- **Selected**: border `Primary` + 7.5px glow at 33%. **Error**: same shape in `#ff3b41`.

## Chromeless params

Toggle (31×52 vertical pill, knob slides down = on) · Slider (min/max corners,
ruler-tick track, teal fill-to-thumb, value below in Primary) · Swatch (36px
colour circle, alpha ghost-field below) · Note Pad (dark/100 sheet, Consolas).
All drag as nodes (click-vs-drag distinguished by a 4px movement threshold) and
keep their ports overlaying the widget edges.

## Known gaps / next steps

- **Neue Kabel licensing**: the font renders only where it's installed (it is on
  James's machine). Before open-source release either license webfont files or
  bless the Inter fallback. No `@font-face` is shipped yet.
- **Palette & quick-add glyphs**: palette still uses category dots; wiring the
  drawn glyphs in is a small follow-up (`.icon-swatch` CSS class is ready for
  the swatch's conic-gradient wheel).
- **Icon coverage**: 11 glyphs + Transform category fallback so far;
  `test/gen-catalog.js` reports nodes without glyphs at the bottom of
  NODE-CATALOG.md. Batches continue per DESIGN-PLAN's pipeline.
- **Icon sources**: James's working files live in `Node Icons/` (Weft.ai +
  SVG exports, white-stroked with CSS classes). The runtime glyphs in
  `js/icons.js` currently come from the Figma API export (already
  currentColor-normalized). Next icon batch: teach the build script to
  normalize `Node Icons/SVG/` directly (classes → attributes, #fff →
  currentColor) so James's export folder is the single pipeline source.
- **Example layouts** were tuned for the smaller pre-design cards; some overlap
  slightly now — worth a spacing pass.
- `color-mix()` is used for the category wash (fine in Chrome/Edge/modern
  Safari/Firefox).
