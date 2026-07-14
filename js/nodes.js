'use strict';
/*
 * Weft node library — Grasshopper-inspired, 2D, web-native inputs.
 * compute() must be a pure arrow function using only (args, ctx, node) and LM.*
 * — it gets serialized into exported experiences. buildBody/postEval are
 * editor-only and never exported.
 */
/* palette + wire colors — locked in Figma 2026-07-13, see docs/DESIGN.md
 * (Meta is provisional slate until the Figma pass reaches it) */
const CATS = {
  Input: '#03a514', Params: '#2dd4bf', State: '#c1362e', Maths: '#3b5dba', Sets: '#7831be',
  Vector: '#7cbe25', Curve: '#fbac00', Transform: '#ff6767', Display: '#f009fc', Meta: '#8494ad'
};
const TYPE_COLORS = {
  number: '#3e9aff', bool: '#ff3b41', string: '#fbbb00', point: '#fb6c09',
  vector: '#8cff14', color: '#d730f8', geometry: '#7057ff', any: '#8ea4c3'
};

const NODE_DEFS = {};
function defNode(id, d) { d.id = id; NODE_DEFS[id] = d; }

/* small DOM helpers for custom bodies (editor only) */
function _mk(tag, cls, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.appendChild(e);
  return e;
}
function _numInput(cls, value, parent) {
  const i = _mk('input', cls, parent);
  i.type = 'number'; i.step = 'any'; i.value = value;
  return i;
}

/* ============================== INPUT ============================== */

defNode('input/time', {
  title: 'Time', cat: 'Input', desc: 'Seconds since start, frame count',
  inputs: [], outputs: [{ name: 'T', type: 'number', label: 'seconds' }, { name: 'F', type: 'number', label: 'frame' }],
  compute: (a, ctx) => ({ T: ctx.t, F: ctx.frame })
});

defNode('input/mouse', {
  title: 'Mouse', cat: 'Input', desc: 'Pointer position (canvas-centered px + normalized 0..1) and button state',
  inputs: [], outputs: [
    { name: 'X', type: 'number', label: 'x (centered px)' }, { name: 'Y', type: 'number', label: 'y (centered px)' },
    { name: 'NX', type: 'number', label: 'x normalized 0..1' }, { name: 'NY', type: 'number', label: 'y normalized 0..1' },
    { name: 'D', type: 'bool', label: 'pointer down' }],
  compute: (a, ctx) => ({ X: ctx.mouse.x, Y: ctx.mouse.y, NX: ctx.mouse.nx, NY: ctx.mouse.ny, D: ctx.mouse.down })
});

defNode('input/viewport', {
  title: 'Viewport', cat: 'Input', desc: 'Canvas size in px (origin is the center)',
  inputs: [], outputs: [{ name: 'W', type: 'number', label: 'width' }, { name: 'H', type: 'number', label: 'height' }],
  compute: (a, ctx) => ({ W: ctx.W, H: ctx.H })
});

/* -- interaction inputs (events & state, see docs/EVENTS-AND-STATE.md) -- */

defNode('input/hotspot', {
  title: 'Hotspot', cat: 'Input', desc: 'Turn any geometry into an interface element: hover / pressed / clicked (per list item)',
  inputs: [{ name: 'G', type: 'geometry' }, { name: 'R', type: 'number', default: 8, label: 'reach px (open curves)' }],
  outputs: [
    { name: 'H', type: 'bool', label: 'hovering' },
    { name: 'D', type: 'bool', label: 'pressed on it, still over it' },
    { name: 'C', type: 'bool', label: 'clicked (trigger)' }],
  compute: (a, ctx, node) => {
    if (!a.G) return { H: false, D: false, C: false };
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { armed: false };
    const m = ctx.mouse || {};
    const over = LM.pointInGeom(a.G, m, a.R);
    if (m.pressed && over) s.armed = true;
    let C = false;
    if (m.released) { if (s.armed && over) C = true; s.armed = false; }
    return { H: over, D: s.armed && over, C };
  }
});

defNode('input/button', {
  title: 'Button', cat: 'Input', desc: 'A real button overlaid on the canvas at P — clicked trigger, held state, click count',
  inputs: [
    { name: 'L', type: 'string', default: 'press', label: 'label' },
    { name: 'P', type: 'point', default: { x: 0, y: 130 } }],
  outputs: [
    { name: 'C', type: 'bool', label: 'clicked (trigger)' },
    { name: 'D', type: 'bool', label: 'held down' },
    { name: 'N', type: 'number', label: 'click count' }],
  compute: (a, ctx, node) => {
    const id = node.id + ':' + (ctx.i || 0);
    if (ctx.domList) ctx.domList.push({ id, kind: 'button', label: a.L, x: a.P.x, y: a.P.y });
    const st = (ctx.domState && ctx.domState[id]) || {};
    const seen = node._seen = node._seen || {};
    const c = st.clicks || 0;
    const prev = (id in seen) ? seen[id] : c;
    seen[id] = c;
    return { C: c > prev, D: !!st.down, N: c };
  }
});

defNode('input/keyboard', {
  title: 'Keyboard', cat: 'Input', desc: 'State of one key: held / pressed / released (key names like a, space, arrowleft, enter)',
  inputs: [{ name: 'K', type: 'string', default: 'space', label: 'key' }],
  outputs: [
    { name: 'D', type: 'bool', label: 'held down' },
    { name: 'P', type: 'bool', label: 'pressed (trigger)' },
    { name: 'R', type: 'bool', label: 'released (trigger)' }],
  compute: (a, ctx) => {
    const k = String(a.K || '').trim().toLowerCase();
    const kb = ctx.keys || {};
    return { D: !!(kb.down || {})[k], P: !!(kb.pressed || {})[k], R: !!(kb.released || {})[k] };
  }
});

defNode('input/scroll', {
  title: 'Scroll', cat: 'Input', desc: 'Page scroll as a parameter — px, normalized 0..1, velocity (the editor simulates a page: wheel over the cloth)',
  inputs: [], outputs: [
    { name: 'Y', type: 'number', label: 'scrolled px' },
    { name: 'N', type: 'number', label: 'normalized 0..1' },
    { name: 'V', type: 'number', label: 'velocity px/s' }],
  compute: (a, ctx) => {
    const s = ctx.scroll || {};
    return { Y: s.y || 0, N: s.max > 0 ? LM.clamp((s.y || 0) / s.max, 0, 1) : 0, V: s.v || 0 };
  }
});

/* ============================== PARAMS ============================== */

/* Pass-through containers (GH-style params): weave a flow through a stable
 * reference, swap the source later without rewiring downstream. Identity
 * per-item mapping preserves lists exactly; the literal is used when unwired.
 * (Each compute is written out literally — closures would break export.) */
const _PARAM_DESC = 'Pass-through container — wire a source through it, or set it directly; swap the source later without rewiring downstream';
defNode('params/number', {
  title: 'Number', cat: 'Params', desc: _PARAM_DESC,
  inputs: [{ name: 'N', type: 'number', default: 0, label: 'source (optional)' }],
  outputs: [{ name: 'N', type: 'number' }],
  compute: a => ({ N: a.N })
});
defNode('params/point', {
  title: 'Point', cat: 'Params', desc: _PARAM_DESC,
  inputs: [{ name: 'P', type: 'point', default: { x: 0, y: 0 }, label: 'source (optional)' }],
  outputs: [{ name: 'P', type: 'point' }],
  compute: a => ({ P: a.P })
});
defNode('params/vector', {
  title: 'Vector', cat: 'Params', desc: _PARAM_DESC,
  inputs: [{ name: 'V', type: 'vector', default: { x: 0, y: 0 }, label: 'source (optional)' }],
  outputs: [{ name: 'V', type: 'vector' }],
  compute: a => ({ V: a.V })
});
defNode('params/curve', {
  title: 'Curve', cat: 'Params', desc: _PARAM_DESC,
  inputs: [{ name: 'C', type: 'geometry', label: 'source (optional)' }],
  outputs: [{ name: 'C', type: 'geometry' }],
  compute: a => ({ C: a.C })
});

/* small helper: bare widgets both drag (as nodes) and click (as controls) —
 * only treat a press+release with no movement as a click */
function _cleanClick(el, fn) {
  let px = 0, py = 0;
  el.addEventListener('pointerdown', e => { px = e.clientX; py = e.clientY; });
  el.addEventListener('click', e => {
    if (Math.hypot(e.clientX - px, e.clientY - py) > 4) return;
    fn(e);
  });
}

