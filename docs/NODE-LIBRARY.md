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
| **Params** | `params/` | Values a human sets — sliders, toggles, swatches, containers, panels | 9 |
| **State** | `state/` | Cross-frame memory — smoothing, springs, counters, latches | 8 |
| **Maths** | `math/` | Numbers in, numbers out — pure, per-item | 28 |
| **Sets** | `sets/` | Making and reshaping *lists* — the loom itself | 13 |
| **Vector** | `vec/` | Points and vectors — position as data | 11 |
| **Curve** | `crv/` | Geometry construction and interrogation | 10 |
| **Transform** | `xf/` | Moving geometry — affine maps | 3 |
| **Display** | `disp/` | Pixels out — draw, text, color, background | 5 |

A patch reads left to right as: **world & intent → numbers → lists → geometry → pixels**.
Icons should reinforce that flow (see `DESIGN-PLAN.md`).

---

## Planned nodes

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

### Curve *(planned / phase 6 for the hard ones)*

- **Length** `crv/length` — arc length of C. *(planned — trivial via toPoly)*
- **Offset** `crv/offset` — polyline offset of C by distance D. *(planned — polygon-offset math, no dependencies)*
- **Region Union / Intersection / Difference** — 2D boolean ops on closed regions. The geometric cousins of the set nodes; need real polygon clipping (Greiner–Hormann or vendored lib = deliberate decision, invariant #7). *(phase 6)*
- **Fillet** `crv/fillet` — round polyline corners by radius R. *(phase 6)*

### Curve / Vector — harvested from the GH demo corpus *(planned)*

- **Curve Closest Point** `crv/closest` — nearest point on C to P, + distance.
  The engine of GH's attractor patterns (Demos 5, 6); cheap via `LM.toPoly`.
- **Point In Curve** `crv/incurve` — is P inside closed region C (bool).
  `LM.pointInGeom` already exists for Hotspot — this just exposes it as data.
- **Bounding Box** `crv/bbox` — rect bounds of geometry (whole-list mode via
  listInput). Demo 6: measure shape → size grid to fit.
- **Grids** — **Square Grid** / **Hex Grid** `vec/gridsq` `vec/gridhex` —
  point lattices with extents + spacing. The generative workhorse GH puts
  behind every pattern demo; Weft has nothing like it yet and it's pure list
  fun (grid → cull → attractor = the classic trio).
- **Join Curves** `crv/join` — merge touching curves into one polyline.

### Text *(pull Format forward)*

- **Format** `txt/format` — template string with `{0} {1}` slots, values in,
  string out (GH Demos 1, 5: `{0:0.00} mm` → live labels). Cheap, and readouts
  + Panel + Text make it immediately useful — build alongside the set nodes.

### Transform *(planned)*

- **Mirror** `xf/mirror` — reflect geometry across a line. Completes the affine family; symmetry is half of ornament.

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

### Input — later inputs *(phase 3+)*

- **Element Visibility** — IntersectionObserver: is a page element on screen (0..1). Scrollytelling's missing half.
- **URL Params** — read query-string values; patches configurable per-page.
- **Fetch / Data Stream** — poll a URL / open a WebSocket → values. The bridge to n8n webhooks and the whole dashboard path.
- **Audio In** — mic amplitude/FFT bands. *(horizon)*
- **MIDI / Gamepad** — live-performance patching. *(horizon)*

### Media *(phase 4)*

- **Image** — URL/file → drawable `image` geometry kind.
- **Image Sample** — brightness/color at points → numbers. The killer node: halftones, image-driven fields.
- **Video** / **Webcam** — animated image sources (getUserMedia — nothing like it in GH).
- **Feedback Buffer** — previous frame as an image → trails, decay, flow.

### Text *(phase 4)*

- **Deconstruct Text** — string → character list; kinetic type via list matching.
- **Text on Curve** — glyphs along a curve with tangent angles.
- **Measure Text** — text → bounding geometry.
- **Font** — FontFace loading; variable-font axes as number inputs (wire data into weight).

### Meta *(phase 3)*

- **Custom JS** — code-block node with promoted parameters (the Houdini pattern). The escape hatch that keeps the core library small.

### Future packs *(pack — not core)*

- **Charts pack** — Line Chart, Bar Chart, Scatter, Indicator/Dial, Time Slider: render nodes for the data-canvas path (see 2nd Brain `Weft — Possible Paths`). Precedent from *inside* GH: Bar Graph and Quick Graph render live charts on the canvas (Demo 5) — the dashboard path exists in embryo in Grasshopper itself.
- **Mesh/Field pack** — Mesh Spray-style colour fields: points + colours →
  smooth 2D gradient field (Demo 3's output). In web terms: colour-field
  interpolation on canvas; gorgeous, later.
- **System-dynamics pack** — Stock, Flow, Converter, Delay (Machinations/Loopy precedent) — phase 7.
- **3D pack** — Vector3, Mesh, Camera — phase 6, three.js target.

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
