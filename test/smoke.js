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