defNode('params/slider', {
  title: 'Number Slider', cat: 'Params', desc: 'Draggable number', width: 200, bare: true,
  inputs: [], outputs: [{ name: 'N', type: 'number' }],
  defaults: { min: 0, max: 10, value: 5 },
  compute: (a, c, node) => ({ N: node.values.value === undefined ? 0 : node.values.value }),
  buildBody: (node, body, changed) => {
    const v = node.values;
    const sl = _mk('div', 'sl', body);
    const mm = _mk('div', 'sl-minmax', sl);
    const mn = _numInput('sl-min', v.min, mm); mn.title = 'min';
    const mx = _numInput('sl-max', v.max, mm); mx.title = 'max';
    const track = _mk('div', 'sl-track', sl);
    const range = _mk('input', 'sl-range', track);
    range.type = 'range'; range.step = 'any'; range.min = v.min; range.max = v.max; range.value = v.value;
    const num = _numInput('sl-val', v.value, sl);
    const fill = () => {
      const span = (v.max - v.min) || 1;
      range.style.setProperty('--p', (LM.clamp((v.value - v.min) / span, 0, 1) * 100) + '%');
    };
    fill();
    range.addEventListener('input', () => { v.value = parseFloat(range.value); num.value = Math.round(v.value * 1000) / 1000; fill(); changed(); });
    num.addEventListener('change', () => { v.value = parseFloat(num.value) || 0; range.value = v.value; fill(); changed(); });
    mn.addEventListener('change', () => { v.min = parseFloat(mn.value) || 0; range.min = v.min; fill(); changed(); });
    mx.addEventListener('change', () => { v.max = parseFloat(mx.value) || 0; range.max = v.max; fill(); changed(); });
  }
});

defNode('params/toggle', {
  title: 'Boolean Toggle', cat: 'Params', desc: 'True / false switch', bare: true,
  inputs: [], outputs: [{ name: 'B', type: 'bool' }],
  defaults: { on: true },
  compute: (a, c, node) => ({ B: !!node.values.on }),
  buildBody: (node, body, changed) => {
    const tg = _mk('div', 'tg' + (node.values.on ? ' on' : ''), body);
    tg.title = 'Boolean Toggle';
    _mk('div', 'tg-knob', tg);
    _cleanClick(tg, () => {
      node.values.on = !node.values.on;
      tg.classList.toggle('on', !!node.values.on);
      changed();
    });
  }
});

defNode('params/swatch', {
  title: 'Colour Swatch', cat: 'Params', desc: 'Pick a colour', bare: true,
  inputs: [], outputs: [{ name: 'C', type: 'color' }],
  defaults: { hex: '#5eead4', a: 1 },
  compute: (a, c, node) => ({ C: LM.hexToColor(node.values.hex, node.values.a) }),
  buildBody: (node, body, changed) => {
    const sw = _mk('div', 'sw', body);
    const circle = _mk('div', 'sw-circle', sw);
    circle.title = 'Colour Swatch';
    const col = _mk('input', '', sw); col.type = 'color'; col.value = node.values.hex;
    const al = _numInput('sw-alpha', node.values.a, sw); al.min = 0; al.max = 1; al.title = 'alpha';
    const paint = () => {
      const a = node.values.a === undefined ? 1 : node.values.a;
      circle.style.background = node.values.hex;
      circle.style.opacity = 0.25 + 0.75 * a;
    };
    paint();
    _cleanClick(circle, () => col.click());
    col.addEventListener('input', () => { node.values.hex = col.value; paint(); changed(); });
    al.addEventListener('change', () => { node.values.a = LM.clamp(parseFloat(al.value) || 0, 0, 1); paint(); changed(); });
  }
});

defNode('params/anchor', {
  title: 'Anchor Point', cat: 'Params', desc: 'A point pinned to the cloth (render canvas) — drag its handle there directly',
  inputs: [], outputs: [{ name: 'P', type: 'point' }],
  defaults: { x: 0, y: 0 },
  compute: (a, c, node) => ({ P: { x: node.values.x || 0, y: node.values.y || 0 } }),
  buildBody: (node, body, changed) => {
    const row = _mk('div', 'anchor-row', body);
    const ix = _numInput('anch-x', node.values.x, row); ix.title = 'x';
    const iy = _numInput('anch-y', node.values.y, row); iy.title = 'y';
    ix.addEventListener('change', () => { node.values.x = parseFloat(ix.value) || 0; changed(); });
    iy.addEventListener('change', () => { node.values.y = parseFloat(iy.value) || 0; changed(); });
  },
  postEval: (node, el) => {
    const ix = el.querySelector('.anch-x'), iy = el.querySelector('.anch-y');
    if (ix && document.activeElement !== ix && +ix.value !== Math.round(node.values.x || 0)) ix.value = Math.round(node.values.x || 0);
    if (iy && document.activeElement !== iy && +iy.value !== Math.round(node.values.y || 0)) iy.value = Math.round(node.values.y || 0);
  }
});

defNode('params/panel', {
  title: 'Note Pad', cat: 'Params', desc: 'Inspect data flowing through, or type a value', width: 200, bare: true,
  inputs: [{ name: 'V', type: 'any' }], outputs: [{ name: 'V', type: 'any' }],
  listInputs: ['V'],
  defaults: { text: 'hello weft' },
  compute: (a, c, node) => ({ V: a.V && a.V.length ? a.V : [node.values.text] }),
  buildBody: (node, body) => {
    const np = _mk('div', 'np', body);
    const ta = _mk('textarea', 'panel-src', np);
    ta.value = node.values.text; ta.rows = 1; ta.spellcheck = false;
    ta.addEventListener('input', () => { node.values.text = ta.value; });
    _mk('pre', 'panel-out', np);
  },
  postEval: (node, el) => {
    const out = el.querySelector('.panel-out');
    const src = el.querySelector('.panel-src');
    const connected = node._last && node._last.ins.V && node._last.ins.V.length;
    if (src) src.style.display = connected ? 'none' : '';
    const list = (node._last && node._last.outs.V) || [];
    let s;
    if (!connected) s = '';
    else if (list.length <= 1) s = LM.fmt(list[0]);
    else s = list.slice(0, 14).map((v, i) => i + '  ' + LM.fmt(v)).join('\n') + (list.length > 14 ? '\n… ' + list.length + ' items' : '\n— ' + list.length + ' items');
    if (out && out.textContent !== s) out.textContent = s;
    if (out) out.style.display = connected ? '' : 'none';
  }
});

defNode('params/textlist', {
  title: 'Text List', cat: 'Params', desc: 'A literal list of strings — one item per line', width: 200, bare: true,
  inputs: [], outputs: [{ name: 'L', type: 'string' }],
  defaults: { text: 'one\ntwo\nthree' },
  compute: (a, c, node) => ({ L: String(node.values.text === undefined ? '' : node.values.text).split('\n').filter(s => s.length) }),
  buildBody: (node, body) => {
    const tl = _mk('div', 'np tl', body);
    const ta = _mk('textarea', 'panel-src', tl);
    ta.value = node.values.text; ta.rows = 3; ta.spellcheck = false;
    ta.addEventListener('input', () => { node.values.text = ta.value; ta.rows = Math.max(2, Math.min(12, ta.value.split('\n').length)); });
    ta.rows = Math.max(2, Math.min(12, String(node.values.text || '').split('\n').length));
  }
});

/* ============================== MATHS ============================== */

function defBinary(id, title, fn, desc) {
  defNode(id, {
    title, cat: 'Maths', desc: desc || title + ' of A and B',
    inputs: [{ name: 'A', type: 'number', default: 0 }, { name: 'B', type: 'number', default: 0 }],
    outputs: [{ name: 'R', type: 'number' }],
    compute: fn
  });
}
defBinary('math/add', 'Addition', a => ({ R: a.A + a.B }));
defBinary('math/sub', 'Subtraction', a => ({ R: a.A - a.B }));
defBinary('math/mul', 'Multiplication', a => ({ R: a.A * a.B }));
defBinary('math/div', 'Division', a => ({ R: a.B === 0 ? 0 : a.A / a.B }));
defBinary('math/mod', 'Modulus', a => ({ R: a.B === 0 ? 0 : ((a.A % a.B) + a.B) % a.B }), 'Wrapped remainder of A / B');
defBinary('math/pow', 'Power', a => ({ R: Math.pow(a.A, a.B) }));
defBinary('math/min', 'Minimum', a => ({ R: Math.min(a.A, a.B) }));
defBinary('math/max', 'Maximum', a => ({ R: Math.max(a.A, a.B) }));

defNode('math/atan2', {
  title: 'ArcTangent 2', cat: 'Maths', desc: 'Angle of vector (X,Y) in radians',
  inputs: [{ name: 'X', type: 'number', default: 1 }, { name: 'Y', type: 'number', default: 0 }],
  outputs: [{ name: 'R', type: 'number' }],
  compute: a => ({ R: Math.atan2(a.Y, a.X) })
});

