# Weft node library — the articulated map

The single place where the node library is *planned*. What exists is inventoried
in `NODE-CATALOG.md` (generated — descriptions, ports, defaults); this file holds
the shape of the library: what each category is *for*, what's planned, and why.
When a planned node ships, delete it here (the catalog picks it up automatically).

Naming rule: if Grasshopper has an equivalent, use Grasshopper's name.
Status: `planned` (agreed, buildable now) · `phase N` (waits on a PLAN phase) ·
`pack` (belongs in a future node pack, not core).

---

## The categories and what they mean

| Category | Prefix | Role in a patch | Count |
|---|---|---|---|
| **Input** | `input/` | The world flowing in — time, pointer, page, keys, interaction surfaces | 7 |
| **Params** | `params/` | Values a human sets — sliders, toggles, swatches, containers, panels | 10 |
| **State** | `state/` | Cross-frame memory — smoothing, springs, counters, latches, the Delay feedback edge | 9 |
| **Maths** | `math/` | Numbers in, numbers out — pure, per-item; comparison & boolean logic | 31 |
| **Sets** | `sets/` | Making and reshaping *lists* — the loom itself | 14 |
| **Vector** | `vec/` | Points and vectors — position as data | 12 |
| **Curve** | `crv/` | Geometry construction and interrogation | 10 |
| **Transform** | `xf/` | Moving geometry — affine maps | 3 |
| **Display** | `disp/` | Pixels out — draw, text, color, background; Measure Text, Element (real DOM), Trace, Cymatics | 8 |
| **Meta** | `meta/` | Composition — Cluster and its Port In / Port Out boundary markers (hidden from the palette) | 3 |
| **Audio** | `audio/` | Sound in & out (experiment) — pitch helpers (Note, Scale, tuned by `graph.meta.tuneA4`, 432 default), sources, processors, the speaker (master limiter + preview mute), Mic In (loudness → number), Scope (oscilloscope: waveform samples back onto the cloth); wires carry handle strings, `js/audio.js` reconciles the real Web Audio graph | 9 |

A patch reads left to right as: **world & intent → numbers → lists → geometry → pixels**.
Icons should reinforce that flow (see `DESIGN-PLAN.md`).

---

## Planned nodes

### Altitude — harvested from the organic-nav case study, 2026-07-14

**Shipped in v0.8 (Phase 3):** Comparison `math/cmp` (mode-toggled `= ≠ < ≤ > ≥`),
Logic `math/logic` (and/or/xor/not), Select `sets/select`, Mass Addition
`math/masadd` (with partial results), Text List `params/textlist`, Measure Text
`disp/measure` (host `ctx.measureText`), Delay `state/delay` (the feedback
edge), plus Element `disp/element` (OUTPUT-MODES mode 2) and the Cluster system.
The proof is `patches/organic-nav-v2.md`: 92 flat nodes → one 28-node cluster.

Still open from that harvest:

- **Bezier** `crv/bezier` and **Join Curves** `crv/join` — needed once the `path`
  kind lands (phase 5). Until then the nav's necks are circular fillets.
- **Active-index idiom** — "index of the item whose trigger last fired" costs 6
  nodes (clicks × indices → Mass Addition → Sample & Hold). Candidate node, but
  per principle 7 wait for a second patch to pay the same cost before adding it.
- **Format** `txt/format` (already below) — organic-nav v2 bakes styling into
  attribute-string literals because there is no string composition; this is now
  the sharpest missing altitude node.

### Colour — harvested from the GH demo corpus, James 2026-07-13 *(planned — high)*

