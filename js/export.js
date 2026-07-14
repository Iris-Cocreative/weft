'use strict';
/*
 * Weft exporter — compiles the current graph into a standalone vanilla JS file.
 * The runtime (LM) and each used node's compute function are serialized with
 * Function.prototype.toString(), so the export carries exactly the code it
 * needs and nothing else. No editor, no dependencies.
 */
const WeftExport = (() => {

  function serializeLM() {
    const parts = Object.keys(LM).map(k => {
      const v = LM[k];
      return '  ' + k + ': ' + (typeof v === 'function' ? v.toString() : JSON.stringify(v));
    });
    return '{\n' + parts.join(',\n') + '\n}';
  }

  /* used node types, walking into cluster subgraphs (values.graph) recursively */
  function collectTypes(graph, set) {
    set = set || new Set();
    for (const n of graph.nodes || []) {
      set.add(n.type);
      if (n.values && n.values.graph && Array.isArray(n.values.graph.nodes)) collectTypes(n.values.graph, set);
    }
    return set;
  }

  function serializeDefs(graph) {
    const used = [...collectTypes(graph)].filter(t => NODE_DEFS[t]);
    const parts = used.map(t => {
      const d = NODE_DEFS[t];
      return '  ' + JSON.stringify(t) + ': {\n' +
        '    inputs: ' + JSON.stringify(d.inputs || []) + ',\n' +
        '    outputs: ' + JSON.stringify(d.outputs || []) + ',\n' +
        '    listInputs: ' + JSON.stringify(d.listInputs || []) + ',\n' +
        (d.dynamic ? '    dynamic: true,\n' : '') +
        (d.feedback ? '    feedback: true,\n' : '') +
        '    compute: ' + d.compute.toString() + '\n  }';
    });
    return '{\n' + parts.join(',\n') + '\n}';
  }

  function serializeGraph(graph) {
    return JSON.stringify({
      nodes: graph.nodes.map(n => {
        const o = { id: n.id, type: n.type, values: n.values || {} };
        if (n.enabled === false) o.enabled = false;
        return o;
      }),
      wires: graph.wires.map(w => ({ from: w.from, to: w.to }))
    });
  }

  function buildJS(graph) {
    return `/* Exported from Weft — a parametric web experience.
 * Attaches to <canvas data-weft> if present, otherwise creates a
 * full-window background canvas. Coordinates are centered: (0,0) is
 * the middle of the canvas. */
(function () {
'use strict';
const GRAPH = ${serializeGraph(graph)};
const DEFS = ${serializeDefs(graph)};
const LM = ${serializeLM()};

function mount(canvas) {
  const g2 = canvas.getContext('2d');
  const mouse = { x: 0, y: 0, nx: 0.5, ny: 0.5, down: false, pressed: false, released: false };
  let mx = null, my = null, frame = 0;
  let pressedBuf = false, releasedBuf = false;
  window.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
  window.addEventListener('pointerdown', e => { mx = e.clientX; my = e.clientY; mouse.down = true; pressedBuf = true; });
  window.addEventListener('pointerup', () => { if (mouse.down) releasedBuf = true; mouse.down = false; });

  const kDown = {};
  let kPressed = {}, kReleased = {};
  const keyName = e => e.key === ' ' ? 'space' : e.key.toLowerCase();
  window.addEventListener('keydown', e => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const k = keyName(e);
    if (!kDown[k]) kPressed[k] = true;
    kDown[k] = true;
  });
  window.addEventListener('keyup', e => { const k = keyName(e); if (kDown[k]) kReleased[k] = true; delete kDown[k]; });
  window.addEventListener('blur', () => { for (const k in kDown) delete kDown[k]; });

  const scroll = { y: 0, max: 0, v: 0 };
  let scrollLastY = window.scrollY || 0;

  /* text measurement — same contract as the editor host (invariant #8) */
  const mCanvas = document.createElement('canvas');
  const mg = mCanvas.getContext('2d');
  const measureText = (text, size) => {
    mg.font = size + 'px Inter, system-ui, sans-serif';
    return { w: mg.measureText(String(text)).width, h: size * 1.2 };
  };

  /* real DOM elements declared by nodes (Button / Element) — reconciled every frame */
  const domState = {}, domEls = {};
  const domLayer = document.createElement('div');
  domLayer.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;overflow:visible;z-index:10;';
  document.body.appendChild(domLayer);
  const style = document.createElement('style');
  style.textContent = '.weft-btn{position:absolute;transform:translate(-50%,-50%);background:rgba(16,21,31,0.88);color:#e6edfa;border:1px solid rgba(94,234,212,0.55);border-radius:999px;padding:7px 16px;font:500 13px Inter,system-ui,sans-serif;cursor:pointer;user-select:none;}.weft-btn:hover{border-color:#5eead4;}.weft-btn:active{transform:translate(-50%,-50%) scale(0.96);background:rgba(94,234,212,0.18);}'
    + '.weft-el{position:absolute;box-sizing:border-box;display:flex;align-items:center;justify-content:center;margin:0;color:inherit;text-decoration:none;background:transparent;border:0;font:inherit;user-select:none;}.weft-el:focus-visible{outline:2px solid #5eead4;outline-offset:2px;border-radius:6px;}';
  document.head.appendChild(style);
  function mkTracked(tag, id) {
    const el = document.createElement(tag);
    const st = domState[id] = domState[id] || { hover: false, focus: false, down: false, clicks: 0 };
    el.addEventListener('pointerenter', () => { st.hover = true; });
    el.addEventListener('pointerleave', () => { st.hover = false; st.down = false; });
    el.addEventListener('pointerdown', () => { st.down = true; });
    el.addEventListener('pointerup', () => { st.down = false; });
    el.addEventListener('focus', () => { st.focus = true; });
    el.addEventListener('blur', () => { st.focus = false; });
    el.addEventListener('click', e => {
      st.clicks++;
      const href = el.getAttribute && el.getAttribute('href');
      if (tag === 'a' && (!href || href === '#')) e.preventDefault();
    });
    domLayer.appendChild(el);
    domEls[id] = el;
    return el;
  }
  const safeTag = t => /^[a-z][a-z0-9]*$/.test(t) && t !== 'script' && t !== 'style' && t !== 'iframe' ? t : 'div';
  function syncDom(list, rect) {
    domLayer.style.left = (rect.left + rect.width / 2) + 'px';
    domLayer.style.top = (rect.top + rect.height / 2) + 'px';
    const seen = {};
    for (const d of list) {
      if (!d) continue;
      if (d.kind === 'button') {
        seen[d.id] = true;
        let el = domEls[d.id];
        if (!el) { el = mkTracked('button', d.id); el.type = 'button'; el.className = 'weft-btn'; }
        const label = String(d.label === undefined ? '' : d.label);
        if (el.textContent !== label) el.textContent = label;
        el.style.left = (d.x || 0) + 'px';
        el.style.top = (d.y || 0) + 'px';
      } else if (d.kind === 'element') {
        seen[d.id] = true;
        const tag = safeTag(d.tag || 'div');
        let el = domEls[d.id];
        if (el && el._weftTag !== tag) { el.remove(); delete domEls[d.id]; el = null; }
        if (!el) { el = mkTracked(tag, d.id); el._weftTag = tag; el.className = 'weft-el'; }
        const text = d.text || '';
        if (el.textContent !== text) el.textContent = text;
        const want = d.attrs || {}, have = el._weftAttrs || {};
        for (const k in want) if (have[k] !== want[k]) { try { el.setAttribute(k, want[k]); } catch (e) { /* bad attr name */ } }
        for (const k in have) if (!(k in want)) el.removeAttribute(k);
        el._weftAttrs = Object.assign({}, want);
        const r = d.rect || { x: 0, y: 0, w: 10, h: 10 };
        el.style.left = r.x + 'px';
        el.style.top = r.y + 'px';
        el.style.width = Math.max(0, r.w) + 'px';
        el.style.height = Math.max(0, r.h) + 'px';
      }
    }
    for (const id in domEls) {
      if (!seen[id]) { domEls[id].remove(); delete domEls[id]; delete domState[id]; }
    }
  }

  const t0 = performance.now();
  let last = t0;

  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = window.devicePixelRatio || 1;
    const pw = Math.round(rect.width * dpr), ph = Math.round(rect.height * dpr);
    if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
    if (mx !== null) {
      mouse.x = mx - rect.left - rect.width / 2;
      mouse.y = my - rect.top - rect.height / 2;
      mouse.nx = (mx - rect.left) / rect.width;
      mouse.ny = (my - rect.top) / rect.height;
    }
    mouse.pressed = pressedBuf; mouse.released = releasedBuf;
    pressedBuf = releasedBuf = false;
    const keys = { down: kDown, pressed: kPressed, released: kReleased };
    kPressed = {}; kReleased = {};
    scroll.y = window.scrollY || document.documentElement.scrollTop || 0;
    scroll.max = Math.max(0, (document.documentElement.scrollHeight || 0) - window.innerHeight);
    scroll.v = scroll.v * 0.8 + ((scroll.y - scrollLastY) / Math.max(dt, 1e-3)) * 0.2;
    scrollLastY = scroll.y;

    const ctx = {
      t: (now - t0) / 1000, dt, frame: frame++, mouse, keys, scroll,
      W: rect.width, H: rect.height, measureText, defs: DEFS,
      drawList: [], domList: [], domState, bg: null, errors: {}, out: {}
    };
    LM.evaluateGraph(GRAPH, DEFS, ctx);
    syncDom(ctx.domList, rect);
    let overHotspot = false;
    for (const n of GRAPH.nodes) {
      if (n.type !== 'input/hotspot' || n.enabled === false) continue;
      const o = ctx.out[n.id];
      if (o && (o.H || []).some(Boolean)) { overHotspot = true; break; }
    }
    canvas.style.cursor = overHotspot ? 'pointer' : '';
    g2.setTransform(dpr, 0, 0, dpr, 0, 0);
    g2.clearRect(0, 0, rect.width, rect.height);
    if (ctx.bg && ctx.bg.a > 0) { g2.fillStyle = LM.colorCss(ctx.bg); g2.fillRect(0, 0, rect.width, rect.height); }
    g2.translate(rect.width / 2, rect.height / 2);
    for (const it of ctx.drawList) LM.drawItem(g2, it);
  }
  requestAnimationFrame(loop);
}

function init() {
  let c = document.querySelector('canvas[data-weft]');
  if (!c) {
    c = document.createElement('canvas');
    c.setAttribute('data-weft', '');
    c.style.position = 'fixed';
    c.style.left = '0'; c.style.top = '0';
    c.style.width = '100vw'; c.style.height = '100vh';
    c.style.zIndex = '-1';
    c.style.pointerEvents = 'none';
    document.body.appendChild(c);
  }
  mount(c);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
`;
  }

  function buildDemoHTML(js, graph) {
    // a scroll-driven patch needs a page that actually scrolls
    const scrolls = graph && graph.nodes.some(n => n.type === 'input/scroll');
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Weft experience</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body { margin: 0; ${scrolls ? 'min-height: 400vh;' : 'height: 100%;'} background: #0b0e14; }
  canvas[data-weft] { position: fixed; inset: 0; width: 100%; height: 100%; }
</style>
</head>
<body>
<canvas data-weft></canvas>
<script>
${js}
</script>
</body>
</html>
`;
  }

  return { buildJS, buildDemoHTML };
})();
