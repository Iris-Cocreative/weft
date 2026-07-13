# Weft master plan

Ordered phases. Each phase is roughly 1–3 sessions, ends with smoke + browser
verification, and leaves the app releasable. `ROADMAP.md` holds per-track detail;
this file holds the *order* and the *why*. Research compiles continuously into
the `2nd Brain/50-Research/Weft/` folder (precedents · possible paths · the idea).

**Ordering logic:** (1) make iteration safe, (2) define the language before
building on it, (3) build the identity feature (events/state), (4) open the
LLM co-creation door early because it multiplies everything after it,
(5) media/type/depth expand the palette, (6) brand and release when there's
something worth naming, (7) explore new domains from a stable core.

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

Design was Phase 5 cargo; James wants it now, and it pays for itself: icons and
node-shape language make every later phase more legible. Runs as **lite
sessions** (short preference-iteration sittings over prepared option boards)
interleaved with normal build sessions — see `docs/DESIGN-PLAN.md` for the
decision list (D1–D8), board method, and icon pipeline.

1. ✅ `docs/NODE-LIBRARY.md` — the articulated library: category roles, planned
   nodes with descriptions, library principles. (2026-07-13)
2. ✅ Set nodes shipped as the warm-up build (v0.5, 2026-07-13): **Set Union /
   Intersection / Difference** on a shared `LM.setEq`, plus Cull Pattern /
   Shift List / Dispatch, Checker dispatch example, smoke section 7.
3. Lite sessions D1–D4 (silhouette, category color, ports, icon style) →
   locked tokens in `docs/DESIGN.md`. **D1 board is prepared**
   (`design/D1-silhouette.html`: uniform rect · role-shaped · GH capsule, at
   100% + 50%) — awaiting James's first sitting.
4. Category glyphs (9) shipped in `assets/icons.svg`; palette + quick-add use them.
5. Per-node glyph batches continue in the background through later phases;
   gen-catalog reports coverage.
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

## Phase 3 — LLM co-creation

The graph is a *shared artifact* human and model both edit. Parameters mean
iteration without re-prompting; precedent validated by ComfyBench/ComfyUI-R1.

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

## Phase 4 — Media & typography (the web's unfair advantages)

1. Image node + **Image Sample** (brightness/color at points → drives geometry:
   halftones, image-driven fields) — the killer node of the phase.
2. Asset strategy = graph format v2 (asset manifest; data-URI embed vs URL).
3. Video + **Webcam** sources; feedback buffer (previous frame → trails).
4. **Deconstruct Text** (string → char list; kinetic type via list matching),
   Text on Curve, Measure Text, Font/variable-font nodes (number → weight!).
5. Examples: photo halftone; type that leans toward the cursor.

## Phase 5 — Identity & open-source release

Brand *after* the tool has proven its shape, *before* the community arrives.

1. Name decision (Weft / Heddle / Thrum / …) — then domain, repo name.
2. Design language: category glyphs, port shapes per type, `docs/DESIGN.md`
   tokens; icon pass over the editor.
3. README with animated GIFs, CONTRIBUTING, LICENSE; GitHub repo + Actions
   running smoke; gallery page of examples (GitHub Pages — lab.iriscocreative
   muscle applies).
4. **Node pack mechanism** shipped (one-file packs + manifest; loadable via
   script tag or paste). ComfyUI's manager is the ecosystem reference.

## Phase 6 — Depth & scale

1. 2.5D: z as a number → parallax/scale/draw-order nodes.
2. Renderer abstraction; **SVG render target** (crisp, exportable, nearly free).
3. Perf pass only if needed (dirty flags, OffscreenCanvas).
4. three.js target + Vector3/Mesh/Camera pack — only when 2D saturates.

## Phase 7 — Other domains (exploratory, may run parallel from Phase 5)

The engine is domain-agnostic: lists + pure computes + render items. A *pack*
defines a domain. Graphics is just the first pack.

1. **System-dynamics pack** — stocks, flows, converters, delays, feedback
   (Machinations/Loopy precedent) with chart/indicator render nodes.
   This is the honest technical path to "plan projects, businesses, villages":
   same canvas, same wires — quantities over time instead of shapes over time.
2. **DPL companion practice** — pattern-shaped node documentation (context /
   forces / resolution); a Weft patch as the *diagram of forces* for a design.
   Keep as inquiry, not product, until it earns its keep.
3. Didactic interfaces: DOM output nodes (drive real elements' styles/
   transforms) → Weft orchestrates actual pages; explorable-explanation authoring.

---

## Continuous workstreams

- **Research** → 2nd Brain note; open questions listed there (ComfyUI pack
  manager mechanics, Rive data-binding API, Origami pulse semantics, Noodl
  post-mortem, Yahoo Pipes post-mortem).
- **Examples as tests** — every phase adds examples; smoke keeps them honest.
- **Docs stay true** — CLAUDE.md invariants amended *deliberately* when the
  engine grows (events/state will add invariant #8).

## Standing answer: "can Weft explain existing code?"

Feasible in the right order: (1) *knob extraction* — wrap working code in a
Custom JS node and promote its magic numbers to ports (LLM does this well;
ships in Phase 3); (2) *partial decompilation* — LLM re-expresses the
dataflow-shaped parts (math, timing, mapping) as native nodes around the
irreducible code core; (3) full script→graph translation is research-grade and
only worth it for code that is secretly dataflow anyway. The near-term win is
(1)+(2): the creator gets sliders and visible causality in minutes, and
iteration stops costing tokens.
