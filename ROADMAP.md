# Weft roadmap

Tracks, not a schedule — **`PLAN.md` holds the phase order; start there.**
Each session: pick the next PLAN item, read `CLAUDE.md`, build it, pass smoke +
browser verification, update status here and in PLAN.
Status: `idea → next → in progress → shipped`.

**Node backlog lives in `docs/NODE-LIBRARY.md`** (planned nodes + descriptions
+ library principles) — new node ideas go there, not here. Set Union /
Intersection / Difference + Cull Pattern / Shift List / Dispatch shipped v0.5
(2026-07-13); **Grid** (square/iso lattice + colour class, first mode-toggle
node) shipped v0.7 (2026-07-14) with the *Iso field* example; next candidates
per NODE-LIBRARY: **Colour param + Split Colour** (GH demos lean on them),
**Format**, **Sort List**, **Array/Tile**.

## 0. Foundation hardening — do these before the tracks below get heavy

- [shipped v0.2] **Graph format version** — `format: 1` + `App.migrate()`.
- [shipped v0.2] **Undo/redo** — coalescing snapshot stack, Ctrl+Z/Shift+Ctrl+Z/Ctrl+Y.
- [shipped v0.2] Marquee (shift-drag) select; copy/paste of subgraphs as
  graph-JSON fragments with id-remap + auto-layout for coordinate-less patches.
- [idea] Share links: graph JSON compressed into the URL hash → anyone with the
  file/URL opens the exact patch. Zero-backend sharing. (Phase 4)
- [shipped v0.5] **GHX importer** (`tools/ghx-import.html`) — .ghx → Weft patch
  JSON; unmapped GH types become `?` placeholder nodes so imports double as gap
  reports (verified against all 7 demos in `Grasshopper Demos/`). "Weft opens
  Grasshopper's own demos" is a Phase 6 gallery headline; growing the GH_MAP
  table as nodes ship keeps the importer honest.
- [idea] Dirty-flag evaluation (skip re-eval when no animated inputs and
  nothing changed) — only when someone hits a perf wall; measure first.

## 0.5. Composition — making patches practical (PLAN Phase 3) — ✅ SHIPPED v0.8 (2026-07-14)

Opened by the organic-nav case study (2026-07-14): a real nav took **92 nodes**.
Diagnosis in `patches/organic-nav.md`; boundary argument in
`docs/OUTPUT-MODES.md`; the after-picture in `patches/organic-nav-v2.md`.

- [shipped v0.8] **Clusters** — select nodes → Collapse to cluster (Ctrl+G /
  context menu); promoted ports from crossing wires, saved in-graph
  (`values.graph` + `values.ins/outs`), exportable, **nestable**; Expand
  reverses; double-click the name to rename. Runtime = one `meta/cluster` def
  whose compute evaluates the inner graph via `ctx.defs` (engine only learned
  `def.dynamic`). Invariant #9.
- [shipped v0.8] **Delay** (`state/delay`) — feedback def: contributes no
  edges to the topo sort, reads last frame off `node._fbIns`. Cycles through it
  are legal at connect time and in the evaluator. Invariant #8 amended.
  *Feedback chase* example locks it in the corpus.
- [shipped v0.8] **Altitude nodes** — Comparison (mode-toggled), Logic,
  Select, Mass Addition (+ partial results), Text List, Measure Text
  (`ctx.measureText` from both hosts).
- [shipped v0.8] **Element node** (`disp/element`) — declare-reconcile-report
  generalised to `{tag, text, attrs, rect}` placed by geometry bounds; hover /
  focus / down / clicked flow back. attrs strings skip `on*` and `javascript:`.
  OUTPUT-MODES mode 2 exists.
- [shipped v0.8] **Zoom-to-fit** — Fit button, `F` (fits selection if any),
  `Home` (fits all); zoom floor dropped to 0.08.
