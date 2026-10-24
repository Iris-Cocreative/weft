'use strict';
/* Weft motifs — reusable pieces of a loom (docs/MEMBERSHIP-PLAN.md §4).
 *
 * A motif is a clipboard fragment with a name and tags: whatever was selected
 * — loose nodes, a cluster, a group frame with its contents, a few Color
 * Swatches, a Text List of hex values. A palette is just a motif made of
 * colors. Dropping one goes through Editor.pasteFragment, the path Ctrl+V
 * takes, so a dropped motif is an independent copy, never a link, and nothing
 * about it is written into the nodes it makes (no marker in `values`, ever).
 *
 * Two halves, neither touches the DOM:
 *  - EXAMPLE_MOTIFS — the read-only set that ships with Weft (the EXAMPLES
 *    idea); smoke pastes, serializes and evaluates every one.
 *  - Motifs — the store. Today it is this browser's localStorage
 *    (weft:motifs); the shell only ever calls list / mine / get / save /
 *    update / remove / onChange, so a cloud sync can slot in behind them.
 *    A stored motif mirrors the planned `motifs` table: { id, title, tags,
 *    body, node_count, created_at, updated_at }.
 */

/* A node entry is [id, type, x, y, values?, flags?] — the _EX shorthand from
 * examples.js. `frame` titles one group round every node, sized from the
 * headless card estimate; the editor refits it round the real cards. */
function _MO(o) {
  const body = {
    weft: 'patch', format: 1,
    nodes: o.nodes.map(a => Object.assign({ id: a[0], type: a[1], x: a[2], y: a[3], values: a[4] || {} }, a[5] || {})),
    wires: (o.wires || []).map(a => ({ from: [a[0], a[1]], to: [a[2], a[3]] }))
  };
  if (o.frame) {
    const f = { id: 'g1', x: 0, y: 0, w: 0, h: 0, title: o.frame, nodes: body.nodes.map(n => n.id) };
    WeftOps.fitGroup(body, f, NODE_DEFS);
    body.groups = [f];
  }
  return { id: o.id, title: o.title, tags: o.tags, blurb: o.blurb, builtin: true, body };
}

/* a palette, twice over: a column of Color Swatches in a titled frame, and
 * the same colors as one Text List (Draw and Background read a hex string as
 * a color, so either form wires straight into a fill) */
function _PALETTE(key, name, hexes, tags) {
  return [
    _MO({
      id: 'ex-' + key + '-swatches', title: name + ' · swatches', tags: ['palette', 'swatches'].concat(tags),
      blurb: hexes.length + ' color swatches in a frame — click one to change it',
      frame: name,
      nodes: hexes.map((h, i) => ['s' + (i + 1), 'params/swatch', 0, i * 76, { hex: h, a: 1 }])
    }),
    _MO({
      id: 'ex-' + key + '-list', title: name + ' · text list', tags: ['palette', 'text list', 'hex'].concat(tags),
      blurb: 'the same ' + hexes.length + ' colors as one Text List of hex values, one per line',
      nodes: [['l', 'params/textlist', 0, 0, { text: hexes.join('\n') }, { label: name }]]
    })
  ];
}

