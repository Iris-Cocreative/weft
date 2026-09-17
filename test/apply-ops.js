#!/usr/bin/env node
/* apply-ops.js — the weave assistant's applier, headless.
 *
 * Describes a saved loom compactly, or applies a weft-ops list to it with the
 * exact validator the panel uses (WeftOps.apply), then evaluates the result at
 * t = 0 / 0.5 / 2 and compiles its export before writing it out. This is the
 * terminal side of the assistant: a model (or Claude in a terminal session,
 * see the weft-weave skill) writes ops, this checks and lands them.
 *
 *   node test/apply-ops.js --graph loom.json --describe
 *   node test/apply-ops.js --graph loom.json --ops ops.json [--out loom.woven.json]
 *   node test/apply-ops.js --graph loom.json --ops reply.md            # a ```weft-ops fence inside markdown is fine
 *
 * --describe   print nodes (id · type · label · values · fold), wires, groups,
 *              notes and live eval errors — a loom-sized summary a model can
 *              read instead of the raw JSON
 * --out        where the woven graph goes (default: <graph>.woven.json; the
 *              input is never touched — Open the result in Weft, Ctrl+Z is
 *              your original file)
 * --select     comma-separated node ids, echoed in --describe (what "these" means)
 * --quiet      only the verdict line
 *
 * Exit 0 = applied and healthy; 1 = ops rejected, eval errors, export won't
 * compile, or nothing draws. */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf('--' + name); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : def; };
const graphPath = opt('graph');
if (!graphPath || graphPath === true) { console.error('usage: apply-ops.js --graph loom.json (--describe | --ops ops.json [--out result.json])'); process.exit(2); }

/* ---- Weft runtime, same load as bench-model.js ---- */
const src = 'const window = { addEventListener: () => {} };\n'
  + ['js/engine.js', 'js/nodes.js', 'js/nodes-3d.js', 'js/audio.js', 'js/export.js', 'js/ops.js']
    .map(f => fs.readFileSync(path.join(root, f), 'utf8'))
    .join('\n;\n');
const { LM, NODE_DEFS, WeftExport, WeftOps } = new Function(src + '\nreturn { LM, NODE_DEFS, WeftExport, WeftOps };')();

const raw = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const graph = { format: 2, nodes: raw.nodes || [], wires: raw.wires || [], groups: raw.groups || [], notes: raw.notes || [], meta: raw.meta };
const quiet = !!opt('quiet');

const mkCtx = t => ({
  t, dt: 0.016, frame: Math.round(t * 60),
  mouse: { x: 12, y: -8, nx: 0.55, ny: 0.45, down: false, pressed: false, released: false },
  keys: { down: {}, pressed: {}, released: {} },
  scroll: { y: 0, max: 0, v: 0 },
  W: 800, H: 600, defs: NODE_DEFS,
  measureText: (s, sz) => ({ w: String(s).length * sz * 0.6, h: sz * 1.2 }),
  drawList: [], domList: [], audioList: [], audioState: {}, domState: {}, bg: null, errors: {}, out: {},
  tuneA4: 432
});
const check = g => {
  const evalErrors = [];
  let drew = false, sink = false;
  for (const t of [0, 0.5, 2]) {
    const c = mkCtx(t);
    LM.evaluateGraph(g, NODE_DEFS, c);
    for (const nid of Object.keys(c.errors)) evalErrors.push('t=' + t + ' ' + nid + ': ' + c.errors[nid]);
    drew = drew || c.drawList.length > 0;
    sink = sink || c.domList.length > 0 || c.audioList.length > 0;
  }
  let exportErr = '';
  try { new Function(WeftExport.buildJS(g)); } catch (e) { exportErr = e.message; }
  return { evalErrors, drew: drew || sink, exportErr };
};

