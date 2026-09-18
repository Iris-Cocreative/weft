/* Tour — the first-visit welcome and the guided walk round the interface.
 *
 * The welcome is one modal: what weft is, the loom/cloth idea, and a place
 * to paste the weave assistant's shared key if the visitor has one (it goes
 * straight into Assistant.saveCfg — nothing here talks to the network). It
 * shows once (localStorage 'weft:welcomed') and again from the settings
 * popover. The tour is a short series of cards, each pinned to one part of
 * the interface with a spotlight cut out of a dim overlay; ← → Esc work.
 * Editor-only: nothing in here is serialized or exported. */

const Tour = {
  el: null,       // the tour overlay while a tour runs
  step: -1,

  /* one card per part of the interface. `at` is a selector; a step whose
   * target is missing or hidden is skipped so the tour survives layout
   * changes. `place` says which side of the target the card prefers. */
  STEPS: [
    { at: '#editor', place: 'center', title: 'the loom',
      body: 'this is where the logic is woven. every card is a node; every wire carries a list of values from an output (right side) to an input (left side). drag from a port to make a wire · right-drag or the wheel to pan and zoom · drag on empty space to box-select · double-click a card’s head to fold it.' },
    { at: '#palette', place: 'right', title: 'the node library',
      body: 'every node weft speaks, by category. search by name, then click one to drop it at the center of the loom or drag it exactly where you want it. right-clicking the loom opens the same list in place.' },
    { at: '#preview', place: 'left', title: 'the cloth',
      body: 'the live render. whatever reaches a Draw node is painted here, re-woven every frame as sliders, time, the mouse and the keyboard flow through the graph. ctrl-wheel zooms toward the cursor, ctrl-drag pans; the buttons at the top pause time and set the concert pitch.' },
    { at: '#typeKey', place: 'left', title: 'wire colors are types',
      body: 'blue is a number, green a point, gold geometry… a port only takes wires of its type (or any). the key lives here whenever you need it — click its title to fold it away.' },
    { at: '#loomTools', place: 'left', title: 'loom tools',
      body: 'zoom to fit (Home fits all, F the selection) · merge floats the loom over the cloth · toggle the draw display and the geometry previews on the cloth · settings, and this tour again.' },
    { at: '#btnAssist', place: 'left', title: 'the weave assistant',
      body: 'describe what you want — “make the circles breathe”, “tidy the loom”, “group these by what they do” — and a model edits the graph for you. it only needs the shared key; every change is one Ctrl+Z from undone.' },
    { at: '#toolbar .tools', place: 'below', title: 'save, share, export',
      body: 'your graph autosaves in this browser. Save downloads it as JSON; Share copies a link that carries the whole patch; Export JS compiles it to one standalone file that runs on any page with no weft at all.' },
    { at: '#btnGallery', place: 'below', title: 'the examples',
      body: 'the fastest way to learn is to open an example and pull on things. the gallery is searchable and every patch there is small enough to read.' }
  ],

  seen() { try { return localStorage.getItem('weft:welcomed') === '1'; } catch (e) { return false; } },
  markSeen() { try { localStorage.setItem('weft:welcomed', '1'); } catch (e) {} },

  /* ---------------------------- welcome modal ---------------------------- */

  welcome() {
    const old = document.getElementById('welcomeModal');
    if (old) old.remove();
    const hasKey = typeof Assistant !== 'undefined' && !!Assistant.cfg().key;
    const side = (typeof App !== 'undefined' && App.isMobile && App.isMobile()) ? ['below', 'above'] : ['left', 'right'];
    const ico = kind => typeof weftWelcomeSVG === 'function' ? weftWelcomeSVG(kind, 'wl') : '';
    const modal = document.createElement('div');
    modal.id = 'welcomeModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-box welcome">
        <div class="wl-hero">
          <span class="wl-mark">${typeof weftLogoSVG === 'function' ? weftLogoSVG('wl') : ''}</span>
          <div>
            <div class="wl-title">welcome to weft</div>
            <div class="wl-sub">weave parameters into web experiences</div>
          </div>
          <button class="ghost wl-x" title="close">✕</button>
        </div>
        <p class="wl-p">weft is a node-based parametric designer that runs entirely in your browser. you build logic by wiring cards together on the <b>loom</b> (${side[0]}) and the <b>cloth</b> (${side[1]}) wears the result, live — change anything and the design re-weaves itself.</p>
        <div class="wl-cards">
          <div class="wl-card"><span class="wl-ico">${ico('form')}</span><b>weave math into form</b>wire a few simple functions together and a handful of numbers becomes a shape, a motion, a whole scene. each card is one small idea; the wires do the composing.</div>
          <div class="wl-card"><span class="wl-ico">${ico('visible')}</span><b>make code visible</b>nothing is buried in a script. the logic sits on the loom in the open — every value live, every connection drawn — so you can follow it, change it, and make it yours.</div>
          <div class="wl-card"><span class="wl-ico">${ico('domains')}</span><b>combine domains creatively</b>a chart can drive a shape, a shape can play a sound, a sound can bend a 3D form. everything on the loom speaks the same language, so anything can feed anything.</div>
        </div>
        <div class="wl-key ${hasKey ? 'hidden' : ''}">
          <p class="wl-p">have a shared key for the <b>weave assistant</b>? paste it here and a model can edit the loom for you when you describe what you want. optional — it stays in this browser only.</p>
          <div class="wl-keyrow">
            <input class="wl-keyin" type="password" placeholder="shared key (optional)" spellcheck="false" autocomplete="off">
            <input class="wl-namein" placeholder="your name (optional)" spellcheck="false" maxlength="40">
          </div>
        </div>
        <p class="wl-p wl-fine">your graphs stay in your browser — nothing is uploaded, nothing is tracked. the <a href="about.html" target="_blank" rel="noopener">about page</a> says more.</p>
        <div class="modal-actions">
          <button class="wl-skip">just start weaving</button>
          <button class="wl-tour accent">take the tour</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    // a tap holds a card's gesture where there is no hover to trigger it
    for (const c of modal.querySelectorAll('.wl-card')) c.addEventListener('click', () => c.classList.toggle('on'));

    const keyIn = modal.querySelector('.wl-keyin');
    const nameIn = modal.querySelector('.wl-namein');
    const saveKey = () => {
      const key = keyIn.value.trim();
      if (!key || typeof Assistant === 'undefined') return;
      const cfg = Assistant.cfg();
      Assistant.saveCfg({ url: cfg.url || Assistant.DEFAULT_URL, key, name: nameIn.value.trim() });
      App.flash('weave assistant connected — the ✦ button at the top right of the loom opens it');
    };
    const close = tour => {
      saveKey();
      Tour.markSeen();
      modal.remove();
      window.removeEventListener('keydown', onKey, true);
      if (tour) Tour.start();
    };
    const onKey = e => {
      if (e.key === 'Escape') { e.stopPropagation(); close(false); }
      else if (e.key === 'Enter' && (e.target === keyIn || e.target === nameIn)) { e.stopPropagation(); close(true); }
    };
    window.addEventListener('keydown', onKey, true);
    modal.addEventListener('pointerdown', e => { if (e.target === modal) close(false); });
    modal.querySelector('.wl-x').addEventListener('click', () => close(false));
    modal.querySelector('.wl-skip').addEventListener('click', () => close(false));
    modal.querySelector('.wl-tour').addEventListener('click', () => close(true));
  },

  /* ------------------------------- the tour ------------------------------- */

  visible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
  },

  start() {
    Tour.stop();
    const el = document.createElement('div');
    el.id = 'tour';
    el.innerHTML = `
      <div class="tour-dim"></div>
      <div class="tour-spot"></div>
      <div class="tour-card">
        <div class="tour-n"></div>
        <div class="tour-title"></div>
        <div class="tour-body"></div>
        <div class="tour-nav">
          <button class="tour-skip" title="end the tour (Esc)">skip</button>
          <span class="tour-dots"></span>
          <button class="tour-back" title="←">back</button>
          <button class="tour-next accent" title="→">next</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    Tour.el = el;
    el.querySelector('.tour-skip').addEventListener('click', () => Tour.stop());
    el.querySelector('.tour-back').addEventListener('click', () => Tour.go(-1));
    el.querySelector('.tour-next').addEventListener('click', () => Tour.go(1));
    el.querySelector('.tour-dim').addEventListener('pointerdown', () => Tour.stop());
    Tour._onKey = e => {
      if (e.key === 'Escape') { e.stopPropagation(); Tour.stop(); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.stopPropagation(); Tour.go(1); }
      else if (e.key === 'ArrowLeft') { e.stopPropagation(); Tour.go(-1); }
    };
    window.addEventListener('keydown', Tour._onKey, true);
    Tour._onResize = () => Tour.show();
    window.addEventListener('resize', Tour._onResize);
    Tour.step = -1;
    Tour.go(1);
  },

  stop() {
    if (!Tour.el) return;
    Tour.el.remove();
    Tour.el = null;
    window.removeEventListener('keydown', Tour._onKey, true);
    window.removeEventListener('resize', Tour._onResize);
    Tour.step = -1;
  },

  /* move dir steps, skipping targets that aren't on screen */
  go(dir) {
    let i = Tour.step;
    for (;;) {
      i += dir;
      if (i < 0) return;
      if (i >= Tour.STEPS.length) { Tour.stop(); App.flash('that’s the loom — open an example and pull on things'); return; }
      if (Tour.visible(document.querySelector(Tour.STEPS[i].at))) break;
    }
    Tour.step = i;
    Tour.show();
  },

  show() {
    if (!Tour.el || Tour.step < 0) return;
    const s = Tour.STEPS[Tour.step];
    const target = document.querySelector(s.at);
    if (!Tour.visible(target)) return Tour.go(1);
    const r = target.getBoundingClientRect();
    const pad = s.place === 'center' ? 0 : 6;
    const spot = Tour.el.querySelector('.tour-spot');
    spot.style.left = (r.left - pad) + 'px';
    spot.style.top = (r.top - pad) + 'px';
    spot.style.width = (r.width + pad * 2) + 'px';
    spot.style.height = (r.height + pad * 2) + 'px';

    const card = Tour.el.querySelector('.tour-card');
    Tour.el.querySelector('.tour-n').textContent = (Tour.step + 1) + ' / ' + Tour.STEPS.length;
    Tour.el.querySelector('.tour-title').textContent = s.title;
    Tour.el.querySelector('.tour-body').textContent = s.body;
    Tour.el.querySelector('.tour-dots').innerHTML = Tour.STEPS.map((_, i) => '<i class="' + (i === Tour.step ? 'on' : '') + '"></i>').join('');
    Tour.el.querySelector('.tour-back').disabled = Tour.step === 0;
    Tour.el.querySelector('.tour-next').textContent = Tour.step === Tour.STEPS.length - 1 ? 'done' : 'next';

    // place the card on the preferred side, falling back to wherever it fits
    const W = window.innerWidth, H = window.innerHeight, gap = 14;
    const cw = Math.min(340, W - 24);
    card.style.width = cw + 'px';
    const ch = card.offsetHeight || 200;
    let x, y;
    const fits = p => p === 'right' ? r.right + gap + cw <= W : p === 'left' ? r.left - gap - cw >= 0 : p === 'below' ? r.bottom + gap + ch <= H : p === 'above' ? r.top - gap - ch >= 0 : true;
    let place = s.place;
    if (place !== 'center' && !fits(place)) place = ['right', 'left', 'below', 'above'].find(fits) || 'center';
    if (place === 'right') { x = r.right + gap; y = r.top + r.height / 2 - ch / 2; }
    else if (place === 'left') { x = r.left - gap - cw; y = r.top + r.height / 2 - ch / 2; }
    else if (place === 'below') { x = r.left + r.width / 2 - cw / 2; y = r.bottom + gap; }
    else if (place === 'above') { x = r.left + r.width / 2 - cw / 2; y = r.top - gap - ch; }
    else { x = r.left + r.width / 2 - cw / 2; y = r.top + r.height / 2 - ch / 2; }
    x = Math.max(12, Math.min(W - cw - 12, x));
    y = Math.max(12, Math.min(H - ch - 12, y));
    card.style.left = Math.round(x) + 'px';
    card.style.top = Math.round(y) + 'px';
    card.dataset.place = place;
  },

  init() {
    // a row in the settings popover brings the welcome (and the tour) back
    const btn = document.getElementById('btnSettings');
    if (btn) btn.addEventListener('click', () => {
      const pop = document.getElementById('settingsPop');
      if (!pop || pop.querySelector('.set-tour')) return;
      const row = document.createElement('button');
      row.className = 'set-row set-tour';
      row.textContent = '✦ welcome & tour';
      row.title = 'the first-visit welcome and the guided tour of the interface';
      // close through the button so the popover's own state agrees it's gone
      row.addEventListener('click', () => { btn.click(); Tour.welcome(); });
      pop.appendChild(row);
    });
    if (!Tour.seen()) setTimeout(() => Tour.welcome(), 400);
  }
};

window.addEventListener('DOMContentLoaded', () => Tour.init());