const EXAMPLE_MOTIFS = [

  /* lifted from Rainbow eye: the pointer, eased, held inside a look circle,
   * becomes the one point three transforms share — scale and rotate turn
   * round it, move carries everything by it. Small copies lead, big ones
   * trail: the eye's parallax. */
  _MO({
    id: 'ex-look-point', title: 'look point + three transforms',
    tags: ['motion', 'mouse', 'transform', 'parallax', 'eye', 'rainbow eye'],
    blurb: 'the pointer, eased and held inside a look circle, drives scale, rotate and move of one shape copied per index',
    frame: 'look point + three transforms',
    nodes: [
      ['ms', 'input/mouse', 0, 0],
      ['sp', 'params/slider', 0, 190, { label: 'ease', min: 0, max: 12, value: 4, mode: 'int' }],
      ['lr', 'params/slider', 0, 290, { label: 'look radius', min: 0, max: 400, value: 120, mode: 'int' }],
      ['cn', 'params/slider', 0, 390, { label: 'copies', min: 1, max: 24, value: 10, mode: 'int' }],
      ['sx', 'state/smooth', 230, 0],
      ['sy', 'state/smooth', 230, 100],
      ['pt', 'vec/construct', 460, 20],
      ['lc', 'crv/circle', 460, 160, {}, { label: 'look circle' }],
      ['in', 'crv/incurve', 690, 20],
      ['cl', 'crv/closest', 690, 140],
      ['se', 'sets/select', 920, 40],
      ['lk', 'params/relay', 1150, 70, {}, { label: 'look point' }],
      ['fs', 'sets/series', 460, 330, { S: 1, N: -0.08 }, { label: 'scales' }],
      ['as', 'sets/series', 460, 470, { S: 0, N: 6 }, { label: 'angles °' }],
      ['ar', 'math/rad', 690, 470],
      ['sh', 'crv/polygon', 920, 250, { R: 170, N: 6 }, { label: 'your shape' }],
      ['xs', 'xf/scale', 1150, 250, { mode: 'uniform' }],
      ['xr', 'xf/rotate', 1380, 250],
      ['xm', 'xf/move', 1610, 250],
      ['dr', 'disp/draw', 1840, 250, { S: { r: 94, g: 234, b: 212, a: 0.9 }, W: 1.5 }]
    ],
    wires: [
      ['ms', 'X', 'sx', 'V'], ['ms', 'Y', 'sy', 'V'], ['sp', 'N', 'sx', 'S'], ['sp', 'N', 'sy', 'S'],
      ['sx', 'R', 'pt', 'X'], ['sy', 'R', 'pt', 'Y'], ['lr', 'N', 'lc', 'R'],
      ['lc', 'C', 'in', 'C'], ['pt', 'P', 'in', 'P'], ['lc', 'C', 'cl', 'C'], ['pt', 'P', 'cl', 'P'],
      ['pt', 'P', 'se', 'T'], ['cl', 'P', 'se', 'F'], ['in', 'B', 'se', 'P'], ['se', 'L', 'lk', 'V'],
      ['cn', 'N', 'fs', 'C'], ['cn', 'N', 'as', 'C'], ['as', 'S', 'ar', 'V'],
      ['sh', 'C', 'xs', 'G'], ['fs', 'S', 'xs', 'F'], ['lk', 'V', 'xs', 'C'],
      ['xs', 'G', 'xr', 'G'], ['ar', 'R', 'xr', 'A'], ['lk', 'V', 'xr', 'C'],
      ['xr', 'G', 'xm', 'G'], ['lk', 'V', 'xm', 'T'], ['xm', 'G', 'dr', 'G']
    ]
  }),

  /* lifted from the spectrum-walk patch (the Rainbow eye palette): keyframe
   * sliders for hue, lightness and chroma, a monotone cubic through each, and
   * every sample turned to sRGB in OKLCH — evenly lit colors, any count.
   * The relay is the palette; the strip under it is only there to show it. */
  _MO({
    id: 'ex-oklch-walk', title: 'oklch palette walk',
    tags: ['palette', 'color', 'oklch', 'gradient', 'spectrum', 'rainbow eye'],
    blurb: 'three keyframes each for hue, lightness and chroma, walked smoothly and converted from OKLCH — any number of evenly lit colors',
    frame: 'oklch palette walk',
    nodes: [
      ['count', 'params/slider', 0, 0, { label: 'colors', min: 3, max: 32, value: 12, mode: 'int' }],
      ['kH1', 'params/slider', 0, 110, { label: 'hue 1', min: -330, max: 210, value: 30, mode: 'float', prec: 0 }],
      ['kH2', 'params/slider', 0, 200, { label: 'hue 2', min: -330, max: 210, value: 89, mode: 'float', prec: 0 }],
      ['kH3', 'params/slider', 0, 290, { label: 'hue 3', min: -330, max: 210, value: -206, mode: 'float', prec: 0 }],
      ['kL1', 'params/slider', 0, 400, { label: 'light 1', min: 0, max: 1, value: 0.62, mode: 'float', prec: 2 }],
      ['kL2', 'params/slider', 0, 490, { label: 'light 2', min: 0, max: 1, value: 0.83, mode: 'float', prec: 2 }],
      ['kL3', 'params/slider', 0, 580, { label: 'light 3', min: 0, max: 1, value: 0.48, mode: 'float', prec: 2 }],
      ['kC1', 'params/slider', 0, 690, { label: 'chroma 1', min: 0, max: 0.32, value: 0.23, mode: 'float', prec: 3 }],
      ['kC2', 'params/slider', 0, 780, { label: 'chroma 2', min: 0, max: 0.32, value: 0.15, mode: 'float', prec: 3 }],
      ['kC3', 'params/slider', 0, 870, { label: 'chroma 3', min: 0, max: 0.32, value: 0.12, mode: 'float', prec: 3 }],
      ['nm1', 'math/sub', 260, 0, { B: 1 }],
      ['t', 'sets/range', 490, 0, { A: 0, B: 1 }, { label: 't' }],
      ['walk', 'meta/js', 490, 200, {
        title: 'spectrum walk', mode: 'list',
        ins: [{ name: 'T', type: 'number', default: 0.5 }, { name: 'KH', type: 'number', default: 30 }, { name: 'KL', type: 'number', default: 0.7 }, { name: 'KC', type: 'number', default: 0.13 }],
        outs: [{ name: 'H', type: 'number' }, { name: 'L', type: 'number' }, { name: 'C', type: 'number' }],
        code: "// three keyframe curves as value lists (keys spread evenly over t = 0..1) -> sampled at T (monotone cubic)\nconst sample = (vals, t) => {\n  const k = (vals || []).map((v, i, a) => [a.length > 1 ? i / (a.length - 1) : 0, +v]);\n  const n = k.length;\n  if (!n) return 0;\n  if (n === 1 || t <= k[0][0]) return k[0][1];\n  if (t >= k[n - 1][0]) return k[n - 1][1];\n  const d = [], m = [];\n  for (let i = 0; i < n - 1; i++) d.push((k[i + 1][1] - k[i][1]) / Math.max(1e-6, k[i + 1][0] - k[i][0]));\n  m.push(d[0]);\n  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);\n  m.push(d[n - 2]);\n  let i = 0; while (t > k[i + 1][0]) i++;\n  const t0 = k[i][0], y0 = k[i][1], t1 = k[i + 1][0], y1 = k[i + 1][1];\n  const h = Math.max(1e-6, t1 - t0), s = (t - t0) / h, s2 = s * s, s3 = s2 * s;\n  return (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * h * m[i + 1];\n};\nconst ts = T || [];\nreturn {\n  H: ts.map(t => ((sample(KH, t) % 360) + 360) % 360),\n  L: ts.map(t => sample(KL, t)),\n  C: ts.map(t => sample(KC, t))\n};"
      }],
      ['oklch', 'meta/js', 760, 200, {
        title: 'oklch → rgb', mode: 'each',
        ins: [{ name: 'L', type: 'number', default: 0.7 }, { name: 'C', type: 'number', default: 0.13 }, { name: 'H', type: 'number', default: 30 }],
        outs: [{ name: 'R', type: 'color' }, { name: 'K', type: 'bool' }],
        code: "// OKLCH -> sRGB; chroma pulled in until the color fits the gamut (K = it was clipped)\nconst toRgb = (L, C, H) => {\n  const a = C * Math.cos(H * Math.PI / 180), b = C * Math.sin(H * Math.PI / 180);\n  const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.2914855480 * b;\n  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;\n  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\n    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\n    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s]\n    .map(c => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(c, 0), 1 / 2.4) - 0.055);\n};\nconst fits = rgb => rgb.every(c => c >= -1e-4 && c <= 1 + 1e-4);\nlet rgb = toRgb(L, C, H), lo = 0, hi = C, used = C;\nif (!fits(rgb)) {\n  used = 0; rgb = toRgb(L, 0, H);\n  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2, test = toRgb(L, mid, H); if (fits(test)) { lo = mid; rgb = test; used = mid; } else hi = mid; }\n}\nconst ch = v => Math.round(Math.min(1, Math.max(0, v)) * 255);\nreturn { R: { r: ch(rgb[0]), g: ch(rgb[1]), b: ch(rgb[2]), a: 1 }, K: used !== C };"
      }],
      ['pal', 'params/relay', 1030, 220, {}, { label: 'palette' }],
      ['rx', 'math/remap', 760, 0, { S0: 0, S1: 1, T0: -300, T1: 300 }],
      ['pp', 'vec/construct', 1030, 0],
      ['pc', 'crv/circle', 1260, 0, { R: 22 }],
      ['pd', 'disp/draw', 1260, 160, { S: { r: 0, g: 0, b: 0, a: 0 } }, { label: 'preview strip' }]
    ],
    wires: [
      ['count', 'N', 'nm1', 'A'], ['nm1', 'R', 't', 'N'], ['t', 'R', 'walk', 'T'],
      ['kH1', 'N', 'walk', 'KH'], ['kH2', 'N', 'walk', 'KH'], ['kH3', 'N', 'walk', 'KH'],
      ['kL1', 'N', 'walk', 'KL'], ['kL2', 'N', 'walk', 'KL'], ['kL3', 'N', 'walk', 'KL'],
      ['kC1', 'N', 'walk', 'KC'], ['kC2', 'N', 'walk', 'KC'], ['kC3', 'N', 'walk', 'KC'],
      ['walk', 'L', 'oklch', 'L'], ['walk', 'C', 'oklch', 'C'], ['walk', 'H', 'oklch', 'H'],
      ['oklch', 'R', 'pal', 'V'],
      ['t', 'R', 'rx', 'V'], ['rx', 'R', 'pp', 'X'], ['pp', 'P', 'pc', 'P'],
      ['pc', 'C', 'pd', 'G'], ['pal', 'V', 'pd', 'F']
    ]
  }),

  /* the spring the Living lattice and Figure visualizer use (F 2.4, D 0.35),
   * once per axis: a disc that overshoots after the pointer and settles,
   * with a thread back to where the pointer really is */
  _MO({
    id: 'ex-spring-follow', title: 'spring follow',
    tags: ['motion', 'mouse', 'spring', 'state', 'follow', 'physics'],
    blurb: 'a disc that chases the pointer on two springs, overshoots and settles — frequency and damping on sliders',
    frame: 'spring follow',
    nodes: [
      ['ms', 'input/mouse', 0, 0],
      ['fq', 'params/slider', 0, 190, { label: 'frequency', min: 0.2, max: 8, value: 2.4, mode: 'float', prec: 1 }],
      ['dm', 'params/slider', 0, 290, { label: 'damping', min: 0.05, max: 1, value: 0.35, mode: 'float', prec: 2 }],
      ['kx', 'state/spring', 230, 0],
      ['ky', 'state/spring', 230, 150],
      ['pt', 'vec/construct', 460, 20, {}, { label: 'follower' }],
      ['mp', 'vec/construct', 460, 160, {}, { label: 'pointer' }],
      ['ci', 'crv/circle', 690, 0, { R: 28 }],
      ['ln', 'crv/line', 690, 140],
      ['dr', 'disp/draw', 920, 40, { S: { r: 94, g: 234, b: 212, a: 0.9 }, F: { r: 94, g: 234, b: 212, a: 0.18 }, W: 1.5 }]
    ],
    wires: [
      ['ms', 'X', 'kx', 'V'], ['ms', 'Y', 'ky', 'V'],
      ['fq', 'N', 'kx', 'F'], ['fq', 'N', 'ky', 'F'], ['dm', 'N', 'kx', 'D'], ['dm', 'N', 'ky', 'D'],
      ['kx', 'R', 'pt', 'X'], ['ky', 'R', 'pt', 'Y'], ['ms', 'X', 'mp', 'X'], ['ms', 'Y', 'mp', 'Y'],
      ['pt', 'P', 'ci', 'P'], ['mp', 'P', 'ln', 'A'], ['pt', 'P', 'ln', 'B'],
      ['ci', 'C', 'dr', 'G'], ['ln', 'C', 'dr', 'G']
    ]
  }),

  /* the controls most patches reach for first, labeled and ranged —
   * drop it, wire what you need, delete the rest */
  _MO({
    id: 'ex-slider-bank', title: 'slider bank',
    tags: ['ui', 'params', 'sliders', 'controls'],
    blurb: 'five labeled sliders — count, radius, angle, speed, mix — ready to wire',
    frame: 'controls',
    nodes: [
      ['count', 'params/slider', 0, 0, { label: 'count', min: 0, max: 12, value: 6, mode: 'int' }],
      ['radius', 'params/slider', 0, 90, { label: 'radius', min: 0, max: 400, value: 120, mode: 'int' }],
      ['angle', 'params/slider', 0, 180, { label: 'angle °', min: 0, max: 360, value: 45, mode: 'int' }],
      ['speed', 'params/slider', 0, 270, { label: 'speed', min: 0, max: 4, value: 1, mode: 'float', prec: 2 }],
      ['mix', 'params/slider', 0, 360, { label: 'mix', min: 0, max: 1, value: 0.5, mode: 'float', prec: 2 }]
    ]
  })

].concat(
  _PALETTE('weft-night', 'weft night', ['#0a0d13', '#1e2533', '#2dd4bf', '#818cf8', '#dbe2ee'], ['dark', 'teal', 'weft']),
  _PALETTE('poster-warm', 'poster warm', ['#e9dbc6', '#f5230e', '#f0b429', '#007c7d', '#0a0a0a'], ['warm', 'poster', 'rainbow eye']),
  _PALETTE('sea-glass', 'sea glass', ['#0f3d3e', '#1f7a6d', '#7fc8a9', '#d5eeba', '#f6f1e9'], ['green', 'calm'])
);

