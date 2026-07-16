'use strict';
/*
 * Weft audio host — reconciles ctx.audioList descriptors into a live Web Audio
 * graph. Audio wires carry handle strings (descriptor ids), never samples; this
 * is where sound actually happens. makeHost is ONE self-contained function
 * expression: it is serialized with Function.prototype.toString() into exports
 * (same mechanism as LM), so it must not close over anything in this file.
 */
const WeftAudio = {
  makeHost: function () {
    let actx = null, noiseBuf = null, unlockHooked = false, master = null, muted = false;
    const live = {}; // id -> { kind, main, in?, out?, srcs, srcKey, last }
    const levels = {}; // id -> { level, ready } — mic read-back, exposed via state()
    const EPS = 1e-4, TC = 0.02; // change gate + setTargetAtTime smoothing (no zipper noise)
    const ensureCtx = () => {
      if (!actx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        actx = new AC();
        /* master bus: every Audio Out mixes here, through a brickwall-ish
         * limiter, so stacked voices can't blow out speakers (or ears) */
        const lim = actx.createDynamicsCompressor();
        lim.threshold.value = -6; lim.knee.value = 3; lim.ratio.value = 20;
        lim.attack.value = 0.002; lim.release.value = 0.15;
        lim.connect(actx.destination);
        master = actx.createGain();
        master.gain.value = muted ? 0 : 1;
        master.connect(lim);
      }
      if (actx.state === 'suspended' && !unlockHooked) {
        /* browsers refuse sound before a gesture — resume on the first one */
        unlockHooked = true;
        const unlock = () => { if (actx.state === 'suspended') actx.resume(); };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
      }
      return actx;
    };
    const noise = () => {
      if (!noiseBuf) {
        const n = actx.sampleRate * 2, b = actx.createBuffer(1, n, actx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        noiseBuf = b;
      }
      return noiseBuf;
    };
    const setP = (e, name, param, v) => {
      if (e.last[name] !== undefined && Math.abs(e.last[name] - v) < EPS) return;
      e.last[name] = v;
      param.setTargetAtTime(v, actx.currentTime, TC);
    };
    const make = d => {
      const e = { kind: d.kind, srcs: [], srcKey: '', last: {} };
      if (d.kind === 'osc') {
        const o = actx.createOscillator();
        o.type = d.wave; o.frequency.value = d.freq; o.detune.value = d.detune;
        o.start(); e.main = o; e.out = o;
      } else if (d.kind === 'noise') {
        const s = actx.createBufferSource();
        s.buffer = noise(); s.loop = true; s.start();
        e.main = s; e.out = s;
      } else if (d.kind === 'gain') {
        const g = actx.createGain(); g.gain.value = d.gain;
        e.main = g; e.in = g; e.out = g;
      } else if (d.kind === 'filter') {
        const f = actx.createBiquadFilter();
        f.type = d.mode; f.frequency.value = d.freq; f.Q.value = d.q;
        e.main = f; e.in = f; e.out = f;
      } else if (d.kind === 'out') {
        const g = actx.createGain(); g.gain.value = d.vol;
        g.connect(master);
        e.main = g; e.in = g;
      } else if (d.kind === 'path') {
        /* looped waveform playback (Path to Audio). The unity gain is the
         * stable connection point — the buffer source swaps behind it
         * whenever the sampled path changes (sources can't restart) */
        const g = actx.createGain(); g.gain.value = 1;
        e.main = g; e.out = g; e.key = null;
      } else if (d.kind === 'scope') {
        /* a tap, not a route: whatever wires in gets analysed, never forwarded.
         * The zero-gain leg to master keeps the branch alive even when the
         * tapped source reaches no speaker (an XY pair, say) — silent, but
         * the graph keeps pulling samples through it */
        const an = actx.createAnalyser();
        an.fftSize = 2048; an.smoothingTimeConstant = 0;
        const z = actx.createGain(); z.gain.value = 0;
        an.connect(z); z.connect(master);
        e.main = an; e.in = an; e.z = z; e.buf = new Float32Array(an.fftSize);
      } else if (d.kind === 'mic' || d.kind === 'pitch') {
        /* microphone → analyser only: never routed toward the speakers (no
         * feedback squeal); loudness (and, for pitch, the tracked frequency)
         * flows back to the graph as numbers. pitch needs a longer window */
        const an = actx.createAnalyser();
        an.fftSize = d.kind === 'pitch' ? 2048 : 512;
        an.smoothingTimeConstant = 0;
        e.main = an; e.buf = new Float32Array(an.fftSize);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            if (live[d.id] !== e) { stream.getTracks().forEach(t => t.stop()); return; }
            e.stream = stream;
            e.src = actx.createMediaStreamSource(stream);
            e.src.connect(an);
          }).catch(() => { });
        }
      } else if (d.kind === 'track') {
        /* computer audio in — getDisplayMedia demands a user gesture, so the
         * share picker opens on the first click after the node appears. Video
         * track is mandatory in the API; it gets stopped immediately */
        const g = actx.createGain(); g.gain.value = d.gain;
        const an = actx.createAnalyser();
        an.fftSize = 512; an.smoothingTimeConstant = 0;
        g.connect(an);
        e.main = g; e.out = g; e.an = an; e.buf = new Float32Array(an.fftSize);
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          e.arm = () => {
            if (live[d.id] !== e || e.prompted) return;
            e.prompted = true;
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(stream => {
              if (live[d.id] !== e) { stream.getTracks().forEach(t => t.stop()); return; }
              stream.getVideoTracks().forEach(t => t.stop()); // only the sound is wanted
              if (!stream.getAudioTracks().length) { stream.getTracks().forEach(t => t.stop()); return; }
              e.stream = stream;
              e.src = actx.createMediaStreamSource(stream);
              e.src.connect(g);
            }).catch(() => { });
          };
          window.addEventListener('pointerdown', e.arm, { once: true });
        }
      }
      return e;
    };
    const update = (e, d) => {
      const m = e.main;
      if (d.kind === 'osc') {
        if (m.type !== d.wave) m.type = d.wave; // live-assignable, no recreate
        setP(e, 'f', m.frequency, d.freq); setP(e, 'd', m.detune, d.detune);
      } else if (d.kind === 'gain') setP(e, 'g', m.gain, d.gain);
      else if (d.kind === 'filter') {
        if (m.type !== d.mode) m.type = d.mode;
        setP(e, 'f', m.frequency, d.freq); setP(e, 'q', m.Q, d.q);
      } else if (d.kind === 'out') setP(e, 'v', m.gain, d.vol);
      else if (d.kind === 'path') {
        if (d.key !== e.key) {
          e.key = d.key;
          try { if (e.srcNode) { e.srcNode.stop(); e.srcNode.disconnect(); } } catch (err) { }
          const n = d.wave.length;
          const b = actx.createBuffer(1, n, actx.sampleRate);
          const ch = b.getChannelData(0);
          for (let i = 0; i < n; i++) ch[i] = d.wave[i];
          const s = actx.createBufferSource();
          s.buffer = b; s.loop = true;
          s.playbackRate.value = d.freq * n / actx.sampleRate;
          s.connect(m); s.start();
          e.srcNode = s; e.last = {};
        }
        setP(e, 'r', e.srcNode.playbackRate, d.freq * d.wave.length / actx.sampleRate);
      } else if (d.kind === 'scope') {
        if (actx.state === 'running') m.getFloatTimeDomainData(e.buf);
        levels[d.id] = { wave: e.buf, sr: actx.sampleRate, ready: !!(e.srcs && e.srcs.length) };
      } else if (d.kind === 'mic') {
        let lv = 0;
        if (e.src && actx.state === 'running') {
          m.getFloatTimeDomainData(e.buf);
          let sum = 0;
          for (let i = 0; i < e.buf.length; i++) sum += e.buf[i] * e.buf[i];
          lv = Math.min(1, Math.sqrt(sum / e.buf.length) * 3); // rms, ~0..1 for voice
        }
        levels[d.id] = { level: lv, ready: !!e.src };
      } else if (d.kind === 'track') {
        setP(e, 'g', m.gain, d.gain);
        let lv = 0;
        if (e.src && actx.state === 'running') {
          e.an.getFloatTimeDomainData(e.buf);
          let sum = 0;
          for (let i = 0; i < e.buf.length; i++) sum += e.buf[i] * e.buf[i];
          lv = Math.min(1, Math.sqrt(sum / e.buf.length) * 2);
        }
        levels[d.id] = { level: lv, ready: !!e.src };
      } else if (d.kind === 'pitch') {
        /* pitch tracking: normalized autocorrelation on a half-rate copy of
         * the window (voice/instrument range doesn't need 48kHz), then take
         * the FIRST peak within 12% of the global max — the absolute max is
         * often the octave below on harmonic-rich sounds */
        let lv = 0, cl = 0, f = e.freq || 0;
        if (e.src && actx.state === 'running') {
          m.getFloatTimeDomainData(e.buf);
          const n2 = e.buf.length >> 1;
          if (!e.b2) e.b2 = new Float32Array(n2);
          const b = e.b2;
          let sum = 0;
          for (let i = 0; i < n2; i++) { b[i] = e.buf[i << 1]; sum += b[i] * b[i]; }
          lv = Math.min(1, Math.sqrt(sum / n2) * 3);
          if (sum / n2 > 2e-5) { // enough signal to bother
            const sr2 = actx.sampleRate / 2;
            const maxLag = Math.min(Math.floor(sr2 / 60), n2 >> 1);   // floor ~60 Hz
            const minLag = Math.max(8, Math.floor(sr2 / 1200));       // ceiling ~1200 Hz
            const W = n2 - maxLag;
            if (!e.pe) { e.pe = new Float64Array(n2 + 1); e.ac = new Float64Array(maxLag + 2); }
            const pe = e.pe, ac = e.ac;
            for (let i = 0; i < n2; i++) pe[i + 1] = pe[i] + b[i] * b[i];
            const e0 = pe[W];
            let gm = 0;
            for (let lag = minLag; lag <= maxLag; lag++) {
              let s2 = 0;
              for (let i = 0; i < W; i++) s2 += b[i] * b[i + lag];
              const r = s2 / (Math.sqrt(e0 * (pe[W + lag] - pe[lag])) + 1e-9);
              ac[lag] = r;
              if (r > gm) gm = r;
            }
            if (gm > 0.5) {
              const th = gm * 0.88;
              for (let lag = minLag + 1; lag < maxLag; lag++) {
                if (ac[lag] >= th && ac[lag] >= ac[lag - 1] && ac[lag] >= ac[lag + 1]) {
                  const den = ac[lag - 1] - 2 * ac[lag] + ac[lag + 1]; // parabolic refine
                  let off = den ? 0.5 * (ac[lag - 1] - ac[lag + 1]) / den : 0;
                  if (off > 0.5) off = 0.5; else if (off < -0.5) off = -0.5;
                  const nf = sr2 / (lag + off);
                  cl = ac[lag];
                  /* smooth vibrato-scale wobble, jump on real note changes */
                  f = (f > 0 && Math.abs(nf - f) / f < 0.25) ? f + (nf - f) * 0.35 : nf;
                  break;
                }
              }
            }
          }
        }
        e.freq = f;
        levels[d.id] = { freq: f, clarity: cl, level: lv, ready: !!e.src };
      }
    };
    const drop = id => {
      const e = live[id];
      if (!e) return;
      try { if (e.kind === 'osc' || e.kind === 'noise') e.main.stop(); } catch (err) { }
      try { if (e.srcNode) { e.srcNode.stop(); e.srcNode.disconnect(); } } catch (err) { }
      try { if (e.stream) e.stream.getTracks().forEach(t => t.stop()); } catch (err) { }
      try { if (e.arm) window.removeEventListener('pointerdown', e.arm); } catch (err) { }
      try { if (e.an) e.an.disconnect(); } catch (err) { }
      try { if (e.z) e.z.disconnect(); } catch (err) { }
      try { e.main.disconnect(); } catch (err) { }
      delete live[id]; // sources can't restart after stop — a re-appearing id gets a fresh node
      delete levels[id];
    };
    const sync = list => {
      if (!actx && (!list || !list.length)) return; // no AudioContext until the first audio node
      if (!ensureCtx()) return;
      const seen = {};
      for (const d of list) { // pass 1 — create / update
        if (!d || seen[d.id]) continue;
        seen[d.id] = d;
        let e = live[d.id];
        if (e && e.kind !== d.kind) { drop(d.id); e = null; }
        if (!e) e = live[d.id] = make(d);
        update(e, d);
      }
      for (const id in seen) { // pass 2 — diff connections (order-independent)
        const e = live[id];
        if (!e.in) continue;
        const want = (seen[id].src || []).filter(s => live[s] && live[s].out);
        const key = JSON.stringify(want);
        if (key === e.srcKey) continue;
        for (const s of e.srcs) {
          const se = live[s];
          if (se && se.out) { try { se.out.disconnect(e.in); } catch (err) { } }
        }
        for (const s of want) live[s].out.connect(e.in);
        e.srcs = want; e.srcKey = key;
      }
      for (const id in live) if (!seen[id]) drop(id); // pass 3 — remove unseen
    };
    const pending = () => !!(actx && actx.state === 'suspended' && Object.keys(live).length);
    const mute = m => {
      muted = !!m;
      if (actx && master) master.gain.setTargetAtTime(muted ? 0 : 1, actx.currentTime, 0.01);
    };
    const isMuted = () => muted;
    const state = () => levels; // last frame's mic read-back — hosts hand it to computes as ctx.audioState
    return { sync, pending, mute, isMuted, state };
  }
};
