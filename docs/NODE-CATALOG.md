# Weft node catalog

*Auto-generated from `js/nodes.js` by `test/gen-catalog.js` — do not edit by hand.*
*See `NODE-SPEC.md` for the semantics (types, list matching, graph JSON).*

## Input

### `input/button` — Button

A real button overlaid on the canvas at P — clicked trigger, held state, click count

| in | type | default | note |
|---|---|---|---|
| L | string | `"press"` | label |
| P | point | `{"x":0,"y":130}` |  |

| out | type | note |
|---|---|---|
| C | bool | clicked (trigger) |
| D | bool | held down |
| N | number | click count |

### `input/hotspot` — Hotspot

Turn any geometry into an interface element: hover / pressed / clicked (per list item)

| in | type | default | note |
|---|---|---|---|
| G | geometry |  |  |
| R | number | `8` | reach px (open curves) |

| out | type | note |
|---|---|---|
| H | bool | hovering |
| D | bool | pressed on it, still over it |
| C | bool | clicked (trigger) |

### `input/keyboard` — Keyboard

State of one key: held / pressed / released (key names like a, space, arrowleft, enter)

| in | type | default | note |
|---|---|---|---|
| K | string | `"space"` | key |

| out | type | note |
|---|---|---|
| D | bool | held down |
| P | bool | pressed (trigger) |
| R | bool | released (trigger) |

### `input/mouse` — Mouse

Pointer position (canvas-centered px + normalized 0..1) and button state

| out | type | note |
|---|---|---|
| X | number | x (centered px) |
| Y | number | y (centered px) |
| NX | number | x normalized 0..1 |
| NY | number | y normalized 0..1 |
| D | bool | pointer down |

### `input/scroll` — Scroll

Page scroll as a parameter — px, normalized 0..1, velocity (the editor simulates a page: wheel over the cloth)

| out | type | note |
|---|---|---|
| Y | number | scrolled px |
| N | number | normalized 0..1 |
| V | number | velocity px/s |

### `input/time` — Time

Seconds since start, frame count — P freezes it, R restarts it from zero

| in | type | default | note |
|---|---|---|---|
| P | bool | `false` | pause |
| R | bool | `false` | restart (trigger) |

| out | type | note |
|---|---|---|
| T | number | seconds |
| F | number | frame |

### `input/turntable` — Turntable

Time as a record on a deck — R scales the spin (1 = realtime, 0.5 half-speed, 0 holds, negative plays backwards) and the platter integrates, so twisting the rate never jumps; Z rewinds to zero

| in | type | default | note |
|---|---|---|---|
| R | number | `1` | rate (−1 = reverse) |
| Z | bool | `false` | rewind (trigger) |

| out | type | note |
|---|---|---|
| T | number | seconds |

### `input/viewport` — Viewport

Canvas size in px (origin is the center)

| out | type | note |
|---|---|---|
| W | number | width |
| H | number | height |

## Params

### `params/anchor` — Anchor Point

A point pinned to the cloth (render canvas) — drag its handle there directly

| out | type | note |
|---|---|---|
| P | point |  |

Node values (`values` keys, not ports): `{"x":0,"y":0}`

### `params/toggle` — Boolean Toggle

True / false switch

| out | type | note |
|---|---|---|
| B | bool |  |

Node values (`values` keys, not ports): `{"on":true}`

### `params/button` — Button

Momentary push button — true while pressed, false again on release (an editor control, like the toggle)

| out | type | note |
|---|---|---|
| B | bool |  |

### `params/swatch` — Colour Swatch

Pick a colour

| out | type | note |
|---|---|---|
| C | color |  |

Node values (`values` keys, not ports): `{"hex":"#5eead4","a":1}`

### `params/curve` — Curve

Pass-through container — wire a source through it, or set it directly; swap the source later without rewiring downstream

| in | type | default | note |
|---|---|---|---|
| C | geometry |  | source (optional) |

| out | type | note |
|---|---|---|
| C | geometry |  |

### `params/graph` — Graph Data

Plots the data flowing through it — X alone draws the values over an automatic series from 0; X and Y together plot (x,y) points. Range fits the data, or wire two corner points A (min x,y) and B (max x,y) to pin it.

| in | type | default | note |
|---|---|---|---|
| X | number |  | receives whole list |
| Y | number |  | receives whole list |
| A | point |  | range corner (min x, min y) |
| B | point |  | range corner (max x, max y) |

| out | type | note |
|---|---|---|
| X | number |  |
| Y | number |  |

### `params/panel` — Note Pad

Inspect data flowing through, or type a value

| in | type | default | note |
|---|---|---|---|
| V | any |  | receives whole list |

| out | type | note |
|---|---|---|
| V | any |  |

Node values (`values` keys, not ports): `{"text":"hello weft"}`

### `params/number` — Number

Pass-through container — wire a source through it, or set it directly; swap the source later without rewiring downstream

| in | type | default | note |
|---|---|---|---|
| N | number | `0` | source (optional) |

