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

  /* James's hexagraph (2026-07-15) — a breathing hexagon lattice: hover wakes it,
   * springs ripple the radius, and six rotated Trace pens draw the motion as a
   * mandala of seismograph trails around the centre. Raw graph JSON (not _EX):
   * it carries collapsed / preview flags the helper doesn't. */
  'Hexa graph': {
    format: 1,
    nodes: [
      {"id":"h1","type":"input/viewport","x":30,"y":40,"values":{}},
      {"id":"h2","type":"params/slider","x":30,"y":180,"values":{"min":26,"max":90,"value":90}},
      {"id":"h3","type":"input/mouse","x":30,"y":340,"values":{}},
      {"id":"h4","type":"vec/grid","x":260,"y":40,"values":{"iso":true},"preview":false},
      {"id":"h5","type":"vec/construct","x":248,"y":338,"values":{}},
      {"id":"h6","type":"crv/rect","x":260,"y":479,"values":{}},
      {"id":"h7","type":"params/slider","x":260,"y":680,"values":{"min":120,"max":900,"value":430}},
      {"id":"h8","type":"vec/distance","x":488,"y":40,"values":{}},
      {"id":"h29","type":"input/hotspot","x":490,"y":160,"values":{}},
      {"id":"h9","type":"state/sample","x":490,"y":300,"values":{}},
      {"id":"h10","type":"state/timer","x":490,"y":440,"values":{}},
      {"id":"h11","type":"math/expr","x":721,"y":40,"values":{"expr":"pow(max(0, 1 - X/240), 2) + 1.7 * exp(-pow((Y - Z)/60, 2)) * max(0, 1 - Z/700) * min(Z, 1)"}},
      {"id":"h12","type":"vec/distance","x":753,"y":-66,"values":{}},
      {"id":"h13","type":"math/mul","x":748,"y":463,"values":{},"collapsed":true},
      {"id":"h15","type":"state/spring","x":948,"y":40,"values":{"F":2.4,"D":0.35}},
      {"id":"h16","type":"math/expr","x":946,"y":211,"values":{"expr":"max(0.08, Y * 0.577 * (0.34 + 0.55 * min(X, 1.3)))"}},
      {"id":"h17","type":"math/expr","x":956,"y":376,"values":{"expr":"0.5236 + X * 0.06 + Y"}},
      {"id":"h19","type":"crv/polygon","x":1614,"y":-120,"values":{"N":6}},
      {"id":"h20","type":"math/remap","x":1250,"y":81,"values":{"S0":0,"S1":1.5,"T0":0.47,"T1":0.82}},
      {"id":"h21","type":"math/remap","x":1254,"y":301,"values":{"S0":0,"S1":1.5,"T0":0,"T1":0.3}},
      {"id":"h26","type":"disp/bg","x":3119,"y":175,"values":{"C":{"r":8,"g":10,"b":15,"a":1}}},
      {"id":"h27","type":"disp/draw","x":3075,"y":-164,"values":{"S":{"r":255,"g":255,"b":255,"a":1},"W":3}},
      {"id":"n1","type":"crv/polygon","x":401,"y":-278,"values":{"R":120}},
      {"id":"n2","type":"params/point","x":159,"y":-371,"values":{},"collapsed":true},
      {"id":"n4","type":"math/rad","x":86,"y":-109,"values":{"V":30}},
      {"id":"n6","type":"crv/divide","x":619,"y":-275,"values":{"N":6}},
      {"id":"n7","type":"params/point","x":975,"y":-164,"values":{},"collapsed":true},
      {"id":"n8","type":"params/slider","x":337,"y":-434,"values":{"min":0,"max":100,"value":40,"mode":"int","label":"Radius"}},
      {"id":"n11","type":"xf/move","x":1094,"y":-470,"values":{}},
      {"id":"n12","type":"vec/vec2pt","x":894,"y":-659,"values":{}},
      {"id":"n13","type":"xf/rotate","x":1328,"y":-446,"values":{}},
      {"id":"n14","type":"xf/scale","x":1663,"y":-403,"values":{}},
      {"id":"n20","type":"params/timegraph","x":2345,"y":1038,"values":{}},
      {"id":"n25","type":"disp/trace","x":3338,"y":779,"values":{"L":800,"W":0.5,"P":{"x":0,"y":0}}},
      {"id":"n41","type":"disp/hsl","x":2692,"y":118,"values":{}},
      {"id":"n46","type":"math/mul","x":2605,"y":1033,"values":{}},
      {"id":"n47","type":"params/slider","x":2575,"y":1149,"values":{"min":0,"max":10,"value":2.452}},
      {"id":"n48","type":"params/vector","x":2274,"y":1557,"values":{"V":{"x":0,"y":52}}},
      {"id":"n49","type":"xf/rotate","x":2866,"y":1589,"values":{},"preview":false},
      {"id":"n50","type":"sets/series","x":2246,"y":1658,"values":{"C":6,"N":60}},
      {"id":"n51","type":"math/rad","x":2491,"y":1719,"values":{}},
      {"id":"n52","type":"params/anchor","x":2307,"y":1409,"values":{"x":-66,"y":-62},"preview":false},
      {"id":"n53","type":"xf/rotate","x":2836,"y":1449,"values":{},"preview":false},
      {"id":"n54","type":"vec/angle","x":2005,"y":305,"values":{}},
      {"id":"n56","type":"math/div","x":2327,"y":433,"values":{},"collapsed":true},
      {"id":"n57","type":"math/pi","x":2225,"y":463,"values":{"F":2},"collapsed":true},
      {"id":"n58","type":"math/add","x":2409,"y":436,"values":{"B":0.5},"collapsed":true},
      {"id":"n61","type":"vec/distance","x":2003,"y":199,"values":{}},
      {"id":"n62","type":"math/remap","x":2390,"y":595,"values":{"T1":1}},
      {"id":"n63","type":"math/mul","x":2224,"y":671,"values":{"B":2},"collapsed":true},
      {"id":"n64","type":"math/mul","x":2668,"y":681,"values":{"B":-1},"collapsed":true},
      {"id":"n65","type":"math/add","x":2762,"y":680,"values":{"B":1},"collapsed":true},
      {"id":"n66","type":"params/slider","x":2428,"y":864,"values":{"min":0,"max":1,"value":0.717}},
      {"id":"n67","type":"params/slider","x":2428,"y":807,"values":{"min":0,"max":1,"value":0.056}},
      {"id":"n69","type":"math/add","x":2463,"y":178,"values":{},"collapsed":true},
      {"id":"n70","type":"math/add","x":2516,"y":251,"values":{},"collapsed":true},
      {"id":"n73","type":"params/slider","x":-196,"y":1210,"values":{"min":26,"max":90,"value":90}},
      {"id":"n74","type":"vec/distance","x":264,"y":1076,"values":{}},
      {"id":"n75","type":"input/hotspot","x":264,"y":1190,"values":{}},
      {"id":"n76","type":"state/sample","x":261,"y":1319,"values":{}},
      {"id":"n77","type":"math/expr","x":492,"y":1131,"values":{"expr":"pow(max(0, 1 - X/240), 2) + 1.7 * exp(-pow((Y - Z)/60, 2)) * max(0, 1 - Z/700) * min(Z, 1)"}},
      {"id":"n78","type":"vec/distance","x":488,"y":1025,"values":{}},
      {"id":"n79","type":"state/spring","x":730,"y":1096,"values":{"F":2.4,"D":0.35}},
      {"id":"n80","type":"math/expr","x":720,"y":1241,"values":{"expr":"max(0.08, Y * 0.577 * (0.34 + 0.55 * min(X, 1.3)))"}},
      {"id":"n81","type":"params/point","x":56,"y":915,"values":{},"collapsed":true},
      {"id":"n84","type":"params/timegraph","x":1155,"y":1288,"values":{}},
      {"id":"n85","type":"state/smooth","x":973,"y":1375,"values":{"S":2}},
      {"id":"n86","type":"math/remap","x":1175,"y":1400,"values":{"T0":1,"T1":2,"S1":44,"S0":17.6}},
      {"id":"n87","type":"math/mul","x":1353,"y":1049,"values":{"B":1},"collapsed":true},
      {"id":"n89","type":"xf/move","x":2590,"y":1498,"values":{},"preview":false},
      {"id":"n91","type":"vec/vecxy","x":1955,"y":1220,"values":{}},
      {"id":"n92","type":"math/mul","x":1561,"y":1285,"values":{}},
      {"id":"n93","type":"params/relay","x":1222,"y":1045,"values":{}},
      {"id":"n94","type":"math/sub","x":1775,"y":1336,"values":{}},
      {"id":"n95","type":"math/neg","x":1847,"y":1251,"values":{},"collapsed":true},
      {"id":"n96","type":"math/sqrt","x":1638,"y":-265,"values":{"V":3}},
      {"id":"n97","type":"math/div","x":1805,"y":-281,"values":{"B":2}},
      {"id":"n98","type":"params/swatch","x":2886,"y":-24,"values":{"hex":"#000914","a":1}}
    ],
    wires: [
      {"id":"w1","from":["h1","W"],"to":["h4","W"]},
      {"id":"w2","from":["h1","H"],"to":["h4","H"]},
      {"id":"w3","from":["h2","N"],"to":["h4","S"]},
      {"id":"w4","from":["h3","X"],"to":["h5","X"]},
      {"id":"w5","from":["h3","Y"],"to":["h5","Y"]},
      {"id":"w7","from":["h5","P"],"to":["h8","B"]},
      {"id":"w8","from":["h1","W"],"to":["h6","W"]},
      {"id":"w9","from":["h1","H"],"to":["h6","H"]},
      {"id":"w10","from":["h6","C"],"to":["h29","G"]},
      {"id":"w11","from":["h5","P"],"to":["h9","V"]},
      {"id":"w12","from":["h29","C"],"to":["h9","T"]},
      {"id":"w13","from":["h29","C"],"to":["h10","T"]},
      {"id":"w15","from":["h9","R"],"to":["h12","B"]},
      {"id":"w16","from":["h10","S"],"to":["h13","A"]},
      {"id":"w17","from":["h7","N"],"to":["h13","B"]},
      {"id":"w18","from":["h8","D"],"to":["h11","X"]},
      {"id":"w19","from":["h12","D"],"to":["h11","Y"]},
      {"id":"w20","from":["h13","R"],"to":["h11","Z"]},
      {"id":"w21","from":["h11","R"],"to":["h15","V"]},
      {"id":"w22","from":["h15","R"],"to":["h16","X"]},
      {"id":"w23","from":["h2","N"],"to":["h16","Y"]},
      {"id":"w24","from":["h15","V"],"to":["h17","X"]},
      {"id":"w25","from":["h15","R"],"to":["h20","V"]},
      {"id":"w26","from":["h15","R"],"to":["h21","V"]},
      {"id":"w28","from":["h16","R"],"to":["h19","R"]},
      {"id":"w29","from":["h17","R"],"to":["h19","A"]},
      {"id":"w32","from":["h19","C"],"to":["h27","G"]},
      {"id":"w41","from":["n2","P"],"to":["n1","P"]},
      {"id":"w43","from":["n4","R"],"to":["n1","A"]},
      {"id":"w44","from":["n1","C"],"to":["n6","C"]},
      {"id":"w45","from":["n6","P"],"to":["n7","P"]},
      {"id":"w46","from":["n2","P"],"to":["n7","P"]},
      {"id":"w47","from":["n7","P"],"to":["h8","A"]},
      {"id":"w48","from":["n7","P"],"to":["h19","P"]},
      {"id":"w49","from":["n7","P"],"to":["h12","A"]},
      {"id":"w55","from":["n6","P"],"to":["n11","G"]},
      {"id":"w56","from":["n2","P"],"to":["n12","A"]},
      {"id":"w57","from":["n6","P"],"to":["n12","B"]},
      {"id":"w58","from":["n12","V"],"to":["n11","T"]},
      {"id":"w59","from":["n11","G"],"to":["n7","P"]},
      {"id":"w61","from":["n4","R"],"to":["h17","Y"]},
      {"id":"w62","from":["n11","G"],"to":["n13","G"]},
      {"id":"w63","from":["n4","R"],"to":["n13","A"]},
      {"id":"w64","from":["n13","G"],"to":["n14","G"]},
      {"id":"w66","from":["n14","G"],"to":["n7","P"]},
      {"id":"w103","from":["n20","V"],"to":["n46","A"]},
      {"id":"w104","from":["n47","N"],"to":["n46","B"]},
      {"id":"w105","from":["n46","R"],"to":["n25","V"]},
      {"id":"w109","from":["n50","S"],"to":["n51","V"]},
      {"id":"w110","from":["n51","R"],"to":["n49","A"]},
      {"id":"w115","from":["n48","V"],"to":["n49","G"]},
      {"id":"w117","from":["n49","G"],"to":["n25","D"]},
      {"id":"w119","from":["n51","R"],"to":["n53","A"]},
      {"id":"w122","from":["n53","G"],"to":["n25","P"]},
      {"id":"w125","from":["n54","R"],"to":["n56","A"]},
      {"id":"w127","from":["n57","P"],"to":["n56","B"]},
      {"id":"w128","from":["n56","R"],"to":["n58","A"]},
      {"id":"w131","from":["n41","C"],"to":["h27","F"]},
      {"id":"w136","from":["n7","P"],"to":["n54","B"]},
      {"id":"w137","from":["n7","P"],"to":["n61","B"]},
      {"id":"w139","from":["n63","R"],"to":["n62","S1"]},
      {"id":"w141","from":["n61","D"],"to":["n62","V"]},
      {"id":"w144","from":["n64","R"],"to":["n65","A"]},
      {"id":"w145","from":["n62","R"],"to":["n64","A"]},
      {"id":"w149","from":["n67","N"],"to":["n62","T0"]},
      {"id":"w150","from":["n66","N"],"to":["n62","T1"]},
      {"id":"w155","from":["n41","C"],"to":["n25","C"]},
      {"id":"w156","from":["h20","R"],"to":["n69","A"]},
      {"id":"w157","from":["n58","R"],"to":["n69","B"]},
      {"id":"w158","from":["n69","R"],"to":["n41","H"]},
      {"id":"w161","from":["n65","R"],"to":["n70","B"]},
      {"id":"w162","from":["h21","R"],"to":["n70","A"]},
      {"id":"w163","from":["n70","R"],"to":["n41","L"]},
      {"id":"w169","from":["n75","C"],"to":["n76","T"]},
      {"id":"w170","from":["n76","R"],"to":["n78","B"]},
      {"id":"w171","from":["n74","D"],"to":["n77","X"]},
      {"id":"w172","from":["n78","D"],"to":["n77","Y"]},
      {"id":"w173","from":["n77","R"],"to":["n79","V"]},
      {"id":"w174","from":["n79","R"],"to":["n80","X"]},
      {"id":"w175","from":["n73","N"],"to":["n80","Y"]},
      {"id":"w176","from":["n81","P"],"to":["n74","A"]},
      {"id":"w177","from":["n81","P"],"to":["n78","A"]},
      {"id":"w178","from":["h5","P"],"to":["n74","B"]},
      {"id":"w179","from":["h6","C"],"to":["n75","G"]},
      {"id":"w180","from":["h5","P"],"to":["n76","V"]},
      {"id":"w181","from":["h13","R"],"to":["n77","Z"]},
      {"id":"w186","from":["n2","P"],"to":["n81","P"]},
      {"id":"w189","from":["n80","R"],"to":["n85","V"]},
      {"id":"w191","from":["n85","R"],"to":["n86","V"]},
      {"id":"w194","from":["n86","R"],"to":["n84","V"]},
      {"id":"w196","from":["n87","R"],"to":["n1","R"]},
      {"id":"w197","from":["n87","R"],"to":["n63","A"]},
      {"id":"w198","from":["n86","R"],"to":["n87","B"]},
      {"id":"w199","from":["n91","V"],"to":["n89","T"]},
      {"id":"w200","from":["n52","P"],"to":["n89","G"]},
      {"id":"w202","from":["n8","N"],"to":["n93","V"]},
      {"id":"w203","from":["n93","V"],"to":["n87","A"]},
      {"id":"w204","from":["n93","V"],"to":["n92","B"]},
      {"id":"w205","from":["n86","R"],"to":["n92","A"]},
      {"id":"w207","from":["n89","G"],"to":["n53","G"]},
      {"id":"w209","from":["n93","V"],"to":["n94","B"]},
      {"id":"w210","from":["n92","R"],"to":["n94","A"]},
      {"id":"w212","from":["n94","R"],"to":["n95","V"]},
      {"id":"w213","from":["n95","R"],"to":["n91","X"]},
      {"id":"w214","from":["h16","R"],"to":["n20","V"]},
      {"id":"w215","from":["n96","R"],"to":["n97","A"]},
      {"id":"w216","from":["n97","R"],"to":["n14","F"]},
      {"id":"w217","from":["n98","C"],"to":["h26","C"]},
      {"id":"w218","from":["n98","C"],"to":["h27","S"]}
    ]
  },

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

  /* The iso family's showpiece — a lattice that behaves like a material.
   * Geometry: hexagons of circumradius spacing/√3 tile the iso lattice exactly
   * (horizontal s, rows s·√3/2, half-staggered → honeycomb), so the quiet field
   * reads as cloth, not dots. Physics: ONE Spring node is 300+ independent
   * mass-machines (state is per list item); its R drives size + hue, and its
   * VELOCITY drives rotation — cells twist while they move and settle straight.
   * Interaction: pointer proximity pumps energy in; clicks are caught by a
   * Hotspot on a viewport-filling rectangle — the whole canvas as an interface
   * element (armed on press, fires on release, so no click is too quick).
   * Its trigger makes Sample & Hold freeze the click point and Timer restart
   * from zero — timer × speed = ring radius, and a gaussian around that ring
   * in the Expression is a pulse that travels outward through the cells.
   * Every part of the machine is an ordinary wire. */
  'Living lattice': _EX([
    ['h1', 'input/viewport', 30, 40],
    ['h2', 'params/slider', 30, 180, { min: 26, max: 90, value: 46 }],
    ['h3', 'input/mouse', 30, 340],
    ['h4', 'vec/grid', 260, 40, { iso: true }],
    ['h5', 'vec/construct', 260, 340],
    ['h6', 'crv/rect', 260, 480],
    ['h7', 'params/slider', 260, 680, { min: 120, max: 900, value: 430 }],
    ['h8', 'vec/distance', 490, 40],
    ['h29', 'input/hotspot', 490, 160],
    ['h9', 'state/sample', 490, 300],
    ['h10', 'state/timer', 490, 440],
    ['h11', 'math/expr', 720, 40, { expr: 'pow(max(0, 1 - X/240), 2) + 1.7 * exp(-pow((Y - Z)/60, 2)) * max(0, 1 - Z/700) * min(Z, 1)' }],
    ['h12', 'vec/distance', 720, 260],
    ['h13', 'math/mul', 720, 420],
    ['h14', 'math/remap', 720, 560, { S0: 0, S1: 700, T0: 0.55, T1: 0 }],
    ['h15', 'state/spring', 950, 40, { F: 2.4, D: 0.35 }],
    ['h16', 'math/expr', 950, 220, { expr: 'max(0.08, Y * 0.577 * (0.34 + 0.55 * min(X, 1.3)))' }],
    ['h17', 'math/expr', 950, 380, { expr: '0.5236 + X * 0.06' }],
    ['h18', 'disp/hsl', 950, 540, { H: 0.49, S: 0.85, L: 0.72 }],
    ['h19', 'crv/polygon', 1180, 40, { N: 6 }],
    ['h20', 'math/remap', 1180, 220, { S0: 0, S1: 1.5, T0: 0.47, T1: 0.82 }],
    ['h21', 'math/remap', 1180, 440, { S0: 0, S1: 1.5, T0: 0.34, T1: 0.66 }],
    ['h22', 'crv/circle', 1180, 660],
    ['h23', 'disp/hsl', 1410, 40, { S: 0.68, A: 0.92 }],
    ['h24', 'disp/draw', 1410, 220, { S: { r: 0, g: 0, b: 0, a: 0 }, W: 1.5 }],
    ['h25', 'disp/text', 1410, 400, { T: 'move the pointer · click to drop a stone', P: { x: 0, y: 262 }, S: 13 }],
    ['h26', 'disp/bg', 1410, 560, { C: { r: 8, g: 10, b: 15, a: 1 } }],
    ['h27', 'disp/draw', 1640, 40, { S: { r: 94, g: 234, b: 212, a: 0.14 }, W: 1 }],
    ['h28', 'disp/draw', 1640, 260, { S: { r: 91, g: 104, b: 128, a: 0.7 } }]
  ], [
    ['h1', 'W', 'h4', 'W'], ['h1', 'H', 'h4', 'H'], ['h2', 'N', 'h4', 'S'],
    ['h3', 'X', 'h5', 'X'], ['h3', 'Y', 'h5', 'Y'],
    ['h4', 'P', 'h8', 'A'], ['h5', 'P', 'h8', 'B'],
    ['h1', 'W', 'h6', 'W'], ['h1', 'H', 'h6', 'H'],
    ['h6', 'C', 'h29', 'G'],
    ['h5', 'P', 'h9', 'V'], ['h29', 'C', 'h9', 'T'],
    ['h29', 'C', 'h10', 'T'],
    ['h4', 'P', 'h12', 'A'], ['h9', 'R', 'h12', 'B'],
    ['h10', 'S', 'h13', 'A'], ['h7', 'N', 'h13', 'B'],
    ['h8', 'D', 'h11', 'X'], ['h12', 'D', 'h11', 'Y'], ['h13', 'R', 'h11', 'Z'],
    ['h11', 'R', 'h15', 'V'],
    ['h15', 'R', 'h16', 'X'], ['h2', 'N', 'h16', 'Y'],
    ['h15', 'V', 'h17', 'X'],
    ['h15', 'R', 'h20', 'V'],
    ['h15', 'R', 'h21', 'V'],
    ['h4', 'P', 'h19', 'P'], ['h16', 'R', 'h19', 'R'], ['h17', 'R', 'h19', 'A'],
    ['h20', 'R', 'h23', 'H'], ['h21', 'R', 'h23', 'L'],
    ['h19', 'C', 'h27', 'G'], ['h23', 'C', 'h27', 'F'],
    ['h9', 'R', 'h22', 'P'], ['h13', 'R', 'h22', 'R'],
    ['h13', 'R', 'h14', 'V'],
    ['h14', 'R', 'h18', 'A'],
    ['h22', 'C', 'h24', 'G'], ['h18', 'C', 'h24', 'S'],
    ['h25', 'G', 'h28', 'G']
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

  /* the solar system as a dataflow — one Kepler machine, eight planets.
   * Real J2000 orbital elements (JPL) live in Text Lists: semi-major axis a,
   * eccentricity e, sidereal period, longitude of perihelion ϖ, mean
   * longitude L₀. The chain solves mean anomaly → true anomaly (equation of
   * the center, 3rd order in e) → radius, per planet, by list matching —
   * ellipses drawn with the sun at the focus, correct shape and orientation.
   * Time starts at 2000-01-01, one year = 6 s; the date is read back out of
   * the same clock. Planet sizes are true to each other but exaggerated vs
   * the orbits; the moon rides Earth on its own ellipse with its distance
   * exaggerated (slider ×1 = true scale). Angles are negated so the system
   * turns counterclockwise, as seen from ecliptic north. */
  'Solar system': _EX([
    /* — data: J2000 elements, mercury → neptune, one line per planet — */
    ['da', 'params/textlist', 30, 40, { text: '0.38709927\n0.72333566\n1.00000261\n1.52371034\n5.20288700\n9.53667594\n19.18916464\n30.06992276' }],
    ['de', 'params/textlist', 30, 300, { text: '0.20563593\n0.00677672\n0.01671123\n0.09339410\n0.04838624\n0.05386179\n0.04725744\n0.00859048' }],
    ['dp', 'params/textlist', 30, 560, { text: '0.2408467\n0.61519726\n1.0000174\n1.8808476\n11.862615\n29.447498\n84.016846\n164.79132' }],
    ['dw', 'params/textlist', 30, 820, { text: '77.45779628\n131.60246718\n102.93768193\n-23.94362959\n14.72847983\n92.59887831\n170.95427630\n44.96476227' }],
    ['dl', 'params/textlist', 30, 1080, { text: '252.25032350\n181.97909950\n100.46457166\n-4.55343205\n34.39644051\n49.95424423\n313.23810451\n-55.12002969' }],
    ['ds', 'params/textlist', 260, 40, { text: '0.383\n0.949\n1.000\n0.532\n11.209\n9.449\n4.007\n3.883' }],
    ['dc', 'params/textlist', 260, 300, { text: '#b5a79b\n#eace8f\n#6ea8fe\n#e0714f\n#d9a066\n#e8d29a\n#9fe0e8\n#5f7de8' }],
    ['dn', 'params/textlist', 260, 560, { text: 'mercury\nvenus\nearth\nmars\njupiter\nsaturn\nuranus\nneptune' }],
    ['dm', 'params/textlist', 260, 820, { text: 'January\nFebruary\nMarch\nApril\nMay\nJune\nJuly\nAugust\nSeptember\nOctober\nNovember\nDecember' }],
    ['u1', 'params/slider', 260, 1100, { min: 2, max: 240, value: 8 }],
    ['u2', 'params/slider', 260, 1220, { min: 0.5, max: 10, value: 1.4 }],
    ['u3', 'params/slider', 260, 1340, { min: 1, max: 400, value: 120 }],
    ['t1', 'input/time', 30, 1360],
    ['v1', 'input/viewport', 30, 1480],
    /* — kepler: years since J2000 → M → ν → r, all lists of eight — */
    ['k1', 'math/div', 520, 180, { B: 6 }],
    ['k2', 'math/sub', 520, 40],
    ['k3', 'math/expr', 740, 40, { expr: '(X + 360 * Z / Y) * PI / 180' }],
    ['k4', 'math/expr', 960, 40, { expr: 'X + (2*Y - pow(Y,3)/4) * sin(X) + 1.25*Y*Y * sin(2*X) + (13/12) * pow(Y,3) * sin(3*X)' }],
    ['k5', 'math/expr', 1180, 40, { expr: 'X * (1 - Y*Y) / (1 + Y * cos(Z))' }],
    ['k6', 'math/expr', 1180, 200, { expr: '-(X + Y * PI / 180)' }],
    ['k7', 'math/mul', 1400, 40],
    ['k8', 'vec/polar', 1620, 100],
    ['k9', 'math/mul', 1400, 280],
    ['k10', 'math/max', 1620, 280, { B: 1 }],
    ['k11', 'crv/circle', 1840, 160],
    /* — orbit ellipses: centre sits a·e from the focus, toward aphelion — */
    ['o1', 'math/mul', 740, 480],
    ['o2', 'math/expr', 740, 620, { expr: 'X * sqrt(1 - Y*Y) * Z' }],
    ['o3', 'math/expr', 740, 760, { expr: '-X * PI / 180' }],
    ['o4', 'math/expr', 960, 480, { expr: 'X * Y * Z' }],
    ['o5', 'math/expr', 960, 620, { expr: '-(X + 180) * PI / 180' }],
    ['o6', 'vec/polar', 1180, 550],
    ['o7', 'crv/ellipse', 1400, 550],
    /* — the sun, at the shared focus — */
    ['s1', 'crv/circle', 1400, 760, { R: 9 }],
    ['s3', 'crv/circle', 1400, 900, { R: 3.5 }],
    /* — the moon: same machine, one body, origin = earth (list item 2) — */
    ['m1', 'sets/item', 1840, 40, { i: 2 }],
    ['m2', 'math/expr', 520, 1050, { expr: '0.0025696 * X * Y' }],
    ['m3', 'math/expr', 520, 1190, { expr: '(134.9634 + 360 * X / 0.0748013) * PI / 180' }],
    ['m4', 'math/expr', 740, 1190, { expr: 'X + (2*Y - pow(Y,3)/4) * sin(X) + 1.25*Y*Y * sin(2*X) + (13/12) * pow(Y,3) * sin(3*X)', Y: 0.0549 }],
    ['m5', 'math/expr', 960, 1050, { expr: 'X * (1 - Y*Y) / (1 + Y * cos(Z))', Y: 0.0549 }],
    ['m6', 'math/expr', 960, 1190, { expr: '-(X + 83.3532 * PI / 180)' }],
    ['m7', 'vec/polar', 1180, 1100],
    ['m8', 'math/mul', 1180, 1260, { B: 0.273 }],
    ['m9', 'math/max', 1400, 1260, { B: 0.8 }],
    ['m10', 'crv/circle', 1620, 1100],
    ['m12', 'math/expr', 740, 1050, { expr: 'X * sqrt(1 - 0.0549*0.0549)' }],
    ['m13', 'math/expr', 740, 1330, { expr: 'X * 0.0549' }],
    ['m14', 'vec/polar', 1400, 1400, { A: -4.5964 }],
    ['m15', 'crv/ellipse', 1620, 1400, { A: -1.4548 }],
    /* — name labels, floated above each planet by its own radius — */
    ['b1', 'math/expr', 1840, 320, { expr: '-(X + 8)' }],
    ['b2', 'vec/vecxy', 2060, 320],
    ['b3', 'disp/text', 2060, 480, { S: 10 }],
    ['b4', 'xf/move', 2280, 400],
    /* — the date, read back out of the clock, pinned to the corner — */
    ['g1', 'math/floor', 740, 1550],
    ['g2', 'math/add', 960, 1550, { B: 2000 }],
    ['g3', 'math/sub', 960, 1690],
    ['g4', 'math/mul', 1180, 1690, { B: 12 }],
    ['g5', 'sets/item', 1400, 1690],
    ['g6', 'math/expr', 740, 1830, { expr: '-X / 2 + 64' }],
    ['g7', 'math/expr', 740, 1970, { expr: 'X / 2 - 34' }],
    ['g8', 'vec/construct', 1180, 1830],
    ['g9', 'disp/text', 1620, 1690, { S: 20 }],
    ['g10', 'math/expr', 960, 1830, { expr: '-X / 2 + 170' }],
    ['g11', 'vec/construct', 1400, 1900],
    ['g12', 'disp/text', 1620, 1870, { S: 20 }],
    ['c1', 'math/expr', 960, 1970, { expr: '-X / 2 + 24' }],
    ['c2', 'vec/construct', 1400, 2040],
    ['c3', 'disp/text', 1620, 2040, { T: 'J2000 orbits · 1 year = 6 s · sizes + moon distance exaggerated — the sliders zoom', S: 12 }],
    /* — draws, back to front — */
    ['o8', 'disp/draw', 1620, 550, { S: { r: 110, g: 125, b: 160, a: 0.35 }, W: 1 }],
    ['m16', 'disp/draw', 1840, 1400, { S: { r: 110, g: 125, b: 160, a: 0.35 }, W: 1 }],
    ['s2', 'disp/draw', 1620, 730, { S: { r: 0, g: 0, b: 0, a: 0 }, F: { r: 255, g: 176, b: 61, a: 0.16 } }],
    ['s4', 'disp/draw', 1620, 890, { S: { r: 0, g: 0, b: 0, a: 0 }, F: { r: 255, g: 210, b: 125, a: 1 } }],
    ['k12', 'disp/draw', 2060, 160, { S: { r: 0, g: 0, b: 0, a: 0 }, W: 1 }],
    ['m11', 'disp/draw', 1840, 1100, { S: { r: 0, g: 0, b: 0, a: 0 }, F: { r: 201, g: 204, b: 214, a: 1 } }],
    ['b5', 'disp/draw', 2500, 400, { S: { r: 139, g: 158, b: 191, a: 0.75 } }],
    ['g13', 'disp/draw', 1840, 1780, { S: { r: 230, g: 237, b: 250, a: 0.92 } }],
    ['c4', 'disp/draw', 1840, 2040, { S: { r: 110, g: 125, b: 160, a: 0.85 } }],
    ['z1', 'disp/bg', 2060, 2040, { C: { r: 6, g: 8, b: 14, a: 1 } }]
  ], [
    /* kepler chain */
    ['t1', 'T', 'k1', 'A'],
    ['dl', 'L', 'k2', 'A'], ['dw', 'L', 'k2', 'B'],
    ['k2', 'R', 'k3', 'X'], ['dp', 'L', 'k3', 'Y'], ['k1', 'R', 'k3', 'Z'],
    ['k3', 'R', 'k4', 'X'], ['de', 'L', 'k4', 'Y'],
    ['da', 'L', 'k5', 'X'], ['de', 'L', 'k5', 'Y'], ['k4', 'R', 'k5', 'Z'],
    ['k4', 'R', 'k6', 'X'], ['dw', 'L', 'k6', 'Y'],
    ['k5', 'R', 'k7', 'A'], ['u1', 'N', 'k7', 'B'],
    ['k6', 'R', 'k8', 'A'], ['k7', 'R', 'k8', 'R'],
    ['ds', 'L', 'k9', 'A'], ['u2', 'N', 'k9', 'B'],
    ['k9', 'R', 'k10', 'A'],
    ['k8', 'P', 'k11', 'P'], ['k10', 'R', 'k11', 'R'],
    ['k11', 'C', 'k12', 'G'], ['dc', 'L', 'k12', 'F'],
    /* orbit ellipses */
    ['da', 'L', 'o1', 'A'], ['u1', 'N', 'o1', 'B'],
    ['da', 'L', 'o2', 'X'], ['de', 'L', 'o2', 'Y'], ['u1', 'N', 'o2', 'Z'],
    ['dw', 'L', 'o3', 'X'],
    ['da', 'L', 'o4', 'X'], ['de', 'L', 'o4', 'Y'], ['u1', 'N', 'o4', 'Z'],
    ['dw', 'L', 'o5', 'X'],
    ['o5', 'R', 'o6', 'A'], ['o4', 'R', 'o6', 'R'],
    ['o6', 'P', 'o7', 'P'], ['o1', 'R', 'o7', 'RX'], ['o2', 'R', 'o7', 'RY'], ['o3', 'R', 'o7', 'A'],
    ['o7', 'C', 'o8', 'G'],
    /* sun */
    ['s1', 'C', 's2', 'G'], ['s3', 'C', 's4', 'G'],
    /* moon */
    ['k8', 'P', 'm1', 'L'],
    ['u1', 'N', 'm2', 'X'], ['u3', 'N', 'm2', 'Y'],
    ['k1', 'R', 'm3', 'X'],
    ['m3', 'R', 'm4', 'X'],
    ['m2', 'R', 'm5', 'X'], ['m4', 'R', 'm5', 'Z'],
    ['m4', 'R', 'm6', 'X'],
    ['m1', 'E', 'm7', 'O'], ['m6', 'R', 'm7', 'A'], ['m5', 'R', 'm7', 'R'],
    ['u2', 'N', 'm8', 'A'],
    ['m8', 'R', 'm9', 'A'],
    ['m7', 'P', 'm10', 'P'], ['m9', 'R', 'm10', 'R'],
    ['m10', 'C', 'm11', 'G'],
    ['m2', 'R', 'm12', 'X'],
    ['m2', 'R', 'm13', 'X'],
    ['m1', 'E', 'm14', 'O'], ['m13', 'R', 'm14', 'R'],
    ['m14', 'P', 'm15', 'P'], ['m2', 'R', 'm15', 'RX'], ['m12', 'R', 'm15', 'RY'],
    ['m15', 'C', 'm16', 'G'],
    /* labels */
    ['k10', 'R', 'b1', 'X'],
    ['b1', 'R', 'b2', 'Y'],
    ['dn', 'L', 'b3', 'T'], ['k8', 'P', 'b3', 'P'],
    ['b3', 'G', 'b4', 'G'], ['b2', 'V', 'b4', 'T'],
    ['b4', 'G', 'b5', 'G'],
    /* date */
    ['k1', 'R', 'g1', 'V'],
    ['g1', 'R', 'g2', 'A'],
    ['k1', 'R', 'g3', 'A'], ['g1', 'R', 'g3', 'B'],
    ['g3', 'R', 'g4', 'A'],
    ['dm', 'L', 'g5', 'L'], ['g4', 'R', 'g5', 'i'],
    ['v1', 'W', 'g6', 'X'],
    ['v1', 'H', 'g7', 'X'],
    ['g6', 'R', 'g8', 'X'], ['g7', 'R', 'g8', 'Y'],
    ['g5', 'E', 'g9', 'T'], ['g8', 'P', 'g9', 'P'],
    ['v1', 'W', 'g10', 'X'],
    ['g10', 'R', 'g11', 'X'], ['g7', 'R', 'g11', 'Y'],
    ['g2', 'R', 'g12', 'T'], ['g11', 'P', 'g12', 'P'],
    ['g9', 'G', 'g13', 'G'], ['g12', 'G', 'g13', 'G'],
    /* caption */
    ['v1', 'H', 'c1', 'X'],
    ['c1', 'R', 'c2', 'Y'],
    ['c2', 'P', 'c3', 'P'],
    ['c3', 'G', 'c4', 'G']
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
  ]),

  /* move the mouse and watch it register twice: Time Graph seismographs the
   * scaled x/y on the loom, Trace streams the same two lines across the cloth
   * from an anchor pen, swatch-coloured. A white dot marks the pointer. */
  'Seismograph': _EX([
    ['s1', 'input/mouse', 30, 120],
    ['s2', 'math/mul', 250, 60, { B: 0.25 }],
    ['s3', 'math/mul', 250, 220, { B: 0.25 }],
    ['s4', 'params/timegraph', 470, 40],
    ['s5', 'params/swatch', 250, 380, { hex: '#5eead4' }],
    ['s6', 'params/swatch', 250, 500, { hex: '#f472b6' }],
    ['s7', 'params/anchor', 30, 420, { x: 150, y: -60 }],
    ['s8', 'vec/vecxy', 250, 620, { X: -70, Y: 0 }],
    ['s9', 'disp/trace', 700, 300, { L: 300 }],
    ['s10', 'vec/construct', 470, 620],
    ['s11', 'crv/circle', 700, 640, { R: 4 }],
    ['s12', 'disp/draw', 920, 620, { F: { r: 230, g: 237, b: 250, a: 0.9 }, S: { r: 0, g: 0, b: 0, a: 0 } }]
  ], [
    ['s1', 'X', 's2', 'A'], ['s1', 'Y', 's3', 'A'],
    ['s2', 'R', 's4', 'V'], ['s3', 'R', 's4', 'V'],
    ['s2', 'R', 's9', 'V'], ['s3', 'R', 's9', 'V'],
    ['s5', 'C', 's9', 'C'], ['s6', 'C', 's9', 'C'],
    ['s7', 'P', 's9', 'P'],
    ['s8', 'V', 's9', 'D'],
    ['s1', 'X', 's10', 'X'], ['s1', 'Y', 's10', 'Y'],
    ['s10', 'P', 's11', 'P'],
    ['s11', 'C', 's12', 'G']
  ]),

  /* Audio: four sine voices in a 2:3:4:5 stack, swelling on a slow LFO that
   * also breathes a circle — sound starts after the first click (browser rule). */
  'Drone chord': _EX([
    ['a1', 'sets/series', 30, 40, { S: 110, N: 55, C: 4 }],
    ['a2', 'audio/osc', 250, 40, { wave: 'sine' }],
    ['a3', 'input/time', 30, 300],
    ['a4', 'math/mul', 250, 320, { B: 0.6 }],
    ['a5', 'math/sin', 450, 320],
    ['a6', 'math/remap', 650, 280, { S0: -1, S1: 1, T0: 0.04, T1: 0.16 }],
    ['a7', 'audio/gain', 470, 40],
    ['a8', 'audio/out', 690, 40],
    ['a9', 'math/remap', 650, 480, { S0: -1, S1: 1, T0: 44, T1: 92 }],
    ['a10', 'crv/circle', 880, 440],
    ['a11', 'disp/draw', 1100, 440, { S: { r: 94, g: 234, b: 212, a: 0.9 }, W: 2 }],
    ['a12', 'disp/bg', 1100, 620]
  ], [
    ['a1', 'S', 'a2', 'F'],
    ['a2', 'A', 'a7', 'In'],
    ['a6', 'R', 'a7', 'G'],
    ['a7', 'A', 'a8', 'In'],
    ['a3', 'T', 'a4', 'A'],
    ['a4', 'R', 'a5', 'V'],
    ['a5', 'R', 'a6', 'V'],
    ['a5', 'R', 'a9', 'V'],
    ['a9', 'R', 'a10', 'R'],
    ['a10', 'C', 'a11', 'G']
  ]),

  /* Audio: mouse X = pitch snapped to A minor pentatonic (the Scale node is
   * what makes it an instrument), mouse Y = volume. The trace draws the
   * snapped melody as a stairstep — quantization made visible. */
  'Theremin': _EX([
    ['t1', 'input/mouse', 30, 40],
    ['t2', 'math/remap', 250, 40, { S0: 0, S1: 1, T0: 45, T1: 81 }],
    ['t3', 'audio/scale', 470, 40, { root: 9, scale: 'pentatonic' }],
    ['t4', 'audio/osc', 690, 40, { wave: 'sine' }],
    ['t5', 'math/remap', 250, 280, { S0: 0, S1: 1, T0: 0.3, T1: 0 }],
    ['t6', 'audio/gain', 690, 240],
    ['t7', 'audio/out', 910, 40],
    ['t8', 'vec/construct', 250, 480],
    ['t9', 'math/remap', 470, 320, { S0: 0, S1: 0.3, T0: 6, T1: 26 }],
    ['t10', 'crv/circle', 470, 480],
    ['t11', 'disp/draw', 690, 480, { S: { r: 94, g: 234, b: 212, a: 0.9 }, F: { r: 94, g: 234, b: 212, a: 0.18 }, W: 2 }],
    ['t12', 'math/remap', 690, 320, { S0: 45, S1: 81, T0: 60, T1: -60 }],
    ['t13', 'disp/trace', 910, 320, { P: { x: 0, y: 170 }, D: { x: -140, y: 0 }, L: 500, W: 2 }],
    ['t14', 'disp/bg', 910, 520]
  ], [
    ['t1', 'NX', 't2', 'V'],
    ['t2', 'R', 't3', 'V'],
    ['t3', 'F', 't4', 'F'],
    ['t4', 'A', 't6', 'In'],
    ['t1', 'NY', 't5', 'V'],
    ['t5', 'R', 't6', 'G'],
    ['t6', 'A', 't7', 'In'],
    ['t1', 'X', 't8', 'X'], ['t1', 'Y', 't8', 'Y'],
    ['t8', 'P', 't10', 'P'],
    ['t5', 'R', 't9', 'V'],
    ['t9', 'R', 't10', 'R'],
    ['t10', 'C', 't11', 'G'],
    ['t3', 'M', 't12', 'V'],
    ['t12', 'R', 't13', 'V']
  ]),

  /* The theremin grown into an instrument you can see: every note of A
   * pentatonic drawn as a labelled rung (Series → Scale → Set Union dedupes
   * the snapped notes), a marker riding the rung you're playing, and three
   * REAL <button> drones (one Element node, list-matched ×3) latching
   * A2 / E3 / A3 under everything. Buttons on the interface itself. */
  'Scale board': _EX([
    ['s1', 'sets/series', 30, 40, { S: 57, N: 1, C: 25 }],
    ['s2', 'audio/scale', 250, 40, { root: 9, scale: 'pentatonic' }],
    ['s3', 'sets/union', 470, 40],
    ['s4', 'math/remap', 690, 40, { S0: 57, S1: 81, T0: 150, T1: -190 }],
    ['s5', 'vec/construct', 910, 40, { X: -200 }],
    ['s6', 'vec/construct', 910, 190, { X: 0 }],
    ['s7', 'crv/rect', 1130, 190, { W: 330, H: 1 }],
    ['s8', 'disp/draw', 1350, 190, { S: { r: 142, g: 164, b: 195, a: 0.25 }, W: 1 }],
    ['s9', 'math/mod', 690, 340, { B: 12 }],
    ['s10', 'params/textlist', 690, 480, { text: 'C\nC#\nD\nD#\nE\nF\nF#\nG\nG#\nA\nA#\nB' }],
    ['s11', 'sets/item', 910, 360],
    ['s12', 'disp/text', 1130, 340, { S: 12 }],
    ['s13', 'disp/draw', 1350, 340, { S: { r: 230, g: 237, b: 250, a: 0.65 } }],
    ['v1', 'input/mouse', 30, 620],
    ['v2', 'math/remap', 250, 620, { S0: 0, S1: 1, T0: 81, T1: 57 }],
    ['v3', 'audio/scale', 470, 620, { root: 9, scale: 'pentatonic' }],
    ['v4', 'audio/osc', 690, 620, { wave: 'sine' }],
    ['v5', 'audio/gain', 910, 620, { G: 0.14 }],
    ['v6', 'audio/out', 1570, 620],
    ['v7', 'math/remap', 690, 770, { S0: 57, S1: 81, T0: 150, T1: -190 }],
    ['v8', 'vec/construct', 910, 770, { X: -165 }],
    ['v9', 'crv/circle', 1130, 770, { R: 7 }],
    ['v10', 'disp/draw', 1350, 770, { S: { r: 94, g: 234, b: 212, a: 0.9 }, F: { r: 94, g: 234, b: 212, a: 0.5 }, W: 1.5 }],
    ['d1', 'params/number', 30, 950, { N: 45 }],
    ['d2', 'params/number', 30, 1040, { N: 52 }],
    ['d3', 'params/number', 30, 1130, { N: 57 }],
    ['d4', 'audio/scale', 250, 990, { root: 0, scale: 'chromatic' }],
    ['d5', 'audio/osc', 470, 990, { wave: 'sine' }],
    ['d6', 'sets/series', 30, 1280, { S: 0, N: 1, C: 3 }],
    ['d7', 'math/remap', 250, 1280, { S0: 0, S1: 2, T0: -120, T1: 120 }],
    ['d8', 'vec/construct', 470, 1280, { Y: 220 }],
    ['d9', 'crv/rect', 690, 1280, { W: 104, H: 32 }],
    ['d10', 'params/textlist', 690, 1420, { text: 'drone A2\ndrone E3\ndrone A3' }],
    ['d11', 'disp/element', 910, 1280, { T: 'button' }],
    ['d12', 'state/latch', 1130, 1280],
    ['d13', 'sets/select', 1350, 1280, { T: 0.12, F: 0 }],
    ['d14', 'audio/gain', 1350, 1080],
    ['b1', 'disp/bg', 1570, 770]
  ], [
    ['s1', 'S', 's2', 'V'],
    ['s2', 'M', 's3', 'A'], ['s2', 'M', 's3', 'B'],
    ['s3', 'U', 's4', 'V'],
    ['s4', 'R', 's5', 'Y'], ['s4', 'R', 's6', 'Y'],
    ['s6', 'P', 's7', 'P'], ['s7', 'C', 's8', 'G'],
    ['s3', 'U', 's9', 'A'],
    ['s10', 'L', 's11', 'L'], ['s9', 'R', 's11', 'i'],
    ['s11', 'E', 's12', 'T'], ['s5', 'P', 's12', 'P'],
    ['s12', 'G', 's13', 'G'],
    ['v1', 'NY', 'v2', 'V'],
    ['v2', 'R', 'v3', 'V'],
    ['v3', 'F', 'v4', 'F'],
    ['v4', 'A', 'v5', 'In'],
    ['v5', 'A', 'v6', 'In'],
    ['v3', 'M', 'v7', 'V'],
    ['v7', 'R', 'v8', 'Y'],
    ['v8', 'P', 'v9', 'P'],
    ['v9', 'C', 'v10', 'G'],
    ['d1', 'N', 'd4', 'V'], ['d2', 'N', 'd4', 'V'], ['d3', 'N', 'd4', 'V'],
    ['d4', 'F', 'd5', 'F'],
    ['d6', 'S', 'd7', 'V'],
    ['d7', 'R', 'd8', 'X'],
    ['d8', 'P', 'd9', 'P'],
    ['d9', 'C', 'd11', 'G'], ['d10', 'L', 'd11', 'C'],
    ['d11', 'K', 'd12', 'T'],
    ['d12', 'B', 'd13', 'P'],
    ['d5', 'A', 'd14', 'In'], ['d13', 'L', 'd14', 'G'],
    ['d14', 'A', 'v6', 'In']
  ]),

  /* Sound made visible: sand on a vibrating plate migrates to the quiet
   * nodal lines of whatever frequency is playing. Slide the pitch and watch
   * the figure reorganize. */
  'Cymatics': _EX([
    ['c1', 'params/slider', 30, 40, { min: 36, max: 96, value: 57 }],
    ['c2', 'audio/scale', 250, 40, { root: 9, scale: 'pentatonic' }],
    ['c3', 'audio/osc', 470, 40, { wave: 'sine' }],
    ['c4', 'audio/gain', 690, 40, { G: 0.12 }],
    ['c5', 'audio/out', 910, 40],
    ['c6', 'disp/cymatics', 470, 240, { S: 380, N: 1400 }],
    ['c7', 'disp/bg', 690, 420]
  ], [
    ['c1', 'N', 'c2', 'V'],
    ['c2', 'F', 'c3', 'F'],
    ['c3', 'A', 'c4', 'In'],
    ['c4', 'A', 'c5', 'In'],
    ['c2', 'F', 'c6', 'F']
  ]),

  /* A real oscilloscope: the Scope node taps the audio wire and draws the
   * actual samples, trigger-locked. A sawtooth runs through a lowpass whose
   * cutoff rides mouse X — slide right and watch the hard edges melt as the
   * harmonics come off. Mouse Y = volume. */
  'Oscilloscope': _EX([
    ['o1', 'params/slider', 30, 40, { min: 55, max: 440, value: 110 }],
    ['o2', 'audio/osc', 250, 40, { wave: 'sawtooth' }],
    ['o3', 'input/mouse', 30, 220],
    ['o4', 'math/remap', 250, 220, { S0: 0, S1: 1, T0: 200, T1: 6000 }],
    ['o5', 'audio/filter', 470, 40, { mode: 'lowpass', Q: 4 }],
    ['o6', 'math/remap', 250, 400, { S0: 0, S1: 1, T0: 0.25, T1: 0 }],
    ['o7', 'audio/gain', 690, 40],
    ['o8', 'audio/out', 910, 40],
    ['o9', 'audio/scope', 690, 260, { W: 480, H: 200, T: 18 }],
    ['o10', 'disp/bg', 910, 420]
  ], [
    ['o1', 'N', 'o2', 'F'],
    ['o2', 'A', 'o5', 'In'],
    ['o3', 'NX', 'o4', 'V'],
    ['o4', 'R', 'o5', 'F'],
    ['o5', 'A', 'o7', 'In'],
    ['o3', 'NY', 'o6', 'V'],
    ['o6', 'R', 'o7', 'G'],
    ['o7', 'A', 'o8', 'In'],
    ['o5', 'A', 'o9', 'In']
  ]),

  /* Microphone loudness as a number — a breathing circle and a scrolling
   * trace of the room. The browser asks mic permission when this loads. */
  'Mic meter': _EX([
    ['m1', 'audio/mic', 30, 40],
    ['m2', 'state/smooth', 250, 40, { S: 10 }],
    ['m3', 'math/remap', 470, 40, { S0: 0, S1: 1, T0: 14, T1: 190 }],
    ['m4', 'crv/circle', 690, 40],
    ['m5', 'disp/draw', 910, 40, { S: { r: 94, g: 234, b: 212, a: 0.9 }, F: { r: 94, g: 234, b: 212, a: 0.15 }, W: 2 }],
    ['m6', 'math/remap', 470, 220, { S0: 0, S1: 1, T0: 0, T1: -150 }],
    ['m7', 'disp/trace', 690, 220, { P: { x: 0, y: 170 }, D: { x: -120, y: 0 }, L: 600, W: 2 }],
    ['m8', 'disp/bg', 910, 320]
  ], [
    ['m1', 'V', 'm2', 'V'],
    ['m2', 'R', 'm3', 'V'],
    ['m3', 'R', 'm4', 'R'],
    ['m4', 'C', 'm5', 'G'],
    ['m2', 'R', 'm6', 'V'],
    ['m6', 'R', 'm7', 'V']
  ])
};
