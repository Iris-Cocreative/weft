'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const LMx = new Function(fs.readFileSync(path.join(root, 'js/engine.js'), 'utf8') + '\nreturn LM;')();

const sq = (cx, cy, s) => [{ x: cx - s, y: cy - s }, { x: cx + s, y: cy - s }, { x: cx + s, y: cy + s }, { x: cx - s, y: cy + s }];
const circ = (cx, cy, r, n) => { const o = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }); } return o; };
const ar = p => Math.round(Math.abs(LMx.polyArea(p)));

const A = sq(0, 0, 50), B = sq(50, 50, 50);
for (const op of ['union', 'intersection', 'difference']) {
  const r = LMx.clipPoly(A, B, op);
  console.log('squares', op, 'n=' + r.length, 'areas=' + r.map(ar).join('/'));
}
console.log('expect union 17500, inter 2500, diff 7500');

console.log('disjoint union n=', LMx.clipPoly(A, sq(500, 500, 20), 'union').length,
  'inter n=', LMx.clipPoly(A, sq(500, 500, 20), 'intersection').length,
  'diff n=', LMx.clipPoly(A, sq(500, 500, 20), 'difference').length);
console.log('nested diff n=', LMx.clipPoly(A, sq(0, 0, 10), 'difference').length,
  'nested inter area=', LMx.clipPoly(A, sq(0, 0, 10), 'intersection').map(ar).join('/'),
  'nested union area=', LMx.clipPoly(A, sq(0, 0, 10), 'union').map(ar).join('/'));
console.log('identical union=', LMx.clipPoly(A, A.map(p => ({ x: p.x, y: p.y })), 'union').map(ar).join('/'),
  'diff=', JSON.stringify(LMx.clipPoly(A, A.map(p => ({ x: p.x, y: p.y })), 'difference').map(ar)),
  'inter=', LMx.clipPoly(A, A.map(p => ({ x: p.x, y: p.y })), 'intersection').map(ar).join('/'));

const C1 = circ(-30, 0, 60, 96), C2 = circ(30, 0, 60, 96);
for (const op of ['union', 'intersection', 'difference']) {
  const r = LMx.clipPoly(C1, C2, op);
  console.log('circles', op, 'n=' + r.length, 'areas=' + r.map(ar).join('/'), 'pts=' + r.map(p => p.length).join('/'));
}
const lens = 2 * (3600 * Math.acos(0.5) - 30 * Math.sqrt(3600 - 900));
console.log('exact: union', Math.round(2 * Math.PI * 3600 - lens), 'inter', Math.round(lens), 'diff', Math.round(Math.PI * 3600 - lens));

/* vertex-on-edge degeneracy: shifted square sharing a corner exactly */
const D = sq(100, 0, 50);
console.log('edge-touching union=', LMx.clipPoly(A, D, 'union').map(ar).join('/'));

/* other primitives */
console.log('hull', JSON.stringify(LMx.convexHull([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 5 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 5, y: 1 }])));
console.log('segInt', JSON.stringify(LMx.segInt({ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 })));
const cc = LMx.toPoly({ kind: 'circle', cx: 0, cy: 0, r: 100 }, 96);
const cd = LMx.toPoly({ kind: 'circle', cx: 100, cy: 0, r: 100 }, 96);
console.log('polyInt circles', JSON.stringify(LMx.polyInt(cc.pts, true, cd.pts, true).map(h => [Math.round(h.pt.x), Math.round(h.pt.y), +h.ta.toFixed(3), +h.tb.toFixed(3)])));
console.log('length circle', LMx.curveLength({ kind: 'circle', cx: 0, cy: 0, r: 100 }).toFixed(2), 'expect', (Math.PI * 200).toFixed(2));
console.log('length poly128 ellipse', LMx.curveLength({ kind: 'ellipse', cx: 0, cy: 0, rx: 100, ry: 50, rot: 0 }).toFixed(2), 'expect ~484.42');
console.log('area circle', Math.abs(LMx.polyArea(cc.pts)).toFixed(1), 'expect ~31415');
console.log('centroid circle', JSON.stringify(LMx.polyCentroid(cc.pts)));
/* ellipse arc-length: quarter param should be near the minor axis end now */
const el = { kind: 'ellipse', cx: 0, cy: 0, rx: 100, ry: 20, rot: 0 };
console.log('ellipse t=0.25 (arc-length)', JSON.stringify(LMx.curvePoint(el, 0.25)));
console.log('ellipse tangent t=0', JSON.stringify(LMx.tangentAt(el, 0)));
console.log('circle tangent t=0', JSON.stringify(LMx.tangentAt({ kind: 'circle', cx: 0, cy: 0, r: 10 }, 0)));
/* split */
const line = [{ x: -100, y: 0 }, { x: 100, y: 0 }];
console.log('split open', JSON.stringify(LMx.splitPoly(line, false, [0.5])));
console.log('split closed sq', LMx.splitPoly(sq(0, 0, 50), true, [0.125, 0.625]).map(p => p.length));
/* fillet */
const f = LMx.filletPoly(sq(0, 0, 50), true, 20, 4);
console.log('fillet pts', f.length, 'area', Math.round(Math.abs(LMx.polyArea(f))), 'expect < 10000');
/* mirror */
const mm = LMx.matMirror({ x: 0, y: -1 }, { x: 0, y: 1 });
console.log('mirror pt', JSON.stringify(LMx.matApply(mm, { x: 10, y: 5 })), 'expect (-10, 5)');
const mm2 = LMx.matMirror({ x: 0, y: 0 }, { x: 1, y: 1 });
console.log('mirror diag', JSON.stringify(LMx.matApply(mm2, { x: 10, y: 0 })), 'expect (0, 10)');
console.log('mirror circle', JSON.stringify(LMx.xformGeom({ kind: 'circle', cx: 10, cy: 0, r: 5 }, mm)));
/* matMul: move then scale */
const comp = LMx.matMul(LMx.matMove(10, 0), LMx.matScale(2, 2, { x: 0, y: 0 }));
console.log('matMul move-then-scale', JSON.stringify(LMx.matApply(comp, { x: 0, y: 0 })), 'expect (20, 0)');
/* non-uniform scale on a circle */
console.log('nonuniform circle', JSON.stringify(LMx.xformGeom({ kind: 'circle', cx: 0, cy: 0, r: 10 }, LMx.matScale(3, 1, { x: 0, y: 0 }))));
console.log('uniform circle', JSON.stringify(LMx.xformGeom({ kind: 'circle', cx: 0, cy: 0, r: 10 }, LMx.matScale(3, 3, { x: 0, y: 0 }))));
console.log('move ellipse', JSON.stringify(LMx.xformGeom({ kind: 'ellipse', cx: 0, cy: 0, rx: 10, ry: 4, rot: 0.5 }, LMx.matMove(5, 5))));
/* resample */
console.log('resample line 3', JSON.stringify(LMx.resample(line, false, 3)));
console.log('closestOnPoly', JSON.stringify(LMx.closestOnPoly(line, false, { x: 0, y: 20 })));
