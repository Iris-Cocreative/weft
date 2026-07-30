'use strict';
/*
 * Weft 3D pack — the first node pack (ROADMAP §"node packs"): a separate file
 * calling defNode into the same registry, so the exporter (which bundles only
 * the defs a graph uses) and the editor needed no changes at all.
 *
 * The one design decision everything else falls out of: PROJECTION IS AN
 * ORDINARY NODE. d3/project takes 3D geometry and a camera and emits ordinary
 * 2D geometry, so there is no ambient camera on ctx, no second renderer, and no
 * new invariant — the editor and an exported bundle render identically by
 * construction, because all the work happens in LM.* and compute().
 *
 * World axes extend the canvas: x right, y DOWN, z away from the viewer. A 2D
 * shape lifted to z = 0 therefore projects upright, and the default camera sits
 * in front of it at negative z. Angles are radians, except a camera's field of
 * view, which is degrees. See the 3D section of js/engine.js for the matrix and
 * renderer layer, and docs/NODE-SPEC.md for the kinds and types.
 *
 * Same rules as js/nodes.js: compute() is a pure arrow using only
 * (args, ctx, node) and LM.*, because it gets serialized into exports.
 * buildBody is editor-only and never exported.
 */

/* ============================== CONSTRUCT ============================== */

defNode('d3/point3', {
  title: 'Point3', cat: '3D', desc: 'A 3D point from X, Y and Z — y is down and z runs away from the viewer, matching the canvas',
  inputs: [
    { name: 'X', type: 'number', default: 0 },
    { name: 'Y', type: 'number', default: 0 },
    { name: 'Z', type: 'number', default: 0 }],
  outputs: [{ name: 'P', type: 'point3' }],
  compute: a => ({ P: { x: a.X, y: a.Y, z: a.Z } })
});

defNode('d3/decon3', {
  title: 'Deconstruct3', cat: '3D', desc: 'Split a 3D point into X, Y and Z',
  inputs: [{ name: 'P', type: 'point3', default: { x: 0, y: 0, z: 0 } }],
  outputs: [{ name: 'X', type: 'number' }, { name: 'Y', type: 'number' }, { name: 'Z', type: 'number' }],
  compute: a => ({ X: a.P.x, Y: a.P.y, Z: a.P.z })
});