| out | type | note |
|---|---|---|
| N | number |  |

### `params/slider` — Number Slider

Draggable number — shift-drag snaps to integers, double-click for label and rounding options

| out | type | note |
|---|---|---|
| N | number |  |

Node values (`values` keys, not ports): `{"min":0,"max":10,"value":5}`

### `params/point` — Point

Pass-through container — wire a source through it, or set it directly; swap the source later without rewiring downstream

| in | type | default | note |
|---|---|---|---|
| P | point | `{"x":0,"y":0}` | source (optional) |

| out | type | note |
|---|---|---|
| P | point |  |

### `params/relay` — Relay

Pass-through pill for organising wires — double-click any wire to drop one onto it

| in | type | default | note |
|---|---|---|---|
| V | any |  | receives whole list |

| out | type | note |
|---|---|---|
| V | any |  |

### `params/textlist` — Text List

A literal list of strings — one item per line

| out | type | note |
|---|---|---|
| L | string |  |

Node values (`values` keys, not ports): `{"text":"one\ntwo\nthree"}`

### `params/timegraph` — Time Graph

Seismograph — scrolls the values flowing through it across a rolling time window; each list item is its own coloured line (wire several sources into V for several lines)

| in | type | default | note |
|---|---|---|---|
| V | number |  | receives whole list |

| out | type | note |
|---|---|---|
| V | number |  |

### `params/vector` — Vector

Pass-through container — wire a source through it, or set it directly; swap the source later without rewiring downstream

| in | type | default | note |
|---|---|---|---|
| V | vector | `{"x":0,"y":0}` | source (optional) |

| out | type | note |
|---|---|---|
| V | vector |  |

## State

### `state/counter` — Counter

Counts triggers: up on U, down on D, back to zero on R

| in | type | default | note |
|---|---|---|---|
| U | bool | `false` | increment (trigger) |
| D | bool | `false` | decrement (trigger) |
| R | bool | `false` | reset (trigger) |
| S | number | `1` | step |

| out | type | note |
|---|---|---|
| N | number |  |

### `state/delay` — Delay

V from the previous frame — contributes no edge to the evaluation order, so wiring through it makes a feedback loop legal (layout → hover → layout)

| in | type | default | note |
|---|---|---|---|
| V | any |  | receives whole list |
| I | any | `0` | initial value (first frame) · receives whole list |

| out | type | note |
|---|---|---|
| V | any | V last frame |

### `state/edge` — Edge

Turns a continuous bool into triggers: R fires when B rises, F when it falls

| in | type | default | note |
|---|---|---|---|
| B | bool | `false` |  |

| out | type | note |
|---|---|---|
| R | bool | rose (trigger) |
| F | bool | fell (trigger) |

### `state/latch` — Latch

A switch with memory: each T trigger flips it, R forces it off

| in | type | default | note |
|---|---|---|---|
| T | bool | `false` | toggle (trigger) |
| R | bool | `false` | reset (trigger) |

| out | type | note |
|---|---|---|
| B | bool |  |

### `state/prev` — Previous Value

V from the previous frame (passes V through on the first frame)

| in | type | default | note |
|---|---|---|---|
| V | any |  |  |

| out | type | note |
|---|---|---|
| P | any |  |

### `state/sample` — Sample & Hold

Freezes V: holds the value it had when T last fired (initial value until then)

| in | type | default | note |
|---|---|---|---|
| V | any |  |  |
| T | bool | `false` | sample (trigger) |

| out | type | note |
|---|---|---|
| R | any |  |

### `state/smooth` — Smooth

Eased follower — glides toward V at speed S (bigger = snappier)

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |
| S | number | `8` | speed per s |

| out | type | note |
|---|---|---|
| R | number |  |

### `state/spring` — Spring

Springy follower — overshoots toward V; frequency F (Hz), damping D (1 = no bounce)

| in | type | default | note |
|---|---|---|---|
| V | number | `0` | target |
| F | number | `2` | frequency Hz |
| D | number | `0.5` | damping 0..1 |

| out | type | note |
|---|---|---|
| R | number |  |
| V | number | velocity |

### `state/timer` — Timer

Seconds since T last fired — T (re)starts from zero, P stops it

| in | type | default | note |
|---|---|---|---|
| T | bool | `false` | start / restart (trigger) |
| P | bool | `false` | stop (trigger) |

| out | type | note |
|---|---|---|
| S | number | seconds |
| A | bool | running |

## Maths

### `math/abs` — Absolute

Absolute

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/add` — Addition

Addition of A and B

| in | type | default | note |
|---|---|---|---|
| A | number | `0` |  |
| B | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/atan2` — ArcTangent 2

Angle of vector (X,Y) in radians

| in | type | default | note |
|---|---|---|---|
| X | number | `1` |  |
| Y | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/ceil` — Ceiling

Ceiling

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/clamp` — Clamp

