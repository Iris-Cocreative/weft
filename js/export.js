'use strict';
/*
 * Weft exporter — compiles the current graph into a standalone vanilla JS file.
 * The runtime (LM) and each used node's compute function are serialized with
 * Function.prototype.toString(), so the export carries exactly the code it
 * needs and nothing else. No editor, no dependencies.
 *
 * Three passes keep the output lean and the frame loop cheap:
 *   1. prune — drop nodes that cannot reach a sink (draw / DOM / audio / bg /
 *      hotspot cursor); their wires and defs vanish with them
 *   2. shake — serialize only the LM helpers transitively referenced by the
 *      surviving computes and the mount. A graph with Custom JS keeps the
 *      whole library: its code receives LM and may call anything.
 *   3. gate — omit the input channels (keyboard, scroll, DOM layer, text
 *      measurement, hotspot cursor) that no surviving compute reads
 * Smoke check 23 pins passes 1–2: the exported parts must draw exactly what
 * the editor engine draws.
 */
const WeftExport = (() => {

  /* a node earns its keep by writing to an output channel; everything upstream
   * of one survives, the rest never reached the screen in the first place.
   * The walk lives in the engine (LM.sinkReachable) so the editor can dim
   * with the same set; no extra sink predicate here — exports stay strict. */
  function pruneGraph(graph) {
    const keep = LM.sinkReachable(graph, NODE_DEFS);
    return {
      meta: graph.meta,
      nodes: (graph.nodes || []).filter(n => keep.has(n.id)),
      wires: (graph.wires || []).filter(w => keep.has(w.from[0]) && keep.has(w.to[0]))
    };
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

  /* the evaluator only reads name/type/default off ports — labels are editor UI */
  const slimIn = p => ({ name: p.name, type: p.type, default: p.default });
  const slimOut = p => ({ name: p.name, type: p.type });

  function serializeDefs(types) {
    const used = [...types].filter(t => NODE_DEFS[t]);
    const parts = used.map(t => {
      const d = NODE_DEFS[t];
      return '  ' + JSON.stringify(t) + ': {\n' +
        ((d.inputs || []).length ? '    inputs: ' + JSON.stringify(d.inputs.map(slimIn)) + ',\n' : '') +
        ((d.outputs || []).length ? '    outputs: ' + JSON.stringify(d.outputs.map(slimOut)) + ',\n' : '') +
        ((d.listInputs || []).length ? '    listInputs: ' + JSON.stringify(d.listInputs) + ',\n' : '') +
        (d.dynamic ? '    dynamic: true,\n' : '') +
        (d.feedback ? '    feedback: true,\n' : '') +
        '    compute: ' + d.compute.toString() + '\n  }';
    });
    return '{\n' + parts.join(',\n') + '\n}';
  }

  /* transitive closure of LM.* references in the seed source. Comments naming
   * LM helpers over-include harmlessly; nothing referenced can be missed
   * because runtime code only ever reaches the library as LM.<name> */
  function lmClosure(seedSrc) {
    const need = new Set();
    const scan = src => {
      const re = /\bLM\.([A-Za-z_$][A-Za-z0-9_$]*)/g;
      let m;
      while ((m = re.exec(src))) {
        const k = m[1];
        if (need.has(k) || !(k in LM)) continue;
        need.add(k);
        if (typeof LM[k] === 'function') scan(LM[k].toString());
      }
    };
    scan(seedSrc);
    return need;
  }

  /* need = null serializes the whole library (Custom JS graphs) */
  function serializeLM(need) {
    const parts = Object.keys(LM).filter(k => !need || need.has(k)).map(k => {
      const v = LM[k];
      return '  ' + k + ': ' + (typeof v === 'function' ? v.toString() : JSON.stringify(v));
    });
    return '{\n' + parts.join(',\n') + '\n}';
  }

  /* GRAPH carries only what the evaluator reads: id/type/values (+ enabled:
   * false). Cluster subgraphs are slimmed the same way, recursively. */
  function slimNode(n) {
    const o = { id: n.id, type: n.type, values: slimValues(n.values || {}) };
    if (n.enabled === false) o.enabled = false;
    return o;
  }
  function slimValues(v) {
    if (v.graph && Array.isArray(v.graph.nodes)) {
      v = Object.assign({}, v);
      v.graph = {
        nodes: v.graph.nodes.map(slimNode),
        wires: (v.graph.wires || []).map(w => ({ from: w.from, to: w.to }))
      };
    }
    return v;
  }

  function serializeGraph(graph) {
    return JSON.stringify({
      meta: (graph.meta && graph.meta.tuneA4) ? { tuneA4: graph.meta.tuneA4 } : undefined,
      nodes: graph.nodes.map(slimNode),
      wires: graph.wires.map(w => ({ from: w.from, to: w.to }))
    });
  }

  /* the compiled pieces, exposed so smoke can evaluate them against the live
   * engine (equivalence check) without parsing the assembled file */
  function buildParts(sourceGraph) {
    const graph = pruneGraph(sourceGraph);
    const types = collectTypes(graph);
    const defsJS = serializeDefs(types);
    const hasJs = types.has('meta/js');
    const hasAudio = [...types].some(t => t.indexOf('audio/') === 0);
    const audioJS = hasAudio ? WeftAudio.makeHost.toString() : '';
    const lmJS = serializeLM(hasJs ? null :
      lmClosure(defsJS + ' LM.evaluateGraph LM.colorCss LM.drawItem ' + audioJS));
    return {
      graph, graphJS: serializeGraph(graph), defsJS, lmJS, audioJS, hasAudio,
      gates: {   /* Custom JS receives ctx wholesale, so it may read any channel */
        keys: hasJs || /ctx\.keys/.test(defsJS),
        scroll: hasJs || /ctx\.scroll/.test(defsJS),
        dom: hasJs || /ctx\.dom(List|State)/.test(defsJS),
        measure: hasJs || /measureText/.test(defsJS),
        hotspot: graph.nodes.some(n => n.type === 'input/hotspot')
      }
    };
  }

  function buildJS(sourceGraph) {
    const P = buildParts(sourceGraph);
    const F = P.gates, hasAudio = P.hasAudio;

    const keysSetup = F.keys ? `  const kDown = {};
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
` : `  const keys = { down: {}, pressed: {}, released: {} };
`;

    const scrollSetup = F.scroll ? `  const scroll = { y: 0, max: 0, v: 0 };
  let scrollLastY = window.scrollY || 0;
` : `  const scroll = { y: 0, max: 0, v: 0 };
`;

    const measureSetup = F.measure ? `
  /* text measurement — same contract as the editor host (invariant #8) */
  const mCanvas = document.createElement('canvas');
  const mg = mCanvas.getContext('2d');
  const measureText = (text, size) => {
    mg.font = size + 'px Inter, system-ui, sans-serif';
    return { w: mg.measureText(String(text)).width, h: size * 1.2 };
  };
` : '';

    const domSetup = F.dom ? `
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
` : '';

    const keysFrame = F.keys ? `    const keys = { down: kDown, pressed: kPressed, released: kReleased };
    kPressed = {}; kReleased = {};
` : '';

    const scrollFrame = F.scroll ? `    scroll.y = window.scrollY || document.documentElement.scrollTop || 0;
    scroll.max = Math.max(0, (document.documentElement.scrollHeight || 0) - window.innerHeight);
    scroll.v = scroll.v * 0.8 + ((scroll.y - scrollLastY) / Math.max(dt, 1e-3)) * 0.2;
    scrollLastY = scroll.y;
` : '';

    const hotspotFrame = F.hotspot ? `
    let overHotspot = false;
    for (const n of GRAPH.nodes) {
      if (n.type !== 'input/hotspot' || n.enabled === false) continue;
      const o = ctx.out[n.id];
      if (o && (o.H || []).some(Boolean)) { overHotspot = true; break; }
    }
    canvas.style.cursor = overHotspot ? 'pointer' : '';` : '';

    return `/* Exported from Weft — a parametric web experience.
 * Attaches to <canvas data-weft> if present, otherwise creates a
 * full-window background canvas. Coordinates are centered: (0,0) is
 * the middle of the canvas. */
(function () {
'use strict';
const GRAPH = ${P.graphJS};
const DEFS = ${P.defsJS};
const LM = ${P.lmJS};
${hasAudio ? 'const WeftAudio = { makeHost: ' + P.audioJS + ' };\n' : ''}
function mount(canvas) {
${hasAudio ? '  const audio = WeftAudio.makeHost();\n' : ''}  const g2 = canvas.getContext('2d');
  const mouse = { x: 0, y: 0, nx: 0.5, ny: 0.5, down: false, pressed: false, released: false };
  let mx = null, my = null, frame = 0;
  let pressedBuf = false, releasedBuf = false;
  window.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
  window.addEventListener('pointerdown', e => { mx = e.clientX; my = e.clientY; mouse.down = true; pressedBuf = true; });
  window.addEventListener('pointerup', () => { if (mouse.down) releasedBuf = true; mouse.down = false; });

${keysSetup}
${scrollSetup}${measureSetup}${domSetup}
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
${keysFrame}${scrollFrame}
    const ctx = {
      t: (now - t0) / 1000, dt, frame: frame++, mouse, keys, scroll,
      W: rect.width, H: rect.height, ${F.measure ? 'measureText, ' : ''}defs: DEFS,
      drawList: [], domList: [], audioList: [], ${F.dom ? 'domState' : 'domState: {}'}, bg: null, errors: {}, out: {},
      audioState: ${hasAudio ? 'audio.state()' : '{}'},
      tuneA4: (GRAPH.meta && GRAPH.meta.tuneA4) || 432
    };
    LM.evaluateGraph(GRAPH, DEFS, ctx);
${F.dom ? '    syncDom(ctx.domList, rect);\n' : ''}${hasAudio ? '    audio.sync(ctx.audioList);\n' : ''}${hotspotFrame}
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

  return { buildJS, buildDemoHTML, buildParts };
})();
