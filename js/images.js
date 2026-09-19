'use strict';
/*
 * Weft image host — loads the sources that Image In nodes declare on
 * ctx.imageList, hands the decoded elements to the renderer through LM.IMG
 * (src → HTMLImageElement, read by LM.drawItem for the `image` kind) and
 * reads their pixels back through ctx.imageState (src → {ready, w, h, sw, sh,
 * data}) for Image Sample. Sampling works on a copy capped at 256px on the
 * long side — a halftone over a thousand points must not walk a 4000px photo.
 * makeHost is ONE self-contained function expression: it is serialized with
 * Function.prototype.toString() into exports (same mechanism as LM and the
 * audio host), so it must not close over anything in this file. Node computes
 * never see an element or a canvas — they declare, and read state back.
 */
const WeftImages = {
  makeHost: function () {
    const state = {};    // src -> { ready, w, h, sw, sh, data } (data null when tainted)
    const pending = {};  // src -> true while the browser decodes it
    const CAP = 256;
    const load = src => {
      if (state[src] || pending[src]) return;
      pending[src] = true;
      const im = new Image();
      /* a data URI is same-origin; anything else asks for CORS so its pixels
         can be read. A server that refuses still lets the image DRAW — only
         Image Sample goes blind (data stays null). */
      if (!/^data:/i.test(src)) im.crossOrigin = 'anonymous';
      im.onload = () => {
        LM.IMG[src] = im;
        const w = im.naturalWidth || im.width || 0, h = im.naturalHeight || im.height || 0;
        const k = Math.min(1, CAP / Math.max(w, h, 1));
        const sw = Math.max(1, Math.round(w * k)), sh = Math.max(1, Math.round(h * k));
        let data = null;
        try {
          const cv = document.createElement('canvas');
          cv.width = sw; cv.height = sh;
          const c2 = cv.getContext('2d', { willReadFrequently: true });
          c2.drawImage(im, 0, 0, sw, sh);
          data = c2.getImageData(0, 0, sw, sh).data;
        } catch (e) { data = null; }
        state[src] = { ready: true, w, h, sw, sh, data };
        delete pending[src];
      };
      im.onerror = () => { state[src] = { ready: false, error: true, w: 0, h: 0, sw: 0, sh: 0, data: null }; delete pending[src]; };
      im.src = src;
    };
    return {
      sync: list => { for (const d of list || []) if (d && typeof d.src === 'string' && d.src) load(d.src); },
      state: () => state
    };
  }
};
