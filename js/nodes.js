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
  Vector: '#7cbe25', Curve: '#fbac00', Transform: '#ff6767', Display: '#f009fc', Meta: '#8494ad',
  Audio: '#ff36a3' /* signal pink — the open slot on the wheel, far from number-blue wires */
};
const TYPE_COLORS = {
  number: '#3e9aff', bool: '#ff3b41', string: '#fbbb00', point: '#fb6c09',
  vector: '#8cff14', color: '#d730f8', geometry: '#7057ff', any: '#8ea4c3',
  audio: '#ff36a3'
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
  title: 'Time', cat: 'Input', desc: 'Seconds since start, frame count — P freezes it, R restarts it from zero',
  inputs: [
    { name: 'P', type: 'bool', default: false, label: 'pause' },
    { name: 'R', type: 'bool', default: false, label: 'restart (trigger)' }],
  outputs: [{ name: 'T', type: 'number', label: 'seconds' }, { name: 'F', type: 'number', label: 'frame' }],
  compute: (a, ctx, node) => {
    /* offset/freeze against host time so an untouched Time is exactly ctx.t */
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { off: 0, frozen: null, pr: false };
    if (a.R && !s.pr) { s.off = ctx.t; if (s.frozen !== null) s.frozen = 0; }
    s.pr = !!a.R;
    if (a.P) {
      if (s.frozen === null) s.frozen = ctx.t - s.off;
    } else if (s.frozen !== null) {
      s.off = ctx.t - s.frozen;
      s.frozen = null;
    }
    return { T: s.frozen === null ? ctx.t - s.off : s.frozen, F: ctx.frame };
  },
  buildBody: (node, body, changed) => {
    const seg = _mk('div', 'seg', body);
    const pb = _mk('div', 'seg-b' + (node.values.P ? ' on' : ''), seg);
    pb.textContent = '⏸'; pb.title = 'pause time (wired P overrides)';
    _cleanClick(pb, () => {
      node.values.P = !node.values.P;
      pb.classList.toggle('on', !!node.values.P);
      changed();
    });
    const rb = _mk('div', 'seg-b', seg);
    rb.textContent = '↺'; rb.title = 'restart from zero (wired R overrides)';
    _cleanClick(rb, () => { node.values.R = true; }); // one-frame pulse, cleared in postEval
  },
  postEval: node => { if (node.values.R === true) node.values.R = false; }
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

/* editor-only: live shift state — shift-dragging any slider snaps to integers
 * (guarded so the headless tests, which have no window, still load this file) */
let _weftShift = false;
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', e => { if (e.key === 'Shift') _weftShift = true; });
  window.addEventListener('keyup', e => { if (e.key === 'Shift') _weftShift = false; });
  window.addEventListener('blur', () => { _weftShift = false; });
}

