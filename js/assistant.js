'use strict';
/*
 * Weave assistant — a chat panel on the loom that talks to a model through an
 * n8n webhook (see docs/ASSISTANT.md and tools/n8n-weave-assistant.json).
 *
 * The panel sends: the message, the full graph JSON, the selected node ids,
 * current eval errors, recent chat turns, and (optionally) a small JPEG
 * snapshot of the cloth. The model replies with text plus an optional list of
 * graph ops (add / set / delete / wire / unwire / replace) which WeftOps
 * (js/ops.js) validates against NODE_DEFS and applies atomically — one undo
 * step, Ctrl+Z reverts.
 *
 * The public webhook URL is baked in (DEFAULT_URL); the shared key is the
 * gate and lives only in this browser's localStorage ('weft:assistant'),
 * never in the repo. Without a key the panel just shows the setup form.
 */
const Assistant = {
  turns: [], // {role:'user'|'assistant', text} — session memory, sent as history
  busy: false,

  // the public workflow (tools/n8n-weave-assistant-hf.json on IRIS's n8n).
  // Baked in so testers only need the shared key; the ⚙ form still lets
  // anyone point at their own webhook.
  DEFAULT_URL: 'https://cocreative.app.n8n.cloud/webhook/weft-assistant-hf',

  cfg() {
    let c = {};
    try { c = JSON.parse(localStorage.getItem('weft:assistant')) || {}; } catch (e) {}
    if (!c.url) c.url = Assistant.DEFAULT_URL;
    return c;
  },

  saveCfg(c) {
    try { localStorage.setItem('weft:assistant', JSON.stringify(c)); } catch (e) {}
  },

  /* ------------------------------ graph ops ------------------------------
   * WeftOps (js/ops.js) validates and applies against a working copy; only a
   * fully clean op list lands here, as one history step. */

  applyOps(ops) {
    App._flushPending();
    const r = WeftOps.apply(App.serialize(), ops, NODE_DEFS);
    if (r.errors.length || !r.graph) return { applied: 0, errors: r.errors, summary: r.summary };
    r.graph.format = GRAPH_FORMAT;
    App.graph = App.migrate(r.graph);
    Editor.setGraph(App.graph);
    Editor.refitGroups(); // frames were sized without the DOM
    App.onGraphChanged();
    return { applied: ops.length, errors: [], summary: r.summary };
  },

  /* ------------------------------ the wire out ------------------------------ */

  snapshot() {
    try {
      const src = document.getElementById('view');
      if (!src || !src.width || !src.height) return null;
      const scale = Math.min(1, 640 / src.width);
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(src.width * scale));
      c.height = Math.max(1, Math.round(src.height * scale));
      c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.7);
    } catch (e) { return null; }
  },

  async send(message) {
    const cfg = Assistant.cfg();
    if (!cfg.key) { Assistant.showSetup(true); return; }
    Assistant.bubble('user', message);
    Assistant.turns.push({ role: 'user', text: message });
    Assistant.busy = true;
    Assistant.paintBusy();

    const errors = {};
    for (const id in (Viewport.lastErrors || {})) if (Viewport.lastErrors[id]) errors[id] = Viewport.lastErrors[id];
    const payload = {
      message,
      graph: App.serialize(),
      selection: Array.from(Editor.selectedIds()),
      errors,
      tester: cfg.name || '',
      history: Assistant.turns.slice(-13, -1), // the turns before this one
      snapshot: Assistant.el.querySelector('.as-snap input').checked ? Assistant.snapshot() : null
    };

    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 180000);
    try {
      const res = await fetch(cfg.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-weft-key': cfg.key || '' },
        body: JSON.stringify(payload),
        signal: ctl.signal
      });
      if (!res.ok) throw new Error('webhook answered ' + res.status + (res.status === 401 ? ' — check the shared key' : ''));
      const data = await res.json();
      let reply = String(data.reply || data.text || '').trim();
      let ops = Array.isArray(data.ops) ? data.ops : null;
      // belt-and-braces: an ops fence inside the reply text also counts
      if (!ops) { const p = WeftOps.parseReply(reply); reply = p.reply; ops = p.ops; }
      Assistant.turns.push({ role: 'assistant', text: reply });
      Assistant.bubble('assistant', reply || '(no text in the reply)');
      if (ops && ops.length) {
        const r = Assistant.applyOps(ops);
        if (r.errors.length) {
          Assistant.bubble('note error', 'the suggested changes did not apply:\n' + r.errors.join('\n'));
          Assistant.turns.push({ role: 'user', text: '[system] your ops were rejected: ' + r.errors.join('; ') + ' — nothing was applied, please correct and resend.' });
        } else {
          Assistant.bubble('note', '✦ woven: ' + r.summary + (data.model ? ' · ' + data.model : '') + ' — Ctrl+Z undoes');
          App.flash('assistant wove ' + r.summary + ' — Ctrl+Z undoes');
        }
      }
    } catch (e) {
      Assistant.bubble('note error', e.name === 'AbortError' ? 'the webhook took too long (3 min) — is the workflow active?' : String(e.message || e));
    } finally {
      clearTimeout(timer);
      Assistant.busy = false;
      Assistant.paintBusy();
    }
  },

  /* ------------------------------ panel ------------------------------ */

  el: null,

  bubble(kind, text) {
    const msgs = Assistant.el.querySelector('.as-msgs');
    const b = document.createElement('div');
    b.className = 'as-msg ' + kind;
    b.textContent = text;
    msgs.appendChild(b);
    msgs.scrollTop = msgs.scrollHeight;
  },

  /* shed the conversation: the model forgets the chat, not the loom */
  molt() {
    if (Assistant.busy) return;
    Assistant.turns = [];
    Assistant.el.querySelector('.as-msgs').innerHTML = '';
    Assistant.bubble('note', 'molted — fresh chat, same loom');
    Assistant.el.querySelector('.as-in').focus();
  },

  paintBusy() {
    Assistant.el.classList.toggle('busy', Assistant.busy);
    Assistant.el.querySelector('.as-send').disabled = Assistant.busy;
    if (Assistant.busy) Assistant.shuttleStart(); else Assistant.shuttleStop();
  },

  /* the shuttle — while the model works, a weft thread is passed over and
   * under a short run of warp, one pick at a time, in a small canvas bubble
   * at the foot of the chat. Quiet colors, gone the moment the reply lands.
   * Reduced-motion users get one finished pick, still. */
  _shuttle: null,
  shuttleStart() {
    Assistant.shuttleStop();
    const msgs = Assistant.el.querySelector('.as-msgs');
    const b = document.createElement('div');
    b.className = 'as-msg shuttle';
    const W = 132, H = 22, dpr = Math.min(2, window.devicePixelRatio || 1);
    const c = document.createElement('canvas');
    c.width = W * dpr; c.height = H * dpr;
    c.style.width = W + 'px'; c.style.height = H + 'px';
    b.appendChild(c);
    msgs.appendChild(b);
    msgs.scrollTop = msgs.scrollHeight;
    const ctx = c.getContext('2d');
    const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const warp = 14, gap = W / (warp + 1), amp = 5, mid = H / 2;
    const pick = 1.5; // seconds for one pass of the shuttle
    const t0 = performance.now();
    const state = { raf: 0, el: b };
    const draw = now => {
      const t = (now - t0) / 1000;
      const n = Math.floor(t / pick), ph = reduced ? 1 : (t / pick) - n;
      const flip = n % 2 ? -1 : 1;                 // alternate passes go under first
      const head = (flip > 0 ? ph : 1 - ph) * W;   // right on even picks, back on odd
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(130, 141, 163, 0.32)';
      for (let i = 1; i <= warp; i++) { const x = i * gap; ctx.beginPath(); ctx.moveTo(x, 3); ctx.lineTo(x, H - 3); ctx.stroke(); }
      // the previous pick lies finished behind the one being woven
      const thread = (sign, alpha, x0, x1) => {
        if (x1 <= x0) return;
        ctx.strokeStyle = 'rgba(94, 234, 212, ' + alpha + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = x0; x <= x1; x += 1) {
          const y = mid + sign * amp * Math.sin(Math.PI * x / gap);
          x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      };
      if (n > 0 || reduced) thread(-flip, 0.28, 0, W);
      if (flip > 0) thread(flip, 0.85, 0, head); else thread(flip, 0.85, head, W);
      if (!reduced) {
        ctx.fillStyle = 'rgba(94, 234, 212, 0.95)';
        ctx.beginPath(); ctx.arc(head, mid + flip * amp * Math.sin(Math.PI * head / gap), 2, 0, Math.PI * 2); ctx.fill();
        state.raf = requestAnimationFrame(draw);
      }
    };
    state.raf = requestAnimationFrame(draw);
    Assistant._shuttle = state;
  },
  shuttleStop() {
    const s = Assistant._shuttle;
    if (!s) return;
    cancelAnimationFrame(s.raf);
    s.el.remove();
    Assistant._shuttle = null;
  },

  showSetup(show) {
    const s = Assistant.el.querySelector('.as-setup');
    s.classList.toggle('hidden', !show);
    if (show) {
      const cfg = Assistant.cfg();
      s.querySelector('.as-key').value = cfg.key || '';
      s.querySelector('.as-name').value = cfg.name || '';
      s.querySelector('.as-url').value = cfg.url || '';
    }
  },

  toggle(show) {
    const want = show === undefined ? Assistant.el.classList.contains('hidden') : show;
    Assistant.el.classList.toggle('hidden', !want);
    if (want) {
      if (!Assistant.cfg().key) Assistant.showSetup(true);
      else Assistant.el.querySelector('.as-in').focus();
    }
  },

  init() {
    const panel = document.createElement('div');
    panel.id = 'assistant';
    panel.className = 'hidden';
    panel.innerHTML = `
      <div class="as-head">
        <span class="as-title">✦ weave assistant</span>
        <button class="as-molt" title="molt — clear the chat so the next message starts fresh (the graph still travels with it)">molt</button>
        <button class="as-gear" title="connection settings">⚙</button>
        <button class="as-x" title="close">✕</button>
      </div>
      <div class="as-setup hidden">
        <p>enter the shared key to start weaving — it stays in this browser only. add your name if you're testing, so your turns can be told apart in the log.</p>
        <input class="as-key" type="password" placeholder="shared key" spellcheck="false">
        <input class="as-name" placeholder="your name (optional)" spellcheck="false" maxlength="40">
        <details class="as-adv"><summary>own webhook</summary>
          <input class="as-url" placeholder="webhook url (https://…)" spellcheck="false">
        </details>
        <div class="as-setrow">
          <button class="as-save accent">save</button>
          <button class="as-forget" title="remove the saved key (and any custom webhook) from this browser">forget</button>
        </div>
      </div>
      <div class="as-msgs"></div>
      <div class="as-foot">
        <label class="as-snap" title="a 640px JPEG of the cloth, taken as you press send, goes with the message — so the model can judge what you're seeing (color, overlap, 'why does it look like this'), not just the wiring. The graph, selection and errors always go; this is extra. Models that can't see images ignore it."><input type="checkbox" checked> send a snapshot of the render <span class="as-hint">640px still · lets it judge what you see, not just the wiring</span></label>
        <div class="as-inrow">
          <textarea class="as-in" rows="2" placeholder="describe what to weave — selected nodes travel with your message" spellcheck="false"></textarea>
          <button class="as-send" title="send — Enter (Shift+Enter = newline)">➤</button>
        </div>
      </div>`;
    document.getElementById('editor').appendChild(panel);
    Assistant.el = panel;

    // the panel is its own surface: loom gestures (marquee, pan, zoom,
    // quick-add, delete-key) must not fire through it
    for (const ev of ['pointerdown', 'pointerup', 'dblclick', 'wheel', 'keydown', 'contextmenu'])
      panel.addEventListener(ev, e => e.stopPropagation());

    const input = panel.querySelector('.as-in');
    // the box grows with the prompt (to ~9 lines), then scrolls
    const grow = () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 200) + 'px'; };
    input.addEventListener('input', grow);
    const fire = () => {
      const msg = input.value.trim();
      if (!msg || Assistant.busy) return;
      input.value = '';
      grow();
      Assistant.send(msg);
    };
    panel.querySelector('.as-send').addEventListener('click', fire);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fire(); }
    });
    panel.querySelector('.as-x').addEventListener('click', () => Assistant.toggle(false));
    panel.querySelector('.as-molt').addEventListener('click', () => Assistant.molt());
    panel.querySelector('.as-gear').addEventListener('click', () => {
      Assistant.showSetup(panel.querySelector('.as-setup').classList.contains('hidden'));
    });
    panel.querySelector('.as-save').addEventListener('click', () => {
      const url = panel.querySelector('.as-url').value.trim() || Assistant.DEFAULT_URL;
      const key = panel.querySelector('.as-key').value.trim();
      const name = panel.querySelector('.as-name').value.trim();
      if (!key) { App.flash('the shared key is needed to weave'); return; }
      if (!/^https:\/\//.test(url)) { App.flash('the webhook url needs to start with https://'); return; }
      Assistant.saveCfg({ url, key, name });
      Assistant.showSetup(false);
      Assistant.bubble('note', 'connected — this stays in your browser only');
      input.focus();
    });
    panel.querySelector('.as-forget').addEventListener('click', () => {
      try { localStorage.removeItem('weft:assistant'); } catch (e) {}
      Assistant.showSetup(true);
      App.flash('assistant connection forgotten');
    });

    const btn = document.getElementById('btnAssist');
    if (btn) btn.addEventListener('click', () => Assistant.toggle());
  }
};

Assistant.init();