function defUnary(id, title, fn, desc) {
  defNode(id, {
    title, cat: 'Maths', desc: desc || title,
    inputs: [{ name: 'V', type: 'number', default: 0 }],
    outputs: [{ name: 'R', type: 'number' }],
    compute: fn
  });
}
defUnary('math/neg', 'Negative', a => ({ R: -a.V }));
defUnary('math/abs', 'Absolute', a => ({ R: Math.abs(a.V) }));
defUnary('math/round', 'Round', a => ({ R: Math.round(a.V) }));
defUnary('math/floor', 'Floor', a => ({ R: Math.floor(a.V) }));
defUnary('math/ceil', 'Ceiling', a => ({ R: Math.ceil(a.V) }));
defUnary('math/sqrt', 'Square Root', a => ({ R: Math.sqrt(Math.max(0, a.V)) }));
defUnary('math/sin', 'Sine', a => ({ R: Math.sin(a.V) }), 'Sine (radians)');
defUnary('math/cos', 'Cosine', a => ({ R: Math.cos(a.V) }), 'Cosine (radians)');
defUnary('math/tan', 'Tangent', a => ({ R: Math.tan(a.V) }), 'Tangent (radians)');
defUnary('math/rad', 'Radians', a => ({ R: a.V * Math.PI / 180 }), 'Degrees → radians');
defUnary('math/deg', 'Degrees', a => ({ R: a.V * 180 / Math.PI }), 'Radians → degrees');

defNode('math/pi', {
  title: 'Pi', cat: 'Maths', desc: 'F · π',
  inputs: [{ name: 'F', type: 'number', default: 1, label: 'factor' }],
  outputs: [{ name: 'P', type: 'number' }],
  compute: a => ({ P: a.F * Math.PI })
});

defNode('math/phi', {
  title: 'Phi', cat: 'Maths', desc: 'F · φ (golden ratio, 1.618…)',
  inputs: [{ name: 'F', type: 'number', default: 1, label: 'factor' }],
  outputs: [{ name: 'P', type: 'number' }],
  compute: a => ({ P: a.F * 1.618033988749895 })
});

defNode('math/remap', {
  title: 'Remap Numbers', cat: 'Maths', desc: 'Map V from source domain [S0,S1] to target [T0,T1]',
  inputs: [
    { name: 'V', type: 'number', default: 0.5 },
    { name: 'S0', type: 'number', default: 0, label: 'source start' }, { name: 'S1', type: 'number', default: 1, label: 'source end' },
    { name: 'T0', type: 'number', default: 0, label: 'target start' }, { name: 'T1', type: 'number', default: 100, label: 'target end' },
    { name: 'C', type: 'bool', default: true, label: 'clamp' }],
  outputs: [{ name: 'R', type: 'number' }],
  compute: a => {
    let t = (a.S1 - a.S0) === 0 ? 0 : (a.V - a.S0) / (a.S1 - a.S0);
    if (a.C) t = LM.clamp(t, 0, 1);
    return { R: LM.lerp(a.T0, a.T1, t) };
  }
});

defNode('math/clamp', {
  title: 'Clamp', cat: 'Maths', desc: 'Constrain V to [A,B]',
  inputs: [{ name: 'V', type: 'number', default: 0 }, { name: 'A', type: 'number', default: 0 }, { name: 'B', type: 'number', default: 1 }],
  outputs: [{ name: 'R', type: 'number' }],
  compute: a => ({ R: LM.clamp(a.V, a.A, a.B) })
});

defNode('math/lerp', {
  title: 'Lerp', cat: 'Maths', desc: 'Linear interpolate A→B by T',
  inputs: [{ name: 'A', type: 'number', default: 0 }, { name: 'B', type: 'number', default: 1 }, { name: 'T', type: 'number', default: 0.5 }],
  outputs: [{ name: 'R', type: 'number' }],
  compute: a => ({ R: LM.lerp(a.A, a.B, a.T) })
});

defNode('math/smooth', {
  title: 'Smooth Step', cat: 'Maths', desc: 'Smooth interpolate A→B by T (eased)',
  inputs: [{ name: 'A', type: 'number', default: 0 }, { name: 'B', type: 'number', default: 1 }, { name: 'T', type: 'number', default: 0.5 }],
  outputs: [{ name: 'R', type: 'number' }],
  compute: a => { const t = LM.clamp(a.T, 0, 1); return { R: LM.lerp(a.A, a.B, t * t * (3 - 2 * t)) }; }
});

defNode('math/expr', {
  title: 'Expression', cat: 'Maths', desc: 'Evaluate an expression of X, Y, Z, T (time). Math functions available.',
  width: 190,
  inputs: [{ name: 'X', type: 'number', default: 0 }, { name: 'Y', type: 'number', default: 0 }, { name: 'Z', type: 'number', default: 0 }],
  outputs: [{ name: 'R', type: 'number' }],
  defaults: { expr: 'sin(X) * Y' },
  compute: (a, ctx, node) => {
    const src = node.values.expr || '0';
    /* also guard _exprFn's type: a graph serialized mid-run can carry a stray
     * _exprSrc string (functions never survive JSON) — rebuild in that case */
    if (node._exprSrc !== src || typeof node._exprFn !== 'function') {
      node._exprSrc = src;
      node._exprFn = new Function('X', 'Y', 'Z', 'T', 'with(Math){return (' + src + ');}');
    }
    const r = +node._exprFn(a.X || 0, a.Y || 0, a.Z || 0, ctx.t);
    return { R: isNaN(r) ? 0 : r };
  },
  buildBody: (node, body, changed) => {
    const i = _mk('input', 'expr-src', body);
    i.type = 'text'; i.value = node.values.expr; i.spellcheck = false;
    i.addEventListener('change', () => { node.values.expr = i.value; changed(); });
  }
});

defNode('math/cmp', {
  title: 'Comparison', cat: 'Maths', width: 168,
  desc: 'Compare A against B — pick the operator on the node (equality uses a tiny epsilon)',
  inputs: [{ name: 'A', type: 'number', default: 0 }, { name: 'B', type: 'number', default: 0 }],
  outputs: [{ name: 'R', type: 'bool' }],
  defaults: { mode: '<' },
  compute: (a, ctx, node) => {
    const m = node.values.mode || '<', e = 1e-9;
    let r;
    if (m === '=') r = Math.abs(a.A - a.B) <= e;
    else if (m === '≠') r = Math.abs(a.A - a.B) > e;
    else if (m === '<') r = a.A < a.B;
    else if (m === '≤') r = a.A <= a.B + e;
    else if (m === '>') r = a.A > a.B;
    else r = a.A >= a.B - e;
    return { R: r };
  },
  buildBody: (node, body, changed) => {
    const seg = _mk('div', 'seg', body);
    ['=', '≠', '<', '≤', '>', '≥'].forEach(m => {
      const b = _mk('div', 'seg-b' + ((node.values.mode || '<') === m ? ' on' : ''), seg);
      b.textContent = m;
      _cleanClick(b, () => {
        node.values.mode = m;
        seg.querySelectorAll('.seg-b').forEach(e => e.classList.remove('on'));
        b.classList.add('on');
        changed();
      });
    });
  }
});

defNode('math/logic', {
  title: 'Logic', cat: 'Maths', width: 168,
  desc: 'Boolean logic on A and B — pick the operator on the node (not ignores B)',
  inputs: [{ name: 'A', type: 'bool', default: false }, { name: 'B', type: 'bool', default: false }],
  outputs: [{ name: 'R', type: 'bool' }],
  defaults: { mode: 'and' },
  compute: (a, ctx, node) => {
    const m = node.values.mode || 'and';
    if (m === 'not') return { R: !a.A };
    if (m === 'and') return { R: !!(a.A && a.B) };
    if (m === 'or') return { R: !!(a.A || a.B) };
    return { R: !!a.A !== !!a.B };
  },
  buildBody: (node, body, changed) => {
    const seg = _mk('div', 'seg', body);
    ['and', 'or', 'xor', 'not'].forEach(m => {
      const b = _mk('div', 'seg-b' + ((node.values.mode || 'and') === m ? ' on' : ''), seg);
      b.textContent = m;
      _cleanClick(b, () => {
        node.values.mode = m;
        seg.querySelectorAll('.seg-b').forEach(e => e.classList.remove('on'));
        b.classList.add('on');
        changed();
      });
    });
  }
});

