# Weft design plan — visual language, icons, and how we decide

The plan for evolving Weft's design system, sized for **lite sessions**: short,
low-token working sessions where James reacts to prepared visual options and
locks decisions one at a time. Heavy sessions build; lite sessions choose.

Outputs this plan produces:
- `docs/DESIGN.md` — the design system itself: tokens + a **decision log**
  (what was chosen, what was rejected, why). Created at the first locked decision.
- `design/` — option boards (throwaway HTML, not shipped).
- `assets/icons.svg` — one SVG sprite, one `<symbol>` per glyph.

## Principle (from ROADMAP §3.5)

**Nodes should look like what they do.** A language of node shapes, not uniform
boxes. The visual system's job is to make a patch readable at arm's length:
what flows in, what transforms, what touches the screen — legible before you
read a single label. Grasshopper's quiet genius (port shapes teach the type
system silently) is the bar. Weft is its own brand — the Holos styleguide is
explicitly NOT the reference.

## The key graphic decisions

Each is one lite session (sometimes two fit in one sitting). Ordered so early
decisions constrain later ones — silhouette before icons, icons before polish.

| # | Decision | The question | Options to board |
|---|---|---|---|
| D1 | **Node silhouette & role shapes** | Do sources, params, operators, state, and sinks get distinct silhouettes? Header bar or headerless? | uniform rounded rect (today) · role-shaped (e.g. rounded-left for sources, rounded-right for sinks, pill params, notched state) · GH-style capsule |
| D2 | **Category color system** | Where does category hue live? | header tint · left edge stripe · icon color only · none (type color does all the work) |
| D3 | **Port encoding** | Today: color per type. Add shape per type? | color only (today) · +shape (circle number, diamond point, square list/any, ring geometry…) · +hollow/filled for optional/required |
| D4 | **Icon style** | The glyph language. | geometric stroke (1.5px, 16px grid, GH-literal: a circle node shows a circle) · filled minimal · "diagram of the operation" (input→output micro-pictures) |
| D5 | **Wire language** | Curvature, width, color = source type (today). Do triggers/state wires look alive? | as-is · trigger wires pulse on fire · list-thickness (thicker = longer list) |
| D6 | **Typography & density** | Node title case, mono vs sans for values, compact vs airy. | current lowercase-calm + mono readouts · tighter GH-density pass |
| D7 | **Cloth & atmosphere** | Canvas background, grid, selection green, ghost previews — the room the nodes live in. | current dark · refined dark (subtle vignette, dot grid options) · light theme (later?) |
| D8 | **Brand mark** | Wordmark + favicon for Weft (or successor name). | deferred to Phase 5 naming decision — do last |

Decision rule: each session ends with a **locked choice written to
`docs/DESIGN.md`** (tokens + one-paragraph rationale) or an explicit "carry
over with narrowed options." Never relitigate a locked decision without new
evidence from real patching.

## The option-board method

For each decision, a prep pass (agent, heavy or lite) builds
`design/D{n}-{slug}.html`: a static page showing the **same reference patch**
(a 6-node mini-graph: Time → slider → sine → circle → draw, one trigger wire)
rendered in each variant, side by side, at 100% and at 50% zoom (arm's-length
readability is the test). Real CSS, real tokens — variants are `:root` token
sets, so the winning variant's tokens paste straight into `style.css`.

Session protocol (lite):
1. Open the board in the browser (`python -m http.server 8137`).
2. James reacts: pick / mix ("A's silhouette, C's ports") / adjust live numbers.
3. Agent writes the locked tokens + rationale to `docs/DESIGN.md`, applies to
   `style.css`, smoke + browser check, commit.

Boards are cheap and disposable — built from tokens, no screenshots to
regenerate, and a small model can apply a "pick A, but 2px smaller radius"
verdict reliably because the choice space is pre-enumerated.

## Iconography pipeline (starts after D1–D4 lock)

1. **Category glyphs first** — 9 icons (one per category), used in the palette,
   quick-add, and node headers. Ship these before any per-node work.
2. **Per-node glyphs** — batch by category, ~10 per lite session, priority:
   Curve/Transform/Display (visual nodes are easiest to draw and teach the
   style), then Input/State (the identity nodes), then Maths (hardest — lean
   on operator symbols), Sets, Vector, Params.
3. **Format**: single `assets/icons.svg` sprite, `<symbol id="icon-{node id
   with / → -}">`, 16×16 viewBox, `stroke="currentColor"` so CSS colors them.
   Referenced via `<use>`; falls back to the category glyph when a node has no
   glyph yet (so partial coverage never looks broken).
4. **Authoring loop**: agent drafts a category batch as one review sheet
   (`design/icons-{cat}.html` showing every glyph at 16/24/48px on a node);
   James strikes/keeps/redirects per glyph; survivors merge into the sprite.
5. **Enforcement**: `test/gen-catalog.js` learns to report nodes without
   glyphs — coverage is visible, never silently stale.

## Sequencing

1. D1 silhouette → 2. D2 category color + D3 ports (pair well) → 3. D4 icon
style → 4. category glyphs → 5. per-node batches interleaved with D5–D7 →
6. D8 with Phase 5 naming. `docs/DESIGN.md` accretes the whole way; when D1–D7
are locked it *is* the design system and this plan file becomes historical.
