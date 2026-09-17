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
 * Nothing here runs unless configured: the webhook URL + shared key live only
 * in this browser's localStorage ('weft:assistant'), never in the repo, so the
 * public deploy ships the panel dormant.
 */
const Assistant = {
  turns: [], // {role:'user'|'assistant', text} — session memory, sent as history
  busy: false,

  cfg() {
    try { return JSON.parse(localStorage.getItem('weft:assistant')) || {}; }
    catch (e) { return {}; }
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
    if (!cfg.url) { Assistant.showSetup(true); return; }
    Assistant.busy = true;
    Assistant.paintBusy();
    Assistant.bubble('user', message);
    Assistant.turns.push({ role: 'user', text: message });

    const errors = {};
    for (const id in (Viewport.lastErrors || {})) if (Viewport.lastErrors[id]) errors[id] = Viewport.lastErrors[id];
    const payload = {
      message,
      graph: App.serialize(),
      selection: Array.from(Editor.selectedIds()),
      errors,
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
          Assistant.bubble('note', '✦ woven: ' + r.summary + ' — Ctrl+Z undoes');
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

  paintBusy() {
    Assistant.el.classList.toggle('busy', Assistant.busy);
    Assistant.el.querySelector('.as-send').disabled = Assistant.busy;
  },

  showSetup(show) {
    const s = Assistant.el.querySelector('.as-setup');
    s.classList.toggle('hidden', !show);
    if (show) {
      const cfg = Assistant.cfg();
      s.querySelector('.as-url').value = cfg.url || '';
      s.querySelector('.as-key').value = cfg.key || '';
    }
  },

  toggle(show) {
    const want = show === undefined ? Assistant.el.classList.contains('hidden') : show;
    Assistant.el.classList.toggle('hidden', !want);
    if (want) {
      if (!Assistant.cfg().url) Assistant.showSetup(true);
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
        <button class="as-gear" title="connection settings">⚙</button>
        <button class="as-x" title="close">✕</button>
      </div>
      <div class="as-setup hidden">
        <p>point me at your n8n webhook — the url and key live only in this browser (see docs/ASSISTANT.md to set the workflow up).</p>
        <input class="as-url" placeholder="webhook url (https://…)" spellcheck="false">
        <input class="as-key" type="password" placeholder="shared key" spellcheck="false">
        <div class="as-setrow">
          <button class="as-save accent">save</button>
          <button class="as-forget" title="remove the saved url + key from this browser">forget</button>
        </div>
      </div>
      <div class="as-msgs"></div>
      <div class="as-foot">
        <label class="as-snap"><input type="checkbox" checked> let it see the cloth (small snapshot)</label>
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
    const fire = () => {
      const msg = input.value.trim();
      if (!msg || Assistant.busy) return;
      input.value = '';
      Assistant.send(msg);
    };
    panel.querySelector('.as-send').addEventListener('click', fire);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fire(); }
    });
    panel.querySelector('.as-x').addEventListener('click', () => Assistant.toggle(false));
    panel.querySelector('.as-gear').addEventListener('click', () => {
      Assistant.showSetup(panel.querySelector('.as-setup').classList.contains('hidden'));
    });
    panel.querySelector('.as-save').addEventListener('click', () => {
      const url = panel.querySelector('.as-url').value.trim();
      const key = panel.querySelector('.as-key').value.trim();
      if (!/^https:\/\//.test(url)) { App.flash('the webhook url needs to start with https://'); return; }
      Assistant.saveCfg({ url, key });
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
