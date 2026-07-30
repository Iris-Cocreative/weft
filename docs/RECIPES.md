# Weft recipes — task → node chain

The cookbook: "how do I…" answered as wiring. Chains read left→right;
`node(port)` names the exact port. Port letters and defaults: `NODE-CATALOG.md`
(or LLM-AUTHORING.md §5). Every recipe assumes the result ends at `disp/draw` —
geometry that reaches no Draw node is invisible.

## Motion

- **Breathe / pulse** — `input/time(T) → math/sin(V→R) → math/remap(V, S0:-1 S1:1
  T0:min T1:max → R) → crv/circle(R)`. Remap is how a ±1 wave becomes any range.
- **Spin** — `input/time(T) → math/mul(A, B:speed → R) → xf/rotate(A)`. Radians;
  B≈0.5 is a slow turn.
- **Play with time like a turntable** (slow / speed / reverse live) —
  `params/slider(min:-2 max:2 value:1) → input/turntable(R) → T` feeds whatever
  Time fed. Turntable *integrates* the rate, so dragging the slider bends time
  from where it is — scaling `input/time` with a multiply would teleport instead.
- **Orbit** — `input/time(T) → math/mul → vec/polar(A, R:radius → P)`.
- **Ease toward a target** (cursor follower) — `… → state/smooth(V, S:stiffness
  → R)`. Higher S = snappier.
- **Springy follow** — `… → state/spring(V, F:frequency D:damping → R)`. D<0.3
  wobbles, D≈1 settles.
- **Wobble / organic drift** — `input/time(T) → math/noise(X → N) → remap`.
  Noise of a slowly-growing X is a smooth random walk.
- **After a click, animate for 2s** — `input/hotspot(C) → state/timer(T → S, A)`
  → use S (seconds since) inside `math/expr`, gate with A.

## Shape

- **Regular shapes** — `crv/circle` `crv/polygon(N sides)` `crv/rect`
  `crv/ellipse` `crv/arc(A0,A1 radians)`.
- **Free curve through points** — points list → `crv/interp(V, C:closed)`
  (spline) or `crv/polyline(V)` (straight).
- **Rose / parametric curve from math** — `sets/range(A:0 B:6.2832 N:256 → R)`
  as θ → per-angle math (`math/expr` or `meta/js`) → `vec/polar` or
  `vec/construct` → `crv/polyline(V, C:true)`.
- **A shape no node knows** — wrap the formula in `meta/js` ("each" mode), θ in,
  point out, knobs promoted to input ports fed by sliders. See LLM-AUTHORING §7.
- **Points along any curve** — `crv/divide(C, N → P, T, V)`; one point at t:
  `crv/eval(C, T → P, V, N)`. V is the unit tangent, N the normal — wire N into
  `vec/amp` and add it to P to push points off the curve, or into `math/atan2`
  to turn things along it. `values.mode:'length'` on Divide spaces by px instead
  of by count.
- **Concentric / nested copies** — `sets/series → xf/scale(F)` — one shape wired
  once, scaled per item.
- **Symmetry** — `xf/mirror(G, A, B)` reflects across the line A→B; wire the
  original and the reflection into one `disp/draw` (or `sets/merge`) to keep
  both halves. Two mirrors at an angle give you a kaleidoscope.
- **A row or field of identical copies** — `xf/tile(G, V1, N1, V2, N2 → G, I, J)`.
  Only for *identical* copies: if the cells differ, use `vec/grid` + list
  matching instead (that is the whole point of principle 6).

## Curve surgery

- **Where do these two curves cross?** — `crv/intersect(C1, C2 → P, T1, T2)`.
  T1/T2 are parameters, so they feed straight back into `crv/eval` — that is how
  you get the tangent *at* a crossing. `values.mode:'self'` finds where one
  curve crosses itself (the cleanup `crv/offset` cannot do for you).
- **Cut a curve with another** — `crv/trim(C, X)`, mode `outside` / `inside` /
  `split`. Inside and outside need a closed cutter; `split` just hands you every
  piece.
- **Add, subtract and overlap shapes** — `crv/region(A, B)`, mode
  `union` / `intersection` / `difference`. Closed regions only, and there are no
  holes: a cutter entirely inside A returns A untouched.
- **Round the corners** — `crv/fillet(C, R, N)`. Works on any curve, since
  everything becomes a polyline first.