Constrain V to [A,B]

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |
| A | number | `0` |  |
| B | number | `1` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/cmp` — Comparison

Compare A against B — pick the operator on the node (equality uses a tiny epsilon)

| in | type | default | note |
|---|---|---|---|
| A | number | `0` |  |
| B | number | `0` |  |

| out | type | note |
|---|---|---|
| R | bool |  |

Node values (`values` keys, not ports): `{"mode":"<"}`

### `math/cos` — Cosine

Cosine (radians)

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/deg` — Degrees

Radians → degrees

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/div` — Division

Division of A and B

| in | type | default | note |
|---|---|---|---|
| A | number | `0` |  |
| B | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/expr` — Expression

Evaluate an expression of X, Y, Z, T (time). Math functions available.

| in | type | default | note |
|---|---|---|---|
| X | number | `0` |  |
| Y | number | `0` |  |
| Z | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

Node values (`values` keys, not ports): `{"expr":"sin(X) * Y"}`

### `math/floor` — Floor

Floor

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/lerp` — Lerp

Linear interpolate A→B by T

| in | type | default | note |
|---|---|---|---|
| A | number | `0` |  |
| B | number | `1` |  |
| T | number | `0.5` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/logic` — Logic

Boolean logic on A and B — pick the operator on the node (not ignores B)

| in | type | default | note |
|---|---|---|---|
| A | bool | `false` |  |
| B | bool | `false` |  |

| out | type | note |
|---|---|---|
| R | bool |  |

Node values (`values` keys, not ports): `{"mode":"and"}`

### `math/masadd` — Mass Addition

Sum of all numbers in L, plus the running total at each item — the cumulative sum that turns a list of gaps into a list of positions

| in | type | default | note |
|---|---|---|---|
| L | number |  | receives whole list |

| out | type | note |
|---|---|---|
| R | number | sum |
| P | number | partial results |

### `math/max` — Maximum

Maximum of A and B

| in | type | default | note |
|---|---|---|---|
| A | number | `0` |  |
| B | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/min` — Minimum

Minimum of A and B

| in | type | default | note |
|---|---|---|---|
| A | number | `0` |  |
| B | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/mod` — Modulus

Wrapped remainder of A / B

| in | type | default | note |
|---|---|---|---|
| A | number | `0` |  |
| B | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/mul` — Multiplication

Multiplication of A and B

| in | type | default | note |
|---|---|---|---|
| A | number | `0` |  |
| B | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/neg` — Negative

Negative

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/noise` — Noise

Smooth 2D value noise, output 0..1

| in | type | default | note |
|---|---|---|---|
| X | number | `0` |  |
| Y | number | `0` |  |

| out | type | note |
|---|---|---|
| N | number |  |

### `math/phi` — Phi

F · φ (golden ratio, 1.618…)

| in | type | default | note |
|---|---|---|---|
| F | number | `1` | factor |

| out | type | note |
|---|---|---|
| P | number |  |

### `math/pi` — Pi

F · π

| in | type | default | note |
|---|---|---|---|
| F | number | `1` | factor |

| out | type | note |
|---|---|---|
| P | number |  |

### `math/pow` — Power

Power of A and B

| in | type | default | note |
|---|---|---|---|
| A | number | `0` |  |
| B | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/rad` — Radians

Degrees → radians

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/remap` — Remap Numbers

Map V from source domain [S0,S1] to target [T0,T1]

| in | type | default | note |
|---|---|---|---|
| V | number | `0.5` |  |
| S0 | number | `0` | source start |
| S1 | number | `1` | source end |
| T0 | number | `0` | target start |
| T1 | number | `100` | target end |
| C | bool | `true` | clamp |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/round` — Round

Round

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/sin` — Sine

Sine (radians)

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/smooth` — Smooth Step

Smooth interpolate A→B by T (eased)

| in | type | default | note |
|---|---|---|---|
| A | number | `0` |  |
| B | number | `1` |  |
| T | number | `0.5` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/sqrt` — Square Root

Square Root

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/sub` — Subtraction

Subtraction of A and B

| in | type | default | note |
|---|---|---|---|
| A | number | `0` |  |
| B | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `math/tan` — Tangent

Tangent (radians)

| in | type | default | note |
|---|---|---|---|
| V | number | `0` |  |

| out | type | note |
|---|---|---|
| R | number |  |

## Sets

### `sets/cullpat` — Cull Pattern

Keep items of L where the repeating bool pattern P is true

| in | type | default | note |
|---|---|---|---|
| L | any |  | receives whole list |
| P | bool | `true` | pattern · receives whole list |

| out | type | note |
|---|---|---|
| L | any |  |

### `sets/dispatch` — Dispatch

Route items of L into A or B by the repeating bool pattern P — the list-level if/else

| in | type | default | note |
|---|---|---|---|
| L | any |  | receives whole list |
| P | bool | `true` | pattern · receives whole list |

| out | type | note |
|---|---|---|
| A | any | pattern true |
| B | any | pattern false |

### `sets/item` — List Item

Pick item i from list L (index wraps)

| in | type | default | note |
|---|---|---|---|
| L | any |  | receives whole list |
| i | number | `0` |  |

