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
- **Points along any curve** — `crv/divide(C, N → P, T)`; one point at t:
  `crv/eval(C, T)`.
- **Concentric / nested copies** — `sets/series → xf/scale(F)` — one shape wired
  once, scaled per item.

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
