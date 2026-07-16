'use strict';
/*
 * Weave assistant — a chat panel on the loom that talks to a model through an
 * n8n webhook (see docs/ASSISTANT.md and tools/n8n-weave-assistant.json).
 *
 * The panel sends: the message, the full graph JSON, the selected node ids,
 * current eval errors, recent chat turns, and (optionally) a small JPEG
 * snapshot of the cloth. The model replies with text plus an optional list of
 * graph ops (add / set / delete / wire / unwire / replace) which are validated
 * against NODE_DEFS and applied atomically — one undo step, Ctrl+Z reverts.
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
   * Ops are validated and applied against a working copy; only a fully clean
   * op list lands. Sequential: later ops see earlier adds. */

  applyOps(ops) {
    if (!Array.isArray(ops) || !ops.length) return { applied: 0, errors: [] };
    App._flushPending();
    // deep copy: serialize() shares values/wire references with the live graph,
    // and a rejected op list must leave the loom untouched
    const g = JSON.parse(JSON.stringify(App.serialize()));
    const errors = [];
    const usedIds = new Set(g.nodes.map(n => n.id));
    const fresh = () => { let i = 1; while (usedIds.has('n' + i)) i++; usedIds.add('n' + i); return 'n' + i; };
    const byId = id => g.nodes.find(n => n.id === id);
    const portSet = (node, dir) => {
      const def = NODE_DEFS[node.type] || {};
      const list = def.dynamic ? ((node.values || {})[dir === 'in' ? 'ins' : 'outs'] || [])
        : (dir === 'in' ? def.inputs : def.outputs) || [];
      return new Set(list.map(p => p.name));
    };
    const checkEnd = (end, dir, label) => {
      if (!Array.isArray(end) || end.length !== 2) { errors.push(label + ': endpoint must be [nodeId, port]'); return false; }
      const n = byId(end[0]);
      if (!n) { errors.push(label + ': no node "' + end[0] + '"'); return false; }
      if (!portSet(n, dir).has(end[1])) { errors.push(label + ': node "' + end[0] + '" (' + n.type + ') has no ' + (dir === 'in' ? 'input' : 'output') + ' "' + end[1] + '"'); return false; }
      return true;
    };
    const needLayout = [];
    let added = 0, changed = 0, removed = 0, wired = 0;

    for (const op of ops) {
      if (!op || typeof op !== 'object') { errors.push('op is not an object'); continue; }

      if (op.op === 'add') {
        const idMap = {};
        for (const src of op.nodes || []) {
          if (!src || !NODE_DEFS[src.type]) { errors.push('add: unknown node type "' + (src && src.type) + '"'); continue; }
          const def = NODE_DEFS[src.type];
          let id = src.id;
          if (!id || usedIds.has(id)) { const nid = fresh(); if (id) idMap[id] = nid; id = nid; }
          else usedIds.add(id);
          const n = {
            id, type: src.type,
            x: Math.round(+src.x || 0), y: Math.round(+src.y || 0),
            values: src.values !== undefined ? JSON.parse(JSON.stringify(src.values))
              : (def.defaults ? JSON.parse(JSON.stringify(def.defaults)) : {})
          };
          if (typeof src.x !== 'number' || typeof src.y !== 'number') needLayout.push(n);
          g.nodes.push(n);
          added++;
        }
        for (const w of op.wires || []) {
          if (!w || !Array.isArray(w.from) || !Array.isArray(w.to)) { errors.push('add: wire needs from + to'); continue; }
          const from = [idMap[w.from[0]] || w.from[0], w.from[1]];
          const to = [idMap[w.to[0]] || w.to[0], w.to[1]];
          if (!checkEnd(from, 'out', 'add wire') || !checkEnd(to, 'in', 'add wire')) continue;
          g.wires.push({ from, to });
          wired++;
        }

      } else if (op.op === 'set') {
        const n = byId(op.id);
        if (!n) { errors.push('set: no node "' + op.id + '"'); continue; }
        if (op.values && typeof op.values === 'object') Object.assign(n.values = n.values || {}, JSON.parse(JSON.stringify(op.values)));
        if (typeof op.x === 'number') n.x = Math.round(op.x);
        if (typeof op.y === 'number') n.y = Math.round(op.y);
        if (typeof op.enabled === 'boolean') n.enabled = op.enabled;
        if (typeof op.preview === 'boolean') n.preview = op.preview;
        changed++;

      } else if (op.op === 'delete') {
        for (const id of op.ids || (op.id ? [op.id] : [])) {
          const i = g.nodes.findIndex(n => n.id === id);
          if (i < 0) { errors.push('delete: no node "' + id + '"'); continue; }
          g.nodes.splice(i, 1);
          g.wires = g.wires.filter(w => w.from[0] !== id && w.to[0] !== id);
          removed++;
        }
        for (const w of op.wires || []) {
          const before = g.wires.length;
          g.wires = g.wires.filter(x => !(x.from[0] === w.from[0] && x.from[1] === w.from[1] && x.to[0] === w.to[0] && x.to[1] === w.to[1]));
          if (g.wires.length === before) errors.push('delete: no wire ' + JSON.stringify(w.from) + ' → ' + JSON.stringify(w.to));
          else removed++;
        }

      } else if (op.op === 'wire') {
        if (!checkEnd(op.from, 'out', 'wire') || !checkEnd(op.to, 'in', 'wire')) continue;
        // dropped wires replace, like the editor — op.stack true to merge instead
        if (!op.stack) g.wires = g.wires.filter(w => !(w.to[0] === op.to[0] && w.to[1] === op.to[1]));
        g.wires.push({ from: op.from.slice(), to: op.to.slice() });
        wired++;

      } else if (op.op === 'unwire') {
        const before = g.wires.length;
        g.wires = g.wires.filter(w => {
          const mf = !op.from || (w.from[0] === op.from[0] && w.from[1] === op.from[1]);
          const mt = !op.to || (w.to[0] === op.to[0] && w.to[1] === op.to[1]);
          return !(mf && mt && (op.from || op.to));
        });
        if (g.wires.length === before) errors.push('unwire: nothing matched');
        else wired++;

      } else if (op.op === 'replace') {
        const ng = op.graph;
        if (!ng || !Array.isArray(ng.nodes) || !Array.isArray(ng.wires)) { errors.push('replace: graph needs nodes[] + wires[]'); continue; }
        const bad = ng.nodes.filter(n => !n || !NODE_DEFS[n.type]);
        if (bad.length) { errors.push('replace: unknown node type(s): ' + bad.map(n => n && n.type).join(', ')); continue; }
        g.nodes = JSON.parse(JSON.stringify(ng.nodes));
        g.wires = JSON.parse(JSON.stringify(ng.wires)).map(w => ({ from: w.from, to: w.to }));
        usedIds.clear();
        for (const n of g.nodes) { usedIds.add(n.id); n.values = n.values || {}; if (typeof n.x !== 'number' || typeof n.y !== 'number') needLayout.push(n); }
        added = g.nodes.length; wired = g.wires.length;

      } else {
        errors.push('unknown op "' + op.op + '"');
      }
    }

    if (errors.length) return { applied: 0, errors };

    // nodes that arrived without coordinates settle in topological columns
    // to the right of (or below) what's already on the loom
    if (needLayout.length) {
      let baseX = 60, baseY = 60;
      const placed = g.nodes.filter(n => !needLayout.includes(n));
      if (placed.length) {
        baseX = Math.min.apply(null, placed.map(n => n.x));
        baseY = Math.max.apply(null, placed.map(n => n.y)) + 220;
      }
      const depth = {};
      const calc = (id, seen) => {
        if (depth[id] !== undefined) return depth[id];
        if (seen.has(id)) return 0;
        seen.add(id);
        let d = 0;
        for (const w of g.wires) if (w.to[0] === id && g.nodes.some(n => n.id === w.from[0])) d = Math.max(d, calc(w.from[0], seen) + 1);
        return depth[id] = d;
      };
      const colY = {};
      for (const n of needLayout) {
        const d = calc(n.id, new Set());
        n.x = baseX + d * 250;
        n.y = baseY + (colY[d] || 0);
        colY[d] = (colY[d] || 0) + 140;
      }
    }

    g.format = GRAPH_FORMAT;
    App.graph = App.migrate(g);
    Editor.setGraph(App.graph);
    App.onGraphChanged();
    const bits = [];
    if (added) bits.push('+' + added + ' node' + (added > 1 ? 's' : ''));
    if (changed) bits.push(changed + ' edited');
    if (removed) bits.push('−' + removed);
    if (wired) bits.push(wired + ' wire' + (wired > 1 ? 's' : ''));
    return { applied: ops.length, errors: [], summary: bits.join(' · ') || 'no changes' };
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
      if (!ops) {
        const m = reply.match(/```(?:weft-ops|json)\s*\n([\s\S]*?)```/);
        if (m) {
          try {
            const parsed = JSON.parse(m[1]);
            ops = Array.isArray(parsed) ? parsed : parsed.ops;
            if (ops) reply = reply.replace(m[0], '').trim();
          } catch (e) { /* leave the fence visible */ }
        }
      }
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