/* ------------------------------ the store ------------------------------ */

const Motifs = {
  KEY: 'weft:motifs',
  _mine: null,   // the parsed list — also the whole store when storage is blocked
  _subs: [],

  /* ---- read ---- */

  mine() {
    if (Motifs._mine) return Motifs._mine;
    let list = [], raw = null;
    try {
      raw = localStorage.getItem(Motifs.KEY);
      const data = raw ? JSON.parse(raw) : null;
      if (data && Array.isArray(data.motifs)) list = data.motifs.filter(m => m && m.id && m.body && Array.isArray(m.body.nodes));
    } catch (e) {
      // storage blocked (start empty), or an entry that won't parse — set it
      // aside before the next save writes over it
      try { if (raw) localStorage.setItem(Motifs.KEY + '-unreadable', raw); } catch (e2) {}
    }
    Motifs._mine = list;
    return list;
  },

  /* yours first (newest first — a rename doesn't reshuffle), then the ones Weft ships */
  list() {
    const mine = Motifs.mine().slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return mine.concat(EXAMPLE_MOTIFS);
  },

  get(id) { return Motifs.list().find(m => m.id === id) || null; },

  /* one lowercase haystack per motif: title, tags, blurb and every node type
   * inside, so "spring", "palette" and "state/spring" all land */
  _hays: new WeakMap(),
  hay(m) {
    let h = Motifs._hays.get(m);
    if (!h) {
      h = [m.title, (m.tags || []).join(' '), m.blurb || '', 'motif', (m.body.nodes || []).map(n => n.type).join(' ')].join(' ').toLowerCase();
      Motifs._hays.set(m, h);
    }
    return h;
  },

  /* shallow: title and tags only — what the node search uses, so typing
   * "circle" there doesn't surface every motif with a Circle inside */
  search(q, list, shallow) {
    const words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
    const hay = shallow ? m => (m.title + ' ' + (m.tags || []).join(' ')).toLowerCase() : Motifs.hay;
    return (list || Motifs.list()).filter(m => words.every(w => hay(m).includes(w)));
  },

  describe(m) {
    const b = m.body, nn = b.nodes.length, nw = (b.wires || []).length, ng = (b.groups || []).length;
    return nn + ' node' + (nn === 1 ? '' : 's') + (nw ? ' · ' + nw + ' wire' + (nw === 1 ? '' : 's') : '') +
      (ng ? ' · ' + ng + ' group' + (ng === 1 ? '' : 's') : '') +
      ((m.tags || []).length ? ' · ' + m.tags.join(', ') : '');
  },

  /* ---- shape ---- */

  /* the body a motif keeps: the fragment minus `ext` (outside wires never
   * cross looms) and anything that isn't graph data */
  clean(frag) {
    const pick = n => {
      const o = { id: String(n.id), type: n.type, x: Math.round(+n.x || 0), y: Math.round(+n.y || 0), values: JSON.parse(JSON.stringify(n.values || {})) };
      if (n.enabled === false) o.enabled = false;
      if (n.preview === false) o.preview = false;
      if (n.collapsed) o.collapsed = true;
      if (n.label) o.label = String(n.label);
      return o;
    };
    const body = {
      weft: 'patch', format: 1,
      nodes: (frag && Array.isArray(frag.nodes) ? frag.nodes : []).filter(n => n && n.type).map(pick),
      wires: (frag && Array.isArray(frag.wires) ? frag.wires : []).map(WeftOps.wireOf).filter(Boolean)
        .map(w => ({ from: [String(w.from[0]), w.from[1]], to: [String(w.to[0]), w.to[1]] }))
    };
    const groups = (frag && Array.isArray(frag.groups) ? frag.groups : []).filter(f => f && Array.isArray(f.nodes))
      .map(f => {
        const g = { id: String(f.id || 'g1'), x: Math.round(+f.x || 0), y: Math.round(+f.y || 0), w: Math.round(+f.w || 0), h: Math.round(+f.h || 0),
          title: String(f.title || 'group'), nodes: f.nodes.map(String) };
        if (f.collapsed) g.collapsed = true;
        return g;
      });
    if (groups.length) body.groups = groups;
    return body;
  },

  /* the same WeftOps / NODE_DEFS check an assistant reply gets — every type
   * known, every wire end a real node and port — plus unique ids and frames
   * that only name nodes the motif has */
  validate(body, defs) {
    if (!body || !Array.isArray(body.nodes) || !body.nodes.length) return ['a motif needs at least one node'];
    const ids = new Set();
    for (const n of body.nodes) {
      if (!n || n.id === undefined || n.id === '') return ['every node needs an id'];
      if (ids.has(n.id)) return ['two nodes share the id “' + n.id + '”'];
      ids.add(n.id);
    }
    const r = WeftOps.apply({ nodes: [], wires: [] }, [{ op: 'replace', graph: { nodes: body.nodes, wires: body.wires || [] } }], defs || NODE_DEFS);
    // the op name is the validator's plumbing, not the reader's business
    const errors = r.errors.map(e => e.replace(/^replace( wire)?: /, ''));
    if ((body.groups || []).some(f => !f || !Array.isArray(f.nodes) || f.nodes.some(id => !ids.has(id))))
      errors.push('a group names a node the motif doesn’t have');
    return errors;
  },

  tagsOf(t) {
    const list = Array.isArray(t) ? t : String(t || '').split(',');
    return Array.from(new Set(list.map(s => String(s).trim().toLowerCase()).filter(Boolean))).slice(0, 12);
  },

  /* ---- write ---- */

  _id() {
    try { if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  /* false when the browser would not keep it (blocked, or the quota is full);
   * the list in memory still holds it for this session */
  _write() {
    try {
      localStorage.setItem(Motifs.KEY, JSON.stringify({ format: 1, motifs: Motifs.mine() }));
      return true;
    } catch (e) { return false; }
  },

  _changed() { for (const fn of Motifs._subs) { try { fn(); } catch (e) { /* a listener never breaks a save */ } } },

  onChange(fn) { Motifs._subs.push(fn); },

  /* another tab wrote the store — drop the cache, reread on next use */
  reload() { Motifs._mine = null; Motifs._changed(); },

  _record(o) {
    const now = new Date().toISOString();
    return {
      id: Motifs._id(), title: String(o.title || '').trim().slice(0, 80) || 'motif', tags: Motifs.tagsOf(o.tags),
      body: o.body, node_count: o.body.nodes.length, created_at: now, updated_at: now
    };
  },

  /* → { motif } or { errors } — nothing invalid gets in */
  save(o) {
    const body = Motifs.clean(o && o.body);
    const errors = Motifs.validate(body);
    if (errors.length) return { errors };
    const m = Motifs._record({ title: o.title, tags: o.tags, body });
    Motifs.mine().push(m);
    const kept = Motifs._write();
    Motifs._changed();
    return kept ? { motif: m } : { motif: m, warning: 'this browser wouldn’t keep it (storage is full or blocked) — it lasts until you close the tab; export it to keep it' };
  },

  update(id, patch) {
    const m = Motifs.mine().find(x => x.id === id);
    if (!m) return null;
    if (patch.title !== undefined) m.title = String(patch.title).trim().slice(0, 80) || m.title;
    if (patch.tags !== undefined) m.tags = Motifs.tagsOf(patch.tags);
    m.updated_at = new Date().toISOString();
    Motifs._hays.delete(m);
    Motifs._write();
    Motifs._changed();
    return m;
  },

  remove(id) {
    const list = Motifs.mine(), i = list.findIndex(x => x.id === id);
    if (i < 0) return false;
    list.splice(i, 1);
    Motifs._write();
    Motifs._changed();
    return true;
  },

  /* ---- files ---- */

  /* one motif or a whole library, the same wrapper either way */
  toFile(list) {
    return JSON.stringify({
      weft: 'motifs', format: 1,
      motifs: list.map(m => ({ title: m.title, tags: m.tags || [], body: m.body }))
    }, null, 1);
  },

  /* reads a motif file, a single { title, body } record, a bare clipboard
   * fragment or a whole loom (named after the file). Every body is cleaned and
   * validated on the way in; what fails is reported, never stored.
   * → { motifs: [{ title, tags, body }], skipped: ['why', …] } */
  fromFile(text, name) {
    const stem = String(name || 'motif').replace(/\.(motif\.)?(json|weft)$/i, '');
    let data;
    try { data = JSON.parse(text); } catch (e) { return { motifs: [], skipped: [stem + ': not a JSON file'] }; }
    let items;
    if (data && data.weft === 'motifs') {
      if (data.format > 1) return { motifs: [], skipped: [stem + ': made in a newer Weft (motif format ' + data.format + ')'] };
      items = Array.isArray(data.motifs) ? data.motifs : [];
    } else if (data && data.body && Array.isArray(data.body.nodes)) items = [data];
    else if (data && Array.isArray(data.nodes)) items = [{ title: stem, body: data }];
    else return { motifs: [], skipped: [stem + ': not a motif file'] };
    const out = { motifs: [], skipped: [] };
    for (const it of items) {
      const title = String((it && it.title) || stem).trim() || stem;
      const body = Motifs.clean(it && it.body);
      const errors = Motifs.validate(body);
      if (errors.length) out.skipped.push(title + ': ' + errors[0]);
      else out.motifs.push({ title, tags: Motifs.tagsOf(it.tags), body });
    }
    return out;
  },

  /* add imported motifs as new copies; one already here (same title, same
   * body) is not added twice → { added, same, warning? } */
  importMany(items) {
    const list = Motifs.mine();
    const key = m => m.title + '\n' + JSON.stringify(m.body);
    const have = new Set(list.map(key));
    let added = 0, same = 0;
    for (const it of items) {
      if (have.has(key(it))) { same++; continue; }
      const m = Motifs._record(it);
      list.push(m); have.add(key(m)); added++;
    }
    const kept = !added || Motifs._write();
    if (added) Motifs._changed();
    return kept ? { added, same } : { added, same, warning: 'this browser wouldn’t keep them (storage is full or blocked) — they last until you close the tab' };
  }
};
