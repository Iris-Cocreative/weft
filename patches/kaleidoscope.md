# Case study: the kaleidoscopic mandala (Phase 4 thesis demo)

**The question this patch answers:** PLAN Phase 4.5 — *take an existing
hand-coded animation from the IRIS library, re-express it as a patch, tweak it
by slider. Measure the feel.*

**The subject:** `art tests/mandala.html` (James, 2026) — a kaleidoscopic
particle mandala. ~200 lines of hand-written canvas JS: seeded particles
oscillating in a symmetry slice, a distance-threshold connection web, the slice
replicated `symmetry × mirror` times, HSL hue cycling, HTML sliders for
symmetry / speed / points, a trails toggle.

**The patch:** `patches/kaleidoscope.json` — **20 nodes, 32 wires.** It also
ships as the **Mandala** example in the Examples dropdown (same graph, inlined
in `js/examples.js` so smoke keeps it honest).

## How the translation went (the knob-extraction pattern, live)

The recipe from PLAN's standing answer ("can Weft explain existing code?")
worked exactly as written:

1. **The dataflow-shaped parts became nodes.** The four HTML sliders became
   four `params/slider` nodes — *less* code than the original's DOM wiring
   (which spent ~40 lines on labels and event listeners; on the loom, a slider
   is just a slider). `Math.random()` seeding became eight deterministic
   `sets/random` nodes, one per seed field; time-scaling became
   `input/time → math/expr`.
2. **The per-particle formula became one Custom JS node in "each" mode**
   (`slice points`) — six lines computing one point + hue from ten ports.
   List matching does what the original's `for (i…)` loop did: the node runs
   once per index, knobs repeat their single value. This is the Houdini
   pattern: the formula's magic numbers (base radius, oscillation, wobble)
   arrive as *ports fed by random lists*, not constants.
3. **The irreducible core became one Custom JS node in "list" mode**
   (`kaleidoscope`): the O(n²) connection scan and the symmetry×mirror
   replication. It emits four lists — line geometries + colours, dot
   geometries + colours — into two ordinary Draw nodes.

## The feel (what the thesis predicted, and what it didn't)

- **Iteration stopped costing tokens.** Symmetry 8 → 12, speed down, connect
  up: slider drags, live, no re-prompt, no rebuild. This is the entire Phase 4
  argument and it holds.
- **Causality is visible.** In the original, "what makes the colours drift?"
  means reading the render loop. On the loom it's a wire you can follow from
  Time into the code node's `TM` port — and a Panel anywhere along it.
- **Determinism came free and turned out to be a feature.** `sets/random`
  is seeded, so the mandala is the *same* mandala every load — shareable via a
  Share link as a reproducible piece. The original regenerates on every
  refresh.

## Gaps this study wrote into the roadmap (case-studies-as-gap-reports)

1. **No trails.** The original's `rgba(5,5,8,0.12)` fade-fill is a feedback
   buffer — previous frame as an image. Already on ROADMAP track 6; this is
   the second case study to want it. (Its absence changes the piece's
   character more than any other gap.)
2. **No radial-gradient paint.** The centre glow is inexpressible — the same
   paint & clip gap organic-nav found. ROADMAP track 6 / PLAN Phase 5.4.
3. **No cross-product list matching.** Replicating one geometry list by N
   slice angles wants `every-item × every-angle`; longest-list matching pairs
   them index-by-index instead. Grasshopper answers this with grafting/data
   trees (the known v2 item); today the replication had to live inside the
   code node. This is the sharpest *language* finding of the study.
4. **Per-item overhead on declare-heavy patches.** At defaults (70 points,
   8-fold symmetry ×2 mirror ≈ 3.7k draw items/frame) one evaluation costs
   ~22ms in the editor — ~half inside the two Draw nodes' per-item
   compute+coerce pass, ~half in the code node building 3.7k geometry objects.
   The original ran the same math at 120fps as flat loops. A drawList fast
   path for geometry/colour lists (skip per-item coercion when types already
   match) is the obvious first perf item when one becomes justified —
   ROADMAP track 0's "measure first" clause is hereby satisfied with a
   measurement.

## Verdict

The thesis holds: a real hand-coded piece re-expressed as a patch, *smaller*
than its source, with its parameters playable and its causality on the table.
The Custom JS node earned its place — two code nodes carry exactly the two
parts that are genuinely code (a formula and an O(n²) algorithm), and
everything around them is wires. Where the tool fought, it fought honestly:
trails, gradient paint, cross-product matching, and a perf ceiling — all now
named, three of them already on the roadmap before this study started.
