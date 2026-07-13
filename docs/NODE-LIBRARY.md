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
| **Sets** | `sets/` | Making and reshaping *lists* — the loom itself | 7 |
| **Vector** | `vec/` | Points and vectors — position as data | 11 |
| **Curve** | `crv/` | Geometry construction and interrogation | 10 |
| **Transform** | `xf/` | Moving geometry — affine maps | 3 |
| **Display** | `disp/` | Pixels out — draw, text, color, background | 5 |

A patch reads left to right as: **world & intent → numbers → lists → geometry → pixels**.
Icons should reinforce that flow (see `DESIGN-PLAN.md`).

---

## Planned nodes

### Sets — set operations *(planned — next node work, James 2026-07-13)*

Grasshopper's Sets tab operations, over Weft lists. All three are `listInputs`
(receive whole lists) and return arrays (flatten into the output list). Design
note: they need an equality predicate across loose types — propose: numbers
within epsilon 1e-9, points/vectors by coordinates, strings/bools exact,
geometry by JSON identity. Keep one shared `LM.setEq` so the three agree.

- **Set Union** `sets/union` — every distinct item that appears in A or B.
- **Set Intersection** `sets/intersection` — distinct items that appear in both A and B.
- **Set Difference** `sets/difference` — items in A that are not in B (order preserved from A).

### Sets — list surgery *(planned)*

- **Cull Pattern** `sets/cullpat` — keep items of L where the (repeating) bool pattern P is true. The other half of Series: Series makes rhythm, Cull edits it.
- **Shift List** `sets/shift` — rotate L by N (wrap toggle). Offsets phase in any repeating structure.
- **Dispatch** `sets/dispatch` — route items of L into outputs A/B by bool pattern P. The list-level if/else.
- **Sort List** `sets/sort` — sort keys K (numbers), optionally dragging a values list L along with them.
- **Weave** `sets/weave` — interleave lists by a pattern (GH name; too on-brand to skip).

### Maths *(planned)*

- **Graph Mapper** `math/graph` — remap 0..1 through a hand-drawn curve (custom body: draggable curve editor). The most-loved GH node; pure easing power.
- **Average** `math/avg` — mean of the whole list L (listInput). First reduction node; opens the door to statistics for the dashboard path.

### Curve *(planned / phase 6 for the hard ones)*

- **Length** `crv/length` — arc length of C. *(planned — trivial via toPoly)*
- **Offset** `crv/offset` — polyline offset of C by distance D. *(planned — polygon-offset math, no dependencies)*
- **Region Union / Intersection / Difference** — 2D boolean ops on closed regions. The geometric cousins of the set nodes; need real polygon clipping (Greiner–Hormann or vendored lib = deliberate decision, invariant #7). *(phase 6)*
- **Fillet** `crv/fillet` — round polyline corners by radius R. *(phase 6)*

### Transform *(planned)*

- **Mirror** `xf/mirror` — reflect geometry across a line. Completes the affine family; symmetry is half of ornament.

### Control surfaces — ROADMAP §3.5 *(planned — custom bodies, no engine work)*

- **Flow Gate** `ctl/gate` — trigger switches a data flow between paths / cycles / randomizes route.
- **Shift** `ctl/shift` — slider + addition fused: nudge a value in-wire.
- **Shift XY** `ctl/shiftxy` — radial joystick nudging a point.
- **Angle Dial** `ctl/dial` — angle as a draggable 360° dial.
- **Vector Pad** `ctl/vecpad` — draggable vector on an XY grid.
- **Blocker** — spatial wire-cutter rectangle; design against groups/frames first.

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

- **Charts pack** — Line Chart, Bar Chart, Scatter, Indicator/Dial, Time Slider: render nodes for the data-canvas path (see 2nd Brain `Weft — Possible Paths`).
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