| out | type | note |
|---|---|---|
| E | any |  |

### `sets/length` — List Length

Number of items in L

| in | type | default | note |
|---|---|---|---|
| L | any |  | receives whole list |

| out | type | note |
|---|---|---|
| N | number |  |

### `sets/merge` — Merge

Concatenate lists A and B

| in | type | default | note |
|---|---|---|---|
| A | any |  | receives whole list |
| B | any |  | receives whole list |

| out | type | note |
|---|---|---|
| M | any |  |

### `sets/random` — Random

N seeded random numbers in [A,B]

| in | type | default | note |
|---|---|---|---|
| N | number | `10` | count |
| A | number | `0` |  |
| B | number | `1` |  |
| S | number | `1` | seed |

| out | type | note |
|---|---|---|
| R | number |  |

### `sets/range` — Range

N steps across domain [A,B] → N+1 values

| in | type | default | note |
|---|---|---|---|
| A | number | `0` |  |
| B | number | `1` |  |
| N | number | `10` | steps |

| out | type | note |
|---|---|---|
| R | number |  |

### `sets/reverse` — Reverse List

Reverse the order of L

| in | type | default | note |
|---|---|---|---|
| L | any |  | receives whole list |

| out | type | note |
|---|---|---|
| R | any |  |

### `sets/select` — Select

Merge two lists item by item: where the repeating bool pattern P is true take from T, else from F — the list-level ternary (Dispatch’s inverse)

| in | type | default | note |
|---|---|---|---|
| T | any |  | if true · receives whole list |
| F | any |  | if false · receives whole list |
| P | bool | `true` | pattern · receives whole list |

| out | type | note |
|---|---|---|
| L | any |  |

### `sets/series` — Series

Arithmetic series: S, S+N, S+2N, … (C values)

| in | type | default | note |
|---|---|---|---|
| S | number | `0` | start |
| N | number | `1` | step |
| C | number | `10` | count |

| out | type | note |
|---|---|---|
| S | number |  |

### `sets/difference` — Set Difference

Distinct items of A that do not appear in B (order kept from A)

| in | type | default | note |
|---|---|---|---|
| A | any |  | receives whole list |
| B | any |  | receives whole list |

| out | type | note |
|---|---|---|
| D | any |  |

### `sets/intersection` — Set Intersection

Distinct items that appear in both A and B

| in | type | default | note |
|---|---|---|---|
| A | any |  | receives whole list |
| B | any |  | receives whole list |

| out | type | note |
|---|---|---|
| I | any |  |

### `sets/union` — Set Union

Every distinct item that appears in A or B

| in | type | default | note |
|---|---|---|---|
| A | any |  | receives whole list |
| B | any |  | receives whole list |

| out | type | note |
|---|---|---|
| U | any |  |

### `sets/shift` — Shift List

Offset all items in L by S places — W wraps shifted items round, off drops them

| in | type | default | note |
|---|---|---|---|
| L | any |  | receives whole list |
| S | number | `1` | shift offset |
| W | bool | `true` | wrap |

| out | type | note |
|---|---|---|
| L | any |  |

## Vector

### `vec/amp` — Amplitude

Scale vector V to length A

| in | type | default | note |
|---|---|---|---|
| V | vector | `{"x":1,"y":0}` |  |
| A | number | `1` | length |

| out | type | note |
|---|---|---|
| V | vector |  |

### `vec/angle` — Angle

Angle of the vector from A to B (radians)

| in | type | default | note |
|---|---|---|---|
| A | point | `{"x":0,"y":0}` |  |
| B | point | `{"x":100,"y":0}` |  |

| out | type | note |
|---|---|---|
| R | number |  |

### `vec/construct` — Construct Point

Point from X and Y

| in | type | default | note |
|---|---|---|---|
| X | number | `0` |  |
| Y | number | `0` |  |

| out | type | note |
|---|---|---|
| P | point |  |

### `vec/deconstruct` — Deconstruct

Split point into X and Y

| in | type | default | note |
|---|---|---|---|
| P | point | `{"x":0,"y":0}` |  |

| out | type | note |
|---|---|---|
| X | number |  |
| Y | number |  |

### `vec/distance` — Distance

Distance between points A and B

| in | type | default | note |
|---|---|---|---|
| A | point | `{"x":0,"y":0}` |  |
| B | point | `{"x":0,"y":0}` |  |

| out | type | note |
|---|---|---|
| D | number |  |

### `vec/grid` — Grid

Point lattice filling a W×H region, square or isometric — wire Viewport into W/H for a grid that always fills the canvas

| in | type | default | note |
|---|---|---|---|
| P | point | `{"x":0,"y":0}` | centre |
| S | number | `40` | spacing |
| W | number | `800` | region width |
| H | number | `600` | region height |

| out | type | note |
|---|---|---|
| P | point |  |
| C | number | column |
| R | number | row |
| K | number | colour class — 2 square · 3 iso |

