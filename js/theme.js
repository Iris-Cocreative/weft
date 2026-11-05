/* Theme — light / dark. Weft is dark by default; the light theme re-tokens the whole app
 * (style.css, "light theme"): chrome, cards, loom, cloth, gallery.
 *
 * The root's data-theme ("light" | "dark") is what style.css reads. It is chosen, in order:
 *   1. the toolbar toggle (system → light → dark), kept in localStorage 'weft:theme'
 *   2. a data-theme an embedder put on <html>, before this script ran or after (it is watched)
 *   3. the OS: prefers-color-scheme
 * Loaded in <head> so the theme is set before first paint. Editor-only, never exported. */
const Theme = {
  KEY: 'weft:theme',
  MODES: ['system', 'light', 'dark'],
  GLYPH: { system: '◐', light: '☀', dark: '☾' },
  _embed: (() => { const t = document.documentElement.getAttribute('data-theme'); return t === 'light' || t === 'dark' ? t : ''; })(),
  _mq: window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null,

  mode() {
    try { const m = localStorage.getItem(Theme.KEY); if (m === 'light' || m === 'dark') return m; } catch (e) {}
    return 'system';
  },
  effective() {
    const m = Theme.mode();
    if (m !== 'system') return m;
    return Theme._embed || (Theme._mq && Theme._mq.matches ? 'light' : 'dark');
  },
  /* what canvas code needs (the cloth clear colour, the card widgets' ink), read from the
   * CSS tokens so style.css stays the one place a theme is defined */
  cloth: '#0b0e14', anchorFill: 'rgba(11,14,20,0.85)', sketchWire: 'rgba(219,226,238,0.28)',
  _ink: '255,255,255', _accent: '94,234,212', _sel: '74,222,128',
  ink(a) { return 'rgba(' + Theme._ink + ',' + a + ')'; },
  accent(a) { return 'rgba(' + Theme._accent + ',' + a + ')'; },
  sel(a) { return 'rgba(' + Theme._sel + ',' + a + ')'; },
  _listeners: [],
  onChange(fn) { Theme._listeners.push(fn); },
  _read() {
    const cs = getComputedStyle(document.documentElement), v = n => cs.getPropertyValue(n).trim();
    Theme.cloth = v('--cloth') || Theme.cloth;
    Theme.anchorFill = v('--anchor-fill') || Theme.anchorFill;
    Theme.sketchWire = v('--sketch-wire') || Theme.sketchWire;
    Theme._ink = v('--ink') || Theme._ink;
    Theme._accent = v('--accent-rgb') || Theme._accent;
    Theme._sel = v('--sel-rgb') || Theme._sel;
  },
  _cur: '', _set: '',
  apply() {
    const root = document.documentElement, t = Theme.effective();
    Theme._set = t; // our own write, so the watcher below can tell it from an embedder's
    if (root.getAttribute('data-theme') !== t) root.setAttribute('data-theme', t);
    Theme._read();
    if (t !== Theme._cur) { Theme._cur = t; for (const fn of Theme._listeners) fn(); }
    const b = document.getElementById('btnTheme');
    if (b) {
      const m = Theme.mode();
      b.textContent = Theme.GLYPH[m] + ' ' + m;
      b.title = 'Theme: ' + m + ' — click for ' + Theme.MODES[(Theme.MODES.indexOf(m) + 1) % 3];
    }
  },
  /* an embedder that sets data-theme after load (a host app following its own theme) is heard too */
  watch() {
    if (!window.MutationObserver) return;
    new MutationObserver(() => {
      const v = document.documentElement.getAttribute('data-theme');
      if (v === Theme._set) return;
      if (v === 'light' || v === 'dark') Theme._embed = v;
      Theme.apply();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  },
  cycle() {
    const next = Theme.MODES[(Theme.MODES.indexOf(Theme.mode()) + 1) % 3];
    try { if (next === 'system') localStorage.removeItem(Theme.KEY); else localStorage.setItem(Theme.KEY, next); } catch (e) {}
    Theme.apply();
  },
  bind() {
    const b = document.getElementById('btnTheme');
    if (b) b.addEventListener('click', Theme.cycle);
    if (Theme._mq && Theme._mq.addEventListener) Theme._mq.addEventListener('change', Theme.apply);
    Theme.apply();
  }
};
Theme.apply();
Theme.watch();
window.addEventListener('DOMContentLoaded', Theme.bind);