- [idea] Remaining legibility: group/comment frames, relay pins, node labels,
  sticky notes (§5 legibility pass still lists them — clusters removed the
  urgency but they're still wanted).

Exit met: organic-nav v2 = **28 working nodes** in one reusable Organic Nav
cluster (nested Capsule Bar cluster inside), 3 nodes at top level, real
`<a>` labels with `aria-current`. Both browser- and headless-verified.

## 1. Interaction & app-building nodes (events + state)

The web is stateful; Grasshopper isn't. Weft's biggest semantic addition;
design rationale lives in `docs/EVENTS-AND-STATE.md`.

- [shipped v0.4] **Triggers as frame-latched booleans** in normal wires;
  events collected between frames, latched into ctx (invariant #8).
- [shipped v0.4] **State nodes** on `node._state` keyed by `ctx.i` (per list
  item): Smooth, Spring, Counter, Latch, Sample & Hold, Timer, Previous Value,
  Edge (bool → rise/fall triggers).
- [shipped v0.4] **Hotspot** (any geometry → hover/pressed/clicked via
  `LM.pointInGeom`) and **Button** (real overlaid element via the
  `domList`/`domState` declare-reconcile-report cycle — reusable for future
  DOM output nodes).
- [shipped v0.4] **Keyboard** + **Scroll** (real page scroll in exports;
  wheel-scrubbed simulator on the cloth). Examples: Click toy, Scroll scene.
- [idea] Later inputs: element-visibility (IntersectionObserver), URL params,
  Fetch/data-stream nodes (n8n webhooks → live data experiences!).
- [shipped v0.8] **Feedback edges** — the Delay node (track 0.5). Interactions
  where the thing you point at moves in response are now expressible; the
  ceiling on this track is lifted.
- [shipped 2026-07-15] ***Living lattice* example** — the state-track showcase:
  viewport-filling iso lattice tiled with hexagons (circumradius spacing/√3),
  one Spring node = hundreds of per-cell machines (R → size/hue, velocity →
  torsion), whole-canvas Hotspot catches clicks → Sample & Hold + Timer launch
  a travelling gaussian pulse through an Expression. Found a design lesson en
  route: Edge-on-mouse-D misses sub-frame clicks; Hotspot's armed/release
  trigger is the reliable click idiom.

## 2. Documentation & open source

- [partly shipped] Own git repo ✓ (`Iris-Cocreative/weft`, public, Pages).
  License decided 2026-07-15: **PolyForm Noncommercial 1.0.0** (`LICENSE.md`,
  verbatim official text + Required Notice; noted in the about-page footer) —
  free for personal/noncommercial use, commercial rights stay with IRIS.
  Still to do: README (pitch + quickstart), CONTRIBUTING (humans); CLAUDE.md
  and docs/ already exist.
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
- [idea] **Weft guide on a small model** — "how do I…" help answered by Haiku
  with NODE-CATALOG + NODE-SPEC + a `docs/RECIPES.md` cookbook stuffed in
  context (no RAG needed — the whole corpus fits in one prompt, cache it).
  Two surfaces: a `weft-guide` subagent in `.claude/agents/` for dev sessions,
  and later an in-app "?" panel via an n8n proxy webhook. Division of labor:
  small model answers *how-to* (the answer exists verbatim in the docs);
  patch *authoring* stays with big models (Phase 4).

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
- The iso-pattern study (2026-07-14) is the sharpest specimen so far: James built
  a correct triangular lattice *by eye* — row height within 0.08% of √3/2, and a
  3-colouring that worked for a reason he hadn't derived — in 108 nodes, where 8
  would do. The tool never fought his *intention*; it fought his ability to **see
  what he had already made**. Is that a distinct failure mode from action
  disharmony — a tool that permits the right result while withholding the
  understanding of it? (Candidate antipattern: **the correct answer you can't
  read back.** Its remedy is the legibility pass in §5, and the fact that "add
  labels" and "add a Grid node" turned out to be the *same* finding is itself the
  point.)
- The organic-nav study (2026-07-14) is the iso study's sibling, and the pair may
  be more instructive than either alone. Iso: the tool permitted the right result
  while withholding *understanding* of it. Nav: the tool permitted the right
  result at an **impractical scale** — 92 nodes, every one correct, and James's
  first reaction was still "not practical for such an application." Neither is a
  correctness failure. Both are failures of the tool to let a maker *hold* what
  they made — one in the head, one in the hand. Candidate pattern behind both:
  **a language must let you name what you built, or you will build it again.**
  (Alexander's patterns are, after all, *named* things. A cluster is a node you
  get to name. That the fix for the nav is the same shape as the fix for the iso
  field — give the maker the right unit — is the finding worth sitting with.)
  Also note what did *not* fight: list matching, and one Smooth node springing
  six pills independently. Where the tool was at the right altitude it was
  invisible. That is the QWAN signal, and it's worth cataloguing which nodes
  produced it.

## 3.5 Node visual language & control nodes (James, 2026-07-12)

Direction: nodes should *look like what they do* — a language of node shapes,
not uniform boxes. Shipped so far: compact styling for small unary/constant
nodes, live value readouts, preview toggles, ghost previews, disable/bypass.
Queued ideas (not part of Phase 2's core — the event/state plumbing they need
is now in, so any of these can be picked up in a workshop pass):

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

- [shipped v0.6] **Visual language** — James designed the node card, colour
  systems, icons, and chromeless custom nodes directly in Figma (2026-07-13),
  superseding the lite-session boards; implemented across style.css /
  editor.js / nodes.js / js/icons.js. `docs/DESIGN.md` = decision log +
  tokens. Palette + quick-add now render node glyphs (2026-07-14, `.pal-icon`,
  dot fallback); full glyph coverage same day — all 105 node icons live (11
  Figma originals + 94 code-drafted, marked in icons.js; redraw in Figma at
  leisure — a Figma export replaces a draft entry). Still open: D5 wire
  language, D7 atmosphere (`docs/DESIGN-PLAN.md` method still applies).
- [shipped 2026-07-14] **D8 brand mark** — `weftLogoSVG()` in js/icons.js: the
  weft thread woven over-under-over through three warp threads, port dots at
  both ends, brand gradient; faint `.weft-under` segment where it passes behind
  (icons' ghost convention — keeps the thread continuous at large sizes). Lives
  in the header, `favicon.svg`, and both public pages. Redraw in Figma at
  leisure, same deal as the icon drafts.
- [shipped 2026-07-14] **Public pages** — `about.html` (hand-written; hero mark
  weaves itself in, respects reduced-motion) and `nodes.html` (searchable node
  index, generated by `test/gen-node-index.js` — rerun after changing nodes.js
  or icons.js). Toolbar gained a quiet `about` link.
- [decided 2026-07-14] The name **stays Weft** — brainstorm against the
  criteria below confirmed it (runners-up: Sett, Heddle; Warp/Shuttle/Twill
  struck for collisions). Published at github.com/Iris-Cocreative/weft +
  iris-cocreative.github.io/weft. Criteria were: weaving metaphor honest to
  the mechanics, one syllable-ish, ownable, no collision. weft.app / weft.dev
  looked unregistered as of 2026-07-14 if it ever wants a home of its own.
- Iconography: glyph per node category first (8 icons), per-node glyphs later;
  consider port *shapes* per type (circle number, diamond point, square list…)
  — GH does this and it teaches the type system silently.
- Design system: tokens already live in `:root`; formalize into a small
  `docs/DESIGN.md` (spacing scale, type colors, category hues, motion rules)
  before any visual expansion. Holos styleguide is NOT the reference here —
  Weft is its own brand.

## 5. Editor usability

(overlaps track 0) — undo/redo, marquee, copy/paste, then:

- [shipped 2026-07-14] **QoL batch** — Save as (filename remembered in
  `weft:filename`; Save reuses it); unsaved-changes dialog before an example
  replaces edited work (`App.ask()` in-app dialog — native prompts would block
  the page; example load also writes `weft:backup`); Fit moved off the toolbar
  to an icon overlay top-right of the loom (`#loomTools`) beside a global
  cloth-preview eye (`Viewport.ghosts`, persisted, per-node eyes still win);
  examples + opened files auto zoom-to-fit; example layouts audited against
  real DOM boxes — Checker dispatch & Scroll scene remaps un-overlapped.
- [shipped 2026-07-15] **Merged view** — one canvas: `Viewport.merged`
  (persisted in `weft:merged`, toggled from `#loomTools`) floats the loom
  directly on the cloth. CSS-only relayout (`main.merged`: preview absolute
  behind a transparent editor; `#domLayer`/`#viewHud` ride above at z-2 so
  Button/Element stay clickable). The cloth stays interactive under the loom
  via `Viewport.forward`: background presses reach mouse/press nodes, anchor
  handles win over the marquee, shift+wheel scrubs the scroll sim (plain
  wheel still zooms), window-level pointermove takes over anchor drag/hover.
  Palette-dropped anchors pin their handle at the drop point, card beside it.

### Legibility pass — [next], James 2026-07-14

All four came out of one autopsy: a 108-node patch of James's that had two dead
branches, a float where a column count belonged, and a hand-tuned magic number
duplicating a relationship already in the graph. **Every one of those bugs is a
thing the editor could have shown him and didn't.** Read as a set, not a menu —
they're all the same complaint (a graph can't currently say what it means), and
they're cheap next to the tracks above.

- **Labels, sticky notes, group frames.** Nodes are `c1`…`n129` with no
  annotation; a 100-node patch is unreadable a month later, and *that* is why the
  dead branches survived. Node `label` (optional, defaults to the def title) +
  free sticky notes + a group frame that moves/collapses its children. Group
  frames are also the prerequisite for the Blocker idea (§3.5) — do them first.
  Format v2: `label` on nodes, plus top-level `notes[]` / `groups[]`. Keep loading
  lax (invariant 5) so old patches open fine.
- ~~**Subgraph / cluster node.**~~ → **shipped v0.8** (track 0.5) — and it went
  further than the cheap editor-only version sketched here: clusters are real
  nodes with real nested graphs, evaluated through `ctx.defs`, exportable and
  nestable. The 5-node "phase-shifted wave line" ×3 case is now: collapse once,
  duplicate the cluster.
- **Slider types** (GH parity, James's spec): a type per slider —
  **integer · decimal · even · odd** — plus decimal defaulting to 3 places
  (`0.000`) instead of today's full float. Shift while dragging snaps to integers.
  Make shift a transient *snap modifier*, not a type change, so it never mutates
  the patch. This single feature kills a whole bug class: the patch above had
  `20.1508947939262` standing in for a column count.
- **Dead-branch dimming.** An output wired to nothing should be visibly dim. Free
  to compute (the evaluator already knows the wire graph) and it makes an entire
  category of mistake self-evident.

Then:
- [idea] insert node onto an existing wire (drop-on-wire splices it in)
- [idea] **inline expressions on inputs** (GH's port expressions — type `*2`
  or `x/360` on a port to modify values in-wire; James priority: mid). Design
  against the Expression node and the planned Shift control so we don't ship
  three overlapping answers.
- [idea] Relay/reroute pins on wires (GH Relay; double-click wire to insert) —
  pairs with the existing "wire reroute handles" idea.
- [idea] drag from an empty port → quick-add pre-wired (GH's best gesture)
- [idea] node alignment/distribution, comment/group frames
- [idea] keyboard palette (Tab, like GH), arrow-key nudge
- [idea] touch support pass

## 6. Images, video & vector — where the web beats Grasshopper

- **`path` geometry kind** (line/cubic/arc segments = an SVG `d`). One addition,
  three unlocks: real Béziers, **SVG import** (a pasted logo becomes geometry
  every node can bend), and a nearly-free SVG render target (track 8.2). Handle
  in `toPoly`/`pathGeom`/`curvePoint`/`xformGeom`/`drawItem` per invariant #4.
  organic-nav's necks are circular fillets *only* because there is no way to say
  "cubic".
- **Paint & clip** — `drawList` fill widens from a colour to a paint
  (solid | linear | radial); items gain an optional `clip` geom. organic-nav's
  teal glow (radial gradient clipped inside the shape) is **inexpressible today**,
  and its bg-coloured carve circles only work over an opaque background. A real
  clip retires that trick.
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
- Rich didactic layer: **DOM output nodes** (drive real elements' transforms/
  styles) so Weft orchestrates an actual page, not just a canvas. This is
  OUTPUT-MODES **mode 3**, and it is no longer a "later" — it starts in track 0.5
  and is the highest-leverage item on the plan for Webflow/Holos work, because it
  makes the *foundation* stop being Weft's problem.

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