Node values (`values` keys, not ports): `{"iso":true}`

### `vec/polar` — Point Polar

Point at angle A (radians) and radius R from origin O

| in | type | default | note |
|---|---|---|---|
| O | point | `{"x":0,"y":0}` | origin |
| A | number | `0` | angle (rad) |
| R | number | `100` | radius |

| out | type | note |
|---|---|---|
| P | point |  |

### `vec/pt2vec` — Point to Vector

Reinterpret a point as a translation vector (origin → point)

| in | type | default | note |
|---|---|---|---|
| P | point | `{"x":0,"y":0}` |  |

| out | type | note |
|---|---|---|
| V | vector |  |

### `vec/reverse` — Reverse

Flip vector V

| in | type | default | note |
|---|---|---|---|
| V | vector | `{"x":1,"y":0}` |  |

| out | type | note |
|---|---|---|
| V | vector |  |

### `vec/unit` — Unit Vector

Normalize V to length 1

| in | type | default | note |
|---|---|---|---|
| V | vector | `{"x":1,"y":0}` |  |

| out | type | note |
|---|---|---|
| V | vector |  |

### `vec/vec2pt` — Vector 2Pt

Vector from point A to point B (optionally unitized)

| in | type | default | note |
|---|---|---|---|
| A | point | `{"x":0,"y":0}` |  |
| B | point | `{"x":100,"y":0}` |  |
| U | bool | `false` | unitize |

| out | type | note |
|---|---|---|
| V | vector |  |
| L | number | length |

### `vec/vecxy` — Vector XY

Vector from X and Y components

| in | type | default | note |
|---|---|---|---|
| X | number | `0` |  |
| Y | number | `0` |  |

| out | type | note |
|---|---|---|
| V | vector |  |

## Curve

### `crv/arc` — Arc

Arc at P from angle A0 to A1 (radians)

| in | type | default | note |
|---|---|---|---|
| P | point | `{"x":0,"y":0}` |  |
| R | number | `60` |  |
| A0 | number | `0` | start angle |
| A1 | number | `3.14159` | end angle |

| out | type | note |
|---|---|---|
| C | geometry |  |

### `crv/circle` — Circle

Circle at P with radius R

| in | type | default | note |
|---|---|---|---|
| P | point | `{"x":0,"y":0}` |  |
| R | number | `60` |  |

| out | type | note |
|---|---|---|
| C | geometry |  |

### `crv/divide` — Divide Curve

N division points along curve C (+ their parameters)

| in | type | default | note |
|---|---|---|---|
| C | geometry |  |  |
| N | number | `10` | segments |

| out | type | note |
|---|---|---|
| P | point |  |
| T | number | parameters |

### `crv/ellipse` — Ellipse

Ellipse at P with radii RX, RY, rotation A

| in | type | default | note |
|---|---|---|---|
| P | point | `{"x":0,"y":0}` |  |
| RX | number | `90` |  |
| RY | number | `50` |  |
| A | number | `0` | rotation (rad) |

| out | type | note |
|---|---|---|
| C | geometry |  |

### `crv/eval` — Evaluate Curve

Point on curve C at parameter T (0..1; wraps on closed curves)

| in | type | default | note |
|---|---|---|---|
| C | geometry |  |  |
| T | number | `0.5` |  |

| out | type | note |
|---|---|---|
| P | point |  |

### `crv/interp` — Interpolate

Smooth curve through points V

| in | type | default | note |
|---|---|---|---|
| V | point |  | vertices · receives whole list |
| C | bool | `false` | closed |

| out | type | note |
|---|---|---|
| C | geometry |  |

### `crv/line` — Line

Line between two points

| in | type | default | note |
|---|---|---|---|
| A | point | `{"x":-100,"y":0}` |  |
| B | point | `{"x":100,"y":0}` |  |

| out | type | note |
|---|---|---|
| C | geometry |  |

### `crv/offset` — Offset Curve

Offset C by distance D: positive grows closed curves outward, negative shrinks. Circles/arcs/lines stay exact; other kinds become polylines (miter joins)

| in | type | default | note |
|---|---|---|---|
| C | geometry |  |  |
| D | number | `10` | distance |

| out | type | note |
|---|---|---|
| C | geometry |  |

### `crv/polygon` — Polygon

Regular N-gon at P with circumradius R

| in | type | default | note |
|---|---|---|---|
| P | point | `{"x":0,"y":0}` |  |
| R | number | `60` |  |
| N | number | `6` | sides |
| A | number | `0` | rotation (rad) |

| out | type | note |
|---|---|---|
| C | geometry |  |

### `crv/polyline` — PolyLine

Straight segments through points V

| in | type | default | note |
|---|---|---|---|
| V | point |  | vertices · receives whole list |
| C | bool | `false` | closed |

| out | type | note |
|---|---|---|
| C | geometry |  |

### `crv/rect` — Rectangle

Rectangle centered at P

| in | type | default | note |
|---|---|---|---|
| P | point | `{"x":0,"y":0}` |  |
| W | number | `120` |  |
| H | number | `80` |  |
| A | number | `0` | rotation (rad) |