- **Glue segments into one curve** — `crv/join(C, T)` chains curves whose ends
  meet within T px; a chain that closes comes back closed.
- **Attractors** — `crv/closest(C, P → P, T, D)`; wire D into
  `math/remap` and out into a radius, hue or width. One curve, a grid of points,
  and the whole field responds.
- **Measure a shape** — `crv/length` · `crv/area` (area + centroid) ·
  `crv/bbox` (per item, or one box round the whole list) ·
  `crv/incurve` (is this point inside?) · `crv/hull` (the rubber band round a
  point cloud).

## 3D

The whole idiom is four nodes, and the last one is an ordinary Draw:
**something 3D → `d3/project` → a colour from its shade → one `disp/draw`.**
Project emits ordinary 2D geometry already sorted back to front, so nothing
downstream knows 3D happened.

- **Turn any 2D shape into a solid** — `d3/extrude(G, H, C:cap)`. Every curve node
  in the library is now a modelling tool: Polygon, Region Boolean, Offset,
  Convex Hull, a spline through mouse-driven points — extrude any of them.
  `d3/revolve(G, N, A)` spins a profile about the world y axis instead.
- **Shade it** — `d3/project(G, C:camera, L:light → F, S, D)`, then
  `S → math/remap(0..1 → 0.1..0.7) → disp/hsl(L) → disp/draw(F)`. F, S and D are
  index-aligned lists, so list matching paints every face from one Draw. Remap
  first: a bare Lambert shade puts unlit faces at 0, i.e. black.
- **Let people turn it** — `d3/orbit(T, D, A:yaw E:pitch)`: drag the cloth to
  orbit, wheel to pull back. A and E are the *resting* angles the drag adds to,
  and they come back out as numbers, so other things can follow the view.
- **Wire every mesh into ONE Project.** Its `G` takes the whole list, which is
  what makes the depth sort global — two solids interleave correctly. Two Project
  → Draw pairs paint in topological order instead (which is what you want for a
  floor that is always behind everything).
- **Wireframe** — the same Project, `values.mode:'wire'` (every unique edge once)
  or `'both'` (faces with their front-facing edges over them).
- **Per-face effects before the camera** — `d3/faces(G → F, N:normals, C:centroids)`.
  Move each face along its own normal for an exploded view; drive a hue from a
  centroid's height.
- **A 2D shape lifted off the plane** — `d3/move3(G, T)` on any 2D geometry
  returns `poly3`, so stacking flat layers in depth is one node.
- **A lattice in space** — `d3/grid3(P, S, NX, NY, NZ → P, I, J, K)`; the three
  index outputs are the per-item keys, exactly as `vec/grid`'s K is in 2D.
- **Scale in 3D without a mode toggle** — `d3/scale3`'s factor is a `point3`, and
  a bare number coerces to all three components, so one wire is uniform scaling
  and three components is not.
- **Seeing 3D before you project it** — you don't. `point3` outputs get no ghost
  preview, and neither do `mesh` or `poly3` ones: an unprojected 3D value has no
  screen position, and ghosting it would lay every intermediate solid flat over
  the scene you actually rendered. Send it through Project (points come out as
  dots), wire the mesh into Draw on purpose for a flat front elevation, or read
  the numbers in a `params/panel`.

## Lists & fields

- **N things in a row** — `sets/series(S:start N:step C:count → S) →
  vec/construct(X)`.
- **A grid of things** — `vec/grid(S:spacing → P, C:col R:row K:colour-class)`;
  `values.iso:true` for a triangular lattice. K 3-colours the iso grid.
- **Vary each item by its index** — Series feeds both the position *and* any
  per-item parameter (radius, hue) — longest-list matching lines them up.
- **Random scatter** — `sets/random(N A B S:seed → R)` twice (different seeds) →
  `vec/construct(X, Y)`.
- **Keep every 3rd item** — `sets/cullpat(L, P:[true,false,false])` — the
  pattern repeats.
- **Split a list by condition** — `math/cmp → sets/dispatch(L, P → A, B)`.
- **One item from a list** — `sets/item(L, i → E)`.

## Interaction

- **Hover / click any shape** — geometry → `input/hotspot(G → H:hover D:down
  C:clicked)`. C is a one-frame trigger.