defNode('math/masadd', {
  title: 'Mass Addition', cat: 'Maths',
  desc: 'Sum of all numbers in L, plus the running total at each item — the cumulative sum that turns a list of gaps into a list of positions',
  inputs: [{ name: 'L', type: 'number' }],
  outputs: [{ name: 'R', type: 'number', label: 'sum' }, { name: 'P', type: 'number', label: 'partial results' }],
  listInputs: ['L'],
  compute: a => {
    let s = 0; const P = [];
    for (const v of (a.L || [])) { s += v; P.push(s); }
    return { R: s, P };
  }
});

defNode('math/noise', {
  title: 'Noise', cat: 'Maths', desc: 'Smooth 2D value noise, output 0..1',
  inputs: [{ name: 'X', type: 'number', default: 0 }, { name: 'Y', type: 'number', default: 0 }],
  outputs: [{ name: 'N', type: 'number' }],
  compute: a => ({ N: LM.noise2(a.X, a.Y) })
});

/* ============================== SETS ============================== */

defNode('sets/series', {
  title: 'Series', cat: 'Sets', desc: 'Arithmetic series: S, S+N, S+2N, … (C values)',
  inputs: [{ name: 'S', type: 'number', default: 0, label: 'start' }, { name: 'N', type: 'number', default: 1, label: 'step' }, { name: 'C', type: 'number', default: 10, label: 'count' }],
  outputs: [{ name: 'S', type: 'number' }],
  compute: a => {
    const c = LM.clamp(Math.floor(a.C), 0, 10000), out = [];
    for (let i = 0; i < c; i++) out.push(a.S + i * a.N);
    return { S: out };
  }
});

defNode('sets/range', {
  title: 'Range', cat: 'Sets', desc: 'N steps across domain [A,B] → N+1 values',
  inputs: [{ name: 'A', type: 'number', default: 0 }, { name: 'B', type: 'number', default: 1 }, { name: 'N', type: 'number', default: 10, label: 'steps' }],
  outputs: [{ name: 'R', type: 'number' }],
  compute: a => {
    const n = LM.clamp(Math.floor(a.N), 1, 10000), out = [];
    for (let i = 0; i <= n; i++) out.push(LM.lerp(a.A, a.B, i / n));
    return { R: out };
  }
});

defNode('sets/random', {
  title: 'Random', cat: 'Sets', desc: 'N seeded random numbers in [A,B]',
  inputs: [{ name: 'N', type: 'number', default: 10, label: 'count' }, { name: 'A', type: 'number', default: 0 }, { name: 'B', type: 'number', default: 1 }, { name: 'S', type: 'number', default: 1, label: 'seed' }],
  outputs: [{ name: 'R', type: 'number' }],
  compute: a => {
    const r = LM.rng(a.S), n = LM.clamp(Math.floor(a.N), 0, 10000), out = [];
    for (let i = 0; i < n; i++) out.push(a.A + (a.B - a.A) * r());
    return { R: out };
  }
});

defNode('sets/item', {
  title: 'List Item', cat: 'Sets', desc: 'Pick item i from list L (index wraps)',
  inputs: [{ name: 'L', type: 'any' }, { name: 'i', type: 'number', default: 0 }],
  outputs: [{ name: 'E', type: 'any' }],
  listInputs: ['L'],
  compute: a => {
    const n = (a.L || []).length;
    if (!n) return {};
    let j = Math.floor(a.i) % n; if (j < 0) j += n;
    return { E: a.L[j] };
  }
});

defNode('sets/length', {
  title: 'List Length', cat: 'Sets', desc: 'Number of items in L',
  inputs: [{ name: 'L', type: 'any' }], outputs: [{ name: 'N', type: 'number' }],
  listInputs: ['L'],
  compute: a => ({ N: (a.L || []).length })
});

defNode('sets/merge', {
  title: 'Merge', cat: 'Sets', desc: 'Concatenate lists A and B',
  inputs: [{ name: 'A', type: 'any' }, { name: 'B', type: 'any' }],
  outputs: [{ name: 'M', type: 'any' }],
  listInputs: ['A', 'B'],
  compute: a => ({ M: (a.A || []).concat(a.B || []) })
});

defNode('sets/reverse', {
  title: 'Reverse List', cat: 'Sets', desc: 'Reverse the order of L',
  inputs: [{ name: 'L', type: 'any' }], outputs: [{ name: 'R', type: 'any' }],
  listInputs: ['L'],
  compute: a => ({ R: (a.L || []).slice().reverse() })
});

/* -- list surgery -- */

defNode('sets/cullpat', {
  title: 'Cull Pattern', cat: 'Sets', desc: 'Keep items of L where the repeating bool pattern P is true',
  inputs: [{ name: 'L', type: 'any' }, { name: 'P', type: 'bool', default: true, label: 'pattern' }],
  outputs: [{ name: 'L', type: 'any' }],
  listInputs: ['L', 'P'],
  compute: a => {
    const p = a.P && a.P.length ? a.P : [true];
    return { L: (a.L || []).filter((v, i) => p[i % p.length]) };
  }
});

defNode('sets/shift', {
  title: 'Shift List', cat: 'Sets', desc: 'Offset all items in L by S places — W wraps shifted items round, off drops them',
  inputs: [{ name: 'L', type: 'any' }, { name: 'S', type: 'number', default: 1, label: 'shift offset' }, { name: 'W', type: 'bool', default: true, label: 'wrap' }],
  outputs: [{ name: 'L', type: 'any' }],
  listInputs: ['L'],
  compute: a => {
    const L = a.L || [], n = L.length, k = Math.round(a.S) || 0;
    if (!n) return { L: [] };
    if (a.W) { const s = ((k % n) + n) % n; return { L: L.slice(s).concat(L.slice(0, s)) }; }
    return { L: k >= 0 ? L.slice(Math.min(k, n)) : L.slice(0, Math.max(0, n + k)) };
  }
});

defNode('sets/dispatch', {
  title: 'Dispatch', cat: 'Sets', desc: 'Route items of L into A or B by the repeating bool pattern P — the list-level if/else',
  inputs: [{ name: 'L', type: 'any' }, { name: 'P', type: 'bool', default: true, label: 'pattern' }],
  outputs: [{ name: 'A', type: 'any', label: 'pattern true' }, { name: 'B', type: 'any', label: 'pattern false' }],
  listInputs: ['L', 'P'],
  compute: a => {
    const p = a.P && a.P.length ? a.P : [true], A = [], B = [];
    for (let i = 0; i < (a.L || []).length; i++) (p[i % p.length] ? A : B).push(a.L[i]);
    return { A, B };
  }
});

defNode('sets/select', {
  title: 'Select', cat: 'Sets',
  desc: 'Merge two lists item by item: where the repeating bool pattern P is true take from T, else from F — the list-level ternary (Dispatch’s inverse)',
  inputs: [
    { name: 'T', type: 'any', label: 'if true' },
    { name: 'F', type: 'any', label: 'if false' },
    { name: 'P', type: 'bool', default: true, label: 'pattern' }],
  outputs: [{ name: 'L', type: 'any' }],
  listInputs: ['T', 'F', 'P'],
  compute: a => {
    const T = a.T || [], F = a.F || [], P = (a.P && a.P.length) ? a.P : [true];
    const n = Math.max(T.length, F.length, P.length);
    const out = [];
    for (let i = 0; i < n; i++) {
      const src = P[i % P.length] ? T : F;
      if (src.length) out.push(src[Math.min(i, src.length - 1)]);
    }
    return { L: out };
  }
});

/* -- set operations (shared equality predicate: LM.setEq) -- */

defNode('sets/union', {
  title: 'Set Union', cat: 'Sets', desc: 'Every distinct item that appears in A or B',
  inputs: [{ name: 'A', type: 'any' }, { name: 'B', type: 'any' }],
  outputs: [{ name: 'U', type: 'any' }],
  listInputs: ['A', 'B'],
  compute: a => {
    const out = [];
    for (const v of (a.A || []).concat(a.B || [])) if (!out.some(u => LM.setEq(u, v))) out.push(v);
    return { U: out };
  }
});

defNode('sets/intersection', {
  title: 'Set Intersection', cat: 'Sets', desc: 'Distinct items that appear in both A and B',
  inputs: [{ name: 'A', type: 'any' }, { name: 'B', type: 'any' }],
  outputs: [{ name: 'I', type: 'any' }],
  listInputs: ['A', 'B'],
  compute: a => {
    const out = [];
    for (const v of (a.A || [])) if ((a.B || []).some(b => LM.setEq(b, v)) && !out.some(u => LM.setEq(u, v))) out.push(v);
    return { I: out };
  }
});

