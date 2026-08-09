'use strict';
/* Weft example graphs — each is a plain graph JSON, deep-cloned before loading.
 * A node entry is [id, type, x, y, values?, flags?]; flags merge onto the node,
 * which is how an example carries `preview: false` or `collapsed: true` without
 * being written out as raw JSON the way Hexa graph is. */
function _EX(nodes, wires) {
  return {
    format: 1,
    nodes: nodes.map(a => Object.assign({ id: a[0], type: a[1], x: a[2], y: a[3], values: a[4] || {} }, a[5] || {})),
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

  /* series → golden-angle spiral of circles, sized by expression, coloured by index */
  'Phyllotaxis': {
    "format": 2,
    "nodes": [
      {
        "id": "n2",
        "type": "sets/series",
        "x": 253,
        "y": -59,
        "values": {
          "S": 7
        }
      },
      {
        "id": "n4",
        "type": "math/mul",
        "x": 460,
        "y": 40,
        "values": {}
      },
      {
        "id": "n5",
        "type": "input/time",
        "x": -16,
        "y": 340,
        "values": {}
      },
      {
        "id": "n7",
        "type": "params/slider",
        "x": -19,
        "y": 487,
        "values": {
          "min": -2,
          "max": 2,
          "value": 0.15
        }
      },
      {
        "id": "n6",
        "type": "math/mul",
        "x": 240,
        "y": 400,
        "values": {}
      },
      {
        "id": "n8",
        "type": "math/add",
        "x": 660,
        "y": 120,
        "values": {}
      },
      {
        "id": "n10",
        "type": "math/sqrt",
        "x": 279,
        "y": 249,
        "values": {}
      },
      {
        "id": "n9",
        "type": "params/slider",
        "x": 30,
        "y": 640,
        "values": {
          "min": 0,
          "max": 2,
          "value": 1.263
        }
      },
      {
        "id": "n11",
        "type": "math/mul",
        "x": 479,
        "y": 257,
        "values": {}
      },
      {
        "id": "n12",
        "type": "vec/polar",
        "x": 850,
        "y": 171,
        "values": {
          "O": {
            "x": 0,
            "y": 0
          }
        }
      },
      {
        "id": "n19",
        "type": "disp/draw",
        "x": 1659,
        "y": 295,
        "values": {
          "S": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 0
          },
          "W": 1
        }
      },
      {
        "id": "n20",
        "type": "params/svg",
        "x": -58,
        "y": -1428,
        "values": {
          "name": "PK logo elementsArtboard 28",
          "paths": [
            {
              "pts": [
                [
                  0.1534,
                  -0.2615
                ],
                [
                  0.0966,
                  -0.314
                ],
                [
                  0.0754,
                  -0.3349
                ],
                [
                  0.0537,
                  -0.3594
                ],
                [
                  0.0359,
                  -0.3832
                ],
                [
                  0.019,
                  -0.4112
                ],
                [
                  0.0049,
                  -0.4407
                ],
                [
                  -0.0074,
                  -0.4742
                ],
                [
                  -0.0175,
                  -0.5116
                ],
                [
                  -0.0172,
                  -0.4827
                ],
                [
                  -0.0197,
                  -0.456
                ],
                [
                  -0.0246,
                  -0.4327
                ],
                [
                  -0.0325,
                  -0.4103
                ],
                [
                  -0.0464,
                  -0.384
                ],
                [
                  -0.0639,
                  -0.36
                ],
                [
                  -0.0858,
                  -0.3357
                ],
                [
                  -0.1386,
                  -0.2832
                ],
                [
                  -0.1472,
                  -0.2711
                ],
                [
                  -0.1554,
                  -0.252
                ],
                [
                  -0.1602,
                  -0.2318
                ],
                [
                  -0.1624,
                  -0.2081
                ],
                [
                  -0.1614,
                  -0.1814
                ],
                [
                  -0.1839,
                  -0.2614
                ],
                [
                  -0.191,
                  -0.2347
                ],
                [
                  -0.1998,
                  -0.2126
                ],
                [
                  -0.2093,
                  -0.194
                ],
                [
                  -0.232,
                  -0.1556
                ],
                [
                  -0.2388,
                  -0.1423
                ],
                [
                  -0.2427,
                  -0.1311
                ],
                [
                  -0.2445,
                  -0.1224
                ],
                [
                  -0.2455,
                  -0.1105
                ],
                [
                  -0.2449,
                  -0.0957
                ],
                [
                  -0.2423,
                  -0.081
                ],
                [
                  -0.2375,
                  -0.0638
                ],
                [
                  -0.2324,
                  -0.0499
                ],
                [
                  -0.2271,
                  -0.0392
                ],
                [
                  -0.2565,
                  -0.098
                ],
                [
                  -0.2627,
                  -0.1082
                ],
                [
                  -0.2644,
                  -0.1106
                ],
                [
                  -0.265,
                  -0.1099
                ],
                [
                  -0.2645,
                  -0.0951
                ],
                [
                  -0.2668,
                  -0.0804
                ],
                [
                  -0.2955,
                  0.0009
                ],
                [
                  -0.2991,
                  0.0154
                ],
                [
                  -0.3001,
                  0.0302
                ],
                [
                  -0.2991,
                  0.042
                ],
                [
                  -0.2968,
                  0.0537
                ],
                [
                  -0.2874,
                  0.0819
                ],
                [
                  -0.2752,
                  0.1057
                ],
                [
                  -0.2654,
                  0.1206
                ],
                [
                  -0.2599,
                  0.1263
                ],
                [
                  -0.2666,
                  0.1203
                ],
                [
                  -0.2742,
                  0.1112
                ],
                [
                  -0.2902,
                  0.0861
                ],
                [
                  -0.3088,
                  0.0489
                ],
                [
                  -0.323,
                  0.0129
                ],
                [
                  -0.3177,
                  0.0586
                ],
                [
                  -0.3132,
                  0.1299
                ],
                [
                  -0.3096,
                  0.1564
                ],
                [
                  -0.3052,
                  0.1798
                ],
                [
                  -0.2969,
                  0.2114
                ],
                [
                  -0.2872,
                  0.2396
                ],
                [
                  -0.2753,
                  0.2668
                ],
                [
                  -0.2613,
                  0.2931
                ],
                [
                  -0.2436,
                  0.3206
                ],
                [
                  -0.2235,
                  0.3464
                ],
                [
                  -0.2013,
                  0.3705
                ],
                [
                  -0.1773,
                  0.3927
                ],
                [
                  -0.1516,
                  0.413
                ],
                [
                  -0.1246,
                  0.4315
                ],
                [
                  -0.0939,
                  0.4496
                ],
                [
                  -0.0593,
                  0.467
                ],
                [
                  -0.0546,
                  0.4706
                ],
                [
                  -0.0508,
                  0.4752
                ],
                [
                  -0.0464,
                  0.4829
                ],
                [
                  -0.0383,
                  0.5084
                ],
                [
                  -0.0363,
                  0.5105
                ],
                [
                  -0.0335,
                  0.5114
                ],
                [
                  -0.0307,
                  0.5104
                ],
                [
                  -0.0286,
                  0.5083
                ],
                [
                  -0.0162,
                  0.4814
                ],
                [
                  -0.0111,
                  0.474
                ],
                [
                  -0.0048,
                  0.4678
                ],
                [
                  0.0003,
                  0.4647
                ],
                [
                  0.031,
                  0.4533
                ],
                [
                  0.0609,
                  0.4399
                ],
                [
                  0.0872,
                  0.4261
                ],
                [
                  0.1126,
                  0.4106
                ],
                [
                  0.1369,
                  0.3935
                ],
                [
                  0.1601,
                  0.3748
                ],
                [
                  0.182,
                  0.3547
                ],
                [
                  0.2044,
                  0.3309
                ],
                [
                  0.2215,
                  0.3102
                ],
                [
                  0.239,
                  0.2862
                ],
                [
                  0.2551,
                  0.2611
                ],
                [
                  0.2681,
                  0.2378
                ],
                [
                  0.2819,
                  0.2081
                ],
                [
                  0.3074,
                  0.1446
                ],
                [
                  0.3175,
                  0.1135
                ],
                [
                  0.3216,
                  0.0931
                ],
                [
                  0.3258,
                  0.0618
                ],
                [
                  0.3123,
                  0.0883
                ],
                [
                  0.2948,
                  0.1124
                ],
                [
                  0.2739,
                  0.1335
                ],
                [
                  0.2457,
                  0.1553
                ],
                [
                  0.2629,
                  0.1398
                ],
                [
                  0.2779,
                  0.1213
                ],
                [
                  0.2879,
                  0.1031
                ],
                [
                  0.2919,
                  0.0918
                ],
                [
                  0.2936,
                  0.0831
                ],
                [
                  0.294,
                  0.0623
                ],
                [
                  0.2904,
                  0.0268
                ],
                [
                  0.2857,
                  0.0004
                ],
                [
                  0.2773,
                  -0.0312
                ],
                [
                  0.2748,
                  -0.0459
                ],
                [
                  0.2742,
                  -0.0637
                ],
                [
                  0.2758,
                  -0.0814
                ],
                [
                  0.2692,
                  -0.068
                ],
                [
                  0.2552,
                  -0.032
                ],
                [
                  0.2451,
                  -0.0125
                ],
                [
                  0.2545,
                  -0.0438
                ],
                [
                  0.2586,
                  -0.0702
                ],
                [
                  0.2583,
                  -0.091
                ],
                [
                  0.2525,
                  -0.111
                ],
                [
                  0.2173,
                  -0.1962
                ],
                [
                  0.2093,
                  -0.2187
                ],
                [
                  0.2037,
                  -0.2387
                ],
                [
                  0.2028,
                  -0.2167
                ],
                [
                  0.2004,
                  -0.202
                ],
                [
                  0.196,
                  -0.1878
                ],
                [
                  0.1885,
                  -0.1725
                ],
                [
                  0.1868,
                  -0.1932
                ],
                [
                  0.1794,
                  -0.2189
                ],
                [
                  0.1676,
                  -0.2429
                ],
                [
                  0.1609,
                  -0.2528
                ]
              ],
              "closed": true,
              "fill": {
                "r": 0,
                "g": 0,
                "b": 0,
                "a": 1
              },
              "stroke": {
                "r": 255,
                "g": 255,
                "b": 255,
                "a": 0
              }
            }
          ],
          "S": 30
        }
      },
      {
        "id": "n21",
        "type": "xf/move",
        "x": 1470,
        "y": -166,
        "values": {}
      },
      {
        "id": "n22",
        "type": "vec/vec2pt",
        "x": 1100,
        "y": -72,
        "values": {}
      },
      {
        "id": "n23",
        "type": "vec/angle",
        "x": 1030,
        "y": -195,
        "values": {}
      },
      {
        "id": "n24",
        "type": "xf/rotate",
        "x": 1136,
        "y": -456,
        "values": {},
        "preview": false
      },
      {
        "id": "n26",
        "type": "xf/rotate",
        "x": 800,
        "y": -488,
        "values": {},
        "preview": false
      },
      {
        "id": "n27",
        "type": "math/rad",
        "x": 827,
        "y": -554,
        "values": {}
      },
      {
        "id": "n28",
        "type": "params/slider",
        "x": 813,
        "y": -647,
        "values": {
          "min": 0,
          "max": 180,
          "value": 88,
          "mode": "int"
        }
      },
      {
        "id": "n30",
        "type": "xf/scale",
        "x": 776,
        "y": -162,
        "values": {
          "mode": "uniform"
        },
        "preview": false
      },
      {
        "id": "n32",
        "type": "math/remap",
        "x": 992,
        "y": 350,
        "values": {
          "T1": 1,
          "S1": 1,
          "C": false
        }
      },
      {
        "id": "n34",
        "type": "sets/series",
        "x": 227,
        "y": 73,
        "values": {}
      },
      {
        "id": "n35",
        "type": "math/div",
        "x": 80,
        "y": -221,
        "values": {
          "A": 1
        }
      },
      {
        "id": "n36",
        "type": "params/slider",
        "x": 660,
        "y": 379,
        "values": {
          "min": 0,
          "max": 1,
          "value": 0.3,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n37",
        "type": "params/slider",
        "x": 670,
        "y": 455,
        "values": {
          "min": 0,
          "max": 10,
          "value": 2.5,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n41",
        "type": "params/slider",
        "x": -42,
        "y": 838,
        "values": {
          "min": 0,
          "max": 10,
          "value": 0.5,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n43",
        "type": "params/slider",
        "x": -33,
        "y": 774,
        "values": {
          "min": 0,
          "max": 10,
          "value": 1,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n50",
        "type": "math/pow",
        "x": 682,
        "y": 270,
        "values": {}
      },
      {
        "id": "n51",
        "type": "params/slider",
        "x": -30,
        "y": 721,
        "values": {
          "min": 0,
          "max": 10,
          "value": 2,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n52",
        "type": "math/rad",
        "x": 396,
        "y": 175,
        "values": {}
      },
      {
        "id": "n53",
        "type": "params/slider",
        "x": -28,
        "y": 223,
        "values": {
          "min": 136,
          "max": 137.5,
          "value": 137.5,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n54",
        "type": "disp/gradient",
        "x": 1342,
        "y": 282,
        "values": {
          "T": 0.4,
          "A": {
            "r": 2,
            "g": 34,
            "b": 14,
            "a": 1
          },
          "B": {
            "r": 4,
            "g": 153,
            "b": 92,
            "a": 1
          }
        }
      },
      {
        "id": "n55",
        "type": "input/mouse",
        "x": -85,
        "y": -656,
        "values": {}
      },
      {
        "id": "n56",
        "type": "vec/distance",
        "x": 353,
        "y": -624,
        "values": {}
      },
      {
        "id": "n57",
        "type": "vec/construct",
        "x": 244,
        "y": -584,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n58",
        "type": "vec/vec2pt",
        "x": 386,
        "y": -715,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n59",
        "type": "vec/construct",
        "x": 248,
        "y": -702,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n60",
        "type": "params/slider",
        "x": -47,
        "y": -400,
        "values": {
          "min": 0,
          "max": 10,
          "value": 0.7,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n61",
        "type": "state/smooth",
        "x": 229,
        "y": -459,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n62",
        "type": "state/smooth",
        "x": 211,
        "y": -513,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n63",
        "type": "math/remap",
        "x": -335,
        "y": -280,
        "values": {
          "T1": 7,
          "S1": 500,
          "T0": 300
        }
      },
      {
        "id": "n64",
        "type": "params/number",
        "x": 30,
        "y": 34,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n65",
        "type": "state/smooth",
        "x": 452,
        "y": -458,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n66",
        "type": "math/sin",
        "x": -313,
        "y": -36,
        "values": {}
      },
      {
        "id": "n67",
        "type": "math/mul",
        "x": -154,
        "y": -30,
        "values": {
          "B": 5
        },
        "collapsed": true
      },
      {
        "id": "n68",
        "type": "params/timegraph",
        "x": -183,
        "y": 86,
        "values": {}
      },
      {
        "id": "n69",
        "type": "math/add",
        "x": -49,
        "y": -141,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n70",
        "type": "sets/dispatch",
        "x": 476,
        "y": -1057,
        "values": {}
      },
      {
        "id": "n72",
        "type": "params/svg",
        "x": 231,
        "y": -1504,
        "values": {
          "name": "PK logo elementsArtboard 29",
          "paths": [
            {
              "pts": [
                [
                  -0.1779,
                  0.3081
                ],
                [
                  -0.3555,
                  0.0003
                ],
                [
                  -0.3546,
                  -0.0021
                ],
                [
                  -0.1784,
                  -0.3075
                ],
                [
                  -0.1762,
                  -0.3084
                ],
                [
                  0.1764,
                  -0.3084
                ],
                [
                  0.1785,
                  -0.3072
                ],
                [
                  0.3547,
                  -0.0018
                ],
                [
                  0.3552,
                  0.0006
                ],
                [
                  0.1774,
                  0.3081
                ],
                [
                  -0.1779,
                  0.3081
                ]
              ],
              "closed": false,
              "fill": {
                "r": 0,
                "g": 0,
                "b": 0,
                "a": 1
              },
              "stroke": {
                "r": 255,
                "g": 255,
                "b": 255,
                "a": 0
              }
            },
            {
              "pts": [
                [
                  -0.2501,
                  0.433
                ],
                [
                  0.25,
                  0.433
                ],
                [
                  0.5,
                  -0.0002
                ],
                [
                  0.2497,
                  -0.433
                ],
                [
                  -0.2476,
                  -0.433
                ],
                [
                  -0.2502,
                  -0.4328
                ],
                [
                  -0.5,
                  0.0004
                ]
              ],
              "closed": true,
              "fill": {
                "r": 0,
                "g": 0,
                "b": 0,
                "a": 1
              },
              "stroke": {
                "r": 255,
                "g": 255,
                "b": 255,
                "a": 0
              }
            }
          ],
          "S": 30
        },
        "preview": false
      },
      {
        "id": "n73",
        "type": "input/hotspot",
        "x": -114,
        "y": -868,
        "values": {}
      },
      {
        "id": "n74",
        "type": "crv/circle",
        "x": -365,
        "y": -753,
        "values": {
          "R": 229
        }
      },
      {
        "id": "n76",
        "type": "state/latch",
        "x": 75,
        "y": -822,
        "values": {}
      },
      {
        "id": "n77",
        "type": "sets/dispatch",
        "x": 477,
        "y": -1172,
        "values": {}
      },
      {
        "id": "n81",
        "type": "params/swatch",
        "x": 762,
        "y": -970,
        "values": {
          "hex": "#04995c",
          "a": 1
        }
      },
      {
        "id": "n82",
        "type": "sets/dispatch",
        "x": 852,
        "y": -984,
        "values": {}
      },
      {
        "id": "n83",
        "type": "sets/dispatch",
        "x": 903,
        "y": -1156,
        "values": {}
      },
      {
        "id": "n84",
        "type": "params/swatch",
        "x": 791,
        "y": -1154,
        "values": {
          "hex": "#0eb3c8",
          "a": 1
        }
      },
      {
        "id": "n86",
        "type": "crv/polygon",
        "x": 469,
        "y": -1560,
        "values": {
          "R": 16
        }
      },
      {
        "id": "n87",
        "type": "crv/polygon",
        "x": 468,
        "y": -1403,
        "values": {
          "R": 9
        }
      },
      {
        "id": "n89",
        "type": "crv/region",
        "x": 725,
        "y": -1363,
        "values": {
          "mode": "difference"
        },
        "collapsed": true
      },
      {
        "id": "n90",
        "type": "math/rad",
        "x": 473,
        "y": -1626,
        "values": {}
      },
      {
        "id": "n91",
        "type": "params/slider",
        "x": 426,
        "y": -1694,
        "values": {
          "min": 0,
          "max": 100,
          "value": 14,
          "mode": "int"
        }
      },
      {
        "id": "n93",
        "type": "sets/series",
        "x": 445,
        "y": 807,
        "values": {}
      },
      {
        "id": "n94",
        "type": "math/pow",
        "x": 664,
        "y": 714,
        "values": {}
      },
      {
        "id": "n95",
        "type": "math/mul",
        "x": 448,
        "y": 1004,
        "values": {}
      },
      {
        "id": "n96",
        "type": "math/pow",
        "x": 689,
        "y": 926,
        "values": {}
      }
    ],
    "wires": [
      {
        "id": "w2",
        "from": [
          "n2",
          "S"
        ],
        "to": [
          "n4",
          "A"
        ]
      },
      {
        "id": "w4",
        "from": [
          "n5",
          "T"
        ],
        "to": [
          "n6",
          "A"
        ]
      },
      {
        "id": "w5",
        "from": [
          "n7",
          "N"
        ],
        "to": [
          "n6",
          "B"
        ]
      },
      {
        "id": "w6",
        "from": [
          "n4",
          "R"
        ],
        "to": [
          "n8",
          "A"
        ]
      },
      {
        "id": "w7",
        "from": [
          "n6",
          "R"
        ],
        "to": [
          "n8",
          "B"
        ]
      },
      {
        "id": "w8",
        "from": [
          "n2",
          "S"
        ],
        "to": [
          "n10",
          "V"
        ]
      },
      {
        "id": "w9",
        "from": [
          "n10",
          "R"
        ],
        "to": [
          "n11",
          "A"
        ]
      },
      {
        "id": "w10",
        "from": [
          "n9",
          "N"
        ],
        "to": [
          "n11",
          "B"
        ]
      },
      {
        "id": "w11",
        "from": [
          "n8",
          "R"
        ],
        "to": [
          "n12",
          "A"
        ]
      },
      {
        "id": "w20",
        "from": [
          "n12",
          "P"
        ],
        "to": [
          "n22",
          "B"
        ]
      },
      {
        "id": "w22",
        "from": [
          "n22",
          "V"
        ],
        "to": [
          "n21",
          "T"
        ]
      },
      {
        "id": "w23",
        "from": [
          "n21",
          "G"
        ],
        "to": [
          "n19",
          "G"
        ]
      },
      {
        "id": "w24",
        "from": [
          "n12",
          "P"
        ],
        "to": [
          "n23",
          "B"
        ]
      },
      {
        "id": "w26",
        "from": [
          "n23",
          "R"
        ],
        "to": [
          "n24",
          "A"
        ]
      },
      {
        "id": "w28",
        "from": [
          "n24",
          "G"
        ],
        "to": [
          "n21",
          "G"
        ]
      },
      {
        "id": "w29",
        "from": [
          "n28",
          "N"
        ],
        "to": [
          "n27",
          "V"
        ]
      },
      {
        "id": "w30",
        "from": [
          "n27",
          "R"
        ],
        "to": [
          "n26",
          "A"
        ]
      },
      {
        "id": "w32",
        "from": [
          "n26",
          "G"
        ],
        "to": [
          "n24",
          "G"
        ]
      },
      {
        "id": "w36",
        "from": [
          "n32",
          "R"
        ],
        "to": [
          "n30",
          "F"
        ]
      },
      {
        "id": "w37",
        "from": [
          "n30",
          "G"
        ],
        "to": [
          "n26",
          "G"
        ]
      },
      {
        "id": "w41",
        "from": [
          "n35",
          "R"
        ],
        "to": [
          "n34",
          "N"
        ]
      },
      {
        "id": "w43",
        "from": [
          "n36",
          "N"
        ],
        "to": [
          "n32",
          "T0"
        ]
      },
      {
        "id": "w44",
        "from": [
          "n37",
          "N"
        ],
        "to": [
          "n32",
          "T1"
        ]
      },
      {
        "id": "w73",
        "from": [
          "n11",
          "R"
        ],
        "to": [
          "n50",
          "A"
        ]
      },
      {
        "id": "w74",
        "from": [
          "n50",
          "R"
        ],
        "to": [
          "n12",
          "R"
        ]
      },
      {
        "id": "w75",
        "from": [
          "n51",
          "N"
        ],
        "to": [
          "n50",
          "B"
        ]
      },
      {
        "id": "w76",
        "from": [
          "n52",
          "R"
        ],
        "to": [
          "n4",
          "B"
        ]
      },
      {
        "id": "w77",
        "from": [
          "n53",
          "N"
        ],
        "to": [
          "n52",
          "V"
        ]
      },
      {
        "id": "w78",
        "from": [
          "n54",
          "C"
        ],
        "to": [
          "n19",
          "F"
        ]
      },
      {
        "id": "w79",
        "from": [
          "n34",
          "S"
        ],
        "to": [
          "n54",
          "T"
        ]
      },
      {
        "id": "w80",
        "from": [
          "n55",
          "X"
        ],
        "to": [
          "n57",
          "X"
        ]
      },
      {
        "id": "w82",
        "from": [
          "n59",
          "P"
        ],
        "to": [
          "n58",
          "B"
        ]
      },
      {
        "id": "w83",
        "from": [
          "n60",
          "N"
        ],
        "to": [
          "n61",
          "S"
        ]
      },
      {
        "id": "w84",
        "from": [
          "n55",
          "Y"
        ],
        "to": [
          "n61",
          "V"
        ]
      },
      {
        "id": "w85",
        "from": [
          "n60",
          "N"
        ],
        "to": [
          "n62",
          "S"
        ]
      },
      {
        "id": "w86",
        "from": [
          "n55",
          "Y"
        ],
        "to": [
          "n57",
          "Y"
        ]
      },
      {
        "id": "w89",
        "from": [
          "n55",
          "X"
        ],
        "to": [
          "n62",
          "V"
        ]
      },
      {
        "id": "w91",
        "from": [
          "n64",
          "N"
        ],
        "to": [
          "n35",
          "B"
        ]
      },
      {
        "id": "w92",
        "from": [
          "n64",
          "N"
        ],
        "to": [
          "n2",
          "C"
        ]
      },
      {
        "id": "w93",
        "from": [
          "n64",
          "N"
        ],
        "to": [
          "n34",
          "C"
        ]
      },
      {
        "id": "w101",
        "from": [
          "n57",
          "P"
        ],
        "to": [
          "n56",
          "A"
        ]
      },
      {
        "id": "w102",
        "from": [
          "n60",
          "N"
        ],
        "to": [
          "n65",
          "S"
        ]
      },
      {
        "id": "w104",
        "from": [
          "n56",
          "D"
        ],
        "to": [
          "n65",
          "V"
        ]
      },
      {
        "id": "w105",
        "from": [
          "n65",
          "R"
        ],
        "to": [
          "n63",
          "V"
        ]
      },
      {
        "id": "w106",
        "from": [
          "n62",
          "R"
        ],
        "to": [
          "n59",
          "X"
        ]
      },
      {
        "id": "w107",
        "from": [
          "n61",
          "R"
        ],
        "to": [
          "n59",
          "Y"
        ]
      },
      {
        "id": "w109",
        "from": [
          "n66",
          "R"
        ],
        "to": [
          "n67",
          "A"
        ]
      },
      {
        "id": "w110",
        "from": [
          "n5",
          "T"
        ],
        "to": [
          "n66",
          "V"
        ]
      },
      {
        "id": "w111",
        "from": [
          "n66",
          "R"
        ],
        "to": [
          "n68",
          "V"
        ]
      },
      {
        "id": "w112",
        "from": [
          "n63",
          "R"
        ],
        "to": [
          "n69",
          "A"
        ]
      },
      {
        "id": "w113",
        "from": [
          "n67",
          "R"
        ],
        "to": [
          "n69",
          "B"
        ]
      },
      {
        "id": "w114",
        "from": [
          "n69",
          "R"
        ],
        "to": [
          "n64",
          "N"
        ]
      },
      {
        "id": "w118",
        "from": [
          "n20",
          "G"
        ],
        "to": [
          "n70",
          "L"
        ]
      },
      {
        "id": "w120",
        "from": [
          "n70",
          "B"
        ],
        "to": [
          "n30",
          "G"
        ]
      },
      {
        "id": "w123",
        "from": [
          "n74",
          "C"
        ],
        "to": [
          "n73",
          "G"
        ]
      },
      {
        "id": "w125",
        "from": [
          "n73",
          "C"
        ],
        "to": [
          "n76",
          "T"
        ]
      },
      {
        "id": "w126",
        "from": [
          "n76",
          "B"
        ],
        "to": [
          "n70",
          "P"
        ]
      },
      {
        "id": "w135",
        "from": [
          "n77",
          "A"
        ],
        "to": [
          "n30",
          "G"
        ]
      },
      {
        "id": "w136",
        "from": [
          "n76",
          "B"
        ],
        "to": [
          "n77",
          "P"
        ]
      },
      {
        "id": "w138",
        "from": [
          "n76",
          "B"
        ],
        "to": [
          "n82",
          "P"
        ]
      },
      {
        "id": "w140",
        "from": [
          "n76",
          "B"
        ],
        "to": [
          "n83",
          "P"
        ]
      },
      {
        "id": "w141",
        "from": [
          "n81",
          "C"
        ],
        "to": [
          "n82",
          "L"
        ]
      },
      {
        "id": "w142",
        "from": [
          "n84",
          "C"
        ],
        "to": [
          "n83",
          "L"
        ]
      },
      {
        "id": "w143",
        "from": [
          "n83",
          "A"
        ],
        "to": [
          "n54",
          "B"
        ]
      },
      {
        "id": "w144",
        "from": [
          "n82",
          "B"
        ],
        "to": [
          "n54",
          "B"
        ]
      },
      {
        "id": "w150",
        "from": [
          "n86",
          "C"
        ],
        "to": [
          "n89",
          "A"
        ]
      },
      {
        "id": "w151",
        "from": [
          "n87",
          "C"
        ],
        "to": [
          "n89",
          "B"
        ]
      },
      {
        "id": "w152",
        "from": [
          "n89",
          "C"
        ],
        "to": [
          "n77",
          "L"
        ]
      },
      {
        "id": "w153",
        "from": [
          "n90",
          "R"
        ],
        "to": [
          "n86",
          "A"
        ]
      },
      {
        "id": "w154",
        "from": [
          "n90",
          "R"
        ],
        "to": [
          "n87",
          "A"
        ]
      },
      {
        "id": "w155",
        "from": [
          "n91",
          "N"
        ],
        "to": [
          "n90",
          "V"
        ]
      },
      {
        "id": "w164",
        "from": [
          "n93",
          "S"
        ],
        "to": [
          "n94",
          "A"
        ]
      },
      {
        "id": "w165",
        "from": [
          "n95",
          "R"
        ],
        "to": [
          "n96",
          "A"
        ]
      },
      {
        "id": "w166",
        "from": [
          "n41",
          "N"
        ],
        "to": [
          "n93",
          "N"
        ]
      },
      {
        "id": "w167",
        "from": [
          "n41",
          "N"
        ],
        "to": [
          "n95",
          "B"
        ]
      },
      {
        "id": "w168",
        "from": [
          "n43",
          "N"
        ],
        "to": [
          "n94",
          "B"
        ]
      },
      {
        "id": "w169",
        "from": [
          "n43",
          "N"
        ],
        "to": [
          "n96",
          "B"
        ]
      },
      {
        "id": "w170",
        "from": [
          "n64",
          "N"
        ],
        "to": [
          "n95",
          "A"
        ]
      },
      {
        "id": "w171",
        "from": [
          "n64",
          "N"
        ],
        "to": [
          "n93",
          "C"
        ]
      },
      {
        "id": "w172",
        "from": [
          "n94",
          "R"
        ],
        "to": [
          "n32",
          "V"
        ]
      },
      {
        "id": "w173",
        "from": [
          "n96",
          "R"
        ],
        "to": [
          "n32",
          "S1"
        ]
      }
    ]
  },
  'Noise blob': {
    "format": 2,
    "nodes": [
      {
        "id": "n1",
        "type": "params/slider",
        "x": -85,
        "y": 53,
        "values": {
          "min": 3,
          "max": 64,
          "value": 21.037
        }
      },
      {
        "id": "n2",
        "type": "sets/series",
        "x": 240,
        "y": 40,
        "values": {}
      },
      {
        "id": "n3",
        "type": "math/expr",
        "x": 460,
        "y": 40,
        "values": {
          "expr": "X / Y * 2 * PI"
        }
      },
      {
        "id": "n4",
        "type": "input/time",
        "x": 30,
        "y": 300,
        "values": {}
      },
      {
        "id": "n5",
        "type": "math/expr",
        "x": 419,
        "y": 219,
        "values": {
          "expr": "X * 0.9 + Y * 0.6"
        }
      },
      {
        "id": "n6",
        "type": "math/noise",
        "x": 680,
        "y": 200,
        "values": {
          "Y": 0
        }
      },
      {
        "id": "n7",
        "type": "math/remap",
        "x": 880,
        "y": 160,
        "values": {
          "S0": 0,
          "S1": 1,
          "T0": 90,
          "T1": 200
        }
      },
      {
        "id": "n8",
        "type": "vec/polar",
        "x": 1111,
        "y": 55,
        "values": {}
      },
      {
        "id": "n9",
        "type": "crv/interp",
        "x": 1420,
        "y": 138,
        "values": {
          "C": true
        }
      },
      {
        "id": "n10",
        "type": "disp/draw",
        "x": 1875,
        "y": 164,
        "values": {
          "S": {
            "r": 94,
            "g": 234,
            "b": 212,
            "a": 1
          },
          "F": {
            "r": 94,
            "g": 234,
            "b": 212,
            "a": 0.08
          },
          "W": 2
        }
      },
      {
        "id": "n14",
        "type": "math/noise",
        "x": 677,
        "y": 585,
        "values": {
          "Y": 4
        }
      },
      {
        "id": "n15",
        "type": "math/remap",
        "x": 877,
        "y": 545,
        "values": {
          "S0": 0,
          "S1": 1,
          "T0": 90,
          "T1": 200
        }
      },
      {
        "id": "n16",
        "type": "vec/polar",
        "x": 1108,
        "y": 440,
        "values": {}
      },
      {
        "id": "n17",
        "type": "crv/interp",
        "x": 1417,
        "y": 523,
        "values": {
          "C": true
        }
      },
      {
        "id": "n18",
        "type": "params/swatch",
        "x": 1439,
        "y": -197,
        "values": {
          "hex": "#9b0000",
          "a": 1
        }
      },
      {
        "id": "n19",
        "type": "disp/hsl",
        "x": 1735,
        "y": -167,
        "values": {
          "A": 0.08
        }
      },
      {
        "id": "n20",
        "type": "disp/deconhsl",
        "x": 1633,
        "y": -124,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n21",
        "type": "params/swatch",
        "x": 1435,
        "y": -126,
        "values": {
          "hex": "#00ff00",
          "a": 1
        }
      },
      {
        "id": "n22",
        "type": "math/noise",
        "x": 685,
        "y": 923,
        "values": {
          "Y": 11
        }
      },
      {
        "id": "n23",
        "type": "math/remap",
        "x": 885,
        "y": 883,
        "values": {
          "S0": 0,
          "S1": 1,
          "T0": 90,
          "T1": 200
        }
      },
      {
        "id": "n24",
        "type": "vec/polar",
        "x": 1116,
        "y": 778,
        "values": {}
      },
      {
        "id": "n25",
        "type": "crv/interp",
        "x": 1425,
        "y": 861,
        "values": {
          "C": true
        }
      },
      {
        "id": "n26",
        "type": "params/swatch",
        "x": 1435,
        "y": -61,
        "values": {
          "hex": "#0000ff",
          "a": 1
        }
      }
    ],
    "wires": [
      {
        "id": "w1",
        "from": [
          "n1",
          "N"
        ],
        "to": [
          "n2",
          "C"
        ]
      },
      {
        "id": "w2",
        "from": [
          "n2",
          "S"
        ],
        "to": [
          "n3",
          "X"
        ]
      },
      {
        "id": "w3",
        "from": [
          "n1",
          "N"
        ],
        "to": [
          "n3",
          "Y"
        ]
      },
      {
        "id": "w4",
        "from": [
          "n2",
          "S"
        ],
        "to": [
          "n5",
          "X"
        ]
      },
      {
        "id": "w5",
        "from": [
          "n4",
          "T"
        ],
        "to": [
          "n5",
          "Y"
        ]
      },
      {
        "id": "w6",
        "from": [
          "n5",
          "R"
        ],
        "to": [
          "n6",
          "X"
        ]
      },
      {
        "id": "w8",
        "from": [
          "n3",
          "R"
        ],
        "to": [
          "n8",
          "A"
        ]
      },
      {
        "id": "w9",
        "from": [
          "n7",
          "R"
        ],
        "to": [
          "n8",
          "R"
        ]
      },
      {
        "id": "w10",
        "from": [
          "n8",
          "P"
        ],
        "to": [
          "n9",
          "V"
        ]
      },
      {
        "id": "w11",
        "from": [
          "n9",
          "C"
        ],
        "to": [
          "n10",
          "G"
        ]
      },
      {
        "id": "w17",
        "from": [
          "n6",
          "N"
        ],
        "to": [
          "n7",
          "V"
        ]
      },
      {
        "id": "w18",
        "from": [
          "n15",
          "R"
        ],
        "to": [
          "n16",
          "R"
        ]
      },
      {
        "id": "w19",
        "from": [
          "n16",
          "P"
        ],
        "to": [
          "n17",
          "V"
        ]
      },
      {
        "id": "w20",
        "from": [
          "n14",
          "N"
        ],
        "to": [
          "n15",
          "V"
        ]
      },
      {
        "id": "w21",
        "from": [
          "n5",
          "R"
        ],
        "to": [
          "n14",
          "X"
        ]
      },
      {
        "id": "w22",
        "from": [
          "n3",
          "R"
        ],
        "to": [
          "n16",
          "A"
        ]
      },
      {
        "id": "w23",
        "from": [
          "n17",
          "C"
        ],
        "to": [
          "n10",
          "G"
        ]
      },
      {
        "id": "w24",
        "from": [
          "n18",
          "C"
        ],
        "to": [
          "n20",
          "C"
        ]
      },
      {
        "id": "w25",
        "from": [
          "n20",
          "H"
        ],
        "to": [
          "n19",
          "H"
        ]
      },
      {
        "id": "w26",
        "from": [
          "n20",
          "S"
        ],
        "to": [
          "n19",
          "S"
        ]
      },
      {
        "id": "w27",
        "from": [
          "n20",
          "L"
        ],
        "to": [
          "n19",
          "L"
        ]
      },
      {
        "id": "w28",
        "from": [
          "n19",
          "C"
        ],
        "to": [
          "n10",
          "F"
        ]
      },
      {
        "id": "w29",
        "from": [
          "n18",
          "C"
        ],
        "to": [
          "n10",
          "S"
        ]
      },
      {
        "id": "w30",
        "from": [
          "n21",
          "C"
        ],
        "to": [
          "n20",
          "C"
        ]
      },
      {
        "id": "w31",
        "from": [
          "n21",
          "C"
        ],
        "to": [
          "n10",
          "S"
        ]
      },
      {
        "id": "w32",
        "from": [
          "n23",
          "R"
        ],
        "to": [
          "n24",
          "R"
        ]
      },
      {
        "id": "w33",
        "from": [
          "n24",
          "P"
        ],
        "to": [
          "n25",
          "V"
        ]
      },
      {
        "id": "w34",
        "from": [
          "n22",
          "N"
        ],
        "to": [
          "n23",
          "V"
        ]
      },
      {
        "id": "w35",
        "from": [
          "n5",
          "R"
        ],
        "to": [
          "n22",
          "X"
        ]
      },
      {
        "id": "w36",
        "from": [
          "n3",
          "R"
        ],
        "to": [
          "n24",
          "A"
        ]
      },
      {
        "id": "w37",
        "from": [
          "n25",
          "C"
        ],
        "to": [
          "n10",
          "G"
        ]
      },
      {
        "id": "w38",
        "from": [
          "n26",
          "C"
        ],
        "to": [
          "n20",
          "C"
        ]
      },
      {
        "id": "w39",
        "from": [
          "n26",
          "C"
        ],
        "to": [
          "n10",
          "S"
        ]
      }
    ]
  },
  'Iso-field': {
    "format": 2,
    "nodes": [
      {
        "id": "n10",
        "type": "params/slider",
        "x": 312,
        "y": 858,
        "values": {
          "min": 0,
          "max": 250,
          "value": 24,
          "mode": "int"
        }
      },
      {
        "id": "n13",
        "type": "crv/circle",
        "x": 1349,
        "y": 1203,
        "values": {}
      },
      {
        "id": "n14",
        "type": "disp/draw",
        "x": 2109,
        "y": 1013,
        "values": {
          "F": {
            "r": 255,
            "g": 255,
            "b": 255,
            "a": 1
          }
        }
      },
      {
        "id": "n21",
        "type": "xf/kaleido",
        "x": 1680,
        "y": 1055,
        "values": {
          "M": false,
          "N": 6
        }
      },
      {
        "id": "n22",
        "type": "math/add",
        "x": 978,
        "y": 845,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n24",
        "type": "vec/construct",
        "x": 1121,
        "y": 907,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n25",
        "type": "vec/deconstruct",
        "x": 844,
        "y": 865,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n27",
        "type": "math/add",
        "x": 916,
        "y": 1441,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n28",
        "type": "vec/construct",
        "x": 1009,
        "y": 1371,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n29",
        "type": "vec/deconstruct",
        "x": 782,
        "y": 1371,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n30",
        "type": "crv/line",
        "x": 1301,
        "y": 1327,
        "values": {}
      },
      {
        "id": "n31",
        "type": "params/point",
        "x": 1136,
        "y": 674,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n35",
        "type": "math/mul",
        "x": 832,
        "y": 976,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n37",
        "type": "math/mul",
        "x": 926,
        "y": 1013,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n38",
        "type": "math/mul",
        "x": 918,
        "y": 1162,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n39",
        "type": "params/slider",
        "x": 385,
        "y": 1177,
        "values": {
          "min": 0,
          "max": 10,
          "value": 1.732,
          "mode": "float",
          "prec": 3
        }
      },
      {
        "id": "n40",
        "type": "math/mul",
        "x": 815,
        "y": 1184,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n41",
        "type": "math/mul",
        "x": 746,
        "y": 1128,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n45",
        "type": "params/slider",
        "x": 1085,
        "y": 772,
        "values": {
          "min": 0,
          "max": 10,
          "value": 4,
          "mode": "int"
        }
      },
      {
        "id": "n46",
        "type": "xf/kaleido",
        "x": 1882,
        "y": 1364,
        "values": {
          "M": true,
          "N": 12
        }
      },
      {
        "id": "n47",
        "type": "disp/hsl",
        "x": 1832,
        "y": 546,
        "values": {
          "S": 0.35,
          "L": 0.74
        }
      },
      {
        "id": "n48",
        "type": "params/slider",
        "x": 1396,
        "y": 571,
        "values": {
          "min": 0,
          "max": 256,
          "value": 139,
          "mode": "int"
        }
      },
      {
        "id": "n49",
        "type": "math/div",
        "x": 1636,
        "y": 474,
        "values": {
          "B": 256
        }
      },
      {
        "id": "n50",
        "type": "params/slider",
        "x": 1399,
        "y": 683,
        "values": {
          "min": 0,
          "max": 1,
          "value": 0.1,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n51",
        "type": "disp/hsl",
        "x": 1796,
        "y": 776,
        "values": {
          "S": 0.35,
          "L": 0.74
        }
      },
      {
        "id": "n52",
        "type": "params/slider",
        "x": 1399,
        "y": 806,
        "values": {
          "min": 0,
          "max": 1,
          "value": 1,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n58",
        "type": "vec/construct",
        "x": 1096,
        "y": 477,
        "values": {}
      },
      {
        "id": "n66",
        "type": "input/mouse",
        "x": 231,
        "y": 961,
        "values": {}
      },
      {
        "id": "n67",
        "type": "state/smooth",
        "x": 619,
        "y": 578,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n68",
        "type": "params/slider",
        "x": 290,
        "y": 544,
        "values": {
          "min": 0,
          "max": 10,
          "value": 0.5,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n69",
        "type": "state/smooth",
        "x": 623,
        "y": 662,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n73",
        "type": "math/clamp",
        "x": 839,
        "y": 426,
        "values": {}
      },
      {
        "id": "n75",
        "type": "params/slider",
        "x": 351,
        "y": 423,
        "values": {
          "min": 0,
          "max": 1000,
          "value": 290,
          "mode": "int"
        }
      },
      {
        "id": "n76",
        "type": "math/clamp",
        "x": 845,
        "y": 586,
        "values": {}
      },
      {
        "id": "n77",
        "type": "vec/distance",
        "x": 533,
        "y": 995,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n78",
        "type": "vec/construct",
        "x": 448,
        "y": 989,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n81",
        "type": "params/slider",
        "x": 98,
        "y": 690,
        "values": {
          "min": 0,
          "max": 1000,
          "value": 312,
          "mode": "int"
        }
      },
      {
        "id": "n82",
        "type": "math/mul",
        "x": 643,
        "y": 1205,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n83",
        "type": "math/remap",
        "x": 394,
        "y": 1272,
        "values": {
          "T1": 1.5,
          "T0": 0.6
        }
      },
      {
        "id": "n84",
        "type": "params/slider",
        "x": 239,
        "y": 1591,
        "values": {
          "min": 0,
          "max": 10,
          "value": 1,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n85",
        "type": "state/smooth",
        "x": 600,
        "y": 1481,
        "values": {}
      },
      {
        "id": "n87",
        "type": "math/abs",
        "x": 389,
        "y": 677,
        "values": {}
      },
      {
        "id": "n88",
        "type": "math/abs",
        "x": 437,
        "y": 745,
        "values": {}
      },
      {
        "id": "n89",
        "type": "params/slider",
        "x": 348,
        "y": 475,
        "values": {
          "min": 0,
          "max": 1000,
          "value": 67,
          "mode": "int"
        }
      },
      {
        "id": "n91",
        "type": "math/neg",
        "x": 1035,
        "y": 644,
        "values": {},
        "collapsed": true
      }
    ],
    "wires": [
      {
        "id": "w25",
        "from": [
          "n13",
          "C"
        ],
        "to": [
          "n21",
          "G"
        ]
      },
      {
        "id": "w35",
        "from": [
          "n24",
          "P"
        ],
        "to": [
          "n13",
          "P"
        ]
      },
      {
        "id": "w36",
        "from": [
          "n25",
          "X"
        ],
        "to": [
          "n22",
          "A"
        ]
      },
      {
        "id": "w37",
        "from": [
          "n22",
          "R"
        ],
        "to": [
          "n24",
          "X"
        ]
      },
      {
        "id": "w38",
        "from": [
          "n25",
          "Y"
        ],
        "to": [
          "n24",
          "Y"
        ]
      },
      {
        "id": "w44",
        "from": [
          "n27",
          "R"
        ],
        "to": [
          "n28",
          "Y"
        ]
      },
      {
        "id": "w45",
        "from": [
          "n29",
          "X"
        ],
        "to": [
          "n28",
          "X"
        ]
      },
      {
        "id": "w46",
        "from": [
          "n29",
          "Y"
        ],
        "to": [
          "n27",
          "A"
        ]
      },
      {
        "id": "w47",
        "from": [
          "n28",
          "P"
        ],
        "to": [
          "n13",
          "P"
        ]
      },
      {
        "id": "w49",
        "from": [
          "n28",
          "P"
        ],
        "to": [
          "n30",
          "B"
        ]
      },
      {
        "id": "w50",
        "from": [
          "n24",
          "P"
        ],
        "to": [
          "n30",
          "B"
        ]
      },
      {
        "id": "w51",
        "from": [
          "n30",
          "C"
        ],
        "to": [
          "n21",
          "G"
        ]
      },
      {
        "id": "w53",
        "from": [
          "n31",
          "P"
        ],
        "to": [
          "n21",
          "C"
        ]
      },
      {
        "id": "w54",
        "from": [
          "n31",
          "P"
        ],
        "to": [
          "n30",
          "A"
        ]
      },
      {
        "id": "w55",
        "from": [
          "n31",
          "P"
        ],
        "to": [
          "n29",
          "P"
        ]
      },
      {
        "id": "w56",
        "from": [
          "n31",
          "P"
        ],
        "to": [
          "n25",
          "P"
        ]
      },
      {
        "id": "w60",
        "from": [
          "n10",
          "N"
        ],
        "to": [
          "n35",
          "A"
        ]
      },
      {
        "id": "w62",
        "from": [
          "n10",
          "N"
        ],
        "to": [
          "n22",
          "B"
        ]
      },
      {
        "id": "w63",
        "from": [
          "n35",
          "R"
        ],
        "to": [
          "n22",
          "B"
        ]
      },
      {
        "id": "w66",
        "from": [
          "n35",
          "R"
        ],
        "to": [
          "n37",
          "A"
        ]
      },
      {
        "id": "w67",
        "from": [
          "n37",
          "R"
        ],
        "to": [
          "n22",
          "B"
        ]
      },
      {
        "id": "w75",
        "from": [
          "n10",
          "N"
        ],
        "to": [
          "n40",
          "A"
        ]
      },
      {
        "id": "w77",
        "from": [
          "n40",
          "R"
        ],
        "to": [
          "n27",
          "B"
        ]
      },
      {
        "id": "w78",
        "from": [
          "n38",
          "R"
        ],
        "to": [
          "n27",
          "B"
        ]
      },
      {
        "id": "w79",
        "from": [
          "n40",
          "R"
        ],
        "to": [
          "n38",
          "A"
        ]
      },
      {
        "id": "w82",
        "from": [
          "n41",
          "R"
        ],
        "to": [
          "n38",
          "B"
        ]
      },
      {
        "id": "w83",
        "from": [
          "n41",
          "R"
        ],
        "to": [
          "n37",
          "B"
        ]
      },
      {
        "id": "w84",
        "from": [
          "n41",
          "R"
        ],
        "to": [
          "n35",
          "B"
        ]
      },
      {
        "id": "w93",
        "from": [
          "n21",
          "G"
        ],
        "to": [
          "n46",
          "G"
        ]
      },
      {
        "id": "w94",
        "from": [
          "n46",
          "G"
        ],
        "to": [
          "n14",
          "G"
        ]
      },
      {
        "id": "w97",
        "from": [
          "n47",
          "C"
        ],
        "to": [
          "n14",
          "S"
        ]
      },
      {
        "id": "w98",
        "from": [
          "n48",
          "N"
        ],
        "to": [
          "n49",
          "A"
        ]
      },
      {
        "id": "w99",
        "from": [
          "n49",
          "R"
        ],
        "to": [
          "n47",
          "H"
        ]
      },
      {
        "id": "w101",
        "from": [
          "n49",
          "R"
        ],
        "to": [
          "n51",
          "H"
        ]
      },
      {
        "id": "w102",
        "from": [
          "n50",
          "N"
        ],
        "to": [
          "n47",
          "A"
        ]
      },
      {
        "id": "w103",
        "from": [
          "n52",
          "N"
        ],
        "to": [
          "n51",
          "A"
        ]
      },
      {
        "id": "w104",
        "from": [
          "n51",
          "C"
        ],
        "to": [
          "n14",
          "F"
        ]
      },
      {
        "id": "w122",
        "from": [
          "n45",
          "N"
        ],
        "to": [
          "n13",
          "R"
        ]
      },
      {
        "id": "w133",
        "from": [
          "n68",
          "N"
        ],
        "to": [
          "n67",
          "S"
        ]
      },
      {
        "id": "w137",
        "from": [
          "n58",
          "P"
        ],
        "to": [
          "n31",
          "P"
        ]
      },
      {
        "id": "w139",
        "from": [
          "n68",
          "N"
        ],
        "to": [
          "n69",
          "S"
        ]
      },
      {
        "id": "w148",
        "from": [
          "n75",
          "N"
        ],
        "to": [
          "n73",
          "B"
        ]
      },
      {
        "id": "w151",
        "from": [
          "n75",
          "N"
        ],
        "to": [
          "n76",
          "B"
        ]
      },
      {
        "id": "w152",
        "from": [
          "n67",
          "R"
        ],
        "to": [
          "n73",
          "V"
        ]
      },
      {
        "id": "w153",
        "from": [
          "n69",
          "R"
        ],
        "to": [
          "n76",
          "V"
        ]
      },
      {
        "id": "w155",
        "from": [
          "n73",
          "R"
        ],
        "to": [
          "n58",
          "X"
        ]
      },
      {
        "id": "w158",
        "from": [
          "n66",
          "X"
        ],
        "to": [
          "n78",
          "X"
        ]
      },
      {
        "id": "w159",
        "from": [
          "n66",
          "Y"
        ],
        "to": [
          "n78",
          "Y"
        ]
      },
      {
        "id": "w160",
        "from": [
          "n78",
          "P"
        ],
        "to": [
          "n77",
          "A"
        ]
      },
      {
        "id": "w166",
        "from": [
          "n81",
          "N"
        ],
        "to": [
          "n83",
          "S1"
        ]
      },
      {
        "id": "w167",
        "from": [
          "n77",
          "D"
        ],
        "to": [
          "n83",
          "V"
        ]
      },
      {
        "id": "w168",
        "from": [
          "n39",
          "N"
        ],
        "to": [
          "n82",
          "A"
        ]
      },
      {
        "id": "w170",
        "from": [
          "n82",
          "R"
        ],
        "to": [
          "n41",
          "A"
        ]
      },
      {
        "id": "w171",
        "from": [
          "n82",
          "R"
        ],
        "to": [
          "n41",
          "B"
        ]
      },
      {
        "id": "w172",
        "from": [
          "n82",
          "R"
        ],
        "to": [
          "n40",
          "B"
        ]
      },
      {
        "id": "w173",
        "from": [
          "n84",
          "N"
        ],
        "to": [
          "n85",
          "S"
        ]
      },
      {
        "id": "w175",
        "from": [
          "n83",
          "R"
        ],
        "to": [
          "n85",
          "V"
        ]
      },
      {
        "id": "w176",
        "from": [
          "n85",
          "R"
        ],
        "to": [
          "n82",
          "B"
        ]
      },
      {
        "id": "w178",
        "from": [
          "n66",
          "X"
        ],
        "to": [
          "n87",
          "V"
        ]
      },
      {
        "id": "w179",
        "from": [
          "n87",
          "R"
        ],
        "to": [
          "n67",
          "V"
        ]
      },
      {
        "id": "w181",
        "from": [
          "n88",
          "R"
        ],
        "to": [
          "n69",
          "V"
        ]
      },
      {
        "id": "w182",
        "from": [
          "n66",
          "Y"
        ],
        "to": [
          "n88",
          "V"
        ]
      },
      {
        "id": "w183",
        "from": [
          "n89",
          "N"
        ],
        "to": [
          "n73",
          "A"
        ]
      },
      {
        "id": "w184",
        "from": [
          "n89",
          "N"
        ],
        "to": [
          "n76",
          "A"
        ]
      },
      {
        "id": "w189",
        "from": [
          "n76",
          "R"
        ],
        "to": [
          "n91",
          "V"
        ]
      },
      {
        "id": "w190",
        "from": [
          "n91",
          "R"
        ],
        "to": [
          "n58",
          "Y"
        ]
      }
    ]
  },
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

  /* The theremin grown into an instrument you can see: every note of A
   * pentatonic drawn as a labelled rung (Series → Scale → Set Union dedupes
   * the snapped notes), a marker riding the rung you're playing, and three
   * REAL <button> drones (one Element node, list-matched ×3) latching
   * A2 / E3 / A3 under everything. Buttons on the interface itself.
   * One Key node feeds root+scale to both pentatonic Scale nodes — change
   * the key in ONE place and the board and the theremin follow (the drone
   * snapper stays chromatic on purpose: drones land on exact notes). */
  'Scale board': {
    "format": 2,
    "nodes": [
      {
        "id": "s1",
        "type": "sets/series",
        "x": 30,
        "y": 40,
        "values": {
          "S": 57,
          "N": 1,
          "C": 25
        }
      },
      {
        "id": "s2",
        "type": "audio/scale",
        "x": 250,
        "y": 39,
        "values": {
          "root": 9,
          "scale": "pentatonic"
        }
      },
      {
        "id": "s3",
        "type": "sets/union",
        "x": 470,
        "y": 40,
        "values": {}
      },
      {
        "id": "s4",
        "type": "math/remap",
        "x": 690,
        "y": 40,
        "values": {
          "S0": 57,
          "S1": 81,
          "T0": 150,
          "T1": -190
        }
      },
      {
        "id": "s5",
        "type": "vec/construct",
        "x": 910,
        "y": 40,
        "values": {
          "X": -200
        }
      },
      {
        "id": "s6",
        "type": "vec/construct",
        "x": 910,
        "y": 190,
        "values": {
          "X": 0
        }
      },
      {
        "id": "s7",
        "type": "crv/rect",
        "x": 1130,
        "y": 190,
        "values": {
          "W": 330,
          "H": 1
        }
      },
      {
        "id": "s8",
        "type": "disp/draw",
        "x": 1350,
        "y": 190,
        "values": {
          "S": {
            "r": 142,
            "g": 164,
            "b": 195,
            "a": 0.25
          },
          "W": 1
        }
      },
      {
        "id": "s9",
        "type": "math/mod",
        "x": 690,
        "y": 340,
        "values": {
          "B": 12
        }
      },
      {
        "id": "s10",
        "type": "params/textlist",
        "x": 690,
        "y": 480,
        "values": {
          "text": "C\nC#\nD\nD#\nE\nF\nF#\nG\nG#\nA\nA#\nB"
        }
      },
      {
        "id": "s11",
        "type": "sets/item",
        "x": 910,
        "y": 360,
        "values": {}
      },
      {
        "id": "s12",
        "type": "disp/text",
        "x": 1130,
        "y": 340,
        "values": {
          "S": 12
        }
      },
      {
        "id": "s13",
        "type": "disp/draw",
        "x": 1350,
        "y": 340,
        "values": {
          "S": {
            "r": 230,
            "g": 237,
            "b": 250,
            "a": 0.65
          }
        }
      },
      {
        "id": "v1",
        "type": "input/mouse",
        "x": -53,
        "y": 590,
        "values": {}
      },
      {
        "id": "v2",
        "type": "math/remap",
        "x": 250,
        "y": 620,
        "values": {
          "S0": 0,
          "S1": 1,
          "T0": 81,
          "T1": 57
        }
      },
      {
        "id": "v3",
        "type": "audio/scale",
        "x": 471,
        "y": 619,
        "values": {
          "root": 9,
          "scale": "pentatonic"
        }
      },
      {
        "id": "v4",
        "type": "audio/osc",
        "x": 690,
        "y": 620,
        "values": {
          "wave": "sine"
        }
      },
      {
        "id": "v5",
        "type": "audio/gain",
        "x": 910,
        "y": 620,
        "values": {
          "G": 0.14
        }
      },
      {
        "id": "v6",
        "type": "audio/out",
        "x": 1570,
        "y": 620,
        "values": {}
      },
      {
        "id": "v7",
        "type": "math/remap",
        "x": 690,
        "y": 770,
        "values": {
          "S0": 57,
          "S1": 81,
          "T0": 150,
          "T1": -190
        }
      },
      {
        "id": "v8",
        "type": "vec/construct",
        "x": 910,
        "y": 770,
        "values": {
          "X": 160
        }
      },
      {
        "id": "v9",
        "type": "crv/circle",
        "x": 1130,
        "y": 770,
        "values": {
          "R": 7
        }
      },
      {
        "id": "v10",
        "type": "disp/draw",
        "x": 1350,
        "y": 770,
        "values": {
          "S": {
            "r": 94,
            "g": 234,
            "b": 212,
            "a": 0.9
          },
          "F": {
            "r": 177,
            "g": 27,
            "b": 165,
            "a": 0.5
          },
          "W": 1.5
        }
      },
      {
        "id": "d1",
        "type": "params/number",
        "x": 30,
        "y": 950,
        "values": {
          "N": 45
        }
      },
      {
        "id": "d2",
        "type": "params/number",
        "x": 30,
        "y": 1040,
        "values": {
          "N": 52
        }
      },
      {
        "id": "d3",
        "type": "params/number",
        "x": 30,
        "y": 1130,
        "values": {
          "N": 57
        }
      },
      {
        "id": "d4",
        "type": "audio/scale",
        "x": 249,
        "y": 990,
        "values": {
          "root": 0,
          "scale": "chromatic"
        }
      },
      {
        "id": "d5",
        "type": "audio/osc",
        "x": 470,
        "y": 990,
        "values": {
          "wave": "sine"
        }
      },
      {
        "id": "d6",
        "type": "sets/series",
        "x": 30,
        "y": 1280,
        "values": {
          "S": 0,
          "N": 1,
          "C": 3
        }
      },
      {
        "id": "d7",
        "type": "math/remap",
        "x": 250,
        "y": 1280,
        "values": {
          "S0": 0,
          "S1": 2,
          "T0": -120,
          "T1": 120
        }
      },
      {
        "id": "d8",
        "type": "vec/construct",
        "x": 470,
        "y": 1280,
        "values": {
          "Y": 220
        }
      },
      {
        "id": "d9",
        "type": "crv/rect",
        "x": 690,
        "y": 1280,
        "values": {
          "W": 104,
          "H": 32
        }
      },
      {
        "id": "d10",
        "type": "params/textlist",
        "x": 663,
        "y": 1488,
        "values": {
          "text": "drone A2\ndrone E3\ndrone A3"
        }
      },
      {
        "id": "d11",
        "type": "disp/element",
        "x": 910,
        "y": 1280,
        "values": {
          "T": "button"
        }
      },
      {
        "id": "d12",
        "type": "state/latch",
        "x": 1130,
        "y": 1280,
        "values": {}
      },
      {
        "id": "d13",
        "type": "sets/select",
        "x": 1350,
        "y": 1280,
        "values": {
          "T": 0.12,
          "F": 0
        }
      },
      {
        "id": "d14",
        "type": "audio/gain",
        "x": 1350,
        "y": 1080,
        "values": {}
      },
      {
        "id": "b1",
        "type": "disp/bg",
        "x": 1570,
        "y": 770,
        "values": {}
      },
      {
        "id": "n1",
        "type": "params/timegraph",
        "x": 1142,
        "y": -80,
        "values": {}
      },
      {
        "id": "n3",
        "type": "params/slider",
        "x": -83,
        "y": 282,
        "values": {
          "min": 0,
          "max": 400,
          "value": 158,
          "mode": "int"
        }
      },
      {
        "id": "n4",
        "type": "params/slider",
        "x": -85,
        "y": 223,
        "values": {
          "min": -400,
          "max": 0,
          "value": -340,
          "mode": "int"
        }
      },
      {
        "id": "n10",
        "type": "vec/construct",
        "x": 456,
        "y": 242,
        "values": {
          "X": 160
        }
      },
      {
        "id": "n11",
        "type": "math/clamp",
        "x": 243,
        "y": 239,
        "values": {}
      },
      {
        "id": "n13",
        "type": "disp/trace",
        "x": 850,
        "y": -214,
        "values": {
          "L": 500
        }
      },
      {
        "id": "n15",
        "type": "math/sub",
        "x": 415,
        "y": -160,
        "values": {}
      },
      {
        "id": "n16",
        "type": "math/neg",
        "x": 608,
        "y": -59,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n17",
        "type": "params/swatch",
        "x": 810,
        "y": -411,
        "values": {
          "hex": "#ba26c5",
          "a": 1
        }
      },
      {
        "id": "n18",
        "type": "params/swatch",
        "x": 772,
        "y": -340,
        "values": {
          "hex": "#2c41dd",
          "a": 1
        }
      },
      {
        "id": "n19",
        "type": "params/slider",
        "x": 210,
        "y": -339,
        "values": {
          "min": 0,
          "max": 400,
          "value": 165,
          "mode": "int"
        }
      },
      {
        "id": "n20",
        "type": "vec/construct",
        "x": 578,
        "y": -307,
        "values": {
          "X": 160
        }
      },
      {
        "id": "n21",
        "type": "params/slider",
        "x": 258,
        "y": -424,
        "values": {
          "min": 0,
          "max": 400,
          "value": 160,
          "mode": "int"
        }
      },
      {
        "id": "n22",
        "type": "crv/circle",
        "x": 1409,
        "y": -35,
        "values": {
          "R": 4
        }
      },
      {
        "id": "n23",
        "type": "disp/draw",
        "x": 1631,
        "y": -7,
        "values": {
          "S": {
            "r": 94,
            "g": 234,
            "b": 212,
            "a": 0.9
          },
          "F": {
            "r": 177,
            "g": 27,
            "b": 165,
            "a": 0.5
          },
          "W": 1.5
        }
      }
    ],
    "wires": [
      {
        "id": "w1",
        "from": [
          "s1",
          "S"
        ],
        "to": [
          "s2",
          "V"
        ]
      },
      {
        "id": "w2",
        "from": [
          "s2",
          "M"
        ],
        "to": [
          "s3",
          "A"
        ]
      },
      {
        "id": "w3",
        "from": [
          "s2",
          "M"
        ],
        "to": [
          "s3",
          "B"
        ]
      },
      {
        "id": "w4",
        "from": [
          "s3",
          "U"
        ],
        "to": [
          "s4",
          "V"
        ]
      },
      {
        "id": "w5",
        "from": [
          "s4",
          "R"
        ],
        "to": [
          "s5",
          "Y"
        ]
      },
      {
        "id": "w6",
        "from": [
          "s4",
          "R"
        ],
        "to": [
          "s6",
          "Y"
        ]
      },
      {
        "id": "w7",
        "from": [
          "s6",
          "P"
        ],
        "to": [
          "s7",
          "P"
        ]
      },
      {
        "id": "w8",
        "from": [
          "s7",
          "C"
        ],
        "to": [
          "s8",
          "G"
        ]
      },
      {
        "id": "w9",
        "from": [
          "s3",
          "U"
        ],
        "to": [
          "s9",
          "A"
        ]
      },
      {
        "id": "w10",
        "from": [
          "s10",
          "L"
        ],
        "to": [
          "s11",
          "L"
        ]
      },
      {
        "id": "w11",
        "from": [
          "s9",
          "R"
        ],
        "to": [
          "s11",
          "i"
        ]
      },
      {
        "id": "w12",
        "from": [
          "s11",
          "E"
        ],
        "to": [
          "s12",
          "T"
        ]
      },
      {
        "id": "w13",
        "from": [
          "s5",
          "P"
        ],
        "to": [
          "s12",
          "P"
        ]
      },
      {
        "id": "w14",
        "from": [
          "s12",
          "G"
        ],
        "to": [
          "s13",
          "G"
        ]
      },
      {
        "id": "w16",
        "from": [
          "v2",
          "R"
        ],
        "to": [
          "v3",
          "V"
        ]
      },
      {
        "id": "w17",
        "from": [
          "v3",
          "F"
        ],
        "to": [
          "v4",
          "F"
        ]
      },
      {
        "id": "w18",
        "from": [
          "v4",
          "A"
        ],
        "to": [
          "v5",
          "In"
        ]
      },
      {
        "id": "w19",
        "from": [
          "v5",
          "A"
        ],
        "to": [
          "v6",
          "In"
        ]
      },
      {
        "id": "w20",
        "from": [
          "v3",
          "M"
        ],
        "to": [
          "v7",
          "V"
        ]
      },
      {
        "id": "w21",
        "from": [
          "v7",
          "R"
        ],
        "to": [
          "v8",
          "Y"
        ]
      },
      {
        "id": "w22",
        "from": [
          "v8",
          "P"
        ],
        "to": [
          "v9",
          "P"
        ]
      },
      {
        "id": "w23",
        "from": [
          "v9",
          "C"
        ],
        "to": [
          "v10",
          "G"
        ]
      },
      {
        "id": "w24",
        "from": [
          "d1",
          "N"
        ],
        "to": [
          "d4",
          "V"
        ]
      },
      {
        "id": "w25",
        "from": [
          "d2",
          "N"
        ],
        "to": [
          "d4",
          "V"
        ]
      },
      {
        "id": "w26",
        "from": [
          "d3",
          "N"
        ],
        "to": [
          "d4",
          "V"
        ]
      },
      {
        "id": "w27",
        "from": [
          "d4",
          "F"
        ],
        "to": [
          "d5",
          "F"
        ]
      },
      {
        "id": "w28",
        "from": [
          "d6",
          "S"
        ],
        "to": [
          "d7",
          "V"
        ]
      },
      {
        "id": "w29",
        "from": [
          "d7",
          "R"
        ],
        "to": [
          "d8",
          "X"
        ]
      },
      {
        "id": "w30",
        "from": [
          "d8",
          "P"
        ],
        "to": [
          "d9",
          "P"
        ]
      },
      {
        "id": "w31",
        "from": [
          "d9",
          "C"
        ],
        "to": [
          "d11",
          "G"
        ]
      },
      {
        "id": "w32",
        "from": [
          "d10",
          "L"
        ],
        "to": [
          "d11",
          "C"
        ]
      },
      {
        "id": "w33",
        "from": [
          "d11",
          "K"
        ],
        "to": [
          "d12",
          "T"
        ]
      },
      {
        "id": "w34",
        "from": [
          "d12",
          "B"
        ],
        "to": [
          "d13",
          "P"
        ]
      },
      {
        "id": "w35",
        "from": [
          "d5",
          "A"
        ],
        "to": [
          "d14",
          "In"
        ]
      },
      {
        "id": "w36",
        "from": [
          "d13",
          "L"
        ],
        "to": [
          "d14",
          "G"
        ]
      },
      {
        "id": "w37",
        "from": [
          "d14",
          "A"
        ],
        "to": [
          "v6",
          "In"
        ]
      },
      {
        "id": "w38",
        "from": [
          "s4",
          "R"
        ],
        "to": [
          "n1",
          "V"
        ]
      },
      {
        "id": "w39",
        "from": [
          "n4",
          "N"
        ],
        "to": [
          "s4",
          "T1"
        ]
      },
      {
        "id": "w40",
        "from": [
          "n3",
          "N"
        ],
        "to": [
          "s4",
          "T0"
        ]
      },
      {
        "id": "w53",
        "from": [
          "n4",
          "N"
        ],
        "to": [
          "n11",
          "A"
        ]
      },
      {
        "id": "w54",
        "from": [
          "n3",
          "N"
        ],
        "to": [
          "n11",
          "B"
        ]
      },
      {
        "id": "w55",
        "from": [
          "v1",
          "Y"
        ],
        "to": [
          "n11",
          "V"
        ]
      },
      {
        "id": "w56",
        "from": [
          "n11",
          "R"
        ],
        "to": [
          "n10",
          "Y"
        ]
      },
      {
        "id": "w57",
        "from": [
          "n4",
          "N"
        ],
        "to": [
          "v2",
          "S0"
        ]
      },
      {
        "id": "w58",
        "from": [
          "n11",
          "R"
        ],
        "to": [
          "v2",
          "V"
        ]
      },
      {
        "id": "w59",
        "from": [
          "n3",
          "N"
        ],
        "to": [
          "v2",
          "S1"
        ]
      },
      {
        "id": "w60",
        "from": [
          "n4",
          "N"
        ],
        "to": [
          "v7",
          "T1"
        ]
      },
      {
        "id": "w61",
        "from": [
          "n3",
          "N"
        ],
        "to": [
          "v7",
          "T0"
        ]
      },
      {
        "id": "w66",
        "from": [
          "n11",
          "R"
        ],
        "to": [
          "n15",
          "A"
        ]
      },
      {
        "id": "w67",
        "from": [
          "n3",
          "N"
        ],
        "to": [
          "n15",
          "B"
        ]
      },
      {
        "id": "w69",
        "from": [
          "n15",
          "R"
        ],
        "to": [
          "n16",
          "V"
        ]
      },
      {
        "id": "w70",
        "from": [
          "n16",
          "R"
        ],
        "to": [
          "n13",
          "V"
        ]
      },
      {
        "id": "w72",
        "from": [
          "v7",
          "R"
        ],
        "to": [
          "n15",
          "A"
        ]
      },
      {
        "id": "w73",
        "from": [
          "n18",
          "C"
        ],
        "to": [
          "n13",
          "C"
        ]
      },
      {
        "id": "w74",
        "from": [
          "n17",
          "C"
        ],
        "to": [
          "n13",
          "C"
        ]
      },
      {
        "id": "w75",
        "from": [
          "n19",
          "N"
        ],
        "to": [
          "n10",
          "X"
        ]
      },
      {
        "id": "w78",
        "from": [
          "n19",
          "N"
        ],
        "to": [
          "n20",
          "X"
        ]
      },
      {
        "id": "w80",
        "from": [
          "n20",
          "P"
        ],
        "to": [
          "n13",
          "P"
        ]
      },
      {
        "id": "w83",
        "from": [
          "n19",
          "N"
        ],
        "to": [
          "v8",
          "X"
        ]
      },
      {
        "id": "w84",
        "from": [
          "n21",
          "N"
        ],
        "to": [
          "n20",
          "Y"
        ]
      },
      {
        "id": "w85",
        "from": [
          "n17",
          "C"
        ],
        "to": [
          "v10",
          "S"
        ]
      },
      {
        "id": "w86",
        "from": [
          "n22",
          "C"
        ],
        "to": [
          "n23",
          "G"
        ]
      },
      {
        "id": "w89",
        "from": [
          "n10",
          "P"
        ],
        "to": [
          "n22",
          "P"
        ]
      },
      {
        "id": "w90",
        "from": [
          "n18",
          "C"
        ],
        "to": [
          "n23",
          "S"
        ]
      }
    ]
  },
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

  /* A loop pedal: space toggles recording, and the mic pours into a Delay
   * whose feedback is 1 — whatever enters the loop circles forever, and each
   * new recording pass overdubs on top of what's already going round. C
   * clears the loop (the Delay's clear trigger swaps in a fresh silent
   * buffer). The slider is the loop length (drag it live and the loop glides
   * tape-style — but clear first if you want a clean start). While recording,
   * a red dot pulses 8 times per loop interval: one Expression node,
   * sin(2π·T·8/len), into the alpha of an HSL red. The Scope shows the loop;
   * wear headphones or the speakers will overdub themselves acoustically. */
  'Loop pedal': _EX([
    ['l1', 'input/keyboard', 30, 40],
    ['l2', 'state/latch', 250, 40],
    ['l3', 'sets/select', 470, 40, { T: 1, F: 0 }],
    ['l14', 'input/keyboard', 30, 460, { K: 'c' }],
    ['l4', 'audio/mic', 250, 260],
    ['l5', 'audio/gain', 690, 260],
    ['l6', 'params/slider', 470, 460, { min: 0.5, max: 8, value: 2, label: 'loop seconds' }],
    ['l7', 'audio/delay', 910, 260, { F: 1, M: 1 }],
    ['l8', 'audio/out', 1350, 260],
    ['l9', 'audio/scope', 1130, 40, { W: 460, H: 140, T: 60, P: { x: 0, y: -130 } }],
    ['l10', 'sets/select', 470, 600, { T: 'recording', F: 'space = record · c = clear' }],
    ['l11', 'disp/text', 690, 600, { S: 16, P: { x: 12, y: 150 } }],
    ['l12', 'disp/draw', 910, 600, { S: { r: 230, g: 237, b: 250, a: 0.8 } }],
    ['l15', 'math/expr', 250, 780, { expr: '0.5 + 0.5*sin(6.2832*T*8/X)' }],
    ['l16', 'sets/select', 470, 780, { F: 0.12 }],
    ['l17', 'disp/hsl', 690, 780, { H: 0, S: 0.85, L: 0.55 }],
    ['l18', 'crv/circle', 690, 940, { R: 8, P: { x: -96, y: 156 } }],
    ['l19', 'disp/draw', 910, 780, { W: 1.5 }],
    ['l13', 'disp/bg', 1350, 600]
  ], [
    ['l1', 'P', 'l2', 'T'],
    ['l2', 'B', 'l3', 'P'],
    ['l4', 'A', 'l5', 'In'],
    ['l3', 'L', 'l5', 'G'],
    ['l5', 'A', 'l7', 'In'],
    ['l6', 'N', 'l7', 'T'],
    ['l14', 'P', 'l7', 'C'],
    ['l7', 'A', 'l8', 'In'],
    ['l7', 'A', 'l9', 'In'],
    ['l2', 'B', 'l10', 'P'],
    ['l10', 'L', 'l11', 'T'],
    ['l11', 'G', 'l12', 'G'],
    ['l6', 'N', 'l15', 'X'],
    ['l15', 'R', 'l16', 'T'],
    ['l2', 'B', 'l16', 'P'],
    ['l16', 'L', 'l17', 'A'],
    ['l18', 'C', 'l19', 'G'],
    ['l17', 'C', 'l19', 'S'],
    ['l17', 'C', 'l19', 'F']
  ]),

  /* A real oscilloscope AND a vectorscope. Top: the Scope node taps the
   * audio wire and draws the actual samples, trigger-locked — a sawtooth
   * through a lowpass whose cutoff rides mouse X (slide right and watch the
   * hard edges melt). Mouse Y = volume. Bottom: a Vector Scope plots a sine
   * pair against each other in XY — the ratio slider picks the harmonic
   * (1 = circle/ellipse, 2 = figure-eight, 3 = trefoil weave…); park it
   * between integers and the figure slowly tumbles. */
  'Oscilloscope': _EX([
    ['o1', 'params/slider', 30, 40, { min: 55, max: 440, value: 110 }],
    ['o2', 'audio/osc', 250, 40, { wave: 'sawtooth' }],
    ['o3', 'input/mouse', 30, 220],
    ['o4', 'math/remap', 250, 220, { S0: 0, S1: 1, T0: 200, T1: 6000 }],
    ['o5', 'audio/filter', 470, 40, { mode: 'lowpass', Q: 4 }],
    ['o6', 'math/remap', 250, 400, { S0: 0, S1: 1, T0: 0.25, T1: 0 }],
    ['o7', 'audio/gain', 690, 40],
    ['o8', 'audio/out', 910, 40],
    ['o9', 'audio/scope', 690, 260, { W: 480, H: 150, T: 18, P: { x: 0, y: -175 } }],
    ['o10', 'disp/bg', 910, 420],
    ['x1', 'audio/osc', 250, 580, { wave: 'sine' }],
    ['x2', 'params/slider', 30, 660, { min: 1, max: 4, value: 3 }],
    ['x3', 'math/round', 250, 720],
    ['x4', 'math/mul', 470, 660],
    ['x5', 'audio/osc', 690, 660, { wave: 'sine', D: 1 }], /* 1 cent sharp: the phase drifts, so the figure slowly tumbles */
    ['x6', 'audio/xyscope', 910, 580, { S: 280, T: 30, P: { x: 0, y: 105 } }]
  ], [
    ['o1', 'N', 'o2', 'F'],
    ['o2', 'A', 'o5', 'In'],
    ['o3', 'NX', 'o4', 'V'],
    ['o4', 'R', 'o5', 'F'],
    ['o5', 'A', 'o7', 'In'],
    ['o3', 'NY', 'o6', 'V'],
    ['o6', 'R', 'o7', 'G'],
    ['o7', 'A', 'o8', 'In'],
    ['o5', 'A', 'o9', 'In'],
    ['o1', 'N', 'x1', 'F'],
    ['o1', 'N', 'x4', 'A'],
    ['x2', 'N', 'x3', 'V'],
    ['x3', 'R', 'x4', 'B'],
    ['x4', 'R', 'x5', 'F'],
    ['x1', 'A', 'x6', 'X'],
    ['x5', 'A', 'x6', 'Y']
  ]),

  /* The interval-as-flower figures from audio vectorscopes (looma-style):
   * a rose r = cos(k·θ) is BUILT from pure list math — Range sweeps θ,
   * cos/sin/multiply shape 512 points per frame, PolyLine closes the petal
   * curve — then Path to Audio turns the outline into sound and the Vector
   * Scope's beam retraces it. Petals: k=2 → 4-leaf clover, k=4 → 8-petal
   * flower, odd k → k petals. In audio terms a k-rose is two partials at
   * the ratio (k+1):(k−1) in quadrature — the interval IS the flower.
   * Unwire Round for fractional k: the rose stops closing and precesses. */
  'Rose window': _EX([
    ['r1', 'sets/range', 30, 40, { A: 0, B: 6.28319, N: 511 }],
    ['r2', 'params/slider', 30, 200, { min: 2, max: 7, value: 2 }],
    ['r3', 'math/round', 250, 200],
    ['r4', 'math/mul', 470, 120],
    ['r5', 'math/cos', 690, 120],
    ['r6', 'math/cos', 470, 280],
    ['r7', 'math/sin', 470, 400],
    ['r8', 'math/mul', 910, 200],
    ['r9', 'math/mul', 910, 360],
    ['r10', 'math/mul', 1130, 200, { B: 130 }],
    ['r11', 'math/mul', 1130, 360, { B: 130 }],
    ['r12', 'vec/construct', 1350, 280],
    ['r13', 'crv/polyline', 1570, 280, { C: true }],
    ['r14', 'audio/path', 1790, 280, { F: 96 }],
    ['r15', 'audio/xyscope', 2010, 160, { S: 330 }],
    ['r16', 'audio/gain', 2010, 420, { G: 0.07 }],
    ['r17', 'audio/out', 2230, 420],
    ['r18', 'disp/bg', 2230, 160]
  ], [
    ['r2', 'N', 'r3', 'V'],
    ['r1', 'R', 'r4', 'A'], ['r3', 'R', 'r4', 'B'],
    ['r4', 'R', 'r5', 'V'],
    ['r1', 'R', 'r6', 'V'],
    ['r1', 'R', 'r7', 'V'],
    ['r5', 'R', 'r8', 'A'], ['r6', 'R', 'r8', 'B'],
    ['r5', 'R', 'r9', 'A'], ['r7', 'R', 'r9', 'B'],
    ['r8', 'R', 'r10', 'A'],
    ['r9', 'R', 'r11', 'A'],
    ['r10', 'R', 'r12', 'X'], ['r11', 'R', 'r12', 'Y'],
    ['r12', 'P', 'r13', 'V'],
    ['r13', 'C', 'r14', 'G'],
    ['r14', 'X', 'r15', 'X'], ['r14', 'Y', 'r15', 'Y'],
    ['r14', 'X', 'r16', 'In'],
    ['r16', 'A', 'r17', 'In']
  ]),

  /* The Vector Scope's math twin — no sound at all. Two damped pendulums
   * swing a pen: the sliders pick the frequency ratio (3:2, 5:4, 7:3…),
   * damping nests the figure inward, and Time drifts the phase so the
   * whole web slowly revolves. */
  'Harmonograph': _EX([
    ['h1', 'params/slider', 30, 40, { min: 1, max: 9, value: 3 }],
    ['h2', 'params/slider', 30, 140, { min: 1, max: 9, value: 2 }],
    ['h3', 'params/slider', 30, 240, { min: 0, max: 0.2, value: 0.04 }],
    ['h4', 'input/time', 30, 360],
    ['h5', 'math/mul', 250, 360, { B: 0.25 }],
    ['h6', 'disp/harmonograph', 470, 140, { S: 360, T: 50 }],
    ['h7', 'disp/bg', 690, 320]
  ], [
    ['h1', 'N', 'h6', 'X'],
    ['h2', 'N', 'h6', 'Y'],
    ['h3', 'N', 'h6', 'D'],
    ['h4', 'T', 'h5', 'A'],
    ['h5', 'R', 'h6', 'H']
  ]),

  /* Oscilloscope music, the Weft way: a polygon's outline becomes a looped
   * stereo waveform (Path to Audio), the Vector Scope's beam retraces it
   * 108 times a second, and the same signal — quietly — IS the sound you
   * hear. Slide the sides: the shape and the timbre change together. */
  'Shape song': _EX([
    ['p1', 'params/slider', 30, 40, { min: 3, max: 9, value: 5 }],
    ['p2', 'crv/polygon', 250, 40, { R: 100 }],
    ['p3', 'audio/path', 470, 40, { F: 108 }],
    ['p4', 'audio/xyscope', 690, 40, { S: 300 }],
    ['p5', 'audio/gain', 690, 260, { G: 0.08 }],
    ['p6', 'audio/out', 910, 260],
    ['p7', 'disp/bg', 910, 40]
  ], [
    ['p1', 'N', 'p2', 'N'],
    ['p2', 'C', 'p3', 'G'],
    ['p3', 'X', 'p4', 'X'],
    ['p3', 'Y', 'p4', 'Y'],
    ['p3', 'X', 'p5', 'In'],
    ['p5', 'A', 'p6', 'In']
  ]),

  /* Sing a note and the graph sings it back in key — Pitch In hears the
   * frequency, Scale snaps the fractional MIDI to A pentatonic, an
   * oscillator plays the snapped note, gated by tracker clarity so silence
   * stays silent. The circle is the pitch, the number is the Hz. */
  'Mandala': {
    format: 1,
    nodes: [
      { id: 'sym', type: 'params/slider', x: 30, y: 40, values: { min: 2, max: 24, value: 8, mode: 'int', label: 'symmetry' } },
      { id: 'pts', type: 'params/slider', x: 30, y: 130, values: { min: 20, max: 300, value: 70, mode: 'int', label: 'points' } },
      { id: 'spd', type: 'params/slider', x: 30, y: 220, values: { min: 1, max: 100, value: 35, mode: 'int', label: 'speed' } },
      { id: 'con', type: 'params/slider', x: 30, y: 310, values: { min: 20, max: 120, value: 42, mode: 'int', label: 'connect' } },
      { id: 'tim', type: 'input/time', x: 30, y: 410, values: {} },
      { id: 'tsc', type: 'math/expr', x: 270, y: 400, values: { expr: 'X * Y * 0.01' } },
      { id: 'idx', type: 'sets/series', x: 270, y: 40, values: { S: 0, N: 1 } },
      { id: 'rbase', type: 'sets/random', x: 270, y: 160, values: { A: 20, B: 420, S: 1 } },
      { id: 'rosc', type: 'sets/random', x: 270, y: 280, values: { A: 15, B: 115, S: 2 } },
      { id: 'rfrq', type: 'sets/random', x: 270, y: 520, values: { A: 0.2, B: 2.7, S: 3 } },
      { id: 'roff', type: 'sets/random', x: 270, y: 640, values: { A: 0, B: 6.283, S: 4 } },
      { id: 'rafq', type: 'sets/random', x: 270, y: 760, values: { A: 0.15, B: 2.15, S: 5 } },
      { id: 'ramp', type: 'sets/random', x: 270, y: 880, values: { A: 0, B: 0.5, S: 6 } },
      { id: 'rdst', type: 'sets/random', x: 270, y: 1000, values: { A: 0.4, B: 1.6, S: 7 } },
      { id: 'rwht', type: 'sets/random', x: 270, y: 1120, values: { A: 0, B: 1, S: 8 } },
      { id: 'seed', type: 'meta/js', x: 560, y: 200, values: {
        title: 'slice points', mode: 'each',
        ins: [
          { name: 'I', type: 'number', default: 0 },
          { name: 'N', type: 'number', default: 100 },
          { name: 'SYM', type: 'number', default: 8 },
          { name: 'TM', type: 'number', default: 0 },
          { name: 'BASE', type: 'number', default: 100 },
          { name: 'OSC', type: 'number', default: 40 },
          { name: 'FRQ', type: 'number', default: 1 },
          { name: 'OFF', type: 'number', default: 0 },
          { name: 'AFQ', type: 'number', default: 1 },
          { name: 'AMP', type: 'number', default: 0.2 }
        ],
        outs: [{ name: 'P', type: 'point' }, { name: 'HU', type: 'number' }],
        code: 'const slice = Math.PI * 2 / Math.max(2, SYM);\nconst r = Math.max(5, BASE + Math.sin(TM * FRQ + OFF) * OSC);\nconst a = (I / Math.max(1, N)) * slice + Math.sin(TM * AFQ + I) * AMP;\nreturn { P: { x: Math.cos(a) * r, y: Math.sin(a) * r }, HU: I / Math.max(1, N) };'
      } },
      { id: 'kal', type: 'meta/js', x: 840, y: 200, values: {
        title: 'kaleidoscope', mode: 'list',
        ins: [
          { name: 'P', type: 'point' },
          { name: 'HU', type: 'number' },
          { name: 'WHT', type: 'number' },
          { name: 'DST', type: 'number' },
          { name: 'CON', type: 'number', default: 55 },
          { name: 'SYM', type: 'number', default: 8 },
          { name: 'TM', type: 'number', default: 0 }
        ],
        outs: [
          { name: 'LG', type: 'geometry' }, { name: 'LC', type: 'color' },
          { name: 'DG', type: 'geometry' }, { name: 'DC', type: 'color' }
        ],
        code: "const pts = P, n = pts.length;\nconst con = CON[0] || 55, sym = Math.max(2, Math.round(SYM[0] || 8)), tm = TM[0] || 0;\nconst cons = [];\nconst step = n > 200 ? 2 : 1;\nfor (let i = 0; i < n; i += step) for (let j = i + 1; j < n; j += step) {\n  const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;\n  const d = Math.sqrt(dx * dx + dy * dy);\n  const max = (DST[i % DST.length] + DST[j % DST.length]) * 0.5 * con;\n  if (d < max) cons.push([i, j, (1 - d / max) * 0.35]);\n}\nconst LGo = [], LCo = [], DGo = [], DCo = [];\nfor (let s = 0; s < sym; s++) {\n  const rot = s * (Math.PI * 2 / sym) + tm * 0.1;\n  const cr = Math.cos(rot), sr = Math.sin(rot);\n  for (let m = 0; m < 2; m++) {\n    const my = m ? -1 : 1;\n    const tx = p => ({ x: p.x * cr - p.y * my * sr, y: p.x * sr + p.y * my * cr });\n    for (const c of cons) {\n      const a = tx(pts[c[0]]), b = tx(pts[c[1]]);\n      const w = WHT[c[0] % WHT.length] < 0.35 || WHT[c[1] % WHT.length] < 0.35;\n      LGo.push({ kind: 'line', a: a, b: b });\n      LCo.push(w ? { r: 255, g: 255, b: 255, a: c[2] * 0.6 }\n        : LM.hslToColor((HU[c[0] % HU.length] + HU[c[1] % HU.length]) / 2 + tm * 0.08, 0.7, 0.6, c[2]));\n    }\n    for (let i = 0; i < n; i++) {\n      const q = tx(pts[i]);\n      const w = WHT[i % WHT.length] < 0.35;\n      DGo.push({ kind: 'circle', cx: q.x, cy: q.y, r: w ? 1.2 : 1.9 });\n      DCo.push(w ? { r: 255, g: 255, b: 255, a: 0.9 }\n        : LM.hslToColor(HU[i % HU.length] + tm * 0.08, 0.8, 0.55 + 0.2 * Math.sin(tm * 2 + i * 0.5), 0.85));\n    }\n  }\n}\nreturn { LG: LGo, LC: LCo, DG: DGo, DC: DCo };"
      } },
      { id: 'linedraw', type: 'disp/draw', x: 1130, y: 160, values: { W: 0.5 } },
      { id: 'dotdraw', type: 'disp/draw', x: 1130, y: 330, values: { S: { r: 0, g: 0, b: 0, a: 0 }, W: 0 } },
      { id: 'bg', type: 'disp/bg', x: 1130, y: 500, values: { C: { r: 5, g: 5, b: 8, a: 1 } } }
    ],
    wires: [
      { from: ['pts', 'N'], to: ['idx', 'C'] },
      { from: ['pts', 'N'], to: ['rbase', 'N'] },
      { from: ['pts', 'N'], to: ['rosc', 'N'] },
      { from: ['pts', 'N'], to: ['rfrq', 'N'] },
      { from: ['pts', 'N'], to: ['roff', 'N'] },
      { from: ['pts', 'N'], to: ['rafq', 'N'] },
      { from: ['pts', 'N'], to: ['ramp', 'N'] },
      { from: ['pts', 'N'], to: ['rdst', 'N'] },
      { from: ['pts', 'N'], to: ['rwht', 'N'] },
      { from: ['tim', 'T'], to: ['tsc', 'X'] },
      { from: ['spd', 'N'], to: ['tsc', 'Y'] },
      { from: ['idx', 'S'], to: ['seed', 'I'] },
      { from: ['pts', 'N'], to: ['seed', 'N'] },
      { from: ['sym', 'N'], to: ['seed', 'SYM'] },
      { from: ['tsc', 'R'], to: ['seed', 'TM'] },
      { from: ['rbase', 'R'], to: ['seed', 'BASE'] },
      { from: ['rosc', 'R'], to: ['seed', 'OSC'] },
      { from: ['rfrq', 'R'], to: ['seed', 'FRQ'] },
      { from: ['roff', 'R'], to: ['seed', 'OFF'] },
      { from: ['rafq', 'R'], to: ['seed', 'AFQ'] },
      { from: ['ramp', 'R'], to: ['seed', 'AMP'] },
      { from: ['seed', 'P'], to: ['kal', 'P'] },
      { from: ['seed', 'HU'], to: ['kal', 'HU'] },
      { from: ['rwht', 'R'], to: ['kal', 'WHT'] },
      { from: ['rdst', 'R'], to: ['kal', 'DST'] },
      { from: ['con', 'N'], to: ['kal', 'CON'] },
      { from: ['sym', 'N'], to: ['kal', 'SYM'] },
      { from: ['tsc', 'R'], to: ['kal', 'TM'] },
      { from: ['kal', 'LG'], to: ['linedraw', 'G'] },
      { from: ['kal', 'LC'], to: ['linedraw', 'S'] },
      { from: ['kal', 'DG'], to: ['dotdraw', 'G'] },
      { from: ['kal', 'DC'], to: ['dotdraw', 'F'] }
    ]
  },

  /* Custom JS (Phase 4) — the superformula, a shape no native node knows,
   * wrapped in one code node with its magic numbers promoted to sliders
   * (the knob-extraction pattern). "each" mode: the code runs per angle,
   * longest-list matching against the single-valued knobs, exactly like a
   * native node. */
  'Golden Rings': {
    "format": 2,
    "nodes": [
      {
        "id": "n2",
        "type": "crv/circle",
        "x": 1178,
        "y": 447,
        "values": {
          "R": 137
        },
        "preview": false
      },
      {
        "id": "n3",
        "type": "crv/circle",
        "x": 1232,
        "y": 572,
        "values": {
          "R": 131,
          "P": {
            "x": 0,
            "y": 2
          }
        }
      },
      {
        "id": "n4",
        "type": "crv/region",
        "x": 1440,
        "y": 468,
        "values": {
          "mode": "difference"
        },
        "preview": false
      },
      {
        "id": "n5",
        "type": "disp/draw",
        "x": 2185,
        "y": 176,
        "values": {
          "S": {
            "r": 230,
            "g": 237,
            "b": 250,
            "a": 0
          },
          "F": {
            "r": 255,
            "g": 255,
            "b": 255,
            "a": 1
          }
        }
      },
      {
        "id": "n7",
        "type": "params/swatch",
        "x": 1703,
        "y": -25,
        "values": {
          "hex": "#ffaf02",
          "a": 1
        }
      },
      {
        "id": "n8",
        "type": "disp/deconhsl",
        "x": 1856,
        "y": 67,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n9",
        "type": "xf/kaleido",
        "x": 1994,
        "y": 716,
        "values": {
          "M": true
        },
        "preview": false
      },
      {
        "id": "n14",
        "type": "disp/hsl",
        "x": 1965,
        "y": 33,
        "values": {}
      },
      {
        "id": "n16",
        "type": "sets/series",
        "x": 1768,
        "y": 189,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n18",
        "type": "math/remap",
        "x": 1840,
        "y": 248,
        "values": {
          "S1": 1,
          "T1": 1
        },
        "collapsed": true
      },
      {
        "id": "n19",
        "type": "params/slider",
        "x": 1476,
        "y": 237,
        "values": {
          "min": 0,
          "max": 1,
          "value": 0.1,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n20",
        "type": "params/slider",
        "x": 1483,
        "y": 284,
        "values": {
          "min": 0,
          "max": 1,
          "value": 0.7,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n21",
        "type": "params/slider",
        "x": 1404,
        "y": 174,
        "values": {
          "min": 0,
          "max": 10,
          "value": 8,
          "mode": "int"
        }
      },
      {
        "id": "n22",
        "type": "math/div",
        "x": 1673,
        "y": 164,
        "values": {
          "A": 1
        },
        "collapsed": true
      },
      {
        "id": "n24",
        "type": "params/slider",
        "x": 1705,
        "y": 786,
        "values": {
          "min": 0,
          "max": 10,
          "value": 10,
          "mode": "int"
        }
      },
      {
        "id": "n29",
        "type": "params/anchor",
        "x": 946,
        "y": 432,
        "values": {
          "x": 32,
          "y": -173
        },
        "preview": false
      },
      {
        "id": "n30",
        "type": "params/anchor",
        "x": 948,
        "y": 574,
        "values": {
          "x": 32,
          "y": -169
        },
        "preview": false
      },
      {
        "id": "n31",
        "type": "xf/rotate",
        "x": 2266,
        "y": 524,
        "values": {},
        "preview": false
      },
      {
        "id": "n33",
        "type": "params/slider",
        "x": 1442,
        "y": 339,
        "values": {
          "min": 0,
          "max": 360,
          "value": 203,
          "mode": "int"
        }
      },
      {
        "id": "n34",
        "type": "math/rad",
        "x": 1704,
        "y": 370,
        "values": {}
      },
      {
        "id": "n35",
        "type": "xf/rotate",
        "x": 1725,
        "y": 553,
        "values": {}
      },
      {
        "id": "n37",
        "type": "math/rad",
        "x": 1728,
        "y": 468,
        "values": {}
      },
      {
        "id": "n39",
        "type": "math/mod",
        "x": 1228,
        "y": 241,
        "values": {
          "B": 360
        }
      },
      {
        "id": "n42",
        "type": "math/mul",
        "x": 1280,
        "y": 170,
        "values": {
          "B": 100
        },
        "collapsed": true
      },
      {
        "id": "n44",
        "type": "input/turntable",
        "x": 1252,
        "y": 18,
        "values": {
          "Z": false
        }
      },
      {
        "id": "n45",
        "type": "input/mouse",
        "x": 827,
        "y": -120,
        "values": {}
      },
      {
        "id": "n46",
        "type": "vec/distance",
        "x": 1158,
        "y": -124,
        "values": {}
      },
      {
        "id": "n47",
        "type": "vec/deconstruct",
        "x": 919,
        "y": -330,
        "values": {}
      },
      {
        "id": "n48",
        "type": "vec/construct",
        "x": 1060,
        "y": -97,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n49",
        "type": "input/mouse",
        "x": 1574,
        "y": -793,
        "values": {}
      },
      {
        "id": "n50",
        "type": "vec/distance",
        "x": 1876,
        "y": -759,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n51",
        "type": "vec/construct",
        "x": 1791,
        "y": -765,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n52",
        "type": "params/slider",
        "x": 1327,
        "y": -508,
        "values": {
          "min": 0,
          "max": 1000,
          "value": 614,
          "mode": "int"
        }
      },
      {
        "id": "n53",
        "type": "math/remap",
        "x": 1737,
        "y": -482,
        "values": {
          "T1": 1,
          "T0": 0
        }
      },
      {
        "id": "n54",
        "type": "params/slider",
        "x": 1678,
        "y": -242,
        "values": {
          "min": 0,
          "max": 10,
          "value": 3.7,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n55",
        "type": "state/smooth",
        "x": 1942,
        "y": -273,
        "values": {}
      },
      {
        "id": "n56",
        "type": "params/slider",
        "x": 1412,
        "y": -382,
        "values": {
          "min": 0,
          "max": 1,
          "value": 0.3,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n57",
        "type": "xf/move",
        "x": 1467,
        "y": -272,
        "values": {}
      },
      {
        "id": "n58",
        "type": "vec/amp",
        "x": 1446,
        "y": -162,
        "values": {
          "V": {
            "x": 0,
            "y": 1
          }
        }
      },
      {
        "id": "n60",
        "type": "params/slider",
        "x": 853,
        "y": -534,
        "values": {
          "min": 0,
          "max": 500,
          "value": 500,
          "mode": "float",
          "prec": 2
        }
      },
      {
        "id": "n61",
        "type": "math/mul",
        "x": 1456,
        "y": -52,
        "values": {
          "B": 100
        },
        "collapsed": true
      },
      {
        "id": "n62",
        "type": "vec/vec2pt",
        "x": 1133,
        "y": -295,
        "values": {}
      },
      {
        "id": "n64",
        "type": "vec/construct",
        "x": 1053,
        "y": -202,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n65",
        "type": "params/slider",
        "x": 766,
        "y": 141,
        "values": {
          "min": 0,
          "max": 10,
          "value": 1.2,
          "mode": "float",
          "prec": 1
        }
      },
      {
        "id": "n66",
        "type": "state/smooth",
        "x": 1034,
        "y": 103,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n67",
        "type": "state/smooth",
        "x": 1041,
        "y": 30,
        "values": {},
        "collapsed": true
      },
      {
        "id": "n68",
        "type": "state/smooth",
        "x": 1937,
        "y": -173,
        "values": {}
      }
    ],
    "wires": [
      {
        "id": "w1",
        "from": [
          "n3",
          "C"
        ],
        "to": [
          "n4",
          "B"
        ]
      },
      {
        "id": "w2",
        "from": [
          "n2",
          "C"
        ],
        "to": [
          "n4",
          "A"
        ]
      },
      {
        "id": "w4",
        "from": [
          "n7",
          "C"
        ],
        "to": [
          "n8",
          "C"
        ]
      },
      {
        "id": "w10",
        "from": [
          "n8",
          "H"
        ],
        "to": [
          "n14",
          "H"
        ]
      },
      {
        "id": "w11",
        "from": [
          "n8",
          "S"
        ],
        "to": [
          "n14",
          "S"
        ]
      },
      {
        "id": "w12",
        "from": [
          "n8",
          "L"
        ],
        "to": [
          "n14",
          "L"
        ]
      },
      {
        "id": "w13",
        "from": [
          "n14",
          "C"
        ],
        "to": [
          "n5",
          "F"
        ]
      },
      {
        "id": "w15",
        "from": [
          "n16",
          "S"
        ],
        "to": [
          "n18",
          "V"
        ]
      },
      {
        "id": "w17",
        "from": [
          "n19",
          "N"
        ],
        "to": [
          "n18",
          "T0"
        ]
      },
      {
        "id": "w18",
        "from": [
          "n20",
          "N"
        ],
        "to": [
          "n18",
          "T1"
        ]
      },
      {
        "id": "w19",
        "from": [
          "n21",
          "N"
        ],
        "to": [
          "n22",
          "B"
        ]
      },
      {
        "id": "w20",
        "from": [
          "n22",
          "R"
        ],
        "to": [
          "n16",
          "N"
        ]
      },
      {
        "id": "w21",
        "from": [
          "n21",
          "N"
        ],
        "to": [
          "n16",
          "C"
        ]
      },
      {
        "id": "w26",
        "from": [
          "n24",
          "N"
        ],
        "to": [
          "n9",
          "N"
        ]
      },
      {
        "id": "w31",
        "from": [
          "n29",
          "P"
        ],
        "to": [
          "n2",
          "P"
        ]
      },
      {
        "id": "w32",
        "from": [
          "n30",
          "P"
        ],
        "to": [
          "n3",
          "P"
        ]
      },
      {
        "id": "w35",
        "from": [
          "n18",
          "R"
        ],
        "to": [
          "n14",
          "A"
        ]
      },
      {
        "id": "w41",
        "from": [
          "n33",
          "N"
        ],
        "to": [
          "n34",
          "V"
        ]
      },
      {
        "id": "w42",
        "from": [
          "n34",
          "R"
        ],
        "to": [
          "n31",
          "A"
        ]
      },
      {
        "id": "w44",
        "from": [
          "n9",
          "G"
        ],
        "to": [
          "n31",
          "G"
        ]
      },
      {
        "id": "w45",
        "from": [
          "n31",
          "G"
        ],
        "to": [
          "n5",
          "G"
        ]
      },
      {
        "id": "w47",
        "from": [
          "n37",
          "R"
        ],
        "to": [
          "n35",
          "A"
        ]
      },
      {
        "id": "w49",
        "from": [
          "n35",
          "G"
        ],
        "to": [
          "n9",
          "G"
        ]
      },
      {
        "id": "w51",
        "from": [
          "n39",
          "R"
        ],
        "to": [
          "n37",
          "V"
        ]
      },
      {
        "id": "w60",
        "from": [
          "n44",
          "T"
        ],
        "to": [
          "n42",
          "A"
        ]
      },
      {
        "id": "w61",
        "from": [
          "n42",
          "R"
        ],
        "to": [
          "n39",
          "A"
        ]
      },
      {
        "id": "w62",
        "from": [
          "n45",
          "X"
        ],
        "to": [
          "n48",
          "X"
        ]
      },
      {
        "id": "w64",
        "from": [
          "n48",
          "P"
        ],
        "to": [
          "n46",
          "A"
        ]
      },
      {
        "id": "w65",
        "from": [
          "n49",
          "X"
        ],
        "to": [
          "n51",
          "X"
        ]
      },
      {
        "id": "w66",
        "from": [
          "n49",
          "Y"
        ],
        "to": [
          "n51",
          "Y"
        ]
      },
      {
        "id": "w67",
        "from": [
          "n51",
          "P"
        ],
        "to": [
          "n50",
          "A"
        ]
      },
      {
        "id": "w68",
        "from": [
          "n52",
          "N"
        ],
        "to": [
          "n53",
          "S1"
        ]
      },
      {
        "id": "w69",
        "from": [
          "n50",
          "D"
        ],
        "to": [
          "n53",
          "V"
        ]
      },
      {
        "id": "w70",
        "from": [
          "n54",
          "N"
        ],
        "to": [
          "n55",
          "S"
        ]
      },
      {
        "id": "w71",
        "from": [
          "n53",
          "R"
        ],
        "to": [
          "n55",
          "V"
        ]
      },
      {
        "id": "w72",
        "from": [
          "n55",
          "R"
        ],
        "to": [
          "n44",
          "R"
        ]
      },
      {
        "id": "w73",
        "from": [
          "n56",
          "N"
        ],
        "to": [
          "n53",
          "T1"
        ]
      },
      {
        "id": "w76",
        "from": [
          "n4",
          "C"
        ],
        "to": [
          "n57",
          "G"
        ]
      },
      {
        "id": "w77",
        "from": [
          "n58",
          "V"
        ],
        "to": [
          "n57",
          "T"
        ]
      },
      {
        "id": "w80",
        "from": [
          "n61",
          "R"
        ],
        "to": [
          "n58",
          "A"
        ]
      },
      {
        "id": "w82",
        "from": [
          "n62",
          "V"
        ],
        "to": [
          "n58",
          "V"
        ]
      },
      {
        "id": "w83",
        "from": [
          "n60",
          "N"
        ],
        "to": [
          "n61",
          "B"
        ]
      },
      {
        "id": "w89",
        "from": [
          "n57",
          "G"
        ],
        "to": [
          "n35",
          "G"
        ]
      },
      {
        "id": "w92",
        "from": [
          "n64",
          "P"
        ],
        "to": [
          "n62",
          "B"
        ]
      },
      {
        "id": "w93",
        "from": [
          "n65",
          "N"
        ],
        "to": [
          "n66",
          "S"
        ]
      },
      {
        "id": "w95",
        "from": [
          "n45",
          "Y"
        ],
        "to": [
          "n66",
          "V"
        ]
      },
      {
        "id": "w96",
        "from": [
          "n65",
          "N"
        ],
        "to": [
          "n67",
          "S"
        ]
      },
      {
        "id": "w101",
        "from": [
          "n53",
          "R"
        ],
        "to": [
          "n68",
          "V"
        ]
      },
      {
        "id": "w102",
        "from": [
          "n65",
          "N"
        ],
        "to": [
          "n68",
          "S"
        ]
      },
      {
        "id": "w103",
        "from": [
          "n68",
          "R"
        ],
        "to": [
          "n61",
          "A"
        ]
      },
      {
        "id": "w104",
        "from": [
          "n45",
          "Y"
        ],
        "to": [
          "n48",
          "Y"
        ]
      },
      {
        "id": "w105",
        "from": [
          "n66",
          "R"
        ],
        "to": [
          "n64",
          "Y"
        ]
      },
      {
        "id": "w106",
        "from": [
          "n67",
          "R"
        ],
        "to": [
          "n64",
          "X"
        ]
      },
      {
        "id": "w107",
        "from": [
          "n45",
          "X"
        ],
        "to": [
          "n67",
          "V"
        ]
      }
    ]
  },
  'Superformula': _EX([
    ['s1', 'params/slider', 30, 40, { min: 2, max: 16, value: 6, mode: 'int', label: 'symmetry' }],
    ['s2', 'params/slider', 30, 150, { min: 0.1, max: 2, value: 0.3, label: 'pinch' }],
    ['s3', 'params/slider', 30, 260, { min: 0.1, max: 5, value: 1.7, label: 'edge' }],
    ['s4', 'params/slider', 30, 370, { min: 40, max: 220, value: 130, mode: 'int', label: 'size' }],
    ['rg', 'sets/range', 30, 480, { A: 0, B: 6.2832, N: 256 }],
    ['js', 'meta/js', 280, 150, {
      title: 'superformula', mode: 'each',
      ins: [
        { name: 'T', type: 'number', default: 0 },
        { name: 'M', type: 'number', default: 6 },
        { name: 'N1', type: 'number', default: 0.3 },
        { name: 'N2', type: 'number', default: 1.7 },
        { name: 'R', type: 'number', default: 130 }
      ],
      outs: [{ name: 'P', type: 'point' }],
      code: 'const q = M * T / 4;\nconst f = Math.abs(Math.cos(q)), g = Math.abs(Math.sin(q));\nconst r = R * Math.pow(Math.pow(f, N2) + Math.pow(g, N2), -1 / N1);\nreturn { P: { x: r * Math.cos(T), y: r * Math.sin(T) } };'
    }],
    ['pl', 'crv/polyline', 560, 150, { C: true }],
    ['t1', 'input/time', 560, 330],
    ['mu', 'math/mul', 740, 330, { B: 0.05 }],
    ['ro', 'xf/rotate', 920, 150],
    ['dr', 'disp/draw', 1140, 150, { S: { r: 94, g: 234, b: 212, a: 0.9 }, F: { r: 129, g: 140, b: 248, a: 0.12 }, W: 2 }],
    ['bg', 'disp/bg', 1140, 330]
  ], [
    ['rg', 'R', 'js', 'T'],
    ['s1', 'N', 'js', 'M'],
    ['s2', 'N', 'js', 'N1'],
    ['s3', 'N', 'js', 'N2'],
    ['s4', 'N', 'js', 'R'],
    ['js', 'P', 'pl', 'V'],
    ['pl', 'C', 'ro', 'G'],
    ['t1', 'T', 'mu', 'A'],
    ['mu', 'R', 'ro', 'A'],
    ['ro', 'G', 'dr', 'G']
  ]),

  /* The geometry pass (v0.11) — two circles drifting apart, and everything the
   * new curve nodes can say about the pair: the lens where they overlap, the
   * crescent left over, its mirror image, the two crossing points, the axis
   * through them, and the lens area as a number on the canvas. None of this was
   * expressible before Curve Intersection and Region Boolean existed. Three
   * Draw nodes each take TWO wires into G — the merge is what keeps a family of
   * shapes on one style instead of one Draw per shape. */
  'Intersections': _EX([
    ['t1', 'input/time', 30, 40],
    ['mu', 'math/mul', 230, 40, { B: 0.5 }],
    ['sn', 'math/sin', 430, 40],
    ['rm', 'math/remap', 630, 40, { S0: -1, S1: 1, T0: 30, T1: 95 }],
    ['ng', 'math/neg', 860, 40],
    ['pb', 'vec/construct', 860, 200],
    ['pa', 'vec/construct', 1060, 40],
    ['ca', 'crv/circle', 1260, 40, { R: 110 }],
    ['cb', 'crv/circle', 1260, 200, { R: 110 }],
    ['ix', 'crv/intersect', 1480, 40],
    ['rg1', 'crv/region', 1480, 240, { mode: 'intersection' }],
    ['rg2', 'crv/region', 1480, 460, { mode: 'difference' }],
    ['pl', 'crv/polyline', 1720, 40, { C: false }],
    ['ar', 'crv/area', 1720, 240],
    ['mi', 'xf/mirror', 1720, 460],
    ['rd', 'math/round', 1920, 240],
    ['tx', 'disp/text', 2120, 240, { P: { x: 0, y: 196 }, S: 13 }],
    ['dwMark', 'disp/draw', 2360, 40, { S: { r: 251, g: 172, b: 0, a: 0.95 }, W: 1.4 }],
    ['dwLens', 'disp/draw', 2360, 200, { S: { r: 94, g: 234, b: 212, a: 0.9 }, F: { r: 94, g: 234, b: 212, a: 0.16 }, W: 1.6 }],
    ['dwCres', 'disp/draw', 2360, 380, { S: { r: 129, g: 140, b: 248, a: 0.85 }, F: { r: 129, g: 140, b: 248, a: 0.1 }, W: 1.4 }],
    ['dwCirc', 'disp/draw', 2360, 560, { S: { r: 110, g: 125, b: 160, a: 0.32 }, W: 1 }],
    ['dwTx', 'disp/draw', 2360, 720, { S: { r: 130, g: 141, b: 163, a: 0.9 } }],
    ['bg', 'disp/bg', 2360, 860, { C: { r: 9, g: 11, b: 17, a: 1 } }]
  ], [
    ['t1', 'T', 'mu', 'A'],
    ['mu', 'R', 'sn', 'V'],
    ['sn', 'R', 'rm', 'V'],
    ['rm', 'R', 'ng', 'V'],
    ['rm', 'R', 'pb', 'X'],
    ['ng', 'R', 'pa', 'X'],
    ['pa', 'P', 'ca', 'P'],
    ['pb', 'P', 'cb', 'P'],
    ['ca', 'C', 'ix', 'C1'],
    ['cb', 'C', 'ix', 'C2'],
    ['ca', 'C', 'rg1', 'A'],
    ['cb', 'C', 'rg1', 'B'],
    ['ca', 'C', 'rg2', 'A'],
    ['cb', 'C', 'rg2', 'B'],
    ['ix', 'P', 'pl', 'V'],
    ['rg1', 'C', 'ar', 'C'],
    ['ar', 'A', 'rd', 'V'],
    ['rd', 'R', 'tx', 'T'],
    ['rg2', 'C', 'mi', 'G'],
    ['pl', 'C', 'dwMark', 'G'],
    ['ix', 'P', 'dwMark', 'G'],
    ['rg1', 'C', 'dwLens', 'G'],
    ['rg2', 'C', 'dwCres', 'G'],
    ['mi', 'G', 'dwCres', 'G'],
    ['ca', 'C', 'dwCirc', 'G'],
    ['cb', 'C', 'dwCirc', 'G'],
    ['tx', 'G', 'dwTx', 'G']
  ]),

  /* Native 3D (v0.12) — nine hexagons on a ring, extruded into stones, laid flat
   * by a quarter turn about x and then spun about y. A second, smaller ring comes
   * from scaling the first about the origin, which shrinks its radius too.
   *
   * The whole 3D idiom is the last four nodes. Project takes the geometry as ONE
   * list (both rings arrive on two wires into G), so its back-to-front sort is
   * global and the near stones of one ring correctly hide the far stones of the
   * other. It emits three parallel lists — screen faces, shade, depth — so the
   * shade goes through Remap into Colour HSL and a SINGLE Draw paints all 144
   * faces. No camera on ctx, no second renderer: what reaches the draw list is
   * ordinary 2D geometry, which is why the export renders exactly this.
   *
   * Drag the cloth to orbit; the wheel pulls the camera back. The projection's
   * pixel scale comes from the canvas HEIGHT (a vertical field of view, the
   * usual convention), so the scene keeps its proportions at any size — but a
   * tall narrow cloth crops it at the sides, which is why the camera sits far
   * enough back to clear the editor's portrait preview pane as well as the
   * squarer gallery thumbnail. */
  'Henge': _EX([
    ['t1', 'input/time', 30, 40],
    ['sr', 'sets/series', 30, 200, { S: 0, N: 1, C: 9 }],
    ['mu2', 'math/mul', 230, 40, { B: 0.35 }],
    ['mu1', 'math/mul', 230, 200, { B: 0.6981317007977318 }],
    /* the flat ring and its hexagons are scaffolding for Extrude — their 2D
       ghosts would otherwise hang in the air beside the solids they became */
    ['pv', 'vec/polar', 430, 200, { R: 150 }, { preview: false }],
    ['pg', 'crv/polygon', 630, 200, { R: 40, N: 6 }, { preview: false }],
    ['ex', 'd3/extrude', 830, 200, { H: 70, C: true }],
    ['rx', 'd3/rotate3', 1030, 200, { R: 1.5707963267948966, A: { x: 1, y: 0, z: 0 } }],
    ['ry', 'd3/rotate3', 1230, 200, { A: { x: 0, y: 1, z: 0 } }],
    ['ob', 'd3/orbit', 1430, 20, { T: { x: 0, y: 0, z: 0 }, D: 860, A: 0.55, E: 0.42, F: 42 }],
    ['sc', 'd3/scale3', 1430, 400, { F: { x: 0.55, y: 0.55, z: 0.55 } }],
    ['rz', 'd3/rotate3', 1630, 400, { R: 0.3490658503988659, A: { x: 0, y: 1, z: 0 } }],
    ['pj', 'd3/project', 1850, 180, { mode: 'shaded' }],
    ['rm', 'math/remap', 2070, 340, { S0: 0, S1: 1, T0: 0.09, T1: 0.66 }],
    ['hs', 'disp/hsl', 2290, 340, { H: 0.53, S: 0.52 }],
    ['dw', 'disp/draw', 2510, 180, { S: { r: 7, g: 11, b: 18, a: 0.6 }, W: 1 }],
    ['bg', 'disp/bg', 2510, 400, { C: { r: 8, g: 10, b: 16, a: 1 } }]
  ], [
    ['sr', 'S', 'mu1', 'A'],
    ['mu1', 'R', 'pv', 'A'],
    ['pv', 'P', 'pg', 'P'],
    ['pg', 'C', 'ex', 'G'],
    ['ex', 'G', 'rx', 'G'],
    ['t1', 'T', 'mu2', 'A'],
    ['mu2', 'R', 'ry', 'R'],
    ['rx', 'G', 'ry', 'G'],
    ['ry', 'G', 'sc', 'G'],
    ['sc', 'G', 'rz', 'G'],
    ['ry', 'G', 'pj', 'G'],
    ['rz', 'G', 'pj', 'G'],
    ['ob', 'C', 'pj', 'C'],
    ['pj', 'S', 'rm', 'V'],
    ['rm', 'R', 'hs', 'L'],
    ['pj', 'F', 'dw', 'G'],
    ['hs', 'C', 'dw', 'F']
  ]),

  /* Rosette (2026-08-08) — Vector In + Kaleidoscope. The leaf is a baked SVG
   * import (exactly what params/svg stores after "load svg…"), moved off
   * centre and slowly rotated; Kaleidoscope takes the whole two-path motif
   * into every wedge, mirroring alternates, and K colours by wedge. */

};

/* ---------------------------------------------------------------------------
 * EXAMPLE_META — what the gallery knows about each example.
 *
 * Deliberately a PARALLEL object rather than fields on the graphs: EXAMPLES
 * stays name → bare graph JSON, so App.setGraph, the share hash and
 * test/smoke.js keep seeing exactly what they saw before. smoke.js checks the
 * two key sets are identical, so they can't drift apart.
 *
 * The block comments above each graph are the long-form developer notes;
 * blurb/teaches here are the distilled gallery copy drawn from them.
 *
 *   cat     one of EXAMPLE_CATS (chip order in the gallery)
 *   blurb   one sentence — what you are looking at
 *   teaches what this example is the best in the corpus at showing
 *   tags    extra search words (name + blurb + tags + node types are the haystack)
 *   needs   what the browser must grant before it fully comes alive:
 *           'mic' | 'tab-audio' | 'gesture' (audio waits for a click) | 'scroll'
 *   frames  frames to advance before snapping the thumbnail — springs, traces
 *           and scopes look dead at t=0 and need a run-up
 * ------------------------------------------------------------------------- */

const EXAMPLE_CATS = [
  'Fundamentals', 'Lists & grids', 'Geometry', '3D', 'State & interaction',
  'Audio synthesis', 'Scopes & figures', 'Audio input', 'Custom JS & meta'
];

/* Chip and card hue per category — named as CATS keys rather than hex, so the
 * gallery rides the node palette (js/nodes.js) instead of forking it. Each
 * example family borrows the hue of the node category it leans on most. */
const EXAMPLE_CAT_HUE = {
  'Fundamentals': 'Params',
  'Lists & grids': 'Sets',
  'Geometry': 'Curve',
  '3D': '3D',
  'State & interaction': 'State',
  'Audio synthesis': 'Audio',
  'Scopes & figures': 'Display',
  'Audio input': 'Input',
  'Custom JS & meta': 'Meta'
};

const EXAMPLE_META = {
  'Hexa graph': {
    cat: 'State & interaction',
    blurb: 'A breathing hexagon lattice — hover wakes it, springs ripple the radius, and six rotated Trace pens draw the motion as a mandala.',
    teaches: 'One Spring node is hundreds of independent mass-machines, and a Trace pen turns any moving point into a seismograph trail.',
    tags: ['grid', 'spring', 'trace', 'hotspot', 'mandala'],
    needs: [], frames: 120
  },
  'Phyllotaxis': {
    cat: 'Fundamentals',
    blurb: 'The golden-angle seed head grown up — real SVG petals ride the spiral, the pointer leans into it, and a Time Graph watches the sway.',
    teaches: 'Vector In geometry rides the same list-matched transforms as any circle — and Dispatch splits one spiral into seeds and petals.',
    tags: ['spiral', 'golden angle', 'svg', 'smooth', 'dispatch'],
    needs: [], frames: 90
  },
  'Noise blob': {
    cat: 'Fundamentals',
    blurb: 'Three interleaved noise blobs in graded colour — the same polar-spline idea three ways, layered into one organism.',
    teaches: 'Colour as data: swatches deconstruct into HSL, shift per layer, and a gradient fills each breathing spline.',
    tags: ['noise', 'spline', 'polar', 'gradient', 'layers'],
    needs: [], frames: 40
  },
  'Iso-field': {
    cat: 'Lists & grids',
    blurb: 'A line field folded through two kaleidoscopes — the pointer bends the weave and the mirrors carry it around the ring.',
    teaches: 'Kaleidoscope takes whole lists: one bundle of lines becomes an isometric field, and Smooth turns the pointer into a soft brush.',
    tags: ['kaleidoscope', 'lines', 'field', 'mouse', 'iso'],
    needs: [], frames: 90
  },
  'Living lattice': {
    cat: 'State & interaction',
    blurb: 'A honeycomb that behaves like a material — the pointer pumps energy in, and a click drops a stone whose ring travels outward.',
    teaches: 'Per-item state: one Spring is 300+ independent mass-machines, and a Hotspot on a viewport-sized rect makes the whole canvas an interface element.',
    tags: ['spring', 'hotspot', 'honeycomb', 'hexagons', 'physics'],
    needs: [], frames: 90
  },
  'Click toy': {
    cat: 'State & interaction',
    blurb: 'Three circles are three independent toggle buttons from one node chain, with a real DOM button to reset them.',
    teaches: 'Hotspot, Latch and Counter are per-list-item state machines — one chain, three separate memories.',
    tags: ['hotspot', 'latch', 'counter', 'button', 'dom'],
    needs: [], frames: 40
  },
  'Solar system': {
    cat: 'Lists & grids',
    blurb: 'The solar system as a dataflow — one Kepler machine, eight planets, real J2000 orbital elements from JPL.',
    teaches: 'List matching at full scale: mean anomaly → true anomaly → radius, solved once and answered for eight bodies, from Text List data.',
    tags: ['list matching', 'kepler', 'text list', 'data', 'orbits', 'planets'],
    needs: [], frames: 40
  },
  'Scale board': {
    cat: 'Audio synthesis',
    blurb: 'The theremin grown into an instrument you can see — labelled rungs, a live trace of the melody, and real button drones underneath.',
    teaches: 'Scale snaps the pointer into key, Set Union dedupes the notes into rungs, and one Element node list-matches into actual HTML buttons.',
    tags: ['scale', 'set union', 'dom', 'buttons', 'instrument', 'trace'],
    needs: ['gesture'], frames: 40
  },
  'Cymatics': {
    cat: 'Scopes & figures',
    blurb: 'Sand on a vibrating plate migrates to the quiet nodal lines of whatever frequency is playing.',
    teaches: 'Sound made visible — slide the pitch and the whole figure reorganizes.',
    tags: ['cymatics', 'nodal', 'frequency', 'pattern'],
    needs: ['gesture'], frames: 60
  },
  'Oscilloscope': {
    cat: 'Scopes & figures',
    blurb: 'A real oscilloscope and a vectorscope — a sawtooth melting through a mouse-driven lowpass above, an XY figure below.',
    teaches: 'The Scope node taps an audio wire and draws the actual samples, trigger-locked.',
    tags: ['scope', 'vectorscope', 'filter', 'lissajous'],
    needs: ['gesture'], frames: 60
  },
  'Rose window': {
    cat: 'Scopes & figures',
    blurb: 'A rose curve built from pure list math, turned into sound by Path to Audio and retraced by the vectorscope’s beam.',
    teaches: 'A k-rose is two partials at the ratio (k+1):(k−1) in quadrature — the interval IS the flower.',
    tags: ['rose', 'path to audio', 'vectorscope', 'harmony', 'petals'],
    needs: ['gesture'], frames: 60
  },
  'Harmonograph': {
    cat: 'Scopes & figures',
    blurb: 'The vectorscope’s math twin, with no sound at all — two damped pendulums swing a pen.',
    teaches: 'Frequency ratio and damping alone produce the whole family of figures; Time drifts the phase so the web revolves.',
    tags: ['harmonograph', 'ratio', 'damping', 'pendulum', 'no audio'],
    needs: [], frames: 60
  },
  'Shape song': {
    cat: 'Scopes & figures',
    blurb: 'A polygon’s outline becomes a looped stereo waveform — the beam retraces it 108 times a second, and it IS the sound you hear.',
    teaches: 'Path to Audio makes geometry and timbre the same object: slide the sides and both change together.',
    tags: ['path to audio', 'oscilloscope music', 'polygon'],
    needs: ['gesture'], frames: 60
  },
  'Loop pedal': {
    cat: 'Audio input',
    blurb: 'Space toggles recording, c clears; the mic pours into a feedback-1 Delay and circles forever — sing a layer, then sing over it.',
    teaches: 'Delay with feedback 1 IS a loop pedal: a Latch gates the audio in, one slider is the loop length, and the record dot pulses 8× per loop from a single Expression node.',
    tags: ['looper', 'loop pedal', 'delay', 'echo', 'mic', 'overdub'],
    needs: ['mic', 'gesture'], frames: 40
  },
  'Mandala': {
    cat: 'Custom JS & meta',
    blurb: 'Seeded particles in a symmetry slice, joined by a distance-threshold web, replicated around the centre.',
    teaches: 'Two Custom JS nodes hold the genuinely code-shaped parts; everything else is sliders, seeded randoms and wires.',
    tags: ['custom js', 'symmetry', 'particles', 'seeded random'],
    needs: [], frames: 40
  },
  'Golden Rings': {
    cat: 'Geometry',
    blurb: 'Concentric rings carved by Region Boolean, fanned by a kaleidoscope, turning on a turntable — with two anchors to grab on the cloth.',
    teaches: 'Region Boolean cuts true ring shapes with holes, Kaleidoscope fans them around the centre, and Anchor Points put handles right on the render.',
    tags: ['rings', 'region boolean', 'kaleidoscope', 'turntable', 'anchors'],
    needs: [], frames: 60
  },
  'Superformula': {
    cat: 'Custom JS & meta',
    blurb: 'A shape no native node knows, wrapped in one code node with its magic numbers promoted to sliders.',
    teaches: 'The knob-extraction pattern: in “each” mode the code runs per angle and list-matches against single-valued knobs, exactly like a native node.',
    tags: ['custom js', 'knob extraction', 'superformula'],
    needs: [], frames: 40
  },
  'Intersections': {
    cat: 'Geometry',
    blurb: 'Two drifting circles and everything the curve nodes can say about the pair — the lens, the crescents, the crossing points, and the area as a number.',
    teaches: 'Curve Intersection and Region Boolean cut shapes that were previously inexpressible, and three Draw nodes take two wires each so a family of shapes shares one style.',
    tags: ['intersection', 'region boolean', 'mirror', 'area', 'multi-wire'],
    needs: [], frames: 40
  },
  'Henge': {
    cat: '3D',
    blurb: 'Two rings of hexagonal stones, extruded from flat polygons and turning on a table you can grab and orbit.',
    teaches: 'The whole 3D idiom in four nodes: Extrude a 2D curve, Project it with a camera, and wire the shade list through Colour HSL so one Draw paints all 144 faces in depth order.',
    tags: ['3d', 'extrude', 'project', 'orbit camera', 'shading', 'painter’s algorithm'],
    needs: [], frames: 60
  },

};