- **Toggle on click** — `hotspot(C) → state/latch(T → B)`. Per item: a list of
  shapes through one hotspot+latch is N independent toggles.
- **Count clicks** — `hotspot(C) → state/counter(U → N)`.
- **Freeze a value at an event** — `state/sample(V, T:trigger → R)`.
- **Key press** — `input/keyboard(K:"space" → D held, P pressed, R released)`.
- **Scroll-driven scene** — `input/scroll(N: 0–1 → math/remap)` drives anything;
  exports read the real page scroll.
- **Cursor position** — `input/mouse(X, Y)` centered px; NX/NY normalized 0–1.
- **A real button / link over the canvas** — `input/button(L:label P:position)`
  or `disp/element(G:rect T:"a" C:text A:"href=…")` — real DOM, real focus ring.

## Color

- **Color from a number** — `disp/hsl(H 0–1, S, L → C)` — wire a normalized
  value into H for rainbow-by-index, or L for brightness-by-state.
- **Blend two colors** — `disp/gradient(T 0–1, A, B → C)`.
- **Hand-picked color** — `params/swatch(→ C)` into `disp/draw(S stroke /
  F fill)`. A fill with a:0 is skipped.

## Feedback (state that reads itself)

- **Chase / trail toward last frame** — `math/lerp(A:current, B:target, T) →
  state/delay(V) → back into lerp(A)`. Cycles are legal only through Delay.
- **Hover that moves the thing being hovered** — layout → hotspot → response →
  `state/delay` → layout. One frame of latency, no explosion.
- **Streaming pen trails** — `disp/trace(V:values P:pen D:direction L:length)`.

## Text

- **Draw text** — `disp/text(T, P, S → G)` → draw. Measure first with
  `disp/measure(T, S → W, H, G)` when layout depends on width.
- **Several labels from one node** — `params/textlist` (one per line) → text/
  element — list matching places each.

## Audio

- **A tone** — `audio/osc(F:Hz → A) → audio/gain(In, G:0.1) → audio/out(In)`.
  Sound starts after the first user gesture; every out passes a master limiter.
- **In-key pitch from any number** — `math/remap → audio/scale(V → F Hz)` —
  mouse becomes an instrument. `audio/note(N, O)` picks exact notes.
- **A chord from one oscillator** — a 3-item list into `audio/osc(F)` is three
  voices.
- **React visuals to the mic** — `audio/mic(→ V loudness) → state/smooth →
  remap` → anything.
- **Sing a note, hear it in key** — `audio/pitch(→ M fractional midi) →
  audio/scale(V → F) → audio/osc` — the graph harmonizes with you; gate on
  `C` clarity to ignore silence. Pitch In is a processor too: wire any
  audio into its `In` (unwired = mic fallback).
- **Play computer audio through the graph** — `audio/track(→ A) →
  audio/filter → audio/out`; share a *different* tab and tick "also share
  audio", or it feeds back. `V` is loudness for visuals.
- **Goniometer** — `audio/track(L → xyscope X, R → xyscope Y)`: the stereo
  field draws itself (mono = diagonal line, wide mix = blooming figure).
- **Spectrum visualizer** — `audio/fft(In, N:12 → B list) → math/remap →
  crv/circle(R)` with `sets/series → vec/construct` for positions: list
  matching turns N band levels into N pulsing shapes. Colour by pitch:
  `audio/pitch(M) → remap → disp/hsl → Draw F`.
- **See the wave** — tap any audio wire into `audio/scope(In → G)`; XY figures:
  `audio/xyscope(X, Y)`. Geometry as sound: `audio/path(G → X Y)`.

## Housekeeping

- **Expose a knob** — `params/slider` `values: {min, max, value, label,
  mode:"int"?}`. Sliders are the interface; bury nothing that wants playing.
- **Inspect a wire** — `params/panel` (values), `params/graph` (plot),
  `params/timegraph` (history). Double-click any wire → Relay pill.
- **Reuse a working rig** — select → Ctrl+G collapses it to a named cluster;
  duplicate the cluster, not the nodes.
- **Share** — the Share button packs the whole graph into a URL hash
  (zero-backend). Export JS compiles it to a standalone file for any page:
  attach with `<canvas data-weft>`.
- **When no node fits** — `meta/js`, LLM-AUTHORING §7. Code runs on the machine
  that opens the graph — label shared patches.