defNode('d3/polyline3', {
  title: 'PolyLine3', cat: '3D', desc: 'Straight segments through 3D points V — closed, it also counts as a face and takes a shade',
  inputs: [{ name: 'V', type: 'point3', label: 'vertices' }, { name: 'C', type: 'bool', default: false, label: 'closed' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  listInputs: ['V'],
  compute: a => ({ G: { kind: 'poly3', pts: (a.V || []).filter(p => p && p.x !== undefined), closed: !!a.C } })
});

defNode('d3/grid3', {
  title: 'Grid3', cat: '3D', width: 160,
  desc: 'A 3D point lattice, with the cell indices I, J and K beside it — the 3D sibling of Grid, and the same trick: the indices are what you drive everything else with',
  inputs: [
    { name: 'P', type: 'point3', default: { x: 0, y: 0, z: 0 }, label: 'centre' },
    { name: 'S', type: 'number', default: 60, label: 'spacing' },
    { name: 'NX', type: 'number', default: 4, label: 'count along x' },
    { name: 'NY', type: 'number', default: 4, label: 'count along y' },
    { name: 'NZ', type: 'number', default: 4, label: 'count along z' }],
  outputs: [
    { name: 'P', type: 'point3' },
    { name: 'I', type: 'number', label: 'x index' },
    { name: 'J', type: 'number', label: 'y index' },
    { name: 'K', type: 'number', label: 'z index' }],
  compute: a => {
    const s = Math.abs(a.S) || 1;
    const nx = LM.clamp(Math.floor(a.NX), 1, 64), ny = LM.clamp(Math.floor(a.NY), 1, 64), nz = LM.clamp(Math.floor(a.NZ), 1, 64);
    const x0 = a.P.x - (nx - 1) * s / 2, y0 = a.P.y - (ny - 1) * s / 2, z0 = a.P.z - (nz - 1) * s / 2;
    const P = [], I = [], J = [], K = [];
    for (let k = 0; k < nz && P.length < 20000; k++)
      for (let j = 0; j < ny && P.length < 20000; j++)
        for (let i = 0; i < nx && P.length < 20000; i++) {
          P.push({ x: x0 + i * s, y: y0 + j * s, z: z0 + k * s });
          I.push(i); J.push(j); K.push(k);
        }
    return { P: P, I: I, J: J, K: K };
  }
});

/* ============================== CAMERA ============================== */

defNode('d3/camera', {
  title: 'Camera', cat: '3D', width: 176,
  desc: 'A camera looking from P at T. Field of view is in degrees (a lens, not a rotation); zoom is px per unit and only bites in orthographic mode',
  inputs: [
    { name: 'P', type: 'point3', default: { x: 220, y: -180, z: -380 }, label: 'position' },
    { name: 'T', type: 'point3', default: { x: 0, y: 0, z: 0 }, label: 'target' },
    { name: 'F', type: 'number', default: 45, label: 'field of view (degrees)' },
    { name: 'Z', type: 'number', default: 1, label: 'zoom (orthographic only)' },
    { name: 'U', type: 'point3', default: { x: 0, y: -1, z: 0 }, label: 'up — screen up is −y' }],
  outputs: [{ name: 'C', type: 'camera' }],
  defaults: { mode: 'persp' },
  compute: (a, ctx, node) => ({
    C: {
      pos: a.P, target: a.T, up: a.U, fov: a.F,
      mode: node.values.mode === 'ortho' ? 'ortho' : 'persp', zoom: a.Z
    }
  }),
  buildBody: (node, body, changed) =>
    _modeSeg(node, body, changed, 'mode', [
      ['perspective', 'persp', 'distance shrinks things — the field of view sets how much'],
      ['orthographic', 'ortho', 'no foreshortening: parallel stays parallel, zoom sets the scale']], 'persp')
});

defNode('d3/orbit', {
  title: 'Orbit Camera', cat: '3D', width: 176,
  desc: 'A camera you steer: drag the cloth to orbit T, wheel to pull in and out. A and E are the resting angles the drag adds to, and they come back out so other things can follow the view',
  inputs: [
    { name: 'T', type: 'point3', default: { x: 0, y: 0, z: 0 }, label: 'target' },
    { name: 'D', type: 'number', default: 460, label: 'distance' },
    { name: 'A', type: 'number', default: 0.6, label: 'yaw at rest (rad)' },
    { name: 'E', type: 'number', default: 0.45, label: 'pitch at rest (rad)' },
    { name: 'F', type: 'number', default: 45, label: 'field of view (degrees)' }],
  outputs: [
    { name: 'C', type: 'camera' },
    { name: 'A', type: 'number', label: 'yaw now' },
    { name: 'E', type: 'number', label: 'pitch now' }],
  compute: (a, ctx, node) => {
    /* cross-frame memory on node._state keyed by ctx.i, like every state node —
       so a list of targets orbits independently, and a graph load resets it */
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { yaw: 0, pit: 0, zoom: 1, mx: 0, my: 0, sy: null, drag: false };
    const m = ctx.mouse || {};
    if (m.pressed) { s.drag = true; s.mx = m.x; s.my = m.y; }
    if (!m.down) s.drag = false;
    if (s.drag) {
      /* the surface follows the cursor: drag right and the far side swings round,
         drag down and the top tips toward you */
      s.yaw -= (m.x - s.mx) * 0.006;
      s.pit = LM.clamp(s.pit + (m.y - s.my) * 0.006, -1.45, 1.45);
      s.mx = m.x; s.my = m.y;
    }
    /* the wheel arrives as the host's simulated page scroll (ctx.scroll), so
       this needs no new ctx channel: scrolling down pushes the camera back */
    const sc = ctx.scroll || {};
    const sy = sc.y || 0;
    if (s.sy === null) s.sy = sy;
    s.zoom = LM.clamp(s.zoom * Math.exp((sy - s.sy) * 0.0012), 0.25, 6);
    s.sy = sy;
    const yaw = a.A + s.yaw, pit = LM.clamp(a.E + s.pit, -1.5, 1.5);
    const dist = Math.max(1, Math.abs(a.D) * s.zoom), cp = Math.cos(pit);
    return {
      C: {
        pos: {
          x: a.T.x + Math.sin(yaw) * cp * dist,
          y: a.T.y - Math.sin(pit) * dist,
          z: a.T.z - Math.cos(yaw) * cp * dist
        },
        target: a.T, up: { x: 0, y: -1, z: 0 }, fov: a.F, mode: 'persp'
      },
      A: yaw, E: pit
    };
  }
});

/* ============================== PROJECT ============================== */

defNode('d3/project', {
  title: 'Project', cat: '3D', width: 184,
  desc: 'Camera → flat geometry. F is screen-space 2D polys already sorted back to front, S the shade 0..1 per face (open curves and points come through at 1), D the view depth — three parallel lists, so wire S through a colour node and ONE Draw paints the whole shaded solid. Takes the geometry as a whole list on purpose: that is what makes the depth sort global instead of per-mesh',
  inputs: [
    { name: 'G', type: 'geometry', label: 'geometry (whole list)' },
    { name: 'C', type: 'camera' },
    { name: 'L', type: 'point3', default: { x: -0.4, y: -0.8, z: -0.5 }, label: 'direction the light comes from' }],
  outputs: [
    { name: 'F', type: 'geometry', label: 'screen faces, back to front' },
    { name: 'S', type: 'number', label: 'shade 0..1' },
    { name: 'D', type: 'number', label: 'view depth' }],
  listInputs: ['G'],
  defaults: { mode: 'shaded' },
  compute: (a, ctx, node) =>
    LM.render3((a.G || []).filter(g => g), a.C, a.L, node.values.mode || 'shaded', ctx.W, ctx.H),
  buildBody: (node, body, changed) =>
    _modeSeg(node, body, changed, 'mode', [
      ['shaded', 'shaded', 'one filled face per polygon, painted back to front'],
      ['wire', 'wire', 'every unique edge once — a see-through frame'],
      ['both', 'both', 'faces with their front-facing edges laid over them']], 'shaded')
});

/* ============================== PRIMITIVES ============================== */

defNode('d3/box', {
  title: 'Box', cat: '3D', desc: 'A box centred at P, W wide, H tall, D deep',
  inputs: [
    { name: 'P', type: 'point3', default: { x: 0, y: 0, z: 0 }, label: 'centre' },
    { name: 'W', type: 'number', default: 140 },
    { name: 'H', type: 'number', default: 140 },
    { name: 'D', type: 'number', default: 140 }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => {
    const c = a.P, w = Math.abs(a.W) / 2, h = Math.abs(a.H) / 2, d = Math.abs(a.D) / 2;
    return { G: {
      kind: 'mesh',
      vs: [
        { x: c.x - w, y: c.y - h, z: c.z - d }, { x: c.x + w, y: c.y - h, z: c.z - d },
        { x: c.x + w, y: c.y + h, z: c.z - d }, { x: c.x - w, y: c.y + h, z: c.z - d },
        { x: c.x - w, y: c.y - h, z: c.z + d }, { x: c.x + w, y: c.y - h, z: c.z + d },
        { x: c.x + w, y: c.y + h, z: c.z + d }, { x: c.x - w, y: c.y + h, z: c.z + d }],
      /* wound so every normal points out — front, back, top, bottom, right, left */
      fs: [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 4, 7, 3]]
    } };
  }
});

defNode('d3/sphere', {
  title: 'Sphere', cat: '3D', desc: 'A UV sphere at P: U segments round, V rings from pole to pole (the poles are along y, so it stands up on screen)',
  inputs: [
    { name: 'P', type: 'point3', default: { x: 0, y: 0, z: 0 }, label: 'centre' },
    { name: 'R', type: 'number', default: 90, label: 'radius' },
    { name: 'U', type: 'number', default: 18, label: 'segments round' },
    { name: 'V', type: 'number', default: 12, label: 'rings' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => {
    const c = a.P, R = Math.abs(a.R);
    const u = LM.clamp(Math.floor(a.U), 3, 128), v = LM.clamp(Math.floor(a.V), 2, 64);
    const vs = [], fs = [];
    /* the pole rings are full rings of coincident vertices: the top and bottom
       quads collapse to triangles on their own, and the indexing stays uniform */
    for (let j = 0; j <= v; j++) {
      const phi = j / v * Math.PI, yy = -Math.cos(phi) * R, rr = Math.sin(phi) * R;
      for (let i = 0; i < u; i++) {
        const th = i / u * LM.TAU;
        vs.push({ x: c.x + Math.cos(th) * rr, y: c.y + yy, z: c.z + Math.sin(th) * rr });
      }
    }
    for (let j = 0; j < v; j++) for (let i = 0; i < u; i++) {
      const i2 = (i + 1) % u, r0 = j * u, r1 = (j + 1) * u;
      fs.push([r0 + i, r1 + i, r1 + i2, r0 + i2]);
    }
    return { G: { kind: 'mesh', vs: vs, fs: fs } };
  }
});

defNode('d3/cylinder', {
  title: 'Cylinder', cat: '3D', desc: 'An N-sided cylinder at P, standing along y (H tall). Caps included — turn them off for a tube',
  inputs: [
    { name: 'P', type: 'point3', default: { x: 0, y: 0, z: 0 }, label: 'centre' },
    { name: 'R', type: 'number', default: 70, label: 'radius' },
    { name: 'H', type: 'number', default: 160, label: 'height (along y)' },
    { name: 'N', type: 'number', default: 20, label: 'sides' },
    { name: 'C', type: 'bool', default: true, label: 'caps' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => {
    const c = a.P, R = Math.abs(a.R), h = Math.abs(a.H) / 2;
    const n = LM.clamp(Math.floor(a.N), 3, 256);
    const vs = [], fs = [];
    for (let j = 0; j < 2; j++) for (let i = 0; i < n; i++) {
      const th = i / n * LM.TAU;
      vs.push({ x: c.x + Math.cos(th) * R, y: c.y + (j ? h : -h), z: c.z + Math.sin(th) * R });
    }
    for (let i = 0; i < n; i++) { const i2 = (i + 1) % n; fs.push([i, n + i, n + i2, i2]); }
    if (a.C) {
      const top = [], bot = [];
      for (let i = 0; i < n; i++) { top.push(i); bot.push(n + (n - 1 - i)); }
      fs.push(top); fs.push(bot);   /* the bottom runs backwards so it faces down */
    }
    return { G: { kind: 'mesh', vs: vs, fs: fs } };
  }
});

defNode('d3/cone', {
  title: 'Cone', cat: '3D', desc: 'An N-sided cone at P, apex up along −y, base radius R',
  inputs: [
    { name: 'P', type: 'point3', default: { x: 0, y: 0, z: 0 }, label: 'centre' },
    { name: 'R', type: 'number', default: 80, label: 'base radius' },
    { name: 'H', type: 'number', default: 170, label: 'height (along y)' },
    { name: 'N', type: 'number', default: 20, label: 'sides' },
    { name: 'C', type: 'bool', default: true, label: 'base cap' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => {
    const c = a.P, R = Math.abs(a.R), h = Math.abs(a.H) / 2;
    const n = LM.clamp(Math.floor(a.N), 3, 256);
    const vs = [], fs = [];
    for (let i = 0; i < n; i++) {
      const th = i / n * LM.TAU;
      vs.push({ x: c.x + Math.cos(th) * R, y: c.y + h, z: c.z + Math.sin(th) * R });
    }
    vs.push({ x: c.x, y: c.y - h, z: c.z });   /* the apex */
    for (let i = 0; i < n; i++) fs.push([n, i, (i + 1) % n]);
    if (a.C) { const base = []; for (let i = 0; i < n; i++) base.push(n - 1 - i); fs.push(base); }
    return { G: { kind: 'mesh', vs: vs, fs: fs } };
  }
});

defNode('d3/torus', {
  title: 'Torus', cat: '3D', desc: 'A torus at P lying in the xz plane (the hole runs along y): R1 to the middle of the tube, R2 the tube itself',
  inputs: [
    { name: 'P', type: 'point3', default: { x: 0, y: 0, z: 0 }, label: 'centre' },
    { name: 'R1', type: 'number', default: 100, label: 'ring radius' },
    { name: 'R2', type: 'number', default: 34, label: 'tube radius' },
    { name: 'N', type: 'number', default: 28, label: 'segments round the ring' },
    { name: 'M', type: 'number', default: 12, label: 'segments round the tube' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => {
    const c = a.P, R1 = Math.abs(a.R1), R2 = Math.abs(a.R2);
    const n = LM.clamp(Math.floor(a.N), 3, 256), m = LM.clamp(Math.floor(a.M), 3, 128);
    const vs = [], fs = [];
    for (let j = 0; j < m; j++) {
      const b = j / m * LM.TAU, rr = R1 + Math.cos(b) * R2, yy = Math.sin(b) * R2;
      for (let i = 0; i < n; i++) {
        const th = i / n * LM.TAU;
        vs.push({ x: c.x + Math.cos(th) * rr, y: c.y + yy, z: c.z + Math.sin(th) * rr });
      }
    }
    /* same winding pattern as the sphere: tube ring j, then j+1, then back */
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
      const i2 = (i + 1) % n, r0 = j * n, r1 = ((j + 1) % m) * n;
      fs.push([r0 + i, r1 + i, r1 + i2, r0 + i2]);
    }
    return { G: { kind: 'mesh', vs: vs, fs: fs } };
  }
});

defNode('d3/plane', {
  title: 'Plane', cat: '3D', desc: 'A flat W×D grid in the xz plane at P — the ground under everything. N cells a side, so each one can take its own shade. (For a wall in the canvas plane, a 2D Rectangle already projects as a face.)',
  inputs: [
    { name: 'P', type: 'point3', default: { x: 0, y: 110, z: 0 }, label: 'centre' },
    { name: 'W', type: 'number', default: 420, label: 'width (x)' },
    { name: 'D', type: 'number', default: 420, label: 'depth (z)' },
    { name: 'N', type: 'number', default: 6, label: 'cells a side' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => {
    const c = a.P, W = Math.abs(a.W), D = Math.abs(a.D);
    const n = LM.clamp(Math.floor(a.N), 1, 64);
    const vs = [], fs = [];
    for (let k = 0; k <= n; k++) for (let i = 0; i <= n; i++)
      vs.push({ x: c.x - W / 2 + W * i / n, y: c.y, z: c.z - D / 2 + D * k / n });
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) {
      const r0 = k * (n + 1), r1 = (k + 1) * (n + 1);
      fs.push([r0 + i, r0 + i + 1, r1 + i + 1, r1 + i]);   /* normal points up (−y) */
    }
    return { G: { kind: 'mesh', vs: vs, fs: fs } };
  }
});

/* ================= BRIDGES FROM 2D — the valuable ones ================= */

defNode('d3/extrude', {
  title: 'Extrude', cat: '3D',
  desc: 'Push any 2D geometry out along z into a mesh, centred on its own plane so it stays put. Closed curves get caps, open ones become ribbons — which makes every curve node in the library a 3D modelling tool',
  inputs: [
    { name: 'G', type: 'geometry', label: '2D profile' },
    { name: 'H', type: 'number', default: 120, label: 'height (along z)' },
    { name: 'C', type: 'bool', default: true, label: 'cap the ends' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => {
    if (a.G === undefined || a.G === null) return {};
    const P = LM.toPoly(a.G, 72);
    const n = P.pts.length;
    if (n < 2) return {};
    const h = a.H / 2, vs = [], fs = [];
    for (const p of P.pts) vs.push({ x: p.x, y: p.y, z: -h });
    for (const p of P.pts) vs.push({ x: p.x, y: p.y, z: h });
    const m = P.closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const j = (i + 1) % n;
      fs.push([i, j, j + n, i + n]);
    }
    if (P.closed && a.C && n >= 3) {
      const front = [], back = [];
      for (let i = 0; i < n; i++) { front.push(n - 1 - i); back.push(n + i); }
      fs.push(front); fs.push(back);
    }
    return { G: { kind: 'mesh', vs: vs, fs: fs } };
  }
});

defNode('d3/revolve', {
  title: 'Revolve', cat: '3D',
  desc: 'Spin a 2D profile about the world y axis into a mesh of revolution — the profile’s x is the radius, so keep it to one side of the axis. A < 360° leaves it open like a peeled fruit',
  inputs: [
    { name: 'G', type: 'geometry', label: '2D profile' },
    { name: 'N', type: 'number', default: 24, label: 'segments' },
    { name: 'A', type: 'number', default: 6.283185307179586, label: 'sweep (rad)' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => {
    if (a.G === undefined || a.G === null) return {};
    const P = LM.toPoly(a.G, 64);
    /* a closed profile repeats its first point so the ring closes too */
    const pts = P.closed && P.pts.length ? P.pts.concat([{ x: P.pts[0].x, y: P.pts[0].y }]) : P.pts;
    const n = pts.length;
    if (n < 2) return {};
    const seg = LM.clamp(Math.floor(a.N), 3, 256);
    const sweep = LM.clamp(Math.abs(a.A), 0.01, LM.TAU);
    const full = sweep >= LM.TAU - 1e-6;
    const rings = full ? seg : seg + 1;
    const vs = [], fs = [];
    for (let j = 0; j < rings; j++) {
      const th = j / seg * sweep, co = Math.cos(th), si = Math.sin(th);
      for (const p of pts) vs.push({ x: co * p.x, y: p.y, z: si * p.x });
    }
    for (let j = 0; j < seg; j++) {
      const r0 = j * n, r1 = ((j + 1) % rings) * n;
      for (let i = 0; i < n - 1; i++) fs.push([r0 + i, r1 + i, r1 + i + 1, r0 + i + 1]);
    }
    return { G: { kind: 'mesh', vs: vs, fs: fs } };
  }
});

/* ============================== TRANSFORMS ============================== */

defNode('d3/move3', {
  title: 'Move3', cat: '3D', desc: 'Translate geometry by T in 3D. A 2D shape comes back as a 3D polyline, so this is also how you lift the canvas off z = 0',
  inputs: [{ name: 'G', type: 'geometry' }, { name: 'T', type: 'point3', default: { x: 0, y: 0, z: 0 }, label: 'translation' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => a.G === undefined ? {} : ({ G: LM.xform3(a.G, LM.mat4Move(a.T.x, a.T.y, a.T.z)) })
});

defNode('d3/rotate3', {
  title: 'Rotate3', cat: '3D', desc: 'Rotate geometry by R radians about the axis A through centre C. Default axis is y, so it spins like a turntable',
  inputs: [
    { name: 'G', type: 'geometry' },
    { name: 'R', type: 'number', default: 0, label: 'angle (rad)' },
    { name: 'A', type: 'point3', default: { x: 0, y: 1, z: 0 }, label: 'axis' },
    { name: 'C', type: 'point3', default: { x: 0, y: 0, z: 0 }, label: 'centre' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => a.G === undefined ? {} : ({
    G: LM.xform3(a.G, LM.mat4Mul(LM.mat4Mul(
      LM.mat4Move(-a.C.x, -a.C.y, -a.C.z),
      LM.mat4RotAxis(a.A, a.R)),
      LM.mat4Move(a.C.x, a.C.y, a.C.z)))
  })
});

defNode('d3/scale3', {
  title: 'Scale3', cat: '3D', desc: 'Scale geometry about centre C. Wire a single number into F and it scales uniformly; give it three components and each axis goes its own way',
  inputs: [
    { name: 'G', type: 'geometry' },
    { name: 'F', type: 'point3', default: { x: 1, y: 1, z: 1 }, label: 'factor (a number scales uniformly)' },
    { name: 'C', type: 'point3', default: { x: 0, y: 0, z: 0 }, label: 'centre' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => a.G === undefined ? {} : ({
    G: LM.xform3(a.G, LM.mat4Mul(LM.mat4Mul(
      LM.mat4Move(-a.C.x, -a.C.y, -a.C.z),
      LM.mat4Scale(a.F.x, a.F.y, a.F.z)),
      LM.mat4Move(a.C.x, a.C.y, a.C.z)))
  })
});

/* ============================== ANALYSIS ============================== */

defNode('d3/faces', {
  title: 'Faces', cat: '3D',
  desc: 'Explode a mesh into its faces, with each one’s unit normal and centroid — three parallel lists, for per-face effects that happen before the camera sees them',
  inputs: [{ name: 'G', type: 'geometry', label: 'mesh' }],
  outputs: [
    { name: 'F', type: 'geometry', label: 'face polygons' },
    { name: 'N', type: 'point3', label: 'unit normals' },
    { name: 'C', type: 'point3', label: 'centroids' }],
  compute: a => {
    if (!a.G) return {};
    const F = [], N = [], C = [];
    for (const f of LM.meshFaces(a.G)) {
      F.push({ kind: 'poly3', pts: f.pts3, closed: true });
      N.push(f.normal); C.push(f.centroid);
    }
    return { F: F, N: N, C: C };
  }
});

defNode('d3/dot3', {
  title: 'Dot Product 3D', cat: '3D', desc: 'A · B in 3D — with unit vectors it is the cosine of the angle between them, which is where every shading trick starts',
  inputs: [{ name: 'A', type: 'point3', default: { x: 1, y: 0, z: 0 } }, { name: 'B', type: 'point3', default: { x: 1, y: 0, z: 0 } }],
  outputs: [{ name: 'D', type: 'number' }],
  compute: a => ({ D: LM.v3dot(a.A, a.B) })
});

defNode('d3/cross3', {
  title: 'Cross Product 3D', cat: '3D', desc: 'A × B — the vector perpendicular to both, by the right-hand rule. Unlike the 2D cross this really is a vector',
  inputs: [{ name: 'A', type: 'point3', default: { x: 1, y: 0, z: 0 } }, { name: 'B', type: 'point3', default: { x: 0, y: 1, z: 0 } }],
  outputs: [{ name: 'C', type: 'point3' }],
  compute: a => ({ C: LM.v3cross(a.A, a.B) })
});

defNode('d3/unit3', {
  title: 'Unit Vector 3D', cat: '3D', desc: 'Normalize V to length 1 (a zero vector stays zero)',
  inputs: [{ name: 'V', type: 'point3', default: { x: 1, y: 0, z: 0 } }],
  outputs: [{ name: 'V', type: 'point3' }],
  compute: a => ({ V: LM.v3unit(a.V) })
});

defNode('d3/len3', {
  title: 'Length 3D', cat: '3D', desc: 'Length of V. (A point3 wired straight into a number port already coerces to this — the node is here for when you want to see it.)',
  inputs: [{ name: 'V', type: 'point3', default: { x: 1, y: 0, z: 0 } }],
  outputs: [{ name: 'L', type: 'number' }],
  compute: a => ({ L: LM.v3len(a.V) })
});

defNode('d3/amp3', {
  title: 'Amplitude 3D', cat: '3D', desc: 'Scale V to length A, keeping its direction',
  inputs: [{ name: 'V', type: 'point3', default: { x: 1, y: 0, z: 0 } }, { name: 'A', type: 'number', default: 1, label: 'length' }],
  outputs: [{ name: 'V', type: 'point3' }],
  compute: a => ({ V: LM.v3mul(LM.v3unit(a.V), a.A) })
});

/* ---- palette grouping, same shape as the one in js/nodes.js ---- */
(function () {
  const groups = {
    /* 3D: 1 construct · 2 camera · 3 project · 4 primitives · 5 bridges from 2D
       · 6 transforms · 7 analysis */
    'd3/point3': 1, 'd3/decon3': 1, 'd3/polyline3': 1, 'd3/grid3': 1,
    'd3/camera': 2, 'd3/orbit': 2,
    'd3/project': 3,
    'd3/box': 4, 'd3/sphere': 4, 'd3/cylinder': 4, 'd3/cone': 4, 'd3/torus': 4, 'd3/plane': 4,
    'd3/extrude': 5, 'd3/revolve': 5,
    'd3/move3': 6, 'd3/rotate3': 6, 'd3/scale3': 6,
    'd3/faces': 7, 'd3/dot3': 7, 'd3/cross3': 7, 'd3/unit3': 7, 'd3/len3': 7, 'd3/amp3': 7
  };
  for (const id in groups) if (NODE_DEFS[id]) NODE_DEFS[id].grp = groups[id];
})();