| out | type | note |
|---|---|---|
| C | geometry |  |

## Transform

### `xf/move` — Move

Translate geometry by vector T

| in | type | default | note |
|---|---|---|---|
| G | geometry |  |  |
| T | vector | `{"x":0,"y":0}` | translation vector |

| out | type | note |
|---|---|---|
| G | geometry |  |

### `xf/rotate` — Rotate

Rotate geometry by angle A (radians) around center C

| in | type | default | note |
|---|---|---|---|
| G | geometry |  |  |
| A | number | `0` |  |
| C | point | `{"x":0,"y":0}` | center |

| out | type | note |
|---|---|---|
| G | geometry |  |

### `xf/scale` — Scale

Scale geometry by factor F around center C

| in | type | default | note |
|---|---|---|---|
| G | geometry |  |  |
| F | number | `1` |  |
| C | point | `{"x":0,"y":0}` | center |

| out | type | note |
|---|---|---|
| G | geometry |  |

## Display

### `disp/bg` — Background

Set the canvas background colour

| in | type | default | note |
|---|---|---|---|
| C | color | `{"r":11,"g":14,"b":20,"a":1}` |  |

### `disp/hsl` — Colour HSL

Colour from hue, saturation, lightness (all 0..1; hue wraps)

| in | type | default | note |
|---|---|---|---|
| H | number | `0.5` |  |
| S | number | `0.7` |  |
| L | number | `0.6` |  |
| A | number | `1` |  |

| out | type | note |
|---|---|---|
| C | color |  |

### `disp/cymatics` — Cymatics

Chladni plate — sand grains shake off the vibrating regions and settle along the nodal lines of frequency F, so the figure reorganizes as the pitch changes; drive F from the same value feeding an oscillator. Flip R (button, trigger, toggle) to re-throw the sand.

| in | type | default | note |
|---|---|---|---|
| F | number | `220` | frequency Hz |
| P | point | `{"x":0,"y":0}` | centre |
| S | number | `320` | plate size px |
| N | number | `900` | grains |
| C | color | `{"r":94,"g":234,"b":212,"a":0.85}` | grain colour |
| W | number | `1` | grain size |
| R | bool | `false` | reset — any change re-throws the sand |

| out | type | note |
|---|---|---|
| P | point | grain points |

### `disp/draw` — Draw

Render geometry with stroke S, fill F, line width W

| in | type | default | note |
|---|---|---|---|
| G | geometry |  |  |
| S | color | `{"r":230,"g":237,"b":250,"a":1}` | stroke |
| F | color | `{"r":255,"g":255,"b":255,"a":0}` | fill |
| W | number | `1.5` | width |

| out | type | note |
|---|---|---|
| G | geometry |  |

### `disp/element` — Element

A real DOM element (link, heading, button…) laid over the canvas filling G’s bounds — real focus and semantics; hover / focus / click flow back as data

| in | type | default | note |
|---|---|---|---|
| G | geometry |  | placement (fills bounds of G) |
| T | string | `"a"` | tag |
| C | string | `""` | text content |
| A | string | `""` | attributes — k=v, newline or ; separated |

| out | type | note |
|---|---|---|
| H | bool | hovering |
| F | bool | focused |
| D | bool | held down |
| K | bool | clicked (trigger) |

### `disp/gradient` — Gradient

Blend colour A → B by T (0..1)

| in | type | default | note |
|---|---|---|---|
| T | number | `0.5` |  |
| A | color | `{"r":94,"g":234,"b":212,"a":1}` |  |
| B | color | `{"r":244,"g":114,"b":182,"a":1}` |  |

| out | type | note |
|---|---|---|
| C | color |  |

### `disp/harmonograph` — Harmonograph

The Victorian drawing machine, and the Vector Scope’s math twin — two damped pendulums (frequencies X and Y) swing a pen for T seconds: integer ratios give Lissajous figures, damping D nests them inward, phase H rotates the figure (wire Time for a slow spin). Pure numbers, no sound.

| in | type | default | note |
|---|---|---|---|
| X | number | `3` | x pendulum frequency |
| Y | number | `2` | y pendulum frequency |
| H | number | `0` | phase (rad) — wire Time to spin |
| D | number | `0.05` | damping (0 = pure lissajous) |
| T | number | `44` | swing time (s of pen travel) |
| P | point | `{"x":0,"y":0}` | centre |
| S | number | `320` | size px |
| C | color | `{"r":94,"g":234,"b":212,"a":0.8}` | pen colour |

| out | type | note |
|---|---|---|
| G | geometry | figure |
| P | point | pen points |

### `disp/measure` — Measure Text

Width and height of text T at size S px, plus its bounding rect centred at P — measured by the host with the same font Draw uses

| in | type | default | note |
|---|---|---|---|
| T | string | `"weft"` | text |
| S | number | `24` | size px |
| P | point | `{"x":0,"y":0}` | rect centre |