defNode('sets/difference', {
  title: 'Set Difference', cat: 'Sets', desc: 'Distinct items of A that do not appear in B (order kept from A)',
  inputs: [{ name: 'A', type: 'any' }, { name: 'B', type: 'any' }],
  outputs: [{ name: 'D', type: 'any' }],
  listInputs: ['A', 'B'],
  compute: a => {
    const out = [];
    for (const v of (a.A || [])) if (!(a.B || []).some(b => LM.setEq(b, v)) && !out.some(u => LM.setEq(u, v))) out.push(v);
    return { D: out };
  }
});

/* ============================== VECTOR ============================== */

defNode('vec/construct', {
  title: 'Construct Point', cat: 'Vector', desc: 'Point from X and Y',
  inputs: [{ name: 'X', type: 'number', default: 0 }, { name: 'Y', type: 'number', default: 0 }],
  outputs: [{ name: 'P', type: 'point' }],
  compute: a => ({ P: { x: a.X, y: a.Y } })
});

defNode('vec/deconstruct', {
  title: 'Deconstruct', cat: 'Vector', desc: 'Split point into X and Y',
  inputs: [{ name: 'P', type: 'point', default: { x: 0, y: 0 } }],
  outputs: [{ name: 'X', type: 'number' }, { name: 'Y', type: 'number' }],
  compute: a => ({ X: a.P.x, Y: a.P.y })
});

defNode('vec/vecxy', {
  title: 'Vector XY', cat: 'Vector', desc: 'Vector from X and Y components',
  inputs: [{ name: 'X', type: 'number', default: 0 }, { name: 'Y', type: 'number', default: 0 }],
  outputs: [{ name: 'V', type: 'vector' }],
  compute: a => ({ V: { x: a.X, y: a.Y } })
});

defNode('vec/pt2vec', {
  title: 'Point to Vector', cat: 'Vector', desc: 'Reinterpret a point as a translation vector (origin → point)',
  inputs: [{ name: 'P', type: 'point', default: { x: 0, y: 0 } }],
  outputs: [{ name: 'V', type: 'vector' }],
  compute: a => ({ V: { x: a.P.x, y: a.P.y } })
});

defNode('vec/vec2pt', {
  title: 'Vector 2Pt', cat: 'Vector', desc: 'Vector from point A to point B (optionally unitized)',
  inputs: [{ name: 'A', type: 'point', default: { x: 0, y: 0 } }, { name: 'B', type: 'point', default: { x: 100, y: 0 } }, { name: 'U', type: 'bool', default: false, label: 'unitize' }],
  outputs: [{ name: 'V', type: 'vector' }, { name: 'L', type: 'number', label: 'length' }],
  compute: a => {
    let x = a.B.x - a.A.x, y = a.B.y - a.A.y;
    const L = Math.hypot(x, y);
    if (a.U && L > 0) { x /= L; y /= L; }
    return { V: { x, y }, L };
  }
});

defNode('vec/amp', {
  title: 'Amplitude', cat: 'Vector', desc: 'Scale vector V to length A',
  inputs: [{ name: 'V', type: 'vector', default: { x: 1, y: 0 } }, { name: 'A', type: 'number', default: 1, label: 'length' }],
  outputs: [{ name: 'V', type: 'vector' }],
  compute: a => {
    const L = Math.hypot(a.V.x, a.V.y);
    if (L === 0) return { V: { x: 0, y: 0 } };
    return { V: { x: a.V.x / L * a.A, y: a.V.y / L * a.A } };
  }
});

defNode('vec/unit', {
  title: 'Unit Vector', cat: 'Vector', desc: 'Normalize V to length 1',
  inputs: [{ name: 'V', type: 'vector', default: { x: 1, y: 0 } }],
  outputs: [{ name: 'V', type: 'vector' }],
  compute: a => {
    const L = Math.hypot(a.V.x, a.V.y);
    return { V: L === 0 ? { x: 0, y: 0 } : { x: a.V.x / L, y: a.V.y / L } };
  }
});

defNode('vec/reverse', {
  title: 'Reverse', cat: 'Vector', desc: 'Flip vector V',
  inputs: [{ name: 'V', type: 'vector', default: { x: 1, y: 0 } }],
  outputs: [{ name: 'V', type: 'vector' }],
  compute: a => ({ V: { x: -a.V.x, y: -a.V.y } })
});

defNode('vec/distance', {
  title: 'Distance', cat: 'Vector', desc: 'Distance between points A and B',
  inputs: [{ name: 'A', type: 'point', default: { x: 0, y: 0 } }, { name: 'B', type: 'point', default: { x: 0, y: 0 } }],
  outputs: [{ name: 'D', type: 'number' }],
  compute: a => ({ D: Math.hypot(a.B.x - a.A.x, a.B.y - a.A.y) })
});

defNode('vec/polar', {
  title: 'Point Polar', cat: 'Vector', desc: 'Point at angle A (radians) and radius R from origin O',
  inputs: [{ name: 'O', type: 'point', default: { x: 0, y: 0 }, label: 'origin' }, { name: 'A', type: 'number', default: 0, label: 'angle (rad)' }, { name: 'R', type: 'number', default: 100, label: 'radius' }],
  outputs: [{ name: 'P', type: 'point' }],
  compute: a => ({ P: { x: a.O.x + Math.cos(a.A) * a.R, y: a.O.y + Math.sin(a.A) * a.R } })
});

defNode('vec/angle', {
  title: 'Angle', cat: 'Vector', desc: 'Angle of the vector from A to B (radians)',
  inputs: [{ name: 'A', type: 'point', default: { x: 0, y: 0 } }, { name: 'B', type: 'point', default: { x: 100, y: 0 } }],
  outputs: [{ name: 'R', type: 'number' }],
  compute: a => ({ R: Math.atan2(a.B.y - a.A.y, a.B.x - a.A.x) })
});

defNode('vec/grid', {
  title: 'Grid', cat: 'Vector', width: 156,
  desc: 'Point lattice filling a W×H region, square or isometric — wire Viewport into W/H for a grid that always fills the canvas',
  inputs: [
    { name: 'P', type: 'point', default: { x: 0, y: 0 }, label: 'centre' },
    { name: 'S', type: 'number', default: 40, label: 'spacing' },
    { name: 'W', type: 'number', default: 800, label: 'region width' },
    { name: 'H', type: 'number', default: 600, label: 'region height' }
  ],
  outputs: [
    { name: 'P', type: 'point' },
    { name: 'C', type: 'number', label: 'column' },
    { name: 'R', type: 'number', label: 'row' },
    { name: 'K', type: 'number', label: 'colour class — 2 square · 3 iso' }
  ],
  defaults: { iso: true },
  compute: (a, ctx, node) => {
    const iso = node.values.iso !== false;
    const s = Math.max(0.5, Math.abs(a.S));
    const vs = iso ? s * 0.8660254037844386 : s;   /* √3/2 → equilateral rows */
    const nx = LM.clamp(Math.floor(Math.abs(a.W) / s) + 2, 1, 1024);
    const ny = LM.clamp(Math.floor(Math.abs(a.H) / vs) + 2, 1, 1024);
    const x0 = a.P.x - (nx - 1) * s / 2, y0 = a.P.y - (ny - 1) * vs / 2;
    const P = [], C = [], R = [], K = [];
    for (let j = 0; j < ny && P.length < 20000; j++) {
      /* iso rows half-stagger; ±s/4 keeps the lattice centred on P */
      const dx = iso ? ((j & 1) ? s / 4 : -s / 4) : 0;
      for (let i = 0; i < nx && P.length < 20000; i++) {
        P.push({ x: x0 + i * s + dx, y: y0 + j * vs });
        C.push(i); R.push(j);
        /* K = the lattice's canonical colouring: the fewest classes such that no
           two neighbours share one. Square needs 2 (checkerboard). Iso needs 3,
           and it is NOT (i % 3) — the half-stagger means you must go through
           axial coords: q = i - floor(j/2), r = j, k = (q + 2r) mod 3. Then each
           point's six neighbours carry the other two classes. Wire K into a phase
           offset and one Circle node gives you the whole three-phase field. */
        K.push(iso ? ((((i - Math.floor(j / 2) + 2 * j) % 3) + 3) % 3) : (i + j) % 2);
      }
    }
    return { P: P, C: C, R: R, K: K };
  },
  buildBody: (node, body, changed) => {
    const seg = _mk('div', 'seg', body);
    [['square', false], ['iso', true]].forEach(m => {
      const b = _mk('div', 'seg-b' + ((node.values.iso !== false) === m[1] ? ' on' : ''), seg);
      b.textContent = m[0];
      _cleanClick(b, () => {
        node.values.iso = m[1];
        seg.querySelectorAll('.seg-b').forEach(e => e.classList.remove('on'));
        b.classList.add('on');
        changed();
      });
    });
  }
});

/* ============================== CURVE ============================== */

