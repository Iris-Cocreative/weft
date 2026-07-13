# Weft language specification (format 1)

The formal contract for graphs, nodes, types, and evaluation. Written for two
audiences at once: human contributors and LLMs authoring patches. The node
inventory lives in `NODE-CATALOG.md` (auto-generated — regenerate with
`test/gen-catalog.js`). Engine invariants for *changing* Weft itself are in
`../CLAUDE.md`; this file is about *using* the language.

## 1. Vocabulary

- **Patch / graph** — a JSON document of nodes and wires. The unit of creation,
  saving, sharing, and export.
- **Node** — an instance of a node *definition* (`type` refers to a def id like
  `"math/add"`). Holds position and literal `values`.
- **Wire** — connects one node's *output port* to another node's *input port*.
  An input accepts any number of wires (lists concatenate, §4); an output fans
  out to any number.
- **Port** — named, typed endpoint. Inputs without a wire fall back to
  `values[name]`, then to the def's `default`.

## 2. Graph JSON

```json
{
  "format": 1,
  "nodes": [
    { "id": "n1", "type": "params/slider", "x": 40, "y": 60,
      "values": { "min": 0, "max": 200, "value": 80 } }
  ],
  "wires": [
    { "from": ["n1", "N"], "to": ["n2", "R"] }
  ]
}
```

Rules:
- `format` — integer format version. Omitted = 1. Loaders migrate old formats
  forward; a graph with a *newer* format than the app is refused, not guessed.
- `id` — any string unique within the graph (`n1`, `n2`… by convention).
- `x`/`y` — canvas position. **Optional in authored patches**: pasting a patch
  whose nodes lack coordinates triggers automatic topological layout
  (dependency depth → columns). LLMs should omit positions rather than invent them.
- `values` — literals for unwired inputs, plus node-specific state (a slider's
  `min`/`max`/`value`). Everything in `values` must be JSON-serializable.
- `enabled` (optional, default true) — `false` bypasses the node: each output
  passes through the first same-type input untouched (n8n-style deactivation).
- `preview` (optional, default true) — `false` hides the node's ghost preview
  in the viewport. Rendering via Draw nodes is unaffected.
- Wires are `{from: [nodeId, outputPort], to: [nodeId, inputPort]}`. Cycles are
  invalid (the editor refuses them; the evaluator flags them as errors).
  **An input may receive any number of wires** — their lists concatenate in
  wire order before list matching (see §4). Outputs fan out freely.
- Unknown node `type`s are preserved and displayed as placeholder nodes — they
  error at evaluation, never crash. Forward compatibility is graceful.

### Patch fragments (clipboard / chat interchange)

Copying a selection produces the same shape with a marker:

```json
{ "weft": "patch", "format": 1, "nodes": [...], "wires": [...], "ext": [...] }
```

Paste accepts either form (fragment or full graph); ids are remapped on paste,
so id collisions between the clipboard and the canvas are impossible. This is
the standard way to hand a patch to or from an LLM: plain JSON in a chat.

`ext` (optional) lists incoming wires from nodes *outside* the fragment
(`from` ids are NOT remapped). On paste they reattach if the source node
exists in the target graph — so same-graph paste behaves like duplicate,
keeping input connections — and drop silently otherwise. LLM-authored patches
should omit `ext`.

## 3. Types

| type | runtime shape | literal editor |
|---|---|---|
| `number` | JS number | number field |
| `bool` | JS boolean | checkbox |
| `string` | JS string | text field |
| `point` | `{x, y}` | two number fields |
| `vector` | `{x, y}` — structurally a point; semantically a direction/translation | two number fields |
| `color` | `{r, g, b, a}` — rgb 0–255, a 0–1 | color picker + alpha |
| `geometry` | see §5 | none |
| `any` | passthrough | none |

**Coercion:** any output may wire into any input; values are coerced per item:
number↔bool (0=false), string→number (parse), anything→string (formatted),
number→point (`{x:v,y:v}`), point→number (magnitude), hex string→color,
number→gray color. Geometry and `any` pass through untouched. When no sensible
coercion exists the result is a neutral value (0, `{x:0,y:0}`, white), never an exception.

## 4. Lists — the core semantic

Every port value is a **list**. A bare literal is a one-item list.

- **Multi-wire merge:** when several wires feed one input, their lists
  concatenate in wire order — wiring an angle and its negation into one
  Rotate's angle input yields two rotated copies from a single node chain.
- **Longest-list matching:** a node's compute runs once per index up to the
  longest input list; shorter lists repeat their **last** item. Wiring a
  200-item Series into Circle's center makes 200 circles; a single number wired
  into radius applies to all of them.