- **Colour** `params/colour` — pass-through colour param, completing the v0.3.1
  param family (Number/Point/Vector/Curve exist; Colour doesn't). GH demos use
  it constantly to bundle swatches: N swatches → one Col param via multi-wire.
- **Split Colour** `disp/splitcol` — colour → components, with a **mode toggle**
  (AHSL / AHSV / ARGB) instead of GH's three separate nodes. James's design;
  see library principle 5. Demo 3 turns hue/luminance into coordinates — colour
  *as data* is very Weft.
- **Gradient (multi-stop)** — extend `disp/gradient` beyond A→B: stops list +
  positions, GH-style draggable-stop body later. Demos 2 and 4 both need ≥3 stops.

### Sets — list surgery *(planned)*

- **Sort List** `sets/sort` — sort keys K (numbers), optionally dragging a values list L along with them.
- **Weave** `sets/weave` — interleave lists by a pattern (GH name; too on-brand to skip).
- **Interpolate Data** `sets/interpdata` — resample a list at parameter t
  (0..1), interpolating between items — numbers, points, *and colours*
  (polymorphic via coerce). GH Demo 2's whole trick; kin to Evaluate Curve but
  for any data.

### Maths *(planned)*

- **Graph Mapper** `math/graph` — remap 0..1 through a hand-drawn curve (custom body: draggable curve editor). The most-loved GH node; pure easing power.
- **Average** `math/avg` — mean of the whole list L (listInput). First reduction node; opens the door to statistics for the dashboard path.
- **Bounds** `math/bounds` — min/max of a list as a domain. GH's normalize
  idiom is Bounds → Remap ("distances can be any positive value; remap into a
  fixed domain") — Demos 5 and 6 both lean on it; belongs in RECIPES too.
- **Expression: variable ports** — GH's Expression grows named inputs to match
  the formula (a,b,c,d,x…); Weft's is fixed X,Y,Z,T. Port-count-follows-
  expression is the upgrade (Demo 4's polynomial needs 5 inputs).

### Curve *(planned / phase 7 for the hard ones)*

- **Length** `crv/length` — arc length of C. *(planned — trivial via toPoly)*
- **Offset** `crv/offset` — polyline offset of C by distance D. *(planned — polygon-offset math, no dependencies)*
- **Region Union / Intersection / Difference** — 2D boolean ops on closed regions. The geometric cousins of the set nodes; need real polygon clipping (Greiner–Hormann or vendored lib = deliberate decision, invariant #7). *(phase 7)*
- **Fillet** `crv/fillet` — round polyline corners by radius R. *(phase 7)*

### Curve / Vector — harvested from the GH demo corpus *(planned)*

- **Curve Closest Point** `crv/closest` — nearest point on C to P, + distance.
  The engine of GH's attractor patterns (Demos 5, 6); cheap via `LM.toPoly`.
- **Point In Curve** `crv/incurve` — is P inside closed region C (bool).
  `LM.pointInGeom` already exists for Hotspot — this just exposes it as data.
- **Bounding Box** `crv/bbox` — rect bounds of geometry (whole-list mode via
  listInput). Demo 6: measure shape → size grid to fit.
- **Join Curves** `crv/join` — merge touching curves into one polyline.

### Text *(pull Format forward)*

- **Format** `txt/format` — template string with `{0} {1}` slots, values in,
  string out (GH Demos 1, 5: `{0:0.00} mm` → live labels). Cheap, and readouts
  + Panel + Text make it immediately useful — build alongside the set nodes.

### Transform *(planned)*

- **Mirror** `xf/mirror` — reflect geometry across a line. Completes the affine family; symmetry is half of ornament.
- **Array / Tile** `xf/tile` — replicate geometry across a region on two basis
  vectors (GH's Linear/Rectangular Array). *Not* the way to build a repeating
  background of *varying* cells — that's Grid + list matching (principle 6).
  Tile is for genuinely identical copies, and it's the honest node for it. Keep
  the two distinct in the docs or people will reach for the wrong one.

> **Do not build a "Pattern" node** that renders a tile to an offscreen canvas
> and `createPattern`s it across the background (James's idea, 2026-07-14). It is
> the right *optimisation* and the wrong *abstraction*: draw nodes are sinks into
> one flat `drawList`, so a tile-to-texture node would need a second render target
> and a notion of "which draws belong to the tile" — the first crack in invariant 4.
> Canvas2D does not blink at the ~900 circles a full-screen Grid produces. Revisit
> only when a measured 4K background hits a frame budget, and then do it as a
> *renderer* feature, not a node.

### Control surfaces — ROADMAP §3.5 *(planned — custom bodies, no engine work)*

- **Flow Gate** `ctl/gate` — trigger switches a data flow between paths / cycles / randomizes route.
- **Shift** `ctl/shift` — slider + addition fused: nudge a value in-wire.
- **Shift XY** `ctl/shiftxy` — radial joystick nudging a point.
- **Angle Dial** `ctl/dial` — angle as a draggable 360° dial.
- **Vector Pad** `ctl/vecpad` — draggable vector on an XY grid.
- **Blocker** — spatial wire-cutter rectangle; design against groups/frames first.
- **Value List** `params/valuelist` — named-options dropdown (GH Demo 1).
  Core UI for presets and modes; simple custom body.
- Later input objects from GH Demo 1's gallery: Digit Scroller, Calendar/Clock
  (a **Date/Time** input node — real-world data on the loom), Colour Wheel
  (see also the 3D colour picker note in the vault — design study for a richer
  swatch/picker body).

### Input — later inputs *(phase 4+)*

- **Element Visibility** — IntersectionObserver: is a page element on screen (0..1). Scrollytelling's missing half.
- **URL Params** — read query-string values; patches configurable per-page.
- **Fetch / Data Stream** — poll a URL / open a WebSocket → values. The bridge to n8n webhooks and the whole dashboard path.
- **Audio In** — ✅ shipped v0.8.4 as **Mic In** (`audio/mic`): loudness (RMS)
  → number via `ctx.audioState`. FFT bands remain a follow-up. *(audio OUT
  shipped v0.8.2: Oscillator/Noise/Gain/Filter/Audio Out; band read-back would
  extend the same `ctx.audioState`
  analyser would be this node's natural home)*
- **MIDI / Gamepad** — live-performance patching. *(horizon)*

### Media *(phase 5)*

- **Image** — URL/file → drawable `image` geometry kind.
- **Image Sample** — brightness/color at points → numbers. The killer node: halftones, image-driven fields.
- **Video** / **Webcam** — animated image sources (getUserMedia — nothing like it in GH).
- **Feedback Buffer** — previous frame as an image → trails, decay, flow.

### Text *(phase 5)*

- **Deconstruct Text** — string → character list; kinetic type via list matching.
- **Text on Curve** — glyphs along a curve with tangent angles.
- **Measure Text** — text → bounding geometry.
- **Font** — FontFace loading; variable-font axes as number inputs (wire data into weight).

### Meta *(phase 4)*

- **Custom JS** — code-block node with promoted parameters (the Houdini pattern). The escape hatch that keeps the core library small.

### Future packs *(pack — not core)*

- **Charts pack** — Line Chart, Bar Chart, Scatter, Indicator/Dial, Time Slider: render nodes for the data-canvas path (see 2nd Brain `Weft — Possible Paths`). Precedent from *inside* GH: Bar Graph and Quick Graph render live charts on the canvas (Demo 5) — the dashboard path exists in embryo in Grasshopper itself.
- **Mesh/Field pack** — Mesh Spray-style colour fields: points + colours →
  smooth 2D gradient field (Demo 3's output). In web terms: colour-field
  interpolation on canvas; gorgeous, later.
- **System-dynamics pack** — Stock, Flow, Converter, Delay (Machinations/Loopy precedent) — phase 8.
- **3D pack** — Vector3, Mesh, Camera — phase 7, three.js target.

---

## Library principles

1. **Small core, honest packs.** A node earns a place in core by being useful in
   most patches. Domain nodes (charts, stocks/flows, 3D) live in packs.
2. **GH names, GH single-letter ports.** Familiarity is a feature; the catalog
   is the contract.
3. **Custom JS is the pressure valve.** Not every function becomes a node —
   when in doubt, prove demand in a Custom JS body first, promote to a def later.
4. **Every node ships with:** one-sentence `desc`, catalog entry (automatic),
   smoke coverage (automatic), and — once the icon system exists — a glyph.
5. **Mode toggles over node families** (James, from the GH corpus study).
   Where GH ships three siblings (Split AHSL/AHSV/ASRGB), Weft ships one node
   with a mode toggle. GH itself half-does this (Interpolate's scheme lives in
   its context menu). Keeps the library small and the palette learnable.
   Grid (square/iso) is the first: GH ships four grid components, and once you
   only emit *points*, its Triangular and Hexagonal grids are the same lattice.
   Two modes, one node, and swapping a pattern square↔iso becomes one click.
6. **Variation is data, not topology** (James's iso-pattern study, 2026-07-14).
   The tell that a node is missing: the user *branches the graph* to make N
   variants of one thing. A 108-node patch that pulsed circles in three phases
   used three Dispatch branches → three Circles → three Draws, because nothing
   handed it a per-point phase. The fix wasn't a bigger Dispatch, it was Grid's
   **K** output: a class number per point. `T + K * PI * 2 / 3` in one Expression,
   and list matching turns *one* Circle node into the whole field — 8 nodes, and
   changing 3 phases to 5 is now editing a number instead of rewiring.
   So: **when a generator can hand out a per-item key (index, class, coordinate),
   it should.** Those outputs are what keep the graph flat. A node that emits only
   geometry forces its user into topology. This is why Grid emits P *and* C, R, K.
   K especially earns its place because it cannot be derived downstream by eye:
   the iso 3-colouring is `(C - floor(R/2) + 2R) mod 3` (an axial-coordinate
   transform — the naive `C % 3` puts same-phase circles next to each other), and
   it is *canonical*, not arbitrary — 2 and 3 are the chromatic numbers of the
   square and triangular lattices. Emit the canonical thing; leave the rest to
   Expression on C/R.
7. **Node count is a diagnostic — read it before adding nodes** (organic-nav case
   study, 2026-07-14). Principle 6 found *one* cause of bloat. There are three,
   they look identical from inside a fat patch, and they have different cures.
   When a patch is too big, ask in this order:
   - **Wrong altitude?** The patch is doing arithmetic the library should own
     (the nav smuggled every `if` through `Expression`; the iso field branched
     because Grid withheld `K`). Cure: a *node*. Cheap, and principle 6 tells you
     where to look.
   - **No encapsulation?** The patch is right-sized for what it does, but you
     cannot name it and reuse it. Cure: a *cluster*. This is not a node problem
     and no number of new nodes will fix it — resist the urge to paper over it
     with an ever-more-specific node ("Organic Nav" must not become a def).
   - **Wrong boundary?** The patch is re-implementing something the browser
     already does — text layout, focus, semantics, hit-testing. Cure: *let the
     page do it* (`docs/OUTPUT-MODES.md`). The deepest of the three and the
     easiest to miss, because the patch works.

   The failure mode this guards against is answering all three with (a): the
   library grows, patches stay huge, and every new node is narrower than the last.
   A library gets its power from **composition**, not from coverage.