defNode('crv/line', {
  title: 'Line', cat: 'Curve', desc: 'Line between two points',
  inputs: [{ name: 'A', type: 'point', default: { x: -100, y: 0 } }, { name: 'B', type: 'point', default: { x: 100, y: 0 } }],
  outputs: [{ name: 'C', type: 'geometry' }],
  compute: a => ({ C: { kind: 'line', a: a.A, b: a.B } })
});

defNode('crv/circle', {
  title: 'Circle', cat: 'Curve', desc: 'Circle at P with radius R',
  inputs: [{ name: 'P', type: 'point', default: { x: 0, y: 0 } }, { name: 'R', type: 'number', default: 60 }],
  outputs: [{ name: 'C', type: 'geometry' }],
  compute: a => ({ C: { kind: 'circle', cx: a.P.x, cy: a.P.y, r: Math.abs(a.R) } })
});

defNode('crv/ellipse', {
  title: 'Ellipse', cat: 'Curve', desc: 'Ellipse at P with radii RX, RY, rotation A',
  inputs: [{ name: 'P', type: 'point', default: { x: 0, y: 0 } }, { name: 'RX', type: 'number', default: 90 }, { name: 'RY', type: 'number', default: 50 }, { name: 'A', type: 'number', default: 0, label: 'rotation (rad)' }],
  outputs: [{ name: 'C', type: 'geometry' }],
  compute: a => ({ C: { kind: 'ellipse', cx: a.P.x, cy: a.P.y, rx: Math.abs(a.RX), ry: Math.abs(a.RY), rot: a.A } })
});

defNode('crv/rect', {
  title: 'Rectangle', cat: 'Curve', desc: 'Rectangle centered at P',
  inputs: [{ name: 'P', type: 'point', default: { x: 0, y: 0 } }, { name: 'W', type: 'number', default: 120 }, { name: 'H', type: 'number', default: 80 }, { name: 'A', type: 'number', default: 0, label: 'rotation (rad)' }],
  outputs: [{ name: 'C', type: 'geometry' }],
  compute: a => ({ C: { kind: 'rect', cx: a.P.x, cy: a.P.y, w: Math.abs(a.W), h: Math.abs(a.H), rot: a.A } })
});

defNode('crv/polygon', {
  title: 'Polygon', cat: 'Curve', desc: 'Regular N-gon at P with circumradius R',
  inputs: [{ name: 'P', type: 'point', default: { x: 0, y: 0 } }, { name: 'R', type: 'number', default: 60 }, { name: 'N', type: 'number', default: 6, label: 'sides' }, { name: 'A', type: 'number', default: 0, label: 'rotation (rad)' }],
  outputs: [{ name: 'C', type: 'geometry' }],
  compute: a => {
    const n = LM.clamp(Math.floor(a.N), 3, 720), pts = [];
    for (let i = 0; i < n; i++) {
      const t = a.A + i / n * LM.TAU;
      pts.push({ x: a.P.x + Math.cos(t) * a.R, y: a.P.y + Math.sin(t) * a.R });
    }
    return { C: { kind: 'poly', pts, closed: true } };
  }
});

defNode('crv/arc', {
  title: 'Arc', cat: 'Curve', desc: 'Arc at P from angle A0 to A1 (radians)',
  inputs: [{ name: 'P', type: 'point', default: { x: 0, y: 0 } }, { name: 'R', type: 'number', default: 60 },
    { name: 'A0', type: 'number', default: 0, label: 'start angle' }, { name: 'A1', type: 'number', default: 3.14159, label: 'end angle' }],
  outputs: [{ name: 'C', type: 'geometry' }],
  compute: a => ({ C: { kind: 'arc', cx: a.P.x, cy: a.P.y, r: Math.abs(a.R), a0: a.A0, a1: a.A1 } })
});

defNode('crv/polyline', {
  title: 'PolyLine', cat: 'Curve', desc: 'Straight segments through points V',
  inputs: [{ name: 'V', type: 'point', label: 'vertices' }, { name: 'C', type: 'bool', default: false, label: 'closed' }],
  outputs: [{ name: 'C', type: 'geometry' }],
  listInputs: ['V'],
  compute: a => ({ C: { kind: 'poly', pts: (a.V || []).filter(p => p && p.x !== undefined), closed: !!a.C } })
});

defNode('crv/interp', {
  title: 'Interpolate', cat: 'Curve', desc: 'Smooth curve through points V',
  inputs: [{ name: 'V', type: 'point', label: 'vertices' }, { name: 'C', type: 'bool', default: false, label: 'closed' }],
  outputs: [{ name: 'C', type: 'geometry' }],
  listInputs: ['V'],
  compute: a => ({ C: { kind: 'spline', pts: (a.V || []).filter(p => p && p.x !== undefined), closed: !!a.C } })
});

defNode('crv/divide', {
  title: 'Divide Curve', cat: 'Curve', desc: 'N division points along curve C (+ their parameters)',
  inputs: [{ name: 'C', type: 'geometry' }, { name: 'N', type: 'number', default: 10, label: 'segments' }],
  outputs: [{ name: 'P', type: 'point' }, { name: 'T', type: 'number', label: 'parameters' }],
  compute: a => {
    if (!a.C) return {};
    const n = LM.clamp(Math.floor(a.N), 1, 5000);
    const closed = LM.isClosedGeom(a.C);
    const count = closed ? n : n + 1;
    const P = [], T = [];
    for (let i = 0; i < count; i++) { const t = i / n; P.push(LM.curvePoint(a.C, t)); T.push(t); }
    return { P, T };
  }
});

defNode('crv/eval', {
  title: 'Evaluate Curve', cat: 'Curve', desc: 'Point on curve C at parameter T (0..1; wraps on closed curves)',
  inputs: [{ name: 'C', type: 'geometry' }, { name: 'T', type: 'number', default: 0.5 }],
  outputs: [{ name: 'P', type: 'point' }],
  compute: a => {
    if (!a.C) return {};
    const t = LM.isClosedGeom(a.C) ? LM.fract(a.T) : LM.clamp(a.T, 0, 1);
    return { P: LM.curvePoint(a.C, t) };
  }
});

/* ============================== TRANSFORM ============================== */

