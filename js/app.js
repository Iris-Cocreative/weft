'use strict';
/* Weft app shell — palette, toolbar, persistence, history (undo/redo), export modal, splitter. */

const GRAPH_FORMAT = 2;

const App = {
  graph: { format: GRAPH_FORMAT, nodes: [], wires: [] },

  /* dirty = edited since the last file save / graph load (autosave doesn't count) */
  _dirty: false,
  _fileName: 'weft-graph.json',

  /* ------------------------------ graph format ------------------------------ */

  migrate(g) {
    if (!g || !Array.isArray(g.nodes) || !Array.isArray(g.wires)) throw new Error('not a weft graph');
    if (!g.format) g.format = 1; // pre-versioning graphs are structurally v1
    if (g.format > GRAPH_FORMAT) throw new Error('made in a newer Weft (format ' + g.format + ')');
    // v2 adds node labels + canvas notes/groups — all optional, so a v1 graph
    // is structurally v2 already; loading stays lax (invariant #5)
    if (g.format === 1) { g.format = 2; }
    return g;
  },

  serialize() {
    return {
      format: GRAPH_FORMAT,
      meta: (App.graph.meta && App.graph.meta.tuneA4) ? { tuneA4: App.graph.meta.tuneA4 } : undefined,
      nodes: App.graph.nodes.map(n => {
        const o = { id: n.id, type: n.type, x: n.x, y: n.y, values: n.values };
        if (n.enabled === false) o.enabled = false;
        if (n.preview === false) o.preview = false;
        if (n.collapsed) o.collapsed = true;
        if (n.label) o.label = n.label;
        return o;
      }),
      wires: App.graph.wires.map(w => ({ id: w.id, from: w.from, to: w.to })),
      notes: (App.graph.notes && App.graph.notes.length)
        ? App.graph.notes.map(t => ({ id: t.id, x: t.x, y: t.y, w: t.w, h: t.h, text: t.text }))
        : undefined,
      groups: (App.graph.groups && App.graph.groups.length)
        ? App.graph.groups.map(f => ({ id: f.id, x: f.x, y: f.y, w: f.w, h: f.h, title: f.title, nodes: f.nodes.slice(), collapsed: f.collapsed || undefined }))
        : undefined
    };
  },

  setGraph(g) {
    App.graph = App.migrate(g);
    Editor.setGraph(App.graph);
    App.updateCounts();
    App.resetHistory();
    App.writeStorage();
    App._dirty = false;
    App.paintTune();
    if (App._params) App.toggleParams(true); // the sheet lists this graph's controls
  },

  /* concert pitch: A4 reference in Hz, saved with the graph (432 unless set) */
  paintTune() {
    const b = document.getElementById('btnTune');
    if (b) b.textContent = String((App.graph && App.graph.meta && App.graph.meta.tuneA4) || 432);
  },

  /* ------------------------------ change pipeline ------------------------------
   * Editor.onChange → debounce 400ms → storage + one history snapshot.
   * Continuous gestures (slider drags) coalesce into a single undo step. */

  _changeTimer: null,
  onGraphChanged() {
    App._dirty = true;
    clearTimeout(App._changeTimer);
    App._changeTimer = setTimeout(() => {
      App._changeTimer = null;
      App.writeStorage();
      App.pushHistory();
      App.updateCounts();
      // a change that did not come from the params panel (a card turned on the
      // loom, an undo, the assistant) refreshes the panel's rows
      if (App._params && performance.now() - (App._paramsSelfAt || 0) > 450) App.toggleParams(true);
    }, 400);
  },

  writeStorage() {
    try { localStorage.setItem('weft:autosave', JSON.stringify(App.serialize())); } catch (e) { /* storage unavailable */ }
  },

  /* ------------------------------ user settings ------------------------------
   * flat booleans under weft:set-<key>; absent = the given default */
  setting(key, def) {
    try {
      const raw = localStorage.getItem('weft:set-' + key);
      return raw === null ? def : raw === '1';
    } catch (e) { return def; }
  },
  setSetting(key, on) {
    try { localStorage.setItem('weft:set-' + key, on ? '1' : '0'); } catch (e) {}
    // wire strokes read settings at build time — repaint so toggles show immediately
    if (typeof Editor !== 'undefined' && Editor.redrawWires) Editor.redrawWires();
  },

  SETTINGS: [
    { key: 'angle-sliders', label: 'angle sliders', hint: 'typing 90 / 180 / 360 makes a degree slider wired into a Radians node', def: true },
    { key: 'smallint-sliders', label: '0–12 sliders', hint: 'typing a small integer makes a 0–12 integer slider', def: true },
    { key: 'live-colour-wires', label: 'live color wires', hint: 'color wires take the color flowing through them', def: true }
  ],

  bindSettings() {
    const tools = document.getElementById('loomTools');
    if (!tools) return;
    const btn = document.createElement('button');
    btn.id = 'btnSettings';
    btn.title = 'Settings';
    btn.textContent = '⚙';
    tools.appendChild(btn);
    let pop = null;
    const close = () => { if (pop) { pop.remove(); pop = null; } };
    btn.addEventListener('click', () => {
      if (pop) return close();
      pop = document.createElement('div');
      pop.id = 'settingsPop';
      for (const s of App.SETTINGS) {
        const row = document.createElement('label');
        row.className = 'set-row';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = App.setting(s.key, s.def);
        cb.addEventListener('change', () => App.setSetting(s.key, cb.checked));
        const txt = document.createElement('span');
        txt.textContent = s.label;
        row.title = s.hint;
        row.appendChild(cb); row.appendChild(txt);
        pop.appendChild(row);
      }
      document.getElementById('editor').appendChild(pop);
      const closer = ev => {
        if (pop && (pop.contains(ev.target) || ev.target === btn)) return;
        close();
        window.removeEventListener('pointerdown', closer, true);
      };
      window.addEventListener('pointerdown', closer, true);
    });
  },

  restore() {
    try {
      const raw = localStorage.getItem('weft:autosave');
      if (raw) {
        const g = App.migrate(JSON.parse(raw));
        if (g.nodes.length) return g;
      }
    } catch (e) { /* fall through */ }
    return null;
  },

  /* ------------------------------ undo / redo ------------------------------ */

  _hist: [], _histIdx: -1,

  resetHistory() {
    App._hist = [JSON.stringify(App.serialize())];
    App._histIdx = 0;
  },

  pushHistory() {
    const snap = JSON.stringify(App.serialize());
    if (snap === App._hist[App._histIdx]) return;
    App._hist.length = App._histIdx + 1; // drop redo tail
    App._hist.push(snap);
    if (App._hist.length > 100) App._hist.shift();
    App._histIdx = App._hist.length - 1;
  },

  _flushPending() {
    if (App._changeTimer) {
      clearTimeout(App._changeTimer);
      App._changeTimer = null;
      App.writeStorage();
      App.pushHistory();
    }
  },

  undo() {
    App._flushPending();
    if (App._histIdx <= 0) { App.flash('nothing to undo'); return; }
    App._histIdx--;
    App.applySnapshot();
  },

  redo() {
    App._flushPending();
    if (App._histIdx >= App._hist.length - 1) { App.flash('nothing to redo'); return; }
    App._histIdx++;
    App.applySnapshot();
  },

  applySnapshot() {
    App.graph = JSON.parse(App._hist[App._histIdx]);
    Editor.setGraph(App.graph);
    App.writeStorage();
    App.updateCounts();
  },

  /* ------------------------------ status bar ------------------------------ */

  _flashTimer: null,
  flash(msg) {
    const el = document.getElementById('statusHint');
    const original = el.dataset.original || el.textContent;
    el.dataset.original = original;
    el.textContent = msg;
    el.classList.add('flash');
    clearTimeout(App._flashTimer);
    App._flashTimer = setTimeout(() => {
      el.textContent = original;
      el.classList.remove('flash');
    }, 2600);
  },

  updateCounts() {
    document.getElementById('statusCounts').textContent =
      App.graph.nodes.length + ' nodes · ' + App.graph.wires.length + ' wires';
  },

  /* ------------------------------ ask dialog ------------------------------
   * Small in-app prompt/confirm (native dialogs block the page). Resolves the
   * chosen button's value — with `input` set, the accent button resolves the
   * text instead. Esc / backdrop resolve null. */

  ask({ title, body, input, buttons }) {
    return new Promise(resolve => {
      const modal = document.getElementById('askModal');
      const inp = document.getElementById('askInput');
      const actions = document.getElementById('askActions');
      document.getElementById('askTitle').textContent = title || '';
      document.getElementById('askBody').textContent = body || '';
      document.getElementById('askBody').classList.toggle('hidden', !body);
      inp.classList.toggle('hidden', input === undefined);
      if (input !== undefined) inp.value = input;

      const done = v => {
        modal.classList.add('hidden');
        modal.removeEventListener('pointerdown', onBackdrop);
        window.removeEventListener('keydown', onKey, true);
        resolve(v);
      };
      const confirm = b => done(input !== undefined && b.accent ? inp.value.trim() : b.value);
      const onBackdrop = e => { if (e.target === modal) done(null); };
      const onKey = e => {
        if (e.key === 'Escape') { e.stopPropagation(); done(null); }
        else if (e.key === 'Enter' && input !== undefined) {
          const b = buttons.find(b => b.accent);
          if (b) { e.stopPropagation(); confirm(b); }
        }
      };

      actions.innerHTML = '';
      for (const b of buttons) {
        const el = document.createElement('button');
        el.textContent = b.label;
        if (b.accent) el.classList.add('accent');
        el.addEventListener('click', () => confirm(b));
        actions.appendChild(el);
      }
      modal.addEventListener('pointerdown', onBackdrop);
      window.addEventListener('keydown', onKey, true);
      modal.classList.remove('hidden');
      if (input !== undefined) { inp.focus(); inp.select(); }
    });
  },

  /* ------------------------------ share links ------------------------------
   * The whole graph rides in the URL hash: #w2= pack + deflate-raw + base62
   * (or #j2= pack + base62 where CompressionStream is unavailable). The older
   * #w= / #wj= base64url links still open — read below, never written.
   * Zero-backend sharing — the hash never reaches a server. */

  _b64(u8) {
    let s = '';
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },

  _unb64(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  },

  async _pipe(u8, stream) {
    const r = new Response(new Blob([u8]).stream().pipeThrough(stream));
    return new Uint8Array(await r.arrayBuffer());
  },

  /* base62 — letters and digits only. base64url's "-" and "_" are what break
   * a pasted link in chat clients: most stop autolinking at a trailing "_",
   * and WhatsApp reads _like this_ as italics, so it eats the tail of the
   * hash. Costs 0.8% over base64 and buys a link that survives any client.
   * Radix conversion is O(n^2); the biggest patch in the shipped corpus is
   * ~3 KB deflated, which encodes in well under 20 ms. */
  _A62: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',

  _b62(u8) {
    let zeros = 0;
    while (zeros < u8.length && u8[zeros] === 0) zeros++; // leading zero bytes carry no value — kept as digit 0s
    const d = [];
    for (const byte of u8) {
      let c = byte;
      for (let j = 0; j < d.length; j++) { c += d[j] << 8; d[j] = c % 62; c = (c / 62) | 0; }
      while (c) { d.push(c % 62); c = (c / 62) | 0; }
    }
    let s = '';
    for (let i = 0; i < zeros; i++) s += App._A62[0];
    for (let i = d.length - 1; i >= 0; i--) s += App._A62[d[i]];
    return s;
  },

  _unb62(str) {
    if (!App._A62map) {
      App._A62map = {};
      for (let i = 0; i < 62; i++) App._A62map[App._A62[i]] = i;
    }
    let zeros = 0;
    while (zeros < str.length && str[zeros] === App._A62[0]) zeros++;
    const d = [];
    for (let k = zeros; k < str.length; k++) {
      let c = App._A62map[str[k]];
      if (c === undefined) throw new Error('unexpected character in the link');
      for (let j = 0; j < d.length; j++) { c += d[j] * 62; d[j] = c & 255; c >>= 8; }
      while (c) { d.push(c & 255); c >>= 8; }
    }
    const u8 = new Uint8Array(zeros + d.length);
    for (let i = 0; i < d.length; i++) u8[zeros + d.length - 1 - i] = d[i];
    return u8;
  },

  /* Pack a serialized graph for the hash: one dictionary for the repeated
   * type names and one for port names, node ids collapsed to array position,
   * and every JSON key dropped. Roughly 60% off the pre-compression JSON,
   * which survives deflate as a ~25% shorter link. Wire / note / group ids
   * are not carried — Editor.setGraph reissues the ones it needs. */
  _pack(g) {
    const types = [], ports = [], tIdx = new Map(), pIdx = new Map(), nIdx = new Map();
    const ti = t => { if (!tIdx.has(t)) { tIdx.set(t, types.length); types.push(t); } return tIdx.get(t); };
    const pi = p => { if (!pIdx.has(p)) { pIdx.set(p, ports.length); ports.push(p); } return pIdx.get(p); };
    g.nodes.forEach((n, i) => nIdx.set(n.id, i));
    const nodes = g.nodes.map(n => {
      const t = [ti(n.type), n.x, n.y,
        (n.values && Object.keys(n.values).length) ? n.values : 0,
        (n.enabled === false ? 1 : 0) | (n.preview === false ? 2 : 0) | (n.collapsed ? 4 : 0),
        n.label || 0];
      while (t.length > 4 && !t[t.length - 1]) t.pop();
      return t;
    });
    const wires = [];
    for (const w of g.wires) {
      const a = nIdx.get(w.from[0]), b = nIdx.get(w.to[0]);
      if (a === undefined || b === undefined) continue; // dangling wire — drop it rather than ship a broken index
      wires.push([a, pi(w.from[1]), b, pi(w.to[1])]);
    }
    const notes = (g.notes || []).map(t => [t.x, t.y, t.w, t.h, t.text || '']);
    const groups = (g.groups || []).map(f => [f.x, f.y, f.w, f.h, f.title || 0,
      (f.nodes || []).map(id => nIdx.get(id)).filter(i => i !== undefined), f.collapsed ? 1 : 0]);
    const out = [g.format || 2, types, ports, nodes, wires,
      notes.length ? notes : 0, groups.length ? groups : 0, (g.meta && g.meta.tuneA4) || 0];
    while (out.length > 5 && !out[out.length - 1]) out.pop();
    return out;
  },

  _unpack(a) {
    if (!Array.isArray(a) || !Array.isArray(a[3]) || !Array.isArray(a[1])) throw new Error('not a weft graph');
    const types = a[1], ports = a[2] || [], notes = a[5], groups = a[6];
    const g = {
      format: a[0] || 2,
      nodes: a[3].map((t, i) => {
        const n = { id: 'n' + i, type: types[t[0]], x: t[1] || 0, y: t[2] || 0, values: t[3] || {} };
        const f = t[4] || 0;
        if (f & 1) n.enabled = false;
        if (f & 2) n.preview = false;
        if (f & 4) n.collapsed = true;
        if (t[5]) n.label = t[5];
        return n;
      }),
      wires: (a[4] || []).map(w => ({ from: ['n' + w[0], ports[w[1]]], to: ['n' + w[2], ports[w[3]]] }))
    };
    if (notes) g.notes = notes.map(t => ({ x: t[0], y: t[1], w: t[2], h: t[3], text: t[4] || '' }));
    if (groups) g.groups = groups.map(f => ({
      x: f[0], y: f[1], w: f[2], h: f[3], title: f[4] || '',
      nodes: (f[5] || []).map(i => 'n' + i), collapsed: !!f[6]
    }));
    if (a[7]) g.meta = { tuneA4: a[7] };
    return g;
  },

  async shareLink() {
    if (!App.graph.nodes.length) { App.flash('nothing to share — the canvas is empty'); return; }
    App._flushPending();
    const bytes = new TextEncoder().encode(JSON.stringify(App._pack(App.serialize())));
    const canDeflate = typeof CompressionStream !== 'undefined';
    const hash = canDeflate
      ? '#w2=' + App._b62(await App._pipe(bytes, new CompressionStream('deflate-raw')))
      : '#j2=' + App._b62(bytes);
    const url = location.origin + location.pathname + location.search + hash;
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        copied = true;
      }
    } catch (e) { /* clipboard unavailable (file://, permissions) — show the link instead */ }
    if (copied) {
      App.flash('share link copied — the whole patch lives in the URL (' + url.length + ' chars)');
      const b = document.getElementById('btnShare');
      if (b && !b._resetTimer) {
        const label = b.textContent;
        b.textContent = 'copied ✓';
        b._resetTimer = setTimeout(() => { b.textContent = label; b._resetTimer = null; }, 1600);
      }
    } else {
      await App.ask({
        title: 'share link',
        body: 'copy the link below — the whole patch lives in the URL.',
        input: url,
        buttons: [{ label: 'Done', value: 'done', accent: true }]
      });
    }
  },

  async loadFromHash() {
    const m = /^#(w2|j2|w|wj)=([A-Za-z0-9_-]+)$/.exec(location.hash || '');
    if (!m) return false;
    const kind = m[1], packed = kind === 'w2' || kind === 'j2';
    const clear = () => { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} };
    try {
      let bytes = packed ? App._unb62(m[2]) : App._unb64(m[2]);
      if (kind === 'w' || kind === 'w2') bytes = await App._pipe(bytes, new DecompressionStream('deflate-raw'));
      const data = JSON.parse(new TextDecoder().decode(bytes));
      const g = App.migrate(packed ? App._unpack(data) : data);
      try { localStorage.setItem('weft:backup', JSON.stringify(App.serialize())); } catch (e) {}
      App.setGraph(g);
      Editor.zoomToFit(false);
      clear();
      App.flash('opened a shared patch — your previous graph is backed up');
      return true;
    } catch (e) {
      clear();
      App.flash('could not open the shared link: ' + (e.message || e));
      return false;
    }
  },

  /* ------------------------------ save to file ------------------------------
   * With the File System Access API (Chrome/Edge) Save genuinely overwrites
   * the file it came from — no more "weft-graph (1).json" piling up in
   * Downloads. The handle is remembered from Save-as AND from Open, cleared
   * by New / example loads. Browsers without the API fall back to the old
   * download flow untouched. */

  _fileHandle: null,

  _rememberName(name) {
    App._fileName = name;
    try { localStorage.setItem('weft:filename', name); } catch (e) {}
  },

  async _pickSaveHandle() {
    const h = await showSaveFilePicker({
      suggestedName: App._fileName,
      types: [{ description: 'Weft graph', accept: { 'application/json': ['.json', '.weft'] } }]
    });
    App._fileHandle = h;
    App._rememberName(h.name);
    return h;
  },

  async saveGraph() {
    const body = JSON.stringify(App.serialize(), null, 2);
    if (typeof showSaveFilePicker === 'function') {
      try {
        const h = App._fileHandle || await App._pickSaveHandle();
        const w = await h.createWritable();
        await w.write(body);
        await w.close();
        App._dirty = false;
        App.flash('saved ' + App._fileName);
      } catch (e) {
        if (e && e.name === 'AbortError') return; // picker canceled — not an error
        // permission lost / file moved: fall back to a fresh pick next time
        App._fileHandle = null;
        App.flash('could not save: ' + (e.message || e));
      }
      return;
    }
    App.download(App._fileName, body, 'application/json');
    App._dirty = false;
    App.flash('saved ' + App._fileName);
  },

  async saveGraphAs() {
    if (typeof showSaveFilePicker === 'function') {
      try { await App._pickSaveHandle(); } catch (e) { return; } // canceled
      return App.saveGraph();
    }
    let name = await App.ask({
      title: 'save as',
      input: App._fileName,
      buttons: [{ label: 'Save', value: 'save', accent: true }, { label: 'Cancel', value: null }]
    });
    if (!name) return;
    if (!/\.(json|weft)$/i.test(name)) name += '.json';
    App._rememberName(name);
    return App.saveGraph();
  },

  async openGraph() {
    if (typeof showOpenFilePicker !== 'function') {
      document.getElementById('fileInput').click();
      return;
    }
    let h;
    try {
      [h] = await showOpenFilePicker({
        types: [{ description: 'Weft graph', accept: { 'application/json': ['.json', '.weft'] } }]
      });
    } catch (e) { return; } // canceled
    try {
      const f = await h.getFile();
      App.setGraph(JSON.parse(await f.text()));
      Editor.zoomToFit(false);
      App._fileHandle = h;        // a later Save overwrites this same file
      App._rememberName(h.name);
      App.flash('opened ' + h.name);
    } catch (e) {
      App.flash('could not open file: ' + (e.message || e));
    }
  },

  /* ------------------------------ init ------------------------------ */

  init() {
    document.getElementById('brandMark').innerHTML = weftLogoSVG('hdr');
    document.getElementById('btnFitIcon').innerHTML = weftUISVG('fit');
    try {
      App._fileName = localStorage.getItem('weft:filename') || App._fileName;
      Viewport.ghosts = localStorage.getItem('weft:ghosts') !== '0';
      Viewport.draws = localStorage.getItem('weft:draws') !== '0';
      Viewport.merged = localStorage.getItem('weft:merged') === '1';
    } catch (e) {}
    Editor.init(() => App.onGraphChanged());
    Viewport.init();
    App.buildPalette();
    App.buildTypeKey();
    App.bindToolbar();
    App.bindKeys();
    App.bindSplitter();
    App.bindExport();
    App.bindGallery();
    App.bindSettings();

    const saved = App.restore();
    App.setGraph(saved || App.migrate(JSON.parse(JSON.stringify(EXAMPLES['Rainbow eye']))));
    if (!saved) Editor.zoomToFit(false); // a first visit should see the whole loom, not the corner the camera starts in
    App.loadFromHash(); // a #w= share link replaces the graph (previous one is backed up)
    App.bindMobile(); // after the graph: a stacked shell fits the loom to its half
  },

  bindKeys() {
    window.addEventListener('keydown', e => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); App.undo(); }
      else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); App.redo(); }
      else if (k === 'a') { e.preventDefault(); Editor.selectAll(); }
      else if (k === 'c' || k === 'x') {
        // async-clipboard fallback so copy works even if the native copy event
        // doesn't reach us; on file:// (no clipboard API) the copy event path runs
        const frag = Editor.copySelection();
        if (frag && navigator.clipboard && navigator.clipboard.writeText) {
          e.preventDefault();
          navigator.clipboard.writeText(JSON.stringify(frag, null, 1)).then(() => {
            App.flash(frag.nodes.length + ' node(s) ' + (k === 'x' ? 'cut' : 'copied') + ' — paste here or into any chat');
            if (k === 'x') Editor.deleteSelection();
          }).catch(() => {});
        }
      }
    });
  },

  /* ------------------------------ palette ------------------------------ */

  buildPalette() {
    const list = document.getElementById('paletteList');
    const search = document.getElementById('paletteSearch');
    const order = ['Params', 'Input', 'State', 'Maths', 'Sets', 'Vector', 'Curve', 'Transform', '3D', 'Display', 'Audio', 'Meta'];

    const render = q => {
      q = (q || '').toLowerCase();
      let html = '';
      for (const cat of order) {
        const defs = Object.values(NODE_DEFS)
          .filter(d => d.cat === cat && !d.hidden)
          .filter(d => !q || d.title.toLowerCase().includes(q) || d.id.includes(q))
          .sort((a, b) => ((a.grp || 9) - (b.grp || 9)) || a.title.localeCompare(b.title));
        if (!defs.length) continue;
        html += `<div class="pal-cat" style="--c:${CATS[cat]}">${cat}</div>`;
        let prevGrp = null;
        for (const d of defs) {
          if (prevGrp !== null && (d.grp || 9) !== prevGrp) html += '<div class="pal-gap"></div>';
          prevGrp = d.grp || 9;
          const icon = d.id === 'params/swatch' ? '<span class="icon-swatch"></span>'
            : (weftIconSVG(d.id, d.cat) || `<span class="dot" style="background:${CATS[cat]}"></span>`);
          html += `<div class="pal-item" data-type="${d.id}" title="${d.desc || ''}">
            <span class="pal-icon" style="color:${CATS[cat]}">${icon}</span>${d.title}
          </div>`;
        }
      }
      list.innerHTML = html;
    };
    render('');
    search.addEventListener('input', () => render(search.value));

    /* drag a node from the palette onto the loom (or an Anchor onto the cloth) */
    let pd = null;
    list.addEventListener('pointerdown', e => {
      const item = e.target.closest('.pal-item');
      if (!item) return;
      e.preventDefault();
      pd = { type: item.dataset.type, title: item.textContent.trim(), sx: e.clientX, sy: e.clientY, ghost: null };
    });
    window.addEventListener('pointermove', e => {
      if (!pd) return;
      if (!pd.ghost && Math.abs(e.clientX - pd.sx) + Math.abs(e.clientY - pd.sy) > 6) {
        pd.ghost = document.createElement('div');
        pd.ghost.className = 'drag-ghost';
        pd.ghost.textContent = pd.title;
        document.body.appendChild(pd.ghost);
      }
      if (pd.ghost) {
        pd.ghost.style.left = (e.clientX + 12) + 'px';
        pd.ghost.style.top = (e.clientY + 8) + 'px';
      }
    });
    window.addEventListener('pointercancel', () => {
      // a finger that turned into a list scroll is not a drag
      if (pd && pd.ghost) pd.ghost.remove();
      pd = null;
    });
    window.addEventListener('pointerup', e => {
      if (!pd) return;
      const p = pd;
      pd = null;
      if (!p.ghost) {
        if (e.target.closest && e.target.closest('.pal-item')) {
          Editor.addAtCenter(p.type);
          if (App.isMobile()) { App.togglePalette(false); App.flash('added ' + p.title + ' at the center of the loom'); }
        }
        return;
      }
      p.ghost.remove();
      const ed = document.getElementById('editor').getBoundingClientRect();
      const pv = document.getElementById('preview').getBoundingClientRect();
      const within = r => e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (within(ed)) {
        // merged view: the drop point is also a cloth position — pin the anchor's
        // handle exactly there and settle the card just beside it, off the handle
        const pin = Viewport.merged && p.type === 'params/anchor';
        const n = Editor.addAt(p.type, e.clientX + (pin ? 46 : 0), e.clientY + (pin ? 26 : 0));
        if (n && pin) {
          n.values.x = Math.round(e.clientX - pv.left - pv.width / 2);
          n.values.y = Math.round(e.clientY - pv.top - pv.height / 2);
          App.onGraphChanged();
          App.flash('anchor pinned to the cloth — drag its handle any time');
        }
      } else if (within(pv) && p.type === 'params/anchor') {
        const n = Editor.addAtCenter('params/anchor');
        if (n) {
          n.values.x = Math.round(e.clientX - pv.left - pv.width / 2);
          n.values.y = Math.round(e.clientY - pv.top - pv.height / 2);
          App.onGraphChanged();
          App.flash('anchor pinned to the cloth — drag its handle any time');
        }
      }
    });
  },

  buildTypeKey() {
    const body = document.querySelector('#typeKey .tk-body');
    const order = ['number', 'point', 'vector', 'point3', 'camera', 'geometry', 'color', 'bool', 'string', 'audio', 'any'];
    body.innerHTML = order.map(t =>
      `<div class="tk-row"><span class="tk-line" style="background:${TYPE_COLORS[t]}"></span>${t}</div>`).join('') +
      `<div class="tk-note">wires take the color of their source output</div>`;
    document.querySelector('#typeKey .tk-head').addEventListener('click', () => {
      document.getElementById('typeKey').classList.toggle('closed');
    });
  },

  /* ------------------------------ examples ------------------------------ */

  /* Load an example by name: dirty-check → back up the current graph → set →
   * fit → flash. Resolves false if the user canceled, so a caller (the
   * gallery) can decide whether to stay open. */
  async loadExample(name) {
    if (!EXAMPLES[name]) { App.flash('no example named “' + name + '”'); return false; }
    if (App._dirty && App.graph.nodes.length) {
      const r = await App.ask({
        title: 'unsaved changes',
        body: 'the current graph isn’t saved to a file — loading “' + name + '” will replace it.',
        buttons: [
          { label: 'Save, then load', value: 'save', accent: true },
          { label: 'Load without saving', value: 'discard' },
          { label: 'Cancel', value: null }
        ]
      });
      if (r === null) return false;
      if (r === 'save') await App.saveGraph();
    }
    try { localStorage.setItem('weft:backup', JSON.stringify(App.serialize())); } catch (e) {}
    App.setGraph(JSON.parse(JSON.stringify(EXAMPLES[name])));
    App._fileHandle = null; // don't let a later Save overwrite a real file with an example
    Editor.zoomToFit(false);
    App.flash('loaded example: ' + name);
    return true;
  },

  /* ------------------------------ toolbar ------------------------------ */

  bindToolbar() {
    document.getElementById('btnFitIcon').addEventListener('click', () => Editor.zoomToFit(false));

    const btnMerge = document.getElementById('btnMerge');
    const mainEl = document.querySelector('main');
    const paintMerge = () => {
      mainEl.classList.toggle('merged', Viewport.merged);
      btnMerge.innerHTML = weftUISVG(Viewport.merged ? 'split' : 'merge');
      btnMerge.title = Viewport.merged
        ? 'split — loom left, cloth right'
        : 'merge — float the loom on the cloth';
    };
    btnMerge.addEventListener('click', () => {
      Viewport.merged = !Viewport.merged;
      try { localStorage.setItem('weft:merged', Viewport.merged ? '1' : '0'); } catch (e) {}
      paintMerge();
      App.flash(Viewport.merged
        ? 'one canvas — the loom floats on the cloth · shift+wheel scrubs scroll'
        : 'split view — the loom weaves left, the cloth wears it right');
    });
    paintMerge();
    App.paintMerge = paintMerge;

    const btnDraw = document.getElementById('btnDraw');
    const paintDraw = () => {
      btnDraw.innerHTML = weftUISVG('draw');
      btnDraw.classList.toggle('off', !Viewport.draws);
      btnDraw.title = 'draw display on the cloth — ' + (Viewport.draws ? 'on' : 'off (previews only)');
    };
    btnDraw.addEventListener('click', () => {
      Viewport.draws = !Viewport.draws;
      try { localStorage.setItem('weft:draws', Viewport.draws ? '1' : '0'); } catch (e) {}
      paintDraw();
      App.flash(Viewport.draws ? 'draw display on' : 'draw display off — the cloth shows previews only');
    });
    paintDraw();

    const btnGhosts = document.getElementById('btnGhosts');
    const paintGhosts = () => {
      btnGhosts.innerHTML = weftEyeSVG(Viewport.ghosts ? 'shown' : 'hidden');
      btnGhosts.classList.toggle('off', !Viewport.ghosts);
      btnGhosts.title = 'geometry previews on the cloth — ' + (Viewport.ghosts ? 'on' : 'off');
    };
    btnGhosts.addEventListener('click', () => {
      Viewport.ghosts = !Viewport.ghosts;
      try { localStorage.setItem('weft:ghosts', Viewport.ghosts ? '1' : '0'); } catch (e) {}
      paintGhosts();
      App.flash(Viewport.ghosts ? 'cloth previews on' : 'cloth previews off — display nodes still draw');
    });
    paintGhosts();

    const btnTune = document.getElementById('btnTune');
    if (btnTune) btnTune.addEventListener('click', () => {
      const cur = (App.graph.meta && App.graph.meta.tuneA4) || 432;
      App.graph.meta = App.graph.meta || {};
      App.graph.meta.tuneA4 = cur === 432 ? 440 : 432;
      App.paintTune();
      App.onGraphChanged();
      App.flash('concert pitch: A4 = ' + App.graph.meta.tuneA4 + ' Hz — saves with the graph');
    });
    App.paintTune();

    document.getElementById('btnNew').addEventListener('click', () => {
      try { localStorage.setItem('weft:backup', JSON.stringify(App.serialize())); } catch (e) {}
      App.setGraph({ format: GRAPH_FORMAT, nodes: [], wires: [] });
      App._fileHandle = null; // a fresh canvas saves to a fresh file
      App.flash('canvas cleared — previous graph backed up');
    });

    document.getElementById('btnSave').addEventListener('click', () => App.saveGraph());
    document.getElementById('btnSaveAs').addEventListener('click', () => App.saveGraphAs());
    document.getElementById('btnShare').addEventListener('click', () => {
      // surface failures — a silent rejection here reads as a dead button
      App.shareLink().catch(e => App.ask({
        title: 'share failed',
        body: String((e && e.message) || e),
        buttons: [{ label: 'OK', value: 'ok', accent: true }]
      }));
    });

    const fileInput = document.getElementById('fileInput');
    document.getElementById('btnLoad').addEventListener('click', () => App.openGraph());
    fileInput.addEventListener('change', () => {
      const f = fileInput.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          App.setGraph(JSON.parse(r.result));
          Editor.zoomToFit(false);
          App._fileName = f.name;
          try { localStorage.setItem('weft:filename', f.name); } catch (e) {}
          App.flash('opened ' + f.name);
        } catch (e) {
          App.flash('could not open file: ' + e.message);
        }
      };
      r.readAsText(f);
      fileInput.value = '';
    });

    const btnPlay = document.getElementById('btnPlay');
    btnPlay.addEventListener('click', () => {
      if (Viewport.setPlaying) Viewport.setPlaying(!Viewport.playing);
      else Viewport.playing = !Viewport.playing;
      btnPlay.textContent = Viewport.playing ? '⏸' : '▶';
    });
  },

  download(name, content, mime) {
    const blob = new Blob([content], { type: mime || 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  },

  /* ------------------------------ export modal ------------------------------ */

  bindExport() {
    const modal = document.getElementById('exportModal');
    const code = document.getElementById('exportCode');

    /* Esc closes, same as the gallery — the listener only lives while the modal
     * is up, and capture-phase so it still fires from inside the textarea */
    const close = () => {
      modal.classList.add('hidden');
      window.removeEventListener('keydown', onKey, true);
    };
    const onKey = e => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      close();
    };

    document.getElementById('btnExport').addEventListener('click', () => {
      if (!App.graph.nodes.length) { App.flash('nothing to export — the canvas is empty'); return; }
      code.value = WeftExport.buildJS(App.graph);
      modal.classList.remove('hidden');
      window.addEventListener('keydown', onKey, true);
    });
    document.getElementById('exportClose').addEventListener('click', close);
    modal.addEventListener('pointerdown', e => { if (e.target === modal) close(); });

    document.getElementById('exportCopy').addEventListener('click', () => {
      code.select();
      try { navigator.clipboard.writeText(code.value); App.flash('copied to clipboard'); }
      catch (e) { document.execCommand('copy'); App.flash('copied to clipboard'); }
    });
    document.getElementById('exportDl').addEventListener('click', () => {
      App.download('weft-experience.js', code.value, 'text/javascript');
    });
    document.getElementById('exportDlHtml').addEventListener('click', () => {
      App.download('weft-demo.html', WeftExport.buildDemoHTML(code.value, App.graph), 'text/html');
    });
  },

  /* ------------------------------ thumbnails ------------------------------
   * LM.drawItem takes any 2D context and knows nothing about #view — its other
   * two call sites are the viewport loop and the export mount — so a thumbnail
   * is just: step the graph forward N frames on a detached canvas, then paint
   * the drawList it ended up with. No engine change, no renderer change.
   *
   * Known limits, handled rather than discovered:
   *  - examples that read input/viewport adapt to whatever stage they are given;
   *    fixed-radius ones do not. So we always evaluate at the full stage size
   *    and scale the *paint* down — both kinds then frame like they do live.
   *  - N frames (EXAMPLE_META.frames) because springs, traces, counters and
   *    scopes are empty at t=0 and only look alive after a run-up.
   *  - audio examples produce little without a live Web Audio graph, and the
   *    mic / tab-share ones nothing at all — that is what `needs` badges mark.
   *  - there is no DOM host here, so Button/Element nodes declare into
   *    ctx.domList and simply go unpainted. */

  THUMB_STAGE: { w: 960, h: 600 },
  _thumbs: {},

  renderThumb(graph, w, h, frames) {
    const cv = document.createElement('canvas');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(w * dpr));
    cv.height = Math.max(1, Math.round(h * dpr));
    const g2 = cv.getContext('2d');
    const S = App.THUMB_STAGE, dt = 1 / 60;
    const tune = graph.meta && graph.meta.tuneA4;
    let ctx = null;
    /* cross-frame state lives on the node objects, so stepping the same graph
     * accumulates springs and traces exactly the way the live loop does */
    for (let f = 0; f < frames; f++) {
      ctx = Viewport.makeCtx(S.w, S.h, f * dt, dt, f, { tuneA4: tune });
      try { LM.evaluateGraph(graph, NODE_DEFS, ctx); } catch (e) { /* paint whatever drew */ }
    }
    g2.fillStyle = (ctx && ctx.bg) ? LM.colorCss(ctx.bg) : '#0b0e14';
    g2.fillRect(0, 0, cv.width, cv.height);
    if (ctx) {
      g2.translate(cv.width / 2, cv.height / 2); // coordinates are centered (invariant 3)
      const sc = Math.min(cv.width / S.w, cv.height / S.h);
      g2.scale(sc, sc);
      for (const it of ctx.drawList) {
        try { LM.drawItem(g2, it); } catch (e) { /* skip bad item */ }
      }
    }
    return cv.toDataURL('image/webp', 0.82);
  },

  /* cached by example name — the corpus never changes under us */
  thumbFor(name) {
    if (name in App._thumbs) return App._thumbs[name];
    let url = '';
    try {
      const m = EXAMPLE_META[name] || {};
      // a curated still (m.img) beats a rendered frame when the example's charm
      // is interactive and no single t captures it
      url = m.img || App.renderThumb(JSON.parse(JSON.stringify(EXAMPLES[name])), 480, 300, m.frames || 40);
    } catch (e) { /* a thumbnail is never worth breaking the gallery for */ }
    App._thumbs[name] = url;
    return url;
  },

  /* ------------------------------ example gallery ------------------------------
   * A third modal beside #askModal and #exportModal, same idiom — plus the Esc
   * handler the export modal never got. */

  bindGallery() {
    const modal = document.getElementById('galleryModal');
    const grid = document.getElementById('galleryGrid');
    const scroll = modal.querySelector('.gal-scroll');
    const search = document.getElementById('gallerySearch');
    const chips = document.getElementById('galleryChips');
    const empty = document.getElementById('galleryEmpty');
    const names = Object.keys(EXAMPLES);
    const esc = s => String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    let cat = 'all';

    search.placeholder = 'search ' + names.length + ' examples…';

    /* one card per example. data-s is the precomputed lowercase haystack —
     * name + blurb + teaches + category + tags + every node type in the graph,
     * so searching "spring" or "state/latch" both land (the trick from
     * test/gen-node-index.js). */
    grid.innerHTML = names.map(name => {
      const m = EXAMPLE_META[name] || {};
      const g = EXAMPLES[name];
      const types = [...new Set(g.nodes.map(n => n.type))];
      const hay = [name, m.blurb, m.teaches, m.cat, (m.tags || []).join(' '), types.join(' ')]
        .join(' ').toLowerCase();
      const needs = (m.needs || [])
        .map(n => '<span class="gal-need">needs ' + esc(n) + '</span>').join('');
      return '<div class="gal-card" role="button" tabindex="0" data-name="' + esc(name) + '"' +
        ' data-cat="' + esc(m.cat || '') + '" data-s="' + esc(hay) + '"' +
        ' style="--cat:' + (CATS[EXAMPLE_CAT_HUE[m.cat]] || '#6b7891') + '">' +
        '<div class="gal-thumb"></div><div class="gal-body">' +
          '<div class="gal-name">' + esc(name) + '</div>' +
          '<div class="gal-blurb">' + esc(m.blurb) + '</div>' +
          '<div class="gal-teach">' + esc(m.teaches) + '</div>' +
          '<div class="gal-foot"><span class="gal-cat">' + esc(m.cat) + '</span>' +
            '<span>' + g.nodes.length + ' nodes · ' + g.wires.length + ' wires</span>' +
            needs +
          '</div>' +
        '</div></div>';
    }).join('');

    /* chips: all + every category that actually has examples (.seg livery) */
    const cats = ['all'].concat(EXAMPLE_CATS.filter(c => names.some(n => (EXAMPLE_META[n] || {}).cat === c)));
    chips.innerHTML = cats.map(c =>
      '<div class="seg-b' + (c === 'all' ? ' on' : '') + '" data-cat="' + esc(c) + '">' +
      esc(c === 'all' ? 'all' : c.toLowerCase()) + '</div>').join('');

    /* thumbnails render one card per frame, visible ones first: 28 graphs
     * stepped 40–120 frames each is seconds of evaluation, far too much for a
     * single tick, and a filtered gallery may never need most of them */
    let queue = [], pumping = false;
    const pump = () => {
      if (modal.classList.contains('hidden')) { queue = []; pumping = false; return; }
      const el = queue.shift();
      if (!el) { pumping = false; return; }
      el.dataset.thumb = '1';
      const url = App.thumbFor(el.dataset.name);
      if (url) el.querySelector('.gal-thumb').style.backgroundImage = 'url(' + url + ')';
      requestAnimationFrame(pump);
    };
    const paintThumbs = () => {
      queue = [...grid.children].filter(c => !c.dataset.thumb && !c.classList.contains('hide'));
      if (!pumping && queue.length) { pumping = true; requestAnimationFrame(pump); }
    };

    const apply = () => {
      const q = search.value.toLowerCase().trim();
      let any = false;
      for (const c of grid.children) {
        const hit = (cat === 'all' || c.dataset.cat === cat) && (!q || c.dataset.s.includes(q));
        c.classList.toggle('hide', !hit);
        if (hit) any = true;
      }
      empty.classList.toggle('hidden', any);
      paintThumbs();
    };

    const close = () => {
      modal.classList.add('hidden');
      window.removeEventListener('keydown', onKey, true);
    };
    const onKey = e => {
      if (e.key !== 'Escape') return;
      // the ask dialog owns Esc while it is up, so a canceled load keeps the gallery
      if (!document.getElementById('askModal').classList.contains('hidden')) return;
      e.stopPropagation();
      close();
    };
    const open = () => {
      modal.classList.remove('hidden');
      window.addEventListener('keydown', onKey, true);
      scroll.scrollTop = 0;
      search.focus();
      search.select();
      paintThumbs();
    };

    document.getElementById('btnGallery').addEventListener('click', e => { e.preventDefault(); open(); });
    document.getElementById('galleryClose').addEventListener('click', close);
    modal.addEventListener('pointerdown', e => { if (e.target === modal) close(); });
    search.addEventListener('input', apply);
    chips.addEventListener('click', e => {
      const b = e.target.closest('.seg-b');
      if (!b) return;
      cat = b.dataset.cat;
      for (const s of chips.children) s.classList.toggle('on', s === b);
      apply();
    });
    const pick = async card => {
      if (await App.loadExample(card.dataset.name)) close();
    };
    grid.addEventListener('click', e => {
      const card = e.target.closest('.gal-card');
      if (card) pick(card);
    });
    grid.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.gal-card');
      if (!card) return;
      e.preventDefault();
      pick(card);
    });
  },

  /* ------------------------------ mobile shell ------------------------------
   * Under 760px style.css stacks the shell: cloth above, loom below, a grip
   * between them; the palette folds into the + button (quick-add) and the
   * file tools into ☰. This binds those buttons, keeps the grip's size to
   * its own orientation, swaps the status hint for a finger one, and never
   * lets the floated (merged) view load on a phone — the stack IS the merge
   * there. The params sheet below is the third piece. */

  mobileMQ: (typeof window !== 'undefined' && window.matchMedia) ? window.matchMedia('(max-width: 760px)') : { matches: false }, // smoke loads this file headless
  isMobile() { return App.mobileMQ.matches; },
  MOBILE_HINT: 'drag the loom to pan · pinch to zoom · tap a port, then another, to wire · + opens the node library · hold empty loom for quick-add, a card for its menu · the faders gather every control',

  bindMobile() {
    const hint = document.getElementById('statusHint');
    const deskHint = hint.textContent;
    const menuBtn = document.getElementById('btnMenu');
    const tools = document.querySelector('#toolbar .tools');
    const preview = document.getElementById('preview');
    const closeMenu = () => document.body.classList.remove('menu-open');
    menuBtn.addEventListener('click', e => { e.stopPropagation(); document.body.classList.toggle('menu-open'); });
    tools.addEventListener('click', e => { if (e.target.closest('button, a')) closeMenu(); });
    window.addEventListener('pointerdown', e => {
      if (!(e.target.closest && e.target.closest('#toolbar .tools, #btnMenu'))) closeMenu();
    }, true);
    // the node library: a drawer from the left on a phone (+ opens it, the backdrop closes it)
    const backdrop = document.createElement('div');
    backdrop.id = 'paletteBackdrop';
    document.querySelector('main').appendChild(backdrop);
    backdrop.addEventListener('pointerdown', () => App.togglePalette(false));
    const addBtn = document.getElementById('btnAddNode');
    addBtn.innerHTML = weftUISVG('plus');
    addBtn.addEventListener('click', () => { App.toggleParams(false); App.togglePalette(); });
    const pBtn = document.getElementById('btnParams');
    pBtn.innerHTML = weftUISVG('params');
    pBtn.addEventListener('click', () => App.toggleParams());
    // the keyboard shrinks the visual viewport; fixed panels (assistant, quick-add)
    // size themselves from these two variables so their input stays above it
    // Safari ignores the viewport meta for a pinch; its gesture events do not
    // ignore preventDefault. Pointer events keep flowing, so the loom's own pinch still works.
    document.addEventListener('gesturestart', e => e.preventDefault());
    document.addEventListener('gesturechange', e => e.preventDefault());
    document.addEventListener('touchmove', e => { if (e.scale !== undefined && e.scale !== 1) e.preventDefault(); }, { passive: false });
    const vv = window.visualViewport;
    const paintVV = () => {
      document.documentElement.style.setProperty('--vvh', Math.round(vv.height) + 'px');
      document.documentElement.style.setProperty('--vvt', Math.round(vv.offsetTop) + 'px');
    };
    if (vv) { vv.addEventListener('resize', paintVV); vv.addEventListener('scroll', paintVV); paintVV(); }

    const apply = () => {
      const m = App.isMobile();
      closeMenu();
      App.togglePalette(false);
      // the grip's inline size belongs to one orientation — a phone remembers its own
      let clothH = '';
      try { clothH = m ? (localStorage.getItem('weft:clothH') || '') : ''; } catch (e) {}
      preview.style.flexBasis = clothH ? clothH + 'px' : '';
      hint.textContent = m ? App.MOBILE_HINT : deskHint;
      hint.dataset.original = hint.textContent;
      if (m && Viewport.merged) { Viewport.merged = false; App.paintMerge(); }
      if (m && App.graph && App.graph.nodes.length) Editor.zoomToFit(false, 0.45); // a phone starts centered on the loom, at a legible zoom
      if (!m) {
        try { Viewport.merged = localStorage.getItem('weft:merged') === '1'; } catch (e) {}
        App.paintMerge();
        App.toggleParams(false);
      }
    };
    if (App.mobileMQ.addEventListener) App.mobileMQ.addEventListener('change', apply);
    else App.mobileMQ.addListener(apply);
    apply();
  },

  togglePalette(on) {
    const want = on === undefined ? !document.body.classList.contains('palette-open') : !!on;
    document.body.classList.toggle('palette-open', want);
  },

  /* ------------------------------ params sheet ------------------------------
   * Every control on the loom — slider, knob, angle, toggle, swatch, button,
   * anchor, text list — as one list: a panel docked at the loom's left on
   * desktop (Grasshopper's remote panel), the whole loom on a phone, so a
   * patch can be played without hunting cards. Each row runs the def's own buildBody
   * against the same node: the widget IS the card's widget, bound to the same
   * values, so nothing is reimplemented and the cloth follows live. The cards
   * underneath are rebuilt when the sheet closes, to catch up on what was
   * turned; the sheet itself is rebuilt when a new graph loads. */

  _params: null, _paramsDirty: null,
  /* the panel's own memory: sections folded away (by group id) and the strip
   * form — both survive rebuilds within a session; the strip is remembered
   * per browser, since it is a way of working, not a state of one graph */
  _pmFold: new Set(),
  _pmStrip: (() => { try { return localStorage.getItem('weft:paramsStrip') === '1'; } catch (e) { return false; } })(),

  isControl(n) {
    const d = NODE_DEFS[n.type];
    return !!(d && d.cat === 'Params' && d.buildBody && !d.inspect && !d.relay);
  },

  /* controls in the loom's reading order. A section is a group frame (its
   * title is the header) or the one unnamed section of loose controls;
   * sections and the controls inside them read top-to-bottom, left-to-right
   * by where they sit — banded into 60px rows so a row of dials reads left
   * to right instead of by the pixel. A folded frame still lists its
   * controls: folding the plumbing away and playing it from here is the
   * point. */
  paramSections() {
    const band = o => Math.round(o.y / 60);
    const byPos = (a, b) => band(a) - band(b) || a.x - b.x;
    const owner = new Map();
    for (const f of App.graph.groups || []) for (const id of f.nodes) if (!owner.has(id)) owner.set(id, f);
    const secs = new Map();
    for (const n of App.graph.nodes) {
      if (!App.isControl(n)) continue;
      const f = owner.get(n.id);
      const key = f ? f.id : '';
      let s = secs.get(key);
      if (!s) { s = { id: key, title: f ? (f.title || 'group') : '', x: f ? f.x : 0, y: f ? f.y : 0, nodes: [] }; secs.set(key, s); }
      s.nodes.push(n);
    }
    const out = [...secs.values()];
    for (const s of out) {
      s.nodes.sort(byPos);
      if (!s.id) { s.x = s.nodes[0].x; s.y = s.nodes[0].y; } // loose controls sit where their first one does
    }
    return out.sort(byPos);
  },

  /* the strip: the open panel folded to a 36px bar at the loom's left, so a
   * long session keeps the params a tap away without the panel eating the loom */
  stripParams(on) {
    App._pmStrip = !!on;
    try { localStorage.setItem('weft:paramsStrip', on ? '1' : '0'); } catch (e) {}
    if (App._params) App.toggleParams(true);
  },

  toggleParams(on) {
    const ed = document.getElementById('editor');
    const want = on === undefined ? !App._params : !!on;
    const flushDirty = () => { for (const id of App._paramsDirty || []) Editor.rebuildNode(id); App._paramsDirty = null; };
    if (!want) {
      if (!App._params) return;
      App._params.remove(); App._params = null;
      ed.classList.remove('params-open', 'params-strip');
      flushDirty();
      return;
    }
    let scrollTop = 0;
    if (App._params) { const l = App._params.querySelector('.pm-list'); scrollTop = l ? l.scrollTop : 0; App._params.remove(); }
    const sections = App.paramSections();
    const count = sections.reduce((a, s) => a + s.nodes.length, 0);
    const countText = count ? count + (count === 1 ? ' control' : ' controls') : '';
    const sheet = document.createElement('div');
    sheet.id = 'params';
    if (App._pmStrip && !App.isMobile()) {
      // the strip has no rows, so the cards catch up now rather than at close
      flushDirty();
      sheet.className = 'strip';
      sheet.innerHTML = `<button class="pm-strip" title="params — open the panel">${weftUISVG('params')}<span class="pm-strip-label">params</span><span class="pm-strip-count">${count || ''}</span></button>`;
      sheet.querySelector('.pm-strip').addEventListener('click', () => App.stripParams(false));
      sheet.addEventListener('pointerdown', e => e.stopPropagation());
      ed.appendChild(sheet);
      ed.classList.add('params-open', 'params-strip');
      App._params = sheet;
      return;
    }
    // a slider wants the full width; a dial, a toggle, a swatch, a button sit three to a row
    const COMPACT = new Set(['params/angle', 'params/knob', 'params/toggle', 'params/swatch', 'params/button']);
    // sliders, knobs and angles carry their own label widget — the rest get a name line
    const OWN_LABEL = new Set(['params/slider', 'params/knob', 'params/angle']);
    sheet.innerHTML = `<div class="pm-head"><span class="pm-title">params</span><span class="pm-count">${countText}</span><button class="pm-min" title="fold to a strip">‹</button><button class="pm-x" title="back to the loom">✕</button></div><div class="pm-list"></div>`;
    const list = sheet.querySelector('.pm-list');
    App._paramsDirty = App._paramsDirty || new Set();
    // one unnamed section needs no header; the moment there is a group, every section gets one
    const headed = sections.length > 1 || (sections.length === 1 && !!sections[0].id);
    for (const sec of sections) {
      const folded = !!sec.id && App._pmFold.has(sec.id);
      if (headed) {
        const h = document.createElement('div');
        h.className = 'pm-sec' + (folded ? ' folded' : '') + (sec.id ? '' : ' loose');
        h.innerHTML = `<span class="pm-sec-chev">▾</span><span class="pm-sec-title"></span><span class="pm-sec-count">${sec.nodes.length}</span>`;
        h.querySelector('.pm-sec-title').textContent = sec.title || 'loose';
        if (sec.id) {
          h.title = folded ? 'unfold this section' : 'fold this section away';
          h.addEventListener('click', () => {
            if (App._pmFold.has(sec.id)) App._pmFold.delete(sec.id); else App._pmFold.add(sec.id);
            App.toggleParams(true);
          });
        }
        list.appendChild(h);
      }
      if (folded) continue;
      for (const n of sec.nodes) {
        const def = NODE_DEFS[n.type];
        const row = document.createElement('div');
        row.className = 'pm-row ' + (COMPACT.has(n.type) ? 'compact' : 'wide');
        row.dataset.id = n.id;
        row.style.setProperty('--cat', CATS[def.cat] || '#6b7891');
        const lab = document.createElement('div');
        lab.className = 'pm-label';
        lab.textContent = def.title; // the eyebrow: what kind of control
        row.appendChild(lab);
        const name = n.label || (n.values && n.values.label);
        if (name && !OWN_LABEL.has(n.type)) {
          const nm = document.createElement('div');
          nm.className = 'pm-name';
          nm.textContent = name;
          row.appendChild(nm);
        }
        const body = document.createElement('div');
        body.className = 'node-body pm-body';
        row.appendChild(body);
        def.buildBody(n, body, () => { App._paramsDirty.add(n.id); App._paramsSelfAt = performance.now(); App.onGraphChanged(); });
        list.appendChild(row);
      }
    }
    if (!count) list.innerHTML = '<p class="pm-empty">no controls on the loom yet — add a slider, knob, toggle, swatch or button and it shows up here.</p>';
    sheet.querySelector('.pm-x').addEventListener('click', () => App.toggleParams(false));
    sheet.querySelector('.pm-min').addEventListener('click', () => App.stripParams(true));
    sheet.addEventListener('pointerdown', e => e.stopPropagation()); // the loom's gestures stop at the sheet
    ed.appendChild(sheet);
    ed.classList.add('params-open');
    ed.classList.remove('params-strip');
    App._params = sheet;
    if (scrollTop) list.scrollTop = scrollTop;
  },

  /* the viewport calls this each frame after Editor.postEval — rows whose
   * def has a postEval (the anchor's x/y fields) mirror the node like the card */
  paramsPostEval(ctx) {
    if (!App._params) return;
    for (const row of App._params.querySelectorAll('.pm-row')) {
      const n = App.graph.nodes.find(x => x.id === row.dataset.id);
      const def = n && NODE_DEFS[n.type];
      if (def && def.postEval) { try { def.postEval(n, row, ctx); } catch (e) { /* a sheet row never breaks the frame */ } }
    }
  },

  /* ------------------------------ splitter ------------------------------
   * side by side it sizes the cloth's width; stacked (mobile) its height */

  bindSplitter() {
    const splitter = document.getElementById('splitter');
    const preview = document.getElementById('preview');
    let drag = null;
    splitter.addEventListener('pointerdown', e => {
      const r = preview.getBoundingClientRect();
      drag = { sx: e.clientX, sy: e.clientY, w: r.width, h: r.height, stacked: App.isMobile() };
      splitter.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    splitter.addEventListener('pointermove', e => {
      if (!drag) return;
      if (drag.stacked) {
        // the loom keeps at least room for its tools; the cloth at least a glimpse
        const h = LM.clamp(drag.h + (e.clientY - drag.sy), 120, window.innerHeight - 48 - 24 - 14 - 70);
        preview.style.flexBasis = h + 'px';
      } else {
        const w = LM.clamp(drag.w + (drag.sx - e.clientX), 240, window.innerWidth * 0.7);
        preview.style.flexBasis = w + 'px';
      }
    });
    splitter.addEventListener('pointerup', () => {
      if (drag && drag.stacked) {
        try { localStorage.setItem('weft:clothH', String(Math.round(preview.getBoundingClientRect().height))); } catch (e) {}
      }
      drag = null;
    });
  }
};

window.addEventListener('DOMContentLoaded', App.init);
