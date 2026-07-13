'use strict';
/* Weft viewport — the live 2D render target. Evaluates the graph every frame. */
const Viewport = {
  playing: true,

  init() {
    const canvas = document.getElementById('view');
    const g2 = canvas.getContext('2d');
    const fpsEl = document.getElementById('fps');

    const mouse = { x: 0, y: 0, nx: 0.5, ny: 0.5, down: false };
    let mx = null, my = null;
    window.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
    canvas.addEventListener('pointerdown', () => { mouse.down = true; });
    window.addEventListener('pointerup', () => { mouse.down = false; });

    let t = 0, frame = 0, last = performance.now(), fpsA = 60, lastFps = 0;

    const loop = now => {
      requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (Viewport.playing) t += dt;

      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      const pw = Math.round(rect.width * dpr), ph = Math.round(rect.height * dpr);
      if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }

      if (mx !== null) {
        mouse.x = mx - rect.left - rect.width / 2;
        mouse.y = my - rect.top - rect.height / 2;
        mouse.nx = (mx - rect.left) / rect.width;
        mouse.ny = (my - rect.top) / rect.height;
      }

      const ctx = { t, frame: frame++, mouse, W: rect.width, H: rect.height, drawList: [], bg: null, errors: {}, out: {} };
      try { LM.evaluateGraph(App.graph, NODE_DEFS, ctx); } catch (e) { /* keep rendering */ }

      g2.setTransform(dpr, 0, 0, dpr, 0, 0);
      g2.fillStyle = ctx.bg ? LM.colorCss(ctx.bg) : '#0b0e14';
      g2.fillRect(0, 0, rect.width, rect.height);
      g2.save();
      g2.translate(rect.width / 2, rect.height / 2);
      for (const it of ctx.drawList) {
        try { LM.drawItem(g2, it); } catch (e) { /* skip bad item */ }
      }
      g2.restore();

      Editor.postEval(ctx);

      fpsA = fpsA * 0.95 + (1 / Math.max(dt, 1e-3)) * 0.05;
      if (now - lastFps > 500) { fpsEl.textContent = Math.round(fpsA) + ' fps'; lastFps = now; }
    };
    requestAnimationFrame(loop);
  }
};