| out | type | note |
|---|---|---|
| W | number | width |
| H | number | height |
| G | geometry | bounding rect |

### `disp/text` — Text

Text geometry at point P — wire into Draw

| in | type | default | note |
|---|---|---|---|
| T | string | `"weft"` | text |
| P | point | `{"x":0,"y":0}` |  |
| S | number | `24` | size |

| out | type | note |
|---|---|---|
| G | geometry |  |

### `disp/trace` — Trace

Seismograph on the cloth — streams the values in V away from pen point P; L is the trail length in px (always true px), D sets direction and scroll speed (px/s); each list item is its own line (up to 16), coloured by C, values are px offsets across the trail

| in | type | default | note |
|---|---|---|---|
| V | number |  | values (px offset) · receives whole list |
| C | color |  | line colours · receives whole list |
| P | point | `{"x":0,"y":0}` | pen point |
| D | vector | `{"x":-60,"y":0}` | direction + speed px/s |
| L | number | `240` | trail length px |
| W | number | `1.5` | width |

| out | type | note |
|---|---|---|
| G | geometry | trace curves |

## Audio

### `audio/out` — Audio Out

The speaker — every handle wired in is mixed to the master volume V; sound starts after the first click or keypress (browser rule)

| in | type | default | note |
|---|---|---|---|
| In | audio |  | audio in · receives whole list |
| V | number | `0.8` | master volume |

### `audio/fft` — Bands

Spectrum analyser — splits the signal wired into In across N frequency bands (log-spaced 40 Hz–16 kHz, so each octave gets fair space) and outputs B as a LIST of levels 0..1, low to high. Wire B through Remap into circles, rects, anything — list matching builds the visualizer. S smooths over time (0 = twitchy, 0.9 = syrup).

| in | type | default | note |
|---|---|---|---|
| In | audio | `0` |  |
| N | number | `8` | bands |
| S | number | `0.75` | smoothing 0..0.99 |

| out | type | note |
|---|---|---|
| B | number | band levels 0..1 (list) |
| R | bool | signal wired |

### `audio/filter` — Filter

Biquad filter — pick the mode on the node; cutoff F Hz, resonance Q (per list item)

| in | type | default | note |
|---|---|---|---|
| In | audio |  | audio in |
| F | number | `800` | cutoff Hz |
| Q | number | `1` | resonance |

| out | type | note |
|---|---|---|
| A | audio | audio |

Node values (`values` keys, not ports): `{"mode":"lowpass"}`

### `audio/gain` — Gain

Scale a signal’s volume — per list item, so a list of voices gets a gain each (host-smoothed, no zipper noise)

| in | type | default | note |
|---|---|---|---|
| In | audio |  | audio in |
| G | number | `0.5` | gain 0..1 |

| out | type | note |
|---|---|---|
| A | audio | audio |

### `audio/mic` — Mic In

Microphone as signal and number — A routes the live mic into the graph (filters, scopes, effects; wear headphones, speakers feed back), V is the loudness (RMS, roughly 0..1, boosted by G) for driving visuals, R turns true when the mic is live. The browser asks permission once.

| in | type | default | note |
|---|---|---|---|
| G | number | `1` | boost |

| out | type | note |
|---|---|---|
| A | audio |  |
| V | number | level 0..1 |
| R | bool | mic ready |

### `audio/mix` — Mix

Sum every wired signal into ONE signal (multi-wire In, scaled by G) — the epicycle builder: mix a small fast circle into a big slow one and the Vector Scope draws rolling-circle figures

| in | type | default | note |
|---|---|---|---|
| In | audio |  | audio in (stacks) · receives whole list |
| G | number | `1` | gain 0..2 |

| out | type | note |
|---|---|---|
| A | audio | audio |

### `audio/noise` — Noise

White noise source (a shared looped buffer) — an audio handle out

| out | type | note |
|---|---|---|
| A | audio | audio |

### `audio/note` — Note

A musical pitch — pick the note on the node or wire N (0–12 semitones above C, 12 rolls into the next octave), set the octave O; F is the frequency in Hz (equal temperament, A4 = the graph tuning, 432 by default), M the MIDI number. A list of octaves is a chord of octaves.

| in | type | default | note |
|---|---|---|---|
| N | number | `-1` | note 0-12 (-1 = use picker) |
| O | number | `4` | octave |

| out | type | note |
|---|---|---|
| F | number | frequency Hz |
| M | number | midi note |

Node values (`values` keys, not ports): `{"note":9}`

### `audio/osc` — Oscillator

A tone at F Hz — pick the waveform on the node; the output is an audio handle (wire it toward Audio Out), not samples

| in | type | default | note |
|---|---|---|---|
| F | number | `220` | frequency Hz |
| D | number | `0` | detune cents |

| out | type | note |
|---|---|---|
| A | audio | audio |

Node values (`values` keys, not ports): `{"wave":"sine"}`

### `audio/path` — Path to Audio

