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
  ])
};
