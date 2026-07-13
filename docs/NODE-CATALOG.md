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

Seconds since start, frame count

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

### `params/number` — Number

Pass-through container — wire a source through it, or set it directly; swap the source later without rewiring downstream

| in | type | default | note |
|---|---|---|---|
| N | number | `0` | source (optional) |

| out | type | note |
|---|---|---|
| N | number |  |

### `params/slider` — Number Slider

Draggable number

| out | type | note |
|---|---|---|
| N | number |  |

Node values (`values` keys, not ports): `{"min":0,"max":10,"value":5}`

### `params/panel` — Panel

Inspect data flowing through, or type a value

| in | type | default | note |
|---|---|---|---|
| V | any |  | receives whole list |

| out | type | note |
|---|---|---|
| V | any |  |

Node values (`values` keys, not ports): `{"text":"hello weft"}`

### `params/point` — Point

Pass-through container — wire a source through it, or set it directly; swap the source later without rewiring downstream

| in | type | default | note |
|---|---|---|---|
| P | point | `{"x":0,"y":0}` | source (optional) |

| out | type | note |
|---|---|---|
| P | point |  |

### `params/vector` — Vector

Pass-through container — wire a source through it, or set it directly; swap the source later without rewiring downstream

| in | type | default | note |
|---|---|---|---|
| V | vector | `{"x":0,"y":0}` | source (optional) |

| out | type | note |
|---|---|---|
| V | vector |  |

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

