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

  /* ---------- vectors ----------
   * 2D is {x,y} (points and vectors are structurally the same thing here);
   * 3D is {x,y,z}. Nothing mutates its arguments — every helper returns fresh
   * objects, so a vector can be shared across a list without aliasing. */
  vadd: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
  vsub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
  vmul: (a, s) => ({ x: a.x * s, y: a.y * s }),
  vdot: (a, b) => a.x * b.x + a.y * b.y,
  vcross: (a, b) => a.x * b.y - a.y * b.x,   /* 2D cross is a scalar (the perp-dot) */
  vlen: a => Math.hypot(a.x, a.y),
  vunit: a => { const L = Math.hypot(a.x, a.y); return L ? { x: a.x / L, y: a.y / L } : { x: 0, y: 0 }; },
  vlerp: (a, b, t) => ({ x: LM.lerp(a.x, b.x, t), y: LM.lerp(a.y, b.y, t) }),
  vperp: a => ({ x: -a.y, y: a.x }),   /* turned +90°: on a y-down canvas that reads clockwise */

  v3add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  v3sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
  v3mul: (a, s) => ({ x: a.x * s, y: a.y * s, z: a.z * s }),
  v3dot: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
  v3cross: (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }),
  v3len: a => Math.hypot(a.x, a.y, a.z),
  v3unit: a => { const L = Math.hypot(a.x, a.y, a.z); return L ? { x: a.x / L, y: a.y / L, z: a.z / L } : { x: 0, y: 0, z: 0 }; },
  v3lerp: (a, b, t) => ({ x: LM.lerp(a.x, b.x, t), y: LM.lerp(a.y, b.y, t), z: LM.lerp(a.z, b.z, t) }),

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
    if (v === null || v === undefined || t === 'any' || t === 'geometry' || t === 'audio') return v;
    switch (t) {
      case 'number':
        if (typeof v === 'number') return v;
        if (typeof v === 'boolean') return v ? 1 : 0;
        if (typeof v === 'string') { const f = parseFloat(v); return isNaN(f) ? 0 : f; }
        if (typeof v === 'object' && v.x !== undefined) return Math.hypot(v.x, v.y, v.z || 0);
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
      /* point3 is position AND direction — 3D has no point/vector split, and the
         2D one is only semantic anyway. A 2D point arrives with z = 0. */
      case 'point3':
        if (typeof v === 'object' && v.x !== undefined) return { x: +v.x || 0, y: +v.y || 0, z: +v.z || 0 };
        if (typeof v === 'number') return { x: v, y: v, z: v };
        return { x: 0, y: 0, z: 0 };
      /* camera is plain JSON {pos, target, up, fov, mode, zoom} and needs no
         conversion — it falls through to the passthrough default, like geometry */
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
      /* z included, or two point3s differing only in depth would compare equal
         and sets/union would silently collapse a 3D lattice into a plane */
      return Math.abs(a.x - b.x) <= 1e-9 && Math.abs(a.y - b.y) <= 1e-9 &&
        Math.abs((a.z || 0) - (b.z || 0)) <= 1e-9;
    return JSON.stringify(a) === JSON.stringify(b);
  },

  fmt: v => {
    if (v === null || v === undefined) return '∅';
    if (typeof v === 'number') return String(Math.round(v * 1000) / 1000);
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'string') return v;
    if (v.kind === 'text') return '"' + v.text + '"';
    if (v.kind) return '‹' + v.kind + '›';
    if (v.pos !== undefined && v.target !== undefined) return '‹camera›';
    if (v.x !== undefined) return '(' + LM.fmt(v.x) + ', ' + LM.fmt(v.y) +
      (v.z === undefined ? '' : ', ' + LM.fmt(v.z)) + ')';
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
   * poly3    {kind:'poly3', pts:[{x,y,z}], closed}      3D polyline
   * mesh     {kind:'mesh', vs:[{x,y,z}], fs:[[i,j,k,…]]}  faces index into vs
   *
   * The two 3D kinds ride the same `geometry` port type (coerce passes geometry
   * through untouched). In a 2D node they degrade to their FRONT ELEVATION —
   * toPoly simply drops z — so bounds, hit tests and offsets all keep working
   * rather than returning nothing. Real 3D work goes through LM.xform3 and the
   * projection layer below; a projected mesh comes back as ordinary 2D polys.
   */
  isClosedGeom: g => !!g && (g.kind === 'circle' || g.kind === 'ellipse' || g.kind === 'rect' ||
    ((g.kind === 'poly' || g.kind === 'spline' || g.kind === 'poly3') && g.closed)),

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
      /* the 3D kinds drop z — a 3D curve in a 2D node is its front elevation */
      case 'poly3': return { pts: (g.pts || []).map(p => ({ x: p.x, y: p.y })), closed: !!g.closed };
      case 'mesh': return { pts: (g.vs || []).map(p => ({ x: p.x, y: p.y })), closed: false };
      default: return { pts: [], closed: false };
    }
  },

  /* ---------- polyline analysis ----------
   * Everything below works on a bare point list plus its `closed` flag — the
   * shape toPoly hands back. Curve nodes sample once and then stay down here. */

  polyLength: (pts, closed) => {
    const n = pts.length;
    if (n < 2) return 0;
    const nSeg = closed ? n : n - 1;
    let L = 0;
    for (let i = 0; i < nSeg; i++) { const q = pts[(i + 1) % n]; L += Math.hypot(q.x - pts[i].x, q.y - pts[i].y); }
    return L;
  },

  /* signed area of the closed loop through pts — positive for the winding
     that reads clockwise on a y-down canvas. Sign carries information; take
     Math.abs at the call site when you only want size. */
  polyArea: pts => {
    const n = pts.length;
    if (n < 3) return 0;
    let a = 0;
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; a += p.x * q.y - q.x * p.y; }
    return a / 2;
  },

  /* area centroid of the closed loop (falls back to the vertex mean for
     degenerate loops with no area) */
  polyCentroid: pts => {
    const n = pts.length;
    if (!n) return { x: 0, y: 0 };
    const mean = () => {
      let sx = 0, sy = 0;
      for (const p of pts) { sx += p.x; sy += p.y; }
      return { x: sx / n, y: sy / n };
    };
    if (n < 3) return mean();
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], f = p.x * q.y - q.x * p.y;
      a += f; cx += (p.x + q.x) * f; cy += (p.y + q.y) * f;
    }
    if (Math.abs(a) < 1e-12) return mean();
    return { x: cx / (3 * a), y: cy / (3 * a) };
  },

  /* crossing-number test against a raw closed point list */
  ptInPoly: (p, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      if ((pts[i].y > p.y) !== (pts[j].y > p.y) &&
        p.x < (pts[j].x - pts[i].x) * (p.y - pts[i].y) / (pts[j].y - pts[i].y) + pts[i].x) inside = !inside;
    }
    return inside;
  },

  /* nearest point on a point list → {pt, t, dist, seg}. t is the normalized
     arc-length parameter, so it feeds straight back into LM.curvePoint. */
  closestOnPoly: (pts, closed, p) => {
    const n = pts.length;
    if (!n) return null;
    if (n === 1) return { pt: { x: pts[0].x, y: pts[0].y }, t: 0, dist: Math.hypot(pts[0].x - p.x, pts[0].y - p.y), seg: 0 };
    const nSeg = closed ? n : n - 1;
    const segL = [];
    let tot = 0;
    for (let i = 0; i < nSeg; i++) {
      const q = pts[(i + 1) % n];
      const L = Math.hypot(q.x - pts[i].x, q.y - pts[i].y);
      segL.push(L); tot += L;
    }
    let best = null, run = 0;
    for (let i = 0; i < nSeg; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
      const u = L2 ? LM.clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / L2, 0, 1) : 0;
      const qx = a.x + dx * u, qy = a.y + dy * u;
      const d = Math.hypot(qx - p.x, qy - p.y);
      if (!best || d < best.dist) best = { pt: { x: qx, y: qy }, t: tot ? (run + segL[i] * u) / tot : 0, dist: d, seg: i };
      run += segL[i];
    }
    return best;
  },

  /* arc-length resample to n evenly spaced points. closed → n points around the
     loop (the last one does NOT repeat the first); open → n points from start
     to end inclusive. */
  resample: (pts, closed, n) => {
    const m = pts.length;
    n = Math.max(0, Math.floor(n));
    if (m < 2 || n < 1) return pts.slice(0, n).map(p => ({ x: p.x, y: p.y }));
    const nSeg = closed ? m : m - 1;
    const seg = [];
    let tot = 0;
    for (let i = 0; i < nSeg; i++) {
      const q = pts[(i + 1) % m];
      const L = Math.hypot(q.x - pts[i].x, q.y - pts[i].y);
      seg.push(L); tot += L;
    }
    const out = [];
    if (tot < 1e-9) { for (let k = 0; k < n; k++) out.push({ x: pts[0].x, y: pts[0].y }); return out; }
    const div = closed ? n : (n > 1 ? n - 1 : 1);
    let i = 0, acc = 0;
    for (let k = 0; k < n; k++) {
      const target = tot * k / div;
      while (i < nSeg - 1 && acc + seg[i] < target) { acc += seg[i]; i++; }
      const p = pts[i], q = pts[(i + 1) % m];
      const f = seg[i] > 1e-9 ? (target - acc) / seg[i] : 0;
      out.push({ x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f });
    }
    return out;
  },

  /* segment a→b × segment c→d → {pt, ta, tb} (parameters along each), or null.
     Parallel and collinear pairs report null — the enabling primitive under
     Trim, Region Boolean and the intersection nodes. */
  segInt: (a, b, c, d) => {
    const rx = b.x - a.x, ry = b.y - a.y, sx = d.x - c.x, sy = d.y - c.y;
    const den = rx * sy - ry * sx;
    if (Math.abs(den) < 1e-12) return null;
    const ox = c.x - a.x, oy = c.y - a.y;
    const ta = (ox * sy - oy * sx) / den;
    const tb = (ox * ry - oy * rx) / den;
    if (ta < 0 || ta > 1 || tb < 0 || tb > 1) return null;
    return { pt: { x: a.x + rx * ta, y: a.y + ry * ta }, ta: ta, tb: tb };
  },

  /* hits that land on the same spot twice (a shared vertex is found by both of
     its segments) collapse to one */
  dedupeHits: hits => {
    const out = [];
    for (const h of hits) {
      let dup = false;
      for (const o of out) if (Math.abs(o.pt.x - h.pt.x) < 1e-6 && Math.abs(o.pt.y - h.pt.y) < 1e-6) { dup = true; break; }
      if (!dup) out.push(h);
    }
    return out;
  },

  /* polyline × polyline → [{pt, ta, tb}] sorted along A. ta/tb are normalized
     arc-length parameters on each input, so they feed LM.curvePoint directly. */
  polyInt: (A, ca, B, cb) => {
    const out = [];
    const na = A.length, nb = B.length;
    if (na < 2 || nb < 2) return out;
    const sa = ca ? na : na - 1, sb = cb ? nb : nb - 1;
    const la = [0], lb = [0];
    let ta = 0, tb = 0;
    for (let i = 0; i < sa; i++) { const q = A[(i + 1) % na]; ta += Math.hypot(q.x - A[i].x, q.y - A[i].y); la.push(ta); }
    for (let j = 0; j < sb; j++) { const q = B[(j + 1) % nb]; tb += Math.hypot(q.x - B[j].x, q.y - B[j].y); lb.push(tb); }
    for (let i = 0; i < sa; i++) {
      const a0 = A[i], a1 = A[(i + 1) % na];
      const axm = Math.min(a0.x, a1.x), axM = Math.max(a0.x, a1.x);
      const aym = Math.min(a0.y, a1.y), ayM = Math.max(a0.y, a1.y);
      for (let j = 0; j < sb; j++) {
        const b0 = B[j], b1 = B[(j + 1) % nb];
        if (Math.min(b0.x, b1.x) > axM || Math.max(b0.x, b1.x) < axm) continue;
        if (Math.min(b0.y, b1.y) > ayM || Math.max(b0.y, b1.y) < aym) continue;
        const h = LM.segInt(a0, a1, b0, b1);
        if (!h) continue;
        out.push({
          pt: h.pt,
          ta: ta ? (la[i] + (la[i + 1] - la[i]) * h.ta) / ta : 0,
          tb: tb ? (lb[j] + (lb[j + 1] - lb[j]) * h.tb) / tb : 0
        });
      }
    }
    out.sort((p, q) => p.ta - q.ta);
    return LM.dedupeHits(out);
  },

  /* where a polyline crosses itself → [{pt, ta, tb}] (both parameters on the
     same curve). Adjacent segments are skipped — they always share a vertex. */
  polySelfInt: (A, closed) => {
    const out = [];
    const n = A.length;
    if (n < 4) return out;
    const segs = closed ? n : n - 1;
    const la = [0];
    let tot = 0;
    for (let i = 0; i < segs; i++) { const q = A[(i + 1) % n]; tot += Math.hypot(q.x - A[i].x, q.y - A[i].y); la.push(tot); }
    for (let i = 0; i < segs; i++) {
      for (let j = i + 2; j < segs; j++) {
        if (closed && i === 0 && j === segs - 1) continue;   /* first and last meet at a vertex */
        const h = LM.segInt(A[i], A[(i + 1) % n], A[j], A[(j + 1) % n]);
        if (!h) continue;
        out.push({
          pt: h.pt,
          ta: tot ? (la[i] + (la[i + 1] - la[i]) * h.ta) / tot : 0,
          tb: tot ? (la[j] + (la[j + 1] - la[j]) * h.tb) / tot : 0
        });
      }
    }
    out.sort((p, q) => p.ta - q.ta);
    return LM.dedupeHits(out);
  },

  /* cut a point list at normalized arc-length parameters → array of open point
     lists. A closed list cut in k places yields k pieces (the first starts at
     the first cut and the last wraps the seam); an open list yields k + 1. */
  splitPoly: (pts, closed, ts) => {
    const n = pts.length;
    if (n < 2) return [];
    const nSeg = closed ? n : n - 1;
    const d = [0];
    let tot = 0;
    for (let i = 0; i < nSeg; i++) { const q = pts[(i + 1) % n]; tot += Math.hypot(q.x - pts[i].x, q.y - pts[i].y); d.push(tot); }
    const whole = () => [(closed ? pts.concat([pts[0]]) : pts).map(p => ({ x: p.x, y: p.y }))];
    if (tot < 1e-9) return [];
    const cuts = [];
    for (const t of ts) {
      const u = closed ? LM.fract(t) : LM.clamp(t, 0, 1);
      if (u > 1e-9 && u < 1 - 1e-9) cuts.push(u);
    }
    cuts.sort((a, b) => a - b);
    if (!cuts.length) return whole();
    /* walk the vertices, dropping cut points into place as we pass them */
    const V = [];
    let ci = 0;
    for (let i = 0; i < nSeg; i++) {
      V.push({ p: { x: pts[i].x, y: pts[i].y }, cut: false });
      while (ci < cuts.length && cuts[ci] * tot <= d[i + 1] + 1e-12) {
        const span = d[i + 1] - d[i] || 1, f = LM.clamp((cuts[ci] * tot - d[i]) / span, 0, 1);
        const q = pts[(i + 1) % n];
        V.push({ p: { x: LM.lerp(pts[i].x, q.x, f), y: LM.lerp(pts[i].y, q.y, f) }, cut: true });
        ci++;
      }
    }
    if (!closed) V.push({ p: { x: pts[n - 1].x, y: pts[n - 1].y }, cut: false });
    const out = [];
    if (closed) {
      let start = -1;
      for (let i = 0; i < V.length; i++) if (V[i].cut) { start = i; break; }
      if (start < 0) return whole();
      const R = V.slice(start).concat(V.slice(0, start));
      let cur = [R[0].p];
      for (let i = 1; i < R.length; i++) { cur.push(R[i].p); if (R[i].cut) { out.push(cur); cur = [R[i].p]; } }
      cur.push(R[0].p);
      out.push(cur);
    } else {
      let cur = [V[0].p];
      for (let i = 1; i < V.length; i++) {
        cur.push(V[i].p);
        if (V[i].cut && i < V.length - 1) { out.push(cur); cur = [V[i].p]; }
      }
      out.push(cur);
    }
    return out.filter(p => p.length >= 2);
  },

  /* convex hull, monotone chain (Andrew). Fewer than 3 points passes through. */
  convexHull: pts => {
    const P = pts.filter(p => p && p.x !== undefined).map(p => ({ x: p.x, y: p.y }));
    if (P.length < 3) return P;
    P.sort((a, b) => a.x - b.x || a.y - b.y);
    const turn = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lo = [];
    for (const p of P) {
      while (lo.length >= 2 && turn(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
      lo.push(p);
    }
    const hi = [];
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      while (hi.length >= 2 && turn(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop();
      hi.push(p);
    }
    lo.pop(); hi.pop();
    const H = lo.concat(hi);
    return H.length >= 3 ? H : P;
  },

  /* ---------- polygon booleans (Greiner–Hormann) ----------
   * A and B are closed point lists; op is 'union' | 'intersection' |
   * 'difference' (A minus B). Returns an array of closed point lists.
   * Written out rather than vendored — invariant #7.
   *
   * Two limits worth knowing, both deliberate:
   *   · Weft geometry has no holes, so a difference whose cutter lands wholly
   *     inside A returns A unchanged rather than a ring.
   *   · Degenerate contact (a vertex sitting exactly on the other outline)
   *     breaks the algorithm's alternation, so it is dodged: nudge B by a
   *     ten-thousandth of a pixel and try again, up to four times.
   */
  clipPoly: (A, B, op) => {
    for (let k = 0; k < 4; k++) {
      const Bs = k ? B.map(p => ({ x: p.x + 1e-4 * k, y: p.y + 2.3e-4 * k })) : B;
      const r = LM.clipPolyOnce(A, Bs, op);
      if (r) return r;
    }
    return op === 'union' ? [A.slice(), B.slice()] : op === 'intersection' ? [] : [A.slice()];
  },

  /* one attempt — null means "degenerate, nudge and retry" */
  clipPolyOnce: (A, B, op) => {
    const na = A.length, nb = B.length;
    if (na < 3 || nb < 3 || na * nb > 250000) return null;
    const EPS = 1e-9;
    const hits = [];
    for (let i = 0; i < na; i++) {
      const a0 = A[i], a1 = A[(i + 1) % na];
      const axm = Math.min(a0.x, a1.x), axM = Math.max(a0.x, a1.x);
      const aym = Math.min(a0.y, a1.y), ayM = Math.max(a0.y, a1.y);
      for (let j = 0; j < nb; j++) {
        const b0 = B[j], b1 = B[(j + 1) % nb];
        if (Math.min(b0.x, b1.x) > axM || Math.max(b0.x, b1.x) < axm) continue;
        if (Math.min(b0.y, b1.y) > ayM || Math.max(b0.y, b1.y) < aym) continue;
        const h = LM.segInt(a0, a1, b0, b1);
        if (!h) continue;
        if (h.ta < EPS || h.ta > 1 - EPS || h.tb < EPS || h.tb > 1 - EPS) return null;
        hits.push({ i: i, j: j, ta: h.ta, tb: h.tb, pt: h.pt });
      }
    }
    const inA = LM.ptInPoly(A[0], B), inB = LM.ptInPoly(B[0], A);
    if (!hits.length) {
      if (op === 'union') return inA ? [B.slice()] : inB ? [A.slice()] : [A.slice(), B.slice()];
      if (op === 'intersection') return inA ? [A.slice()] : inB ? [B.slice()] : [];
      return inA ? [] : [A.slice()];   /* difference; B inside A gives a hole we cannot express */
    }
    if (hits.length % 2) return null;   /* transversal crossings always pair up */

    /* weave the intersections into both outlines, then cross-link the pairs */
    const build = (src, ik, ak, vk) => {
      const L = [];
      for (let i = 0; i < src.length; i++) {
        L.push({ x: src[i].x, y: src[i].y, isInt: false });
        const on = hits.filter(h => h[ik] === i).sort((p, q) => p[ak] - q[ak]);
        for (const h of on) { const v = { x: h.pt.x, y: h.pt.y, isInt: true }; L.push(v); h[vk] = v; }
      }
      for (let i = 0; i < L.length; i++) { L[i].list = L; L[i].idx = i; }
      return L;
    };
    const LA = build(A, 'i', 'ta', 'av'), LB = build(B, 'j', 'tb', 'bv');
    for (const h of hits) { h.av.pair = h.bv; h.bv.pair = h.av; }

    /* entry/exit alternates along each outline; where it starts is what makes
       one traversal a union and another an intersection */
    let sf = (op === 'intersection') !== inA;
    let cf = (op !== 'union') !== inB;
    for (const v of LA) if (v.isInt) { v.entry = sf; sf = !sf; }
    for (const v of LB) if (v.isInt) { v.entry = cf; cf = !cf; }

    const step = (v, fwd) => v.list[(v.idx + (fwd ? 1 : v.list.length - 1)) % v.list.length];
    const out = [];
    let guard = 0;
    for (const start of LA) {
      if (!start.isInt || start.visited) continue;
      const poly = [];
      let cur = start;
      do {
        cur.visited = true;
        if (cur.pair) cur.pair.visited = true;
        poly.push({ x: cur.x, y: cur.y });
        const fwd = !!cur.entry;
        do { cur = step(cur, fwd); poly.push({ x: cur.x, y: cur.y }); } while (!cur.isInt);
        if (!cur.pair || ++guard > 20000) return null;
        cur = cur.pair;
      } while (!cur.visited);
      const clean = [];
      for (const p of poly) {
        const q = clean[clean.length - 1];
        if (!q || Math.abs(q.x - p.x) > 1e-9 || Math.abs(q.y - p.y) > 1e-9) clean.push(p);
      }
      const f = clean[0], l = clean[clean.length - 1];
      if (clean.length > 1 && Math.abs(f.x - l.x) < 1e-9 && Math.abs(f.y - l.y) < 1e-9) clean.pop();
      /* anything under a square pixel is either invisible or a sliver the
         nudge invented — difference of two identical shapes must come back
         empty, not as a hairline */
      if (clean.length >= 3 && Math.abs(LM.polyArea(clean)) > 1) out.push(clean);
    }
    /* a union of two shapes that cross always has an outer ring; nothing back
       means the traversal lost the thread — better to nudge than to draw wrong */
    return (out.length || op !== 'union') ? out : null;
  },

  /* round the corners of a point list with circular arcs of radius r. Radius is
     capped at half the shorter adjacent edge, so tight corners degrade instead
     of folding. Straight and doubled-back corners pass through untouched. */
  filletPoly: (pts, closed, r, seg) => {
    const n = pts.length;
    const S = LM.clamp(Math.floor(seg || 8), 1, 64);
    if (n < 3 || !(r > 0)) return pts.map(p => ({ x: p.x, y: p.y }));
    const out = [];
    if (!closed) out.push({ x: pts[0].x, y: pts[0].y });
    const i0 = closed ? 0 : 1, i1 = closed ? n - 1 : n - 2;
    for (let i = i0; i <= i1; i++) {
      const p = pts[i], a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      const ua = LM.vsub(a, p), ub = LM.vsub(b, p);
      const la = LM.vlen(ua), lb = LM.vlen(ub);
      if (la < 1e-9 || lb < 1e-9) { out.push({ x: p.x, y: p.y }); continue; }
      const u = { x: ua.x / la, y: ua.y / la }, v = { x: ub.x / lb, y: ub.y / lb };
      const th = Math.acos(LM.clamp(LM.vdot(u, v), -1, 1));
      if (!(th > 1e-3) || th > Math.PI - 1e-3) { out.push({ x: p.x, y: p.y }); continue; }
      const ph = th / 2;
      let rr = r, d = r / Math.tan(ph);
      const cap = Math.min(la, lb) * 0.5;
      if (d > cap) { d = cap; rr = d * Math.tan(ph); }
      const t1 = { x: p.x + u.x * d, y: p.y + u.y * d };
      const t2 = { x: p.x + v.x * d, y: p.y + v.y * d };
      const w = LM.vunit({ x: u.x + v.x, y: u.y + v.y });
      const h = rr / Math.sin(ph);
      const c = { x: p.x + w.x * h, y: p.y + w.y * h };
      const a1 = Math.atan2(t1.y - c.y, t1.x - c.x);
      let da = Math.atan2(t2.y - c.y, t2.x - c.x) - a1;
      while (da > Math.PI) da -= LM.TAU;
      while (da < -Math.PI) da += LM.TAU;
      for (let k = 0; k <= S; k++) {
        const ang = a1 + da * k / S;
        out.push({ x: c.x + Math.cos(ang) * rr, y: c.y + Math.sin(ang) * rr });
      }
    }
    if (!closed) out.push({ x: pts[n - 1].x, y: pts[n - 1].y });
    return out;
  },

  /* uniform offset of a point list. closed: positive d = outward regardless of
     winding. open: positive d = right-hand side of travel. miter joins with a
     limit — no self-intersection cleanup, so offsets past a curve's reach fold. */
  offsetPoly: (pts, closed, d) => {
    const n = pts.length;
    if (n < 2 || !d) return pts.map(p => ({ x: p.x, y: p.y }));
    let dd = d;
    /* the right normal points outward only for positive winding */
    if (closed && LM.polyArea(pts) < 0) dd = -d;
    const nx = [], ny = [], m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      const L = Math.hypot(q.x - p.x, q.y - p.y) || 1;
      nx.push((q.y - p.y) / L); ny.push(-(q.x - p.x) / L);
    }
    const out = [];
    for (let i = 0; i < n; i++) {
      const ia = closed ? (i - 1 + m) % m : Math.max(0, i - 1);
      const ib = closed ? i : Math.min(m - 1, i);
      const mx = nx[ia] + nx[ib], my = ny[ia] + ny[ib];
      const den = Math.max(0.15, 1 + (nx[ia] * nx[ib] + ny[ia] * ny[ib]));
      out.push({ x: pts[i].x + mx * dd / den, y: pts[i].y + my * dd / den });
    }
    return out;
  },

  /* offset geometry by d. circles and arcs stay exact (r + d); lines stay lines;
     everything else samples through toPoly and offsets the polyline. */
  offsetGeom: (g, d, res) => {
    if (!g || !g.kind || !d) return g;
    switch (g.kind) {
      case 'circle': return { kind: 'circle', cx: g.cx, cy: g.cy, r: Math.max(0, g.r + d) };
      case 'arc': return { kind: 'arc', cx: g.cx, cy: g.cy, r: Math.max(0, g.r + d), a0: g.a0, a1: g.a1 };
      case 'line': {
        const L = Math.hypot(g.b.x - g.a.x, g.b.y - g.a.y) || 1;
        const ox = (g.b.y - g.a.y) / L * d, oy = -(g.b.x - g.a.x) / L * d;
        return { kind: 'line', a: { x: g.a.x + ox, y: g.a.y + oy }, b: { x: g.b.x + ox, y: g.b.y + oy } };
      }
      default: {
        const P = LM.toPoly(g, res || 96);
        if (P.pts.length < 2) return g;
        return { kind: 'poly', pts: LM.offsetPoly(P.pts, P.closed, d), closed: P.closed };
      }
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
    if (P.closed && pts.length > 2 && LM.ptInPoly(p, pts)) return true;
    const cl = LM.closestOnPoly(pts, P.closed, p);
    return !!cl && cl.dist <= pad;
  },

  /* ---------- curve parameterization ----------
   * Every kind is parameterized by arc length over t = 0..1, so a parameter
   * from one node means the same place on the curve in every other. Circles,
   * arcs and lines are analytic; the sampled kinds go through a distance table.
   * Build the table ONCE per curve (LM.curveTable) and hand it to curvePoint /
   * tangentAt — Divide Curve with N = 500 would otherwise resample 500 times.
   * curveTable returns null for the analytic kinds; passing null is fine. */
  curveTable: (g, res) => {
    if (!g || g.kind === 'circle' || g.kind === 'arc' || g.kind === 'line') return null;
    const P = LM.toPoly(g, res || 96);
    const pts = P.closed && P.pts.length ? P.pts.concat([P.pts[0]]) : P.pts;
    const d = [0];
    let tot = 0;
    for (let i = 1; i < pts.length; i++) { tot += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); d.push(tot); }
    return { pts: pts, closed: P.closed, d: d, tot: tot };
  },

  tableAt: (tb, t) => {
    const pts = tb.pts, d = tb.d;
    if (!pts.length) return { x: 0, y: 0 };
    if (pts.length === 1) return { x: pts[0].x, y: pts[0].y };
    const target = LM.clamp(t, 0, 1) * tb.tot;
    let lo = 1, hi = d.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (d[mid] < target) lo = mid + 1; else hi = mid; }
    const seg = d[lo] - d[lo - 1] || 1, u = (target - d[lo - 1]) / seg;
    return { x: LM.lerp(pts[lo - 1].x, pts[lo].x, u), y: LM.lerp(pts[lo - 1].y, pts[lo].y, u) };
  },

  curvePoint: (g, t, tb) => {
    if (!g) return { x: 0, y: 0 };
    switch (g.kind) {
      case 'circle': { const a = t * LM.TAU; return { x: g.cx + Math.cos(a) * g.r, y: g.cy + Math.sin(a) * g.r }; }
      case 'arc': { const a = LM.lerp(g.a0, g.a1, LM.clamp(t, 0, 1)); return { x: g.cx + Math.cos(a) * g.r, y: g.cy + Math.sin(a) * g.r }; }
      case 'line': { const u = LM.clamp(t, 0, 1); return { x: LM.lerp(g.a.x, g.b.x, u), y: LM.lerp(g.a.y, g.b.y, u) }; }
      default: return LM.tableAt(tb || LM.curveTable(g, 96), t);
    }
  },

  /* unit tangent at parameter t — the direction of travel along the curve */
  tangentAt: (g, t, tb) => {
    if (!g) return { x: 1, y: 0 };
    switch (g.kind) {
      case 'circle': { const a = t * LM.TAU; return { x: -Math.sin(a), y: Math.cos(a) }; }
      case 'arc': { const a = LM.lerp(g.a0, g.a1, LM.clamp(t, 0, 1)), s = g.a1 < g.a0 ? -1 : 1; return { x: -Math.sin(a) * s, y: Math.cos(a) * s }; }
      case 'line': return LM.vunit(LM.vsub(g.b, g.a));
      default: {
        const T = tb || LM.curveTable(g, 96);
        if (!T || T.pts.length < 2) return { x: 1, y: 0 };
        const h = 1 / 256;
        const lo = T.closed ? LM.fract(t - h) : LM.clamp(t - h, 0, 1);
        const hi = T.closed ? LM.fract(t + h) : LM.clamp(t + h, 0, 1);
        const v = LM.vunit(LM.vsub(LM.tableAt(T, hi), LM.tableAt(T, lo)));
        return (v.x || v.y) ? v : { x: 1, y: 0 };
      }
    }
  },

  curveLength: (g, res) => {
    if (!g) return 0;
    if (g.kind === 'circle') return LM.TAU * Math.abs(g.r);
    if (g.kind === 'arc') return Math.abs(g.a1 - g.a0) * Math.abs(g.r);
    if (g.kind === 'line') return Math.hypot(g.b.x - g.a.x, g.b.y - g.a.y);
    const P = LM.toPoly(g, res || 128);
    return LM.polyLength(P.pts, P.closed);
  },

  /* ---------- affine transforms: m = [a,b,c,d,e,f], canvas convention ---------- */
  matIdentity: () => [1, 0, 0, 1, 0, 0],
  matMove: (dx, dy) => [1, 0, 0, 1, dx, dy],
  matRot: (a, c) => {
    const co = Math.cos(a), si = Math.sin(a);
    return [co, si, -si, co, c.x - co * c.x + si * c.y, c.y - si * c.x - co * c.y];
  },
  matScale: (sx, sy, c) => [sx, 0, 0, sy, c.x - sx * c.x, c.y - sy * c.y],
  /* compose: matMul(m, n) applies m FIRST, then n — reads left to right like a
     pipeline, which is the opposite of the usual matrix-product convention */
  matMul: (m, n) => [
    n[0] * m[0] + n[2] * m[1], n[1] * m[0] + n[3] * m[1],
    n[0] * m[2] + n[2] * m[3], n[1] * m[2] + n[3] * m[3],
    n[0] * m[4] + n[2] * m[5] + n[4], n[1] * m[4] + n[3] * m[5] + n[5]
  ],
  /* reflection across the line through p and q (a degenerate line is identity) */
  matMirror: (p, q) => {
    let dx = q.x - p.x, dy = q.y - p.y;
    const L = Math.hypot(dx, dy);
    if (!L) return LM.matIdentity();
    dx /= L; dy /= L;
    const A = dx * dx - dy * dy, B = 2 * dx * dy;
    return [A, B, B, -A, p.x - (A * p.x + B * p.y), p.y - (B * p.x - A * p.y)];
  },
  matApply: (m, p) => ({ x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] }),
  /* what the linear part does to the unit circle: it becomes an ellipse with
     radii |s1| ≥ |s2| turned by rot (a closed-form 2×2 SVD). |s1| === |s2|
     means the map is conformal — circles stay circles. */
  matSvd: m => {
    const E = (m[0] + m[3]) / 2, F = (m[0] - m[3]) / 2, G = (m[1] + m[2]) / 2, H = (m[1] - m[2]) / 2;
    const Q = Math.hypot(E, H), R = Math.hypot(F, G);
    return { s1: Q + R, s2: Q - R, rot: (Math.atan2(H, E) + Math.atan2(G, F)) / 2 };
  },

  xformGeom: (g, m) => {
    if (!g) return g;
    const ap = p => LM.matApply(m, p);
    const sf = (Math.hypot(m[0], m[1]) + Math.hypot(m[2], m[3])) / 2;
    if (g.kind === undefined && g.x !== undefined) return ap(g);
    switch (g.kind) {
      case 'line': return { kind: 'line', a: ap(g.a), b: ap(g.b) };
      case 'circle': {
        /* a non-uniform scale turns a circle into an ellipse — say so, instead
           of averaging the two factors into a wrong circle */
        const c = ap({ x: g.cx, y: g.cy }), s = LM.matSvd(m);
        if (Math.abs(Math.abs(s.s1) - Math.abs(s.s2)) < 1e-9) return { kind: 'circle', cx: c.x, cy: c.y, r: Math.abs(g.r * s.s1) };
        return { kind: 'ellipse', cx: c.x, cy: c.y, rx: Math.abs(g.r * s.s1), ry: Math.abs(g.r * s.s2), rot: s.rot };
      }
      case 'ellipse': {
        const c = ap({ x: g.cx, y: g.cy }), s = LM.matSvd(m);
        const co = Math.cos(g.rot || 0), si = Math.sin(g.rot || 0);
        if (Math.abs(Math.abs(s.s1) - Math.abs(s.s2)) < 1e-9) {
          /* conformal: carry the major axis through so t = 0 stays put */
          const k = Math.abs(s.s1), ax = { x: m[0] * co + m[2] * si, y: m[1] * co + m[3] * si };
          return { kind: 'ellipse', cx: c.x, cy: c.y, rx: g.rx * k, ry: g.ry * k, rot: Math.atan2(ax.y, ax.x) };
        }
        const e = LM.matSvd(LM.matMul([g.rx * co, g.rx * si, -g.ry * si, g.ry * co, 0, 0], m));
        return { kind: 'ellipse', cx: c.x, cy: c.y, rx: Math.abs(e.s1), ry: Math.abs(e.s2), rot: e.rot };
      }
      case 'text': { const p = ap({ x: g.x, y: g.y }); return { kind: 'text', text: g.text, x: p.x, y: p.y, size: (g.size || 24) * sf }; }
      case 'poly': return { kind: 'poly', pts: (g.pts || []).map(ap), closed: !!g.closed };
      case 'spline': return { kind: 'spline', pts: (g.pts || []).map(ap), closed: !!g.closed };
      /* a 2D transform on 3D geometry acts on x/y and leaves z alone — Move and
         Rotate stay predictable on a mesh instead of flattening it. Real 3D
         transforms are LM.xform3 (the d3/move3 family). */
      case 'poly3': return { kind: 'poly3', pts: (g.pts || []).map(p => { const q = ap(p); return { x: q.x, y: q.y, z: p.z || 0 }; }), closed: !!g.closed };
      case 'mesh': return {
        kind: 'mesh',
        vs: (g.vs || []).map(p => { const q = ap(p); return { x: q.x, y: q.y, z: p.z || 0 }; }),
        fs: (g.fs || []).map(f => f.slice())
      };
      default: { const P = LM.toPoly(g, 64); return { kind: 'poly', pts: P.pts.map(ap), closed: P.closed }; }
    }
  },

  /* ---------- 3D: matrices, cameras, the software renderer ----------
   * World axes extend the canvas rather than replacing it: x right, y DOWN,
   * z away from the viewer. That is right-handed (right × down = away), so a 2D
   * shape lifted to z = 0 projects upright and unmirrored, and the default
   * camera sits in front of it at negative z. Angles are radians everywhere
   * except a camera's field of view, which is degrees — that is how lenses are
   * written, and Weft has Radians/Degrees nodes for the crossing.
   *
   * Matrices are 16-element ROW-major arrays applied to a column vector:
   *   x' = m0·x + m1·y + m2·z + m3   (one row each for y, z, then w)
   * mat4Mul(m, n) applies m FIRST, then n — left to right like the 2D matMul it
   * mirrors. The projection matrices map camera space straight to SCREEN PIXELS
   * rather than to NDC, with w = view depth: there is then no aspect term to get
   * wrong and no second mapping step, and after a projection only x and y mean
   * anything (depth is read off the view stage).
   *
   * Nothing down here touches ctx, the draw list or the renderer. Projection is
   * an ordinary node emitting ordinary 2D geometry — which is the whole reason
   * 3D costs the export contract and invariant #8 exactly nothing. */
  mat4Identity: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  mat4Move: (dx, dy, dz) => [1, 0, 0, dx, 0, 1, 0, dy, 0, 0, 1, dz, 0, 0, 0, 1],
  mat4Scale: (sx, sy, sz) => [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1],
  mat4Mul: (m, n) => {
    const o = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += n[r * 4 + k] * m[k * 4 + c];
      o[r * 4 + c] = s;
    }
    return o;
  },
  /* rotation by a about the axis through the origin (Rodrigues, axis unitized) */
  mat4RotAxis: (axis, a) => {
    const u = LM.v3unit(axis && (axis.x || axis.y || axis.z) ? axis : { x: 0, y: 1, z: 0 });
    const c = Math.cos(a), s = Math.sin(a), t = 1 - c;
    return [
      t * u.x * u.x + c, t * u.x * u.y - s * u.z, t * u.x * u.z + s * u.y, 0,
      t * u.x * u.y + s * u.z, t * u.y * u.y + c, t * u.y * u.z - s * u.x, 0,
      t * u.x * u.z - s * u.y, t * u.y * u.z + s * u.x, t * u.z * u.z + c, 0,
      0, 0, 0, 1
    ];
  },
  /* x first, then y, then z */
  mat4RotEuler: (rx, ry, rz) => LM.mat4Mul(LM.mat4Mul(
    LM.mat4RotAxis({ x: 1, y: 0, z: 0 }, rx),
    LM.mat4RotAxis({ x: 0, y: 1, z: 0 }, ry)),
    LM.mat4RotAxis({ x: 0, y: 0, z: 1 }, rz)),
  /* apply to a point, dividing through by w. w is 1 for every affine matrix
     here and the view depth for the projection ones, so one function does both */
  mat4Apply: (m, p) => {
    const z = p.z || 0;
    const w = m[12] * p.x + m[13] * p.y + m[14] * z + m[15];
    const iw = Math.abs(w) < 1e-9 ? 0 : 1 / w;
    return {
      x: (m[0] * p.x + m[1] * p.y + m[2] * z + m[3]) * iw,
      y: (m[4] * p.x + m[5] * p.y + m[6] * z + m[7]) * iw,
      z: (m[8] * p.x + m[9] * p.y + m[10] * z + m[11]) * iw
    };
  },
  /* world → camera space: the camera ends at the origin looking down −z, so
     everything in front of it has a negative z and depth is −z */
  mat4LookAt: (eye, target, up) => {
    let z = LM.v3sub(eye, target);
    if (!(z.x || z.y || z.z)) z = { x: 0, y: 0, z: -1 };
    z = LM.v3unit(z);
    /* up parallel to the view direction: pick any perpendicular rather than
       collapsing the basis to zero (a camera looking straight down still works) */
    let x = LM.v3cross(up && up.x !== undefined ? up : { x: 0, y: -1, z: 0 }, z);
    if (LM.v3len(x) < 1e-9) x = LM.v3cross({ x: 0, y: 0, z: 1 }, z);
    if (LM.v3len(x) < 1e-9) x = LM.v3cross({ x: 1, y: 0, z: 0 }, z);
    x = LM.v3unit(x);
    const y = LM.v3cross(z, x);
    return [
      x.x, x.y, x.z, -LM.v3dot(x, eye),
      y.x, y.y, y.z, -LM.v3dot(y, eye),
      z.x, z.y, z.z, -LM.v3dot(z, eye),
      0, 0, 0, 1
    ];
  },
  /* camera space → screen px. Vertical fov in radians; h (the canvas height)
     sets the pixel scale for BOTH axes, so nothing stretches and no aspect
     ratio enters. w comes out as the view depth, ready for the divide. */
  mat4Persp: (fov, h) => {
    const k = (h / 2) / Math.tan(LM.clamp(fov, 0.02, 3.1) / 2);
    return [k, 0, 0, 0, 0, -k, 0, 0, 0, 0, 1, 0, 0, 0, -1, 0];
  },
  /* the same mapping with no divide: z px per world unit, w stays 1 */
  mat4Ortho: z => [z, 0, 0, 0, 0, -z, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],

  /* the camera value is plain JSON — {pos, target, up, fov (degrees),
     mode:'persp'|'ortho', zoom, near} — and every field is optional. These
     defaults frame the origin the way the 2D canvas already does. W is taken
     for symmetry: the pixel scale comes from H alone, on purpose. */
  camMats: (cam, W, H) => {
    const c = cam && typeof cam === 'object' ? cam : {};
    const p3 = (v, dx, dy, dz) => (v && typeof v === 'object' && v.x !== undefined)
      ? { x: +v.x || 0, y: +v.y || 0, z: +v.z || 0 } : { x: dx, y: dy, z: dz };
    const persp = c.mode !== 'ortho';
    const fov = (c.fov === undefined ? 45 : c.fov) * Math.PI / 180;
    return {
      view: LM.mat4LookAt(p3(c.pos, 0, 0, -420), p3(c.target, 0, 0, 0), p3(c.up, 0, -1, 0)),
      proj: persp ? LM.mat4Persp(fov, H || 600) : LM.mat4Ortho(Math.abs(c.zoom === undefined ? 1 : c.zoom) || 1),
      eye: p3(c.pos, 0, 0, -420), persp: persp,
      near: c.near === undefined ? 1 : Math.max(1e-3, c.near)
    };
  },

  /* world point → {x, y} in screen px (centred origin, y down) plus z = the
     view depth, bigger being farther. Hand in mats from LM.camMats to project a
     whole list against one camera — same optional-table trick as curvePoint.
     No near-plane culling here: a point behind the camera comes back with a
     negative depth and a mirrored x/y. LM.render3 is what drops those. */
  project3: (p, cam, W, H, mats) => {
    const M = mats || LM.camMats(cam, W, H);
    const v = LM.mat4Apply(M.view, p);
    const s = LM.mat4Apply(M.proj, v);
    return { x: s.x, y: s.y, z: -v.z };
  },

  /* Newell's normal: right for non-planar faces and any vertex count, and it
     degrades to facing the default camera rather than to zero */
  faceNormal3: pts => {
    const n = pts.length;
    let nx = 0, ny = 0, nz = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n], az = a.z || 0, bz = b.z || 0;
      nx += (a.y - b.y) * (az + bz);
      ny += (az - bz) * (a.x + b.x);
      nz += (a.x - b.x) * (a.y + b.y);
    }
    const L = Math.hypot(nx, ny, nz);
    return L < 1e-12 ? { x: 0, y: 0, z: -1 } : { x: nx / L, y: ny / L, z: nz / L };
  },

  meshNormal: (mesh, fi) => {
    const vs = (mesh && mesh.vs) || [], pts = [];
    for (const i of ((mesh && mesh.fs) || [])[fi] || []) if (vs[i]) pts.push(vs[i]);
    return LM.faceNormal3(pts);
  },

  /* mesh → one record per face: its 3D points, unit normal and centroid */
  meshFaces: mesh => {
    const vs = (mesh && mesh.vs) || [], out = [];
    for (const f of (mesh && mesh.fs) || []) {
      const pts = [];
      for (const i of f) if (vs[i]) pts.push({ x: vs[i].x, y: vs[i].y, z: vs[i].z || 0 });
      if (pts.length < 3) continue;
      let cx = 0, cy = 0, cz = 0;
      for (const p of pts) { cx += p.x; cy += p.y; cz += p.z; }
      out.push({
        pts3: pts, normal: LM.faceNormal3(pts),
        centroid: { x: cx / pts.length, y: cy / pts.length, z: cz / pts.length }
      });
    }
    return out;
  },

  /* transform any geometry by a mat4. 2D kinds are lifted to z = 0 and come
     back as poly3 — which is what lets Rotate3 act straight on a Circle. */
  xform3: (g, m) => {
    if (!g || typeof g !== 'object') return g;
    const ap = p => LM.mat4Apply(m, p);
    if (g.kind === undefined && g.x !== undefined) return ap(g);
    if (g.kind === 'mesh') return { kind: 'mesh', vs: (g.vs || []).map(ap), fs: (g.fs || []).map(f => f.slice()) };
    if (g.kind === 'poly3') return { kind: 'poly3', pts: (g.pts || []).map(ap), closed: !!g.closed };
    if (g.kind === 'text') return g;   /* text has no 3D reading — pass it through */
    const P = LM.toPoly(g, 96);
    return { kind: 'poly3', pts: P.pts.map(ap), closed: P.closed };
  },

  /* geometry → flat 3D primitives ready to project:
   *   {pts:[{x,y,z}], closed, face, normal}
   * A mesh contributes one primitive per face; a closed loop (2D or poly3)
   * counts as a face too, so it gets a normal and a shade; 2D kinds are lifted
   * to z = 0; a bare point stays a single point; text has no 3D reading. */
  prims3: g => {
    if (!g || typeof g !== 'object') return [];
    if (g.kind === undefined && g.x !== undefined)
      return [{ pts: [{ x: g.x, y: g.y, z: g.z || 0 }], closed: false, face: false, normal: null }];
    if (g.kind === 'mesh') {
      const vs = g.vs || [], out = [];
      for (const f of g.fs || []) {
        const pts = [];
        for (const i of f) if (vs[i]) pts.push({ x: vs[i].x, y: vs[i].y, z: vs[i].z || 0 });
        if (pts.length < 3) continue;
        out.push({ pts: pts, closed: true, face: true, normal: LM.faceNormal3(pts) });
      }
      return out;
    }
    if (g.kind === 'text') return [];
    let pts, closed;
    if (g.kind === 'poly3') {
      pts = (g.pts || []).map(p => ({ x: p.x, y: p.y, z: p.z || 0 }));
      closed = !!g.closed;
    } else {
      const P = LM.toPoly(g, 96);
      pts = P.pts.map(p => ({ x: p.x, y: p.y, z: 0 }));
      closed = P.closed;
    }
    if (!pts.length) return [];
    if (pts.length === 1) return [{ pts: pts, closed: false, face: false, normal: null }];
    const face = closed && pts.length >= 3;
    return [{ pts: pts, closed: closed, face: face, normal: face ? LM.faceNormal3(pts) : null }];
  },

  /* vertex identity for edge dedup — 1/64 px, tight enough to keep distinct
     vertices apart and loose enough to fuse the shared edges of two faces */
  v3key: p => Math.round(p.x * 64) + ',' + Math.round(p.y * 64) + ',' + Math.round((p.z || 0) * 64),

  /* the software renderer, in one place: a geometry LIST plus a camera → three
   * index-aligned lists — screen geometry, shade 0..1, view depth — sorted back
   * to front, so drawList insertion order IS the painter's algorithm.
   *   mode  'shaded' faces only · 'wire' every unique edge · 'both' faces with
   *         the front-facing edges laid over them
   *   L     the direction the light comes FROM
   * Shading is two-sided: the normal is turned toward the camera first, so open
   * surfaces and reversed windings light like a solid's front faces instead of
   * going black. Any primitive with a vertex at or behind the near plane is
   * dropped rather than clipped — Weft paints, it does not rasterize. */
  render3: (gs, cam, L, mode, W, H) => {
    const M = LM.camMats(cam, W, H);
    const lit = LM.v3unit(L && (L.x || L.y || L.z) ? L : { x: -0.4, y: -0.8, z: -0.5 });
    const wantFaces = mode !== 'wire', wantWire = mode === 'wire' || mode === 'both';
    const main = [], wires = [], seen = {};
    for (const g of gs || []) for (const pr of LM.prims3(g)) {
      const S = [], dep = [];
      let ok = true, dsum = 0, cx = 0, cy = 0, cz = 0;
      for (const p of pr.pts) {
        const v = LM.mat4Apply(M.view, p);
        if (-v.z <= M.near) { ok = false; break; }
        const q = LM.mat4Apply(M.proj, v);
        S.push({ x: q.x, y: q.y }); dep.push(-v.z); dsum += -v.z;
        cx += p.x; cy += p.y; cz += p.z || 0;
      }
      if (!ok || !S.length) continue;
      const n = S.length, d = dsum / n;
      if (n === 1) { main.push({ g: S[0], d: d, s: 1 }); continue; }
      /* an open curve or a point has no facing and no shade — it comes through
         lit (S = 1), so a colour wired from S doesn't silently blacken it */
      if (!pr.face) { main.push({ g: { kind: 'poly', pts: S, closed: !!pr.closed }, d: d, s: 1 }); continue; }
      /* face against the eye, measured from its centroid — a vertex would
         misjudge which way a big quad faces */
      const front = LM.v3dot(pr.normal, LM.v3sub(M.eye, { x: cx / n, y: cy / n, z: cz / n })) >= 0;
      const sh = LM.clamp(LM.v3dot(front ? pr.normal : LM.v3mul(pr.normal, -1), lit), 0, 1);
      if (wantFaces) main.push({ g: { kind: 'poly', pts: S, closed: true }, d: d, s: sh });
      /* wire alone shows every edge (a see-through frame); over faces only the
         front ones, which is hidden-line removal for the price of a dot product */
      if (wantWire && (front || !wantFaces)) for (let i = 0; i < S.length; i++) {
        const j = (i + 1) % S.length;
        const ka = LM.v3key(pr.pts[i]), kb = LM.v3key(pr.pts[j]);
        const k = ka < kb ? ka + '|' + kb : kb + '|' + ka;
        if (seen[k]) continue;
        seen[k] = 1;
        wires.push({ g: { kind: 'line', a: S[i], b: S[j] }, d: (dep[i] + dep[j]) / 2, s: sh });
      }
    }
    main.sort((p, q) => q.d - p.d);
    wires.sort((p, q) => q.d - p.d);
    const F = [], Sh = [], D = [];
    for (const r of main.concat(wires)) { F.push(r.g); Sh.push(r.s); D.push(r.d); }
    return { F: F, S: Sh, D: D };
  },

  /* ---------- canvas rendering ---------- */
  pathGeom: (g2, g) => {
    switch (g.kind) {
      case 'circle': g2.arc(g.cx, g.cy, Math.max(0, g.r), 0, LM.TAU); break;
      case 'ellipse': g2.ellipse(g.cx, g.cy, Math.max(0, g.rx), Math.max(0, g.ry), g.rot || 0, 0, LM.TAU); break;
      case 'line': g2.moveTo(g.a.x, g.a.y); g2.lineTo(g.b.x, g.b.y); break;
      /* sweep the short way round when a1 < a0, matching how toPoly lerps the
         angle — otherwise a reversed arc renders differently from how it
         hit-tests, bounds and offsets */
      case 'arc': g2.arc(g.cx, g.cy, Math.max(0, g.r), g.a0, g.a1, g.a1 < g.a0); break;
      /* an unprojected mesh reads as its front elevation: one subpath per face,
         z ignored. Wire it through d3/project for a camera, shading and depth. */
      case 'mesh': {
        const vs = g.vs || [];
        for (const f of g.fs || []) {
          let first = true;
          for (const i of f) {
            const v = vs[i];
            if (!v) continue;
            if (first) { g2.moveTo(v.x, v.y); first = false; } else g2.lineTo(v.x, v.y);
          }
          if (!first) g2.closePath();
        }
        break;
      }
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

  /* geometry → axis-aligned bounds {x, y, w, h} (top-left, centered coords).
   * Text uses the same width estimate as pointInGeom. Null for empty geometry. */
  geomBounds: g => {
    if (!g) return null;
    if (g.kind === 'text') {
      const s = g.size || 24, w = String(g.text === undefined ? '' : g.text).length * s * 0.6;
      return { x: (g.x || 0) - w / 2, y: (g.y || 0) - s * 0.7, w, h: s * 1.4 };
    }
    const pts = LM.toPoly(g, 48).pts;
    if (!pts.length) return null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of pts) {
      if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x;
      if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y;
    }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  },

  /* ---------- the dataflow evaluator ----------
   * Every port value is a LIST. Longest-list matching (Grasshopper style):
   * the node's compute runs once per index, shorter lists repeat their last
   * item. Inputs named in def.listInputs receive the whole list instead.
   * If compute returns an array for an output it is spread flat into the list.
   * An input may receive MULTIPLE wires — their lists concatenate in wire order.
   * A node with enabled === false is bypassed: each output passes through the
   * first same-type input (or the first input) untouched.
   *
   * def.dynamic — ports live on the NODE (node.values.ins / node.values.outs)
   * instead of the def, and every input receives the whole list (clusters).
   *
   * def.feedback — the node contributes NO edges to the topological sort, so
   * wiring through it makes a cycle legal (Delay). It evaluates before its
   * sources; after the frame the engine resolves its inputs and stores them on
   * node._fbIns, so next frame its compute reads last frame's values there.
   */
  evaluateGraph: (graph, defs, ctx) => {
    ctx.drawList = ctx.drawList || [];
    ctx.domList = ctx.domList || [];
    ctx.audioList = ctx.audioList || [];
    ctx.audioState = ctx.audioState || {};
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

    const insOf = n => {
      const d = defs[n.type];
      if (!d) return [];
      return (d.dynamic && n.values && n.values.ins) || d.inputs || [];
    };
    const outsOf = n => {
      const d = defs[n.type];
      if (!d) return [];
      return (d.dynamic && n.values && n.values.outs) || d.outputs || [];
    };
    const isListIn = (n, name) => {
      const d = defs[n.type];
      if (!d) return false;
      if (d.dynamic) return true;
      return (d.listInputs || []).indexOf(name) >= 0;
    };
    const resolveList = (n, inp) => {
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
      return list.map(v => LM.coerce(v, inp.type));
    };

    const order = [], mark = {};
    const visit = n => {
      if (mark[n.id] === 2) return;
      if (mark[n.id] === 1) { ctx.errors[n.id] = 'cycle detected'; return; }
      mark[n.id] = 1;
      const def = defs[n.type];
      if (def && !def.feedback) for (const inp of insOf(n)) {
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
        for (const inp of insOf(n)) resolved[inp.name] = resolveList(n, inp);
        if (n.enabled === false) {
          const outs = {};
          const ins = insOf(n);
          for (const o of outsOf(n)) {
            const m = ins.find(i => i.type === o.type) || ins[0];
            outs[o.name] = m ? resolved[m.name] : [];
          }
          ctx.out[n.id] = outs;
          n._last = { ins: resolved, outs };
          continue;
        }
        const outs = {};
        for (const o of outsOf(n)) outs[o.name] = [];
        let iter = 1;
        for (const inp of insOf(n)) {
          if (!isListIn(n, inp.name)) iter = Math.max(iter, resolved[inp.name].length);
        }
        if (iter > 100000) iter = 100000;
        for (let i = 0; i < iter; i++) {
          const args = {};
          for (const inp of insOf(n)) {
            const L = resolved[inp.name];
            args[inp.name] = isListIn(n, inp.name) ? L : (L.length ? L[Math.min(i, L.length - 1)] : undefined);
          }
          ctx.i = i; // list-match index — state nodes key node._state by it
          const r = def.compute(args, ctx, n) || {};
          for (const o of outsOf(n)) {
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

    // feedback nodes capture this frame's (now fully evaluated) inputs for next frame
    for (const n of order) {
      const def = defs[n.type];
      if (!def || !def.feedback || n.enabled === false) continue;
      const fb = {};
      for (const inp of insOf(n)) fb[inp.name] = resolveList(n, inp);
      n._fbIns = fb;
    }
  }
};
