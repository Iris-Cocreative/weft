# Weft — parametric designer for the web

A node-based graphics/animation/interaction creator inspired by Grasshopper (Rhino),
built to **output web-compatible vanilla JavaScript**. Weave input parameters
(mouse, time, page state) through a dataflow graph into live 2D graphics.

**Status: v0.21.0 — paint & clip: Linear and Radial Gradient are colors Draw and Background accept as they are (a paint rides the color port, becomes a canvas gradient only at draw time), Draw's new K input clips an item to any geometry, and *Lantern* is the organic-nav glow; v0.20.0 — the `path` geometry kind: lines and cubic Béziers, an SVG `d` normalized (`LM.parsePath` reads the whole grammar, arcs and quadratics become cubics), exact under every 2D transform, drawn with real curves; Bezier Span is exact, Vector In imports true curves, and the new SVG Path node turns typed path data into geometry (*Heart path* example); v0.19.3 — the params panel reads the loom (a section per group frame in reading order, folding headers, a strip form docked at the loom's left) and touch gets wire mode (tap a port, pan anywhere, tap its partner); v0.19.2 — page zoom is closed off for good, a finger's wire snaps to the nearest port within 44px and a tapped port says what it is, quick-add opens on the everyday nodes, and the params panel is a grid with the control's name loud; v0.19.1 — the params panel is on desktop too (docked at the loom's left, refreshed when the loom changes under it), the node library is a drawer on a phone, fields no longer zoom the page, and the assistant and quick-add stay above the keyboard; v0.19.0 — the welcome (and the about page) now opens on three ideas in James's words — *weave math into form*, *make code visible*, *combine domains creatively* — each with a living glyph (`weftWelcomeSVG`) that idles and answers a hover or tap, and *Rainbow eye* ships in its updated form (`patches/Eye.json`, 135 nodes, a Panel) as the graph a first visit opens on; the mobile pass: under 760px the shell stacks (cloth above, loom below, a grip between), the palette folds into a + button and the file tools into ☰, a params sheet lists every control on the loom full width, and touch gets its own grammar (one finger pans, two pinch, hold for the menu, double-tap folds) on the loom and the cloth; v0.18.7 — *Rainbow eye* is the new default graph (James's poster eye: one filleted lens scaled and turned per band, a look point feeding three transforms for parallax, an OKLCH palette walk in Custom JS), and a first visit zooms to fit the loom; v0.18.6 — the assistant loop runs from a terminal too: `test/apply-ops.js` describes a loom and applies ops with the panel's validator, the `/weft-weave` skill makes Claude the model for an existing loom, and the workflow retries the router once and turns a 504 into words; ROADMAP now carries the multi-stage plan (triage → context slice → model matched to the ask, Claude API included); v0.18.5 — a welcome modal and an eight-card tour for first visits (`js/tour.js`; the shared key can be pasted right there), and grouping without tidying can no longer leave frames stacked on top of each other; v0.18.4 — group / ungroup / collapsed ops and a group-aware layout: "organize by function and fold the plumbing" is now judgment from the model + geometry from Weft, after a 32k-token deliberation stall exposed the gap (and seven nodes missing from the spec, now pinned by smoke 27); v0.18.3 — the assistant's first real session (an orbit harp, seven revisions on Qwen3.8-27B) surfaced a reasoning loop and the `layout` op that answers "tidy the loom" in one line; v0.18.0 — the weave assistant runs on open models: `WeftOps` is the one validator the panel and the new headless bench share, and on a 12-prompt L1–L5 bench Qwen3.8-27B went 12/12 through the Hugging Face router (docs/HF-INTEGRATION-PLAN.md). v0.17.7 — wire handles follow the chord (stacked nodes bow, backward loops stop growing), on top of v0.17.6's *Card connectors* example, green selected anchors and Draw outlines, corner slider grips, American spelling.** v0.1 (2026-07-12): editor,
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

v0.21.0 (2026-09-18): **paint and clip.** The organic-nav case study left
one sentence in the plan for two months: *the teal glow, a radial gradient
clipped inside the shape, is inexpressible.* It is expressible now, and the
design is the one James chose — color nodes, not display machinery. A
**paint** is a value on the color port, `{paint:'linear'|'radial', …,
stops:[{t, c}]}` in centered canvas px, and it stays inert until something
draws it: `coerce` passes it through, `LM.paintStyle` builds the
`CanvasGradient` at draw time, and `LM.paintVisible` takes over from the
`a > 0` test so a stroke can carry a gradient as easily as a fill. Two
Display nodes make them — **Linear Gradient** (`disp/linear`: C1 at A to C2
at B) and **Radial Gradient** (`disp/radial`: C1 at center P, solid inside
R0, out to C2 at R1) — with a color list S and positions T for more stops
(`LM.paintStops`); the old `disp/gradient` blend is retitled *Blend
Colors* so the palette no longer says gradient twice. **Draw gained K**, an
optional clip: `LM.drawItem` now wraps `LM.drawItemRaw` in `save / clip /
restore` when the item carries one (evenodd when the clip has holes), so
a glow is a big disc with a radial paint clipped to the capsule — no more
bg-colored carve circles. **Background takes a paint** too, through
`LM.fillBg`, which the cloth, the thumbnails and the export mount now
share; a paint background is laid in centered coordinates so its px mean
the same as geometry's. A wire carrying a paint tints itself by the first
stop. *Lantern* is the example: the glow follows the mouse, stripes are
clipped by the same capsule, the sky is one Linear Gradient into
Background. Smoke pins the two nodes, coerce, visibility, the draw-call
sequence with a clip (a recording canvas whose gradients collect their
stops), both background paths and that the shaken export keeps the paint
helpers. Not done, and noted: a paint does not transform (it is not
geometry — wire the same point into both), pattern and image paints wait
for the Image node, and blend modes are still a canvas feature Weft does
not expose.

v0.20.0 (2026-09-18): **the path kind — Phase 5 opens.** Weft could draw
a circle, an arc and a Catmull-Rom spline, but it could not say "cubic":
organic-nav's necks were circular fillets for that reason, Bezier Span
sampled itself into 49 points, and Vector In flattened every logo through
`getPointAtLength`. The new kind is deliberately small:
`{kind:'path', subs:[{start, segs:[{x,y} | {x1,y1,x2,y2,x,y}], closed}]}`
— lines and cubics, nothing else, because every SVG command reduces to those
two (`LM.parsePath` elevates quadratics and splits arcs into ≤90° cubics by
the spec's endpoint-to-center recipe, `LM.arcToCubics`; `LM.pathD` writes
the data back). Two cases downstream is what keeps invariant #4 cheap:
`toPoly` flattens the first sub with a sample every ~4px of control
polygon, `pathGeom` hands the canvas real `bezierCurveTo`s so the shape is
crisp at any zoom, `xformGeom` maps the control points — a cubic's image
under an affine map is the cubic through the mapped control points, so a
path *stays a path* through Move/Rotate/Scale/Mirror — `curveEnds` is
exact, and the further subs play the role poly's `holes` play: drawn
evenodd, honored by `pointInGeom` and Area, invisible to the analysis layer.
Three things fell out at once. Bezier Span emits the exact cubic. Vector In
lost its DOM sampler: every shape element is rewritten as path data
(`_svgShapeD` — rounded rects and circles as arcs), parsed, and the
flattened `getScreenCTM` applied to the control points, then the whole
drawing is normalized to a unit long side and stored to 1e-4 in
`node.values` — graphs saved with the old sampled polylines still load,
the compute reads both. And the **SVG Path** node (`crv/path`) takes a
typed `d` and emits geometry, parsing once per distinct string through the
same stale-source guard as Expression: for a model writing a patch, any
free shape is now one string. *Heart path* is the example (four cubics,
a Series of inward offsets, a dot running the outline by arc length);
smoke pins the parser (relative forms, H/V, S reflection, packed arc
flags), the arc conversion (a semicircle stays on its circle to 0.15px
and measures πr), the elevated quadratic's midpoint, the ring-with-hole
hit test and area, the draw-call sequence, and the three node contracts.
Left on polylines on purpose: Join, Fillet and Offset — round joins on a
path are the next step — and the SVG render target now costs what PLAN
said it would.

v0.19.3 (2026-09-18): **the panel reads the loom, and the finger stops
dragging.** Two loose ends from the mobile pass. The params panel listed
controls in the order they were made, which is nobody's order; now
`App.paramSections` reads the loom the way James lays it out — one section
per group frame with the frame's title as its header, one unnamed section
for the loose controls, both sections and the rows inside them sorted
top-to-bottom then left-to-right, banded into 60px rows so a row of dials
reads across rather than by the pixel. A header click folds the section
(`App._pmFold`, for the session); a frame folded on the loom still lists
its controls, because folding the plumbing away and playing the patch from
the panel is exactly the use. The ‹ in the head folds the whole panel to a
36px strip at the loom's left — the faders glyph, the word, the count — and
a click on the strip reopens it; the choice is remembered per browser
(`weft:paramsStrip`), and a phone never sees it since the panel is the
whole loom there. Wiring by finger across a long loom was still a drag in
both senses: the loom can't pan under a wire drag and the far port is off
the screen. So a still tap on a port now *arms* it (`Editor` keeps
`S.armed`; the port pulses in its own type color and the tip says *now tap
an input*), the loom pans and pinches as usual, and the next tap on a port
of the other side makes the wire with the same replace-on-drop rule a
dragged wire follows. Tapping the armed port again, tapping empty loom,
Escape, or loading a graph disarms; tapping a port of the same side simply
moves the arming there; a card's own port is refused with a flash. Every
render funnels through `drawWires`, so a rebuilt card gets its armed class
painted back there. Verified in Chrome with synthetic touch pointers and on
the five-frame *test gen 3* loom for the sections.

v0.19.2 (2026-09-18): **the third phone.** The page still zoomed: the
viewport meta stops a field's focus-zoom but Safari ignores it for a
pinch, and `touch-action: none` had only covered the loom and the cloth.
Now the body carries it (every list that scrolls keeps `pan-y`, and the
touch-action chain stops at the scroll container, so they still scroll)
and Safari's own `gesturestart/change` are canceled — pointer events keep
flowing, so the loom's pinch is untouched. Wiring by finger: a fingertip
hides the port it aims at, so on touch `startWire` measures every
compatible port once and the drag snaps to the nearest within 44px, the
loose end drawn landing there; a still finger on a port no longer lifts a
wire off (the press puts it back) and shows the port's label · type in a
small tip. Quick-add with nothing typed now opens on twenty everyday nodes.
The params panel became a grid: sliders span the row, dials, toggles,
swatches and buttons sit three across; the eyebrow (what kind of control)
is small and thin and the control's own name is the loud line.

v0.19.1 (2026-09-18): **the second phone.** James's first real session
on a phone came back with five notes, all small and all right: the loom
wanted more room (the cloth takes 38% now), a focused field zoomed the
whole page and there was no way back (`maximum-scale=1` in the viewport
meta — the loom and the cloth carry their own pinch, so page zoom only ever
got in the way — plus 16px on every text field a phone types into), the
assistant and quick-add hid behind the keyboard (both are fixed now and
sized from `window.visualViewport`, through two CSS variables `bindMobile`
keeps current), the params sheet deserved a desktop life (it is a panel
docked at the loom's left, and the change pipeline refreshes it when a
change came from anywhere but its own rows), and there was no way to browse
the library by category — the palette is a drawer from the left on a phone,
opened by the + that used to open quick-add (quick-add stays on a held
finger), with a tap adding at the loom's center and closing it.

v0.19.0 (2026-09-18): **the mobile pass.** Weft had never been opened on a
phone on purpose: a 208px palette, a 240px-minimum cloth and a loom that
needed a right button. James asked for the loom below the cloth and the
params in a collapsible sheet, and that is the shape: `style.css` stacks
the shell under 760px (the splitter turns into a grip that sizes the cloth's
height, remembered in `weft:clothH`), `App.bindMobile` binds the + button
(quick-add, fixed at the top of the screen so the keyboard can't cover it),
the ☰ menu (the file tools plus About/Nodes), swaps the status hint for a
finger one, and refuses to load the merged view on a phone. The params
sheet (`App.toggleParams`) is the part that makes a phone a place to *play*
a patch rather than just look at one: every Params-category def with a
`buildBody` runs it again into a full-width row bound to the same node, so
the slider you drag there is the card's slider — the cloth follows live,
`postEval` rows (anchors) mirror the cloth, and the cards are rebuilt when
the sheet closes. Touch is a second grammar in `js/editor.js`, not a
translation of the mouse one: `touchDown/Move/End` key off `pointerType`
and give one finger on empty loom a pan, two a pinch about their midpoint,
a 520ms hold the card menu or quick-add, and a double-tap a synthesized
`dblclick` — after an 80ms wait, and only when the browser didn't fire its
own, so a fold never toggles twice. The cloth does the same for its camera.
Two small things the pass exposed: `zoomToFit` gained a zoom floor (a phone
fitting *Rainbow eye* landed at 8%), and a focused field near the loom's
edge could make the browser scroll the `overflow:hidden` editor — that
scroll now folds into the pan. The same day the welcome's three cards
were rewritten: *everything is a list / the web is stateful / leaves
without a runtime* were true but spoke engine, not invitation — James's
framing is *weave math into form*, *make code visible*, *combine domains
creatively*, and each card carries a glyph drawn on the node-icon grid in
the brand gradient (`weftWelcomeSVG` in `js/icons.js`, editor-only): a wave
flowing into a port that turns a slow rosette, three gray lines of code that
light up as the wires of a card, and a chart, a sound and a solid in a ring
that turns on hover while the three stay upright. The about page's cards use
the same source. And the loom a first visit opens on is the updated
*Rainbow eye* from `patches/Eye.json` (format 2, 135 nodes, a Panel node).

v0.18.6 (2026-09-17): **the loop, from the terminal.** A day of testing
on the public workflow ended with James asking for the assistant's brain
as a skill — so `test/apply-ops.js` is the headless twin of the panel:
`--describe` prints a loom the way a model should read it (id · type ·
label · values · group, wires as `from.port → to.port`, live errors, and
the exact port letters of every type in use), `--ops` applies a list with
`WeftOps.apply`, evaluates at three times, compiles the export and writes
`<loom>.woven.json`, never touching the input. The `/weft-weave` skill
(user-level, beside `/weft-patch`) walks Claude through it: read the same
two prompt files the n8n model gets, describe, decide once, apply, hand
back a file to Open; and when the *model* is the question, replay the
turn with the bench before touching anything. A 504 on the router the
same afternoon (a bare nginx page — the provider's gateway, not n8n's
170 s) got the router node a retry and an error path that reaches the
panel in words. And the direction James named went into ROADMAP §2 as a
plan, not a wish: the small model is fine for simple asks, the spec is the
ceiling, so the workflow grows stages — a tiny triage that classes the
turn and names the node categories, a spec sliced per category so the
weaving model reads only what the ask needs, a model matched to the class
(Qwen for edits, a larger open model or the Claude API for builds), and
the deterministic check that already exists.

v0.18.5 (2026-09-17): **the front door, and one more thing the loom
learned.** Testers were arriving at a canvas with no explanation, so the
first visit now opens a welcome (`js/tour.js`): what weft is, in the about
page's words, the loom/cloth idea, the three cards — lists, state, export —
and a dashed box for the weave assistant's shared key, optional, saved
straight into the assistant's browser config so the ✦ button just works.
"take the tour" runs eight cards round the interface, each a spotlight cut
out of a dim sheet (one box-shadow, no canvas) with the card pinned on the
side that fits; arrows and Esc drive it, a step whose target isn't on
screen is skipped, and the ⚙ popover brings it back. The same day's third
trace (test gen 3): the model named five good groups and skipped the
layout op, so five frames were drawn over one column layout, stacked on
top of each other. `WeftOps.apply` now notices when a frame swallows a
card that isn't its member and tiles the blocks anyway ("re-tiled so
frames do not overlap" in the summary), leaves a snug frame alone, and runs
a whole-loom `layout` last whatever its place in the list — so
`[layout, group, group]` and `[group, group, layout]` land the same.

v0.18.4 (2026-09-17): **the second stall, and the division of labor it
named.** Same session, next ask: "group them intelligently by what they're
doing, more space between cards, collapse what we don't need to see." The
model's reasoning was *good* — right functional groups, every wire checked —
and never ended: it wanted `meta/cluster` nodes, the spec didn't say what
port a `meta/portin` exposes (it's `V`; the model's best guess was wrong),
and since ops apply atomically it circled on "if the cluster fails I lose
the grouping too" for 32,000 tokens. Three faults, all ours. The spec now
states the cluster contract exactly and lists the seven nodes it had
drifted away from (`params/angle` among them — the model noticed); smoke
27 diffs `LLM-AUTHORING.md` against `NODE_DEFS` so it can't drift again.
The core prompt gains "decide once: do the certain part, say what you left
out, never reason back and forth about risk." And the ask itself turned out
to be Weft's format-2 annotations, which the ops protocol simply couldn't
reach: `group` (titled frame, `collapsed` folds it to a bar), `ungroup`,
`set collapsed` for a single card, and `layout` grown group-aware — every
group laid out as its own block of columns, blocks tiled in flow order with
gaps, folded ones reserving only their bar, `spacing` for breathing room,
columns capped at seven rows so a block of sliders is a grid, not a tower.
The editor refits frames to real card sizes once ops land, and its own
paste-layout shares the code. Replaying the exact turn: three for three in
two to three seconds, ~3k tokens, with the model drawing the line itself —
"expanded: the stuff you'll tweak; collapsed: the plumbing."

v0.18.3 (2026-09-17): **the first real session, and what it taught.** James
played the assistant for an evening on the public workflow: "an interesting
and unique musical instrument" became an orbit harp — seven planets on a
pentatonic scale, click to pluck, space for a ripple that rings each planet as
it reaches it, two draggable gate bars for a polyrhythm, a 432 Hz toggle —
across seven revisions of a 78-node graph, every one landing as validated
ops. Then "clean up the cards on the loom" returned nothing. The trace showed
why: Qwen planned the re-layout in its hidden reasoning, hit "no wait…", and
repeated the same paragraph for 18,000 tokens until the provider stopped it.
Two causes, two fixes. Temperature 0.2 was mine and wrong — Qwen's own
guidance for thinking mode is 0.6 with an explicit warning that greedy
decoding loops; the workflow, bench and docs now say 0.6. And hand-placing 78
nodes with `set` ops is a job for a graph, not a language model: `WeftOps`
gained a `layout` op (whole loom or `ids`), the editor's paste-layout now
calls the same code, and columns are ordered by where their inputs sit so
wires run straighter. Replaying the exact failing turn: three for three,
`[{"op":"layout"}]` in ~90 tokens. Along the way v0.18.1–2: the webhook URL
is baked in so testers need only the key, an optional tester name, **molt**
to shed the chat, the **shuttle** (a weft thread passed over and under warp
while the model works), a growing prompt box, the bench replaying a real
loom (`--graph/--select/--history`), and the snapshot checkbox saying what
it sends. The Parse node now says "came back with no answer after N tokens
of thinking" instead of "(no text in the reply)".

v0.18.0 (2026-09-16): **the assistant on open models — first the yardstick.**
The Hugging Face plan (now docs/HF-INTEGRATION-PLAN.md) turned out to be
mostly shipped already as v0.10's weave assistant; what it lacked was a way
to *score* a model without a browser or an n8n round-trip. So the ops
applier left `js/assistant.js` for `js/ops.js` — `WeftOps.apply(graph, ops,
defs)` pure, plus `parseReply`, which now tolerates the JS-isms open models
slip into (`//` comments, trailing commas, `[a,P,b,P]` wires) without ever
guessing at semantics — and `test/bench-model.js` runs the panel's exact
pipeline headlessly against `router.huggingface.co`: system prompt
(`docs/ASSISTANT-CORE.md`, now the one source for n8n too, plus
LLM-AUTHORING.md) → reply → ops → apply → eval at three t → export, with
`--repair` feeding rejected ops *and* eval errors back once, as the panel
does. Twelve prompts across the plan's five levels (`test/bench/prompts.json`).
First scores, $10 of prepaid credits barely dented: Qwen3.8-27B 12/12 at
~1.5 s (its L4 orbit uses Turntable for rate changes, its L5 flock is a
Delay loop around a Custom JS step with personality sliders — the docs'
own idiom); DeepSeek-V4-Flash 11/12 at ~6 s; gpt-oss-120b 8/12 at 0.9 s,
three of the four misses being format or the `disp/text`-is-not-a-sink
trap, both now addressed in the core prompt. Smoke check 26 pins the ops
module. The panel's behavior is unchanged.

v0.17.7 (2026-09-16): **the study feeds back into the editor's wires.** Asked
what the connector work could do for Weft's own wires: with ports pinned to
the left/right edges, the departure-angle logics (normal, arc, snap) have
nothing to choose — the outline normal at a port is horizontal, which is what
`wirePath` always drew — and since horizontal handles make `y(t)` monotone a
wire can't self-intersect, so the bench's loop guards aren't needed either.
What did carry over is handle length as a function of the *chord*: the old
`max(40, Δx/2)` left two stacked nodes joined by a 40px stub and a vertical
drop; now `L = max(24, Δx/2, 0.3·chord)`, capped at 200 when the wire runs
backward so the loop stays one size. Horizontal and diagonal wires are
unchanged. Compared in Chrome against the old curve overlaid in red.

v0.17.6 (2026-09-16): **the connector study lands as an example.** James spent
a session in Weft working out how Collab OS should draw the line between two
cards — a soft-snap bezier whose leaving angle is a raised cosine of the chord
angle, then an arc (turn one ray the other way), a lime "normal" connector
(chord hits the outline, handles along the outline's normal there), the plain
chord, and four fixed-port orthogonal variants. ***Card connectors*** is that
patch rebuilt clean by a generator script: two cards (filleted hexagon,
rounded rect — any closed shape drops in), a shared band (chord, θ, a handle
length that scales with distance and clamps), then one band per type with a
toggle at its end, the four orthogonal variants folded into one responsive
version that picks the facing ports from θ. Two things the study taught:
the one-sided snap `k(1−cos4θ)/2` always turns the same way (straight at 4
angles, and its k wants to be small, ~0.35) while the symmetric
`(axis−θ)·k·cos²2θ` pulls toward the nearest axis with zero weight on the
diagonals (straight at 8) — both are in the patch behind a toggle, plus a
mirror; and the normal connector needs its normal made *outward* regardless
of winding (dot against center→exit, flip on negative), which is four nodes
per card and worth every one. Editor asks from the same session: a selected
Anchor goes selection-green on the cloth and a selected Draw outlines what it
drew (Display nodes ghost in the selected pass only); slider grips sit
top-left / bottom-right past the corner radius and the bare-node outline
stands 6px off, so neither crowds the output dot; and the British spellings
went American across app text, comments and the living docs — identifiers
(`weft:recent-colours`, `live-colour-wires`, `createAnalyser`, GH component
names in the importer) untouched, history docs left as written.

v0.17.5 (2026-09-15): **a wiring-session harvest.** James asked how to turn a
line into a vector and the honest answer was "re-feed the endpoints into
Vector 2Pt" — so now there is **End Points** (`crv/endpoints`, S/E of any
curve, exact for lines/arcs, first/last sample otherwise, the seam twice for
closed curves) and **Line to Vector** (`vec/line2vec`, start → end chord with
unitize + length), both on one `LM.curveEnds` helper. Three Grasshopper
curve primitives came with them: **Bezier Span** (`crv/bezier` — A, TA, B,
TB with the inner control points at A + TA and B − TB, GH's reading, sampled
to a 48-segment `poly`), **NURBS Curve** (`crv/nurbs` — `LM.bsplinePts`, a
uniform B-spline by de Boor with a clamped knot vector when open and a
wrapped control polygon when periodic; degree clamps to 1..min(7, n−1);
degree 1 is the control polygon; sampling is ~96 points per *curve*, not per span — James's first test was four points at degree 3, a single span, and a per-span count drew it as a 12-gon) and **Extend Curve** (`crv/extend` —
`LM.extendGeom`, L0/L1 px at either end, negative trims by arc length; lines
and arcs stay their own kind, everything else is sampled and continued
straight along its end tangents; closed curves pass through). Both new
curves are sampled polys — a `path` kind stays the phase-5 upgrade. Two
editor fixes rode along: quick-add `100` made a 0–1000 slider because an
exact power of ten got "headroom" — it is now its own ceiling (66 → 0–100
unchanged); and node titles truncate with an ellipsis (`min-width: 0` on the
flex child) instead of shoving the preview eye past the card edge. Every def
was measured in Chrome — six fixed-width cards overflowed (Curve
Intersection by 43px) and got wider rather than renamed.

v0.17.4 (2026-08-19): **two bugs James hit in one sitting, both from the same
blind spot — the browser taking something away mid-gesture.** (1) *Stranded
marquee.* Track In armed its `getDisplayMedia` picker on `pointerdown`, so a
click on empty loom started a marquee **and** opened a native modal; the modal
ate the `pointerup`, and `S.drag` stayed live with a selection box following
the cursor forever. Fixed at both ends: the picker now arms on `pointerup`
(still a valid user gesture, and the editor's own window handler runs first),
and `Editor.cancelDrag()` tears down any gesture on `pointercancel`, on window
`blur`, or on a `pointermove` with `e.buttons === 0` — the general signal that
the release happened where the page could not see it. It *drops* rather than
commits, so no wire lands on whatever the cursor drifted over. (2) *Share
links died in WhatsApp.* base64url is URL-safe but not chat-safe: linkifiers
refuse to end a link on a trailing `_`, and WhatsApp reads `_…_` as italics.
The hash is now `#w2=` — **pack → deflate-raw → base62**, letters and digits
only. The packer is where the length went: dictionaries for the repeated type
and port names, node ids collapsed to array index, every JSON key dropped
(wire/note/group ids aren't carried; `setGraph` reissues them). ~60% off the
pre-compression JSON, 23% off the finished link across all 16 examples — worst
case 6408 → 4872 chars — after paying base62's 0.8% density tax. Old `#w=` /
`#wj=` links still open, never written. Also new: ***Figure visualizer***, the
corpus's second *Audio input* example and its argument that Spring is a
physics engine — a stick figure whose arms are pendulums hung off Springs, one
per stereo channel, with a second Spring per arm trailing the first as an
elbow (`math/max` against the upper-arm angle stops it hyperextending) and a
bob that lifts hips and feet together so the legs keep their length.

v0.17.3 (2026-08-17): **glyphs for the 3D pack.** The 24 `d3/*` nodes and the
`params/point3` param were the last of the library without their own icon —
they fell back to the category cube, or to a bare colour dot. Each has one now,
and coverage is complete (180 icons; the only node still without an entry is
the Colour Swatch, whose conic-gradient glyph is CSS by design). One grammar
holds the family together: the axonometric of the category cube (top face
9 × 5.25), y up the screen, the two depth axes to the lower left and right, and
everything that is *not* the subject — the "before" of a transform, a back
face, a projection ray, an un-normalized vector — dropped to low opacity, so a
single shape reads at 27px. Where a 2D sibling already exists the 3D one
inherits its idiom: Deconstruct3 fans out to three dots like Deconstruct
Colour, Move3 and Scale3 keep the ghost-and-arrow of Move and Scale. Three
glyphs were redrawn after seeing them rendered rather than imagined: Orbit
Camera was an ellipse with a wedge on its edge and a dot at its centre, which
read as the app's own visibility eye (it is now a cube on an orbit ring with
the camera riding it); Torus as three concentric ellipses read as pond ripples
(two ellipses and a near-side tube arc); Cross Product needed arrowheads before
its two in-plane vectors read as vectors instead of table legs. Code drafts,
marked as such in `js/icons.js` — a Figma export replaces an entry whenever one
gets redrawn. Sheet: `docs/icons.html` via `test/gen-icon-preview.js`.

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
- On a phone (≤760px): cloth above, loom below, a grip between; + opens quick-add, ☰ the file tools, the faders button the params sheet (every control on the loom, full width); one finger pans, two pinch, a hold opens menus, a double-tap folds
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
