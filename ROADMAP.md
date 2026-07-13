# Weft roadmap

Tracks, not a schedule — **`PLAN.md` holds the phase order; start there.**
Each session: pick the next PLAN item, read `CLAUDE.md`, build it, pass smoke +
browser verification, update status here and in PLAN.
Status: `idea → next → in progress → shipped`.

## 0. Foundation hardening — do these before the tracks below get heavy

- [shipped v0.2] **Graph format version** — `format: 1` + `App.migrate()`.
- [shipped v0.2] **Undo/redo** — coalescing snapshot stack, Ctrl+Z/Shift+Ctrl+Z/Ctrl+Y.
- [shipped v0.2] Marquee (shift-drag) select; copy/paste of subgraphs as
  graph-JSON fragments with id-remap + auto-layout for coordinate-less patches.
- [idea] Share links: graph JSON compressed into the URL hash → anyone with the
  file/URL opens the exact patch. Zero-backend sharing. (Phase 3)
- [idea] Dirty-flag evaluation (skip re-eval when no animated inputs and
  nothing changed) — only when someone hits a perf wall; measure first.

## 1. Interaction & app-building nodes (events + state)

The web is stateful; Grasshopper isn't. This is Weft's biggest semantic
addition and deserves a design note before code (`docs/EVENTS-AND-STATE.md`):

- **Triggers as frame-latched booleans** flowing through normal wires
  (true for the frame the event fired). Keeps the pure-dataflow model.
- **State nodes** own memory on `node._state`: Counter, Toggle/Latch,
  Sample & Hold, Timer (seconds since trigger), Smooth/Spring (eased follower —
  instant polish for everything), Previous Frame Value.
- **Generated UI**: Button node (renders a real styled button over the canvas),
  and — more Weft-native — **Hotspot**: takes *any geometry* and outputs
  hover/pressed/clicked. Every drawn shape becomes an interface element.
  Needs point-in-geometry hit testing in LM (easy with toPoly).
- Later: Keyboard, Scroll (page scroll as a parameter is huge for Webflow
  storytelling), element-visibility (IntersectionObserver), URL params,
  Fetch/data-stream nodes (n8n webhooks → live data experiences!).

## 2. Documentation & open source

- [next] Own git repo (init locally first; GitHub org/user + license = James's
  call — MIT suggested). Move docs to conventions: README (pitch + quickstart),
  CONTRIBUTING (humans), CLAUDE.md/AGENTS.md (agents), docs/ for specs.
- **Node spec as a contract**: document the def shape formally
  (docs/NODE-SPEC.md) so third parties/agents can author nodes safely.
- **Node packs**: a pack = one JS file of `defNode` calls + manifest comment.
  Loadable via `<script>` or paste-in. Registry can start as a folder +
  README table. The export compiler already only bundles used nodes, so
  packs don't bloat exports.
- Golden-frame tests for engine changes: evaluate examples → snapshot
  drawList JSON → diff. (smoke.js already checks "runs + draws"; goldens
  catch silent visual regressions.)
- GitHub Actions: run smoke on PR. Node-only, no browser needed.

## 3. Digital Pattern Language

Weft is unusually PAL-shaped; treat it as a live specimen, not just a tool.
Prompts for James (per the slow-cook rule, these are questions, not answers):

- A node def is almost exactly Alexander's pattern form: context (inputs),
  forces (parameters), resolution (compute), and a name. Does authoring the
  node library *feel* like writing a pattern language? What does that teach
  about pattern granularity?
- A wired graph makes causality legible — you can *see* why the thing moves.
  Is "inspectable causation" a candidate pattern for the PAL? (Its antipattern:
  the opaque Lottie file / baked animation.)
- QWAN test for tools: which nodes feel alive to use, and which feel like
  bureaucracy? Watch for it while patching.
- Action harmony: the phyllotaxis example took ~18 nodes. Where did the tool
  fight the intention?

## 3.5 Node visual language & control nodes (James, 2026-07-12)

Direction: nodes should *look like what they do* — a language of node shapes,
not uniform boxes. Shipped so far: compact styling for small unary/constant
nodes, live value readouts, preview toggles, ghost previews, disable/bypass.
Queued ideas (build alongside Phase 2 events, since most are interaction nodes):

- **Flow Gate** — a trigger switches a data flow between paths, cycles through
  options, or randomizes the route. (Phase 2 natural fit.)
