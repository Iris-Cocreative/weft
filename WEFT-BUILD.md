# Weft — parametric designer for the web

A node-based graphics/animation/interaction creator inspired by Grasshopper (Rhino),
built to **output web-compatible vanilla JavaScript**. Weave input parameters
(mouse, time, page state) through a dataflow graph into live 2D graphics.

**Status: v0.6 — the Figma design system.** v0.1 (2026-07-12): editor,
evaluator, 63 nodes, 4 examples, JS export, all verified in Chrome. v0.2
(same day, Phase 1 of PLAN.md): git repo, graph format versioning +
migration, undo/redo, marquee select, copy/paste of graph-JSON fragments with
auto-layout for LLM-authored patches, `docs/NODE-SPEC.md` language contract +
generated `docs/NODE-CATALOG.md`. v0.3 (same day, workshop pass): ghost
previews, disable/bypass, multi-wire inputs, readouts, anchors, palette
clustering. v0.4 (same day, Phase 2 of PLAN.md): **events + state** —
frame-latched triggers (Origami-pulse style), per-list-item state nodes
(Smooth, Spring, Counter, Latch, Sample & Hold, Timer, Previous Value, Edge),
Hotspot (any geometry → interface element via `LM.pointInGeom`), real-DOM
Button via `domList`/`domState`, Keyboard, Scroll (real page in exports,
simulated on the cloth), 88 nodes, 6 examples (Click toy, Scroll scene),
design note `docs/EVENTS-AND-STATE.md`, invariant #8 — editor and exports
verified interactive in Chrome. v0.5 (2026-07-13, Phase 2.5 of PLAN.md):
**sets & the Grasshopper bridge** — `docs/NODE-LIBRARY.md` (the articulated
library map), six new Sets nodes (Set Union / Intersection / Difference on a
shared `LM.setEq` equality predicate, plus Cull Pattern, Shift List, Dispatch),
Checker dispatch example, **GHX importer v1** (`tools/ghx-import.html`: paste a
Grasshopper .ghx → Weft patch; both GHX param styles, floating-param Source
wires, relay splicing, slider/swatch/panel values, pivot positions; unmapped GH
types import as `?` placeholders so every import doubles as a gap report —
verified against all 7 official GH demos), and the D1 silhouette option board
(`design/D1-silhouette.html`). v0.6 (2026-07-13): **the Figma design system**
— James designed the node card + colour systems + icons + custom nodes in
Figma; implemented as the new card (category gradient wash, icon + title +
preview-eye header, inputs-left/outputs-right band, inline dim readouts,
13px typed ports, 42px value fields), new category/type palettes, node glyphs
in `js/icons.js` (27×27, currentColor, category-dot fallback), and chromeless
Boolean Toggle / Number Slider / Colour Swatch / Note Pad (the control IS the
node). Decision log + tokens: `docs/DESIGN.md`.

**Development docs:** `CLAUDE.md` = agent standards & invariants (read before any
change) · `ROADMAP.md` = tracks & next steps · `test/smoke.js` = headless test
(must pass before finishing any change).

## Run it

Open `weft/index.html` in a browser — no build step, no dependencies, works from
`file://` or any static server. Autosaves to localStorage.

## The idea (vs. what exists)

- **cables.gl** — WebGL scene tool, heavy runtime, embed-oriented but not "compile to tiny JS".
- **nodes.io** — programmer-first computational canvas, not interaction/export focused.
- **NodePen** — Grasshopper UI on a Rhino compute server (needs a backend).
- **Weft** — Grasshopper's *dataflow semantics* (list matching, params → geometry),
  web-native inputs (time/mouse/viewport), and one-click export to a **self-contained
  ~20KB vanilla .js** you can paste into Webflow/any page. That combination is the gap.

## Architecture

```
weft/
  index.html        layout: toolbar / palette / editor / preview / status
  style.css         dark theme, node + wire styling
  js/
    engine.js       LM — the pure runtime (evaluator, geometry, colors, transforms, render)
    nodes.js        NODE_DEFS — the node library (+ editor-only custom bodies)
    editor.js       node canvas: pan/zoom, drag, wires, quick-add, context menu
    viewport.js     live preview: evaluates graph every rAF, renders drawList
    export.js       WeftExport — compiles graph → standalone JS via fn.toString()
    examples.js     EXAMPLES — 7 graphs, doubling as the test corpus
    app.js          shell: palette, toolbar, autosave, export modal, splitter
    icons.js        node glyphs from Figma (editor-only, never exported)
  docs/DESIGN.md    design system: decision log + tokens (Figma = drawing source)
  tools/
    ghx-import.html standalone GHX → Weft patch converter (+ gap report)
  design/           option boards for the visual-language lite sessions (D1…)
```