- **Whole-list inputs:** inputs declared in the def's `listInputs` receive the
  entire list in one call (List Item, List Length, Merge, PolyLine's vertices…).
- **Flattening:** if a compute returns an array for an output, it is spread
  flat into the output list (Series emits its whole sequence; Divide Curve
  emits all division points). There are no nested lists / data trees in
  format 1 — flatten is the only merge rule.

## 5. Geometry kinds

Plain JSON objects; `point` doubles as drawable geometry (renders as a dot).

| kind | shape |
|---|---|
| (none) | point `{x, y}` |
| `line` | `{kind, a:{x,y}, b:{x,y}}` |
| `circle` | `{kind, cx, cy, r}` |
| `ellipse` | `{kind, cx, cy, rx, ry, rot}` |
| `rect` | `{kind, cx, cy, w, h, rot}` (centered) |
| `arc` | `{kind, cx, cy, r, a0, a1}` (radians) |
| `poly` | `{kind, pts:[{x,y}…], closed}` |
| `spline` | `{kind, pts, closed}` — Catmull-Rom through pts |
| `text` | `{kind, text, x, y, size}` |

Angles are radians everywhere. **Coordinates are centered**: (0,0) is the
middle of the canvas, +x right, +y down, units are CSS pixels.

## 6. Evaluation model

The whole graph evaluates every animation frame, in topological order.
Each node's compute is pure per-frame; persistent state (when it exists at all)
lives on the node instance, never in globals.

The evaluation context `ctx` provides:

| field | meaning |
|---|---|
| `t` | seconds since start |
| `dt` | seconds since the previous frame (clamped ≤ 0.1; 0 while the editor is paused) |
| `frame` | frame counter |
| `i` | current list-match index (see §4; state nodes key their memory by it) |
| `mouse` | `{x, y}` centered px · `{nx, ny}` normalized 0–1 · `down` · frame-latched `pressed` / `released` |
| `keys` | `{down, pressed, released}` — maps keyed by lowercase `event.key` (`' '` → `'space'`); `down` is continuous, the others frame-latched |
| `scroll` | `{y, max, v}` — scroll offset px, max scrollable px, velocity px/s (real page in exports; the editor simulates a 3000px page — wheel over the cloth) |
| `W`, `H` | canvas size in px |
| `drawList` | render items pushed by Draw nodes: `{geom, stroke, fill, width}` |
| `domList` | real-DOM-element requests pushed by nodes (Button): `{id, kind, label, x, y}` — the host reconciles actual elements |
| `domState` | host-owned persistent map: element id → `{down, clicks}` |
| `bg` | background color set by a Background node |
| `errors` | nodeId → message (cycle, thrown compute, unknown type) |

Rendering: `drawList` paints in graph topological order (later = on top).
A fill with `a: 0` is skipped; likewise strokes. Text uses fill, falling back
to stroke.

### Triggers & state (events)

A **trigger** is an ordinary `bool` that is `true` for exactly one frame — the
frame after its event fired (Origami's "pulse"). Ports whose label says
*(trigger)* emit or expect this shape; `state/edge` converts a continuous bool
(hover, key held) into rise/fall triggers. Multiple occurrences of one event
between frames collapse into a single latched `true`.

**State nodes** (Smooth, Spring, Counter, Latch, Sample & Hold, Timer,
Previous Value, Edge) remember across frames on `node._state`, keyed by
`ctx.i` — so a state node fed an N-item list is N independent machines
(three circles through one Hotspot and one Latch = three independent
toggles). State is never serialized: loading a graph resets it.

Full design rationale: `EVENTS-AND-STATE.md`.

## 7. Node definition contract (for node authors)

```js
defNode('cat/name', {
  title: 'Human Name',        // Grasshopper's name if an equivalent exists
  cat: 'Maths',               // existing category
  desc: 'One sentence.',      // tooltip + catalog
  inputs:  [{ name: 'A', type: 'number', default: 0, label: 'long name' }],
  outputs: [{ name: 'R', type: 'number' }],
  listInputs: [],             // inputs that take the whole list
  defaults: {},               // initial node.values (non-port state)
  compute: (a, ctx, node) => ({ R: a.A }),   // PURE — see rules
  buildBody: (node, el, changed) => {},      // editor-only, optional
  postEval:  (node, el, ctx) => {}           // editor-only, optional
});
```

Compute rules (they make export-to-JS possible — the tool's reason to exist):
1. Arrow/function expression only; it is serialized with `toString()`.
2. May reference only its parameters, `LM.*` helpers, and JS built-ins.
3. No DOM, no `Date.now()`, no `Math.random()` — use `ctx.t` and `LM.rng(seed)`.
4. Per-node caches go on underscore fields (`node._cache`); `values` stays JSON-safe.
5. Return an object keyed by output names; omit a key to emit nothing;
   return an array to emit multiple items (flattened, §4).
6. Guard undefined geometry inputs (`if (a.G === undefined) return {}`).
7. Clamp unbounded counts (see Series: 10 000 cap).
8. Cross-frame memory goes on `node._state` keyed by `ctx.i` (per list item),
   initialized lazily — a state node must behave sensibly from a cold start.
   Real DOM elements are *declared* via `ctx.domList` and read back via
   `ctx.domState`; computes never touch the DOM directly.

## 8. Authoring patches (human or LLM)

Minimal working patch — a slider-sized breathing circle (paste it into Weft):

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

Guidance:
- Every visible result needs a path ending in a **Display** node (`disp/draw`,
  `disp/bg`); geometry that reaches no Draw node is computed but invisible.
- Expose the parameters a human will want to *play with* as `params/slider` /
  `params/swatch` / `params/toggle` nodes rather than burying constants in
  `values` — sliders are the interface. Give them sensible `min`/`max`.
- Omit `x`/`y` and let auto-layout place things (or provide them if you have a
  deliberate spatial story; columns of ~250px reading left→right).
- Unwired inputs: set literals via `values` keyed by the input's port name.
- Check port names and types against `NODE-CATALOG.md` — port letters matter
  (`math/sin` input is `V`, `crv/circle` output is `C`).
- Prefer list-thinking: one Series driving many elements beats many nodes.

## 9. Compatibility promises

1. Format migrations are forward-only and automatic on load; saved graphs are
   never silently rewritten to older formats.
2. Node ids in the catalog are stable; renaming a node's `title` is allowed,
   renaming its `id` or ports is a breaking change and needs a format bump +
   migration.
3. Unknown node types load, display, and error gracefully (never crash a graph).
4. Exported JS is frozen at export time — it embeds its own runtime and never
   depends on the editor or future Weft versions.
