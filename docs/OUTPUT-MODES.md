# Output modes & the asset boundary — design note (Phase 3)

*Origin: the organic-nav case study, James + Claude, 2026-07-14. Companion to
`EVENTS-AND-STATE.md`. Read with `patches/organic-nav.md`.*

Weft can only do one thing with its output: **draw it on a canvas**. That was the
right v1 simplification, and it is now the ceiling. This note names what the
other options are, so we build them deliberately instead of discovering them one
node at a time.

---

## The question this answers

James, on the organic nav:

> "Eventually, the kinds of assets that Weft can help create don't need to be
> created entirely by this geometry node language. In an actual interface the
> nodes might just be used for a part of the interaction."

Correct instinct, and it points at the real architectural question: **what does
Weft own, and what does it receive?**

(Worth naming the trap first: the organic nav is a *bad* example of "import an
asset, animate it with nodes", because there is no static foundation to import —
the shape is a pure function of items, active index, spring state and pointer
position. The geometry *is* the interaction. Which is exactly why it maps so
cleanly onto nodes, and exactly why 92 of them is so damning.)

---

## The three modes

### Mode 1 — Weft draws everything *(all that exists today)*

Numbers → geometry → `drawList` → canvas. A self-contained visual in a box.
Good for generative work, ornament, backgrounds, toys. **Bad for interfaces**,
because it forces the patch to re-implement things the browser already does:
text layout, hit-testing, focus, selection, semantics. organic-nav spends most
of its 92 nodes doing exactly that.

### Mode 2 — Weft draws a layer *and positions real DOM on top of it*

The blob is drawn geometry; the `<a>` elements, focus rings and `aria-current`
are **real elements Weft places** at coordinates the patch computed. This is what
the production organic nav needs, and it is how you get beautiful *and*
accessible without ever teaching a node what accessibility is.

**The mechanism already exists.** `input/button` declares
`{id, kind:'button', label, x, y}` into `ctx.domList`; the host (`viewport.js` /
the export mount) reconciles real elements against that list and reports state
back through `ctx.domState`. Only the hosts touch the DOM — invariant #8 already
says so. Generalising `kind:'button'` to `{tag, attrs, rect}` is a small,
in-contract change and it buys links, inputs, labels, anything.

### Mode 3 — Weft drives a page it did not draw

A patch takes a **CSS selector**, reads elements the page already has, and drives
their transforms / styles / attributes. The foundation is Webflow (or plain
HTML); Weft is the nervous system.

This is the mode James was reaching for, and it is **the highest-leverage item on
the plan for the work he actually does** — it is the difference between Weft
being a drawing tool and Weft being an interface tool. Exported output stops
being "a canvas you paste in" and becomes "a module that animates the page you
already built".

Sketch: `Select` (selector → element list) → existing math/state nodes →
`Style Out` / `Transform Out` / `Attr Out`. Elements arrive as a list, so
**list matching does the fan-out for free** — one chain drives forty cards.
`domList`/`domState` is again the right plumbing: declare intent, host applies,
host reports back (bounding boxes, hover, focus).

**Hybrid is the normal case.** The production organic nav is modes 1+2 together:
Weft draws the shape, the DOM carries the links. Do not treat the modes as
alternatives — treat them as layers a single patch can use at once.

---

## The asset boundary

James asked about SVG, images, HTML, JSON. One principle answers all four:

> **Assets enter as typed values that existing nodes already understand — never
> as opaque blobs Weft has to render around.**

| Asset | Enters as | Why it's the right shape |
|---|---|---|
| **SVG** | the `path` geometry kind (line/cubic/arc segments — literally what `d` is) | Then Move, Rotate, Divide Curve, Evaluate Curve, Offset all *just work* on an imported logo. Import a mark, bend it parametrically. This is the killer. |
| **Image** | an `image` geometry kind + **Image Sample** | Already Phase 5. Sample brightness at points → drive radius/rotation: halftones, image-driven fields. |
| **JSON / data** | lists, via **Fetch** + a Pluck/path node | Makes Weft a data-viz tool and wires it straight to n8n webhooks. |
| **HTML** | **not an asset at all** | HTML enters through *mode 3*, as element handles. Trying to import HTML as geometry is a trap: the DOM is a **host**, not a shape. |

The `path` kind is the single highest-leverage engine addition in the media
phase because it pays three times: real Béziers, SVG import, and an SVG render
target. (organic-nav's necks are circular fillets purely because there is no way
to say "cubic".)

---

## Consequences for the renderer

For interface work, **SVG beats Canvas2D**: crisp text, real links, CSS-styleable,
Webflow-embeddable. `drawList` is already renderer-agnostic data, so an SVG
target is close to free once `path` exists (Phase 7.2). The canvas stays the
right target for generative/mode-1 work. Expect both.

---

## What this does *not* mean

- Weft does not become a page builder. It computes; the page hosts. The moment a
  node starts laying out a flexbox we have lost.
- Modes 2 and 3 must not leak DOM into `LM` or into node `compute`s. The export
  contract (invariant #1) and "only the hosts touch the DOM" (invariant #8) hold
  without amendment — that is the test that a design here is correct.
