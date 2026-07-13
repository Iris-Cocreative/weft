# Events & state — design note (Phase 2)

Weft's identity feature: the web is stateful and interactive; Grasshopper is
neither. This note fixes the semantics *before* the nodes, so events and state
extend the dataflow model instead of puncturing it. The rules here are enforced
as CLAUDE.md invariant #8 and specified for users in NODE-SPEC.md §6–7.

## 1. Triggers are frame-latched booleans

A **trigger** is an ordinary `bool` flowing through ordinary wires that is
`true` for exactly one evaluated frame — the frame after the event fired.
This is Origami Studio's *pulse*, renamed to stay in Weft's vocabulary of
plain types (no new wire type, no event subscriptions, no callbacks).

Why this shape:

- **Pure dataflow survives.** The graph still evaluates top-to-bottom once per
  frame; a trigger is just data that happens to be briefly true. Every existing
  node (and every future one) composes with triggers for free — a trigger can
  be Merged, list-matched, inverted with an Expression, drawn as a flash.
- **Determinism survives.** Events are collected *between* frames by the host
  and latched into `ctx` before evaluation. Nothing fires mid-evaluation; a
  frame sees a consistent snapshot of the world.
- **Export survives.** No editor machinery is involved. The exported runtime
  latches the same events from the same DOM listeners.

Collapsing rule: multiple occurrences of the same event between two frames
collapse into one latched `true` (a press *and* release in one frame latch
both `pressed` and `released` — order within the frame is not represented).
At 60fps this is imperceptible; it keeps the model one-bit simple.

The adapter between the two boolean worlds is **Edge** (`state/edge`):
continuous bool in → rising/falling triggers out. Hover is continuous;
"the moment hovering began" is `Edge.R`.

## 2. State lives on the node instance

Nodes that remember (Counter, Latch, Sample & Hold, Timer, Smooth, Spring,
Previous Value) keep their memory on `node._state` — an underscore field,
so it is never serialized into saves, clipboard fragments, or exports
(the export carries the *graph*, and state rebuilds at runtime).

- **Reset = reload.** Loading a graph rebuilds node objects, so state resets.
  There is no hidden persistence; a patch always starts from its definition.
  (This is also why undo works: snapshots are pure graph JSON.)
- **Per-item state.** List matching runs a compute once per index — so a state
  node fed a 3-item list is *three independent machines*. The engine exposes
  the current match index as `ctx.i`; state nodes key their memory by it:
  `node._state[ctx.i]`. One Latch behind one Hotspot over three circles gives
  three independent toggles — list thinking extends to state untouched.
  Stale indices (a list that shrank) are simply ignored; memory is per-frame
  cheap and vanishes on reload.

## 3. The host input contract

`ctx` is assembled identically by the two hosts (editor viewport and exported
runtime). Phase 2 extends it with:

| field | shape | notes |
|---|---|---|
| `dt` | seconds since previous frame | clamped ≤ 0.1 so tab-switches don't explode springs |
| `i` | current list-match index | set by the engine per compute call |
| `mouse.pressed` / `mouse.released` | frame-latched bools | complement the continuous `mouse.down` |
| `keys` | `{down, pressed, released}` — maps keyed by lowercase `event.key` (`' '` → `'space'`) | `down` is continuous; the others are frame-latched |
| `scroll` | `{y, max, v}` — scroll offset px, max scrollable px, velocity px/s | see §5 |
| `domList` | per-frame list of DOM element requests | see §4 |
| `domState` | persistent map: element id → `{down, clicks}` | host-owned, survives across frames |

Editor-only difference: the viewport scopes pointer events to the cloth and
ignores keys while a text field has focus; the export listens on `window`.
Semantics are otherwise byte-identical — the patch cannot tell where it runs.

## 4. Real DOM elements: the `domList` mechanism

The Button node renders a *real* `<button>` overlaid on the canvas — real
focus, real accessibility, real :active. But computes may not touch the DOM
(invariant #1). The resolution mirrors `drawList`:

1. The compute *declares* — pushes `{id, kind:'button', label, x, y}` into
   `ctx.domList` (id = `nodeId:matchIndex`, so lists of buttons work).
2. The host *reconciles* after each frame — creates/updates/removes elements
   to match the list, positioned in centered canvas coordinates.
3. The host *reports back* — element events accumulate in `ctx.domState[id]`
   (`down`, monotonic `clicks` counter); the compute derives its frame-latched
   `clicked` by comparing the counter against the count it last saw
   (kept in `node._seen`).

This is deliberately general: future DOM output nodes (sliders for
editor-embedded exports, text inputs, didactic-interface elements from
ROADMAP §7) reuse the same declare/reconcile/report cycle without new
engine surface.

## 5. Scroll: real on the page, simulated on the cloth

The Scroll node outputs `Y` (px), `N` (0..1 of the scrollable range), and `V`
(px/s). In an export these come from the actual page (`window.scrollY` against
`scrollHeight − innerHeight`). The editor has no page to scroll, so the cloth
simulates one: wheel over the preview scrubs a virtual 3000px page, with a
slim indicator on the right edge while scrolling. A patch tuned against the
simulator behaves identically on a real page because both feed the same
normalized contract.

## 6. Hotspot: every drawn shape is an interface element

`input/hotspot` takes *any geometry* and outputs `H` (hover), `D` (pressed on
it and still over it), `C` (clicked — press began on it *and* release happened
on it, the standard button armed/fire cycle, per list index). Hit testing is
`LM.pointInGeom`: point-in-polygon through `toPoly` for closed shapes,
distance-to-stroke with a ~6px pad for open curves and points, a box for text.

Feedback loop note: geometry that *reacts* to its own hotspot (grows on hover)
would cycle. Standard resolutions, in preference order: test the base geometry
and draw the reactive copy (hit area stays honest), or break the cycle with
Previous Value. The examples model the first.

## 7. Deliberately not built (yet)

- **Event queues / sub-frame ordering** — collapse-to-latch is the model until
  a real patch proves it insufficient.
- **A trigger wire type** — triggers stay bools on purpose; a distinct type
  would split the node library into two incompatible halves.
- **Wireless broadcast** (Origami) — solves wire spaghetti, but hides
  causality; Weft's whole bet is visible causation. Groups/frames first.
- **Persistent state across sessions** — state resets on load by design;
  "save the counter" is a future data node, not a default behavior.
