# organic-nav v2 — the same nav, after Phase 3

`organic-nav-v2.json` — **3 nodes at the top level**: a Text List, one **Organic
Nav** cluster, and a Panel showing the active index. Load it with **Open**.
Companion to `organic-nav.md` (v1: 92 flat nodes, 141 wires) — read that first;
this file is the after-picture.

## The measurement

| | v1 (v0.6 library) | v2 (v0.8 library) |
|---|---|---|
| top level | 92 nodes, 141 wires | **3 nodes, 2 wires** |
| the nav itself | those same 92 nodes | **28 working nodes** in one cluster |
| shape construction | mixed into everything | 20 nodes in a nested **Capsule Bar** cluster |
| hover feedback | hit-tests a *resting* layout (luck) | a real loop through **Delay** — honest |
| labels | 6 Note Pads + canvas text | one **Text List** → real `<a>` elements |
| pill widths | 6 sliders, all equal | **Measure Text** — each pill fits its label |
| active state | drawn underline | `aria-current="page"` on a real link |
| conditionals | ~20 `Expression` nodes | Comparison / Logic / Select nodes |
| accessibility | none | focus, tab order, semantics — free, from the DOM |

Phase 3's exit criterion was "under 30 nodes, on one screen, as a reusable
cluster with ports for items, colours and spread." The Organic Nav cluster is
28 working nodes (+8 port markers), ports: `IT` items · `G` gap · `SP` spread ·
`H` height · `TS` text size · `CS` shape colour · `BG` background · out `A`
(active index). Unwired ports read their literal values on the node — so the
cluster ships with working defaults.

## What each Phase 3 feature bought

- **Delay** — v1 could not express "layout depends on hover depends on layout"
  and got away with hit-testing the resting layout for reasons specific to this
  nav. v2 wires the loop honestly: smoothed centres → hit rects → **Delay** →
  Element → hover → gaps → centres. One frame of latency, invisible at 60fps,
  and the pattern now generalises to any interface where the thing you point at
  moves.
- **Element (OUTPUT-MODES mode 2)** — the labels are real `<a>` tags placed
  over the canvas at rects the patch computed. Hover comes back from real
  `pointerenter`; click from real `click`; `aria-current` rides an attribute
  string chosen per-item by a Select node. The page's own CSS can style
  hover/focus — that is the boundary working as designed. (A second Delay
  breaks the attrs→click→attrs loop.)
- **Measure Text + Mass Addition** — measured label widths → padded pill
  widths → gaps added → *Mass Addition's partial results* turn the gap/width
  list into positions. This is the row-layout idiom, now four nodes tall.
- **Comparison / Logic / Select** — the mask (`index > 0`), the hover-spread
  (`hover OR shifted hover` → Select wide/narrow gap), and the active test
  (`index = active`) are all first-class nodes. v1 smuggled every one of these
  through `Expression`; v2's five remaining Expressions are all genuine
  arithmetic (the layout algebra and the fillet formula).
- **Clusters** — the fillet-circle construction (bar + caps + carve circles,
  the part nobody wants to look at) is folded into a nested **Capsule Bar**
  cluster reusable for any pill-bar UI. Naming it was the point: *a language
  must let you name what you built, or you will build it again.*

## What still costs too much

1. **The active-index idiom is 6 nodes** (clicks × indices → Mass Addition →
   sample & hold). "Index of the item that last fired" wants to be cheaper —
   a candidate for NODE-LIBRARY, but wait for a second patch to need it
   (library principle 7: don't paper over composition gaps with nodes).
2. **Attribute strings are opaque literals.** `style=color:#0d9488;…` twice in
   a Select node; the text size is baked into the string while `TS` drives only
   the measurement. **Format** (`txt/format`, already in NODE-LIBRARY) is the
   missing altitude node here.
3. **The carve trick still needs an opaque background** — unchanged from v1;
   retired only by `path` + clip (Phase 5).
4. **Element font must match Measure Text's font** — both hosts measure with
   the Draw font (Inter); if the page styles `.weft-el` differently, widths
   drift. An explicit font contract arrives with the Phase 5 type work.

## Verification

Headless (generator's validator): 6 elements with correct labels/attrs,
measured widths vary per label, hover on item 1 moves the left edge by SP/2,
click on item 3 moves `aria-current` and the `A` output, export compiles with
all nested cluster defs collected. In-browser: bar + pinches render, hover
spread live-verified (real `pointerenter` → layout), collapse/expand round-trip
on another patch, cluster card UI (ports, literals, rename) all working.

## Files

- `organic-nav-v2.json` — the patch (generator + validator lived in the session
  scratchpad; the JSON is the artifact).
- v1 (`organic-nav.json`) stays in the repo as the before-picture.