### Key design decisions

- **Everything is a list** (Grasshopper's soul). Every port value is a list; nodes
  compute per-item with *longest-list matching* (short lists repeat their last item).
  `def.listInputs` names inputs that receive the whole list (List Item, PolyLine…).
  If a compute returns an array for an output it's flattened into the list — that's
  how Series/Divide "graft" without needing data trees (v1 simplification).
- **The runtime is serializable.** All engine code lives on `LM` as function
  expressions; node `compute`s are pure arrows using only `(args, ctx, node)` + `LM`.
  Export = `toString()` the used pieces + graph JSON + a small mount template.
  The editor and exports run *exactly the same code*.
- **Coordinates are centered**: (0,0) is the middle of the canvas, y-down.
- **Loose typing with coercion** (number↔bool↔string, number→point, hex→color…) —
  any output can wire into any input; `LM.coerce` does its best. Port dots are
  color-coded by type. Cycles are refused at connect time.
- **Evaluate every frame.** No dirty tracking — graphs are small, and time/mouse
  change every frame anyway. 60–130 fps with the examples.

### Node library (94) — Grasshopper-matched names

- **Input**: Time, Mouse, Viewport · interaction: Hotspot, Button, Keyboard, Scroll
- **State** (per-list-item memory, resets on load): Smooth, Spring, Counter,
  Latch, Sample & Hold, Timer, Previous Value, Edge
- **Params**: Number Slider, Boolean Toggle, Colour Swatch, Panel (inspect or type values)
- **Maths**: Addition, Subtraction, Multiplication, Division, Modulus, Power, Min, Max,
  ArcTangent 2, Negative, Absolute, Round, Floor, Ceiling, Square Root, Sine, Cosine,
  Tangent, Radians, Degrees, Pi, Remap Numbers, Clamp, Lerp, Smooth Step,
  Expression (X,Y,Z,T + Math), Noise
- **Sets**: Series, Range, Random, List Item, List Length, Merge, Reverse List,
  Cull Pattern, Shift List, Dispatch, Set Union, Set Intersection, Set Difference
  (set ops share the `LM.setEq` equality predicate)
- **Vector**: Construct Point, Deconstruct, Distance, Point Polar, Angle
- **Curve**: Line, Circle, Ellipse, Rectangle, Polygon, PolyLine, Interpolate (spline),
  Divide Curve, Evaluate Curve
- **Transform**: Move, Rotate, Scale
- **Display**: Draw, Text, Colour HSL, Gradient, Background

### Geometry model (2D)

Plain objects: point `{x,y}`, `line`, `circle`, `ellipse`, `rect`, `arc`,
`poly`, `spline` (catmull-rom), `text`. `LM.toPoly` converts anything to a
polyline; `LM.curvePoint(g,t)` gives arc-length parameterized points;
`LM.xformGeom` applies affine matrices (rect/ellipse degrade to polys when warped).

### Export contract

Exported JS attaches to `<canvas data-weft>` if present, else creates a fixed
full-window background canvas (`pointer-events:none; z-index:-1`). Mouse is
tracked on `window` (page-wide interaction), coordinates relative to the canvas
center. For Webflow: paste into an embed / site JS, add a `data-weft` canvas
where you want it.

## Editor UX

- Double-click canvas (or right-click) → searchable quick-add; palette on the left
- Drag port→port to wire; drag a *connected input* to unplug and rewire
- Double-click a wire to cut; click to select + Delete
- Right-click node → Duplicate/Delete; Ctrl+D duplicates; Shift-click multi-select
- Scroll to zoom, drag background to pan; splitter resizes the preview
- Panels show live data; error nodes get a red ring with the message on hover

## Ideas for v2 (not built)

- Data trees (true graft/flatten/simplify) + per-wire list-matching modes
- More GH nodes: Graph Mapper, Sort List, Weave, Offset, Fillet (backlog: docs/NODE-LIBRARY.md)
- Input nodes: Scroll position, element hover/click targets, live data streams (fetch/WebSocket), audio
- Timeline/easing nodes; spring physics; trails/feedback buffers
- SVG/WebGL render targets; DOM output (drive element transforms, not just canvas)
- Groups/subgraphs, undo/redo, wire reroute handles, minimap
- Publish presets to lab.iriscocreative.com as embeddable scripts
