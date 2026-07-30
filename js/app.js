'use strict';
/* Weft app shell — palette, toolbar, persistence, history (undo/redo), export modal, splitter. */

const GRAPH_FORMAT = 1;

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
    // future stepwise migrations go here: if (g.format === 1) { ...; g.format = 2; }
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
        return o;
      }),
      wires: App.graph.wires.map(w => ({ id: w.id, from: w.from, to: w.to }))
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
    }, 400);
  },

  writeStorage() {
    try { localStorage.setItem('weft:autosave', JSON.stringify(App.serialize())); } catch (e) { /* storage unavailable */ }
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
   * The whole graph rides in the URL hash: #w= deflate-raw + base64url (or
   * #wj= plain base64url JSON where CompressionStream is unavailable).
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

  async shareLink() {
    if (!App.graph.nodes.length) { App.flash('nothing to share — the canvas is empty'); return; }
    App._flushPending();
    const bytes = new TextEncoder().encode(JSON.stringify(App.serialize()));
    const canDeflate = typeof CompressionStream !== 'undefined';
    const hash = canDeflate
      ? '#w=' + App._b64(await App._pipe(bytes, new CompressionStream('deflate-raw')))
      : '#wj=' + App._b64(bytes);
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
    const m = /^#(w|wj)=([A-Za-z0-9_-]+)$/.exec(location.hash || '');
    if (!m) return false;
    const clear = () => { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} };
    try {
      let bytes = App._unb64(m[2]);
      if (m[1] === 'w') bytes = await App._pipe(bytes, new DecompressionStream('deflate-raw'));
      const g = App.migrate(JSON.parse(new TextDecoder().decode(bytes)));
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

  /* ------------------------------ save to file ------------------------------ */

  saveGraph() {
    App.download(App._fileName, JSON.stringify(App.serialize(), null, 2), 'application/json');
    App._dirty = false;
    App.flash('saved ' + App._fileName);
  },

  async saveGraphAs() {
    let name = await App.ask({
      title: 'save as',
      input: App._fileName,
      buttons: [{ label: 'Save', value: 'save', accent: true }, { label: 'Cancel', value: null }]
    });
    if (!name) return;
    if (!/\.(json|weft)$/i.test(name)) name += '.json';
    App._fileName = name;
    try { localStorage.setItem('weft:filename', name); } catch (e) {}
    App.saveGraph();
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

    const g = App.restore() || App.migrate(JSON.parse(JSON.stringify(EXAMPLES['Hexa graph'])));
    App.setGraph(g);
    App.loadFromHash(); // a #w= share link replaces the graph (previous one is backed up)
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
    window.addEventListener('pointerup', e => {
      if (!pd) return;
      const p = pd;
      pd = null;
      if (!p.ghost) {
        if (e.target.closest && e.target.closest('.pal-item')) Editor.addAtCenter(p.type);
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
      `<div class="tk-note">wires take the colour of their source output</div>`;
    document.querySelector('#typeKey .tk-head').addEventListener('click', () => {
      document.getElementById('typeKey').classList.toggle('closed');
    });
  },

  /* ------------------------------ examples ------------------------------ */

  /* Load an example by name: dirty-check → back up the current graph → set →
   * fit → flash. Resolves false if the user cancelled, so a caller (the
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
      if (r === 'save') App.saveGraph();
    }
    try { localStorage.setItem('weft:backup', JSON.stringify(App.serialize())); } catch (e) {}
    App.setGraph(JSON.parse(JSON.stringify(EXAMPLES[name])));
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
      App.flash('canvas cleared — previous graph backed up');
    });

    document.getElementById('btnSave').addEventListener('click', () => App.saveGraph());
    document.getElementById('btnSaveAs').addEventListener('click', () => App.saveGraphAs());
    document.getElementById('btnShare').addEventListener('click', () => App.shareLink());

    const fileInput = document.getElementById('fileInput');
    document.getElementById('btnLoad').addEventListener('click', () => fileInput.click());
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
      Viewport.playing = !Viewport.playing;
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
      g2.translate(cv.width / 2, cv.height / 2); // coordinates are centred (invariant 3)
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
      url = App.renderThumb(JSON.parse(JSON.stringify(EXAMPLES[name])), 480, 300, m.frames || 40);
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
      // the ask dialog owns Esc while it is up, so a cancelled load keeps the gallery
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

    document.getElementById('btnGallery').addEventListener('click', open);
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

  /* ------------------------------ splitter ------------------------------ */

  bindSplitter() {
    const splitter = document.getElementById('splitter');
    const preview = document.getElementById('preview');
    let drag = null;
    splitter.addEventListener('pointerdown', e => {
      drag = { sx: e.clientX, w: preview.getBoundingClientRect().width };
      splitter.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    splitter.addEventListener('pointermove', e => {
      if (!drag) return;
      const w = LM.clamp(drag.w + (drag.sx - e.clientX), 240, window.innerWidth * 0.7);
      preview.style.flexBasis = w + 'px';
    });
    splitter.addEventListener('pointerup', () => { drag = null; });
  }
};

window.addEventListener('DOMContentLoaded', App.init);
