# Authoring Weft patches (for LLMs — and anyone writing graph JSON by hand)

This file is **prompt-ready**: paste it (plus `NODE-CATALOG.md` if you need the
long-form inventory) into a model's context and it can emit valid patches. It is
distilled from `NODE-SPEC.md` — the spec stays the authority; this is the
working knowledge.

A **patch** is a JSON document of nodes and wires. The person you're helping
will paste your JSON into the Weft editor (Ctrl+V on the canvas) and it becomes
live, editable nodes. You are not generating code — you are generating a
*shared artifact* the human will keep shaping with sliders after you're gone.

## 1. The shape you emit

Always a single JSON code block, in fragment form:

```json
{
  "weft": "patch", "format": 1,
  "nodes": [
    { "id": "n1", "type": "input/time" },
    { "id": "n2", "type": "math/sin" },
    { "id": "n3", "type": "math/remap", "values": { "S0": -1, "S1": 1, "T0": 40, "T1": 90 } },
    { "id": "n4", "type": "crv/circle" },
    { "id": "n5", "type": "disp/draw" }
  ],
  "wires": [
    { "from": ["n1", "T"], "to": ["n2", "V"] },
    { "from": ["n2", "R"], "to": ["n3", "V"] },
    { "from": ["n3", "R"], "to": ["n4", "R"] },
    { "from": ["n4", "C"], "to": ["n5", "G"] }
  ]
}
```

That patch is a breathing circle. Rules:

- `id` — any unique string (`n1`, `n2`… by convention).
- **Omit `x`/`y`.** Pasting a coordinate-less patch triggers automatic
  topological layout. Only provide positions if you have a deliberate spatial
  story (columns of ~250px, reading left→right).