/* ---- describe ---- */
const fmtVal = v => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') { const s = JSON.stringify(v); return s.length > 40 ? s.slice(0, 37) + '…' : s; }
  if (typeof v === 'string') return JSON.stringify(v.length > 30 ? v.slice(0, 27) + '…' : v);
  return String(v);
};
if (opt('describe')) {
  const sel = new Set(String(opt('select', '') || '').split(',').filter(Boolean));
  const inGroup = {};
  for (const f of graph.groups) for (const id of f.nodes) inGroup[id] = f.title + (f.collapsed ? ' (folded)' : '');
  console.log('LOOM ' + path.basename(graphPath) + ' — ' + graph.nodes.length + ' nodes · ' + graph.wires.length + ' wires · ' + graph.groups.length + ' groups · ' + graph.notes.length + ' notes');
  console.log('\nNODES  (id · type · "label" · values · @x,y · [group])');
  for (const n of graph.nodes) {
    const def = NODE_DEFS[n.type];
    const vals = Object.entries(n.values || {}).filter(([k]) => !k.startsWith('_') && k !== 'graph').map(([k, v]) => k + '=' + fmtVal(v)).join(' ');
    console.log('  ' + (sel.has(n.id) ? '▸' : ' ') + n.id.padEnd(10) + ' ' + n.type.padEnd(18) + (n.label ? ' "' + n.label + '"' : '') + (def ? '' : ' (UNKNOWN TYPE)')
      + (vals ? ' ' + vals : '') + '  @' + Math.round(n.x) + ',' + Math.round(n.y) + (n.collapsed ? ' folded' : '') + (n.enabled === false ? ' disabled' : '') + (inGroup[n.id] ? ' [' + inGroup[n.id] + ']' : ''));
  }
  console.log('\nWIRES  (from.port → to.port)');
  for (const w of graph.wires) console.log('  ' + w.from[0] + '.' + w.from[1] + ' → ' + w.to[0] + '.' + w.to[1]);
  if (graph.groups.length) {
    console.log('\nGROUPS');
    for (const f of graph.groups) console.log('  ' + f.id.padEnd(6) + ' "' + f.title + '"' + (f.collapsed ? ' folded' : '') + ' : ' + f.nodes.join(', '));
  }
  if (graph.notes.length) {
    console.log('\nNOTES');
    for (const nt of graph.notes) console.log('  ' + nt.id + ': ' + JSON.stringify(String(nt.text || '').slice(0, 120)));
  }
  const c = check(graph);
  console.log('\nHEALTH  ' + (c.evalErrors.length ? c.evalErrors.length + ' eval error(s):\n  ' + c.evalErrors.join('\n  ') : 'evaluates clean') + ' · ' + (c.drew ? 'draws' : 'DRAWS NOTHING') + (c.exportErr ? ' · export fails: ' + c.exportErr : ' · export compiles'));
  if (sel.size) console.log('SELECTED ' + [...sel].join(', '));
  const ports = new Set();
  for (const n of graph.nodes) { const d = NODE_DEFS[n.type]; if (!d) continue; const key = n.type + ' in:' + (d.inputs || []).map(p => p.name).join(',') + ' out:' + (d.outputs || []).map(p => p.name).join(','); ports.add(key); }
  console.log('\nPORTS OF TYPES IN USE  (exact letters)');
  for (const p of [...ports].sort()) console.log('  ' + p);
  process.exit(0);
}

/* ---- apply ---- */
const opsPath = opt('ops');
if (!opsPath || opsPath === true) { console.error('give --ops ops.json (or a markdown file with a ```weft-ops fence), or --describe'); process.exit(2); }
const opsText = fs.readFileSync(opsPath, 'utf8');
let ops = null;
try { const p = JSON.parse(opsText); ops = Array.isArray(p) ? p : (p && Array.isArray(p.ops) ? p.ops : null); } catch (e) {}
if (!ops) { const parsed = WeftOps.parseReply(opsText); ops = parsed && parsed.ops; }
if (!ops) { console.error('REJECTED  could not find a JSON array of ops in ' + opsPath); process.exit(1); }

const r = WeftOps.apply(graph, ops, NODE_DEFS);
if (!r.graph) {
  console.log('REJECTED  ' + r.errors.length + ' error(s) — nothing applied');
  for (const e of r.errors) console.log('  · ' + e);
  process.exit(1);
}
const c = check(r.graph);
const outPath = opt('out', graphPath.replace(/\.json$/i, '') + '.woven.json');
const out = Object.assign({}, raw, { format: 2, nodes: r.graph.nodes, wires: r.graph.wires, groups: r.graph.groups, notes: r.graph.notes });
fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
const ok = !c.evalErrors.length && !c.exportErr && c.drew;
console.log((ok ? 'WOVEN     ' : 'APPLIED WITH PROBLEMS  ') + r.summary + ' → ' + outPath);
if (!quiet) {
  if (c.evalErrors.length) { console.log('  eval errors:'); for (const e of c.evalErrors) console.log('    ' + e); }
  if (c.exportErr) console.log('  export does not compile: ' + c.exportErr);
  if (!c.drew) console.log('  nothing reaches a display node — the cloth would be empty');
  console.log('  ' + r.graph.nodes.length + ' nodes · ' + r.graph.wires.length + ' wires · ' + r.graph.groups.length + ' groups');
}
process.exit(ok ? 0 : 1);