defNode('xf/move', {
  title: 'Move', cat: 'Transform', desc: 'Translate geometry by vector T',
  inputs: [{ name: 'G', type: 'geometry' }, { name: 'T', type: 'vector', default: { x: 0, y: 0 }, label: 'translation vector' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => a.G === undefined ? {} : ({ G: LM.xformGeom(a.G, LM.matMove(a.T.x, a.T.y)) })
});

defNode('xf/rotate', {
  title: 'Rotate', cat: 'Transform', desc: 'Rotate geometry by angle A (radians) around center C',
  inputs: [{ name: 'G', type: 'geometry' }, { name: 'A', type: 'number', default: 0 }, { name: 'C', type: 'point', default: { x: 0, y: 0 }, label: 'center' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => a.G === undefined ? {} : ({ G: LM.xformGeom(a.G, LM.matRot(a.A, a.C)) })
});

defNode('xf/scale', {
  title: 'Scale', cat: 'Transform', desc: 'Scale geometry by factor F around center C',
  inputs: [{ name: 'G', type: 'geometry' }, { name: 'F', type: 'number', default: 1 }, { name: 'C', type: 'point', default: { x: 0, y: 0 }, label: 'center' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => a.G === undefined ? {} : ({ G: LM.xformGeom(a.G, LM.matScale(a.F, a.F, a.C)) })
});

/* ============================== DISPLAY ============================== */

defNode('disp/draw', {
  title: 'Draw', cat: 'Display', desc: 'Render geometry with stroke S, fill F, line width W',
  inputs: [
    { name: 'G', type: 'geometry' },
    { name: 'S', type: 'color', default: { r: 230, g: 237, b: 250, a: 1 }, label: 'stroke' },
    { name: 'F', type: 'color', default: { r: 255, g: 255, b: 255, a: 0 }, label: 'fill' },
    { name: 'W', type: 'number', default: 1.5, label: 'width' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: (a, ctx) => {
    if (a.G === undefined || a.G === null) return {};
    ctx.drawList.push({ geom: a.G, stroke: a.S, fill: a.F, width: a.W });
    return { G: a.G };
  }
});

defNode('disp/text', {
  title: 'Text', cat: 'Display', desc: 'Text geometry at point P — wire into Draw',
  inputs: [{ name: 'T', type: 'string', default: 'weft', label: 'text' }, { name: 'P', type: 'point', default: { x: 0, y: 0 } }, { name: 'S', type: 'number', default: 24, label: 'size' }],
  outputs: [{ name: 'G', type: 'geometry' }],
  compute: a => ({ G: { kind: 'text', text: a.T, x: a.P.x, y: a.P.y, size: a.S } })
});

defNode('disp/hsl', {
  title: 'Colour HSL', cat: 'Display', desc: 'Colour from hue, saturation, lightness (all 0..1; hue wraps)',
  inputs: [{ name: 'H', type: 'number', default: 0.5 }, { name: 'S', type: 'number', default: 0.7 }, { name: 'L', type: 'number', default: 0.6 }, { name: 'A', type: 'number', default: 1 }],
  outputs: [{ name: 'C', type: 'color' }],
  compute: a => ({ C: LM.hslToColor(a.H, a.S, a.L, LM.clamp(a.A, 0, 1)) })
});

defNode('disp/gradient', {
  title: 'Gradient', cat: 'Display', desc: 'Blend colour A → B by T (0..1)',
  inputs: [
    { name: 'T', type: 'number', default: 0.5 },
    { name: 'A', type: 'color', default: { r: 94, g: 234, b: 212, a: 1 } },
    { name: 'B', type: 'color', default: { r: 244, g: 114, b: 182, a: 1 } }],
  outputs: [{ name: 'C', type: 'color' }],
  compute: a => ({ C: LM.mixColor(a.A, a.B, LM.clamp(a.T, 0, 1)) })
});

defNode('disp/bg', {
  title: 'Background', cat: 'Display', desc: 'Set the canvas background colour',
  inputs: [{ name: 'C', type: 'color', default: { r: 11, g: 14, b: 20, a: 1 } }],
  outputs: [],
  compute: (a, ctx) => { ctx.bg = a.C; return {}; }
});

defNode('disp/measure', {
  title: 'Measure Text', cat: 'Display',
  desc: 'Width and height of text T at size S px, plus its bounding rect centred at P — measured by the host with the same font Draw uses',
  inputs: [
    { name: 'T', type: 'string', default: 'weft', label: 'text' },
    { name: 'S', type: 'number', default: 24, label: 'size px' },
    { name: 'P', type: 'point', default: { x: 0, y: 0 }, label: 'rect centre' }],
  outputs: [
    { name: 'W', type: 'number', label: 'width' },
    { name: 'H', type: 'number', label: 'height' },
    { name: 'G', type: 'geometry', label: 'bounding rect' }],
  compute: (a, ctx) => {
    const s = Math.max(0, a.S);
    const t = String(a.T === undefined ? '' : a.T);
    const m = ctx.measureText ? ctx.measureText(t, s) : { w: t.length * s * 0.6, h: s * 1.2 };
    return { W: m.w, H: m.h, G: { kind: 'rect', cx: a.P.x, cy: a.P.y, w: m.w, h: m.h, rot: 0 } };
  }
});

defNode('disp/element', {
  title: 'Element', cat: 'Display', width: 190,
  desc: 'A real DOM element (link, heading, button…) laid over the canvas filling G’s bounds — real focus and semantics; hover / focus / click flow back as data',
  inputs: [
    { name: 'G', type: 'geometry', label: 'placement (fills bounds of G)' },
    { name: 'T', type: 'string', default: 'a', label: 'tag' },
    { name: 'C', type: 'string', default: '', label: 'text content' },
    { name: 'A', type: 'string', default: '', label: 'attributes — k=v, newline or ; separated' }],
  outputs: [
    { name: 'H', type: 'bool', label: 'hovering' },
    { name: 'F', type: 'bool', label: 'focused' },
    { name: 'D', type: 'bool', label: 'held down' },
    { name: 'K', type: 'bool', label: 'clicked (trigger)' }],
  compute: (a, ctx, node) => {
    if (!a.G) return { H: false, F: false, D: false, K: false };
    const b = LM.geomBounds(a.G);
    if (!b) return { H: false, F: false, D: false, K: false };
    const id = node.id + ':' + (ctx.i || 0);
    const attrs = {};
    for (const line of String(a.A || '').split(/[\n;]/)) {
      const m = /^\s*([\w-]+)\s*=\s*(.*)$/.exec(line);
      if (m && !/^on/i.test(m[1]) && !/^\s*javascript:/i.test(m[2])) attrs[m[1]] = m[2].trim();
    }
    if (ctx.domList) ctx.domList.push({
      id, kind: 'element', tag: String(a.T || 'div').toLowerCase(),
      text: String(a.C === undefined ? '' : a.C), attrs, rect: b
    });
    const st = (ctx.domState && ctx.domState[id]) || {};
    const seen = node._seen = node._seen || {};
    const c = st.clicks || 0;
    const prev = (id in seen) ? seen[id] : c;
    seen[id] = c;
    return { H: !!st.hover, F: !!st.focus, D: !!st.down, K: c > prev };
  }
});

/* ============================== STATE ==============================
 * Nodes that remember. Memory lives on node._state keyed by ctx.i (the
 * list-match index) so a list-fed state node is N independent machines.
 * State resets when a graph loads; triggers are frame-latched bools.
 * Design rationale: docs/EVENTS-AND-STATE.md
 */

defNode('state/smooth', {
  title: 'Smooth', cat: 'State', desc: 'Eased follower — glides toward V at speed S (bigger = snappier)',
  inputs: [{ name: 'V', type: 'number', default: 0 }, { name: 'S', type: 'number', default: 8, label: 'speed per s' }],
  outputs: [{ name: 'R', type: 'number' }],
  compute: (a, ctx, node) => {
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { has: false, x: 0 };
    if (!s.has) { s.has = true; s.x = a.V; }
    s.x += (a.V - s.x) * (1 - Math.exp(-Math.max(0, a.S) * (ctx.dt || 0)));
    return { R: s.x };
  }
});

defNode('state/spring', {
  title: 'Spring', cat: 'State', desc: 'Springy follower — overshoots toward V; frequency F (Hz), damping D (1 = no bounce)',
  inputs: [
    { name: 'V', type: 'number', default: 0, label: 'target' },
    { name: 'F', type: 'number', default: 2, label: 'frequency Hz' },
    { name: 'D', type: 'number', default: 0.5, label: 'damping 0..1' }],
  outputs: [{ name: 'R', type: 'number' }, { name: 'V', type: 'number', label: 'velocity' }],
  compute: (a, ctx, node) => {
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { has: false, x: 0, v: 0 };
    if (!s.has) { s.has = true; s.x = a.V; }
    const w = LM.TAU * LM.clamp(a.F, 0.01, 60);
    const dt = ctx.dt || 0;
    const n = Math.max(1, Math.min(16, Math.ceil(dt * w / 0.4)));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      s.v += (w * w * (a.V - s.x) - 2 * Math.max(0, a.D) * w * s.v) * h;
      s.x += s.v * h;
    }
    return { R: s.x, V: s.v };
  }
});

defNode('state/counter', {
  title: 'Counter', cat: 'State', desc: 'Counts triggers: up on U, down on D, back to zero on R',
  inputs: [
    { name: 'U', type: 'bool', default: false, label: 'increment (trigger)' },
    { name: 'D', type: 'bool', default: false, label: 'decrement (trigger)' },
    { name: 'R', type: 'bool', default: false, label: 'reset (trigger)' },
    { name: 'S', type: 'number', default: 1, label: 'step' }],
  outputs: [{ name: 'N', type: 'number' }],
  compute: (a, ctx, node) => {
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { n: 0 };
    if (a.R) s.n = 0;
    else { if (a.U) s.n += a.S; if (a.D) s.n -= a.S; }
    return { N: s.n };
  }
});

defNode('state/latch', {
  title: 'Latch', cat: 'State', desc: 'A switch with memory: each T trigger flips it, R forces it off',
  inputs: [
    { name: 'T', type: 'bool', default: false, label: 'toggle (trigger)' },
    { name: 'R', type: 'bool', default: false, label: 'reset (trigger)' }],
  outputs: [{ name: 'B', type: 'bool' }],
  compute: (a, ctx, node) => {
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { on: false };
    if (a.T) s.on = !s.on;
    if (a.R) s.on = false;
    return { B: s.on };
  }
});

defNode('state/sample', {
  title: 'Sample & Hold', cat: 'State', desc: 'Freezes V: holds the value it had when T last fired (initial value until then)',
  inputs: [{ name: 'V', type: 'any' }, { name: 'T', type: 'bool', default: false, label: 'sample (trigger)' }],
  outputs: [{ name: 'R', type: 'any' }],
  compute: (a, ctx, node) => {
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { has: false, v: undefined };
    if (!s.has || a.T) { s.has = true; s.v = a.V; }
    return { R: s.v };
  }
});

defNode('state/timer', {
  title: 'Timer', cat: 'State', desc: 'Seconds since T last fired — T (re)starts from zero, P stops it',
  inputs: [
    { name: 'T', type: 'bool', default: false, label: 'start / restart (trigger)' },
    { name: 'P', type: 'bool', default: false, label: 'stop (trigger)' }],
  outputs: [{ name: 'S', type: 'number', label: 'seconds' }, { name: 'A', type: 'bool', label: 'running' }],
  compute: (a, ctx, node) => {
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { on: false, el: 0 };
    if (a.T) { s.on = true; s.el = 0; }
    if (a.P) s.on = false;
    if (s.on) s.el += (ctx.dt || 0);
    return { S: s.el, A: s.on };
  }
});

defNode('state/prev', {
  title: 'Previous Value', cat: 'State', desc: 'V from the previous frame (passes V through on the first frame)',
  inputs: [{ name: 'V', type: 'any' }],
  outputs: [{ name: 'P', type: 'any' }],
  compute: (a, ctx, node) => {
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { has: false, v: undefined };
    const out = s.has ? s.v : a.V;
    s.v = a.V; s.has = true;
    return { P: out };
  }
});

defNode('state/delay', {
  title: 'Delay', cat: 'State', feedback: true,
  desc: 'V from the previous frame — contributes no edge to the evaluation order, so wiring through it makes a feedback loop legal (layout → hover → layout)',
  inputs: [
    { name: 'V', type: 'any' },
    { name: 'I', type: 'any', default: 0, label: 'initial value (first frame)' }],
  outputs: [{ name: 'V', type: 'any', label: 'V last frame' }],
  listInputs: ['V', 'I'],
  compute: (a, ctx, node) => {
    const p = node._fbIns;
    if (p && p.V && p.V.length) return { V: p.V };
    return { V: (a.I && a.I.length) ? a.I : [] };
  }
});

defNode('state/edge', {
  title: 'Edge', cat: 'State', desc: 'Turns a continuous bool into triggers: R fires when B rises, F when it falls',
  inputs: [{ name: 'B', type: 'bool', default: false }],
  outputs: [{ name: 'R', type: 'bool', label: 'rose (trigger)' }, { name: 'F', type: 'bool', label: 'fell (trigger)' }],
  compute: (a, ctx, node) => {
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { has: false, b: false };
    const rose = s.has && a.B && !s.b;
    const fell = s.has && !a.B && s.b;
    s.b = a.B; s.has = true;
    return { R: rose, F: fell };
  }
});

/* ============================== META ==============================
 * Composition. A cluster is a subgraph folded into one node: its inner graph
 * lives in values.graph, its ports in values.ins / values.outs (def.dynamic —
 * the engine reads ports from the node). Port In / Port Out nodes mark the
 * boundary inside; the cluster's compute evaluates the inner graph with the
 * same LM through ctx.defs (supplied by both hosts). Nestable by construction.
 */

defNode('meta/cluster', {
  title: 'Cluster', cat: 'Meta', dynamic: true, hidden: true,
  desc: 'A subgraph folded into one node — select nodes and choose “Collapse to cluster”; its ports are the wires that crossed the selection edge',
  inputs: [], outputs: [],
  defaults: { title: 'cluster', ins: [], outs: [], graph: { nodes: [], wires: [] } },
  compute: (a, ctx, node) => {
    const v = node.values || {};
    if (!node._sub) node._sub = JSON.parse(JSON.stringify(v.graph || { nodes: [], wires: [] }));
    if (!ctx.defs) return {};
    const c2 = {
      t: ctx.t, dt: ctx.dt, frame: ctx.frame, mouse: ctx.mouse, keys: ctx.keys, scroll: ctx.scroll,
      W: ctx.W, H: ctx.H, measureText: ctx.measureText, defs: ctx.defs,
      drawList: ctx.drawList, domList: ctx.domList, domState: ctx.domState,
      bg: null, errors: {}, out: {}, clusterIns: a, clusterOuts: {}
    };
    LM.evaluateGraph(node._sub, ctx.defs, c2);
    if (c2.bg) ctx.bg = c2.bg;
    for (const k in c2.errors) throw new Error('inside ' + k + ': ' + c2.errors[k]);
    const r = {};
    for (const o of v.outs || []) r[o.name] = c2.clusterOuts[o.name] || [];
    return r;
  }
});

defNode('meta/portin', {
  title: 'Port In', cat: 'Meta', hidden: true,
  desc: 'Inside a cluster: emits whatever list arrives at the cluster input port it is named after',
  inputs: [], outputs: [{ name: 'V', type: 'any' }],
  defaults: { port: 'A' },
  compute: (a, ctx, node) => ({ V: (ctx.clusterIns && ctx.clusterIns[node.values.port]) || [] })
});

defNode('meta/portout', {
  title: 'Port Out', cat: 'Meta', hidden: true,
  desc: 'Inside a cluster: whatever arrives here leaves the cluster through the output port it is named after',
  inputs: [{ name: 'V', type: 'any' }], outputs: [],
  listInputs: ['V'],
  defaults: { port: 'A' },
  compute: (a, ctx, node) => { if (ctx.clusterOuts) ctx.clusterOuts[node.values.port] = a.V || []; return {}; }
});

/* ---- palette grouping (cluster related nodes) + compact styling ---- */
(function () {
  const groups = {
    /* Input: 1 ambient (time/mouse/viewport) · 2 interaction */
    'input/time': 1, 'input/mouse': 1, 'input/viewport': 1,
    'input/hotspot': 2, 'input/button': 2, 'input/keyboard': 2, 'input/scroll': 2,
    /* State: 1 motion (followers) · 2 memory · 3 time/triggers */
    'state/smooth': 1, 'state/spring': 1,
    'state/counter': 2, 'state/latch': 2, 'state/sample': 2, 'state/prev': 2, 'state/delay': 2,
    'state/timer': 3, 'state/edge': 3,
    /* Maths: 1 arithmetic · 2 trig · 3 rounding/limits · 4 mapping · 5 constants · 6 logic */
    'math/add': 1, 'math/sub': 1, 'math/mul': 1, 'math/div': 1, 'math/mod': 1, 'math/pow': 1, 'math/sqrt': 1, 'math/masadd': 1,
    'math/sin': 2, 'math/cos': 2, 'math/tan': 2, 'math/atan2': 2, 'math/rad': 2, 'math/deg': 2,
    'math/neg': 3, 'math/abs': 3, 'math/round': 3, 'math/floor': 3, 'math/ceil': 3, 'math/min': 3, 'math/max': 3,
    'math/remap': 4, 'math/clamp': 4, 'math/lerp': 4, 'math/smooth': 4, 'math/expr': 4, 'math/noise': 4,
    'math/pi': 5, 'math/phi': 5,
    'math/cmp': 6, 'math/logic': 6,
    /* Params: 0 pass-through containers · 1 values · 2 canvas objects · 3 inspection */
    'params/number': 0, 'params/point': 0, 'params/vector': 0, 'params/curve': 0,
    'params/slider': 1, 'params/toggle': 1, 'params/swatch': 1, 'params/textlist': 1,
    'params/anchor': 2,
    'params/panel': 3,
    /* Sets: 1 generators · 2 access · 3 list surgery · 4 set operations */
    'sets/series': 1, 'sets/range': 1, 'sets/random': 1,
    'sets/item': 2, 'sets/length': 2,
    'sets/merge': 3, 'sets/reverse': 3, 'sets/cullpat': 3, 'sets/shift': 3, 'sets/dispatch': 3, 'sets/select': 3,
    'sets/union': 4, 'sets/intersection': 4, 'sets/difference': 4,
    /* Vector: 1 points · 2 vectors · 3 measures */
    'vec/construct': 1, 'vec/deconstruct': 1, 'vec/polar': 1,
    'vec/vecxy': 2, 'vec/pt2vec': 2, 'vec/vec2pt': 2, 'vec/amp': 2, 'vec/unit': 2, 'vec/reverse': 2,
    'vec/distance': 3, 'vec/angle': 3,
    /* Curve: 1 primitives · 2 from points · 3 operations */
    'crv/line': 1, 'crv/circle': 1, 'crv/ellipse': 1, 'crv/rect': 1, 'crv/polygon': 1, 'crv/arc': 1,
    'crv/polyline': 2, 'crv/interp': 2,
    'crv/divide': 3, 'crv/eval': 3
  };
  for (const id in groups) if (NODE_DEFS[id]) NODE_DEFS[id].grp = groups[id];
  const compact = ['math/neg', 'math/abs', 'math/round', 'math/floor', 'math/ceil', 'math/sqrt',
    'math/sin', 'math/cos', 'math/tan', 'math/rad', 'math/deg', 'math/pi', 'math/phi'];
  for (const id of compact) if (NODE_DEFS[id]) NODE_DEFS[id].compact = true;
})();
