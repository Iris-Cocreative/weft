#!/usr/bin/env node
'use strict';
/*
 * Validate a Weft patch headlessly — for humans and LLMs authoring graph JSON.
 * Usage:
 *   node test/validate-patch.js path/to/patch.json
 * Accepts a full graph or a {"weft":"patch"} fragment. Checks:
 *   1. node types exist; wire endpoints name real nodes and real ports
 *   2. the graph evaluates at t = 0 / 0.5 / 2 with no node errors
 *   3. something reaches the drawList (warns if not — audio/DOM patches may be legit)
 *   4. the JS export compiles
 * Exit code 0 = valid, 1 = problems (listed on stdout).
 */
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) { console.error('usage: node test/validate-patch.js patch.json'); process.exit(1); }

const root = path.join(__dirname, '..');
const src = ['js/engine.js', 'js/nodes.js', 'js/audio.js', 'js/export.js']
  .map(f => fs.readFileSync(path.join(root, f), 'utf8'))
  .join('\n;\n');
const { LM, NODE_DEFS, WeftExport } = new Function(src + '\nreturn { LM, NODE_DEFS, WeftExport };')();

const problems = [];
const warns = [];
let g;
try { g = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch (e) { console.log('NOT JSON — ' + e.message); process.exit(1); }
if (!Array.isArray(g.nodes) || !Array.isArray(g.wires)) { console.log('not a weft graph (needs nodes[] and wires[])'); process.exit(1); }

/* ports of a node — dynamic defs (cluster, custom js) keep them on the node */
const insOf = n => { const d = NODE_DEFS[n.type]; return d ? ((d.dynamic && n.values && n.values.ins) || d.inputs || []) : []; };
const outsOf = n => { const d = NODE_DEFS[n.type]; return d ? ((d.dynamic && n.values && n.values.outs) || d.outputs || []) : []; };

const byId = {};
for (const n of g.nodes) {
  if (!n.id) problems.push('node without an id: ' + JSON.stringify(n).slice(0, 60));
  if (byId[n.id]) problems.push('duplicate node id "' + n.id + '"');
  byId[n.id] = n;
  if (!NODE_DEFS[n.type]) problems.push('node "' + n.id + '": unknown type "' + n.type + '" — check NODE-CATALOG.md');
}
for (const w of g.wires) {
  if (!w || !Array.isArray(w.from) || !Array.isArray(w.to)) { problems.push('malformed wire: ' + JSON.stringify(w)); continue; }
  const [fid, fport] = w.from, [tid, tport] = w.to;
  const fn = byId[fid], tn = byId[tid];
  if (!fn) { problems.push('wire from unknown node "' + fid + '"'); continue; }
  if (!tn) { problems.push('wire to unknown node "' + tid + '"'); continue; }
  if (NODE_DEFS[fn.type] && !outsOf(fn).some(p => p.name === fport))
    problems.push('wire from "' + fid + '" (' + fn.type + '): no output port "' + fport + '" — outputs are ' + outsOf(fn).map(p => p.name).join(', '));
  if (NODE_DEFS[tn.type] && !insOf(tn).some(p => p.name === tport))
    problems.push('wire to "' + tid + '" (' + tn.type + '): no input port "' + tport + '" — inputs are ' + insOf(tn).map(p => p.name).join(', '));
}

if (!problems.length) {
  const mkCtx = t => ({
    t, dt: 0.016, frame: Math.round(t * 60),
    mouse: { x: 12, y: -8, nx: 0.55, ny: 0.45, down: false, pressed: false, released: false },
    keys: { down: {}, pressed: {}, released: {} },
    scroll: { y: 0, max: 0, v: 0 },
    W: 800, H: 600, defs: NODE_DEFS,
    measureText: (s, sz) => ({ w: String(s).length * sz * 0.6, h: sz * 1.2 }),
    drawList: [], domList: [], audioList: [], audioState: {}, domState: {}, bg: null, errors: {}, out: {},
    tuneA4: (g.meta && g.meta.tuneA4) || 432
  });
  let drew = false, madeDom = false, madeAudio = false;
  for (const t of [0, 0.5, 2]) {
    const c = mkCtx(t);
    LM.evaluateGraph(g, NODE_DEFS, c);
    for (const nid of Object.keys(c.errors)) problems.push('t=' + t + ' node "' + nid + '" (' + (byId[nid] ? byId[nid].type : '?') + '): ' + c.errors[nid]);
    drew = drew || c.drawList.length > 0;
    madeDom = madeDom || c.domList.length > 0;
    madeAudio = madeAudio || c.audioList.length > 0;
  }
  if (!drew && !madeDom && !madeAudio) warns.push('nothing reaches disp/draw (or any DOM/audio sink) — the patch computes but shows nothing');
  try { new Function(WeftExport.buildJS(g)); }
  catch (e) { problems.push('exported JS does not compile: ' + e.message); }
}

for (const w of warns) console.log('WARN  ' + w);
if (problems.length) {
  for (const p of problems) console.log('FAIL  ' + p);
  console.log('\n' + problems.length + ' problem(s).');
  process.exit(1);
}
console.log('VALID — ' + g.nodes.length + ' nodes, ' + g.wires.length + ' wires' + (warns.length ? ' (with warnings)' : '') + '.');
