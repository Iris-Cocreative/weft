# Weft — agent development guide

Weft is a node-based parametric designer for the web (Grasshopper-inspired,
2D-first) that compiles graphs to standalone vanilla JavaScript. No build step,
no dependencies: open `index.html`. `WEFT-BUILD.md` = architecture & history,
`ROADMAP.md` = what to build next.

## Commands

There is no system Node — use the workspace portable Node:

```powershell
# smoke test (REQUIRED before finishing any change)
& "C:\Users\james\Desktop\Claude Code\.tools\node\node.exe" test\smoke.js

# regenerate docs/NODE-CATALOG.md (REQUIRED after changing js/nodes.js)
& "C:\Users\james\Desktop\Claude Code\.tools\node\node.exe" test\gen-catalog.js

# serve for browser verification (Chrome extension can't open file://)
python -m http.server 8137   # from the workspace root, then /weft/index.html
```

The language contract (graph JSON, types, list semantics, node-def rules for
*users and LLMs*) lives in `docs/NODE-SPEC.md`; the node inventory in
`docs/NODE-CATALOG.md` (generated — never edit by hand).

Definition of done for any change:
1. `test/smoke.js` passes (all node defs evaluate, all examples run + draw, exports compile).
2. App verified in a real browser: load, interact with the thing you changed, check console.
3. If you changed engine/nodes/export: also open the export modal and confirm generated JS compiles (smoke covers syntax; browser covers behavior).
4. Update `ROADMAP.md` status and, for milestones, `WEFT-BUILD.md`.

## Architecture map

| File | Role | May touch DOM? |
|---|---|---|
| `js/engine.js` | `LM` — evaluator, geometry, color, transforms, canvas render | **NO** |
| `js/nodes.js` | `NODE_DEFS` — node library | only in `buildBody`/`postEval` |
| `js/editor.js` | node canvas UI (pan/zoom, wires, quick-add) | yes |
| `js/viewport.js` | live preview loop | yes |
| `js/export.js` | graph → standalone JS compiler | no |
| `js/examples.js` | `EXAMPLES` — doubles as test fixtures | no |
| `js/app.js` | shell: palette, toolbar, persistence, modal | yes |

Load order (classic scripts, shared globals): engine → nodes → editor → viewport → export → examples → app.

## Invariants — do not break these

1. **The export contract.** Everything in `LM` and every node `compute` is
   serialized with `Function.prototype.toString()` into exports. Therefore:
   - `LM` properties must be arrow/function *expressions* (never shorthand methods).
   - Internal references always go through `LM.*` (never bare helper names, never closures over module scope).
   - `compute` may use only its `(args, ctx, node)` parameters, `LM.*`, and JS built-ins. No DOM, no `document`, no editor globals, no `Date.now()`/`Math.random()` (use `ctx.t` and `LM.rng(seed)` for determinism).
   - Per-node caches go on `node._underscore` fields (e.g. `node._exprFn`); anything not prefixed `_` in `values` must stay JSON-serializable.
2. **Everything is a list.** Port values are lists; the engine maps computes
   per-item with longest-list matching. Inputs named in `def.listInputs` receive
   the whole list. An output returned as an array is flattened into the list.
   Don't invent per-node exceptions to this; extend the engine if semantics
   need to grow (e.g. data trees).
3. **Coordinates are centered**: (0,0) = canvas middle, y-down, units = CSS px.
4. **Geometry is plain JSON objects** (`{kind:'circle',...}` etc. — see engine.js
   header comment). New kinds must be handled in `toPoly`, `pathGeom`,
   `curvePoint` (or degrade via `toPoly`), `xformGeom`, and `drawItem`.
5. **Graphs are plain JSON**: `{format:1, nodes:[{id,type,x,y,values}], wires:[{id,from:[nid,port],to:[nid,port]}]}`.
   Never make loading strict — unknown node types must degrade gracefully
   (they already render as `?` nodes and mark an eval error, not a crash).
   Format changes go through `GRAPH_FORMAT` + a stepwise migration in
   `App.migrate()` (js/app.js); newer-format graphs are refused, never guessed.
   Renaming a node's `id` or its port names is a breaking change (see
   docs/NODE-SPEC.md §9).
6. **Editor-only code stays out of the runtime.** `buildBody`/`postEval` on a
   def are never exported; that's the only place node UI may live.
7. **No dependencies, no build step.** Vanilla JS, classic scripts. Vendoring a
   library (e.g. three.js someday) is a deliberate ROADMAP decision, not a convenience.

## Recipe: adding a node

1. In `js/nodes.js`, `defNode('cat/name', {...})` with: `title` (Grasshopper's
   name if an equivalent exists), `cat` (existing category or discuss first),
   `desc` (one sentence, shows as tooltip), `inputs`/`outputs`
   (`{name, type, default, label?}` — single-letter names, GH style),
   `compute` (pure arrow, see invariant 1), optionally `listInputs`,
   `defaults`, `width`, `buildBody`, `postEval`.
2. Types: `number | bool | string | point | color | geometry | any`.
   New types need: `TYPE_COLORS` entry, `LM.coerce` case, literal editor in
   `editor.js buildLiteral` (or none), and a `LM.fmt` case.
3. Clamp unbounded counts/iterations (see Series: cap 10000).
4. Run smoke test — it automatically exercises every def with its defaults.
5. Manually: add the node in the editor, wire it, check literal editors, export.

## Recipe: adding an example

Add to `js/examples.js` via `_EX(nodes, wires)`. Examples are the test corpus:
every example must draw something at t=0, 0.5, 2 with no node errors (smoke
enforces this). Prefer examples that showcase list matching — that's the soul
of the tool. Lay nodes out left→right, ~200px column spacing.

## Style

- Match the existing code: compact vanilla JS, no classes where an object
  literal does, single quotes, no semicolon golf.
- UI text is lowercase-calm ("double-click the canvas to add a node").
- Visual tokens live in `:root` CSS vars in `style.css` — extend, don't fork.
