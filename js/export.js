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

  function serializeDefs(graph) {
    const used = [...new Set(graph.nodes.map(n => n.type))].filter(t => NODE_DEFS[t]);
    const parts = used.map(t => {
      const d = NODE_DEFS[t];
      return '  ' + JSON.stringify(t) + ': {\n' +
        '    inputs: ' + JSON.stringify(d.inputs || []) + ',\n' +
        '    outputs: ' + JSON.stringify(d.outputs || []) + ',\n' +
        '    listInputs: ' + JSON.stringify(d.listInputs || []) + ',\n' +
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
  const mouse = { x: 0, y: 0, nx: 0.5, ny: 0.5, down: false };
  let mx = null, my = null, frame = 0;
  window.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
  window.addEventListener('pointerdown', () => { mouse.down = true; });
  window.addEventListener('pointerup', () => { mouse.down = false; });
  const t0 = performance.now();

  function loop(now) {
    requestAnimationFrame(loop);
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
    const ctx = { t: (now - t0) / 1000, frame: frame++, mouse, W: rect.width, H: rect.height, drawList: [], bg: null, errors: {}, out: {} };
    LM.evaluateGraph(GRAPH, DEFS, ctx);
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

  function buildDemoHTML(js) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Weft experience</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body { margin: 0; height: 100%; background: #0b0e14; }
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
