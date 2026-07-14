# organic-nav — the Holos nav, rebuilt as a Weft patch

`organic-nav.json` — 92 nodes, 141 wires, **no new nodes**. Load it with **Open**.
Reference artifact: `iris-webflow-scripts/organic-nav/index.html`
(lab.iriscocreative.com/organic-nav).

This was built as a forcing function: rebuild a real interface component with the
v0.5 library and let the gaps write the roadmap. The gap list at the bottom is
the actual output.

## What works

Hover spreads the two necks beside the active item; the bar re-centres as it
grows; click selects (teal + underline); labels brighten toward the cursor.
Every constant is a slider — pill height/width, resting gap, spread, follower
speed, label size, underline width, and the four brand colours.

## The two ideas that made it possible

**1. The shape is one bar minus ten circles.**
There is no Bézier node and no boolean geometry, so the continuous pill shape is
built as: one full-height rounded bar (rect + two end caps, in `--shape`) with
**background-coloured circles** painted over it — one above and one below each
gap — carving the pinched necks out. The fillet radius

```
r  = 3s²/(4R) + R/3          s = half-gap, R = cap radius (= H/2)
cy = ±(R/3 + r)
```

makes each circle tangent to the waist line **and** passing exactly through both
pill corners. So the waist pinches to exactly `R/3` at *any* stretch — the same
invariant the original's hand-derived Bézier maths guarantees, reached with
circles instead. It carves within the gap and nowhere else (verified by pixel
sampling: gap centreline reads `--shape`, above the waist reads `--bg`).

Cost: it only works on an opaque background. It cannot composite over an image.
That is a real limit, and it is the argument for a `path` kind + clipping.

**2. The layout smooths *positions*, not gaps.**
Exponential smoothing is linear, so `cumsum(smooth(gaps)) == smooth(cumsum(gaps))`.
That lets the patch compute each pill's **target x** in closed form and drop a
single `state/smooth` on the 6-item list — no cumulative-sum node needed, and
because state nodes key `_state` by the list-match index, **each pill eases
independently**. That one node replaces the original's entire tween rig
(`gapsStart`/`gapsTgt`/`startTime`/`easeInOut`/`requestAnimationFrame`), and it
is *better*: the original restarts one shared clock, so interrupting a hover
snaps. Here an interrupted hover just re-aims each follower.

## The cycle, and how it's broken

Layout depends on hover; hover depends on layout. `LM.evaluateGraph` does a
topological sort and **errors on cycles** (`'cycle detected'`), and `state/prev`
does not help — a delayed edge is still an edge. So hit-testing runs against the
**resting** layout, which is sound here for a non-obvious reason: with the bar
re-centred, an interior active pill's displacement is exactly zero (its two
neighbours spread away from *it*). The hovered pill therefore sits exactly on its
resting hit band. Only the two end items shift, by `SPREAD/2` (15px against a
56px half-band) — well inside tolerance.

This is luck, not a general solution. **Weft cannot express feedback**, and
interaction is a feedback loop. See gap 1.

## Gaps this exercise found, in priority order

1. **No feedback edge / 1-frame delay.** The blocker with the widest blast
   radius. Any interaction where the thing you point at moves in response is a
   cycle. Needs an explicit delay node the sort can cut (`state/prev` promoted to
   a real back-edge), or the evaluator tolerating one stale read per cycle.
2. **No text measurement.** Pill widths are a slider, so all six pills are the
   same width and long labels nearly overflow. Fix follows the `domList`
   precedent exactly: the host supplies `ctx.measureText`, identically in
   `viewport.js` and the export mount. Small, and it unblocks all UI work.
3. **No `path` geometry kind.** No cubic Béziers, so the necks are circular
   fillets. `path` (line/cubic/arc segments — i.e. what SVG `d` already is) pays
   for itself three times: real Béziers, **SVG import**, and an SVG render target.
4. **No clipping and no gradient paint.** The mouse-following teal glow (a
   radial gradient clipped inside the shape) is simply **absent from the patch** —
   it cannot be expressed. `drawList` items need an optional `clip` geom, and
   `fill` needs to widen from a colour to a paint.
5. **No data trees / graft.** `crv/interp` and `crv/polyline` take the *whole*
   point list, so "N curves each from M points" is impossible in one node. This
   is exactly what Grasshopper's data trees solve, and it is why the necks could
   not be splines.
6. **No list scan.** No Mass Addition with partial results (cumulative sum). The
   linearity trick above dodged it; the next patch may not be so lucky.
7. **No comparison/logic nodes.** Every conditional goes through `math/expr`
   (`X>=Y?1:0`). Works, but ~20 of the 92 nodes are Expression, which reads as
   the tool losing its own language.
8. **No literal list node.** Six labels = six `params/panel` nodes wired into one
   port. Six pill widths = six sliders. A Text List / literal-list node would
   erase ~12 nodes.
9. **No font control.** Canvas draws Inter only; no letter-spacing, no
   text-transform (labels are typed pre-uppercased), no Montserrat.
10. **No semantic/DOM output.** The production nav needs real `<a>`, Tab/Enter,
    focus ring, `aria-current`, and a mobile fallback. None of that is
    expressible. The mechanism already exists though — generalise `input/button`'s
    `domList`/`domState` declare-reconcile-report cycle from `kind:'button'` to
    `{tag, attrs, rect}`.

Gaps 1–4 are what stand between this and a component you could ship.

## Files

- `organic-nav.json` — the patch.
- Generator + headless validator live in the session scratchpad; the JSON is the
  artifact. Regenerate only if you want to change the construction wholesale —
  otherwise just edit in the editor.
