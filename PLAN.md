# Weft master plan

Ordered phases. Each phase is roughly 1–3 sessions, ends with smoke + browser
verification, and leaves the app releasable. `ROADMAP.md` holds per-track detail;
this file holds the *order* and the *why*. Research compiles continuously into
the `2nd Brain/50-Research/Weft/` folder (precedents · possible paths · the idea).

**Ordering logic:** (1) make iteration safe, (2) define the language before
building on it, (3) build the identity feature (events/state), (4) **make
patches composable before making them numerous** — a 92-node nav says the
library is at the wrong altitude and has no encapsulation, and an LLM that emits
such patches faster only compounds it, (5) open the LLM co-creation door,
because it multiplies everything after it, (6) media/type/depth expand the
palette, (7) brand and release when there's something worth naming, (8) explore
new domains from a stable core.

---

## Phase 1 — Bedrock (safety + the language spec) — ✅ SHIPPED 2026-07-12 (v0.2)

The "establish and visualize the language up front" phase.

1. ✅ `git init` in `weft/` + `.gitignore`; v0.1 committed as root. (GitHub repo
   + license = James's call at release time; MIT suggested.)
2. ✅ **Graph format v1**: `format: 1` in saves/autosave/examples; `App.migrate()`
   hook; newer formats refused.
3. ✅ **Undo/redo** — JSON snapshot stack (100 deep), 400ms coalescing so slider
   drags are one step; Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y; Ctrl+A select-all.
4. ✅ **Copy/paste + marquee select** — shift-drag box-select; clipboard carries
   graph-JSON fragments (`{weft:'patch',…}`); paste remaps ids; coordinate-less
   patches (LLM-authored) get automatic topological layout below existing
   content. Verified: fragment round-trip, paste-event handler, undo of paste.
   (Native Ctrl+C/V key→event dispatch is browser-guaranteed but untestable by
   automation — confirm once by hand.)
5. ✅ **`docs/NODE-SPEC.md`** — the language contract, plus auto-generated
   `docs/NODE-CATALOG.md` (`test/gen-catalog.js`) so the inventory can't drift.

Exit met: an agent handed NODE-SPEC + CATALOG can produce a valid patch blind
(the spec's own example patch pastes and runs).

## Phase 1.5 — Workshop pass (James's hands-on feedback) — ✅ SHIPPED 2026-07-12 (v0.3)

- ✅ Wire endpoints measured through real geometry (centered on ports).
- ✅ GH-style **ghost previews**: every geometry node draws faint scaffolding;
  selected nodes render green; per-node toggle (head dot + context menu).
- ✅ **Disable with pass-through** (n8n-style bypass) via context menu.
- ✅ **Multi-wire inputs** — lists concatenate in wire order (engine semantic).
- ✅ Live **value readouts** on every node (first item + ×count, 150ms throttle).
- ✅ Duplicate keeps incoming wires (GH behavior); works on multi-selections.
- ✅ Plain-drag **marquee** with CAD direction semantics (← touch, → contain);
  right/middle-drag pans; right-click = quick-add (canvas) / menu (node).
- ✅ Palette **drag-to-canvas**; dropping an Anchor on the cloth pins it there.
- ✅ **Anchor Point** — first canvas input object, draggable on the cloth.
- ✅ Wire-color **legend** (bottom-right, collapsible).
- ✅ Palette clustering (arithmetic/trig/mapping/constants…), Phi + Arc nodes,
  compact styling for small nodes. Async-clipboard fallback for Ctrl+C/X.
- Specialty control nodes (Flow Gate, Blocker, Shift, joystick, dial, vector
  pad) recorded in ROADMAP §3.5 — most belong with Phase 2's event system.

## Phase 2 — The interaction engine (events + state) — ✅ SHIPPED 2026-07-12 (v0.4)

Weft's identity feature; what makes it an instrument for *experiences* rather
than a graphics toy.

1. ✅ `docs/EVENTS-AND-STATE.md` design note: triggers as frame-latched booleans
   (Origami's pulse) in normal wires; state on `node._state` keyed by `ctx.i`
   (per list item — one Latch behind one Hotspot over 3 circles = 3 toggles);
   host input contract supplied identically by editor and export (CLAUDE.md
   invariant #8); real DOM via declare/reconcile/report (`domList`/`domState`).
2. ✅ State nodes: Smooth, Spring (substepped, damped), Counter, Latch,
   Sample & Hold, Timer, Previous Value, plus **Edge** (continuous bool →
   rise/fall triggers — the adapter the design note demanded).
3. ✅ **Hotspot** — any geometry → hover/pressed/clicked via `LM.pointInGeom`
   (polygon test through toPoly, pad for open curves, box for text); armed
   press/release click cycle; pointer cursor feedback in both hosts.
4. ✅ **Button** (a real overlaid `<button>`, styled, host-reconciled),
   **Keyboard** (held/pressed/released per key), **Scroll** (px + normalized +
   velocity; real page in exports, wheel-scrubbed 3000px simulator on the cloth).
5. ✅ Examples: **Click toy** (3 circles = 3 independent toggle machines from
   one node chain + DOM reset button) and **Scroll scene** (sun/sky/windmill/
   fading hint from one Scroll node); demo HTML grows a 400vh page for
   scroll patches.

Exit met: the Click toy is a zero-code toy interface; both examples verified
interactive in the editor **and** as exported standalone JS in a real browser
(smoke now also covers hit testing + cross-frame state semantics).

## Phase 2.5 — Visual language & the articulated library (pulled forward, James 2026-07-13)

Design was Phase 6 (release) cargo; James wants it now, and it pays for itself: icons and
node-shape language make every later phase more legible. Runs as **lite
sessions** (short preference-iteration sittings over prepared option boards)
interleaved with normal build sessions — see `docs/DESIGN-PLAN.md` for the
decision list (D1–D8), board method, and icon pipeline.

1. ✅ `docs/NODE-LIBRARY.md` — the articulated library: category roles, planned
   nodes with descriptions, library principles. (2026-07-13)
2. ✅ Set nodes shipped as the warm-up build (v0.5, 2026-07-13): **Set Union /
   Intersection / Difference** on a shared `LM.setEq`, plus Cull Pattern /
   Shift List / Dispatch, Checker dispatch example, smoke section 7.
3. ✅ D1–D4 + D6 locked 2026-07-13 — James designed the card component, colour
   systems, icons, and chromeless custom nodes **directly in Figma** (the Weft
   Figma file), superseding the lite-session boards. Implemented in v0.6:
   card design, category gradient wash, new type/category palettes, icon
   header slot, preview eye, inline readouts, chromeless Toggle/Slider/
   Swatch/Note Pad. Decision log + tokens: `docs/DESIGN.md`.
4. ✅ Node glyphs live in `js/icons.js` (12 drawn so far; category-dot
   fallback keeps partial coverage looking intentional). Palette/quick-add
   glyphs = small follow-up.
5. Per-node glyph batches continue in the background through later phases
   (James draws in Figma → export → icons.js); gen-catalog reports coverage
   at the bottom of NODE-CATALOG.md.
6. ✅ **GHX importer v1** shipped (v0.5, 2026-07-13) — converts all 7 demo
   .ghx files; both GHX param styles (param_input chunks AND ParameterData >
   InputParam), floating-param Source wires (the old parser's bug), relay
   splicing, slider min/max/value, swatch ARGB, panel text, pivot positions
   ×1.6, inline expressions as `ghNotes`; unmapped types → `?` placeholders +
   on-page gap report. Original spec: paste a Grasshopper .ghx →
   Weft patch JSON. Successor to the IRIS GHX Parser (which targeted bespoke
   LLM-generated HTML); this targets the loom directly. 1:1 name mapping where
   Weft has the node; unmapped types emit placeholder nodes that render as `?`
   (loader already degrades gracefully — invariant #5), so **every pasted GH
   demo is its own gap report**. Must fix the old parser's floating-param bug
   (Colour/Point/Curve params keep `Source` wires on the Container, not in
   `param_input` chunks) and carry: slider min/max/value, swatch ARGB, panel
   text, inline input expressions (as a note on the node), and GH pivot
   positions scaled to loom coordinates. Corpus: `Grasshopper Demos/` in the
   workspace (7 official demos + screenshots); study notes in
   `2nd Brain/70-Ideas/Weft/GH Inspo Backlog/`.

Exit: a stranger can tell input / math / geometry / display nodes apart at 50%
zoom without reading labels.

## Phase 3 — Composition & the interface boundary (James, 2026-07-14)

**Why this exists.** Rebuilding the Holos organic nav
(lab.iriscocreative.com/organic-nav) as a patch took **92 nodes and 141 wires**
with the v0.6 library — and it *worked*: exact geometry, per-item springs,
hover, click, selection, zero eval errors, verified in the browser. The patch is
`patches/organic-nav.json`; the full construction + gap list is
`patches/organic-nav.md`. But 92 nodes for one nav is not a tool anyone reaches
for. James, on seeing it: *"impressive but revealing the limitations — this
large workflow isn't practical for such an application."* **That verdict, not
any single missing node, is the finding.**

The bloat has three distinct causes, and they need three different fixes.

**(a) Altitude.** ~20 of the 92 nodes are `Expression` standing in for
comparison and boolean logic (`X>=Y?1:0`). Six are Note Pads standing in for a
literal string list. Six sliders stand in for text widths Weft cannot measure.
This is NODE-LIBRARY **principle 6** ("variation is data, not topology") one
level up: *a patch that bloats is a diagnostic that the library sits at the
wrong altitude.* You already learned this once — the 108-node iso patch
collapsed to 8 nodes when Grid started emitting `K`.

**(b) No encapsulation.** Even with perfect primitives a nav is ~40 nodes, and
there is no way to build it once and reuse it *as a node*. Grasshopper has
Clusters. Weft has nothing, so everything is rebuilt from atoms forever.
("Groups/subgraphs" has been sitting in WEFT-BUILD's *Ideas for v2* list since
v0.1; this is it being promoted to a blocker.)

**(c) The wrong boundary.** The nav re-implements text layout, hit-testing and
selection from scratch *because Weft can only draw*. But labels, links, focus
rings and screen-reader semantics are things the DOM already does better than we
ever will. Weft should have computed the shape and the spread — perhaps 25
nodes — and let the page carry the rest. The three ways a patch can meet a real
page are set out in **`docs/OUTPUT-MODES.md`**; today only the first exists.

And a fourth, cosmetic but real: the patch is **~5,300px wide** with no groups,
no frames, no zoom-to-fit. Legibility fails before correctness does.

This phase deliberately precedes LLM co-creation: **a tool whose patches are
unreadable at 92 nodes does not get better by generating them faster.**

1. **Clusters (user-defined nodes)** — select a subgraph → collapse to one node
   with promoted ports and a title; saved in the graph, exportable, nestable.
   The headline. Design *against* the Custom JS node (now Phase 4.3): a cluster
   composes **nodes**, Custom JS wraps **code**. Both answer "make one thing out
   of many" and they must not fight.
2. **A feedback edge — the smallest change with the widest blast radius.**
   `LM.evaluateGraph` topologically sorts and hard-errors on cycles
   (`'cycle detected'`); the editor refuses them at connect time. But
   **interaction is a feedback loop** — layout depends on hover, hover depends on
   layout — and `state/prev` cannot help, because a delayed edge is still an edge
   to the sort. organic-nav only escapes by hit-testing a *resting* layout, which
   works there by luck (a re-centred bar leaves the active pill exactly on its
   rest band) and will not generalise. Needs an explicit **Delay** node the sort
   is allowed to cut: it reads last frame's value off `node._state`, contributes
   no edge, and makes cycles both legal and legible. Amend invariant #8 when it
   lands.
3. **Altitude nodes** (specs in NODE-LIBRARY): comparison + boolean logic,
   **Select/If** (the list-level ternary), **Mass Addition** with partial results
   (cumulative sum), **Text List** (literal list param), and **Measure Text**
   *pulled forward from Phase 5* — it blocks all UI work and it is cheap. It
   needs no new invariant: the host supplies `ctx.measureText`, identically in
   `viewport.js` and the export mount, exactly as `domList`/`domState` already do
   (CLAUDE.md invariant #8 — only the hosts touch the DOM).
4. **DOM output nodes** — the other half of the boundary, and the start of
   OUTPUT-MODES mode 2. Generalise `input/button`'s declare-reconcile-report
   cycle from `kind:'button'` to `{tag, attrs, rect}`: real `<a>`, real focus,
   real `aria-current`, positioned by geometry the patch computed. This is what
   makes an *accessible* organic nav expressible at all — and accessibility stops
   being something nodes must learn about.
5. **Legibility**: group/comment frames, zoom-to-fit, relay pins on wires.
   (92 nodes is where the loom started asking for all three.)

Exit: organic-nav rebuilds in **under 30 nodes**, reads on one screen, and ships
as a single reusable **Organic Nav** cluster with ports for items, colours and
spread.

## Phase 4 — LLM co-creation

The graph is a *shared artifact* human and model both edit. Parameters mean
iteration without re-prompting; precedent validated by ComfyBench/ComfyUI-R1.
Lands *after* Phase 3 so the patches a model emits are small enough to read.

1. `docs/LLM-AUTHORING.md` — prompt-ready spec + layout conventions + few-shot
   patch examples (distilled from NODE-SPEC).
2. A `/weft-patch` skill (or CLAUDE.md section): "describe an experience →
   receive graph JSON → paste into Weft."
3. **Custom JS node** — a code-block node: James's "not every function needs to
   become a node." An LLM (or human) wraps arbitrary logic and *promotes
   parameters* to ports (the Houdini pattern). Document the trust boundary
   (same as Expression: graphs run code; share accordingly).
4. **Share links** — graph compressed into URL hash; zero-backend sharing.
5. Demo of the thesis: take an existing hand-coded animation from the IRIS
   library, re-express it as a patch, tweak it by slider. Measure the feel.
6. **Small-model help channel** — `docs/RECIPES.md` (task → node-chain
   cookbook) + a Haiku-powered `weft-guide` subagent whose context is
   CATALOG + SPEC + RECIPES stuffed whole (no RAG; cache the prompt). How-to
   answers go to the small model; patch authoring stays with big models.
   (Details in ROADMAP track 2.)

Exit: a non-coder can ask an AI for an experience and then *play* it into shape.

## Phase 5 — Media, type & vector (the web's unfair advantages)

1. Image node + **Image Sample** (brightness/color at points → drives geometry:
   halftones, image-driven fields) — the killer node of the phase.
2. Asset strategy = graph format v2 (asset manifest; data-URI embed vs URL).
   Governing principle (OUTPUT-MODES): **assets enter as typed values existing
   nodes already understand, never as opaque blobs Weft renders around.**
3. **`path` geometry kind** — segments of line/cubic/arc, i.e. exactly what an
   SVG `d` attribute already is. One addition, three unlocks: real Bézier curves
   (organic-nav's necks are circular fillets because there are none), **SVG
   import** (a pasted logo becomes geometry every existing node can bend), and a
   nearly-free **SVG render target** (Phase 7.2). Handle in `toPoly`, `pathGeom`,
   `curvePoint`, `xformGeom`, `drawItem` per invariant #4.
4. **Paint & clip** — `drawList` fill widens from a colour to a paint
   (solid | linear | radial), and items gain an optional `clip` geom. The
   organic-nav glow (a radial gradient clipped inside the shape) is currently
   *inexpressible*, and the patch's bg-coloured carve circles only work over an
   opaque background — a real clip retires that trick.
5. Video + **Webcam** sources; feedback buffer (previous frame → trails).
6. **Deconstruct Text** (string → char list; kinetic type via list matching),
   Text on Curve, Font/variable-font nodes (number → weight!). *Measure Text
   moved to Phase 3* — it blocks UI work.
7. Examples: photo halftone; type that leans toward the cursor.

## Phase 6 — Identity & open-source release

Brand *after* the tool has proven its shape, *before* the community arrives.

1. Name decision (Weft / Heddle / Thrum / …) — then domain, repo name.
2. Design language: category glyphs, port shapes per type, `docs/DESIGN.md`
   tokens; icon pass over the editor.
3. README with animated GIFs, CONTRIBUTING, LICENSE; GitHub repo + Actions
   running smoke; gallery page of examples (GitHub Pages — lab.iriscocreative
   muscle applies).
4. **Node pack mechanism** shipped (one-file packs + manifest; loadable via
   script tag or paste). ComfyUI's manager is the ecosystem reference.

## Phase 7 — Depth & scale

1. 2.5D: z as a number → parallax/scale/draw-order nodes.
2. Renderer abstraction; **SVG render target** (crisp, exportable, nearly free
   once the `path` kind exists — and for *interface* work it beats Canvas2D:
   real text, real links, CSS-styleable, Webflow-embeddable).
3. Perf pass only if needed (dirty flags, OffscreenCanvas).
4. three.js target + Vector3/Mesh/Camera pack — only when 2D saturates.

## Phase 8 — Other domains (exploratory, may run parallel from Phase 6)

The engine is domain-agnostic: lists + pure computes + render items. A *pack*
defines a domain. Graphics is just the first pack.

1. **System-dynamics pack** — stocks, flows, converters, delays, feedback
   (Machinations/Loopy precedent) with chart/indicator render nodes.
   This is the honest technical path to "plan projects, businesses, villages":
   same canvas, same wires — quantities over time instead of shapes over time.
2. **DPL companion practice** — pattern-shaped node documentation (context /
   forces / resolution); a Weft patch as the *diagram of forces* for a design.
   Keep as inquiry, not product, until it earns its keep.
3. Didactic interfaces: **mode 3** of `docs/OUTPUT-MODES.md` — a patch takes a
   CSS selector, reads elements the page already has, and drives their
   transforms/styles/attributes. Weft orchestrates an actual page instead of
   redrawing one. Builds directly on the Phase 3 DOM-output nodes; the highest-
   leverage item on the whole plan for Webflow/Holos work, because the
   "foundation" stops being Weft's problem. Explorable-explanation authoring
   falls out of it.

---

## Continuous workstreams

- **Research** → 2nd Brain note; open questions listed there (ComfyUI pack
  manager mechanics, Rive data-binding API, Origami pulse semantics, Noodl
  post-mortem, Yahoo Pipes post-mortem).
- **Examples as tests** — every phase adds examples; smoke keeps them honest.
- **Case studies as gap reports** (established by organic-nav, 2026-07-14).
  Periodically take a *real* component that already exists in hand-written code
  and rebuild it as a patch, using only what ships today. The node count is the
  measurement, and the workarounds are the roadmap: every place the patch cheats
  names a missing feature more honestly than any spec review. This is the same
  trick as the GHX importer — where an import emits `?` placeholders, a case
  study emits absurdity — and it is how Phase 3 was found. Keep patches in
  `patches/` with a companion `.md` write-up. Next candidates: a scroll-driven
  section, a data-bound chart (needs Fetch), a Webflow component that Weft only
  *animates* rather than draws (tests OUTPUT-MODES mode 3).
- **Docs stay true** — CLAUDE.md invariants amended *deliberately* when the
  engine grows (events/state added invariant #8; the Phase 3 Delay node will
  amend it again).

## Standing answer: "can Weft explain existing code?"

Feasible in the right order: (1) *knob extraction* — wrap working code in a
Custom JS node and promote its magic numbers to ports (LLM does this well;
ships in Phase 4); (2) *partial decompilation* — LLM re-expresses the
dataflow-shaped parts (math, timing, mapping) as native nodes around the
irreducible code core; (3) full script→graph translation is research-grade and
only worth it for code that is secretly dataflow anyway. The near-term win is
(1)+(2): the creator gets sliders and visible causality in minutes, and
iteration stops costing tokens.