- `values` — literals for unwired inputs, keyed by the input's **port name**,
  plus node-specific state (a slider's `min`/`max`/`value`).
  Everything in `values` must be JSON-serializable.
- Wires are `{from: [nodeId, outputPort], to: [nodeId, inputPort]}`.
  Port letters matter and are case-sensitive — check §5.
- Cycles are invalid **except through `state/delay`** (§6).
- Omit `ext` (that's for same-app clipboard moves, not chat).

## 2. Types & coercion

`number · bool · string · point {x,y} · vector {x,y} · point3 {x,y,z} ·
camera (plain JSON from `d3/camera`) · color {r,g,b,a} (rgb 0–255, a 0–1) ·
geometry · audio · any`

Any output can wire into any input — coercion does its best (number↔bool,
number→point `{x:v,y:v}`, hex string→color, point→number magnitude, point→point3
with z=0, point3→point dropping z, number→point3 filling all three…). Geometry,
camera, audio and any pass through untouched. Don't fight types; wire what reads
well.

## 3. Lists — the semantic that makes patches small

**Every port value is a list.** A bare literal is a one-item list.

1. **Longest-list matching** — a node computes once per index up to its longest
   input list; shorter lists repeat their last item. A 200-item Series into
   Circle's center = 200 circles; one number into radius applies to all.
2. **Multi-wire merge** — several wires into one input concatenate in wire order.
3. **Whole-list inputs** — ports marked *list-in* in §5 receive the entire list
   in one call (PolyLine's vertices, List Item's L…).
4. **Flattening** — a compute returning an array spreads flat into the output
   list (Series emits its whole sequence). There are no nested lists.

**Think in lists first.** One Series → one node chain → many things is the house
style; a patch that repeats near-identical node chains is wrong at the root.
A state node fed an N-item list is N independent machines (three circles through
one Hotspot and one Latch = three independent toggles).

## 4. What every patch needs

- **A path to a Display node.** Geometry that reaches no `disp/draw` is computed
  but invisible. Add `disp/bg` for a background. Coordinates are **centered**:
  (0,0) is the canvas middle, +y down, radians everywhere.
- **Sliders are the interface.** Expose what a human will want to play with as
  `params/slider` (`values: {min, max, value, label}` — add `"mode":"int"` for
  counts) / `params/toggle` / `params/swatch`, rather than burying constants in
  `values`. This is the whole point: iteration without re-prompting.
- **Triggers are one-frame bools** (a click, a key press). `state/edge` turns a
  continuous bool into rise/fall triggers. State nodes (Smooth, Spring, Latch,
  Counter, Timer, Sample & Hold) remember across frames, per list item.

## 5. Port reference (every node, exact letters)

Format: `in-ports → out-ports`, `name:type=default`. Ports named under
*list-in* receive whole lists.

### Input
| node | title | in | out | |
|---|---|---|---|---|
| `input/button` | Button | L:string="press" P:point | C:bool D:bool N:number | |
| `input/hotspot` | Hotspot | G:geometry R:number=8 | H:bool D:bool C:bool | H hover · D down · C clicked |
| `input/keyboard` | Keyboard | K:string="space" | D:bool P:bool R:bool | held / pressed / released |
| `input/mouse` | Mouse | | X:number Y:number NX:number NY:number D:bool | px centered · normalized 0–1 · down |
| `input/scroll` | Scroll | | Y:number N:number V:number | px · normalized · velocity |
| `input/time` | Time | P:bool R:bool | T:number F:number | seconds · frame |
| `input/turntable` | Turntable | R:number=1 Z:bool | T:number | integrated time: R scales/reverses the spin without jumps, Z rewinds |
| `input/viewport` | Viewport | | W:number H:number | |

### Params
| node | title | in | out | |
|---|---|---|---|---|
| `params/slider` | Number Slider | | N:number | values: min max value label, mode:"int" |
| `params/toggle` | Boolean Toggle | | B:bool | values: value |
| `params/button` | Button (momentary) | | B:bool | |
| `params/swatch` | Colour Swatch | | C:color | values: c:{r,g,b,a} |
| `params/textlist` | Text List | | L:string | values: text (one item per line) |
| `params/number` | Number | N:number=0 | N:number | |
| `params/point` | Point | P:point | P:point | |
| `params/vector` | Vector | V:vector | V:vector | |
| `params/anchor` | Anchor Point | | P:point | values: x y — draggable on the canvas |
| `params/panel` | Note Pad | V:any (list-in) | V:any | inspector |
| `params/graph` | Graph Data | X Y A:point B:point (list-in X,Y) | X Y | on-node plot |
| `params/timegraph` | Time Graph | V:number (list-in) | V:number | rolling trace |
| `params/relay` | Relay | V:any (list-in) | V:any | wire organiser |
| `params/svg` | Vector In | S:number=200 | G:geometry F:color K:color N:number | values: paths (from "load svg…" — a human loads the file; polylines centred on (0,0), long side scaled to S px; F/K are fill/stroke per path) |

### State (memory per list item; resets on load)
| node | title | in | out | |
|---|---|---|---|---|
| `state/smooth` | Smooth | V:number S:number=8 | R:number | eased follower |
| `state/spring` | Spring | V:number F:number=2 D:number=0.5 | R:number V:number | |
| `state/counter` | Counter | U:bool D:bool R:bool S:number=1 | N:number | up/down/reset triggers |
| `state/latch` | Latch | T:bool R:bool | B:bool | toggle on trigger |
| `state/sample` | Sample & Hold | V:any T:bool | R:any | |
| `state/timer` | Timer | T:bool P:bool | S:number A:bool | seconds since trigger · active |
| `state/prev` | Previous Value | V:any | P:any | |
| `state/edge` | Edge | B:bool | R:bool F:bool | rise / fall triggers |
| `state/delay` | Delay | V:any I:any=0 (list-in V,I) | V:any | **the legal feedback edge** |

### Maths
Unary (`V:number → R:number`): `math/abs` `math/neg` `math/round` `math/floor`
`math/ceil` `math/sqrt` `math/sin` `math/cos` `math/tan` `math/rad` `math/deg`.
Binary (`A B → R`): `math/add` `math/sub` `math/mul` `math/div` `math/mod`
`math/pow` `math/min` `math/max` `math/atan2` (X Y → R) `math/cmp` (→ R:bool,
values.mode: `= ≠ < ≤ > ≥`) `math/logic` (→ R:bool, values.mode:
and/or/xor/not).
| node | in | out | |
|---|---|---|---|
| `math/remap` | V S0=0 S1=1 T0=0 T1=100 C:bool=true | R | map V from [S0,S1] to [T0,T1], C clamps |
| `math/clamp` | V A=0 B=1 | R | |
| `math/lerp` | A B T=0.5 | R | |
| `math/smooth` | A B T | R | eased lerp |
| `math/expr` | X Y Z | R | values.expr, e.g. `"sin(X)*Y"` — Math in scope, T=time |
| `math/noise` | X Y | N | smooth pseudo-random |
| `math/masadd` | L (list-in) | R P | sum + partial sums |
| `math/pi` / `math/phi` | F=1 | P | π·F / φ·F |

### Sets
| node | in | out | |
|---|---|---|---|
| `sets/series` | S:start N:step C:count | S | the workhorse |
| `sets/range` | A B N:steps | R | N+1 values across [A,B] |
| `sets/random` | N A B S:seed | R | deterministic |
| `sets/item` | L (list-in) i | E | |
| `sets/length` | L (list-in) | N | |
| `sets/merge` | A B (list-in) | M | |
| `sets/reverse` | L (list-in) | R | |
| `sets/cullpat` | L P:bool (list-in) | L | keep where pattern true |
| `sets/shift` | L (list-in) S=1 W:wrap | L | |
| `sets/dispatch` | L P (list-in) | A B | split by pattern |
| `sets/select` | T F P:bool (list-in) | L | list-level ternary |
| `sets/union` / `sets/intersection` / `sets/difference` | A B (list-in) | U / I / D | |

### Vector
| node | in | out | |
|---|---|---|---|
| `vec/construct` | X Y | P:point | |
| `vec/deconstruct` | P | X Y | |
| `vec/polar` | O:point A:angle R:radius | P:point | |
| `vec/distance` | A B | D | |
| `vec/angle` | A B | R | |
| `vec/grid` | P S:spacing W H | P:point C:col R:row K:colour-class | values.iso for iso lattice |
| `vec/vecxy` | X Y | V:vector | |
| `vec/vec2pt` | A B U:unit | V:vector L | |
| `vec/pt2vec` | P | V | · `vec/unit` V→V · `vec/amp` V A→V · `vec/reverse` V→V |
| `vec/dot` | A B | D:number | A·B — 0 means perpendicular |
| `vec/cross` | A B | C:number | 2D cross is a scalar (the perp-dot) |

### Curve — construction (all emit C:geometry)
| node | in | |
|---|---|---|
| `crv/circle` | P R=60 | |
| `crv/ellipse` | P RX RY A | |
| `crv/rect` | P W H A | centered |
| `crv/polygon` | P R N=6 A | |
| `crv/line` | A:point B:point | |
| `crv/arc` | P R A0 A1 | radians |
| `crv/polyline` | V:point (list-in) C:closed | straight segments through the list |
| `crv/interp` | V:point (list-in) C:closed | spline through the list |
| `crv/hull` | P:point (list-in) | the convex outline round the points |

### Curve — sampling, analysis, reshaping
Every curve is arc-length parameterized over `t = 0..1`, so a `T` from one node
means the same place on the curve in every other.

| node | in | out | |
|---|---|---|---|
| `crv/eval` | C T=0.5 | P:point V:tangent N:normal | |
| `crv/divide` | C N=10 | P:point T:number V:tangent | `values.mode` `'count'`\|`'length'` (N = px spacing) |
| `crv/intersect` | C1 C2 | P:point T1 T2 | `values.mode` `'pair'`\|`'self'`; T1/T2 feed `crv/eval` |
| `crv/closest` | C P:point | P:point T D:distance | the attractor engine |
| `crv/incurve` | C P:point | B:bool | closed curves only |
| `crv/length` | C | L | · `crv/area` C → A:number C:centroid |
| `crv/bbox` | G (list-in) | B:rect C:centre W H | `values.mode` `'each'`\|`'all'` |
| `crv/offset` | C D=10 | C | +D grows closed curves outward; circles/arcs/lines stay exact, others → poly |
| `crv/join` | C (list-in) T=1 | C | chains curves whose ends meet within T px |
| `crv/trim` | C X:cutter | C | `values.mode` `'outside'`\|`'inside'`\|`'split'` |
| `crv/fillet` | C R=12 N=8 | C | rounds corners, radius capped at half the shorter edge |
| `crv/region` | A B | C | `values.mode` `'union'`\|`'intersection'`\|`'difference'`; no holes |

### Transform (G:geometry in → G out)
`xf/move` (T:vector) · `xf/rotate` (A:radians, C:center) ·
`xf/scale` (F, Y, C — `values.mode` `'uniform'`\|`'xy'`; non-uniform turns a
circle into an ellipse) · `xf/mirror` (A, B — the two ends of the mirror line) ·
`xf/tile` (V1 N1 V2 N2 → G plus I, J cell indices; identical copies only —
varying cells are `vec/grid` + list matching) ·
`xf/kaleido` (G **list-in** N=6 M:mirror=true C:centre → G plus K wedge index;
the whole input — every wired item — replicated into N wedges around C, with
alternate wedges reflected so neighbours share mirrored edges; keep the motif
*off* the centre and off the wedge axes or mirrored copies coincide).

### 3D (`js/nodes-3d.js` — the pack; world axes are x right, y **down**, z away)
| node | in | out | |
|---|---|---|---|
| `d3/project` | G:geometry(**list-in**) C:camera L:point3 | F:geometry S:number D:number | `values.mode` `'shaded'`\|`'wire'`\|`'both'`; F is 2D screen geometry **already sorted back to front**, S the shade 0..1, D the depth — three index-aligned lists |
| `d3/camera` | P:pos T:target F:fov° Z:zoom U:up | C:camera | `values.mode` `'persp'`\|`'ortho'` |
| `d3/orbit` | T:target D D:dist A:yaw E:pitch F:fov° | C:camera A E | drag the cloth to orbit, wheel to pull back; A/E are resting angles the drag adds to |
| `d3/extrude` | G:2D-geometry H C:cap | G:mesh | centred on its own plane; open curves become ribbons |
| `d3/revolve` | G:2D-profile N A:sweep-rad | G:mesh | about the world y axis; the profile's x is the radius |
| `d3/box` `d3/sphere` `d3/cylinder` `d3/cone` `d3/torus` `d3/plane` | P:centre + sizes | G:mesh | height runs along y; Plane lies in xz |
| `d3/move3` `d3/rotate3` `d3/scale3` | G + T / R:rad A:axis C / F:point3 C | G | a 2D shape lifts to `poly3`; Scale3's F takes a bare number as uniform |
| `d3/point3` `d3/decon3` `d3/polyline3` `d3/grid3` | X Y Z / P / V(list-in) C / P S NX NY NZ | P:point3 / X Y Z / G / P I J K | Grid3's I/J/K are per-item keys |
| `d3/faces` | G:mesh | F:geometry N:point3 C:point3 | face polys + normals + centroids |
| `d3/dot3` `d3/cross3` `d3/unit3` `d3/len3` `d3/amp3` | A B / V / V A | D / C / V / L / V | the 3D vector family |

**The 3D idiom, whole:** `something 2D → d3/extrude → d3/project → S through
math/remap → disp/hsl → ONE disp/draw(G:F, F:colour)`. Never one Draw per face.
Wire every mesh into the *same* Project so its depth sort is global. Remap the
shade before colouring, or unlit faces come out black.

### Display
| node | in | out | |
|---|---|---|---|
| `disp/draw` | G S:stroke-color F:fill-color W:width | G | fill alpha 0 = no fill |
| `disp/bg` | C:color | | |
| `disp/hsl` | H S L A (0–1) | C:color | |
| `disp/gradient` | T=0.5 A:color B:color | C:color | |
| `disp/text` | T:string P S:size | G:geometry | |
| `disp/measure` | T S P | W H G | real text metrics |
| `disp/element` | G T:tag C:content A:attrs | H F D K | real DOM element over the canvas |
| `disp/trace` | V C:color P D:vector L W (list-in V,C) | G | streaming pen trails |
| `disp/cymatics` / `disp/harmonograph` | see catalog | | display instruments |

### Audio (wires carry handles; sound starts after a user gesture)
`audio/note` N O → F:Hz M · `audio/scale` V → F M (snap to key) ·
`audio/osc` F D → A · `audio/noise` → A · `audio/gain` In G → A ·
`audio/filter` In F Q → A · `audio/mix` In(list) G → A ·
`audio/out` In V (sink) · `audio/mic` → A V:loudness R ·
`audio/pitch` In(audio, optional — mic fallback) → F:Hz M:midi C:clarity ·
`audio/track` G → A:stereo L R V VL VR S (computer audio via share picker) ·
`audio/scope` In … → G V L · `audio/xyscope` X Y … → G ·
`audio/fft` In N S:smoothing → B:list-of-band-levels R (spectrum, log 40Hz–16kHz) ·
`audio/path` G F → X Y (geometry outline → looped waveform).

### Meta
`meta/cluster` — a subgraph folded into one node (ports in `values.ins/outs`,
graph in `values.graph`, boundary marked by `meta/portin`/`meta/portout` nodes
whose `values.port` names the port). Prefer emitting flat patches; author a
cluster only when reuse is the request.
`meta/js` — **Custom JS**, see §7.

## 6. Feedback

Cycles are refused except through `state/delay`, which emits **last frame's**
input. "The thing you point at moves in response" is wired
`layout → hotspot → … → delay → layout` and costs one frame of latency.

## 7. Custom JS (`meta/js`) — when no node fits

Not every function needs to become a node. Wrap the irreducible core in one
code node and **promote its magic numbers to input ports** so they stay
playable:

```json
{ "id": "n1", "type": "meta/js", "values": {
    "title": "superformula", "mode": "each",
    "ins": [
      { "name": "T", "type": "number", "default": 0 },
      { "name": "M", "type": "number", "default": 6 },
      { "name": "R", "type": "number", "default": 130 }
    ],
    "outs": [{ "name": "P", "type": "point" }],
    "code": "const q = M * T / 4;\nconst f = Math.abs(Math.cos(q)), g = Math.abs(Math.sin(q));\nconst r = R * Math.pow(Math.pow(f, 1.7) + Math.pow(g, 1.7), -1 / 0.3);\nreturn { P: { x: r * Math.cos(T), y: r * Math.sin(T) } };"
} }
```

The contract:
- `code` is a function **body**. Each input port is a variable; also in scope:
  `ctx` (t, dt, mouse, W, H…), `node`, `LM` (engine helpers). Return an object
  keyed by output port names; return an array under a key to emit many items.
- `mode: "each"` (default) runs the body once per list item with longest-list
  matching — exactly like a native node. `mode: "list"` runs it once and every
  port is the whole list (loop yourself, return arrays).
- Purity rules still apply: no DOM, no `Date.now()`, no `Math.random()` — use
  `ctx.t` and `LM.rng(seed)`. Cross-frame memory goes on `node._state`.
- `title`, `ins`, `outs`, `graph`, `code`, `mode` are reserved — don't name a
  port after them.
- **Trust boundary:** like the Expression node, this executes code on the
  machine that opens the graph. Fine for your own patches; label shared ones.

Reach for Custom JS *after* native nodes fail you — a patch of one giant code
node has no wires to read, and wires are the point. The sweet spot: one
irreducible formula in code, everything around it (lists, colors, interaction,
display) in nodes.

## 8. Layout conventions

Omit coordinates (auto-layout) — or, when you do place nodes: left→right flow,
~250px column spacing, ~110px row spacing; params in the leftmost column;
display nodes rightmost; no crossing wires you can avoid.

## 9. Few-shot: an interactive patch

Three circles, each an independent toggle — click to light. One chain, no
repetition (the per-item state idiom):

```json
{
  "weft": "patch", "format": 1,
  "nodes": [
    { "id": "n1", "type": "sets/series", "values": { "S": -160, "N": 160, "C": 3 } },
    { "id": "n2", "type": "vec/construct" },
    { "id": "n3", "type": "crv/circle", "values": { "R": 46 } },
    { "id": "n4", "type": "input/hotspot" },
    { "id": "n5", "type": "state/latch" },
    { "id": "n6", "type": "math/expr", "values": { "expr": "X ? 1 : 0.15" } },
    { "id": "n7", "type": "disp/hsl", "values": { "H": 0.46, "S": 0.8 } },
    { "id": "n8", "type": "disp/draw", "values": { "W": 2 } },
    { "id": "n9", "type": "disp/bg" }
  ],
  "wires": [
    { "from": ["n1", "S"], "to": ["n2", "X"] },
    { "from": ["n2", "P"], "to": ["n3", "P"] },
    { "from": ["n3", "C"], "to": ["n4", "G"] },
    { "from": ["n4", "C"], "to": ["n5", "T"] },
    { "from": ["n5", "B"], "to": ["n6", "X"] },
    { "from": ["n6", "R"], "to": ["n7", "L"] },
    { "from": ["n7", "C"], "to": ["n8", "F"] },
    { "from": ["n3", "C"], "to": ["n8", "G"] }
  ]
}
```

(`disp/bg` needs no wires — its default color is the house dark. Note the
geometry wire `n3 → n8` alongside the hotspot chain: the same circle list is
tested for clicks *and* drawn, and every node in the chain runs per item.)

## 10. Pitfalls checklist

1. Wrong port letters — the #1 failure. Check §5; `math/sin` reads `V`, sliders
   emit `N`, circles emit `C`.
2. Geometry that never reaches `disp/draw` — invisible.
3. Inventing node types — unknown types load as `?` placeholders and error.
   Use only ids in §5 / NODE-CATALOG.
4. Constants buried in `values` that should be sliders.
5. Repeated node chains that one list would handle.
6. Cycles without a `state/delay`.
7. Degrees where radians belong (`math/rad` converts). The one exception is a
   camera's field of view, which *is* degrees.
8. Forgetting `"weft": "patch"` — plain graphs also paste, but the marker is
   the convention for chat interchange.
9. Coordinates invented for no reason — omit them.
10. In Custom JS: naming a port `code`/`mode`/`ins`/`outs`/`title`/`graph`,
    or using `Math.random()` (breaks determinism and export replay).
11. In 3D: a Draw per face instead of Project's shade list through one colour
    node; a Project per mesh instead of every mesh into one (the depth sort is
    per-Project); colouring straight from `S` with no Remap, so unlit faces go
    black; expecting a ghost preview from a `point3` output (there isn't one —
    project it first).

## 11. Delivery

Hand back one fenced JSON block, then one or two sentences naming the sliders
you exposed and what each does. The human pastes it, plays, and comes back with
adjustments — keep node ids stable across revisions when you can, so diffs stay
readable.