Turn geometry into sound: the curve’s outline is resampled into a looped stereo waveform traced F times a second — wire X/Y to a Vector Scope and the beam draws your shape; wire either into the mix to hear it. Oscilloscope music, the Weft way.

| in | type | default | note |
|---|---|---|---|
| G | geometry |  | path to trace |
| F | number | `108` | loops per second (Hz) |

| out | type | note |
|---|---|---|
| X | audio | horizontal signal |
| Y | audio | vertical signal |

### `audio/pitch` — Pitch In

Hears the note — a pitch tracker for any signal: wire audio into In (an oscillator, Track In, a whole mix) or leave it unwired and it listens to the microphone instead (permission is only asked if nothing is wired). F in Hz, M the fractional MIDI number (wire it into Scale's V to snap in key), C how sure the tracker is (0..1, gate on it), R true once a source is live. Holds the last pitch through silence.

| in | type | default | note |
|---|---|---|---|
| In | audio | `0` |  |

| out | type | note |
|---|---|---|
| F | number | frequency Hz |
| M | number | midi (fractional) |
| C | number | clarity 0..1 |
| R | bool | source ready |

### `audio/scale` — Scale

Snap a continuous value to the nearest note of a scale — wire anything (mouse, noise, time) into V as a MIDI-ish number and get an in-key frequency out; the difference between a theremin and an instrument

| in | type | default | note |
|---|---|---|---|
| V | number | `57` | value (midi note, fractional ok) |

| out | type | note |
|---|---|---|
| F | number | frequency Hz |
| M | number | snapped midi |

Node values (`values` keys, not ports): `{"root":9,"scale":"pentatonic"}`

### `audio/scope` — Scope

Oscilloscope — taps the audio wire In (an analyser, never routed onward) and draws the actual waveform: T ms of signal, W×H px at P, trigger-locked on a rising zero crossing so the trace holds still. V is the drawn samples, L the RMS level.

| in | type | default | note |
|---|---|---|---|
| In | audio |  | audio in |
| P | point | `{"x":0,"y":0}` | centre |
| W | number | `320` | width px |
| H | number | `120` | height px (±1 fills it) |
| T | number | `20` | time window ms |
| C | color | `{"r":94,"g":234,"b":212,"a":0.95}` | beam colour |

| out | type | note |
|---|---|---|
| G | geometry | waveform |
| V | number | samples -1..1 |
| L | number | level 0..1 |

### `audio/track` — Track In

The computer's own sound as a source — the first click after this node appears opens the share picker: choose a tab or screen and tick "also share audio". A is the full stereo signal, L and R the split channels (L→X, R→Y on a Vector Scope = a goniometer); V / VL / VR are overall and per-channel loudness for visuals, S true while sharing. Share a different tab than Weft or it will feed back.

| in | type | default | note |
|---|---|---|---|
| G | number | `1` | gain |

| out | type | note |
|---|---|---|
| A | audio | stereo |
| L | audio | left |
| R | audio | right |
| V | number | level 0..1 |
| VL | number | left level |
| VR | number | right level |
| S | bool | sharing |

### `audio/xyscope` — Vector Scope

XY oscilloscope — signal X deflects the beam horizontally, Y vertically, plotting sound against sound: harmonic ratios draw Lissajous roses and knots. Taps only (never routed onward); ±1 fills the S×S square at P.

| in | type | default | note |
|---|---|---|---|
| X | audio |  | horizontal |
| Y | audio |  | vertical |
| P | point | `{"x":0,"y":0}` | centre |
| S | number | `300` | size px |
| T | number | `30` | time window ms |
| C | color | `{"r":94,"g":234,"b":212,"a":0.95}` | beam colour |

| out | type | note |
|---|---|---|
| G | geometry | figure |
| P | point | beam points |

## Meta

### `meta/cluster` — Cluster

A subgraph folded into one node — select nodes and choose “Collapse to cluster”; its ports are the wires that crossed the selection edge

Node values (`values` keys, not ports): `{"title":"cluster","ins":[],"outs":[],"graph":{"nodes":[],"wires":[]}}`

### `meta/js` — Custom JS

A code-block node — write a JS body against ports you declare; “each” runs per list item like any node, “list” receives whole lists. Graphs run code — share accordingly

Node values (`values` keys, not ports): `{"title":"custom js","mode":"each","ins":[{"name":"X","type":"number","default":1}],"outs":[{"name":"R","type":"number"}],"code":"return { R: X * 2 };"}`

### `meta/portin` — Port In

Inside a cluster: emits whatever list arrives at the cluster input port it is named after

| out | type | note |
|---|---|---|
| V | any |  |

Node values (`values` keys, not ports): `{"port":"A"}`

### `meta/portout` — Port Out

Inside a cluster: whatever arrives here leaves the cluster through the output port it is named after

| in | type | default | note |
|---|---|---|---|
| V | any |  | receives whole list |

Node values (`values` keys, not ports): `{"port":"A"}`

## Icon coverage

131 node glyphs + 2 category fallback(s) in `js/icons.js`. Full coverage.