- **Blocker** — a scalable/rotatable rectangle on the loom that cuts data flow
  on any wire it covers; click to toggle. (Disable/bypass covers the per-node
  case; the blocker is the *spatial* version — design against groups/frames.)
- **Shift** — slider + addition fused into one slim vertical node (nudge a value
  in-wire without two nodes).
- **Shift XY** — radial joystick (dot in circle) nudging a point; configurable
  radius; readout shows the offset.
- **Angle dial** — angle input as a draggable 360° dial, toggleable to numeric.
- **Vector pad** — draggable vector on an XY grid (3D version later).
- Custom body = the mechanism for all of these; they're defs with buildBody,
  no engine changes needed.

## 4. Branding & design language

- Working title stays **Weft** until the better name proves itself. Criteria:
  weaving/thread metaphor honest to the mechanics, one syllable-ish, ownable
  domain, no collision (Loom is taken by loom.com). Candidates to sit with:
  **Heddle** (the loom part that lifts chosen threads — selective, mechanical,
  ownable), **Thrum** (the tied-off warp ends; also a hum), **Strand**,
  **Shuttle**, **Warp**. Rename is cheap: folder, brand string, `data-weft`
  attribute, localStorage keys.
- Iconography: glyph per node category first (8 icons), per-node glyphs later;
  consider port *shapes* per type (circle number, diamond point, square list…)
  — GH does this and it teaches the type system silently.
- Design system: tokens already live in `:root`; formalize into a small
  `docs/DESIGN.md` (spacing scale, type colors, category hues, motion rules)
  before any visual expansion. Holos styleguide is NOT the reference here —
  Weft is its own brand.

## 5. Editor usability

(overlaps track 0) — undo/redo, marquee, copy/paste, then:
- [idea] insert node onto an existing wire (drop-on-wire splices it in)
- [idea] drag from an empty port → quick-add pre-wired (GH's best gesture)
- [idea] node alignment/distribution, comment/group frames
- [idea] keyboard palette (Tab, like GH), arrow-key nudge
- [idea] touch support pass

## 6. Images & video — where the web beats Grasshopper

- Image node (URL or file → drawable geometry kind `image`), opacity/blend.
- **Image Sample** — sample brightness/color at points → drive radius/rotation:
  instant halftones, image-driven fields. This is the killer node of the track.
- Video and **Webcam** as animated image sources (getUserMedia — nothing like
  it exists in GH).
- Feedback buffer (previous frame as an image) → trails, decay, flow.
- Export consideration: assets must embed (data URI) or reference URLs; add an
  asset manifest to the graph format (needs format v2 — see track 0).

## 7. Text & typography

- Deconstruct Text (string → character list!) — pure list-matching fun; every
  glyph independently animatable = kinetic type from three nodes.
- Text on Curve (curvePoint + tangent angles), Measure Text → geometry.
- Font node (FontFace loading); variable fonts: wire a number into weight/width
  — didactic interfaces where type responds to data/pointer.
- Rich didactic layer later: DOM output nodes (drive real elements' transforms/
  styles) so Weft can orchestrate an actual page, not just a canvas.

## 8. Third dimension

Staged, don't leap:
1. **2.5D first**: z as a first-class number → scale/parallax/draw-order nodes.
   Cheap, no new renderer, covers most "depth" wishes for web graphics.
2. Renderer abstraction: drawList is already renderer-agnostic data — define a
   render-target interface (Canvas2D today; SVG target is nearly free and gives
   crisp export; WebGL later).
3. True 3D = vendored three.js target + Vector3/Mesh/Camera node category.
   Big; only when 2D feels saturated. (Community Globe engine experience applies.)

## 9. Horizon / unsorted

- Audio input (mic FFT → parameters) and WebMIDI/gamepad — live-performance patching.
- Export targets: React component wrapper, Webflow-ready embed snippet preset,
  "editor-embedded" export (ship the patch *with* knobs exposed for end users).
- Graph gallery / community sharing once share-links exist.
- Expression node uses `new Function` — fine for your own patches; add a note
  to sharing docs when a gallery exists (untrusted graphs run code).
- Perf: OffscreenCanvas + worker eval if graphs grow huge.
- Accessibility of exported experiences (prefers-reduced-motion switch node?).