defNode('params/slider', {
  title: 'Number Slider', cat: 'Params', width: 200, bare: true,
  desc: 'Draggable number — shift-drag snaps to integers, double-click for label and rounding options',
  inputs: [], outputs: [{ name: 'N', type: 'number' }],
  defaults: { min: 0, max: 10, value: 5 },
  compute: (a, c, node) => ({ N: node.values.value === undefined ? 0 : node.values.value }),
  buildBody: (node, body, changed) => {
    const v = node.values;
    /* rounding: float (with decimal precision), integer, odd, even */
    const quant = x => {
      const m = v.mode || 'float';
      if (m === 'int') return Math.round(x);
      if (m === 'odd') return 2 * Math.round((x - 1) / 2) + 1;
      if (m === 'even') return 2 * Math.round(x / 2);
      const p = Math.pow(10, v.prec === undefined ? 3 : v.prec);
      return Math.round(x * p) / p;
    };
    const sl = _mk('div', 'sl', body);
    const lab = _mk('div', 'sl-label', sl);
    const mm = _mk('div', 'sl-minmax', sl);
    const mn = _numInput('sl-min', v.min, mm); mn.title = 'min';
    const mx = _numInput('sl-max', v.max, mm); mx.title = 'max';
    const track = _mk('div', 'sl-track', sl);
    const range = _mk('input', 'sl-range', track);
    range.type = 'range'; range.min = v.min; range.max = v.max; range.value = v.value;
    const num = _numInput('sl-val', v.value, sl);
    const paintLabel = () => {
      lab.textContent = v.label || '';
      lab.style.display = v.label ? '' : 'none';
    };
    const step = () => {
      const m = v.mode || 'float';
      range.step = m === 'int' ? 1 : (m === 'odd' || m === 'even') ? 2 : 'any';
    };
    const fill = () => {
      const span = (v.max - v.min) || 1;
      range.style.setProperty('--p', (LM.clamp((v.value - v.min) / span, 0, 1) * 100) + '%');
    };
    paintLabel(); step(); fill();
    const setVal = x => {
      if (!isFinite(x)) x = 0;
      v.value = x; num.value = x;
      if (parseFloat(range.value) !== x) range.value = x;
      fill(); changed();
    };
    range.addEventListener('input', () => setVal(_weftShift ? Math.round(parseFloat(range.value)) : quant(parseFloat(range.value))));
    num.addEventListener('change', () => setVal(quant(parseFloat(num.value) || 0)));
    mn.addEventListener('change', () => { v.min = parseFloat(mn.value) || 0; range.min = v.min; fill(); changed(); });
    mx.addEventListener('change', () => { v.max = parseFloat(mx.value) || 0; range.max = v.max; fill(); changed(); });

    /* double-click → options popover: label, rounding mode, decimal precision */
    sl.addEventListener('dblclick', e => {
      if (e.target.tagName === 'INPUT' && e.target !== range) return; // typing fields keep native dblclick
      e.stopPropagation();
      const nodeEl = body.closest('.node');
      const old = body.querySelector('.sl-opts');
      if (old) { old.remove(); if (nodeEl) nodeEl.style.zIndex = ''; return; }
      const op = _mk('div', 'sl-opts', body);
      if (nodeEl) nodeEl.style.zIndex = 25; // float the popover over neighbouring nodes
      op.addEventListener('pointerdown', ev => ev.stopPropagation());
      op.addEventListener('dblclick', ev => ev.stopPropagation());
      const lrow = _mk('div', 'sl-opt-row', op);
      _mk('span', 'sl-opt-cap', lrow).textContent = 'label';
      const li = _mk('input', '', lrow);
      li.type = 'text'; li.value = v.label || ''; li.spellcheck = false; li.placeholder = 'none';
      li.addEventListener('change', () => { v.label = li.value.trim(); paintLabel(); changed(); });
      const seg = _mk('div', 'seg', op);
      const prow = _mk('div', 'sl-opt-row', op);
      _mk('span', 'sl-opt-cap', prow).textContent = 'decimals';
      const pi = _numInput('', v.prec === undefined ? 3 : v.prec, prow);
      pi.min = 0; pi.max = 6; pi.step = 1;
      pi.addEventListener('change', () => {
        v.prec = LM.clamp(Math.round(parseFloat(pi.value) || 0), 0, 6);
        pi.value = v.prec;
        setVal(quant(v.value));
      });
      const paintPrec = () => { prow.style.display = (v.mode || 'float') === 'float' ? '' : 'none'; };
      [['decimal', 'float'], ['integer', 'int'], ['odd', 'odd'], ['even', 'even']].forEach(m => {
        const b = _mk('div', 'seg-b' + ((v.mode || 'float') === m[1] ? ' on' : ''), seg);
        b.textContent = m[0];
        _cleanClick(b, () => {
          v.mode = m[1];
          seg.querySelectorAll('.seg-b').forEach(x => x.classList.remove('on'));
          b.classList.add('on');
          step(); paintPrec(); setVal(quant(v.value));
        });
      });
      paintPrec();
      const closer = ev => {
        if (op.contains(ev.target)) return;
        op.remove();
        if (nodeEl) nodeEl.style.zIndex = '';
        window.removeEventListener('pointerdown', closer, true);
      };
      window.addEventListener('pointerdown', closer, true);
    });
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
    const paint = () => {
      const a = node.values.a === undefined ? 1 : node.values.a;
      circle.style.background = node.values.hex;
      circle.style.opacity = 0.25 + 0.75 * a;
    };
    paint();
    _cleanClick(circle, () => col.click());
    col.addEventListener('input', () => { node.values.hex = col.value; paint(); changed(); });
  }
});

defNode('params/button', {
  title: 'Button', cat: 'Params', bare: true,
  desc: 'Momentary push button — true while pressed, false again on release (an editor control, like the toggle)',
  inputs: [], outputs: [{ name: 'B', type: 'bool' }],
  compute: (a, c, node) => ({ B: !!node._down }),
  buildBody: (node, body) => {
    const bt = _mk('div', 'pbtn', body);
    bt.title = 'Button — true while pressed';
    _mk('div', 'pbtn-core', bt);
    const up = () => { node._down = false; bt.classList.remove('down'); };
    bt.addEventListener('pointerdown', () => {
      node._down = true;
      bt.classList.add('down');
      window.addEventListener('pointerup', up, { once: true });
    });
  }
});

defNode('params/relay', {
  title: 'Relay', cat: 'Params', relay: true,
  desc: 'Pass-through pill for organising wires — double-click any wire to drop one onto it',
  inputs: [{ name: 'V', type: 'any' }], outputs: [{ name: 'V', type: 'any' }],
  listInputs: ['V'],
  compute: a => ({ V: a.V || [] })
});

