# Weft — parametric designer for the web

A node-based graphics/animation/interaction creator inspired by Grasshopper (Rhino),
built to **output web-compatible vanilla JavaScript**. Weave input parameters
(mouse, time, page state) through a dataflow graph into live 2D graphics.

**Status: v0.17.2 — corner resize unblocked (+ resizable graphs w/ Time Graph options), relay dissolve heals wires, rounded selections, curated gallery order (Stonehenge first); corpus at 15.** v0.1 (2026-07-12): editor,
evaluator, 63 nodes, 4 examples, JS export, all verified in Chrome. v0.2
(same day, Phase 1 of PLAN.md): git repo, graph format versioning +
migration, undo/redo, marquee select, copy/paste of graph-JSON fragments with
auto-layout for LLM-authored patches, `docs/NODE-SPEC.md` language contract +
generated `docs/NODE-CATALOG.md`. v0.3 (same day, workshop pass): ghost
previews, disable/bypass, multi-wire inputs, readouts, anchors, palette
clustering. v0.4 (same day, Phase 2 of PLAN.md): **events + state** —
frame-latched triggers (Origami-pulse style), per-list-item state nodes
(Smooth, Spring, Counter, Latch, Sample & Hold, Timer, Previous Value, Edge),
Hotspot (any geometry → interface element via `LM.pointInGeom`), real-DOM
Button via `domList`/`domState`, Keyboard, Scroll (real page in exports,
simulated on the cloth), 88 nodes, 6 examples (Click toy, Scroll scene),
design note `docs/EVENTS-AND-STATE.md`, invariant #8 — editor and exports
verified interactive in Chrome. v0.5 (2026-07-13, Phase 2.5 of PLAN.md):
**sets & the Grasshopper bridge** — `docs/NODE-LIBRARY.md` (the articulated
library map), six new Sets nodes (Set Union / Intersection / Difference on a
shared `LM.setEq` equality predicate, plus Cull Pattern, Shift List, Dispatch),
Checker dispatch example, **GHX importer v1** (`tools/ghx-import.html`: paste a
Grasshopper .ghx → Weft patch; both GHX param styles, floating-param Source
wires, relay splicing, slider/swatch/panel values, pivot positions; unmapped GH
types import as `?` placeholders so every import doubles as a gap report —
verified against all 7 official GH demos), and the D1 silhouette option board
(`design/D1-silhouette.html`). v0.6 (2026-07-13): **the Figma design system**
— James designed the node card + colour systems + icons + custom nodes in
Figma; implemented as the new card (category gradient wash, icon + title +
preview-eye header, inputs-left/outputs-right band, inline dim readouts,
13px typed ports, 42px value fields), new category/type palettes, node glyphs
in `js/icons.js` (27×27, currentColor, category-dot fallback), and chromeless
Boolean Toggle / Number Slider / Colour Swatch / Note Pad (the control IS the
node). Decision log + tokens: `docs/DESIGN.md`. v0.7 (2026-07-14): **Grid**
(square/iso lattice + canonical colour class K, first mode-toggle node), Iso
field example, the organic-nav case study (92 nodes — the finding that wrote
Phase 3), `docs/OUTPUT-MODES.md`. v0.8 (2026-07-14, Phase 3 of PLAN.md):
**composition & the interface boundary** — **Clusters** (collapse a selection
into one named, nestable, exportable node; `meta/cluster` + `def.dynamic`,
inner graph evaluated through `ctx.defs`, Port In/Out boundary markers,
invariant #9), **Delay** (`feedback: true` defs cut from the topo sort — legal
feedback loops; invariant #8 amended; *Feedback chase* example), altitude
nodes (Comparison, Logic, Select, Mass Addition + partial sums, Text List,
Measure Text via host `ctx.measureText`), **Element** (real DOM
`{tag, text, attrs, rect}` over the canvas with hover/focus/click read back —
OUTPUT-MODES mode 2), zoom-to-fit (Fit / F / Home), Meta category (provisional
slate), 106 nodes. Proof: `patches/organic-nav-v2.json` — the 92-node nav is
now one 28-node **Organic Nav** cluster (nested Capsule Bar inside, real
`<a>` labels, `aria-current`), 3 nodes at top level; write-up
`patches/organic-nav-v2.md`. v0.8.1 (2026-07-15, workbench batch — James's
14-item spec): collapsed nodes (double-click a head → icon + ports),
**Relay** spliced in by double-clicking a wire (ports take the wire's
colour), GH wire semantics (drop replaces, shift-drop stacks), reliable
empty-click deselect, global navbar (About · Nodes · Loom), slider types
(label + int/decimal-precision/odd/even + shift = transient integer snap,
number-blue livery), Boolean Toggle redesign (bool-red, knob bottom=off /
top=on), swatch simplified, anchor-handle eye (Params teal), Time pause +
restart inputs/buttons, momentary **Button**, **Graph Data** (on-node plot),
and a draw-display eye on the loom — 109 nodes. v0.8.2 (2026-07-15, audio
experiment): new **Audio** category — Oscillator, Noise, Gain, Filter,
Audio Out. Sound as dataflow via the Element pattern: computes push
descriptors onto `ctx.audioList`, wires carry *handle* strings (samples never
touch wires), and a new host (`js/audio.js`, serialized into audio exports)
owns the `AudioContext` and reconciles a live Web Audio graph each frame
(smoothed params, teardown by reconcile, gesture unlock). List matching =
voices: a Series into one Oscillator is a chord (*Drone chord* example).
Continuous sound only — sequencing/ADSR are follow-ups — 114 nodes.
v0.8.3 (2026-07-15, instrument pass — from James's theremin session): **Note**
(pick note + octave → Hz/MIDI) and **Scale** (snap any continuous value to the
nearest note of a scale — mouse becomes an in-key instrument; *Theremin*
example), master bus **limiter** in the audio host (every Audio Out mixes
through a DynamicsCompressor brickwall — stacked voices can't blow out
speakers) + **mute button** in the preview HUD, **Trace rewritten to px-true
trails** (samples live at fixed px positions, L is always exactly L px, D only
sets direction/speed — no more fps- or pace-dependent length), **Graph Data
range pinning** (wire corner points A/B to fix the axes), merged-mode HUD
moved below the loom tools (fps counter no longer overlaps) — 116 nodes.
v0.8.4 (2026-07-16, sound in & sound seen — from James's keyboard-theremin
session): **432 Hz tuning** — Note/Scale derive Hz from `ctx.tuneA4` (432
default, HUD button toggles 432/440, saved in `graph.meta.tuneA4`, rides into
exports); **Note note-input** (wire N 0–12 to play it from data, 12 rolls into
the next octave); **Mic In** (`audio/mic`) — microphone loudness → number for
visuals via the new `ctx.audioState` read-back channel (analyser in the host,
never routed to speakers, stream stopped on drop); **Cymatics**
(`disp/cymatics`) — chladni-plate sand simulation: grains random-walk scaled by
local plate amplitude and settle on the nodal lines of F, modes rise with
pitch (deterministic via `LM.rng`); three examples — *Scale board* (labelled
scale rungs + marker + three real `<button>` drones from ONE list-matched
Element node), *Cymatics*, *Mic meter* — 118 nodes.
v0.8.5 (2026-07-16): **Scope** (`audio/scope`) — a real oscilloscope: taps any
audio wire through a host-side AnalyserNode (a tap, never routed onward),
time-domain samples flow back via `ctx.audioState` (`{wave, sr, ready}`), and
the compute draws a trigger-locked beam (rising-zero-crossing sync, T ms
window, ≤512 points, zero-volt graticule line) plus outputs the samples V and
RMS level L. *Oscilloscope* example: sawtooth → resonant lowpass on mouse X —
watch harmonics melt off the wave — 119 nodes.
v0.8.6 (2026-07-16): **Vector Scope** (`audio/xyscope`) — the XY mode: X
deflects the beam horizontally, Y vertically, plotting sound against sound
(Lissajous figures). Pure compute reuse: it declares TWO ordinary `scope`
taps and pairs the read-back buffers; no trigger needed (closed figures are
phase-stable). Scope taps also gained a zero-gain keep-alive leg to master so
a tapped branch that reaches no speaker still gets pulled by the audio graph.
*Oscilloscope* example now carries both instruments: a sine pair at a
slider-picked harmonic ratio (3:1 = trefoil), Y detuned +1 cent so the figure
slowly tumbles through its phases — 120 nodes.
v0.8.7 (2026-07-16, oscilloscope music): **Mix** (`audio/mix` — sum wired
signals into one, the epicycle builder), **Path to Audio** (`audio/path` —
any geometry's outline arc-length-resampled into a 512-sample looped stereo
waveform traced F times/sec; host `path` kind swaps buffer sources behind a
stable unity gain, X/Y share a shape-hash key so they rebuild phase-locked),
and **Harmonograph** (`disp/harmonograph` — the Vector Scope's math twin:
two damped pendulums, pure compute, no audio; integer ratios = Lissajous,
damping nests them, wire Time into phase to spin). Examples *Harmonograph*
(silent, math-only) and *Shape song* (polygon → Path to Audio → Vector
Scope + speaker: the shape and the timbre are the same signal) — 123 nodes.
Plus *Rose window*: the interval-as-flower vectorscope figures (looma-style)
— a rose r=cos(kθ) built from pure list math (Range → cos/sin/mul → PolyLine)
then beam-drawn via Path to Audio; k=2 = the 4-leaf clover, k=4 = 8 petals;
a k-rose is two partials at (k+1):(k−1) in quadrature — interval = flower.
v0.9 (2026-07-16, **Phase 4 of PLAN.md — LLM co-creation**): the graph as a
shared artifact human and model both edit. **Custom JS** (`meta/js`, the
second dynamic def) — a code-block node: declare ports on the node (add /
remove / retype in the body; renames prune wires via `Editor.rebuildNode`),
write a body that runs per item ("each", longest-list matching like any
native node) or once over whole lists ("list"); `ctx`/`node`/`LM` in scope,
Expression's trust boundary, *Superformula* example. **Share links** — the
whole graph deflated into the URL hash (`#w=`), zero-backend; open the link,
get the patch. **`docs/LLM-AUTHORING.md`** — the prompt-ready authoring spec
(defs-generated port reference, idioms, few-shots, pitfalls) +
**`docs/RECIPES.md`** (task → node-chain cookbook) + **`test/validate-patch.js`**
(headless patch checker: types, port letters, eval, visibility, export) +
the `/weft-patch` skill and Haiku `weft-guide` subagent in `~/.claude/`.
Thesis demo: `patches/kaleidoscope.{json,md}` — the hand-coded mandala art
test (~200 lines) as **20 nodes / 32 wires**, four sliders, two Custom JS
nodes carrying exactly the code-shaped parts; gaps logged (trails, radial
paint, cross-product matching, measured perf ceiling); also in the Examples
dropdown as *Mandala* (25 examples). Also fixed:
NODE-CATALOG + nodes.html had omitted Audio and Meta categories since
v0.8.2 — 124 nodes.
v0.9.1 (2026-07-16, listening): **Pitch In** (`audio/pitch`) — hears the
note: host `pitch` kind runs normalized autocorrelation on a half-rate
2048-window (60–1200 Hz, first-strong-peak picking so harmonics don't fool
it an octave down, parabolic lag refine, wobble-smoothed) → F Hz +
fractional MIDI M (from `ctx.tuneA4` — wire M into Scale V to snap a sung
note in key) + clarity C + ready R. **Track In** (`audio/track`) — the
computer's own sound as a source: `getDisplayMedia` needs a gesture, so the
share picker opens on the first click after the node appears (tick "also
share audio"; video track stopped immediately); routes A through the graph,
V loudness read-back. **Cymatics reworked**: grains now take a capped
Newton step down the amplitude gradient toward their *nearest* nodal line
(plus the amplitude-scaled shake) — the old pure random walk was diffusion,
which slowly leaked every grain into the biggest still basins (the
center-line collapse); new R input re-throws the sand on any flip
(button, trigger or toggle) — 126 nodes.
v0.9.2 (2026-07-16, signal plumbing): **Track In goes stereo** — A stays
the full stereo feed; new L/R outputs are split channels via a host
`chan` kind (ChannelSplitter behind per-channel unity gains; ready flag
renamed S). L→X, R→Y on the Vector Scope = a goniometer — the *Music
scope* example, whose meter dots breathe on the new **VL/VR per-channel
level outputs** (each splitter leg gets its own analyser — built for
visualizers; capture requests `echoCancellation/noiseSuppression/
autoGainControl: false, channelCount: 2` + `contentHint = 'music'` —
Chrome's default voice pipeline is mono and was collapsing the stereo
image). **Pitch In is a processor** — new In port analyses any
wired signal (scope-style tap with zero-gain keep-alive); unwired it
falls back to the microphone, and the permission prompt only fires if
nothing is wired. **Mic In gains A** — the live mic routes into the
graph (filters, scopes, effects; headphones advised).
v0.9.3 (2026-07-16, the visualizer kit): **Bands** (`audio/fft`) — the
spectrum tap: host `fft` kind (byte frequency bins normalized 0..1,
zero-gain keep-alive, per-node smoothingTimeConstant), compute groups
bins into N log-spaced bands 40 Hz–16 kHz and returns B as a LIST —
list matching turns twelve levels into twelve pulsing circles with no
extra plumbing. *Visualizer* example: one Track In listened to five
ways — Cymatics sand reorganizing to the melody (Pitch In reading
Track In, processor mode), 12 spectrum circles coloured by pitch via
HSL, the goniometer, VL/VR meter dots, and the speaker — 127 nodes.
v0.10 (2026-07-16, the playable loom + the weave assistant): **cloth
camera** — ctrl+wheel zooms the render toward the cursor (0.1–12×),
ctrl+drag / middle-drag pans, in split and merged view alike; strictly
view-only (the patch still evaluates at stage size, the mouse maps through
the inverse), so what the design computes never changes — a dashed teal
frame marks the real stage bounds whenever the camera is engaged, a HUD
chip shows the zoom % and resets on click, and the DOM overlay (Button /
Element) rides the same transform. **Turntable** (`input/turntable`) —
time as a record on a deck: R scales the spin (0.5 = half speed, negative
plays backwards), and because the platter *integrates* rate×dt, twisting
the rate bends time from where it is instead of teleporting; Z rewinds.
**Number → slider quick-add** — type `66` into the double-click search and
the first hit is a ready slider (0–100, int, set to 66); decimals set the
precision and the next power of ten sets the range (6.6 → 0–10, prec 1).
**Modifier arrow-stepping** — in any node number field, ↑/↓ steps ±1,
shift ±10, alt ±0.1. **The weave assistant** (`js/assistant.js` + ✦ on the
loom tools) — a chat panel that sends the message + full graph JSON +
selected node ids + live eval errors + an optional cloth snapshot to an
n8n webhook (`tools/n8n-weave-assistant.json`: key check → fetch the live
LLM-AUTHORING spec → Claude → parse), and applies the model's answer as
validated **graph ops** (add / set / delete / wire / unwire / replace) —
atomic (one bad op rejects the list, errors echo back into the chat),
one history step (Ctrl+Z reverts), auto-layout for coordless nodes.
Ships dormant: webhook URL + shared key live only in localStorage
(`weft:assistant`), so the public deploy carries no keys and no cost
surface; setup guide `docs/ASSISTANT.md` — 128 nodes, 28 examples.
v0.11 (2026-07-30, the geometry pass): the library could draw curves and
move them, but it could not **ask questions about them** — there was no dot
product, no cross product, no matrix compose, and no curve intersection
anywhere in the engine, which is the primitive Trim, Region Boolean and
offset cleanup all stand on. `js/engine.js` grew a polyline-analysis layer
underneath the node library — `segInt` / `polyInt` / `polySelfInt`,
`closestOnPoly`, `resample`, `splitPoly`, `polyLength` / `polyArea` /
`polyCentroid`, `convexHull`, `filletPoly`, `clipPoly` — plus the 2D and 3D
vector families, `matIdentity` / `matMul` / `matMirror` / `matSvd`, and an
arc-length curve layer (`curveTable`, `tableAt`, `tangentAt`, `curveLength`).
Several of those were already in the codebase as inlined duplicates and were
extracted rather than written. **Region Boolean is Greiner–Hormann written
out, not vendored** (invariant #7): degenerate contacts — a vertex sitting
exactly on the other outline, which breaks the algorithm's entry/exit
alternation — are dodged by nudging the clip polygon a ten-thousandth of a
pixel and retrying, and anything under a square pixel is dropped, so a shape
minus itself comes back empty instead of as a hairline. Holes are the honest
limit: Weft geometry cannot express a ring, so a cutter entirely inside A
returns A. New nodes: Curve Intersection (curve × curve **or** self), Curve
Closest Point, Point In Curve, Curve Length, Area, Bounding Box (per item or
whole list), Convex Hull, Join Curves, Trim (outside / inside / split),
Fillet, Region Boolean, Mirror, Array (with I / J cell keys, principle 6),
Dot Product and Cross Product. Existing nodes grew ports rather than
siblings: Evaluate Curve emits the tangent V and normal N, Divide Curve
emits V and gains a by-length mode, Scale gains a Y factor and a
non-uniform mode — and a non-uniformly scaled circle now honestly becomes an
*ellipse* instead of averaging its two radii into a wrong circle. Three
engine warts went with the pass: an ellipse is sampled by arc length like
every other kind (Divide used to bunch its points), the 96-point distance
table is built once per node instead of once per sample (Divide with N=500
was O(N·96)), and a reversed arc no longer renders one way while
hit-testing another — 146 nodes, 28 examples.
v0.12 (2026-07-30, native 3D): the roadmap had 3D staged as *2.5D → renderer
abstraction → vendored three.js, only when 2D saturates*. James called a
different route, and it turned out to fit the actual code far better, for one
reason: **projection is an ordinary node.** `d3/project` takes 3D geometry plus a
camera and emits ordinary 2D geometry, so `ctx` never changed (none of invariant
#8's coordinated edits), the renderer never changed (all 11 `drawList.push` sites
untouched), and the editor and an exported bundle render identically *by
construction* — everything happens inside `LM.*` and `compute`, which serialize.
Multiple cameras in one patch are free. `js/engine.js` gained the layer under it:
a row-major mat4 family, `mat4LookAt` / `mat4Persp` / `mat4Ortho` (which map
camera space straight to screen **pixels**, so there is no aspect term to get
wrong), `camMats`, `project3`, Newell face normals, `prims3`, and `render3` — the
whole software renderer in one serializable function. Two geometry kinds ride the
existing `geometry` wire (`poly3`, `mesh`) and **degrade to their front elevation**
in any 2D node, so bounds, hit tests and offsets keep working on 3D input; two
port types were added (`point3`, which is position *and* direction because 3D has
no point/vector split, and `camera`, plain JSON). The nodes ship as the first real
**pack**, `js/nodes-3d.js` — 24 `d3/*` defs calling `defNode` into the same
registry, which needed one `<script>` tag and no change to the evaluator, the
exporter or the editor. Project's three outputs are index-aligned lists — screen
faces, shade 0..1, view depth — so the shade wires through Colour HSL and **one**
Draw paints every face, with `drawList` insertion order doing the painter's
algorithm; taking the geometry as a whole list is what makes that sort *global*
across meshes rather than per-mesh. Extrude and Revolve are the valuable pair:
they turn every curve node in the library into a 3D modelling tool. Shading is
two-sided (the normal is turned toward the camera first) so open surfaces don't
go black, and a face with a vertex behind the near plane is dropped rather than
clipped — Weft paints, it does not rasterize. Orbit Camera accumulates a drag on
`node._state` from the existing `ctx.mouse`/`ctx.scroll`, so steering 3D needed no
new ctx channel either. New examples: Vesica (the geometry pass measured — lens,
crescents, crossings, area) and Henge (two rings of extruded stones, orbitable,
144 shaded faces from one Draw) — 171 nodes, 30 examples.

v0.13 (2026-08-04, time as a material): three siblings that delay a signal, one
per domain, deliberately NOT one dual-purpose node — audio wires carry handle
strings and DSP runs at 48kHz in the host, data wires carry values at frame
rate, so a delay is a different machine in each and the port vocabulary
(`T` seconds, feedback/trail) is what they share. **Delay** (`audio/delay`) is
a native DelayNode with a feedback gain looping it onto itself and a wet/dry
mix — and feedback 1 *is* a loop pedal, which the new Loop pedal example plays
straight: space latches the mic into the loop, c clears it (Delay's C trigger —
the host swaps a fresh silent delay in behind the stable input/output gains, so
downstream wiring never notices), the slider is the loop length (changes glide
tape-style on a 0.25s time constant), and a red dot pulses 8× per loop interval
— one Expression node, `sin(2π·T·8/len)`, into the alpha of an HSL red (the
master limiter is the safety net; a true record/overdub looper would need an
AudioWorklet and stays on the roadmap).
**Echo** (`state/echo`) is the data twin: any value as it was T seconds ago
off a `node._state` ring buffer, plus a trail output (last N samples spread
across the window) for motion blur. **Key** (`audio/key`) fixes a real
authoring pain James hit on Scale board: the key lived in three separate Scale
pickers. Root and scale are now plain wireable numbers (root 0–11, scale
0 major / 1 minor / 2 pentatonic / 3 chromatic), `audio/scale` grew R/S inputs
(-1 = fall back to the picker, the Note precedent, so old graphs are
untouched), and Scale board now changes key in one place — which also means
interactions can *compute* the key. 174 nodes, 22 examples (Loop pedal new).

v0.14 (2026-08-08, the vector import + the kaleidoscope): **Vector In**
(`params/svg`) — load an SVG file and its outlines become geometry every node
can bend. Deliberately shipped *ahead of* the roadmap's `path` kind: the file
is parsed editor-only in `buildBody` (offscreen mount; per-subpath arc-length
sampling via cumulative-prefix lengths so relative `m` subpaths neither merge
nor grow phantom seams; `getScreenCTM` flattens nested transforms and viewBox),
RDP-simplified — with a degenerate-chord guard, since a closed loop anchors
first == last and the zero cross-product was silently collapsing every closed
shape to two points — normalized to the unit box, and stored as plain polylines
plus per-path fill/stroke colours in `node.values`. So graph JSON, share links
and exports carry the artwork with no asset pipeline, and the compute is a pure
scale-by-S map (invariant 1 untouched; a list wired into S becomes concentric
copies by ordinary list matching). Holes are the honest limit — a ring imports
as two same-fill outlines. **Kaleidoscope** (`xf/kaleido`) — the dihedral
partner to Mirror and Array: takes its input as a *whole list* (the entire
motif, however many paths), replicates it into N wedges around centre C, and
with M on reflects alternate wedges across the centre axis then rotates them
one extra step, so neighbouring wedges share mirrored edges like a real
kaleidoscope; K is the wedge index beside each copy (principle 6 — colour by
wedge). The Phase-4 mandala verdict listed kaleidoscope replication among the
"genuinely code" parts; it is now one node. Example *Rosette* — a baked leaf
import turning inside an eight-wedge kaleidoscope, hue by K — 176 nodes,
23 examples.

v0.15 (2026-08-08, holes + the colour family — same-day follow-ups from
James's testing): **poly grew a `holes` field**, the invariant-#4 decision the
roadmap had been holding — `{kind:'poly', pts, closed, holes:[[pts],…]}`,
drawn as extra subpaths and filled evenodd by drawItem, carried by xformGeom,
respected by pointInGeom (a ring hotspot is hollow) and subtracted by Area,
while toPoly and the whole analysis layer keep seeing only the outer outline —
holes *degrade* in every other node rather than breaking any (one honest
level: a further boolean on a holed poly works on its outline). Three payoffs
at once: **Vector In imports compound paths** (the subpaths of one `<path>`
nest evenodd, so the Circle-test ring arrives as one annulus instead of two
stacked discs), **Region Boolean's difference carves a real hole when the
cutter sits wholly inside A** (the "hole we cannot express" comment is gone —
clipPoly returns the cutter as a `.hole`-tagged contour and the node attaches
it to the poly that contains it), and transforms/Kaleidoscope replicate holed
geometry intact. **The colour family rounded out**: Colour RGB (`disp/rgb`),
Deconstruct HSL (`disp/deconhsl`, via the new `LM.colorToHsl` — the exact
inverse of Colour HSL) and Deconstruct RGB (`disp/deconrgb`), plus an **alpha
strip on Colour Swatch** — a checkerboard range slider under the circle;
`values.a` always rode into exports, now it has a control (adding it surfaced
two vestigial `.sw-alpha` text-field rules from an abandoned design — one
repurposed, one removed). 179 nodes, 23 examples.
v0.15.1 (2026-08-08): **lean exporter** — the compiler grew three passes:
*prune* (nodes with no path to a draw/DOM/audio/bg/hotspot sink drop out,
their wires and defs with them), *shake* (LM serialized as the transitive
closure of `LM.*` references from the surviving computes + mount — a graph
with Custom JS keeps the full library, its code receives LM), *gate* (the
keyboard / scroll / DOM-layer / measureText / hotspot-cursor runtime blocks
are omitted unless a surviving compute reads that channel, which also skips
their per-frame work). Port labels and editor-only def fields no longer
serialize; cluster subgraphs slim recursively. Kaleidoscope demo export:
70 KB → 34 KB, pixel-verified against the old export in Chrome. Two new smoke
locks: 23 (exported parts draw bit-identically to the editor engine across
the whole example corpus) and 24 (prune/gate/full-LM hygiene).
v0.16 (2026-08-09): **the legibility pass** — the ROADMAP §5 autopsy closed
in one format bump. *Dead-branch dimming*: the exporter's prune walk moved
into the engine (`LM.sinkReachable(graph, defs, extraSink?)`); the editor
recomputes it on every topology change and desaturates every node and wire
that reaches no sink (contrast held — a whisper, deliberately not the
`.disabled` bypass look). Inspector defs (`inspect: true` on Note Pad /
Graph Data / Time Graph) count as sinks in the editor only, so a branch you
wired up just to *look at* stays lit while the exporter's answer is untouched.
First catch: Hexa graph shipped with a dead `vec/grid`. *Graph format 2*:
node `label` (double-click any node's name to rename, same gesture clusters
always had; def title on hover; cluster titles stay in `values.title`),
canvas `notes[]` (sticky notes behind the node layer — quick-add "sticky
note", click to edit, drag corner to resize, emptied notes delete), and
`groups[]` (titled frames over an explicit member id list: bar-drag moves
members, ▾ folds them away with crossing wires terminating on the frame edge,
× ungroups, `Ctrl+Shift+G` / context menu on a multi-selection — `Ctrl+G`
still collapses to cluster; a group changes only reading, a cluster changes
evaluation). Migration is a no-op stamp (every new field optional), loading
stays lax, copy/paste and collapse-to-cluster carry labels. Smoke check 25
pins the serialize→migrate round-trip and that annotations never reach an
export (byte-identical bundles); app.js now loads headless in the smoke
harness under a window stub, so the format contract itself is under test.
v0.17 (2026-08-09): **the polish pass + example corpus v3** — James's
whole-app test-drive turned into six shipped phases. *Interface*: the
Number Slider became **"Hairline"** (his design doc, direction 1a —
number-first 22px mono value over a 2px ticked rule, custom pointer drag,
min/max as faint end marks, selected sliders edge-resize 140–300px into
`values.w`); quick-add grew angle shortcuts (90/180/360 → degree slider
pre-wired into Radians) and 0–12 small-int sliders, both behind a new ⚙
settings popover (`weft:set-*`, `App.setting()`); **Save genuinely
overwrites** via the File System Access API (handle kept from Save-as and
Open, cleared by New/examples; download fallback); a **hand-rolled colour
picker** (SV square + hue + alpha + hex + recents, body-mounted fixed
popover) replaced the OS dialog everywhere; sticky notes behave like nodes
(click selects, dblclick edits, Delete removes, empties survive); Note Pad
+ Text List are corner-grip resizable (`values.w/h`); colour wires can wear
the flowing colour (setting, tinted in postEval's 150ms cadence); wires
glow on hover with a 22px hit band (the relay dblclick was never broken —
just undiscoverable); Share flips to "copied ✓" and surfaces failures;
pausing time silences audio through `Viewport.setPlaying` without eating a
manual mute; Examples joined the nav links and the tagline left the
toolbar; ports defaulting to 1 arrow-step by 0.1; the ask dialog paints
above the gallery. *Corpus v3 — 18 examples*: five graphs from James's own
loom (Phyllotaxis with SVG petals, triple-layer Noise blob, Scale board,
Golden Rings, Iso-field) + Solar system gained a true-longitude **zodiac
ring**, Superformula became a family of three, Loop pedal grew a cloth
transport (rec/clear/click Hotspot buttons + metronome), Scale board tunes
everything from **one Key node**, Intersections tours the boolean toolkit
in six labelled vignettes, **Click toy** became a machine of memory
(Counter scenes, latch pads, Edge+Timer hold-bar, Sample & Hold
self-advance), **Seeing Sound** merged Cymatics/Harmonograph/Shape
song/Rose window behind Hotspot tabs (the interval ratio is at once the
rose's petal count and the pendulum ratio), and Henge became **Stonehenge**
(thirty sockets scored into standing/fallen/gone by a cos-biased seeded
roll; Shift List ∧ itself places the surviving lintel run). Retired to git
history: Cursor wave, Scroll scene, Visualizer, Sing, Rosette, old Iso
field, Cymatics, Harmonograph, Shape song, Rose window, Henge.

v0.17.1 (2026-08-09): **James's same-day test notes.** Three real bugs:
the Note Pad / Text List **resize runaway** (the card width was written
back from measurements while the box width followed the card — sizes now
flow one way, grip → box → `max-content` card, and only the native grip
persists `values.w/h`); colour-wire tint **reverting to magenta on node
drags** (tints now cached in `S.wireTint` by wire id and reapplied on every
rebuild — and **live colour wires defaults on**); the relay dblclick
genuinely not firing (selecting the wire rebuilds the SVG between the two
clicks, so no element ever received both — replaced with manual
double-click detection keyed on the wire id, plus `preventDefault` so the
second click stops selecting page text). *Slider refinement*: value down to
18px, **value-aligned smart ticks** (smallest 1-2-5 step ≥7px apart, majors
at the next nice multiple, painted as CSS-var tile gradients, recomputed on
range/width changes), a **zero mark** + zero-anchored fill when the range
crosses zero, the output dot moved level with the hairline (clear of the
track's end), and the selection cleaned to one outline + two grip pills
(the old rule outlined the full-height grip strips — the "extra vertical
lines"). *New params*: **Knob** (270° rotary, same rounding/label options
as the slider) and **Angle** (direction dial, deg readout, rad/deg output —
rad is what Rotate expects). Checkboxes are drawn, not native (bool
literals wear the bool wire colour, settings the accent). *Cloth camera
discoverability*: alt-drag joins ctrl/middle-drag for pan, the % chip grows
a ⌂ when engaged, and the status bar names the gestures. *Corpus*: 15
examples — Superformula II is now the one Superformula (I and III retired),
Oscilloscope retired, Hexa graph's dead vec/grid pruned, and Iso-field's
gallery card shows a curated still (`EXAMPLE_META.img` beats a rendered
frame when the charm is interactive).

v0.17.2 (2026-08-09): **second round of test notes.** The native corner
resize on Note Pad / Text List never engaged — the editor's node-drag
captured the pointer before the browser's grip could act; `_resizable` now
stops propagation in the 18px corner so the grip owns it (drag from any
other edge still moves the node). Graph Data and Time Graph are resizable
the same way (canvas re-fits the box each postEval), and the Time Graph
grew a double-click options popover: line count (1–8) and window seconds
(1–60). Relays dissolve: double-click one (or Delete it) and the wire it
carried heals — `dissolveRelay` reconnects the source to every destination
the relay fed. Selection outlines are rounded everywhere (outlines follow
border-radius; `.sl`/`.kn` got 8px to match the cards). Gallery order is
curated, Stonehenge first: Stonehenge, Intersections, Mandala, Seeing
Sound, Solar system, Phyllotaxis, Hexa graph, Click toy, Iso-field, Loop
pedal, then the rest.

**Development docs:** `CLAUDE.md` = agent standards & invariants (read before any
change) · `ROADMAP.md` = tracks & next steps · `test/smoke.js` = headless test
(must pass before finishing any change).

## Run it

Open `weft/index.html` in a browser — no build step, no dependencies, works from
`file://` or any static server. Autosaves to localStorage.

## The idea (vs. what exists)

- **cables.gl** — WebGL scene tool, heavy runtime, embed-oriented but not "compile to tiny JS".
- **nodes.io** — programmer-first computational canvas, not interaction/export focused.
- **NodePen** — Grasshopper UI on a Rhino compute server (needs a backend).
- **Weft** — Grasshopper's *dataflow semantics* (list matching, params → geometry),
  web-native inputs (time/mouse/viewport), and one-click export to a **self-contained
  ~20KB vanilla .js** you can paste into Webflow/any page. That combination is the gap.

## Architecture

```
weft/
  index.html        layout: toolbar / palette / editor / preview / status
  style.css         dark theme, node + wire styling
  js/
    engine.js       LM — the pure runtime (evaluator, geometry, colors, transforms, render)
    nodes.js        NODE_DEFS — the node library (+ editor-only custom bodies)
    nodes-3d.js     the 3D pack — d3/* defs into the same registry, no engine or editor change
    audio.js        WeftAudio — Web Audio host: reconciles ctx.audioList (serialized into audio exports)
    editor.js       node canvas: pan/zoom, drag, wires, quick-add, context menu
    viewport.js     live preview: evaluates graph every rAF, renders drawList
    export.js       WeftExport — compiles graph → standalone JS via fn.toString()
    examples.js     EXAMPLES — 30 graphs, doubling as the test corpus, + the parallel EXAMPLE_META the gallery reads
    app.js          shell: palette, toolbar, autosave, export modal, splitter
    icons.js        node glyphs from Figma (editor-only, never exported)
  docs/DESIGN.md    design system: decision log + tokens (Figma = drawing source)
  docs/LLM-AUTHORING.md  prompt-ready patch-authoring spec (port reference, idioms, few-shots)
  docs/RECIPES.md   task → node-chain cookbook (the guide agent's knowledge base)
  test/validate-patch.js  headless patch checker (types, ports, eval, export)
  patches/          case studies: organic-nav (v1+v2), kaleidoscope (Phase 4 thesis demo)
  tools/
    ghx-import.html standalone GHX → Weft patch converter (+ gap report)
  design/           option boards for the visual-language lite sessions (D1…)
```

### Key design decisions

- **Everything is a list** (Grasshopper's soul). Every port value is a list; nodes
  compute per-item with *longest-list matching* (short lists repeat their last item).
  `def.listInputs` names inputs that receive the whole list (List Item, PolyLine…).
  If a compute returns an array for an output it's flattened into the list — that's
  how Series/Divide "graft" without needing data trees (v1 simplification).
- **The runtime is serializable.** All engine code lives on `LM` as function
  expressions; node `compute`s are pure arrows using only `(args, ctx, node)` + `LM`.
  Export = `toString()` the used pieces + graph JSON + a small mount template.
  The editor and exports run *exactly the same code*.
- **Coordinates are centered**: (0,0) is the middle of the canvas, y-down.
- **Loose typing with coercion** (number↔bool↔string, number→point, hex→color…) —
  any output can wire into any input; `LM.coerce` does its best. Port dots are
  color-coded by type. Cycles are refused at connect time.
- **Evaluate every frame.** No dirty tracking — graphs are small, and time/mouse
  change every frame anyway. 60–130 fps with the examples.

### Node library (143) — Grasshopper-matched names

- **Input**: Time, Mouse, Viewport · interaction: Hotspot, Button, Keyboard, Scroll
- **State** (per-list-item memory, resets on load): Smooth, Spring, Counter,
  Latch, Sample & Hold, Timer, Previous Value, Edge, **Delay** (the legal
  feedback edge — cycles through it are allowed)
- **Params**: Number Slider (typed: int/decimal/odd/even + label), Boolean
  Toggle, Button (momentary), Colour Swatch, Text List, Vector In (SVG file →
  polyline geometry + per-path colours), Relay (wire organiser — double-click
  a wire), Panel (inspect or type values), Graph Data (on-node plot)
- **Maths**: Addition, Subtraction, Multiplication, Division, Modulus, Power, Min, Max,
  ArcTangent 2, Negative, Absolute, Round, Floor, Ceiling, Square Root, Sine, Cosine,
  Tangent, Radians, Degrees, Pi, Remap Numbers, Clamp, Lerp, Smooth Step,
  Expression (X,Y,Z,T + Math), Noise, Comparison (`= ≠ < ≤ > ≥`),
  Logic (and/or/xor/not), Mass Addition (sum + partial results)
- **Sets**: Series, Range, Random, List Item, List Length, Merge, Reverse List,
  Cull Pattern, Shift List, Dispatch, Select (the list-level ternary),
  Set Union, Set Intersection, Set Difference (set ops share `LM.setEq`)
- **Meta**: Cluster (+ hidden Port In / Port Out boundary markers) — subgraphs
  folded into named, nestable, exportable nodes · Custom JS — the code-block
  node: declared ports, per-item or whole-list body, `LM` in scope (graphs run
  code — Expression's trust boundary)
- **Vector**: Construct Point, Deconstruct, Distance, Point Polar, Angle,
  Dot Product, Cross Product (2D — the scalar perp-dot),
  Grid (square/iso point lattice; outputs column, row, and the lattice's
  canonical colour class K — see NODE-LIBRARY principle 6)
- **Curve**: construction — Line, Circle, Ellipse, Rectangle, Polygon, PolyLine,
  Interpolate (spline), Convex Hull · sampling — Divide Curve (by count or by
  length; emits parameters *and* tangents), Evaluate Curve (point, tangent,
  normal) · analysis — Curve Intersection (curve × curve or self), Curve
  Closest Point, Point In Curve, Curve Length, Area, Bounding Box (per item or
  whole list) · reshaping — Offset, Join, Trim (outside/inside/split), Fillet,
  Region Boolean (union/intersection/difference)
- **Transform**: Move, Rotate, Scale (uniform or non-uniform), Mirror,
  Array (identical copies on two basis vectors, with I/J cell keys),
  Kaleidoscope (whole input × N mirrored wedges, with the wedge index K)
- **Display**: Draw, Text, Colour HSL, Colour RGB, Deconstruct HSL,
  Deconstruct RGB, Gradient, Background, Measure Text
  (host `ctx.measureText`), Element (a real DOM element — `<a>`, heading,
  anything — placed by geometry bounds; hover/focus/click flow back as data)
- **Audio** (experiment, v0.8.2–3): pitch — Note (note+octave → Hz/MIDI),
  Scale (snap continuous values to a scale: maj/min/pent/chromatic + root) ·
  sources — Oscillator (sine/square/saw/tri), Noise · processors — Gain,
  Filter (lp/hp/bp/notch) · sink — Audio Out (all outs mix through a master
  limiter; mute button in the preview HUD). Wires carry handle strings;
  `js/audio.js` reconciles the real Web Audio graph (control at frame rate,
  ~60 Hz smoothed; audio-rate feedback/sequencing are not v1)

### Geometry model (2D)

Plain objects: point `{x,y}`, `line`, `circle`, `ellipse`, `rect`, `arc`,
`poly` (optionally with `holes` — extra outlines filled evenodd, carried by
transforms and hit tests, invisible to the analysis layer), `spline`
(catmull-rom), `text`. `LM.toPoly` converts anything to a
polyline, and the whole analysis layer works on that plain point list — sample
once, then intersect, split, offset, hull, fillet or clip it. Every kind is
parameterized by **arc length** over `t = 0..1` (`LM.curvePoint`,
`LM.tangentAt`, both taking an optional `LM.curveTable` so a node that samples
N times builds the distance table once), which is what lets Curve
Intersection's `T1` mean the same thing to Evaluate Curve. `LM.xformGeom`
applies affine matrices: circles and ellipses survive exactly (a non-uniform
scale turns a circle into an ellipse via a 2×2 SVD), rect/arc/spline degrade
to polys when warped.

### Export contract

Exported JS attaches to `<canvas data-weft>` if present, else creates a fixed
full-window background canvas (`pointer-events:none; z-index:-1`). Mouse is
tracked on `window` (page-wide interaction), coordinates relative to the canvas
center. For Webflow: paste into an embed / site JS, add a `data-weft` canvas
where you want it.

### Sharing

The Share button packs the serialized graph into the URL hash — deflate-raw +
base64url as `#w=…` (plain base64url JSON `#wj=` where CompressionStream is
missing). Opening such a link restores the exact patch (the previous graph is
backed up to `weft:backup`) and clears the hash. Nothing ever reaches a server.
Patches also travel as plain JSON fragments in chat (`{"weft":"patch",…}` —
Ctrl+C/Ctrl+V on the loom); authoring contract for humans and LLMs:
`docs/LLM-AUTHORING.md`.

## Editor UX

- Double-click canvas (or right-click) → searchable quick-add; palette on the left
- Drag port→port to wire; drag a *connected input* to unplug and rewire.
  A dropped wire replaces the input's wires (GH semantics); shift-drop stacks
- Double-click a wire to splice in a Relay; click to select + Delete cuts
- Double-click a node head to collapse it to icon + ports (and back)
- Right-click node → Duplicate/Delete; Ctrl+D duplicates; Shift-click multi-select
- Scroll to zoom, drag background to pan; splitter resizes the preview
- Panels show live data; error nodes get a red ring with the message on hover
- **Examples** open a gallery modal (search, category chips, cards with
  thumbnail + blurb + a "teaches" line + `needs` badges). The corpus itself is
  unchanged — `EXAMPLES` is still name → bare graph, and a parallel
  `EXAMPLE_META` carries everything the gallery shows, with smoke enforcing key
  parity. Thumbnails are rendered offscreen by stepping each graph 30–120 frames
  and painting its `drawList` onto a detached canvas: `LM.drawItem` was already
  context-agnostic, so this needed no engine or renderer change. The live loop
  and the thumbnail renderer build their ctx from one shared
  `Viewport.makeCtx`.

## Case studies (the tool measured against real work)

- **organic-nav** (2026-07-14) — the Holos organic nav
  (lab.iriscocreative.com/organic-nav) rebuilt as a patch with the v0.6 library
  and **no new nodes**: `patches/organic-nav.json` (92 nodes, 141 wires),
  write-up `patches/organic-nav.md`. It works — exact geometry, per-item springs,
  hover/click/selection, zero eval errors, browser-verified. It is also far too
  big, and that verdict reordered the plan: **PLAN Phase 3 (Composition & the
  interface boundary)** exists because of it, and `docs/OUTPUT-MODES.md` was
  written to answer the question it raised. Headline gaps it exposed: no
  encapsulation (clusters), no feedback edge (interaction is a cycle; cycles are
  refused), no text measurement, no `path` kind, no clip or gradient paint.
  Where the tool *was* at the right altitude it vanished — one `state/smooth` on
  a 6-item list replaced the original's entire hand-rolled tween rig, and sprang
  each pill independently.

  The practice generalises (see PLAN, Continuous workstreams): rebuild something
  real, count the nodes, and let the workarounds write the roadmap.

- **kaleidoscope** (2026-07-16, the Phase 4 thesis demo) — James's hand-coded
  `art tests/mandala.html` (~200 lines of canvas JS) re-expressed as
  `patches/kaleidoscope.json`: **20 nodes, 32 wires**, sliders for
  symmetry/points/speed/connect, deterministic seeded randomness (the same
  mandala every load — share-linkable), and two Custom JS nodes holding
  exactly the two genuinely-code parts (the per-particle formula; the O(n²)
  connection web + kaleidoscope replication). Write-up and verdict:
  `patches/kaleidoscope.md`. Gaps logged: trails (feedback buffer), radial
  gradient paint (known from organic-nav), **cross-product list matching**
  (data trees), and the first measured perf ceiling (~22ms/eval at 3.7k draw
  items — half of it per-item coercion in Draw nodes).

  **The after-picture (v0.8, same day):** with Phase 3 shipped, the nav
  rebuilt as `patches/organic-nav-v2.json` — one reusable **Organic Nav**
  cluster of 28 working nodes (Capsule Bar cluster nested inside), real `<a>`
  labels with `aria-current`, hover feedback through Delay. 92 flat nodes → 3
  top-level nodes. Write-up + remaining costs: `patches/organic-nav-v2.md`.

## Ideas for v2 (not built)

- Data trees (true graft/flatten/simplify) + per-wire list-matching modes
- More GH nodes: Graph Mapper, Sort List, Weave, Offset, Fillet (backlog: docs/NODE-LIBRARY.md)
- Input nodes: Scroll position, element hover/click targets, live data streams (fetch/WebSocket), audio
- Timeline/easing nodes; spring physics; trails/feedback buffers
- SVG/WebGL render targets; DOM output → **promoted**: now PLAN Phase 3/7 (see OUTPUT-MODES)
- ~~Groups/subgraphs~~ → **shipped v0.8 as Clusters** (PLAN Phase 3.1)
- Wire reroute handles, minimap (~~zoom-to-fit~~ shipped v0.8)
- Publish presets to lab.iriscocreative.com as embeddable scripts
