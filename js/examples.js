'use strict';
/* Weft example graphs — each is a plain graph JSON, deep-cloned before loading. */
function _EX(nodes, wires) {
  return {
    format: 1,
    nodes: nodes.map(a => ({ id: a[0], type: a[1], x: a[2], y: a[3], values: a[4] || {} })),
    wires: wires.map(a => ({ from: [a[0], a[1]], to: [a[2], a[3]] }))
  };
}

const EXAMPLES = {

  /* time → angle → polar point → orbiting circle, tether line, center dot */
  'Orbit study': _EX([
    ['n1', 'input/time', 30, 60],
    ['n2', 'params/slider', 30, 200, { min: 0, max: 4, value: 1.2 }],
    ['n3', 'math/mul', 300, 100],
    ['n4', 'params/slider', 30, 360, { min: 0, max: 300, value: 140 }],
    ['n5', 'vec/polar', 500, 140],
    ['n6', 'params/slider', 30, 520, { min: 1, max: 80, value: 18 }],
    ['n7', 'crv/circle', 740, 100],
    ['n8', 'crv/line', 500, 360],
    ['n9', 'disp/draw', 960, 100, { W: 2 }],
    ['n10', 'disp/draw', 740, 340, { S: { r: 110, g: 130, b: 170, a: 0.45 }, W: 1 }],
    ['n11', 'crv/circle', 740, 520, { R: 5 }],
    ['n12', 'disp/draw', 960, 480, { F: { r: 255, g: 255, b: 255, a: 1 }, W: 1 }]
  ], [
    ['n1', 'T', 'n3', 'A'], ['n2', 'N', 'n3', 'B'],
    ['n3', 'R', 'n5', 'A'], ['n4', 'N', 'n5', 'R'],
    ['n5', 'P', 'n7', 'P'], ['n6', 'N', 'n7', 'R'],
    ['n7', 'C', 'n9', 'G'],
    ['n5', 'P', 'n8', 'B'], ['n8', 'C', 'n10', 'G'],
    ['n11', 'C', 'n12', 'G']
  ]),

  /* series → golden-angle spiral of circles, sized by expression, coloured by index */
  'Phyllotaxis': _EX([
    ['n1', 'params/slider', 30, 40, { min: 1, max: 400, value: 220 }],
    ['n2', 'sets/series', 240, 40],
    ['n3', 'params/slider', 30, 200, { min: 0, max: 6.283, value: 2.399 }],
    ['n4', 'math/mul', 460, 40],
    ['n5', 'input/time', 30, 360],
    ['n7', 'params/slider', 30, 480, { min: -2, max: 2, value: 0.15 }],
    ['n6', 'math/mul', 240, 400],
    ['n8', 'math/add', 660, 120],
    ['n10', 'math/sqrt', 240, 220],
    ['n9', 'params/slider', 30, 640, { min: 0, max: 40, value: 14 }],
    ['n11', 'math/mul', 460, 260],
    ['n12', 'vec/polar', 860, 180],
    ['n13', 'math/expr', 660, 380, { expr: '2 + X * 0.028' }],
    ['n16', 'crv/circle', 1080, 220],
    ['n17', 'math/mul', 460, 460, { B: 0.0032 }],
    ['n18', 'disp/hsl', 660, 560, { S: 0.75, L: 0.62, A: 0.9 }],
    ['n19', 'disp/draw', 1300, 260, { S: { r: 0, g: 0, b: 0, a: 0 }, W: 1 }]
  ], [
    ['n1', 'N', 'n2', 'C'],
    ['n2', 'S', 'n4', 'A'], ['n3', 'N', 'n4', 'B'],
    ['n5', 'T', 'n6', 'A'], ['n7', 'N', 'n6', 'B'],
    ['n4', 'R', 'n8', 'A'], ['n6', 'R', 'n8', 'B'],
    ['n2', 'S', 'n10', 'V'],
    ['n10', 'R', 'n11', 'A'], ['n9', 'N', 'n11', 'B'],
    ['n8', 'R', 'n12', 'A'], ['n11', 'R', 'n12', 'R'],
    ['n2', 'S', 'n13', 'X'],
    ['n12', 'P', 'n16', 'P'], ['n13', 'R', 'n16', 'R'],
    ['n2', 'S', 'n17', 'A'],
    ['n17', 'R', 'n18', 'H'],
    ['n16', 'C', 'n19', 'G'], ['n18', 'C', 'n19', 'F']
  ]),

  /* grid of dots built from one Series (mod/floor), repelled + recoloured by the mouse */
  'Mouse field': _EX([
    ['n1', 'params/slider', 30, 40, { min: 1, max: 40, value: 16 }],
    ['n2', 'params/slider', 30, 200, { min: 1, max: 30, value: 10 }],
    ['n3', 'math/mul', 240, 100],
    ['n4', 'sets/series', 440, 40],
    ['n5', 'math/mod', 660, 40],
    ['n6', 'math/div', 660, 200],
    ['n7', 'math/floor', 860, 200],
    ['n8', 'params/slider', 30, 360, { min: 4, max: 120, value: 42 }],
    ['n9', 'math/expr', 900, 40, { expr: '(X - (Y - 1) / 2) * Z' }],
    ['n10', 'math/expr', 1080, 200, { expr: '(X - (Y - 1) / 2) * Z' }],
    ['n11', 'vec/construct', 1320, 100],
    ['n12', 'input/mouse', 440, 400],
    ['n13', 'vec/construct', 660, 420],
    ['n14', 'vec/distance', 900, 380],
    ['n15', 'math/remap', 1120, 380, { S0: 0, S1: 260, T0: 16, T1: 2 }],
    ['n16', 'crv/circle', 1540, 220],
    ['n18', 'math/remap', 1120, 620, { S0: 0, S1: 320, T0: 0, T1: 1 }],
    ['n19', 'disp/gradient', 1340, 620, { A: { r: 250, g: 204, b: 21, a: 1 }, B: { r: 96, g: 165, b: 250, a: 0.85 } }],
    ['n17', 'disp/draw', 1760, 300, { S: { r: 0, g: 0, b: 0, a: 0 } }]
  ], [
    ['n1', 'N', 'n3', 'A'], ['n2', 'N', 'n3', 'B'],
    ['n3', 'R', 'n4', 'C'],
    ['n4', 'S', 'n5', 'A'], ['n1', 'N', 'n5', 'B'],
    ['n4', 'S', 'n6', 'A'], ['n1', 'N', 'n6', 'B'],
    ['n6', 'R', 'n7', 'V'],
    ['n5', 'R', 'n9', 'X'], ['n1', 'N', 'n9', 'Y'], ['n8', 'N', 'n9', 'Z'],
    ['n7', 'R', 'n10', 'X'], ['n2', 'N', 'n10', 'Y'], ['n8', 'N', 'n10', 'Z'],
    ['n9', 'R', 'n11', 'X'], ['n10', 'R', 'n11', 'Y'],
    ['n12', 'X', 'n13', 'X'], ['n12', 'Y', 'n13', 'Y'],
    ['n11', 'P', 'n14', 'A'], ['n13', 'P', 'n14', 'B'],
    ['n14', 'D', 'n15', 'V'],
    ['n11', 'P', 'n16', 'P'], ['n15', 'R', 'n16', 'R'],
    ['n14', 'D', 'n18', 'V'],
    ['n18', 'R', 'n19', 'T'],
    ['n16', 'C', 'n17', 'G'], ['n19', 'C', 'n17', 'F']
  ]),

  /* a closed spline through polar points whose radii breathe with noise + time */
  'Noise blob': _EX([
    ['n1', 'params/slider', 30, 40, { min: 3, max: 64, value: 18 }],
    ['n2', 'sets/series', 240, 40],
    ['n3', 'math/expr', 460, 40, { expr: 'X / Y * 2 * PI' }],
    ['n4', 'input/time', 30, 300],
    ['n5', 'math/expr', 460, 260, { expr: 'X * 0.9 + Y * 0.6' }],
    ['n6', 'math/noise', 680, 200],
    ['n7', 'math/remap', 880, 160, { S0: 0, S1: 1, T0: 90, T1: 200 }],
    ['n8', 'vec/polar', 1100, 100],
    ['n9', 'crv/interp', 1320, 120, { C: true }],
    ['n10', 'disp/draw', 1540, 140, { S: { r: 94, g: 234, b: 212, a: 1 }, F: { r: 94, g: 234, b: 212, a: 0.08 }, W: 2 }]
  ], [
    ['n1', 'N', 'n2', 'C'],
    ['n2', 'S', 'n3', 'X'], ['n1', 'N', 'n3', 'Y'],
    ['n2', 'S', 'n5', 'X'], ['n4', 'T', 'n5', 'Y'],
    ['n5', 'R', 'n6', 'X'],
    ['n6', 'N', 'n7', 'V'],
    ['n3', 'R', 'n8', 'A'], ['n7', 'R', 'n8', 'R'],
    ['n8', 'P', 'n9', 'V'],
    ['n9', 'C', 'n10', 'G']
  ]),

  /* one grid of points split into two families by a checkerboard pattern
   * through Dispatch (the list-level if/else) — the families breathe in
   * opposite phase */
  'Checker dispatch': _EX([
    ['c1', 'params/slider', 30, 40, { min: 2, max: 24, value: 12 }],
    ['c2', 'params/slider', 30, 200, { min: 2, max: 24, value: 7 }],
    ['c3', 'params/slider', 30, 360, { min: 12, max: 100, value: 52 }],
    ['c4', 'input/time', 30, 520],
    ['c5', 'math/mul', 250, 100],
    ['c6', 'math/sin', 250, 520],
    ['c7', 'sets/series', 460, 100],
    ['c8', 'math/remap', 460, 480, { S0: -1, S1: 1, T0: 6, T1: 19 }],
    ['c9', 'math/remap', 460, 690, { S0: -1, S1: 1, T0: 19, T1: 6 }],
    ['c10', 'math/mod', 680, 40],
    ['c11', 'math/div', 680, 200],
    ['c12', 'math/floor', 880, 200],
    ['c13', 'math/expr', 1080, 40, { expr: '(X - (Y - 1) / 2) * Z' }],
    ['c14', 'math/expr', 1080, 200, { expr: '(X - (Y - 1) / 2) * Z' }],
    ['c15', 'math/expr', 1080, 380, { expr: '(X + Y) % 2' }],
    ['c16', 'vec/construct', 1300, 100],
    ['c17', 'sets/dispatch', 1500, 200],
    ['c18', 'crv/circle', 1720, 80],
    ['c19', 'crv/circle', 1720, 320],
    ['c20', 'disp/draw', 1940, 80, { S: { r: 0, g: 0, b: 0, a: 0 }, F: { r: 94, g: 234, b: 212, a: 0.9 } }],
    ['c21', 'disp/draw', 1940, 320, { S: { r: 0, g: 0, b: 0, a: 0 }, F: { r: 244, g: 114, b: 182, a: 0.9 } }]
  ], [
    ['c1', 'N', 'c5', 'A'], ['c2', 'N', 'c5', 'B'],
    ['c5', 'R', 'c7', 'C'],
    ['c7', 'S', 'c10', 'A'], ['c1', 'N', 'c10', 'B'],
    ['c7', 'S', 'c11', 'A'], ['c1', 'N', 'c11', 'B'],
    ['c11', 'R', 'c12', 'V'],
    ['c10', 'R', 'c13', 'X'], ['c1', 'N', 'c13', 'Y'], ['c3', 'N', 'c13', 'Z'],
    ['c12', 'R', 'c14', 'X'], ['c2', 'N', 'c14', 'Y'], ['c3', 'N', 'c14', 'Z'],
    ['c10', 'R', 'c15', 'X'], ['c12', 'R', 'c15', 'Y'],
    ['c13', 'R', 'c16', 'X'], ['c14', 'R', 'c16', 'Y'],
    ['c16', 'P', 'c17', 'L'], ['c15', 'R', 'c17', 'P'],
    ['c4', 'T', 'c6', 'V'],
    ['c6', 'R', 'c8', 'V'], ['c6', 'R', 'c9', 'V'],
    ['c17', 'A', 'c18', 'P'], ['c8', 'R', 'c18', 'R'],
    ['c17', 'B', 'c19', 'P'], ['c9', 'R', 'c19', 'R'],
    ['c18', 'C', 'c20', 'G'],
    ['c19', 'C', 'c21', 'G']
  ]),

  /* The same idea as Checker dispatch, done right — and the reason Grid exists.
   * Three phases of pulse across an isometric lattice, no branching at all:
   * the grid hands out a colour class K (0/1/2) per point, K becomes a phase
   * offset inside the Expression, and list matching turns ONE Circle node into
   * a whole field. Viewport drives the extents, so it fills any canvas.
   * 8 nodes vs 21 — the difference between the two lives entirely in K. */
  'Iso field': _EX([
    ['n1', 'input/viewport', 30, 40],
    ['n2', 'params/slider', 30, 200, { min: 16, max: 120, value: 44 }],
    ['n3', 'vec/grid', 260, 60, { iso: true }],
    ['n4', 'math/expr', 500, 60, { expr: 'T + X * PI * 2 / 3' }],
    ['n5', 'math/sin', 700, 60],
    ['n6', 'math/remap', 880, 60, { S0: -1, S1: 1, T0: 3, T1: 16 }],
    ['n7', 'crv/circle', 1100, 60],
    ['n8', 'disp/draw', 1300, 60, { S: { r: 0, g: 0, b: 0, a: 0 }, F: { r: 94, g: 234, b: 212, a: 0.9 } }]
  ], [
    ['n1', 'W', 'n3', 'W'], ['n1', 'H', 'n3', 'H'], ['n2', 'N', 'n3', 'S'],
    ['n3', 'K', 'n4', 'X'],
    ['n4', 'R', 'n5', 'V'],
    ['n5', 'R', 'n6', 'V'],
    ['n3', 'P', 'n7', 'P'], ['n6', 'R', 'n7', 'R'],
    ['n7', 'C', 'n8', 'G']
  ]),

  /* Iso field + the pointer. Distance-to-cursor is just another parallel list,
   * so it can drive BOTH halves of the radius at once:
   *   phase     = T*speed + K*2π/3 − distance*wavelength   → rings radiate from
   *               the cursor, still cycling in time, still 3-phase per lattice
   *   amplitude = remap(distance) → the T1 of the radius remap, so the field is
   *               quiet far away and blooms under the pointer
   * The Expression earns all four of its variables: T (time), X = K (lattice
   * class), Y = distance, Z = speed. Still one Circle, still one Draw. */
  'Cursor wave': _EX([
    ['n1', 'input/viewport', 30, 40],
    ['n2', 'params/slider', 30, 190, { min: 16, max: 120, value: 44 }],
    ['n3', 'vec/grid', 250, 60, { iso: true }],
    ['n4', 'input/mouse', 30, 420],
    ['n5', 'vec/construct', 250, 440],
    ['n6', 'vec/distance', 470, 380],
    ['n7', 'params/slider', 250, 620, { min: 0, max: 0.06, value: 0.024 }],
    ['n8', 'math/mul', 700, 560],
    ['n9', 'params/slider', 700, 700, { min: 0, max: 4, value: 1.4 }],
    ['n10', 'math/expr', 940, 60, { expr: 'T * Z + X * PI * 2 / 3 - Y' }],
    ['n11', 'math/sin', 1160, 60],
    ['n12', 'params/slider', 940, 420, { min: 60, max: 700, value: 340 }],
    ['n13', 'math/remap', 1160, 300, { S0: 0, S1: 340, T0: 26, T1: 3, C: true }],
    ['n14', 'math/remap', 1400, 60, { S0: -1, S1: 1, T0: 2, T1: 26, C: true }],
    ['n15', 'crv/circle', 1640, 60],
    ['n16', 'disp/draw', 1860, 60, { S: { r: 0, g: 0, b: 0, a: 0 }, F: { r: 94, g: 234, b: 212, a: 0.9 } }]
  ], [
    ['n1', 'W', 'n3', 'W'], ['n1', 'H', 'n3', 'H'], ['n2', 'N', 'n3', 'S'],
    ['n4', 'X', 'n5', 'X'], ['n4', 'Y', 'n5', 'Y'],
    ['n3', 'P', 'n6', 'A'], ['n5', 'P', 'n6', 'B'],
    ['n6', 'D', 'n8', 'A'], ['n7', 'N', 'n8', 'B'],
    ['n3', 'K', 'n10', 'X'], ['n8', 'R', 'n10', 'Y'], ['n9', 'N', 'n10', 'Z'],
    ['n10', 'R', 'n11', 'V'],
    ['n6', 'D', 'n13', 'V'], ['n12', 'N', 'n13', 'S1'],
    ['n11', 'R', 'n14', 'V'], ['n13', 'R', 'n14', 'T1'],
    ['n3', 'P', 'n15', 'P'], ['n14', 'R', 'n15', 'R'],
    ['n15', 'C', 'n16', 'G']
  ]),

  /* three circles = three independent toggle buttons from ONE node chain
   * (hotspot/latch/counter are per-list-item state machines); a real DOM
   * Button node resets everything */
  'Click toy': _EX([
    ['n1', 'sets/series', 30, 40, { S: -160, N: 160, C: 3 }],
    ['n2', 'vec/construct', 240, 40],
    ['n3', 'crv/circle', 460, 40, { R: 46 }],
    ['n4', 'input/hotspot', 680, 60],
    ['b1', 'input/button', 680, 420, { L: 'reset', P: { x: 0, y: 150 } }],
    ['n5', 'state/latch', 900, 40],
    ['n8', 'state/smooth', 900, 200, { S: 14 }],
    ['n12', 'state/counter', 900, 360],
    ['n6', 'state/smooth', 1120, 40, { S: 10 }],
    ['n9', 'math/remap', 1120, 200, { S0: 0, S1: 1, T0: 46, T1: 54 }],
    ['n13', 'disp/text', 1120, 460, { S: 15 }],
    ['n14', 'vec/construct', 240, 360, { Y: 80 }],
    ['n7', 'disp/gradient', 1340, 40, { A: { r: 42, g: 52, b: 70, a: 1 }, B: { r: 94, g: 234, b: 212, a: 1 } }],
    ['n10', 'crv/circle', 1340, 220],
    ['n11', 'disp/draw', 1560, 120, { S: { r: 94, g: 234, b: 212, a: 0.4 }, W: 1.5 }],
    ['n15', 'disp/draw', 1560, 320],
    ['n16', 'disp/text', 1340, 480, { T: 'click the dots', P: { x: 0, y: -120 }, S: 16 }],
    ['n17', 'disp/draw', 1560, 480, { S: { r: 139, g: 158, b: 191, a: 0.85 } }],
    ['n18', 'disp/bg', 1560, 640]
  ], [
    ['n1', 'S', 'n2', 'X'],
    ['n2', 'P', 'n3', 'P'],
    ['n3', 'C', 'n4', 'G'],
    ['n4', 'C', 'n5', 'T'], ['b1', 'C', 'n5', 'R'],
    ['n5', 'B', 'n6', 'V'],
    ['n6', 'R', 'n7', 'T'],
    ['n4', 'H', 'n8', 'V'],
    ['n8', 'R', 'n9', 'V'],
    ['n2', 'P', 'n10', 'P'], ['n9', 'R', 'n10', 'R'],
    ['n10', 'C', 'n11', 'G'], ['n7', 'C', 'n11', 'F'],
    ['n4', 'C', 'n12', 'U'], ['b1', 'C', 'n12', 'R'],
    ['n12', 'N', 'n13', 'T'],
    ['n1', 'S', 'n14', 'X'], ['n14', 'P', 'n13', 'P'],
    ['n13', 'G', 'n15', 'G'],
    ['n16', 'G', 'n17', 'G']
  ]),

  /* page scroll as the master parameter: the sun climbs, the sky warms,
   * a windmill spins with scrolled distance, the hint fades out
   * (wheel over the cloth to scrub the editor's simulated page) */
  'Scroll scene': _EX([
    ['s1', 'input/scroll', 30, 60],
    ['s2', 'math/remap', 250, 40, { S0: 0, S1: 1, T0: 180, T1: -140 }],
    ['s4', 'math/remap', 250, 250, { S0: 0, S1: 1, T0: -220, T1: 220 }],
    ['s13', 'math/mul', 250, 460, { B: 0.012 }],
    ['s20', 'math/expr', 250, 580, { expr: '1 - X' }],
    ['s5', 'vec/construct', 470, 40],
    ['s14', 'math/add', 470, 380, { B: 1.5708 }],
    ['s21', 'disp/hsl', 470, 540, { H: 0.55, S: 0.2, L: 0.88 }],
    ['s9', 'disp/gradient', 250, 760, { A: { r: 11, g: 14, b: 20, a: 1 }, B: { r: 42, g: 74, b: 115, a: 1 } }],
    ['s6', 'crv/circle', 690, 40, { R: 40 }],
    ['s7', 'disp/gradient', 690, 200, { A: { r: 251, g: 146, b: 60, a: 1 }, B: { r: 250, g: 204, b: 21, a: 1 } }],
    ['s15', 'crv/rect', 690, 380, { P: { x: 140, y: 80 }, W: 140, H: 7 }],
    ['s22', 'disp/text', 690, 540, { T: 'scroll ↓', P: { x: 0, y: 10 }, S: 18 }],
    ['s10', 'disp/bg', 690, 700],
    ['s8', 'disp/draw', 910, 40, { S: { r: 0, g: 0, b: 0, a: 0 } }],
    ['s11', 'crv/line', 910, 200, { A: { x: -2000, y: 120 }, B: { x: 2000, y: 120 } }],
    ['s18', 'crv/line', 910, 318, { A: { x: 140, y: 80 }, B: { x: 140, y: 120 } }],
    ['s16', 'xf/rotate', 910, 436, { C: { x: 140, y: 80 } }],
    ['s12', 'disp/draw', 1130, 200, { S: { r: 139, g: 158, b: 191, a: 0.55 }, W: 1.5 }],
    ['s17', 'disp/draw', 1130, 380, { S: { r: 230, g: 237, b: 250, a: 0.9 }, W: 2.5 }],
    ['s23', 'disp/draw', 1130, 540, { S: { r: 0, g: 0, b: 0, a: 0 } }]
  ], [
    ['s1', 'N', 's2', 'V'], ['s1', 'N', 's4', 'V'],
    ['s1', 'Y', 's13', 'A'],
    ['s1', 'N', 's20', 'X'],
    ['s1', 'N', 's7', 'T'], ['s1', 'N', 's9', 'T'],
    ['s4', 'R', 's5', 'X'], ['s2', 'R', 's5', 'Y'],
    ['s5', 'P', 's6', 'P'],
    ['s6', 'C', 's8', 'G'], ['s7', 'C', 's8', 'F'],
    ['s9', 'C', 's10', 'C'],
    ['s11', 'C', 's12', 'G'], ['s18', 'C', 's12', 'G'],
    ['s13', 'R', 's14', 'A'],
    ['s13', 'R', 's16', 'A'], ['s14', 'R', 's16', 'A'],
    ['s15', 'C', 's16', 'G'],
    ['s16', 'G', 's17', 'G'],
    ['s20', 'R', 's21', 'A'],
    ['s22', 'G', 's23', 'G'], ['s21', 'C', 's23', 'F']
  ]),

  /* a legal feedback loop: each axis is  lerp(last frame's answer, mouse, ease)
   * wired back through a Delay — the cycle the editor used to refuse.
   * The circle IS the loop: no Smooth node, just raw feedback */
  'Feedback chase': _EX([
    ['f1', 'input/mouse', 30, 60],
    ['f2', 'params/slider', 30, 320, { min: 0.01, max: 0.5, value: 0.12 }],
    ['f3', 'math/lerp', 470, 60],
    ['f4', 'state/delay', 250, 130],
    ['f5', 'math/lerp', 470, 300],
    ['f6', 'state/delay', 250, 390],
    ['f7', 'vec/construct', 690, 170],
    ['f8', 'crv/circle', 910, 130, { R: 26 }],
    ['f9', 'disp/draw', 1130, 130, { S: { r: 94, g: 234, b: 212, a: 0.95 }, W: 2 }],
    ['f10', 'vec/construct', 690, 400],
    ['f11', 'crv/circle', 910, 360, { R: 4 }],
    ['f12', 'disp/draw', 1130, 330, { F: { r: 230, g: 237, b: 250, a: 0.8 }, S: { r: 0, g: 0, b: 0, a: 0 } }]
  ], [
    ['f4', 'V', 'f3', 'A'], ['f1', 'X', 'f3', 'B'], ['f2', 'N', 'f3', 'T'],
    ['f3', 'R', 'f4', 'V'],
    ['f6', 'V', 'f5', 'A'], ['f1', 'Y', 'f5', 'B'], ['f2', 'N', 'f5', 'T'],
    ['f5', 'R', 'f6', 'V'],
    ['f3', 'R', 'f7', 'X'], ['f5', 'R', 'f7', 'Y'],
    ['f7', 'P', 'f8', 'P'],
    ['f8', 'C', 'f9', 'G'],
    ['f1', 'X', 'f10', 'X'], ['f1', 'Y', 'f10', 'Y'],
    ['f10', 'P', 'f11', 'P'],
    ['f11', 'C', 'f12', 'G']
  ])
};
