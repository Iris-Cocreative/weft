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
const src = ['js/engine.js', 'js/nodes.js', 'js/audio.js', 'js/examples.js', 'js/export.js']
  .map(f => fs.readFileSync(path.join(root, f), 'utf8'))
  .join('\n;\n');

const HARNESS = `
const failures = [];
const mkCtx = () => ({
  t: 0.5, dt: 0.016, frame: 30,
  mouse: { x: 12, y: -8, nx: 0.55, ny: 0.45, down: false, pressed: false, released: false },
  keys: { down: {}, pressed: {}, released: {} },
  scroll: { y: 0, max: 0, v: 0 },
  W: 800, H: 600, defs: NODE_DEFS,
  measureText: (t, s) => ({ w: String(t).length * s * 0.6, h: s * 1.2 }),
  drawList: [], domList: [], audioList: [], audioState: {}, domState: {}, bg: null, errors: {}, out: {},
  tuneA4: 432
});

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

/* 4 — engine semantics: multi-wire merge + disabled-node bypass */
{
  const g = { nodes: [
      { id: 's1', type: 'params/slider', values: { min: 0, max: 10, value: 1 } },
      { id: 's2', type: 'params/slider', values: { min: 0, max: 10, value: 2 } },
      { id: 'ng', type: 'math/neg', values: {} } ],
    wires: [ { from: ['s1', 'N'], to: ['ng', 'V'] }, { from: ['s2', 'N'], to: ['ng', 'V'] } ] };
  const c = mkCtx();
  LM.evaluateGraph(g, NODE_DEFS, c);
  const r = (c.out.ng || {}).R || [];
  if (r.join(',') !== '-1,-2') failures.push('multi-wire merge: expected -1,-2 got [' + r.join(',') + ']');
  g.nodes[2].enabled = false;
  const c2 = mkCtx();
  LM.evaluateGraph(g, NODE_DEFS, c2);
  const r2 = (c2.out.ng || {}).R || [];
  if (r2.join(',') !== '1,2') failures.push('disabled bypass: expected 1,2 got [' + r2.join(',') + ']');
}

/* 5 — hit testing */
{
  const t = (name, got, want) => { if (got !== want) failures.push('pointInGeom ' + name + ': expected ' + want + ' got ' + got); };
  t('circle inside', LM.pointInGeom({ kind: 'circle', cx: 0, cy: 0, r: 50 }, { x: 10, y: 10 }), true);
  t('circle outside', LM.pointInGeom({ kind: 'circle', cx: 0, cy: 0, r: 50 }, { x: 60, y: 0 }), false);
  t('line near', LM.pointInGeom({ kind: 'line', a: { x: 0, y: 0 }, b: { x: 100, y: 0 } }, { x: 50, y: 4 }), true);
  t('line far', LM.pointInGeom({ kind: 'line', a: { x: 0, y: 0 }, b: { x: 100, y: 0 } }, { x: 50, y: 20 }), false);
  t('rect inside', LM.pointInGeom({ kind: 'rect', cx: 0, cy: 0, w: 100, h: 60, rot: 0 }, { x: 30, y: 20 }), true);
  t('rect outside', LM.pointInGeom({ kind: 'rect', cx: 0, cy: 0, w: 100, h: 60, rot: 0 }, { x: 80, y: 0 }), false);
  t('text box', LM.pointInGeom({ kind: 'text', text: 'hello', x: 0, y: 0, size: 24 }, { x: 20, y: 5 }), true);
}

/* 6 — events & state across frames (same node objects, fresh ctx per frame) */
{
  // hotspot armed→click cycle + per-list-index latch independence (3 circles, click the middle)
  const g = { nodes: [
      { id: 'sr', type: 'sets/series', values: { S: -160, N: 160, C: 3 } },
      { id: 'pt', type: 'vec/construct', values: {} },
      { id: 'ci', type: 'crv/circle', values: { R: 46 } },
      { id: 'hs', type: 'input/hotspot', values: {} },
      { id: 'la', type: 'state/latch', values: {} } ],
    wires: [ { from: ['sr', 'S'], to: ['pt', 'X'] }, { from: ['pt', 'P'], to: ['ci', 'P'] },
      { from: ['ci', 'C'], to: ['hs', 'G'] }, { from: ['hs', 'C'], to: ['la', 'T'] } ] };
  const frame = mod => { const c = mkCtx(); c.mouse.x = 0; c.mouse.y = 0; if (mod) mod(c); LM.evaluateGraph(g, NODE_DEFS, c); return c; };
  const f1 = frame(c => { c.mouse.down = true; c.mouse.pressed = true; });
  if ((f1.out.hs.H || []).join(',') !== 'false,true,false') failures.push('hotspot hover: expected false,true,false got [' + (f1.out.hs.H || []).join(',') + ']');
  if (f1.out.hs.C.some(Boolean)) failures.push('hotspot: click fired on press frame');
  const f2 = frame(c => { c.mouse.released = true; });
  if ((f2.out.hs.C || []).join(',') !== 'false,true,false') failures.push('hotspot click: expected false,true,false got [' + (f2.out.hs.C || []).join(',') + ']');
  const f3 = frame();
  if (f3.out.hs.C.some(Boolean)) failures.push('hotspot: click is not frame-latched');
  if ((f3.out.la.B || []).join(',') !== 'false,true,false') failures.push('per-index latch: expected false,true,false got [' + (f3.out.la.B || []).join(',') + ']');
}
{
  // keyboard trigger → counter/latch; edge; prev; smooth snap; timer
  const g = { nodes: [
      { id: 'kb', type: 'input/keyboard', values: { K: 'space' } },
      { id: 'ct', type: 'state/counter', values: {} },
      { id: 'ed', type: 'state/edge', values: {} },
      { id: 'tm', type: 'input/time', values: {} },
      { id: 'pv', type: 'state/prev', values: {} },
      { id: 'sm', type: 'state/smooth', values: { V: 10, S: 8 } },
      { id: 'ti', type: 'state/timer', values: {} } ],
    wires: [ { from: ['kb', 'P'], to: ['ct', 'U'] }, { from: ['kb', 'D'], to: ['ed', 'B'] },
      { from: ['tm', 'T'], to: ['pv', 'V'] }, { from: ['kb', 'P'], to: ['ti', 'T'] } ] };
  const frame = mod => { const c = mkCtx(); c.dt = 0.5; if (mod) mod(c); LM.evaluateGraph(g, NODE_DEFS, c); return c; };
  const f1 = frame(c => { c.t = 1; c.keys.pressed.space = true; c.keys.down.space = true; });
  const f2 = frame(c => { c.t = 2; c.keys.down.space = true; });
  const f3 = frame(c => { c.t = 3; c.keys.pressed.space = true; c.keys.down.space = true; });
  if (f3.out.ct.N[0] !== 2) failures.push('counter: expected 2 got ' + f3.out.ct.N[0]);
  if (f1.out.ed.R[0] !== false) failures.push('edge: fired on first frame');
  if (f2.out.ed.R[0] !== false) failures.push('edge: fired without a rise');
  if (f1.out.pv.P[0] !== 1) failures.push('prev: first frame should pass through, got ' + f1.out.pv.P[0]);
  if (f2.out.pv.P[0] !== 1 || f3.out.pv.P[0] !== 2) failures.push('prev: expected 1 then 2, got ' + f2.out.pv.P[0] + ',' + f3.out.pv.P[0]);
  if (f1.out.sm.R[0] !== 10) failures.push('smooth: should snap to target on first frame, got ' + f1.out.sm.R[0]);
  if (!(f3.out.ti.S[0] > 0 && f3.out.ti.S[0] <= 0.5 + 1e-9)) failures.push('timer: restart on trigger broken, got ' + f3.out.ti.S[0]);
  if (f3.out.ti.A[0] !== true) failures.push('timer: not running after trigger');
  // smooth follows a moved target without overshooting
  g.nodes[5].values.V = 20;
  const f4 = frame();
  if (!(f4.out.sm.R[0] > 10 && f4.out.sm.R[0] < 20)) failures.push('smooth: expected between 10 and 20, got ' + f4.out.sm.R[0]);
}

/* 7 — set operations & list surgery (computes are pure — call them directly) */
{
  const eq = (name, got, want) => {
    const a = JSON.stringify(got), b = JSON.stringify(want);
    if (a !== b) failures.push('sets ' + name + ': expected ' + b + ' got ' + a);
  };
  eq('setEq number epsilon', LM.setEq(0.1 + 0.2, 0.3), true);
  eq('setEq points', LM.setEq({ x: 1, y: 2 }, { x: 1, y: 2 }), true);
  eq('setEq geometry', LM.setEq({ kind: 'circle', cx: 0, cy: 0, r: 5 }, { kind: 'circle', cx: 0, cy: 0, r: 5 }), true);
  eq('setEq mismatch', LM.setEq(1, '1'), false);
  eq('union', NODE_DEFS['sets/union'].compute({ A: [1, 2, 2, 3], B: [3, 4] }).U, [1, 2, 3, 4]);
  eq('intersection', NODE_DEFS['sets/intersection'].compute({ A: [1, 2, 2, 3], B: [2, 3, 5] }).I, [2, 3]);
  eq('difference', NODE_DEFS['sets/difference'].compute({ A: [1, 2, 2, 3], B: [2] }).D, [1, 3]);
  eq('cull pattern', NODE_DEFS['sets/cullpat'].compute({ L: [1, 2, 3, 4, 5], P: [true, false] }).L, [1, 3, 5]);
  eq('shift wrap', NODE_DEFS['sets/shift'].compute({ L: [1, 2, 3, 4], S: 1, W: true }).L, [2, 3, 4, 1]);
  eq('shift negative no-wrap', NODE_DEFS['sets/shift'].compute({ L: [1, 2, 3, 4], S: -1, W: false }).L, [1, 2, 3]);
  eq('dispatch', NODE_DEFS['sets/dispatch'].compute({ L: [1, 2, 3, 4], P: [true, false] }), { A: [1, 3], B: [2, 4] });
}

/* 8 — altitude nodes: comparison, logic, select, mass addition, measure text */
{
  const eq = (name, got, want) => {
    const a = JSON.stringify(got), b = JSON.stringify(want);
    if (a !== b) failures.push('altitude ' + name + ': expected ' + b + ' got ' + a);
  };
  const cmp = (mode, A, B) => NODE_DEFS['math/cmp'].compute({ A, B }, mkCtx(), { values: { mode } }).R;
  eq('cmp =', cmp('=', 0.1 + 0.2, 0.3), true);
  eq('cmp <', cmp('<', 1, 2), true);
  eq('cmp ≥', cmp('≥', 2, 2), true);
  eq('cmp ≠', cmp('≠', 1, 2), true);
  const lg = (mode, A, B) => NODE_DEFS['math/logic'].compute({ A, B }, mkCtx(), { values: { mode } }).R;
  eq('logic and', lg('and', true, false), false);
  eq('logic or', lg('or', true, false), true);
  eq('logic xor', lg('xor', true, true), false);
  eq('logic not', lg('not', false, true), true);
  eq('select', NODE_DEFS['sets/select'].compute({ T: ['a'], F: ['b'], P: [true, false, true] }).L, ['a', 'b', 'a']);
  eq('select data-length', NODE_DEFS['sets/select'].compute({ T: [1, 2, 3], F: [9], P: [false, true] }).L, [9, 2, 9]);
  eq('masadd', NODE_DEFS['math/masadd'].compute({ L: [1, 2, 3] }), { R: 6, P: [1, 3, 6] });
  eq('textlist', NODE_DEFS['params/textlist'].compute({}, mkCtx(), { values: { text: 'a\\nb\\n\\nc' } }).L, ['a', 'b', 'c']);
  const m = NODE_DEFS['disp/measure'].compute({ T: 'hello', S: 20, P: { x: 5, y: 6 } }, mkCtx());
  eq('measure W', m.W, 60);
  eq('measure rect', m.G, { kind: 'rect', cx: 5, cy: 6, w: 60, h: 24, rot: 0 });
  const bounds = LM.geomBounds({ kind: 'circle', cx: 10, cy: -5, r: 20 });
  if (Math.abs(bounds.x + 10) > 0.5 || Math.abs(bounds.w - 40) > 0.5) failures.push('geomBounds circle: got ' + JSON.stringify(bounds));
}

/* 9 — delay: a legal feedback loop that integrates (add ← delay ← add) */
{
  const g = { nodes: [
      { id: 'ad', type: 'math/add', values: { B: 1 } },
      { id: 'dl', type: 'state/delay', values: {} } ],
    wires: [ { from: ['dl', 'V'], to: ['ad', 'A'] }, { from: ['ad', 'R'], to: ['dl', 'V'] } ] };
  const c1 = mkCtx();
  LM.evaluateGraph(g, NODE_DEFS, c1);
  if (Object.keys(c1.errors).length) failures.push('delay: feedback loop errored → ' + JSON.stringify(c1.errors));
  if ((c1.out.ad.R || [])[0] !== 1) failures.push('delay frame1: expected add=1 got ' + (c1.out.ad.R || [])[0]);
  const c2 = mkCtx();
  LM.evaluateGraph(g, NODE_DEFS, c2);
  if ((c2.out.ad.R || [])[0] !== 2) failures.push('delay frame2: expected add=2 got ' + (c2.out.ad.R || [])[0]);
  const c3 = mkCtx();
  LM.evaluateGraph(g, NODE_DEFS, c3);
  if ((c3.out.dl.V || [])[0] !== 2) failures.push('delay frame3: expected delayed 2 got ' + (c3.out.dl.V || [])[0]);
}

/* 10 — clusters: inner graph evaluates through ports; nested clusters; export */
{
  // inner: portin X → math/neg → portout R, plus a series → portout S
  const clusterNode = {
    id: 'cl', type: 'meta/cluster', x: 0, y: 0,
    values: {
      title: 'test cluster',
      ins: [{ name: 'X', type: 'number' }],
      outs: [{ name: 'R', type: 'number' }, { name: 'S', type: 'number' }],
      graph: { nodes: [
          { id: 'a', type: 'meta/portin', values: { port: 'X' } },
          { id: 'b', type: 'math/neg', values: {} },
          { id: 'c', type: 'meta/portout', values: { port: 'R' } },
          { id: 'd', type: 'sets/series', values: { S: 0, N: 10, C: 3 } },
          { id: 'e', type: 'meta/portout', values: { port: 'S' } } ],
        wires: [ { from: ['a', 'V'], to: ['b', 'V'] }, { from: ['b', 'R'], to: ['c', 'V'] },
          { from: ['d', 'S'], to: ['e', 'V'] } ] }
    }
  };
  const g = { nodes: [
      { id: 'sr', type: 'sets/series', values: { S: 1, N: 1, C: 3 } },
      clusterNode ],
    wires: [ { from: ['sr', 'S'], to: ['cl', 'X'] } ] };
  const c = mkCtx();
  LM.evaluateGraph(g, NODE_DEFS, c);
  if (Object.keys(c.errors).length) failures.push('cluster: errored → ' + JSON.stringify(c.errors));
  if ((c.out.cl.R || []).join(',') !== '-1,-2,-3') failures.push('cluster ports: expected -1,-2,-3 got [' + (c.out.cl.R || []).join(',') + ']');
  if ((c.out.cl.S || []).join(',') !== '0,10,20') failures.push('cluster generator out: expected 0,10,20 got [' + (c.out.cl.S || []).join(',') + ']');
  // nested: a cluster whose inner graph contains the cluster above
  const outer = {
    id: 'cl2', type: 'meta/cluster', x: 0, y: 0,
    values: {
      title: 'outer', ins: [{ name: 'A', type: 'number' }], outs: [{ name: 'Z', type: 'number' }],
      graph: { nodes: [
          { id: 'p', type: 'meta/portin', values: { port: 'A' } },
          JSON.parse(JSON.stringify(clusterNode)),
          { id: 'q', type: 'meta/portout', values: { port: 'Z' } } ],
        wires: [ { from: ['p', 'V'], to: ['cl', 'X'] }, { from: ['cl', 'R'], to: ['q', 'V'] } ] }
    }
  };
  const g2 = { nodes: [outer], wires: [] };
  const c2 = mkCtx();
  LM.evaluateGraph(g2, NODE_DEFS, c2);
  if (Object.keys(c2.errors).length) failures.push('nested cluster: errored → ' + JSON.stringify(c2.errors));
  // unwired A falls back to nothing → R should be empty; wire a literal instead
  g2.nodes[0].values.graph.nodes[0].values.port = 'A';
  const g3 = { nodes: [ { id: 's', type: 'params/slider', values: { min: 0, max: 10, value: 4 } }, outer ],
    wires: [ { from: ['s', 'N'], to: ['cl2', 'A'] } ] };
  const c3 = mkCtx();
  LM.evaluateGraph(g3, NODE_DEFS, c3);
  if ((c3.out.cl2.Z || []).join(',') !== '-4') failures.push('nested cluster value: expected -4 got [' + (c3.out.cl2.Z || []).join(',') + ']');
  // export: defs must be collected through cluster subgraphs
  const js = WeftExport.buildJS({ nodes: [clusterNode], wires: [] });
  try { new Function(js); } catch (e) { failures.push('cluster export does not compile → ' + e.message); }
  if (js.indexOf('meta/portin') < 0 || js.indexOf('math/neg') < 0) failures.push('cluster export: inner defs not collected');
}

/* 11 — element node declares real DOM and reads state back */
{
  const g = { nodes: [
      { id: 'r', type: 'crv/rect', values: { P: { x: 0, y: 0 }, W: 100, H: 40 } },
      { id: 'el', type: 'disp/element', values: { T: 'a', C: 'home', A: 'href=/home\\naria-current=page' } } ],
    wires: [ { from: ['r', 'C'], to: ['el', 'G'] } ] };
  const c = mkCtx();
  c.domState['el:0'] = { hover: true, focus: false, down: false, clicks: 2 };
  LM.evaluateGraph(g, NODE_DEFS, c);
  const d = c.domList.find(x => x.kind === 'element');
  if (!d) failures.push('element: nothing declared into domList');
  else {
    if (d.tag !== 'a' || d.text !== 'home') failures.push('element: bad tag/text ' + JSON.stringify(d));
    if (!d.attrs || d.attrs.href !== '/home' || d.attrs['aria-current'] !== 'page') failures.push('element: attrs not parsed ' + JSON.stringify(d.attrs));
    if (Math.abs(d.rect.x + 50) > 0.5 || Math.abs(d.rect.w - 100) > 0.5) failures.push('element: rect wrong ' + JSON.stringify(d.rect));
  }
  if ((c.out.el.H || [])[0] !== true) failures.push('element: hover state not read back');
  // clicked trigger: second frame with same clicks must not fire
  const c2 = mkCtx();
  c2.domState['el:0'] = { hover: false, focus: false, down: false, clicks: 3 };
  LM.evaluateGraph(g, NODE_DEFS, c2);
  if ((c2.out.el.K || [])[0] !== true) failures.push('element: click trigger did not fire on new click');
  const c3 = mkCtx();
  c3.domState['el:0'] = { hover: false, focus: false, down: false, clicks: 3 };
  LM.evaluateGraph(g, NODE_DEFS, c3);
  if ((c3.out.el.K || [])[0] !== false) failures.push('element: click trigger is not frame-latched');
}

/* 12 — audio nodes declare descriptors with handle chains; export carries the host */
{
  const g = { nodes: [
      { id: 'o', type: 'audio/osc', values: { wave: 'sine' } },
      { id: 'gn', type: 'audio/gain', values: {} },
      { id: 'ao', type: 'audio/out', values: {} } ],
    wires: [ { from: ['o', 'A'], to: ['gn', 'In'] }, { from: ['gn', 'A'], to: ['ao', 'In'] } ] };
  const c = mkCtx();
  LM.evaluateGraph(g, NODE_DEFS, c);
  if (Object.keys(c.errors).length) failures.push('audio chain: errored → ' + JSON.stringify(c.errors));
  if (c.audioList.length !== 3) failures.push('audio chain: expected 3 descriptors got ' + c.audioList.length);
  const byKind = {};
  for (const d of c.audioList) byKind[d.kind] = d;
  if (!byKind.osc || !byKind.gain || !byKind.out) failures.push('audio chain: missing kinds ' + JSON.stringify(Object.keys(byKind)));
  else {
    if ((byKind.gain.src || []).join(',') !== 'o:0') failures.push('audio gain src: expected o:0 got [' + (byKind.gain.src || []).join(',') + ']');
    if ((byKind.out.src || []).join(',') !== 'gn:0') failures.push('audio out src: expected gn:0 got [' + (byKind.out.src || []).join(',') + ']');
  }
  // list matching = voices: 3 frequencies → 3 osc descriptors, gain follows per-item
  const g2 = { nodes: [
      { id: 'sr', type: 'sets/series', values: { S: 220, N: 55, C: 3 } },
      { id: 'o', type: 'audio/osc', values: {} },
      { id: 'gn', type: 'audio/gain', values: {} } ],
    wires: [ { from: ['sr', 'S'], to: ['o', 'F'] }, { from: ['o', 'A'], to: ['gn', 'In'] } ] };
  const c2 = mkCtx();
  LM.evaluateGraph(g2, NODE_DEFS, c2);
  const oscs = c2.audioList.filter(d => d.kind === 'osc');
  const gains = c2.audioList.filter(d => d.kind === 'gain');
  if (oscs.length !== 3) failures.push('audio voices: expected 3 oscs got ' + oscs.length);
  if (oscs.length === 3 && (oscs[0].freq !== 220 || oscs[2].freq !== 330)) failures.push('audio voices: freqs wrong ' + oscs.map(d => d.freq).join(','));
  if (gains.length !== 3 || gains.map(d => d.src.join()).join(',') !== 'o:0,o:1,o:2') failures.push('audio voices: gain srcs wrong ' + JSON.stringify(gains.map(d => d.src)));
  // cluster forwarding: an osc inside a cluster lands in the outer audioList
  const g3 = { nodes: [ {
      id: 'cl', type: 'meta/cluster', x: 0, y: 0,
      values: { title: 'voice', ins: [], outs: [],
        graph: { nodes: [ { id: 'io', type: 'audio/osc', values: {} } ], wires: [] } }
    } ], wires: [] };
  const c3 = mkCtx();
  LM.evaluateGraph(g3, NODE_DEFS, c3);
  if (Object.keys(c3.errors).length) failures.push('audio in cluster: errored → ' + JSON.stringify(c3.errors));
  if (!c3.audioList.some(d => d.kind === 'osc')) failures.push('audio in cluster: descriptor not forwarded to outer ctx');
  // export: audio graph carries the serialized host; non-audio graphs stay clean
  try {
    const js = WeftExport.buildJS(g);
    new Function(js);
    if (js.indexOf('WeftAudio') < 0) failures.push('audio export: WeftAudio host missing');
    if (js.indexOf('audio.sync') < 0) failures.push('audio export: sync call missing');
  } catch (e) { failures.push('audio export does not compile → ' + e.message); }
  const plain = WeftExport.buildJS({ nodes: [ { id: 'ci', type: 'crv/circle', values: {} } ], wires: [] });
  if (plain.indexOf('WeftAudio') >= 0) failures.push('non-audio export: WeftAudio leaked in');
}

/* 13 — pitch helpers + trace px semantics */
{
  const n = NODE_DEFS['audio/note'].compute({ N: -1, O: 4 }, mkCtx(), { values: { note: 9 } });
  if (Math.abs(n.F - 432) > 1e-6 || n.M !== 69) failures.push('note: A4 should be 432/69 (432 tuning default), got ' + n.F + '/' + n.M);
  const c440 = mkCtx(); c440.tuneA4 = 440;
  const n440 = NODE_DEFS['audio/note'].compute({ N: -1, O: 4 }, c440, { values: { note: 9 } });
  if (Math.abs(n440.F - 440) > 1e-6) failures.push('note: A4 at 440 tuning should be 440, got ' + n440.F);
  const nOv = NODE_DEFS['audio/note'].compute({ N: 5, O: 4 }, mkCtx(), { values: { note: 9 } });
  if (nOv.M !== 65) failures.push('note: N=5 O=4 should override picker to midi 65 (F4), got ' + nOv.M);
  const nRoll = NODE_DEFS['audio/note'].compute({ N: 12, O: 4 }, mkCtx(), { values: { note: 0 } });
  if (nRoll.M !== 72) failures.push('note: N=12 should roll into the next octave (midi 72), got ' + nRoll.M);
  const sc = NODE_DEFS['audio/scale'].compute({ V: 70 }, mkCtx(), { values: { root: 9, scale: 'pentatonic' } });
  if (sc.M !== 69) failures.push('scale: 70 in A pent should snap to 69, got ' + sc.M);
  const sc2 = NODE_DEFS['audio/scale'].compute({ V: 70 }, mkCtx(), { values: { root: 9, scale: 'chromatic' } });
  if (sc2.M !== 70) failures.push('scale chromatic: should pass 70 through, got ' + sc2.M);
  // trace: trail is always L px regardless of fps/speed — samples live at px positions
  const tn = { id: 'tr', values: {} };
  const args = { V: [10], C: [], P: { x: 0, y: 0 }, D: { x: -100, y: 0 }, L: 50, W: 1 };
  let out = null;
  for (let f = 0; f < 200; f++) {
    const c = mkCtx(); c.t = f * 0.016; c.dt = 0.016;
    out = NODE_DEFS['disp/trace'].compute(args, c, tn);
  }
  const pts = (out.G[0] || {}).pts || [];
  let xMin = Infinity, xMax = -Infinity;
  for (const p of pts) { if (p.x < xMin) xMin = p.x; if (p.x > xMax) xMax = p.x; }
  const span = xMax - xMin;
  if (!(span > 45 && span <= 50.5)) failures.push('trace: 50px trail spans ' + span.toFixed(1) + 'px (want ~50)');
}

/* 14 — mic read-back, cymatics settling, tuning in exports */
{
  const g = { nodes: [ { id: 'mc', type: 'audio/mic', values: {} } ], wires: [] };
  const c = mkCtx();
  c.audioState['mc:0'] = { level: 0.4, ready: true };
  LM.evaluateGraph(g, NODE_DEFS, c);
  if (!c.audioList.some(d => d.kind === 'mic')) failures.push('mic: descriptor not declared into audioList');
  if (Math.abs((c.out.mc.V || [])[0] - 0.4) > 1e-9) failures.push('mic: level not read back, got ' + (c.out.mc.V || [])[0]);
  if ((c.out.mc.A || [])[0] !== 'mc:0') failures.push('mic: audio handle not returned');
  if ((c.out.mc.R || [])[0] !== true) failures.push('mic: ready flag not read back');
  const c2 = mkCtx();
  c2.audioState['mc:0'] = { level: 0.8, ready: true };
  g.nodes[0].values.G = 2;
  LM.evaluateGraph(g, NODE_DEFS, c2);
  if ((c2.out.mc.V || [])[0] !== 1) failures.push('mic: boosted level should clamp to 1, got ' + (c2.out.mc.V || [])[0]);

  // cymatics: grains migrate toward nodal lines (mean |amplitude| falls as it settles)
  const cy = { id: 'cy', values: {} };
  const cyArgs = { F: 220, P: { x: 0, y: 0 }, S: 320, N: 900, C: { r: 255, g: 255, b: 255, a: 1 }, W: 1 };
  const k = Math.log2(220 / 32.7), u = 1 + k * 0.9, v = 2 + k * 1.45, PI = Math.PI;
  const amp = (x, y) => Math.cos(u * PI * x) * Math.cos(v * PI * y) - Math.cos(v * PI * x) * Math.cos(u * PI * y);
  const meanAmp = () => {
    const pts = cy._state[0].pts;
    let s = 0;
    for (const p of pts) s += Math.abs(amp(p.x, p.y));
    return s / pts.length;
  };
  const c3 = mkCtx();
  NODE_DEFS['disp/cymatics'].compute(cyArgs, c3, cy);
  if (c3.drawList.length !== 900) failures.push('cymatics: expected 900 grains drawn, got ' + c3.drawList.length);
  const a0 = meanAmp();
  for (let f = 0; f < 240; f++) NODE_DEFS['disp/cymatics'].compute(cyArgs, mkCtx(), cy);
  const a1 = meanAmp();
  if (!(a1 < a0 * 0.75)) failures.push('cymatics: grains did not settle toward nodal lines (' + a0.toFixed(3) + ' → ' + a1.toFixed(3) + ')');

  // tuning: graph meta rides into the export and the exported ctx carries it
  const js = WeftExport.buildJS({ meta: { tuneA4: 440 }, nodes: [ { id: 'o', type: 'audio/osc', values: {} } ], wires: [] });
  if (js.indexOf('"tuneA4":440') < 0) failures.push('export: graph meta tuneA4 not serialized');
  if (js.indexOf('tuneA4: (GRAPH.meta && GRAPH.meta.tuneA4) || 432') < 0) failures.push('export: ctx tuneA4 default missing');
  if (js.indexOf('audio.state()') < 0) failures.push('export: audio graph ctx should read audio.state()');
  const js2 = WeftExport.buildJS({ nodes: [ { id: 'ci', type: 'crv/circle', values: {} } ], wires: [] });
  if (js2.indexOf('audio.state()') >= 0) failures.push('export: non-audio graph should not reference audio.state()');
}

/* 15 — oscilloscope: tap declaration, trigger lock, level math */
{
  const g = { nodes: [
      { id: 'o', type: 'audio/osc', values: {} },
      { id: 'sc', type: 'audio/scope', values: {} } ],
    wires: [ { from: ['o', 'A'], to: ['sc', 'In'] } ] };
  const c = mkCtx();
  LM.evaluateGraph(g, NODE_DEFS, c);
  const d = c.audioList.find(x => x.kind === 'scope');
  if (!d) failures.push('scope: descriptor not declared');
  else if ((d.src || []).join(',') !== 'o:0') failures.push('scope: src should be [o:0], got [' + (d.src || []).join(',') + ']');
  if ((c.out.sc.G || [])[0] && c.out.sc.G[0].kind !== 'line') failures.push('scope: no signal should draw a flat line');
  if ((c.out.sc.V || []).length) failures.push('scope: no signal should output empty samples');

  // synthetic full-scale sine starting mid-cycle: trigger must lock near a rising zero
  const wave = new Float32Array(2048);
  for (let i = 0; i < wave.length; i++) wave[i] = Math.sin(2 * Math.PI * (i + 37) / 100);
  const c2 = mkCtx();
  c2.audioState['sc:0'] = { wave, sr: 48000, ready: true };
  LM.evaluateGraph(g, NODE_DEFS, c2);
  const V = c2.out.sc.V || [], L = (c2.out.sc.L || [])[0], G = (c2.out.sc.G || [])[0];
  if (!V.length) failures.push('scope: samples not read back');
  else {
    if (Math.abs(V[0]) > 0.15 || !(V[1] > V[0])) failures.push('scope: trigger not locked to rising zero (V0=' + V[0] + ', V1=' + V[1] + ')');
    if (Math.abs(L - 1) > 0.05) failures.push('scope: full-scale sine level should be ~1, got ' + L);
    if (!G || G.kind !== 'poly' || G.pts.length !== V.length) failures.push('scope: waveform poly mismatch');
    if (G && G.pts.length > 512) failures.push('scope: beam should cap at 512 points, got ' + G.pts.length);
  }

  // vector scope: declares two taps; cos vs sin at one frequency draws a circle
  const g2 = { nodes: [
      { id: 'ox', type: 'audio/osc', values: {} },
      { id: 'oy', type: 'audio/osc', values: {} },
      { id: 'xy', type: 'audio/xyscope', values: { S: 200 } } ],
    wires: [ { from: ['ox', 'A'], to: ['xy', 'X'] }, { from: ['oy', 'A'], to: ['xy', 'Y'] } ] };
  const c4 = mkCtx();
  LM.evaluateGraph(g2, NODE_DEFS, c4);
  const taps = c4.audioList.filter(x => x.kind === 'scope');
  if (taps.length !== 2) failures.push('xyscope: expected 2 tap descriptors, got ' + taps.length);
  else if (taps[0].src.join(',') !== 'ox:0' || taps[1].src.join(',') !== 'oy:0')
    failures.push('xyscope: tap srcs wrong (' + taps[0].src + ' / ' + taps[1].src + ')');
  const wx = new Float32Array(2048), wy = new Float32Array(2048);
  for (let i = 0; i < 2048; i++) {
    wx[i] = Math.cos(2 * Math.PI * i / 480);
    wy[i] = Math.sin(2 * Math.PI * i / 480);
  }
  const c5 = mkCtx();
  c5.audioState['xy:0x'] = { wave: wx, sr: 48000, ready: true };
  c5.audioState['xy:0y'] = { wave: wy, sr: 48000, ready: true };
  LM.evaluateGraph(g2, NODE_DEFS, c5);
  const fig = (c5.out.xy.G || [])[0];
  if (!fig || fig.kind !== 'poly') failures.push('xyscope: expected a poly figure');
  else {
    let bad = 0;
    for (const p of fig.pts) {
      const r = Math.hypot(p.x, p.y);
      if (Math.abs(r - 100) > 1) bad++;
    }
    if (bad) failures.push('xyscope: cos/sin should trace a 100px-radius circle (' + bad + '/' + fig.pts.length + ' points off)');
    if (fig.pts.length > 1024) failures.push('xyscope: beam should cap at 1024 points, got ' + fig.pts.length);
  }
}

/* 16 — mix (summing), path-to-audio (resample + key), harmonograph */
{
  const g = { nodes: [
      { id: 'o1', type: 'audio/osc', values: {} },
      { id: 'o2', type: 'audio/osc', values: { F: 330 } },
      { id: 'mx', type: 'audio/mix', values: {} } ],
    wires: [ { from: ['o1', 'A'], to: ['mx', 'In'] }, { from: ['o2', 'A'], to: ['mx', 'In'] } ] };
  const c = mkCtx();
  LM.evaluateGraph(g, NODE_DEFS, c);
  const mx = c.audioList.find(d => d.id === 'mx:0');
  if (!mx) failures.push('mix: no descriptor');
  else if ((mx.src || []).join(',') !== 'o1:0,o2:0') failures.push('mix: should sum both handles, got [' + (mx.src || []).join(',') + ']');

  const pa = { id: 'pa', values: {} };
  const circle = { kind: 'circle', cx: 40, cy: -10, r: 75 };
  const c2 = mkCtx();
  const r1 = NODE_DEFS['audio/path'].compute({ G: circle, F: 108 }, c2, pa);
  const dx = c2.audioList.find(d => d.id === 'pa:0x'), dy = c2.audioList.find(d => d.id === 'pa:0y');
  if (!dx || !dy) failures.push('path: expected x+y descriptors');
  else {
    if (dx.key !== dy.key) failures.push('path: x/y keys must be shared (phase lock)');
    if (dx.wave.length !== 512 || dy.wave.length !== 512) failures.push('path: expected 512-sample loops');
    let bad = 0;
    for (let k = 0; k < 512; k += 16) {
      const rr = Math.hypot(dx.wave[k], dy.wave[k]);
      if (Math.abs(rr - 1) > 0.06) bad++;
    }
    if (bad) failures.push('path: circle should resample to the unit circle (' + bad + ' spots off)');
    const c3 = mkCtx();
    NODE_DEFS['audio/path'].compute({ G: circle, F: 108 }, c3, pa);
    if (c3.audioList[0].key !== dx.key) failures.push('path: same geometry must produce the same key');
    const c4 = mkCtx();
    NODE_DEFS['audio/path'].compute({ G: { kind: 'circle', cx: 40, cy: -10, r: 75 }, F: 108 }, c4, pa);
    const c5 = mkCtx();
    NODE_DEFS['audio/path'].compute({ G: { kind: 'rect', cx: 0, cy: 0, w: 100, h: 60, rot: 0 }, F: 108 }, c5, pa);
    if (c5.audioList[0].key === c4.audioList[0].key) failures.push('path: different shapes should change the key');
    if (r1.X !== 'pa:0x' || r1.Y !== 'pa:0y') failures.push('path: handle outputs wrong');
  }

  const c6 = mkCtx();
  const hg = NODE_DEFS['disp/harmonograph'].compute(
    { X: 3, Y: 2, H: 0, D: 0.05, T: 44, P: { x: 0, y: 0 }, S: 320, C: { r: 255, g: 255, b: 255, a: 1 } }, c6, { id: 'hg', values: {} });
  const pts = hg.G.pts;
  if (!pts || pts.length < 256) failures.push('harmonograph: too few pen points');
  else {
    if (Math.hypot(pts[0].x, pts[0].y) > 1e-6) failures.push('harmonograph: pen should start at centre (sin 0)');
    const rad = ps => Math.max(...ps.map(p => Math.hypot(p.x, p.y)));
    const early = rad(pts.slice(0, pts.length >> 3)), late = rad(pts.slice(-(pts.length >> 3)));
    if (!(late < early * 0.4)) failures.push('harmonograph: damping should shrink the figure (' + early.toFixed(1) + ' → ' + late.toFixed(1) + ')');
    const escape = pts.filter(p => Math.abs(p.x) > 160.5 || Math.abs(p.y) > 160.5).length;
    if (escape) failures.push('harmonograph: pen escaped the S/2 half-size on ' + escape + ' points');
  }
}

/* 17 — pitch in, track in, cymatics reset + anti-collapse */
{
  const g = { nodes: [ { id: 'pt', type: 'audio/pitch', values: {} } ], wires: [] };
  const c = mkCtx();
  c.audioState['pt:0'] = { freq: 432, clarity: 0.9, level: 0.3, ready: true };
  LM.evaluateGraph(g, NODE_DEFS, c);
  const pd0 = c.audioList.find(d => d.kind === 'pitch');
  if (!pd0) failures.push('pitch: descriptor not declared');
  else if ((pd0.src || []).length) failures.push('pitch: unwired input should have empty src');
  if ((c.out.pt.F || [])[0] !== 432) failures.push('pitch: freq not read back');
  if (Math.abs((c.out.pt.M || [])[0] - 69) > 1e-9) failures.push('pitch: 432 Hz at A4=432 should be midi 69, got ' + (c.out.pt.M || [])[0]);
  if ((c.out.pt.C || [])[0] !== 0.9 || (c.out.pt.R || [])[0] !== true) failures.push('pitch: clarity/ready not read back');
  const cq = mkCtx();
  cq.tuneA4 = 440;
  cq.audioState['pt:0'] = { freq: 440, clarity: 1, ready: true };
  LM.evaluateGraph(g, NODE_DEFS, cq);
  if (Math.abs((cq.out.pt.M || [])[0] - 69) > 1e-9) failures.push('pitch: midi must follow ctx.tuneA4, got ' + (cq.out.pt.M || [])[0]);
  const gp = { nodes: [
      { id: 'o', type: 'audio/osc', values: {} },
      { id: 'pw', type: 'audio/pitch', values: {} } ],
    wires: [ { from: ['o', 'A'], to: ['pw', 'In'] } ] };
  const cp = mkCtx();
  LM.evaluateGraph(gp, NODE_DEFS, cp);
  const pd1 = cp.audioList.find(d => d.kind === 'pitch');
  if (!pd1 || (pd1.src || []).join(',') !== 'o:0') failures.push('pitch: wired audio should land in src, got [' + ((pd1 || {}).src || []).join(',') + ']');

  const g2 = { nodes: [
      { id: 'tk', type: 'audio/track', values: { G: 1.5 } },
      { id: 'ot', type: 'audio/out', values: {} } ],
    wires: [ { from: ['tk', 'A'], to: ['ot', 'In'] } ] };
  const c2 = mkCtx();
  c2.audioState['tk:0'] = { level: 0.5, left: 0.2, right: 0.9, ready: true };
  LM.evaluateGraph(g2, NODE_DEFS, c2);
  const td = c2.audioList.find(d => d.kind === 'track');
  if (!td) failures.push('track: descriptor not declared');
  else if (Math.abs(td.gain - 1.5) > 1e-9) failures.push('track: gain param wrong, got ' + td.gain);
  const od = c2.audioList.find(d => d.kind === 'out');
  if (!od || (od.src || []).join(',') !== 'tk:0') failures.push('track: handle should route into out, got [' + ((od || {}).src || []).join(',') + ']');
  if ((c2.out.tk.V || [])[0] !== 0.5 || (c2.out.tk.S || [])[0] !== true) failures.push('track: level/sharing not read back');
  const chans = c2.audioList.filter(d => d.kind === 'chan');
  if (chans.length !== 2 || chans[0].of !== 'tk:0' || chans[0].ch !== 0 || chans[1].ch !== 1)
    failures.push('track: expected two chan descriptors of the track (ch 0/1)');
  if ((c2.out.tk.L || [])[0] !== 'tk:0l' || (c2.out.tk.R || [])[0] !== 'tk:0r') failures.push('track: L/R handles wrong');
  if ((c2.out.tk.VL || [])[0] !== 0.2 || (c2.out.tk.VR || [])[0] !== 0.9)
    failures.push('track: per-channel levels not read back (VL=' + (c2.out.tk.VL || [])[0] + ' VR=' + (c2.out.tk.VR || [])[0] + ')');
  try { new Function(WeftExport.buildJS(g2)); } catch (e) { failures.push('track: export does not compile — ' + e.message); }

  // fft bands: descriptor + log-band math (energy at 100 Hz lands in band 1 of 8)
  const gf = { nodes: [
      { id: 'o2', type: 'audio/osc', values: {} },
      { id: 'ft', type: 'audio/fft', values: {} } ],
    wires: [ { from: ['o2', 'A'], to: ['ft', 'In'] } ] };
  const cf = mkCtx();
  const bins = new Float32Array(1024); // 48kHz → 23.4 Hz per bin; 100 Hz ≈ bin 4
  bins[3] = bins[4] = bins[5] = 1;
  cf.audioState['ft:0'] = { bins, sr: 48000, ready: true };
  LM.evaluateGraph(gf, NODE_DEFS, cf);
  const fd = cf.audioList.find(d => d.kind === 'fft');
  if (!fd || (fd.src || []).join(',') !== 'o2:0') failures.push('fft: descriptor/src wrong');
  else if (Math.abs(fd.tc - 0.75) > 1e-9) failures.push('fft: smoothing default wrong, got ' + fd.tc);
  const B = cf.out.ft.B || [];
  if (B.length !== 8) failures.push('fft: expected 8 default bands, got ' + B.length);
  else {
    if (!(B[1] > 0.4)) failures.push('fft: 100 Hz energy should land in band 1, got ' + B[1].toFixed(3));
    if (B[6] > 0.05 || B[7] > 0.05) failures.push('fft: high bands should be silent');
  }
  if ((cf.out.ft.R || [])[0] !== true) failures.push('fft: ready not read back');
  const cf2 = mkCtx();
  gf.nodes[1].values.N = 200;
  LM.evaluateGraph(gf, NODE_DEFS, cf2);
  if ((cf2.out.ft.B || []).length !== 64) failures.push('fft: band count should clamp to 64');

  // cymatics: settled grains must stay spread across the plate (no center-line
  // collapse), and flipping R re-throws the sand
  const cy = { id: 'cy', values: {} };
  const cyArgs = { F: 220, P: { x: 0, y: 0 }, S: 320, N: 900, C: { r: 255, g: 255, b: 255, a: 1 }, W: 1, R: false };
  for (let f = 0; f < 600; f++) NODE_DEFS['disp/cymatics'].compute(cyArgs, mkCtx(), cy);
  const pts = cy._state[0].pts;
  const sd = axis => {
    let m = 0; for (const p of pts) m += p[axis]; m /= pts.length;
    let s = 0; for (const p of pts) s += (p[axis] - m) * (p[axis] - m);
    return Math.sqrt(s / pts.length);
  };
  if (sd('x') < 0.3 || sd('y') < 0.3)
    failures.push('cymatics: grains collapsed (stddev x=' + sd('x').toFixed(2) + ' y=' + sd('y').toFixed(2) + ')');
  const before = pts.map(p => ({ x: p.x, y: p.y }));
  NODE_DEFS['disp/cymatics'].compute(Object.assign({}, cyArgs, { R: true }), mkCtx(), cy);
  const after = cy._state[0].pts;
  let moved = 0;
  for (let i = 0; i < before.length; i++) moved += Math.hypot(after[i].x - before[i].x, after[i].y - before[i].y);
  if (!(moved / before.length > 0.3)) failures.push('cymatics: R edge should re-throw the sand (mean move ' + (moved / before.length).toFixed(3) + ')');
}

/* 18 — geometry primitives: vectors, matrices, polyline analysis */
{
  const near = (name, got, want, tol) => {
    if (!(Math.abs(got - want) <= (tol === undefined ? 1e-9 : tol)))
      failures.push('geom ' + name + ': expected ' + want + ' got ' + got);
  };
  const nearPt = (name, got, wx, wy, tol) => {
    if (!got || !(Math.abs(got.x - wx) <= (tol || 1e-9) && Math.abs(got.y - wy) <= (tol || 1e-9)))
      failures.push('geom ' + name + ': expected (' + wx + ', ' + wy + ') got ' + JSON.stringify(got));
  };
  const sq = (cx, cy, s) => [{ x: cx - s, y: cy - s }, { x: cx + s, y: cy - s }, { x: cx + s, y: cy + s }, { x: cx - s, y: cy + s }];
  const area = p => Math.abs(LM.polyArea(p));

  near('vdot', LM.vdot({ x: 3, y: 4 }, { x: 2, y: 1 }), 10);
  near('vcross', LM.vcross({ x: 1, y: 0 }, { x: 0, y: 1 }), 1);
  nearPt('vunit', LM.vunit({ x: 0, y: -8 }), 0, -1);
  nearPt('vunit of zero', LM.vunit({ x: 0, y: 0 }), 0, 0);
  nearPt('vperp', LM.vperp({ x: 1, y: 0 }), 0, 1);
  const c3 = LM.v3cross({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 });
  if (c3.z !== 1 || c3.x !== 0 || c3.y !== 0) failures.push('geom v3cross: expected +z, got ' + JSON.stringify(c3));
  near('v3len', LM.v3len({ x: 2, y: 3, z: 6 }), 7);

  /* matMul composes left to right: move then scale doubles the offset too */
  nearPt('matMul move→scale', LM.matApply(LM.matMul(LM.matMove(10, 0), LM.matScale(2, 2, { x: 0, y: 0 })), { x: 0, y: 0 }), 20, 0);
  nearPt('matMul scale→move', LM.matApply(LM.matMul(LM.matScale(2, 2, { x: 0, y: 0 }), LM.matMove(10, 0)), { x: 0, y: 0 }), 10, 0);
  nearPt('matMirror vertical', LM.matApply(LM.matMirror({ x: 0, y: -1 }, { x: 0, y: 1 }), { x: 10, y: 5 }), -10, 5);
  nearPt('matMirror diagonal', LM.matApply(LM.matMirror({ x: 0, y: 0 }, { x: 1, y: 1 }), { x: 10, y: 0 }), 0, 10, 1e-9);
  const mc = LM.xformGeom({ kind: 'circle', cx: 10, cy: 0, r: 5 }, LM.matMirror({ x: 0, y: -1 }, { x: 0, y: 1 }));
  if (mc.kind !== 'circle' || Math.abs(mc.r - 5) > 1e-9) failures.push('xformGeom: a mirrored circle must stay a circle, got ' + JSON.stringify(mc));
  const sc = LM.xformGeom({ kind: 'circle', cx: 0, cy: 0, r: 10 }, LM.matScale(3, 1, { x: 0, y: 0 }));
  if (sc.kind !== 'ellipse' || Math.abs(sc.rx - 30) > 1e-9 || Math.abs(sc.ry - 10) > 1e-9)
    failures.push('xformGeom: a non-uniform scale must degrade a circle to an ellipse, got ' + JSON.stringify(sc));
  const me = LM.xformGeom({ kind: 'ellipse', cx: 0, cy: 0, rx: 10, ry: 4, rot: 0.5 }, LM.matMove(5, 5));
  if (me.kind !== 'ellipse' || Math.abs(me.rx - 10) > 1e-9 || Math.abs(me.rot - 0.5) > 1e-9)
    failures.push('xformGeom: a moved ellipse must stay itself, got ' + JSON.stringify(me));

  const hit = LM.segInt({ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 });
  nearPt('segInt cross', hit && hit.pt, 0, 0);
  near('segInt ta', hit && hit.ta, 0.5);
  if (LM.segInt({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 })) failures.push('geom segInt: parallel segments must not report a hit');
  if (LM.segInt({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 5, y: -1 }, { x: 5, y: 1 })) failures.push('geom segInt: hits past the segment end must not count');

  const cA = LM.toPoly({ kind: 'circle', cx: 0, cy: 0, r: 100 }, 96);
  const cB = LM.toPoly({ kind: 'circle', cx: 100, cy: 0, r: 100 }, 96);
  const xs = LM.polyInt(cA.pts, true, cB.pts, true);
  if (xs.length !== 2) failures.push('geom polyInt: two overlapping circles cross twice, got ' + xs.length);
  else {
    nearPt('polyInt hit', xs[0].pt, 50, 86.6, 1);
    near('polyInt param on A', xs[0].ta, 1 / 6, 0.01);   /* 60° round the first circle */
    near('polyInt param on B', xs[0].tb, 1 / 3, 0.01);   /* 120° round the second */
  }
  if (LM.polyInt(cA.pts, true, LM.toPoly({ kind: 'circle', cx: 500, cy: 0, r: 10 }, 96).pts, true).length)
    failures.push('geom polyInt: disjoint circles must not cross');
  const fig8 = [{ x: -50, y: -50 }, { x: 50, y: 50 }, { x: 50, y: -50 }, { x: -50, y: 50 }];
  const self = LM.polySelfInt(fig8, true);
  if (self.length !== 1) failures.push('geom polySelfInt: a bow tie crosses itself once, got ' + self.length);
  else nearPt('polySelfInt hit', self[0].pt, 0, 0, 1e-9);

  near('polyLength square', LM.polyLength(sq(0, 0, 50), true), 400);
  near('polyLength open', LM.polyLength(sq(0, 0, 50), false), 300);
  near('polyArea square', LM.polyArea(sq(0, 0, 50)), 10000);
  nearPt('polyCentroid square', LM.polyCentroid(sq(7, -3, 50)), 7, -3, 1e-9);
  const cl = LM.closestOnPoly([{ x: -100, y: 0 }, { x: 100, y: 0 }], false, { x: 0, y: 20 });
  nearPt('closestOnPoly pt', cl.pt, 0, 0);
  near('closestOnPoly t', cl.t, 0.5);
  near('closestOnPoly dist', cl.dist, 20);
  const rs = LM.resample([{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 40 }], false, 3);
  nearPt('resample midpoint', rs[1], 30, 5);   /* half of a 70px path */
  if (LM.resample(sq(0, 0, 50), true, 8).length !== 8) failures.push('geom resample: closed resample must not repeat the seam');

  /* arc-length parameterization: equal steps of t must be equal steps of
     distance, on every kind — this is what makes a parameter portable */
  const el = { kind: 'ellipse', cx: 0, cy: 0, rx: 100, ry: 60, rot: 0 };
  const walk = [];
  for (let i = 0; i < 32; i++) walk.push(LM.curvePoint(el, i / 32));
  let dmin = Infinity, dmax = 0;
  for (let i = 0; i < 32; i++) {
    const q = walk[(i + 1) % 32], d = Math.hypot(q.x - walk[i].x, q.y - walk[i].y);
    if (d < dmin) dmin = d;
    if (d > dmax) dmax = d;
  }
  if (dmax / dmin > 1.08) failures.push('geom ellipse: Divide should space points by arc length, spread ' + (dmax / dmin).toFixed(2));
  nearPt('tangent on a circle', LM.tangentAt({ kind: 'circle', cx: 0, cy: 0, r: 10 }, 0), 0, 1);
  nearPt('tangent on a line', LM.tangentAt({ kind: 'line', a: { x: 0, y: 0 }, b: { x: 0, y: -4 } }, 0.5), 0, -1);
  nearPt('tangent on a poly', LM.tangentAt({ kind: 'poly', pts: [{ x: 0, y: 0 }, { x: 10, y: 0 }], closed: false }, 0.5), 1, 0, 1e-6);
  const tb = LM.curveTable({ kind: 'poly', pts: sq(0, 0, 50), closed: true }, 96);
  nearPt('curveTable start', LM.tableAt(tb, 0), -50, -50);
  nearPt('curveTable quarter', LM.tableAt(tb, 0.25), 50, -50);
  if (LM.curveTable({ kind: 'circle', cx: 0, cy: 0, r: 1 })) failures.push('geom curveTable: analytic kinds need no table');

  const hull = LM.convexHull([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 5 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 5, y: 1 }]);
  if (hull.length !== 4 || Math.abs(area(hull) - 100) > 1e-9)
    failures.push('geom convexHull: expected the 4-corner square, got ' + JSON.stringify(hull));

  const cut = LM.splitPoly([{ x: -100, y: 0 }, { x: 100, y: 0 }], false, [0.5]);
  if (cut.length !== 2 || Math.abs(cut[0][1].x) > 1e-9) failures.push('geom splitPoly open: expected two halves, got ' + JSON.stringify(cut));
  if (LM.splitPoly(sq(0, 0, 50), true, [0.125, 0.625]).length !== 2) failures.push('geom splitPoly closed: two cuts make two pieces');
  if (LM.splitPoly(sq(0, 0, 50), true, [0.125]).length !== 1) failures.push('geom splitPoly closed: one cut opens the loop');

  const fil = LM.filletPoly(sq(0, 0, 50), true, 20, 6);
  if (!(area(fil) < 10000 && area(fil) > 9000)) failures.push('geom filletPoly: rounding should shave the corners, area ' + area(fil).toFixed(0));
  if (LM.filletPoly(sq(0, 0, 50), true, 0, 6).length !== 4) failures.push('geom filletPoly: radius 0 must pass through');

  /* polygon booleans */
  const A2 = sq(0, 0, 50), B2 = sq(50, 50, 50);
  const boo = (op, want) => {
    const r = LM.clipPoly(A2, B2, op);
    const got = r.reduce((s, p) => s + area(p), 0);
    if (r.length !== 1 || Math.abs(got - want) > 1) failures.push('clipPoly ' + op + ': expected one region of ' + want + ', got ' + r.length + ' × ' + got.toFixed(0));
  };
  boo('union', 17500); boo('intersection', 2500); boo('difference', 7500);
  const far = sq(500, 500, 20);
  if (LM.clipPoly(A2, far, 'union').length !== 2) failures.push('clipPoly: disjoint union keeps both regions');
  if (LM.clipPoly(A2, far, 'intersection').length) failures.push('clipPoly: disjoint intersection is empty');
  if (LM.clipPoly(A2, far, 'difference').length !== 1) failures.push('clipPoly: disjoint difference is A');
  const inner = sq(0, 0, 10);
  if (Math.abs(area(LM.clipPoly(A2, inner, 'intersection')[0]) - 400) > 1) failures.push('clipPoly: nested intersection is the inner shape');
  const same = A2.map(p => ({ x: p.x, y: p.y }));
  if (LM.clipPoly(A2, same, 'difference').length) failures.push('clipPoly: a shape minus itself must be empty, got slivers');
  if (Math.abs(area(LM.clipPoly(A2, same, 'union')[0]) - 10000) > 1) failures.push('clipPoly: a shape unioned with itself is itself');
  /* two r=100 circles 100 apart: both discs minus the lens they share. The
     96-gons come in a shade under the true circles, hence the 0.2% window. */
  const lens = 2 * 10000 * Math.acos(0.5) - 50 * Math.sqrt(30000);
  const wantU = 2 * Math.PI * 10000 - lens;
  const cu = LM.clipPoly(cA.pts, cB.pts, 'union');
  if (cu.length !== 1 || Math.abs(area(cu[0]) - wantU) > wantU * 0.002)
    failures.push('clipPoly circles: union area ' + (cu[0] ? area(cu[0]).toFixed(0) : 'none') + ', want ~' + wantU.toFixed(0));
}

/* 19 — the curve analysis, transform and vector nodes */
{
  const near = (name, got, want, tol) => {
    if (!(Math.abs(got - want) <= (tol === undefined ? 1e-9 : tol)))
      failures.push('node ' + name + ': expected ' + want + ' got ' + got);
  };
  const nearPt = (name, got, wx, wy) => {
    if (!got || !(Math.abs(got.x - wx) <= 1e-9 && Math.abs(got.y - wy) <= 1e-9))
      failures.push('node ' + name + ': expected (' + wx + ', ' + wy + ') got ' + JSON.stringify(got));
  };
  const run = (type, args, values) => NODE_DEFS[type].compute(args, mkCtx(), { id: 'n', values: values || {} });
  const circle = (cx, r) => ({ kind: 'circle', cx: cx, cy: 0, r: r });

  const ix = run('crv/intersect', { C1: circle(0, 100), C2: circle(100, 100) });
  if (ix.P.length !== 2) failures.push('node crv/intersect: expected 2 points, got ' + ix.P.length);
  else {
    near('crv/intersect x', ix.P[0].x, 50, 1);
    near('crv/intersect T1', ix.T1[0], 1 / 6, 0.01);
    near('crv/intersect T2', ix.T2[0], 1 / 3, 0.01);
  }
  const sx = run('crv/intersect', { C1: { kind: 'poly', pts: [{ x: -50, y: -50 }, { x: 50, y: 50 }, { x: 50, y: -50 }, { x: -50, y: 50 }], closed: true } }, { mode: 'self' });
  if (sx.P.length !== 1) failures.push('node crv/intersect self: a bow tie crosses once, got ' + sx.P.length);

  const cp = run('crv/closest', { C: circle(0, 100), P: { x: 200, y: 0 } });
  near('crv/closest distance', cp.D, 100, 0.2);
  near('crv/closest x', cp.P.x, 100, 0.2);
  if (run('crv/incurve', { C: circle(0, 100), P: { x: 10, y: 0 } }).B !== true) failures.push('node crv/incurve: inside not detected');
  if (run('crv/incurve', { C: circle(0, 100), P: { x: 300, y: 0 } }).B !== false) failures.push('node crv/incurve: outside reported as inside');
  near('crv/length circle', run('crv/length', { C: circle(0, 100) }).L, Math.PI * 200, 1e-9);
  const ar = run('crv/area', { C: { kind: 'rect', cx: 5, cy: 7, w: 100, h: 40, rot: 0 } });
  near('crv/area rect', ar.A, 4000);
  near('crv/area centroid', ar.C.x, 5, 1e-9);

  const bbEach = run('crv/bbox', { G: [circle(-100, 20), circle(100, 20)] }, { mode: 'each' });
  if (bbEach.W.length !== 2 || Math.abs(bbEach.W[0] - 40) > 1) failures.push('node crv/bbox per item: expected two 40px boxes, got ' + JSON.stringify(bbEach.W));
  const bbAll = run('crv/bbox', { G: [circle(-100, 20), circle(100, 20)] }, { mode: 'all' });
  if (Math.abs(bbAll.W - 240) > 1) failures.push('node crv/bbox whole list: expected one 240px box, got ' + bbAll.W);

  const hl = run('crv/hull', { P: [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 20, y: 5 }, { x: 40, y: 40 }, { x: 0, y: 40 }] });
  if (!hl.C || hl.C.pts.length !== 4) failures.push('node crv/hull: expected a 4-corner hull');

  const jn = run('crv/join', {
    C: [{ kind: 'line', a: { x: 0, y: 0 }, b: { x: 50, y: 0 } }, { kind: 'line', a: { x: 100, y: 0 }, b: { x: 50, y: 0 } }],
    T: 1
  });
  if (jn.C.length !== 1 || jn.C[0].pts.length !== 3) failures.push('node crv/join: two touching lines make one 3-point polyline, got ' + JSON.stringify(jn.C));

  const line = { kind: 'line', a: { x: -200, y: 0 }, b: { x: 200, y: 0 } };
  const tOut = run('crv/trim', { C: line, X: circle(0, 100) }, { mode: 'outside' });
  if (tOut.C.length !== 2) failures.push('node crv/trim outside: a line through a circle leaves two tails, got ' + tOut.C.length);
  const tIn = run('crv/trim', { C: line, X: circle(0, 100) }, { mode: 'inside' });
  if (tIn.C.length !== 1 || Math.abs(LM.polyLength(tIn.C[0].pts, false) - 200) > 2)
    failures.push('node crv/trim inside: expected one 200px chord, got ' + JSON.stringify(tIn.C.map(g => g.pts.length)));
  if (run('crv/trim', { C: line, X: circle(0, 100) }, { mode: 'split' }).C.length !== 3)
    failures.push('node crv/trim split: expected three pieces');

  const rg = m => {
    /* half-overlapping squares whose corners sit exactly on each other's edges
       — the degenerate case the nudge-and-retry exists for */
    const r = run('crv/region', { A: { kind: 'rect', cx: 0, cy: 0, w: 100, h: 100, rot: 0 }, B: { kind: 'rect', cx: 50, cy: 0, w: 100, h: 100, rot: 0 } }, { mode: m });
    return (r.C || []).reduce((s, g) => s + Math.abs(LM.polyArea(g.pts)), 0);
  };
  near('crv/region union', rg('union'), 15000, 1);
  near('crv/region intersection', rg('intersection'), 5000, 1);
  near('crv/region difference', rg('difference'), 5000, 1);

  const fl = run('crv/fillet', { C: { kind: 'rect', cx: 0, cy: 0, w: 100, h: 100, rot: 0 }, R: 20, N: 6 });
  if (!(Math.abs(LM.polyArea(fl.C.pts)) < 10000)) failures.push('node crv/fillet: rounding must shrink the square');

  const mi = run('xf/mirror', { G: circle(50, 10), A: { x: 0, y: -100 }, B: { x: 0, y: 100 } });
  near('xf/mirror', mi.G.cx, -50);
  const tl = run('xf/tile', { G: circle(0, 5), V1: { x: 20, y: 0 }, N1: 3, V2: { x: 0, y: 20 }, N2: 2 });
  if (tl.G.length !== 6 || tl.I.join(',') !== '0,1,2,0,1,2' || tl.J.join(',') !== '0,0,0,1,1,1')
    failures.push('node xf/tile: expected a 3×2 array with cell keys, got ' + tl.G.length + ' [' + tl.I.join(',') + ']');
  near('xf/tile last cell', tl.G[5].cx, 40);

  const su = run('xf/scale', { G: circle(0, 10), F: 3, Y: 1, C: { x: 0, y: 0 } }, { mode: 'uniform' });
  if (su.G.kind !== 'circle' || su.G.r !== 30) failures.push('node xf/scale uniform: expected r30 circle, got ' + JSON.stringify(su.G));
  const sn = run('xf/scale', { G: circle(0, 10), F: 3, Y: 1, C: { x: 0, y: 0 } }, { mode: 'xy' });
  if (sn.G.kind !== 'ellipse' || sn.G.rx !== 30 || sn.G.ry !== 10) failures.push('node xf/scale non-uniform: expected a 30×10 ellipse, got ' + JSON.stringify(sn.G));

  const ev = run('crv/eval', { C: circle(0, 100), T: 0 });
  nearPt('crv/eval P', ev.P, 100, 0);
  nearPt('crv/eval tangent', ev.V, 0, 1);
  nearPt('crv/eval normal', ev.N, -1, 0);
  const dv = run('crv/divide', { C: circle(0, 100), N: 4 }, { mode: 'count' });
  if (dv.P.length !== 4 || dv.V.length !== 4) failures.push('node crv/divide: a closed curve divides into N points, got ' + dv.P.length);
  const dl = run('crv/divide', { C: circle(0, 100), N: 100 }, { mode: 'length' });
  if (Math.abs(dl.P.length - Math.round(Math.PI * 200 / 100)) > 0) failures.push('node crv/divide by length: expected ' + Math.round(Math.PI * 2) + ' points, got ' + dl.P.length);

  near('vec/dot', run('vec/dot', { A: { x: 3, y: 4 }, B: { x: 2, y: 1 } }).D, 10);
  near('vec/cross', run('vec/cross', { A: { x: 1, y: 0 }, B: { x: 0, y: 1 } }).C, 1);

  /* the whole family, wired up and exported */
  const g = { nodes: [
      { id: 'c1', type: 'crv/circle', values: { P: { x: -40, y: 0 }, R: 80 } },
      { id: 'c2', type: 'crv/circle', values: { P: { x: 40, y: 0 }, R: 80 } },
      { id: 'ix', type: 'crv/intersect', values: {} },
      { id: 'rg', type: 'crv/region', values: { mode: 'intersection' } },
      { id: 'mr', type: 'xf/mirror', values: {} },
      { id: 'dw', type: 'disp/draw', values: {} } ],
    wires: [
      { from: ['c1', 'C'], to: ['ix', 'C1'] }, { from: ['c2', 'C'], to: ['ix', 'C2'] },
      { from: ['c1', 'C'], to: ['rg', 'A'] }, { from: ['c2', 'C'], to: ['rg', 'B'] },
      { from: ['rg', 'C'], to: ['mr', 'G'] }, { from: ['mr', 'G'], to: ['dw', 'G'] } ] };
  const c = mkCtx();
  LM.evaluateGraph(g, NODE_DEFS, c);
  if (Object.keys(c.errors).length) failures.push('geometry chain: errored → ' + JSON.stringify(c.errors));
  if ((c.out.ix.P || []).length !== 2) failures.push('geometry chain: two circles should cross twice, got ' + (c.out.ix.P || []).length);
  if (!c.drawList.length) failures.push('geometry chain: nothing reached the draw list');
  try { new Function(WeftExport.buildJS(g)); } catch (e) { failures.push('geometry chain export does not compile → ' + e.message); }
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
