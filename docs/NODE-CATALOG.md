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

Plots the data flowing through it — X alone draws the values over an automatic series from 0; X and Y together plot (x,y) points. Range fits the data.

| in | type | default | note |
|---|---|---|---|
| X | number |  | receives whole list |
| Y | number |  | receives whole list |

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

## Icon coverage

109 node glyphs + 1 category fallback(s) in `js/icons.js`. Full coverage.