defNode('params/graph', {
  title: 'Graph Data', cat: 'Params', width: 200, bare: true,
  desc: 'Plots the data flowing through it — X alone draws the values over an automatic series from 0; X and Y together plot (x,y) points. Range fits the data, or wire two corner points A (min x,y) and B (max x,y) to pin it.',
  inputs: [
    { name: 'X', type: 'number' }, { name: 'Y', type: 'number' },
    { name: 'A', type: 'point', label: 'range corner (min x, min y)' },
    { name: 'B', type: 'point', label: 'range corner (max x, max y)' }],
  outputs: [{ name: 'X', type: 'number' }, { name: 'Y', type: 'number' }],
  listInputs: ['X', 'Y'],
  compute: a => ({ X: a.X || [], Y: a.Y || [] }),
  buildBody: (node, body) => {
    const gp = _mk('div', 'np gph', body);
    const cv = _mk('canvas', 'gph-cv', gp);
    cv.width = 2; cv.height = 2;
  },
  postEval: (node, el) => {
    const cv = el.querySelector('.gph-cv');
    if (!cv) return;
    const ins = (node._last && node._last.ins) || {};
    const X = ins.X || [], Y = ins.Y || [];
    const W = 176, H = 92, dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(W * dpr)) {
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
    }
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    /* both wired → scatter of (x,y); one wired → its values over series 0,1,2… */
    const scatter = X.length && Y.length;
    const ys = scatter ? Y : (X.length ? X : Y);
    const xs = scatter ? X : ys.map((_, i) => i);
    const n = Math.min(xs.length, ys.length, 2000);
    if (!n) {
      g.fillStyle = 'rgba(255,255,255,0.25)';
      g.font = '10px Consolas, ui-monospace, monospace';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('no data', W / 2, H / 2);
      return;
    }
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < n; i++) {
      const x = +xs[i] || 0, y = +ys[i] || 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    /* wired corner points pin the range (steady axes for live data) */
    const cA = (ins.A || [])[0], cB = (ins.B || [])[0];
    if (cA && cB && cA.x !== undefined && cB.x !== undefined) {
      x0 = Math.min(cA.x, cB.x); x1 = Math.max(cA.x, cB.x);
      y0 = Math.min(cA.y, cB.y); y1 = Math.max(cA.y, cB.y);
    }
    if (x1 - x0 < 1e-9) { x0 -= 0.5; x1 += 0.5; }
    if (y1 - y0 < 1e-9) { y0 -= 0.5; y1 += 0.5; }
    const pad = 7;
    const px = x => pad + (x - x0) / (x1 - x0) * (W - pad * 2);
    const py = y => H - pad - (y - y0) / (y1 - y0) * (H - pad * 2);
    /* zero axes, faint, when zero is in range */
    g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1;
    if (y0 < 0 && y1 > 0) { g.beginPath(); g.moveTo(pad, py(0)); g.lineTo(W - pad, py(0)); g.stroke(); }
    if (x0 < 0 && x1 > 0) { g.beginPath(); g.moveTo(px(0), pad); g.lineTo(px(0), H - pad); g.stroke(); }
    g.strokeStyle = '#3e9aff'; g.fillStyle = '#3e9aff'; g.lineWidth = 1.4;
    if (!scatter && n > 1) {
      g.beginPath();
      for (let i = 0; i < n; i++) { const x = px(+xs[i] || 0), y = py(+ys[i] || 0); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    for (let i = 0; i < n; i++) {
      g.beginPath();
      g.arc(px(+xs[i] || 0), py(+ys[i] || 0), scatter ? 2.4 : 1.7, 0, LM.TAU);
      g.fill();
    }
    /* range readout, corners */
    g.fillStyle = 'rgba(255,255,255,0.3)';
    g.font = '8.5px Consolas, ui-monospace, monospace';
    g.textAlign = 'left'; g.textBaseline = 'bottom';
    g.fillText(LM.fmt(y0), 2, H - 1);
    g.textBaseline = 'top';
    g.fillText(LM.fmt(y1), 2, 1);
  }
});

defNode('params/timegraph', {
  title: 'Time Graph', cat: 'Params', width: 200, bare: true,
  desc: 'Seismograph — scrolls the values flowing through it across a rolling time window; each list item is its own coloured line (wire several sources into V for several lines)',
  inputs: [{ name: 'V', type: 'number' }],
  outputs: [{ name: 'V', type: 'number' }],
  listInputs: ['V'],
  compute: a => ({ V: a.V || [] }),
  buildBody: (node, body) => {
    const gp = _mk('div', 'np gph', body);
    const cv = _mk('canvas', 'gph-cv', gp);
    cv.width = 2; cv.height = 2;
  },
  postEval: (node, el, ctx) => {
    const cv = el.querySelector('.gph-cv');
    if (!cv || !ctx) return;
    const SPAN = 6, MAXL = 8; /* seconds visible, max lines */
    const tg = node._tg || (node._tg = { samples: [], t: null });
    /* sample once per play-time tick — paused time freezes the trace */
    if (ctx.t !== tg.t) {
      if (tg.t !== null && ctx.t < tg.t) tg.samples.length = 0; /* time restarted */
      tg.t = ctx.t;
      const V = (node._last && node._last.ins.V) || [];
      tg.samples.push({ t: ctx.t, v: V.slice(0, MAXL).map(x => +x || 0) });
      let drop = 0;
      while (drop < tg.samples.length && tg.samples[drop].t < ctx.t - SPAN) drop++;
      if (drop) tg.samples.splice(0, drop);
    }
    const W = 176, H = 92, dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(W * dpr)) {
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
    }
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const S = tg.samples;
    let y0 = Infinity, y1 = -Infinity, lines = 0;
    for (const s of S) {
      if (s.v.length > lines) lines = s.v.length;
      for (const y of s.v) { if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (!lines) {
      g.fillStyle = 'rgba(255,255,255,0.25)';
      g.font = '10px Consolas, ui-monospace, monospace';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('no data', W / 2, H / 2);
      return;
    }
    if (y1 - y0 < 1e-9) { y0 -= 0.5; y1 += 0.5; }
    const pad = 7, t0 = tg.t - SPAN;
    const px = t => pad + (t - t0) / SPAN * (W - pad * 2);
    const py = y => H - pad - (y - y0) / (y1 - y0) * (H - pad * 2);
    g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1;
    if (y0 < 0 && y1 > 0) { g.beginPath(); g.moveTo(pad, py(0)); g.lineTo(W - pad, py(0)); g.stroke(); }
    const pal = ['#3e9aff', '#5eead4', '#fbbb00', '#fb6c09', '#d730f8', '#8cff14', '#ff3b41', '#8ea4c3'];
    g.lineWidth = 1.4; g.lineJoin = 'round';
    const last = S[S.length - 1];
    for (let k = 0; k < lines; k++) {
      g.strokeStyle = pal[k % pal.length];
      g.beginPath();
      let pen = false; /* v[k] missing (input gone that frame) breaks the line */
      for (const s of S) {
        if (s.v[k] === undefined) { pen = false; continue; }
        const x = px(s.t), y = py(s.v[k]);
        pen ? g.lineTo(x, y) : g.moveTo(x, y);
        pen = true;
      }
      g.stroke();
      if (last.v[k] !== undefined) {
        g.fillStyle = pal[k % pal.length];
        g.beginPath(); g.arc(px(last.t), py(last.v[k]), 2, 0, LM.TAU); g.fill();
      }
    }
    g.fillStyle = 'rgba(255,255,255,0.3)';
    g.font = '8.5px Consolas, ui-monospace, monospace';
    g.textAlign = 'left'; g.textBaseline = 'bottom';
    g.fillText(LM.fmt(y0), 2, H - 1);
    g.textBaseline = 'top';
    g.fillText(LM.fmt(y1), 2, 1);
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

defNode('disp/trace', {
  title: 'Trace', cat: 'Display',
  desc: 'Seismograph on the cloth — streams the values in V away from pen point P; L is the trail length in px (always true px), D sets direction and scroll speed (px/s); each list item is its own line (up to 16), coloured by C, values are px offsets across the trail',
  inputs: [
    { name: 'V', type: 'number', label: 'values (px offset)' },
    { name: 'C', type: 'color', label: 'line colours' },
    { name: 'P', type: 'point', default: { x: 0, y: 0 }, label: 'pen point' },
    { name: 'D', type: 'vector', default: { x: -60, y: 0 }, label: 'direction + speed px/s' },
    { name: 'L', type: 'number', default: 240, label: 'trail length px' },
    { name: 'W', type: 'number', default: 1.5, label: 'width' }],
  outputs: [{ name: 'G', type: 'geometry', label: 'trace curves' }],
  listInputs: ['V', 'C'],
  compute: (a, ctx, node) => {
    /* samples live at fixed px positions along the trail (not timestamps), so
     * the trail is always exactly L px and changing D only changes how fast
     * new values scroll in — it never stretches what was already drawn */
    const pace = Math.hypot(a.D.x, a.D.y);
    const L = Math.max(0, +a.L || 0);
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { t: null, off: 0, samples: [] };
    if (ctx.t !== s.t) {
      if (s.t !== null && ctx.t < s.t) { s.samples.length = 0; s.off = 0; } /* time restarted */
      s.t = ctx.t;
      s.off += pace * (ctx.dt || 0);
      const v = (a.V || []).slice(0, 16).map(x => +x || 0);
      const minGap = Math.max(0.5, L / 3000); /* density cap — high fps refines the newest point instead of flooding */
      const lastP = s.samples.length ? s.samples[s.samples.length - 1].p : -Infinity;
      if (s.off - lastP >= minGap) s.samples.push({ p: s.off, v });
      else if (s.samples.length) s.samples[s.samples.length - 1].v = v;
      let drop = 0;
      while (drop < s.samples.length - 1 && s.off - s.samples[drop].p > L) drop++;
      if (drop) s.samples.splice(0, drop);
      if (s.samples.length > 4000) s.samples.splice(0, s.samples.length - 4000);
    }
    if (pace < 1e-6) return { G: [] };
    const d = { x: a.D.x / pace, y: a.D.y / pace };
    const q = { x: -d.y, y: d.x }; /* across the trail — positive values sit above a left-streaming trace */
    let lines = 0;
    for (const smp of s.samples) if (smp.v.length > lines) lines = smp.v.length;
    const pal = ['#3e9aff', '#5eead4', '#fbbb00', '#fb6c09', '#d730f8', '#8cff14', '#ff3b41', '#8ea4c3'];
    const polys = [];
    for (let k = 0; k < lines; k++) {
      const col = (a.C && a.C.length) ? a.C[k % a.C.length] : LM.hexToColor(pal[k % pal.length]);
      let run = [];
      const flush = () => {
        if (run.length > 1) {
          const g = { kind: 'poly', pts: run, closed: false };
          ctx.drawList.push({ geom: g, stroke: col, fill: { r: 0, g: 0, b: 0, a: 0 }, width: a.W });
          polys.push(g);
        }
        run = [];
      };
      for (const smp of s.samples) {
        if (smp.v[k] === undefined) { flush(); continue; } /* line absent that frame — break the trail */
        const back = s.off - smp.p;
        run.push({ x: a.P.x + d.x * back + q.x * smp.v[k], y: a.P.y + d.y * back + q.y * smp.v[k] });
      }
      flush();
    }
    return { G: polys };
  }
});

defNode('disp/cymatics', {
  title: 'Cymatics', cat: 'Display', width: 168,
  desc: 'Chladni plate — sand grains shake off the vibrating regions and settle along the nodal lines of frequency F, so the figure reorganizes as the pitch changes; drive F from the same value feeding an oscillator',
  inputs: [
    { name: 'F', type: 'number', default: 220, label: 'frequency Hz' },
    { name: 'P', type: 'point', default: { x: 0, y: 0 }, label: 'centre' },
    { name: 'S', type: 'number', default: 320, label: 'plate size px' },
    { name: 'N', type: 'number', default: 900, label: 'grains' },
    { name: 'C', type: 'color', default: { r: 94, g: 234, b: 212, a: 0.85 }, label: 'grain colour' },
    { name: 'W', type: 'number', default: 1, label: 'grain size' }],
  outputs: [{ name: 'P', type: 'point', label: 'grain points' }],
  compute: (a, ctx, node) => {
    const size = Math.max(40, +a.S || 320), h = size / 2;
    const F = LM.clamp(+a.F || 220, 20, 20000);
    const count = LM.clamp(Math.round(+a.N) || 900, 50, 2500);
    const st = node._state = node._state || {};
    const s = st[ctx.i || 0] = st[ctx.i || 0] || { rand: LM.rng(77 + (ctx.i || 0) * 977), pts: null };
    if (!s.pts || s.pts.length !== count) {
      s.pts = [];
      for (let k = 0; k < count; k++) s.pts.push({ x: s.rand() * 2 - 1, y: s.rand() * 2 - 1 });
    }
    /* square-plate standing wave: mode numbers rise with pitch (log), so
     * higher notes make finer figures — grains random-walk scaled by local
     * amplitude and freeze where the plate is still (the nodal lines) */
    const k = Math.log2(F / 32.7);
    const u = 1 + k * 0.9, v = 2 + k * 1.45, PI = Math.PI;
    const amp = (x, y) =>
      Math.cos(u * PI * x) * Math.cos(v * PI * y) - Math.cos(v * PI * x) * Math.cos(u * PI * y);
    const step = 0.09 * Math.min((ctx.dt || 0) * 60, 3);
    if (step > 0) for (const p of s.pts) {
      const j = step * Math.min(1, Math.abs(amp(p.x, p.y)) * 0.6);
      p.x = LM.clamp(p.x + (s.rand() * 2 - 1) * j, -1, 1);
      p.y = LM.clamp(p.y + (s.rand() * 2 - 1) * j, -1, 1);
    }
    const dot = Math.max(0.4, (+a.W || 1) * 0.9);
    const none = { r: 0, g: 0, b: 0, a: 0 };
    const out = [];
    for (const p of s.pts) {
      const x = a.P.x + p.x * h, y = a.P.y + p.y * h;
      out.push({ x, y });
      ctx.drawList.push({ geom: { kind: 'circle', cx: x, cy: y, r: dot }, stroke: none, fill: a.C, width: 0 });
    }
    return { P: out };
  }
});

/* ============================== AUDIO ==============================
 * Sound as dataflow. Audio wires carry HANDLES (descriptor-id strings),
 * never samples: each compute pushes a descriptor onto ctx.audioList and
 * the host (viewport / export mount) reconciles a live Web Audio graph
 * (js/audio.js). Control runs at frame rate (~60Hz) with host-side
 * smoothing — continuous sound, not a sequencer. List matching = voices:
 * 3 frequencies into one Oscillator is 3 oscillators.
 */

defNode('audio/note', {
  title: 'Note', cat: 'Audio', width: 150,
  desc: 'A musical pitch — pick the note on the node or wire N (0–12 semitones above C, 12 rolls into the next octave), set the octave O; F is the frequency in Hz (equal temperament, A4 = the graph tuning, 432 by default), M the MIDI number. A list of octaves is a chord of octaves.',
  inputs: [
    { name: 'N', type: 'number', default: -1, label: 'note 0-12 (-1 = use picker)' },
    { name: 'O', type: 'number', default: 4, label: 'octave' }],
  outputs: [{ name: 'F', type: 'number', label: 'frequency Hz' }, { name: 'M', type: 'number', label: 'midi note' }],
  defaults: { note: 9 }, /* A */
  compute: (a, ctx, node) => {
    const nn = Math.round(+a.N);
    const n = (isFinite(nn) && nn >= 0) ? LM.clamp(nn, 0, 12)
      : LM.clamp(Math.round((node.values && node.values.note) || 0), 0, 11);
    const m = 12 * (LM.clamp(Math.round(+a.O || 0), -1, 9) + 1) + n;
    return { F: (ctx.tuneA4 || 432) * Math.pow(2, (m - 69) / 12), M: m };
  },
  buildBody: (node, body, changed) => {
    const sel = _mk('select', 'aud-sel', body);
    ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].forEach((nm, i) => {
      const o = _mk('option', '', sel);
      o.value = i; o.textContent = nm;
    });
    sel.value = String(node.values.note || 0);
    sel.addEventListener('change', () => { node.values.note = +sel.value; changed(); });
  }
});

defNode('audio/scale', {
  title: 'Scale', cat: 'Audio', width: 168,
  desc: 'Snap a continuous value to the nearest note of a scale — wire anything (mouse, noise, time) into V as a MIDI-ish number and get an in-key frequency out; the difference between a theremin and an instrument',
  inputs: [{ name: 'V', type: 'number', default: 57, label: 'value (midi note, fractional ok)' }],
  outputs: [{ name: 'F', type: 'number', label: 'frequency Hz' }, { name: 'M', type: 'number', label: 'snapped midi' }],
  defaults: { root: 9, scale: 'pentatonic' }, /* A minor pentatonic — hard to sound bad */
  compute: (a, ctx, node) => {
    const scales = {
      major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10],
      pentatonic: [0, 3, 5, 7, 10], chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    };
    const v = node.values || {};
    const set = scales[v.scale] || scales.pentatonic;
    const root = LM.clamp(Math.round(v.root || 0), 0, 11);
    const V = LM.clamp(+a.V || 0, 0, 127);
    const m0 = Math.round(V);
    let best = m0, bd = Infinity;
    for (let m = m0 - 12; m <= m0 + 12; m++) {
      if (set.indexOf(((m - root) % 12 + 12) % 12) < 0) continue;
      const dd = Math.abs(V - m);
      if (dd < bd) { bd = dd; best = m; }
    }
    return { F: (ctx.tuneA4 || 432) * Math.pow(2, (best - 69) / 12), M: best };
  },
  buildBody: (node, body, changed) => {
    const sel = _mk('select', 'aud-sel', body);
    ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].forEach((nm, i) => {
      const o = _mk('option', '', sel);
      o.value = i; o.textContent = nm + ' root';
    });
    sel.value = String(node.values.root || 0);
    sel.addEventListener('change', () => { node.values.root = +sel.value; changed(); });
    const seg = _mk('div', 'seg', body);
    [['major', 'maj'], ['minor', 'min'], ['pentatonic', 'pent'], ['chromatic', 'chr']].forEach(w => {
      const b = _mk('div', 'seg-b' + ((node.values.scale || 'pentatonic') === w[0] ? ' on' : ''), seg);
      b.textContent = w[1]; b.title = w[0];
      _cleanClick(b, () => {
        node.values.scale = w[0];
        seg.querySelectorAll('.seg-b').forEach(e => e.classList.remove('on'));
        b.classList.add('on');
        changed();
      });
    });
  }
});

defNode('audio/osc', {
  title: 'Oscillator', cat: 'Audio', width: 168,
  desc: 'A tone at F Hz — pick the waveform on the node; the output is an audio handle (wire it toward Audio Out), not samples',
  inputs: [
    { name: 'F', type: 'number', default: 220, label: 'frequency Hz' },
    { name: 'D', type: 'number', default: 0, label: 'detune cents' }],
  outputs: [{ name: 'A', type: 'audio', label: 'audio' }],
  defaults: { wave: 'sine' },
  compute: (a, ctx, node) => {
    const id = node.id + ':' + (ctx.i || 0);
    if (ctx.audioList) ctx.audioList.push({
      id, kind: 'osc', wave: (node.values && node.values.wave) || 'sine',
      freq: LM.clamp(+a.F || 0, 0, 20000), detune: LM.clamp(+a.D || 0, -4800, 4800)
    });
    return { A: id };
  },
  buildBody: (node, body, changed) => {
    const seg = _mk('div', 'seg', body);
    [['sine', 'sin'], ['square', 'sqr'], ['sawtooth', 'saw'], ['triangle', 'tri']].forEach(w => {
      const b = _mk('div', 'seg-b' + ((node.values.wave || 'sine') === w[0] ? ' on' : ''), seg);
      b.textContent = w[1]; b.title = w[0];
      _cleanClick(b, () => {
        node.values.wave = w[0];
        seg.querySelectorAll('.seg-b').forEach(e => e.classList.remove('on'));
        b.classList.add('on');
        changed();
      });
    });
  }
});

defNode('audio/noise', {
  title: 'Noise', cat: 'Audio',
  desc: 'White noise source (a shared looped buffer) — an audio handle out',
  inputs: [],
  outputs: [{ name: 'A', type: 'audio', label: 'audio' }],
  compute: (a, ctx, node) => {
    const id = node.id + ':' + (ctx.i || 0);
    if (ctx.audioList) ctx.audioList.push({ id, kind: 'noise' });
    return { A: id };
  }
});

defNode('audio/gain', {
  title: 'Gain', cat: 'Audio',
  desc: 'Scale a signal’s volume — per list item, so a list of voices gets a gain each (host-smoothed, no zipper noise)',
  inputs: [
    { name: 'In', type: 'audio', label: 'audio in' },
    { name: 'G', type: 'number', default: 0.5, label: 'gain 0..1' }],
  outputs: [{ name: 'A', type: 'audio', label: 'audio' }],
  compute: (a, ctx, node) => {
    const id = node.id + ':' + (ctx.i || 0);
    if (ctx.audioList) ctx.audioList.push({
      id, kind: 'gain', gain: LM.clamp(+a.G || 0, 0, 2),
      src: typeof a.In === 'string' ? [a.In] : []
    });
    return { A: id };
  }
});

defNode('audio/filter', {
  title: 'Filter', cat: 'Audio', width: 168,
  desc: 'Biquad filter — pick the mode on the node; cutoff F Hz, resonance Q (per list item)',
  inputs: [
    { name: 'In', type: 'audio', label: 'audio in' },
    { name: 'F', type: 'number', default: 800, label: 'cutoff Hz' },
    { name: 'Q', type: 'number', default: 1, label: 'resonance' }],
  outputs: [{ name: 'A', type: 'audio', label: 'audio' }],
  defaults: { mode: 'lowpass' },
  compute: (a, ctx, node) => {
    const id = node.id + ':' + (ctx.i || 0);
    if (ctx.audioList) ctx.audioList.push({
      id, kind: 'filter', mode: (node.values && node.values.mode) || 'lowpass',
      freq: LM.clamp(+a.F || 0, 10, 20000), q: LM.clamp(+a.Q || 0, 0.0001, 30),
      src: typeof a.In === 'string' ? [a.In] : []
    });
    return { A: id };
  },
  buildBody: (node, body, changed) => {
    const seg = _mk('div', 'seg', body);
    [['lowpass', 'lp'], ['highpass', 'hp'], ['bandpass', 'bp'], ['notch', 'notch']].forEach(w => {
      const b = _mk('div', 'seg-b' + ((node.values.mode || 'lowpass') === w[0] ? ' on' : ''), seg);
      b.textContent = w[1]; b.title = w[0];
      _cleanClick(b, () => {
        node.values.mode = w[0];
        seg.querySelectorAll('.seg-b').forEach(e => e.classList.remove('on'));
        b.classList.add('on');
        changed();
      });
    });
  }
});

defNode('audio/out', {
  title: 'Audio Out', cat: 'Audio',
  desc: 'The speaker — every handle wired in is mixed to the master volume V; sound starts after the first click or keypress (browser rule)',
  inputs: [
    { name: 'In', type: 'audio', label: 'audio in' },
    { name: 'V', type: 'number', default: 0.8, label: 'master volume' }],
  outputs: [],
  listInputs: ['In'],
  compute: (a, ctx, node) => {
    const id = node.id + ':' + (ctx.i || 0);
    if (ctx.audioList) ctx.audioList.push({
      id, kind: 'out', vol: LM.clamp(+a.V || 0, 0, 1),
      src: (a.In || []).filter(h => typeof h === 'string')
    });
    return {};
  }
});

defNode('audio/scope', {
  title: 'Scope', cat: 'Audio', width: 168,
  desc: 'Oscilloscope — taps the audio wire In (an analyser, never routed onward) and draws the actual waveform: T ms of signal, W×H px at P, trigger-locked on a rising zero crossing so the trace holds still. V is the drawn samples, L the RMS level.',
  inputs: [
    { name: 'In', type: 'audio', label: 'audio in' },
    { name: 'P', type: 'point', default: { x: 0, y: 0 }, label: 'centre' },
    { name: 'W', type: 'number', default: 320, label: 'width px' },
    { name: 'H', type: 'number', default: 120, label: 'height px (±1 fills it)' },
    { name: 'T', type: 'number', default: 20, label: 'time window ms' },
    { name: 'C', type: 'color', default: { r: 94, g: 234, b: 212, a: 0.95 }, label: 'beam colour' }],
  outputs: [
    { name: 'G', type: 'geometry', label: 'waveform' },
    { name: 'V', type: 'number', label: 'samples -1..1' },
    { name: 'L', type: 'number', label: 'level 0..1' }],
  compute: (a, ctx, node) => {
    const id = node.id + ':' + (ctx.i || 0);
    if (ctx.audioList) ctx.audioList.push({
      id, kind: 'scope', src: typeof a.In === 'string' ? [a.In] : []
    });
    const W = Math.max(10, +a.W || 320), H = Math.max(2, +a.H || 120);
    const none = { r: 0, g: 0, b: 0, a: 0 };
    const dim = { r: a.C.r, g: a.C.g, b: a.C.b, a: (a.C.a === undefined ? 1 : a.C.a) * 0.22 };
    ctx.drawList.push({ /* the graticule centre line — zero volts */
      geom: { kind: 'line', a: { x: a.P.x - W / 2, y: a.P.y }, b: { x: a.P.x + W / 2, y: a.P.y } },
      stroke: dim, fill: none, width: 1
    });
    const st = (ctx.audioState && ctx.audioState[id]) || {};
    const buf = st.wave;
    if (!buf || !buf.length) { /* no signal yet (or headless) — flat beam */
      const g = { kind: 'line', a: { x: a.P.x - W / 2, y: a.P.y }, b: { x: a.P.x + W / 2, y: a.P.y } };
      ctx.drawList.push({ geom: g, stroke: a.C, fill: none, width: 1.5 });
      return { G: g, V: [], L: 0 };
    }
    /* trigger: sync the left edge to the first rising zero crossing so a
     * periodic wave draws in the same place every frame instead of crawling */
    let t0 = 0;
    const half = buf.length >> 1;
    for (let i = 1; i < half; i++) {
      if (buf[i - 1] <= 0 && buf[i] > 0) { t0 = i; break; }
    }
    const sr = st.sr || 48000;
    const n = Math.max(8, Math.min(buf.length - t0, Math.round(sr * LM.clamp(+a.T || 20, 1, 40) / 1000)));
    const step = Math.max(1, Math.ceil(n / 512)); /* ≤512 beam points */
    const pts = [], out = [];
    let sum = 0;
    for (let i = 0; i < n; i += step) {
      const v = buf[t0 + i] || 0;
      out.push(v); sum += v * v;
      pts.push({ x: a.P.x - W / 2 + (i / (n - 1)) * W, y: a.P.y - v * (H / 2) });
    }
    const g = { kind: 'poly', pts, closed: false };
    ctx.drawList.push({ geom: g, stroke: a.C, fill: none, width: 1.5 });
    return { G: g, V: out, L: Math.min(1, Math.sqrt(sum / out.length) * 1.414) };
  }
});

defNode('audio/xyscope', {
  title: 'Vector Scope', cat: 'Audio', width: 168,
  desc: 'XY oscilloscope — signal X deflects the beam horizontally, Y vertically, plotting sound against sound: harmonic ratios draw Lissajous roses and knots. Taps only (never routed onward); ±1 fills the S×S square at P.',
  inputs: [
    { name: 'X', type: 'audio', label: 'horizontal' },
    { name: 'Y', type: 'audio', label: 'vertical' },
    { name: 'P', type: 'point', default: { x: 0, y: 0 }, label: 'centre' },
    { name: 'S', type: 'number', default: 300, label: 'size px' },
    { name: 'T', type: 'number', default: 30, label: 'time window ms' },
    { name: 'C', type: 'color', default: { r: 94, g: 234, b: 212, a: 0.95 }, label: 'beam colour' }],
  outputs: [
    { name: 'G', type: 'geometry', label: 'figure' },
    { name: 'P', type: 'point', label: 'beam points' }],
  compute: (a, ctx, node) => {
    const id = node.id + ':' + (ctx.i || 0);
    if (ctx.audioList) {
      ctx.audioList.push({ id: id + 'x', kind: 'scope', src: typeof a.X === 'string' ? [a.X] : [] });
      ctx.audioList.push({ id: id + 'y', kind: 'scope', src: typeof a.Y === 'string' ? [a.Y] : [] });
    }
    const S = Math.max(10, +a.S || 300), h = S / 2;
    const none = { r: 0, g: 0, b: 0, a: 0 };
    const dim = { r: a.C.r, g: a.C.g, b: a.C.b, a: (a.C.a === undefined ? 1 : a.C.a) * 0.18 };
    ctx.drawList.push({ /* graticule cross */
      geom: { kind: 'line', a: { x: a.P.x - h, y: a.P.y }, b: { x: a.P.x + h, y: a.P.y } },
      stroke: dim, fill: none, width: 1
    });
    ctx.drawList.push({
      geom: { kind: 'line', a: { x: a.P.x, y: a.P.y - h }, b: { x: a.P.x, y: a.P.y + h } },
      stroke: dim, fill: none, width: 1
    });
    const sx = (ctx.audioState && ctx.audioState[id + 'x']) || {};
    const sy = (ctx.audioState && ctx.audioState[id + 'y']) || {};
    const bx = sx.wave, by = sy.wave;
    if (!bx || !by || !bx.length || !by.length) { /* beam at rest — a dot */
      const g = { kind: 'circle', cx: a.P.x, cy: a.P.y, r: 1.5 };
      ctx.drawList.push({ geom: g, stroke: none, fill: a.C, width: 0 });
      return { G: g, P: [{ x: a.P.x, y: a.P.y }] };
    }
    /* no trigger: a closed Lissajous overlaps itself, so the figure is
     * phase-stable however the window lands */
    const sr = sx.sr || 48000;
    const n = Math.max(8, Math.min(Math.min(bx.length, by.length),
      Math.round(sr * LM.clamp(+a.T || 30, 1, 40) / 1000)));
    const step = Math.max(1, Math.ceil(n / 1024)); /* ≤1024 beam points */
    const pts = [];
    for (let i = 0; i < n; i += step) {
      pts.push({ x: a.P.x + (bx[i] || 0) * h, y: a.P.y - (by[i] || 0) * h });
    }
    const g = { kind: 'poly', pts, closed: false };
    ctx.drawList.push({ geom: g, stroke: a.C, fill: none, width: 1.5 });
    return { G: g, P: pts };
  }
});

defNode('audio/mic', {
  title: 'Mic In', cat: 'Audio',
  desc: 'Microphone loudness as a number — V is the level (RMS, roughly 0..1, boosted by G) for driving visuals; the browser asks permission once, R turns true when the mic is live. Never routed to the speakers.',
  inputs: [{ name: 'G', type: 'number', default: 1, label: 'boost' }],
  outputs: [
    { name: 'V', type: 'number', label: 'level 0..1' },
    { name: 'R', type: 'bool', label: 'mic ready' }],
  compute: (a, ctx, node) => {
    const id = node.id + ':' + (ctx.i || 0);
    if (ctx.audioList) ctx.audioList.push({ id, kind: 'mic' });
    const st = (ctx.audioState && ctx.audioState[id]) || {};
    return { V: LM.clamp((st.level || 0) * Math.max(0, +a.G || 0), 0, 1), R: !!st.ready };
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
      audioList: ctx.audioList, audioState: ctx.audioState, tuneA4: ctx.tuneA4,
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
    'params/number': 0, 'params/point': 0, 'params/vector': 0, 'params/curve': 0, 'params/relay': 0,
    'params/slider': 1, 'params/toggle': 1, 'params/button': 1, 'params/swatch': 1, 'params/textlist': 1,
    'params/anchor': 2,
    'params/panel': 3, 'params/graph': 4, 'params/timegraph': 4,
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
    'crv/divide': 3, 'crv/eval': 3,
    /* Audio: 0 pitch · 1 sources · 2 processors · 3 in/out */
    'audio/note': 0, 'audio/scale': 0,
    'audio/osc': 1, 'audio/noise': 1, 'audio/gain': 2, 'audio/filter': 2,
    'audio/out': 3, 'audio/mic': 3, 'audio/scope': 3, 'audio/xyscope': 3
  };
  for (const id in groups) if (NODE_DEFS[id]) NODE_DEFS[id].grp = groups[id];
  const compact = ['math/neg', 'math/abs', 'math/round', 'math/floor', 'math/ceil', 'math/sqrt',
    'math/sin', 'math/cos', 'math/tan', 'math/rad', 'math/deg', 'math/pi', 'math/phi'];
  for (const id of compact) if (NODE_DEFS[id]) NODE_DEFS[id].compact = true;
})();
