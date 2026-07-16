# Weft — parametric designer for the web

A node-based graphics/animation/interaction creator inspired by Grasshopper (Rhino),
built to **output web-compatible vanilla JavaScript**. Weave input parameters
(mouse, time, page state) through a dataflow graph into live 2D graphics.

**Status: v0.8 — composition & the interface boundary.** v0.1 (2026-07-12): editor,
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
node). Decision log + tokens: `docs/DESIGN.md`. v0.7 (2026-07-14): **Grid**
(square/iso lattice + canonical colour class K, first mode-toggle node), Iso
field example, the organic-nav case study (92 nodes — the finding that wrote
Phase 3), `docs/OUTPUT-MODES.md`. v0.8 (2026-07-14, Phase 3 of PLAN.md):
**composition & the interface boundary** — **Clusters** (collapse a selection
into one named, nestable, exportable node; `meta/cluster` + `def.dynamic`,
inner graph evaluated through `ctx.defs`, Port In/Out boundary markers,
invariant #9), **Delay** (`feedback: true` defs cut from the topo sort — legal
feedback loops; invariant #8 amended; *Feedback chase* example), altitude
nodes (Comparison, Logic, Select, Mass Addition + partial sums, Text List,
Measure Text via host `ctx.measureText`), **Element** (real DOM
`{tag, text, attrs, rect}` over the canvas with hover/focus/click read back —
OUTPUT-MODES mode 2), zoom-to-fit (Fit / F / Home), Meta category (provisional
slate), 106 nodes. Proof: `patches/organic-nav-v2.json` — the 92-node nav is
now one 28-node **Organic Nav** cluster (nested Capsule Bar inside, real
`<a>` labels, `aria-current`), 3 nodes at top level; write-up
`patches/organic-nav-v2.md`. v0.8.1 (2026-07-15, workbench batch — James's
14-item spec): collapsed nodes (double-click a head → icon + ports),
**Relay** spliced in by double-clicking a wire (ports take the wire's
colour), GH wire semantics (drop replaces, shift-drop stacks), reliable
empty-click deselect, global navbar (About · Nodes · Loom), slider types
(label + int/decimal-precision/odd/even + shift = transient integer snap,
number-blue livery), Boolean Toggle redesign (bool-red, knob bottom=off /
top=on), swatch simplified, anchor-handle eye (Params teal), Time pause +
restart inputs/buttons, momentary **Button**, **Graph Data** (on-node plot),
and a draw-display eye on the loom — 109 nodes. v0.8.2 (2026-07-15, audio
experiment): new **Audio** category — Oscillator, Noise, Gain, Filter,
Audio Out. Sound as dataflow via the Element pattern: computes push
descriptors onto `ctx.audioList`, wires carry *handle* strings (samples never
touch wires), and a new host (`js/audio.js`, serialized into audio exports)
owns the `AudioContext` and reconciles a live Web Audio graph each frame
(smoothed params, teardown by reconcile, gesture unlock). List matching =
voices: a Series into one Oscillator is a chord (*Drone chord* example).
Continuous sound only — sequencing/ADSR are follow-ups — 114 nodes.
v0.8.3 (2026-07-15, instrument pass — from James's theremin session): **Note**
(pick note + octave → Hz/MIDI) and **Scale** (snap any continuous value to the
nearest note of a scale — mouse becomes an in-key instrument; *Theremin*
example), master bus **limiter** in the audio host (every Audio Out mixes
through a DynamicsCompressor brickwall — stacked voices can't blow out
speakers) + **mute button** in the preview HUD, **Trace rewritten to px-true
trails** (samples live at fixed px positions, L is always exactly L px, D only
sets direction/speed — no more fps- or pace-dependent length), **Graph Data
range pinning** (wire corner points A/B to fix the axes), merged-mode HUD
moved below the loom tools (fps counter no longer overlaps) — 116 nodes.
v0.8.4 (2026-07-16, sound in & sound seen — from James's keyboard-theremin
session): **432 Hz tuning** — Note/Scale derive Hz from `ctx.tuneA4` (432
default, HUD button toggles 432/440, saved in `graph.meta.tuneA4`, rides into
exports); **Note note-input** (wire N 0–12 to play it from data, 12 rolls into
the next octave); **Mic In** (`audio/mic`) — microphone loudness → number for
visuals via the new `ctx.audioState` read-back channel (analyser in the host,
never routed to speakers, stream stopped on drop); **Cymatics**
(`disp/cymatics`) — chladni-plate sand simulation: grains random-walk scaled by
local plate amplitude and settle on the nodal lines of F, modes rise with
pitch (deterministic via `LM.rng`); three examples — *Scale board* (labelled
scale rungs + marker + three real `<button>` drones from ONE list-matched
Element node), *Cymatics*, *Mic meter* — 118 nodes.
v0.8.5 (2026-07-16): **Scope** (`audio/scope`) — a real oscilloscope: taps any
audio wire through a host-side AnalyserNode (a tap, never routed onward),
time-domain samples flow back via `ctx.audioState` (`{wave, sr, ready}`), and
the compute draws a trigger-locked beam (rising-zero-crossing sync, T ms
window, ≤512 points, zero-volt graticule line) plus outputs the samples V and
RMS level L. *Oscilloscope* example: sawtooth → resonant lowpass on mouse X —
watch harmonics melt off the wave — 119 nodes.
v0.8.6 (2026-07-16): **Vector Scope** (`audio/xyscope`) — the XY mode: X
deflects the beam horizontally, Y vertically, plotting sound against sound
(Lissajous figures). Pure compute reuse: it declares TWO ordinary `scope`
taps and pairs the read-back buffers; no trigger needed (closed figures are
phase-stable). Scope taps also gained a zero-gain keep-alive leg to master so
a tapped branch that reaches no speaker still gets pulled by the audio graph.
*Oscilloscope* example now carries both instruments: a sine pair at a
slider-picked harmonic ratio (3:1 = trefoil), Y detuned +1 cent so the figure
slowly tumbles through its phases — 120 nodes.
v0.8.7 (2026-07-16, oscilloscope music): **Mix** (`audio/mix` — sum wired
signals into one, the epicycle builder), **Path to Audio** (`audio/path` —
any geometry's outline arc-length-resampled into a 512-sample looped stereo
waveform traced F times/sec; host `path` kind swaps buffer sources behind a
stable unity gain, X/Y share a shape-hash key so they rebuild phase-locked),
and **Harmonograph** (`disp/harmonograph` — the Vector Scope's math twin:
two damped pendulums, pure compute, no audio; integer ratios = Lissajous,
damping nests them, wire Time into phase to spin). Examples *Harmonograph*
(silent, math-only) and *Shape song* (polygon → Path to Audio → Vector
Scope + speaker: the shape and the timbre are the same signal) — 123 nodes.

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
    audio.js        WeftAudio — Web Audio host: reconciles ctx.audioList (serialized into audio exports)
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

### Node library (123) — Grasshopper-matched names

- **Input**: Time, Mouse, Viewport · interaction: Hotspot, Button, Keyboard, Scroll
- **State** (per-list-item memory, resets on load): Smooth, Spring, Counter,
  Latch, Sample & Hold, Timer, Previous Value, Edge, **Delay** (the legal
  feedback edge — cycles through it are allowed)
- **Params**: Number Slider (typed: int/decimal/odd/even + label), Boolean
  Toggle, Button (momentary), Colour Swatch, Text List, Relay (wire
  organiser — double-click a wire), Panel (inspect or type values),
  Graph Data (on-node plot)
- **Maths**: Addition, Subtraction, Multiplication, Division, Modulus, Power, Min, Max,
  ArcTangent 2, Negative, Absolute, Round, Floor, Ceiling, Square Root, Sine, Cosine,
  Tangent, Radians, Degrees, Pi, Remap Numbers, Clamp, Lerp, Smooth Step,
  Expression (X,Y,Z,T + Math), Noise, Comparison (`= ≠ < ≤ > ≥`),
  Logic (and/or/xor/not), Mass Addition (sum + partial results)
- **Sets**: Series, Range, Random, List Item, List Length, Merge, Reverse List,
  Cull Pattern, Shift List, Dispatch, Select (the list-level ternary),
  Set Union, Set Intersection, Set Difference (set ops share `LM.setEq`)
- **Meta**: Cluster (+ hidden Port In / Port Out boundary markers) — subgraphs
  folded into named, nestable, exportable nodes
- **Vector**: Construct Point, Deconstruct, Distance, Point Polar, Angle,
  Grid (square/iso point lattice; outputs column, row, and the lattice's
  canonical colour class K — see NODE-LIBRARY principle 6)
- **Curve**: Line, Circle, Ellipse, Rectangle, Polygon, PolyLine, Interpolate (spline),
  Divide Curve, Evaluate Curve
- **Transform**: Move, Rotate, Scale
- **Display**: Draw, Text, Colour HSL, Gradient, Background, Measure Text
  (host `ctx.measureText`), Element (a real DOM element — `<a>`, heading,
  anything — placed by geometry bounds; hover/focus/click flow back as data)
- **Audio** (experiment, v0.8.2–3): pitch — Note (note+octave → Hz/MIDI),
  Scale (snap continuous values to a scale: maj/min/pent/chromatic + root) ·
  sources — Oscillator (sine/square/saw/tri), Noise · processors — Gain,
  Filter (lp/hp/bp/notch) · sink — Audio Out (all outs mix through a master
  limiter; mute button in the preview HUD). Wires carry handle strings;
  `js/audio.js` reconciles the real Web Audio graph (control at frame rate,
  ~60 Hz smoothed; audio-rate feedback/sequencing are not v1)

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
- Drag port→port to wire; drag a *connected input* to unplug and rewire.
  A dropped wire replaces the input's wires (GH semantics); shift-drop stacks
- Double-click a wire to splice in a Relay; click to select + Delete cuts
- Double-click a node head to collapse it to icon + ports (and back)
- Right-click node → Duplicate/Delete; Ctrl+D duplicates; Shift-click multi-select
- Scroll to zoom, drag background to pan; splitter resizes the preview
- Panels show live data; error nodes get a red ring with the message on hover

## Case studies (the tool measured against real work)

- **organic-nav** (2026-07-14) — the Holos organic nav
  (lab.iriscocreative.com/organic-nav) rebuilt as a patch with the v0.6 library
  and **no new nodes**: `patches/organic-nav.json` (92 nodes, 141 wires),
  write-up `patches/organic-nav.md`. It works — exact geometry, per-item springs,
  hover/click/selection, zero eval errors, browser-verified. It is also far too
  big, and that verdict reordered the plan: **PLAN Phase 3 (Composition & the
  interface boundary)** exists because of it, and `docs/OUTPUT-MODES.md` was
  written to answer the question it raised. Headline gaps it exposed: no
  encapsulation (clusters), no feedback edge (interaction is a cycle; cycles are
  refused), no text measurement, no `path` kind, no clip or gradient paint.
  Where the tool *was* at the right altitude it vanished — one `state/smooth` on
  a 6-item list replaced the original's entire hand-rolled tween rig, and sprang
  each pill independently.

  The practice generalises (see PLAN, Continuous workstreams): rebuild something
  real, count the nodes, and let the workarounds write the roadmap.

  **The after-picture (v0.8, same day):** with Phase 3 shipped, the nav
  rebuilt as `patches/organic-nav-v2.json` — one reusable **Organic Nav**
  cluster of 28 working nodes (Capsule Bar cluster nested inside), real `<a>`
  labels with `aria-current`, hover feedback through Delay. 92 flat nodes → 3
  top-level nodes. Write-up + remaining costs: `patches/organic-nav-v2.md`.

## Ideas for v2 (not built)

- Data trees (true graft/flatten/simplify) + per-wire list-matching modes
- More GH nodes: Graph Mapper, Sort List, Weave, Offset, Fillet (backlog: docs/NODE-LIBRARY.md)
- Input nodes: Scroll position, element hover/click targets, live data streams (fetch/WebSocket), audio
- Timeline/easing nodes; spring physics; trails/feedback buffers
- SVG/WebGL render targets; DOM output → **promoted**: now PLAN Phase 3/7 (see OUTPUT-MODES)
- ~~Groups/subgraphs~~ → **shipped v0.8 as Clusters** (PLAN Phase 3.1)
- Wire reroute handles, minimap (~~zoom-to-fit~~ shipped v0.8)
- Publish presets to lab.iriscocreative.com as embeddable scripts
