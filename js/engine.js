'use strict';
/*
 * Weft engine — the pure runtime shared by the editor and exported experiences.
 * Everything lives on LM as arrow/function expressions so the exporter can
 * serialize each property with Function.prototype.toString(). No DOM access,
 * no editor state, no closures over module scope — LM.* references only.
 */
const LM = {
  TAU: Math.PI * 2,

  /* ---------- numbers ---------- */
  clamp: (v, a, b) => v < a ? a : v > b ? b : v,
  lerp: (a, b, t) => a + (b - a) * t,
  fract: n => n - Math.floor(n),

  hash1: n => { const s = Math.sin(n * 127.1) * 43758.5453123; return s - Math.floor(s); },

  noise2: (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const h = (i, j) => LM.hash1(i * 157.31 + j * 311.7 + 0.123);
    const sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
    return LM.lerp(
      LM.lerp(h(xi, yi), h(xi + 1, yi), sx),
      LM.lerp(h(xi, yi + 1), h(xi + 1, yi + 1), sx), sy);
  },

  rng: seed => {
    let a = (Math.floor(seed) | 0) + 0x6D2B79F5;
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  },

  /* ---------- colors: {r,g,b,a} with rgb 0-255, a 0-1 ---------- */
  hexToColor: (hex, a) => {
    const m = /^#?([0-9a-f]{6})/i.exec(hex || '');
    if (!m) return { r: 255, g: 255, b: 255, a: a === undefined ? 1 : a };
    const n = parseInt(m[1], 16);
    return { r: n >> 16 & 255, g: n >> 8 & 255, b: n & 255, a: a === undefined ? 1 : a };
  },
  colorToHex: c => '#' + [c.r, c.g, c.b].map(v => Math.round(LM.clamp(v || 0, 0, 255)).toString(16).padStart(2, '0')).join(''),
  hslToColor: (h, s, l, a) => {
    h = LM.fract(h); s = LM.clamp(s, 0, 1); l = LM.clamp(l, 0, 1);
    const f = n => { const k = (n + h * 12) % 12; return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255, a: a === undefined ? 1 : a };
  },
  colorCss: c => c ? 'rgba(' + Math.round(c.r || 0) + ',' + Math.round(c.g || 0) + ',' + Math.round(c.b || 0) + ',' + (c.a === undefined ? 1 : Math.round(c.a * 1000) / 1000) + ')' : 'rgba(0,0,0,0)',
  mixColor: (a, b, t) => ({
    r: LM.lerp(a.r, b.r, t), g: LM.lerp(a.g, b.g, t), b: LM.lerp(a.b, b.b, t),
    a: LM.lerp(a.a === undefined ? 1 : a.a, b.a === undefined ? 1 : b.a, t)
  }),

  /* ---------- type coercion (loose, Grasshopper-friendly) ---------- */
  coerce: (v, t) => {
    if (v === null || v === undefined || t === 'any' || t === 'geometry') return v;
    switch (t) {
      case 'number':
        if (typeof v === 'number') return v;
        if (typeof v === 'boolean') return v ? 1 : 0;
        if (typeof v === 'string') { const f = parseFloat(v); return isNaN(f) ? 0 : f; }
        if (typeof v === 'object' && v.x !== undefined) return Math.hypot(v.x, v.y);
        return 0;
      case 'bool':
        return !!v;
      case 'string':
        return typeof v === 'string' ? v : LM.fmt(v);
      case 'point':
      case 'vector': // structurally identical to point; the distinction is semantic
        if (typeof v === 'object' && v.x !== undefined) return { x: +v.x || 0, y: +v.y || 0 };
        if (typeof v === 'number') return { x: v, y: v };
        return { x: 0, y: 0 };
      case 'color':
        if (typeof v === 'object' && v.r !== undefined) return v;
        if (typeof v === 'string') return LM.hexToColor(v);
        if (typeof v === 'number') { const g = LM.clamp(v, 0, 1) * 255; return { r: g, g: g, b: g, a: 1 }; }
        return { r: 255, g: 255, b: 255, a: 1 };
      default: return v;
    }
  },

  /* set-equality across loose port types (shared by the sets/* nodes):
   * numbers within 1e-9, points/vectors by coordinates, strings/bools exact,
   * geometry & colors by JSON identity */
  setEq: (a, b) => {
    if (a === b) return true;
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-9;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
    if (a.kind === undefined && b.kind === undefined && a.x !== undefined && b.x !== undefined)
      return Math.abs(a.x - b.x) <= 1e-9 && Math.abs(a.y - b.y) <= 1e-9;
    return JSON.stringify(a) === JSON.stringify(b);
  },

  fmt: v => {
    if (v === null || v === undefined) return '∅';
    if (typeof v === 'number') return String(Math.round(v * 1000) / 1000);
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'string') return v;
    if (v.kind === 'text') return '"' + v.text + '"';
    if (v.kind) return '‹' + v.kind + '›';
    if (v.x !== undefined) return '(' + LM.fmt(v.x) + ', ' + LM.fmt(v.y) + ')';
    if (v.r !== undefined) return LM.colorCss(v);
    return String(v);
  },

  /* ---------- geometry ----------
   * point    {x,y}                       (bare, no kind)
   * line     {kind:'line', a, b}
   * circle   {kind:'circle', cx, cy, r}
   * ellipse  {kind:'ellipse', cx, cy, rx, ry, rot}
   * rect     {kind:'rect', cx, cy, w, h, rot}
   * arc      {kind:'arc', cx, cy, r, a0, a1}
   * poly     {kind:'poly', pts, closed}
   * spline   {kind:'spline', pts, closed}   (catmull-rom through pts)
   * text     {kind:'text', text, x, y, size}
   */
  isClosedGeom: g => !!g && (g.kind === 'circle' || g.kind === 'ellipse' || g.kind === 'rect' ||
    ((g.kind === 'poly' || g.kind === 'spline') && g.closed)),

  splinePts: (pts, closed, seg) => {
    seg = seg || 14;
    if (!pts || pts.length < 2) return (pts || []).slice();
    const P = i => closed ? pts[(i % pts.length + pts.length) % pts.length] : pts[LM.clamp(i, 0, pts.length - 1)];
    const out = [];
    const nSeg = closed ? pts.length : pts.length - 1;
    for (let i = 0; i < nSeg; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      for (let j = 0; j < seg; j++) {
        const t = j / seg, t2 = t * t, t3 = t2 * t;
        out.push({
          x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        });
      }
    }
    if (!closed) out.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y });
    return out;
  },

  toPoly: (g, res) => {
    res = res || 64;
    if (!g) return { pts: [], closed: false };
    if (g.kind === undefined && g.x !== undefined) return { pts: [{ x: g.x, y: g.y }], closed: false };
    switch (g.kind) {
      case 'line': return { pts: [g.a, g.b], closed: false };
      case 'poly': return { pts: g.pts || [], closed: !!g.closed };
      case 'spline': return { pts: LM.splinePts(g.pts || [], !!g.closed), closed: !!g.closed };
      case 'circle': {
        const pts = [];
        for (let i = 0; i < res; i++) { const a = i / res * LM.TAU; pts.push({ x: g.cx + Math.cos(a) * g.r, y: g.cy + Math.sin(a) * g.r }); }
        return { pts, closed: true };
      }
      case 'ellipse': {
        const c = Math.cos(g.rot || 0), s = Math.sin(g.rot || 0), pts = [];
        for (let i = 0; i < res; i++) {
          const a = i / res * LM.TAU, ex = Math.cos(a) * g.rx, ey = Math.sin(a) * g.ry;
          pts.push({ x: g.cx + ex * c - ey * s, y: g.cy + ex * s + ey * c });
        }
        return { pts, closed: true };
      }
      case 'rect': {
        const w = g.w / 2, h = g.h / 2, c = Math.cos(g.rot || 0), s = Math.sin(g.rot || 0);
        const pts = [[-w, -h], [w, -h], [w, h], [-w, h]].map(p => ({ x: g.cx + p[0] * c - p[1] * s, y: g.cy + p[0] * s + p[1] * c }));
        return { pts, closed: true };
      }
      case 'arc': {
        const n = Math.max(2, Math.ceil(Math.abs(g.a1 - g.a0) / LM.TAU * res) + 1), pts = [];
        for (let i = 0; i < n; i++) { const a = LM.lerp(g.a0, g.a1, i / (n - 1)); pts.push({ x: g.cx + Math.cos(a) * g.r, y: g.cy + Math.sin(a) * g.r }); }
        return { pts, closed: false };
      }
      default: return { pts: [], closed: false };
    }
  },

  /* hit test: inside a closed shape, or within pad px of an open curve/point */
  pointInGeom: (g, p, pad) => {
    if (!g || !p) return false;
    pad = pad === undefined ? 6 : pad;
    if (g.kind === undefined && g.x !== undefined) return Math.hypot(g.x - p.x, g.y - p.y) <= Math.max(pad, 4);
    if (g.kind === 'circle') return Math.hypot(g.cx - p.x, g.cy - p.y) <= Math.abs(g.r);
    if (g.kind === 'text') {
      const s = g.size || 24, w = String(g.text === undefined ? '' : g.text).length * s * 0.6;
      return Math.abs(p.x - (g.x || 0)) <= w / 2 + pad && Math.abs(p.y - (g.y || 0)) <= s * 0.7;
    }
    const P = LM.toPoly(g, 48), pts = P.pts;
    if (!pts.length) return false;
    if (P.closed && pts.length > 2) {
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        if ((pts[i].y > p.y) !== (pts[j].y > p.y) &&
          p.x < (pts[j].x - pts[i].x) * (p.y - pts[i].y) / (pts[j].y - pts[i].y) + pts[i].x) inside = !inside;
      }
      if (inside) return true;
    }
    const nSeg = P.closed ? pts.length : pts.length - 1;
    for (let i = 0; i < nSeg; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
      const t = L2 ? LM.clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / L2, 0, 1) : 0;
      if (Math.hypot(a.x + dx * t - p.x, a.y + dy * t - p.y) <= pad) return true;
    }
    return false;
  },

  curvePoint: (g, t) => {
    if (!g) return { x: 0, y: 0 };
    switch (g.kind) {
      case 'circle': { const a = t * LM.TAU; return { x: g.cx + Math.cos(a) * g.r, y: g.cy + Math.sin(a) * g.r }; }
      case 'ellipse': {
        const a = t * LM.TAU, c = Math.cos(g.rot || 0), s = Math.sin(g.rot || 0);
        const ex = Math.cos(a) * g.rx, ey = Math.sin(a) * g.ry;
        return { x: g.cx + ex * c - ey * s, y: g.cy + ex * s + ey * c };
      }
      case 'arc': { const a = LM.lerp(g.a0, g.a1, LM.clamp(t, 0, 1)); return { x: g.cx + Math.cos(a) * g.r, y: g.cy + Math.sin(a) * g.r }; }
      case 'line': { const u = LM.clamp(t, 0, 1); return { x: LM.lerp(g.a.x, g.b.x, u), y: LM.lerp(g.a.y, g.b.y, u) }; }
      default: {
        const P = LM.toPoly(g, 96);
        const pts = P.closed && P.pts.length ? P.pts.concat([P.pts[0]]) : P.pts;
        if (!pts.length) return { x: 0, y: 0 };
        if (pts.length === 1) return { x: pts[0].x, y: pts[0].y };
        const d = [0]; let tot = 0;
        for (let i = 1; i < pts.length; i++) { tot += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); d.push(tot); }
        const target = LM.clamp(t, 0, 1) * tot;
        let i = 1; while (i < d.length - 1 && d[i] < target) i++;
        const seg = d[i] - d[i - 1] || 1, u = (target - d[i - 1]) / seg;
        return { x: LM.lerp(pts[i - 1].x, pts[i].x, u), y: LM.lerp(pts[i - 1].y, pts[i].y, u) };
      }
    }
  },

  /* ---------- affine transforms: m = [a,b,c,d,e,f], canvas convention ---------- */
  matMove: (dx, dy) => [1, 0, 0, 1, dx, dy],
  matRot: (a, c) => {
    const co = Math.cos(a), si = Math.sin(a);
    return [co, si, -si, co, c.x - co * c.x + si * c.y, c.y - si * c.x - co * c.y];
  },
  matScale: (sx, sy, c) => [sx, 0, 0, sy, c.x - sx * c.x, c.y - sy * c.y],
  matApply: (m, p) => ({ x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] }),

  xformGeom: (g, m) => {
    if (!g) return g;
    const ap = p => LM.matApply(m, p);
    const sf = (Math.hypot(m[0], m[1]) + Math.hypot(m[2], m[3])) / 2;
    if (g.kind === undefined && g.x !== undefined) return ap(g);
    switch (g.kind) {
      case 'line': return { kind: 'line', a: ap(g.a), b: ap(g.b) };
      case 'circle': { const c = ap({ x: g.cx, y: g.cy }); return { kind: 'circle', cx: c.x, cy: c.y, r: g.r * sf }; }
      case 'text': { const p = ap({ x: g.x, y: g.y }); return { kind: 'text', text: g.text, x: p.x, y: p.y, size: (g.size || 24) * sf }; }
      case 'poly': return { kind: 'poly', pts: (g.pts || []).map(ap), closed: !!g.closed };
      case 'spline': return { kind: 'spline', pts: (g.pts || []).map(ap), closed: !!g.closed };
      default: { const P = LM.toPoly(g, 64); return { kind: 'poly', pts: P.pts.map(ap), closed: P.closed }; }
    }
  },

  /* ---------- canvas rendering ---------- */
  pathGeom: (g2, g) => {
    switch (g.kind) {
      case 'circle': g2.arc(g.cx, g.cy, Math.max(0, g.r), 0, LM.TAU); break;
      case 'ellipse': g2.ellipse(g.cx, g.cy, Math.max(0, g.rx), Math.max(0, g.ry), g.rot || 0, 0, LM.TAU); break;
      case 'line': g2.moveTo(g.a.x, g.a.y); g2.lineTo(g.b.x, g.b.y); break;
      case 'arc': g2.arc(g.cx, g.cy, Math.max(0, g.r), g.a0, g.a1); break;
      default: {
        const P = LM.toPoly(g, 72);
        if (!P.pts.length) break;
        g2.moveTo(P.pts[0].x, P.pts[0].y);
        for (let i = 1; i < P.pts.length; i++) g2.lineTo(P.pts[i].x, P.pts[i].y);
        if (P.closed) g2.closePath();
      }
    }
  },

  drawItem: (g2, it) => {
    const g = it.geom;
    if (!g) return;
    const stroke = it.stroke, fill = it.fill, w = it.width === undefined ? 1.5 : it.width;
    if (g.kind === 'text') {
      g2.font = (g.size || 24) + 'px Inter, system-ui, sans-serif';
      g2.textAlign = 'center'; g2.textBaseline = 'middle';
      const c = (fill && fill.a > 0) ? fill : stroke;
      if (c && c.a > 0) { g2.fillStyle = LM.colorCss(c); g2.fillText(g.text === null || g.text === undefined ? '' : String(g.text), g.x || 0, g.y || 0); }
      return;
    }
    if (g.kind === undefined && g.x !== undefined) {
      const c = (fill && fill.a > 0) ? fill : stroke;
      if (c && c.a > 0) { g2.beginPath(); g2.arc(g.x, g.y, Math.max(w * 1.4, 2), 0, LM.TAU); g2.fillStyle = LM.colorCss(c); g2.fill(); }
      return;
    }
    g2.beginPath();
    LM.pathGeom(g2, g);
    if (fill && fill.a > 0) { g2.fillStyle = LM.colorCss(fill); g2.fill(); }
    if (stroke && stroke.a > 0 && w > 0) {
      g2.strokeStyle = LM.colorCss(stroke); g2.lineWidth = w;
      g2.lineJoin = 'round'; g2.lineCap = 'round'; g2.stroke();
    }
  },

  /* ---------- the dataflow evaluator ----------
   * Every port value is a LIST. Longest-list matching (Grasshopper style):
   * the node's compute runs once per index, shorter lists repeat their last
   * item. Inputs named in def.listInputs receive the whole list instead.
   * If compute returns an array for an output it is spread flat into the list.
   * An input may receive MULTIPLE wires — their lists concatenate in wire order.
   * A node with enabled === false is bypassed: each output passes through the
   * first same-type input (or the first input) untouched.
   */
  evaluateGraph: (graph, defs, ctx) => {
    ctx.drawList = ctx.drawList || [];
    ctx.domList = ctx.domList || [];
    ctx.errors = ctx.errors || {};
    ctx.out = ctx.out || {};
    const byId = {};
    for (const n of graph.nodes) byId[n.id] = n;
    const inWires = {};
    for (const w of graph.wires) {
      const k = w.to[0] + ':' + w.to[1];
      if (!inWires[k]) inWires[k] = [];
      inWires[k].push(w.from);
    }

    const order = [], mark = {};
    const visit = n => {
      if (mark[n.id] === 2) return;
      if (mark[n.id] === 1) { ctx.errors[n.id] = 'cycle detected'; return; }
      mark[n.id] = 1;
      const def = defs[n.type];
      if (def) for (const inp of def.inputs || []) {
        const srcs = inWires[n.id + ':' + inp.name];
        if (srcs) for (const src of srcs) if (byId[src[0]]) visit(byId[src[0]]);
      }
      mark[n.id] = 2;
      order.push(n);
    };
    for (const n of graph.nodes) visit(n);

    for (const n of order) {
      const def = defs[n.type];
      if (!def) { ctx.errors[n.id] = 'unknown node type ' + n.type; continue; }
      try {
        const resolved = {};
        for (const inp of def.inputs || []) {
          const srcs = inWires[n.id + ':' + inp.name];
          let list;
          if (srcs && srcs.length) {
            list = [];
            for (const src of srcs) {
              const o = ctx.out[src[0]];
              if (o && o[src[1]]) for (const v of o[src[1]]) list.push(v);
            }
          } else {
            const v = (n.values && n.values[inp.name] !== undefined) ? n.values[inp.name] : inp.default;
            list = v === undefined ? [] : [v];
          }
          resolved[inp.name] = list.map(v => LM.coerce(v, inp.type));
        }
        if (n.enabled === false) {
          const outs = {};
          for (const o of def.outputs || []) {
            const m = (def.inputs || []).find(i => i.type === o.type) || (def.inputs || [])[0];
            outs[o.name] = m ? resolved[m.name] : [];
          }
          ctx.out[n.id] = outs;
          n._last = { ins: resolved, outs };
          continue;
        }
        const outs = {};
        for (const o of def.outputs || []) outs[o.name] = [];
        const listIns = def.listInputs || [];
        let iter = 1;
        for (const inp of def.inputs || []) {
          if (listIns.indexOf(inp.name) < 0) iter = Math.max(iter, resolved[inp.name].length);
        }
        if (iter > 100000) iter = 100000;
        for (let i = 0; i < iter; i++) {
          const args = {};
          for (const inp of def.inputs || []) {
            const L = resolved[inp.name];
            args[inp.name] = listIns.indexOf(inp.name) >= 0 ? L : (L.length ? L[Math.min(i, L.length - 1)] : undefined);
          }
          ctx.i = i; // list-match index — state nodes key node._state by it
          const r = def.compute(args, ctx, n) || {};
          for (const o of def.outputs || []) {
            const v = r[o.name];
            if (v === undefined) continue;
            if (Array.isArray(v)) { for (const x of v) outs[o.name].push(x); }
            else outs[o.name].push(v);
          }
        }
        ctx.out[n.id] = outs;
        n._last = { ins: resolved, outs };
      } catch (e) {
        ctx.errors[n.id] = String(e && e.message || e);
        ctx.out[n.id] = {};
      }
    }
  }
};
