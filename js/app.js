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
      nodes: App.graph.nodes.map(n => {
        const o = { id: n.id, type: n.type, x: n.x, y: n.y, values: n.values };
        if (n.enabled === false) o.enabled = false;
        if (n.preview === false) o.preview = false;
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

    const g = App.restore() || App.migrate(JSON.parse(JSON.stringify(EXAMPLES['Phyllotaxis'])));
    App.setGraph(g);
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
    const order = ['Params', 'Input', 'State', 'Maths', 'Sets', 'Vector', 'Curve', 'Transform', 'Display'];

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
    const order = ['number', 'point', 'vector', 'geometry', 'color', 'bool', 'string', 'any'];
    body.innerHTML = order.map(t =>
      `<div class="tk-row"><span class="tk-line" style="background:${TYPE_COLORS[t]}"></span>${t}</div>`).join('') +
      `<div class="tk-note">wires take the colour of their source output</div>`;
    document.querySelector('#typeKey .tk-head').addEventListener('click', () => {
      document.getElementById('typeKey').classList.toggle('closed');
    });
  },

  /* ------------------------------ toolbar ------------------------------ */

  bindToolbar() {
    const sel = document.getElementById('exampleSelect');
    for (const name of Object.keys(EXAMPLES)) {
      const o = document.createElement('option');
      o.value = name; o.textContent = name;
      sel.appendChild(o);
    }
    sel.addEventListener('change', async () => {
      const name = sel.value;
      sel.value = '';
      if (!name) return;
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
        if (r === null) return;
        if (r === 'save') App.saveGraph();
      }
      try { localStorage.setItem('weft:backup', JSON.stringify(App.serialize())); } catch (e) {}
      App.setGraph(JSON.parse(JSON.stringify(EXAMPLES[name])));
      Editor.zoomToFit(false);
      App.flash('loaded example: ' + name);
    });

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

    document.getElementById('btnNew').addEventListener('click', () => {
      try { localStorage.setItem('weft:backup', JSON.stringify(App.serialize())); } catch (e) {}
      App.setGraph({ format: GRAPH_FORMAT, nodes: [], wires: [] });
      App.flash('canvas cleared — previous graph backed up');
    });

    document.getElementById('btnSave').addEventListener('click', () => App.saveGraph());
    document.getElementById('btnSaveAs').addEventListener('click', () => App.saveGraphAs());

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

    document.getElementById('btnExport').addEventListener('click', () => {
      if (!App.graph.nodes.length) { App.flash('nothing to export — the canvas is empty'); return; }
      code.value = WeftExport.buildJS(App.graph);
      modal.classList.remove('hidden');
    });
    document.getElementById('exportClose').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('pointerdown', e => { if (e.target === modal) modal.classList.add('hidden'); });

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
