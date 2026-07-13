#!/usr/bin/env node
'use strict';
/*
 * Weft smoke test — headless, no browser, no dependencies.
 * Run with the workspace portable Node:
 *   & "C:\Users\james\Desktop\Claude Code\.tools\node\node.exe" test\smoke.js
 *
 * Checks:
 *   1. every node def is well-formed and evaluates with its defaults
 *   2. every example runs at t = 0 / 0.5 / 2 with no node errors and draws something
 *   3. every example's JS export compiles (new Function syntax check)
 *
 * Works because engine.js / nodes.js / examples.js / export.js never touch the
 * DOM at load time (see CLAUDE.md invariants). Sources are concatenated into
 * one function scope, same as classic-script loading in the browser.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = ['js/engine.js', 'js/nodes.js', 'js/examples.js', 'js/export.js']
  .map(f => fs.readFileSync(path.join(root, f), 'utf8'))
  .join('\n;\n');

const HARNESS = `
const failures = [];
const mkCtx = () => ({ t: 0.5, frame: 30, mouse: { x: 12, y: -8, nx: 0.55, ny: 0.45, down: false }, W: 800, H: 600, drawList: [], bg: null, errors: {}, out: {} });

/* 1 — every node def evaluates standalone with defaults */
for (const id of Object.keys(NODE_DEFS)) {
  const def = NODE_DEFS[id];
  if (typeof def.compute !== 'function') { failures.push(id + ': compute is not a function'); continue; }
  if (!CATS[def.cat]) failures.push(id + ': unknown category "' + def.cat + '"');
  for (const p of (def.inputs || []).concat(def.outputs || [])) {
    if (!TYPE_COLORS[p.type]) failures.push(id + ': port ' + p.name + ' has unknown type "' + p.type + '"');
  }
  const g = { nodes: [{ id: 'n1', type: id, x: 0, y: 0, values: def.defaults ? JSON.parse(JSON.stringify(def.defaults)) : {} }], wires: [] };
  const c = mkCtx();
  LM.evaluateGraph(g, NODE_DEFS, c);
  if (c.errors.n1) failures.push(id + ': errors with default inputs → ' + c.errors.n1);
}

/* 2 + 3 — examples evaluate cleanly, draw, and export */
for (const name of Object.keys(EXAMPLES)) {
  const g = JSON.parse(JSON.stringify(EXAMPLES[name]));
  for (const t of [0, 0.5, 2]) {
    const c = mkCtx(); c.t = t;
    LM.evaluateGraph(g, NODE_DEFS, c);
    for (const nid of Object.keys(c.errors)) failures.push('example "' + name + '" t=' + t + ' node ' + nid + ': ' + c.errors[nid]);
    if (!c.drawList.length) failures.push('example "' + name + '" t=' + t + ': drawList is empty');
  }
  try { new Function(WeftExport.buildJS(g)); }
  catch (e) { failures.push('example "' + name + '": exported JS does not compile → ' + e.message); }
}
return { failures, nodeCount: Object.keys(NODE_DEFS).length, exampleCount: Object.keys(EXAMPLES).length };
`;

let result;
try {
  result = new Function(src + '\n' + HARNESS)();
} catch (e) {
  console.error('SMOKE FAIL — sources did not load: ' + e.message);
  process.exitCode = 1;
  return;
}

if (result.failures.length) {
  console.error('SMOKE FAIL — ' + result.failures.length + ' problem(s):');
  for (const f of result.failures) console.error('  - ' + f);
  process.exitCode = 1;
} else {
  console.log('SMOKE OK — ' + result.nodeCount + ' node defs evaluate, ' +
    result.exampleCount + ' examples run/draw/export.');
}
