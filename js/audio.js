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
      } else if (d.kind === 'scope') {
        /* a tap, not a route: whatever wires in gets analysed, never forwarded */
        const an = actx.createAnalyser();
        an.fftSize = 2048; an.smoothingTimeConstant = 0;
        e.main = an; e.in = an; e.buf = new Float32Array(an.fftSize);
      } else if (d.kind === 'mic') {
        /* microphone → analyser only: never routed toward the speakers (no
         * feedback squeal); its loudness flows back to the graph as a number */
        const an = actx.createAnalyser();
        an.fftSize = 512; an.smoothingTimeConstant = 0;
        e.main = an; e.buf = new Float32Array(an.fftSize);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            if (live[d.id] !== e) { stream.getTracks().forEach(t => t.stop()); return; }
            e.stream = stream;
            e.src = actx.createMediaStreamSource(stream);
            e.src.connect(an);
          }).catch(() => { });
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
      else if (d.kind === 'scope') {
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
      }
    };
    const drop = id => {
      const e = live[id];
      if (!e) return;
      try { if (e.kind === 'osc' || e.kind === 'noise') e.main.stop(); } catch (err) { }
      try { if (e.stream) e.stream.getTracks().forEach(t => t.stop()); } catch (err) { }
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
