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

  /* a machine where clicks accumulate: the disc is one big Hotspot driving a
   * Counter, and four Text Lists (sides / hue / spin / name) are read by one
   * List Item, so geometry AND palette change together. The pad row is the
   * per-item idiom at full strength — one Hotspot, one Latch, one Smooth over
   * a list of circles = N independent toggles, with Select swapping each lit
   * pad to the scene's shape and their sum setting the ring count. The bar
   * teaches press-vs-release: Edge starts a Timer on press and stops it on
   * release, and the held seconds set the Turntable's rate. Sample & Hold
   * remembers when you last touched anything, so the ring is a countdown and
   * the scene advances by itself if you leave. */
  'Click toy': {
    "format": 2,
    "nodes": [
      {
        "id": "cnt",
        "type": "state/counter",
        "x": 60,
        "y": 60,
        "values": {
          "S": 1
        },
        "label": "scene index"
      },
      {
        "id": "sd_sides",
        "type": "params/textlist",
        "x": 60,
        "y": 200,
        "values": {
          "text": "3\n4\n5\n8"
        },
        "label": "sides"
      },
      {
        "id": "sd_hue",
        "type": "params/textlist",
        "x": 60,
        "y": 340,
        "values": {
          "text": "0.47\n0.09\n0.78\n0.94"
        },
        "label": "hue"
      },
      {
        "id": "sd_spin",
        "type": "params/textlist",
        "x": 60,
        "y": 480,
        "values": {
          "text": "0.5\n-0.34\n0.42\n-0.22"
        },
        "label": "spin"
      },
      {
        "id": "sd_name",
        "type": "params/textlist",
        "x": 60,
        "y": 620,
        "values": {
          "text": "triad\nquartet\npentad\noctet"
        },
        "label": "name"
      },
      {
        "id": "it_sides",
        "type": "sets/item",
        "x": 330,
        "y": 200
      },
      {
        "id": "it_hue",
        "type": "sets/item",
        "x": 330,
        "y": 340
      },
      {
        "id": "it_spin",
        "type": "sets/item",
        "x": 330,
        "y": 480
      },
      {
        "id": "it_name",
        "type": "sets/item",
        "x": 330,
        "y": 620
      },
      {
        "id": "pn",
        "type": "params/slider",
        "x": 660,
        "y": 60,
        "values": {
          "min": 3,
          "max": 7,
          "value": 5,
          "mode": "int",
          "label": "pads"
        }
      },
      {
        "id": "pser",
        "type": "sets/series",
        "x": 660,
        "y": 200,
        "values": {
          "S": 0,
          "N": 1
        }
      },
      {
        "id": "px",
        "type": "math/expr",
        "x": 660,
        "y": 360,
        "values": {
          "expr": "(X - (Y - 1) / 2) * 78"
        },
        "label": "centred x"
      },
      {
        "id": "ppt",
        "type": "vec/construct",
        "x": 660,
        "y": 520,
        "values": {
          "Y": 190
        }
      },
      {
        "id": "phit",
        "type": "crv/circle",
        "x": 900,
        "y": 60,
        "values": {
          "R": 26
        },
        "label": "hit area (never moves)"
      },
      {
        "id": "phot",
        "type": "input/hotspot",
        "x": 900,
        "y": 200
      },
      {
        "id": "plat",
        "type": "state/latch",
        "x": 900,
        "y": 360,
        "label": "one node, one memory per pad"
      },
      {
        "id": "psm",
        "type": "state/smooth",
        "x": 900,
        "y": 520,
        "values": {
          "S": 12
        }
      },
      {
        "id": "pr",
        "type": "math/remap",
        "x": 900,
        "y": 680,
        "values": {
          "S0": 0,
          "S1": 1,
          "T0": 21,
          "T1": 26
        }
      },
      {
        "id": "plit",
        "type": "math/expr",
        "x": 1140,
        "y": 60,
        "values": {
          "expr": "X ? 1 : 0"
        }
      },
      {
        "id": "lit",
        "type": "math/masadd",
        "x": 1140,
        "y": 200,
        "label": "pads lit"
      },
      {
        "id": "phu",
        "type": "math/expr",
        "x": 1140,
        "y": 340,
        "values": {
          "expr": "Y + X * 0.012"
        }
      },
      {
        "id": "plum",
        "type": "math/expr",
        "x": 1140,
        "y": 480,
        "values": {
          "expr": "X ? 0.68 : 0.28"
        }
      },
      {
        "id": "prp",
        "type": "math/expr",
        "x": 1140,
        "y": 620,
        "values": {
          "expr": "X * 1.24"
        }
      },
      {
        "id": "pcirc",
        "type": "crv/circle",
        "x": 1380,
        "y": 60,
        "label": "unlit: a dot"
      },
      {
        "id": "ppoly",
        "type": "crv/polygon",
        "x": 1380,
        "y": 200,
        "values": {
          "A": 0.3
        },
        "label": "lit: the scene shape"
      },
      {
        "id": "psel",
        "type": "sets/select",
        "x": 1380,
        "y": 380,
        "label": "one shape or the other, per pad"
      },
      {
        "id": "pcol",
        "type": "disp/hsl",
        "x": 1380,
        "y": 540,
        "values": {
          "S": 0.75
        }
      },
      {
        "id": "pfill",
        "type": "disp/hsl",
        "x": 1380,
        "y": 680,
        "values": {
          "S": 0.75,
          "A": 0.35
        }
      },
      {
        "id": "pdraw",
        "type": "disp/draw",
        "x": 1620,
        "y": 300,
        "values": {
          "W": 2
        }
      },
      {
        "id": "disc",
        "type": "crv/circle",
        "x": 1900,
        "y": 60,
        "values": {
          "P": {
            "x": 0,
            "y": -56
          },
          "R": 166
        },
        "label": "the whole disc is the button"
      },
      {
        "id": "dhot",
        "type": "input/hotspot",
        "x": 1900,
        "y": 200
      },
      {
        "id": "dsm",
        "type": "state/smooth",
        "x": 1900,
        "y": 360,
        "values": {
          "S": 9
        }
      },
      {
        "id": "dalpha",
        "type": "math/remap",
        "x": 2140,
        "y": 60,
        "values": {
          "S0": 0,
          "S1": 1,
          "T0": 0.22,
          "T1": 0.55
        }
      },
      {
        "id": "dcol",
        "type": "disp/hsl",
        "x": 2140,
        "y": 220,
        "values": {
          "S": 0.5,
          "L": 0.62
        }
      },
      {
        "id": "ddraw",
        "type": "disp/draw",
        "x": 2140,
        "y": 380,
        "values": {
          "W": 1.5,
          "F": {
            "r": 255,
            "g": 255,
            "b": 255,
            "a": 0.025
          }
        }
      },
      {
        "id": "tm",
        "type": "input/time",
        "x": 60,
        "y": 960
      },
      {
        "id": "padsum",
        "type": "math/masadd",
        "x": 60,
        "y": 1090,
        "label": "any pad clicked"
      },
      {
        "id": "idle",
        "type": "params/slider",
        "x": 60,
        "y": 1220,
        "values": {
          "min": 2,
          "max": 20,
          "value": 6,
          "label": "idle seconds"
        }
      },
      {
        "id": "any1",
        "type": "math/logic",
        "x": 300,
        "y": 960,
        "values": {
          "mode": "or"
        }
      },
      {
        "id": "any2",
        "type": "math/logic",
        "x": 300,
        "y": 1100,
        "values": {
          "mode": "or"
        },
        "label": "you touched something"
      },
      {
        "id": "smp",
        "type": "state/sample",
        "x": 540,
        "y": 960,
        "label": "time of the last touch"
      },
      {
        "id": "since",
        "type": "math/sub",
        "x": 540,
        "y": 1100,
        "label": "seconds idle"
      },
      {
        "id": "tick",
        "type": "math/expr",
        "x": 540,
        "y": 1240,
        "values": {
          "expr": "floor(X / max(Y, 0.5))"
        }
      },
      {
        "id": "prv",
        "type": "state/prev",
        "x": 780,
        "y": 1240
      },
      {
        "id": "fire",
        "type": "math/cmp",
        "x": 780,
        "y": 1100,
        "values": {
          "mode": ">"
        },
        "label": "true for one frame"
      },
      {
        "id": "adv",
        "type": "math/logic",
        "x": 1020,
        "y": 1100,
        "values": {
          "mode": "or"
        },
        "label": "advance the scene"
      },
      {
        "id": "prog",
        "type": "math/expr",
        "x": 540,
        "y": 1380,
        "values": {
          "expr": "(X % max(Y, 0.5)) / max(Y, 0.5)"
        }
      },
      {
        "id": "a1",
        "type": "math/expr",
        "x": 780,
        "y": 1380,
        "values": {
          "expr": "-1.5708 + 6.28319 * X"
        }
      },
      {
        "id": "ring",
        "type": "crv/arc",
        "x": 1020,
        "y": 1380,
        "values": {
          "P": {
            "x": 0,
            "y": -56
          },
          "R": 180,
          "A0": -1.5708
        },
        "label": "countdown ring"
      },
      {
        "id": "rcol",
        "type": "disp/hsl",
        "x": 1020,
        "y": 1240,
        "values": {
          "S": 0.6,
          "L": 0.55,
          "A": 0.85
        }
      },
      {
        "id": "rdraw",
        "type": "disp/draw",
        "x": 1260,
        "y": 1320,
        "values": {
          "W": 3
        }
      },
      {
        "id": "hmul",
        "type": "math/expr",
        "x": 1540,
        "y": 960,
        "values": {
          "expr": "1 + X * 1.1"
        },
        "label": "a long hold spins it faster"
      },
      {
        "id": "spinr",
        "type": "math/mul",
        "x": 1540,
        "y": 1100
      },
      {
        "id": "tt",
        "type": "input/turntable",
        "x": 1540,
        "y": 1240,
        "label": "rate changes never jump"
      },
      {
        "id": "twist",
        "type": "params/slider",
        "x": 1540,
        "y": 1380,
        "values": {
          "min": 0,
          "max": 0.6,
          "value": 0.26,
          "label": "twist"
        }
      },
      {
        "id": "rings",
        "type": "math/expr",
        "x": 1780,
        "y": 960,
        "values": {
          "expr": "3 + X"
        },
        "label": "rings = 3 + lit pads"
      },
      {
        "id": "fser",
        "type": "sets/series",
        "x": 1780,
        "y": 1100,
        "values": {
          "S": 0,
          "N": 1
        }
      },
      {
        "id": "frad",
        "type": "math/expr",
        "x": 1780,
        "y": 1240,
        "values": {
          "expr": "150 * (1 - X / max(Y, 1) * 0.86)"
        },
        "label": "rings always fill the disc"
      },
      {
        "id": "fang",
        "type": "math/expr",
        "x": 2020,
        "y": 960,
        "values": {
          "expr": "X * Y + Z * 0.55"
        }
      },
      {
        "id": "fh",
        "type": "math/expr",
        "x": 2020,
        "y": 1100,
        "values": {
          "expr": "Y + X * 0.014"
        }
      },
      {
        "id": "fl",
        "type": "math/expr",
        "x": 2020,
        "y": 1240,
        "values": {
          "expr": "0.75 - X / max(Y, 1) * 0.3"
        }
      },
      {
        "id": "fig",
        "type": "crv/polygon",
        "x": 2260,
        "y": 960,
        "values": {
          "P": {
            "x": 0,
            "y": -56
          }
        }
      },
      {
        "id": "fcol",
        "type": "disp/hsl",
        "x": 2260,
        "y": 1120,
        "values": {
          "S": 0.72
        }
      },
      {
        "id": "fdraw",
        "type": "disp/draw",
        "x": 2260,
        "y": 1280,
        "values": {
          "W": 2
        }
      },
      {
        "id": "hrect",
        "type": "crv/rect",
        "x": 60,
        "y": 1680,
        "values": {
          "P": {
            "x": 0,
            "y": 262
          },
          "W": 250,
          "H": 26
        },
        "label": "press-and-hold bar"
      },
      {
        "id": "hhot",
        "type": "input/hotspot",
        "x": 60,
        "y": 1820
      },
      {
        "id": "hedge",
        "type": "state/edge",
        "x": 300,
        "y": 1820,
        "label": "press vs release"
      },
      {
        "id": "htim",
        "type": "state/timer",
        "x": 540,
        "y": 1820,
        "label": "runs only while held"
      },
      {
        "id": "hw",
        "type": "math/expr",
        "x": 780,
        "y": 1680,
        "values": {
          "expr": "max(3, min(X, 2.5) / 2.5 * 244)"
        }
      },
      {
        "id": "hcx",
        "type": "math/expr",
        "x": 780,
        "y": 1820,
        "values": {
          "expr": "X / 2 - 122"
        }
      },
      {
        "id": "hnum",
        "type": "math/expr",
        "x": 780,
        "y": 1960,
        "values": {
          "expr": "round(X * 100) / 100"
        }
      },
      {
        "id": "hpt",
        "type": "vec/construct",
        "x": 1020,
        "y": 1820,
        "values": {
          "Y": 262
        }
      },
      {
        "id": "hfill",
        "type": "crv/rect",
        "x": 1020,
        "y": 1680,
        "values": {
          "H": 20
        }
      },
      {
        "id": "htxt",
        "type": "disp/text",
        "x": 1020,
        "y": 1960,
        "values": {
          "P": {
            "x": 0,
            "y": 262
          },
          "S": 13
        }
      },
      {
        "id": "hcol",
        "type": "disp/hsl",
        "x": 1260,
        "y": 1680,
        "values": {
          "S": 0.7,
          "L": 0.5,
          "A": 0.5
        }
      },
      {
        "id": "hdraw",
        "type": "disp/draw",
        "x": 1260,
        "y": 1820,
        "values": {
          "S": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 0
          }
        }
      },
      {
        "id": "hbdraw",
        "type": "disp/draw",
        "x": 1260,
        "y": 1960,
        "values": {
          "S": {
            "r": 139,
            "g": 158,
            "b": 191,
            "a": 0.5
          },
          "W": 1.5
        }
      },
      {
        "id": "cap1",
        "type": "disp/text",
        "x": 1540,
        "y": 1680,
        "values": {
          "T": "click the disc · latch the pads · hold the bar",
          "P": {
            "x": 0,
            "y": -252
          },
          "S": 15
        }
      },
      {
        "id": "cap3",
        "type": "disp/text",
        "x": 1540,
        "y": 1820,
        "values": {
          "T": "hold the bar — press starts the Timer, release stops it",
          "P": {
            "x": 0,
            "y": 296
          },
          "S": 12
        }
      },
      {
        "id": "hintA",
        "type": "params/textlist",
        "x": 1540,
        "y": 1960,
        "values": {
          "text": "each lit pad adds a ring to the figure"
        }
      },
      {
        "id": "hintB",
        "type": "params/textlist",
        "x": 1540,
        "y": 2120,
        "values": {
          "text": "click a pad — one Latch node, one memory each"
        }
      },
      {
        "id": "hintsel",
        "type": "sets/select",
        "x": 1800,
        "y": 2040,
        "label": "the hint knows what you did"
      },
      {
        "id": "hinttxt",
        "type": "disp/text",
        "x": 1800,
        "y": 1900,
        "values": {
          "P": {
            "x": 0,
            "y": 232
          },
          "S": 12
        }
      },
      {
        "id": "nametxt",
        "type": "disp/text",
        "x": 1800,
        "y": 1680,
        "values": {
          "P": {
            "x": 0,
            "y": 138
          },
          "S": 18
        }
      },
      {
        "id": "namecol",
        "type": "disp/hsl",
        "x": 1800,
        "y": 1790,
        "values": {
          "S": 0.8,
          "L": 0.66
        }
      },
      {
        "id": "txtcol",
        "type": "disp/hsl",
        "x": 2060,
        "y": 1680,
        "values": {
          "S": 0.25,
          "L": 0.72,
          "A": 0.85
        }
      },
      {
        "id": "bgcol",
        "type": "disp/hsl",
        "x": 2060,
        "y": 1900,
        "values": {
          "S": 0.45,
          "L": 0.055
        }
      },
      {
        "id": "btn",
        "type": "input/button",
        "x": 2060,
        "y": 2100,
        "values": {
          "L": "reset",
          "P": {
            "x": 250,
            "y": 296
          }
        }
      },
      {
        "id": "capdraw",
        "type": "disp/draw",
        "x": 2300,
        "y": 1680
      },
      {
        "id": "namedraw",
        "type": "disp/draw",
        "x": 2300,
        "y": 1820
      },
      {
        "id": "bg",
        "type": "disp/bg",
        "x": 2300,
        "y": 1960
      }
    ],
    "wires": [
      {
        "from": [
          "sd_sides",
          "L"
        ],
        "to": [
          "it_sides",
          "L"
        ]
      },
      {
        "from": [
          "sd_hue",
          "L"
        ],
        "to": [
          "it_hue",
          "L"
        ]
      },
      {
        "from": [
          "sd_spin",
          "L"
        ],
        "to": [
          "it_spin",
          "L"
        ]
      },
      {
        "from": [
          "sd_name",
          "L"
        ],
        "to": [
          "it_name",
          "L"
        ]
      },
      {
        "from": [
          "cnt",
          "N"
        ],
        "to": [
          "it_sides",
          "i"
        ]
      },
      {
        "from": [
          "cnt",
          "N"
        ],
        "to": [
          "it_hue",
          "i"
        ]
      },
      {
        "from": [
          "cnt",
          "N"
        ],
        "to": [
          "it_spin",
          "i"
        ]
      },
      {
        "from": [
          "cnt",
          "N"
        ],
        "to": [
          "it_name",
          "i"
        ]
      },
      {
        "from": [
          "adv",
          "R"
        ],
        "to": [
          "cnt",
          "U"
        ]
      },
      {
        "from": [
          "btn",
          "C"
        ],
        "to": [
          "cnt",
          "R"
        ]
      },
      {
        "from": [
          "pn",
          "N"
        ],
        "to": [
          "pser",
          "C"
        ]
      },
      {
        "from": [
          "pn",
          "N"
        ],
        "to": [
          "px",
          "Y"
        ]
      },
      {
        "from": [
          "pser",
          "S"
        ],
        "to": [
          "px",
          "X"
        ]
      },
      {
        "from": [
          "px",
          "R"
        ],
        "to": [
          "ppt",
          "X"
        ]
      },
      {
        "from": [
          "ppt",
          "P"
        ],
        "to": [
          "phit",
          "P"
        ]
      },
      {
        "from": [
          "phit",
          "C"
        ],
        "to": [
          "phot",
          "G"
        ]
      },
      {
        "from": [
          "phot",
          "C"
        ],
        "to": [
          "plat",
          "T"
        ]
      },
      {
        "from": [
          "btn",
          "C"
        ],
        "to": [
          "plat",
          "R"
        ]
      },
      {
        "from": [
          "phot",
          "H"
        ],
        "to": [
          "psm",
          "V"
        ]
      },
      {
        "from": [
          "psm",
          "R"
        ],
        "to": [
          "pr",
          "V"
        ]
      },
      {
        "from": [
          "plat",
          "B"
        ],
        "to": [
          "plit",
          "X"
        ]
      },
      {
        "from": [
          "plit",
          "R"
        ],
        "to": [
          "lit",
          "L"
        ]
      },
      {
        "from": [
          "pser",
          "S"
        ],
        "to": [
          "phu",
          "X"
        ]
      },
      {
        "from": [
          "it_hue",
          "E"
        ],
        "to": [
          "phu",
          "Y"
        ]
      },
      {
        "from": [
          "plat",
          "B"
        ],
        "to": [
          "plum",
          "X"
        ]
      },
      {
        "from": [
          "pr",
          "R"
        ],
        "to": [
          "prp",
          "X"
        ]
      },
      {
        "from": [
          "ppt",
          "P"
        ],
        "to": [
          "pcirc",
          "P"
        ]
      },
      {
        "from": [
          "pr",
          "R"
        ],
        "to": [
          "pcirc",
          "R"
        ]
      },
      {
        "from": [
          "ppt",
          "P"
        ],
        "to": [
          "ppoly",
          "P"
        ]
      },
      {
        "from": [
          "prp",
          "R"
        ],
        "to": [
          "ppoly",
          "R"
        ]
      },
      {
        "from": [
          "it_sides",
          "E"
        ],
        "to": [
          "ppoly",
          "N"
        ]
      },
      {
        "from": [
          "ppoly",
          "C"
        ],
        "to": [
          "psel",
          "T"
        ]
      },
      {
        "from": [
          "pcirc",
          "C"
        ],
        "to": [
          "psel",
          "F"
        ]
      },
      {
        "from": [
          "plat",
          "B"
        ],
        "to": [
          "psel",
          "P"
        ]
      },
      {
        "from": [
          "phu",
          "R"
        ],
        "to": [
          "pcol",
          "H"
        ]
      },
      {
        "from": [
          "plum",
          "R"
        ],
        "to": [
          "pcol",
          "L"
        ]
      },
      {
        "from": [
          "phu",
          "R"
        ],
        "to": [
          "pfill",
          "H"
        ]
      },
      {
        "from": [
          "plum",
          "R"
        ],
        "to": [
          "pfill",
          "L"
        ]
      },
      {
        "from": [
          "psel",
          "L"
        ],
        "to": [
          "pdraw",
          "G"
        ]
      },
      {
        "from": [
          "pcol",
          "C"
        ],
        "to": [
          "pdraw",
          "S"
        ]
      },
      {
        "from": [
          "pfill",
          "C"
        ],
        "to": [
          "pdraw",
          "F"
        ]
      },
      {
        "from": [
          "disc",
          "C"
        ],
        "to": [
          "dhot",
          "G"
        ]
      },
      {
        "from": [
          "disc",
          "C"
        ],
        "to": [
          "ddraw",
          "G"
        ]
      },
      {
        "from": [
          "dhot",
          "H"
        ],
        "to": [
          "dsm",
          "V"
        ]
      },
      {
        "from": [
          "dsm",
          "R"
        ],
        "to": [
          "dalpha",
          "V"
        ]
      },
      {
        "from": [
          "it_hue",
          "E"
        ],
        "to": [
          "dcol",
          "H"
        ]
      },
      {
        "from": [
          "dalpha",
          "R"
        ],
        "to": [
          "dcol",
          "A"
        ]
      },
      {
        "from": [
          "dcol",
          "C"
        ],
        "to": [
          "ddraw",
          "S"
        ]
      },
      {
        "from": [
          "phot",
          "C"
        ],
        "to": [
          "padsum",
          "L"
        ]
      },
      {
        "from": [
          "dhot",
          "C"
        ],
        "to": [
          "any1",
          "A"
        ]
      },
      {
        "from": [
          "padsum",
          "R"
        ],
        "to": [
          "any1",
          "B"
        ]
      },
      {
        "from": [
          "any1",
          "R"
        ],
        "to": [
          "any2",
          "A"
        ]
      },
      {
        "from": [
          "hedge",
          "F"
        ],
        "to": [
          "any2",
          "B"
        ]
      },
      {
        "from": [
          "tm",
          "T"
        ],
        "to": [
          "smp",
          "V"
        ]
      },
      {
        "from": [
          "any2",
          "R"
        ],
        "to": [
          "smp",
          "T"
        ]
      },
      {
        "from": [
          "tm",
          "T"
        ],
        "to": [
          "since",
          "A"
        ]
      },
      {
        "from": [
          "smp",
          "R"
        ],
        "to": [
          "since",
          "B"
        ]
      },
      {
        "from": [
          "since",
          "R"
        ],
        "to": [
          "tick",
          "X"
        ]
      },
      {
        "from": [
          "idle",
          "N"
        ],
        "to": [
          "tick",
          "Y"
        ]
      },
      {
        "from": [
          "tick",
          "R"
        ],
        "to": [
          "prv",
          "V"
        ]
      },
      {
        "from": [
          "tick",
          "R"
        ],
        "to": [
          "fire",
          "A"
        ]
      },
      {
        "from": [
          "prv",
          "P"
        ],
        "to": [
          "fire",
          "B"
        ]
      },
      {
        "from": [
          "dhot",
          "C"
        ],
        "to": [
          "adv",
          "A"
        ]
      },
      {
        "from": [
          "fire",
          "R"
        ],
        "to": [
          "adv",
          "B"
        ]
      },
      {
        "from": [
          "since",
          "R"
        ],
        "to": [
          "prog",
          "X"
        ]
      },
      {
        "from": [
          "idle",
          "N"
        ],
        "to": [
          "prog",
          "Y"
        ]
      },
      {
        "from": [
          "prog",
          "R"
        ],
        "to": [
          "a1",
          "X"
        ]
      },
      {
        "from": [
          "a1",
          "R"
        ],
        "to": [
          "ring",
          "A1"
        ]
      },
      {
        "from": [
          "it_hue",
          "E"
        ],
        "to": [
          "rcol",
          "H"
        ]
      },
      {
        "from": [
          "ring",
          "C"
        ],
        "to": [
          "rdraw",
          "G"
        ]
      },
      {
        "from": [
          "rcol",
          "C"
        ],
        "to": [
          "rdraw",
          "S"
        ]
      },
      {
        "from": [
          "htim",
          "S"
        ],
        "to": [
          "hmul",
          "X"
        ]
      },
      {
        "from": [
          "it_spin",
          "E"
        ],
        "to": [
          "spinr",
          "A"
        ]
      },
      {
        "from": [
          "hmul",
          "R"
        ],
        "to": [
          "spinr",
          "B"
        ]
      },
      {
        "from": [
          "spinr",
          "R"
        ],
        "to": [
          "tt",
          "R"
        ]
      },
      {
        "from": [
          "lit",
          "R"
        ],
        "to": [
          "rings",
          "X"
        ]
      },
      {
        "from": [
          "rings",
          "R"
        ],
        "to": [
          "fser",
          "C"
        ]
      },
      {
        "from": [
          "fser",
          "S"
        ],
        "to": [
          "frad",
          "X"
        ]
      },
      {
        "from": [
          "rings",
          "R"
        ],
        "to": [
          "frad",
          "Y"
        ]
      },
      {
        "from": [
          "rings",
          "R"
        ],
        "to": [
          "fl",
          "Y"
        ]
      },
      {
        "from": [
          "fser",
          "S"
        ],
        "to": [
          "fang",
          "X"
        ]
      },
      {
        "from": [
          "twist",
          "N"
        ],
        "to": [
          "fang",
          "Y"
        ]
      },
      {
        "from": [
          "tt",
          "T"
        ],
        "to": [
          "fang",
          "Z"
        ]
      },
      {
        "from": [
          "fser",
          "S"
        ],
        "to": [
          "fh",
          "X"
        ]
      },
      {
        "from": [
          "it_hue",
          "E"
        ],
        "to": [
          "fh",
          "Y"
        ]
      },
      {
        "from": [
          "fser",
          "S"
        ],
        "to": [
          "fl",
          "X"
        ]
      },
      {
        "from": [
          "frad",
          "R"
        ],
        "to": [
          "fig",
          "R"
        ]
      },
      {
        "from": [
          "it_sides",
          "E"
        ],
        "to": [
          "fig",
          "N"
        ]
      },
      {
        "from": [
          "fang",
          "R"
        ],
        "to": [
          "fig",
          "A"
        ]
      },
      {
        "from": [
          "fh",
          "R"
        ],
        "to": [
          "fcol",
          "H"
        ]
      },
      {
        "from": [
          "fl",
          "R"
        ],
        "to": [
          "fcol",
          "L"
        ]
      },
      {
        "from": [
          "fig",
          "C"
        ],
        "to": [
          "fdraw",
          "G"
        ]
      },
      {
        "from": [
          "fcol",
          "C"
        ],
        "to": [
          "fdraw",
          "S"
        ]
      },
      {
        "from": [
          "hrect",
          "C"
        ],
        "to": [
          "hhot",
          "G"
        ]
      },
      {
        "from": [
          "hrect",
          "C"
        ],
        "to": [
          "hbdraw",
          "G"
        ]
      },
      {
        "from": [
          "hhot",
          "D"
        ],
        "to": [
          "hedge",
          "B"
        ]
      },
      {
        "from": [
          "hedge",
          "R"
        ],
        "to": [
          "htim",
          "T"
        ]
      },
      {
        "from": [
          "hedge",
          "F"
        ],
        "to": [
          "htim",
          "P"
        ]
      },
      {
        "from": [
          "htim",
          "S"
        ],
        "to": [
          "hw",
          "X"
        ]
      },
      {
        "from": [
          "hw",
          "R"
        ],
        "to": [
          "hcx",
          "X"
        ]
      },
      {
        "from": [
          "htim",
          "S"
        ],
        "to": [
          "hnum",
          "X"
        ]
      },
      {
        "from": [
          "hcx",
          "R"
        ],
        "to": [
          "hpt",
          "X"
        ]
      },
      {
        "from": [
          "hpt",
          "P"
        ],
        "to": [
          "hfill",
          "P"
        ]
      },
      {
        "from": [
          "hw",
          "R"
        ],
        "to": [
          "hfill",
          "W"
        ]
      },
      {
        "from": [
          "it_hue",
          "E"
        ],
        "to": [
          "hcol",
          "H"
        ]
      },
      {
        "from": [
          "hfill",
          "C"
        ],
        "to": [
          "hdraw",
          "G"
        ]
      },
      {
        "from": [
          "hcol",
          "C"
        ],
        "to": [
          "hdraw",
          "F"
        ]
      },
      {
        "from": [
          "hnum",
          "R"
        ],
        "to": [
          "htxt",
          "T"
        ]
      },
      {
        "from": [
          "hintA",
          "L"
        ],
        "to": [
          "hintsel",
          "T"
        ]
      },
      {
        "from": [
          "hintB",
          "L"
        ],
        "to": [
          "hintsel",
          "F"
        ]
      },
      {
        "from": [
          "lit",
          "R"
        ],
        "to": [
          "hintsel",
          "P"
        ]
      },
      {
        "from": [
          "hintsel",
          "L"
        ],
        "to": [
          "hinttxt",
          "T"
        ]
      },
      {
        "from": [
          "it_name",
          "E"
        ],
        "to": [
          "nametxt",
          "T"
        ]
      },
      {
        "from": [
          "it_hue",
          "E"
        ],
        "to": [
          "namecol",
          "H"
        ]
      },
      {
        "from": [
          "it_hue",
          "E"
        ],
        "to": [
          "txtcol",
          "H"
        ]
      },
      {
        "from": [
          "it_hue",
          "E"
        ],
        "to": [
          "bgcol",
          "H"
        ]
      },
      {
        "from": [
          "cap1",
          "G"
        ],
        "to": [
          "capdraw",
          "G"
        ]
      },
      {
        "from": [
          "hinttxt",
          "G"
        ],
        "to": [
          "capdraw",
          "G"
        ]
      },
      {
        "from": [
          "cap3",
          "G"
        ],
        "to": [
          "capdraw",
          "G"
        ]
      },
      {
        "from": [
          "htxt",
          "G"
        ],
        "to": [
          "capdraw",
          "G"
        ]
      },
      {
        "from": [
          "txtcol",
          "C"
        ],
        "to": [
          "capdraw",
          "S"
        ]
      },
      {
        "from": [
          "nametxt",
          "G"
        ],
        "to": [
          "namedraw",
          "G"
        ]
      },
      {
        "from": [
          "namecol",
          "C"
        ],
        "to": [
          "namedraw",
          "S"
        ]
      },
      {
        "from": [
          "bgcol",
          "C"
        ],
        "to": [
          "bg",
          "C"
        ]
      }
    ],
    "notes": [
      {
        "id": "t1",
        "x": 20,
        "y": -390,
        "w": 620,
        "h": 330,
        "text": "click toy — a machine made of memory\n\ndisc: every click advances the scene index (Counter). four scenes live in the Text Lists — sides, hue, spin, name — and one List Item reads all four, so geometry AND palette change together.\n\npads: ONE Hotspot + ONE Latch behind a list of circles = independent toggles, one memory each. lit pads take the scene's shape (Select) and add rings to the figure.\n\nring: seconds since you last touched anything. Sample & Hold remembers when that was; when the ring closes, the scene advances by itself.\n\nbar: Edge splits press from release — press starts a Timer, release stops it, and how long you held sets the spin rate.\n\nreset clears every latch and the scene index."
      }
    ],
    "groups": [
      {
        "id": "g1",
        "x": 20,
        "y": 10,
        "w": 560,
        "h": 800,
        "title": "four scenes on one index",
        "nodes": [
          "cnt",
          "sd_sides",
          "sd_hue",
          "sd_spin",
          "sd_name",
          "it_sides",
          "it_hue",
          "it_spin",
          "it_name"
        ]
      },
      {
        "id": "g2",
        "x": 620,
        "y": 10,
        "w": 1210,
        "h": 850,
        "title": "pad bank — one chain, N independent machines",
        "nodes": [
          "pn",
          "pser",
          "px",
          "ppt",
          "phit",
          "phot",
          "plat",
          "psm",
          "pr",
          "plit",
          "lit",
          "phu",
          "plum",
          "prp",
          "pcirc",
          "ppoly",
          "psel",
          "pcol",
          "pfill",
          "pdraw"
        ]
      },
      {
        "id": "g3",
        "x": 1860,
        "y": 10,
        "w": 500,
        "h": 540,
        "title": "the disc — one big click target",
        "nodes": [
          "disc",
          "dhot",
          "dsm",
          "dalpha",
          "dcol",
          "ddraw"
        ]
      },
      {
        "id": "g4",
        "x": 20,
        "y": 900,
        "w": 1460,
        "h": 660,
        "title": "idle clock — walk away and it advances itself",
        "nodes": [
          "tm",
          "padsum",
          "idle",
          "any1",
          "any2",
          "smp",
          "since",
          "tick",
          "prv",
          "fire",
          "adv",
          "prog",
          "a1",
          "ring",
          "rcol",
          "rdraw"
        ]
      },
      {
        "id": "g5",
        "x": 1500,
        "y": 900,
        "w": 990,
        "h": 660,
        "title": "the figure — shape, colour and spin of the scene",
        "nodes": [
          "hmul",
          "spinr",
          "tt",
          "twist",
          "rings",
          "fser",
          "frad",
          "fang",
          "fh",
          "fl",
          "fig",
          "fcol",
          "fdraw"
        ]
      },
      {
        "id": "g6",
        "x": 20,
        "y": 1620,
        "w": 1460,
        "h": 520,
        "title": "hold bar — press starts, release stops",
        "nodes": [
          "hrect",
          "hhot",
          "hedge",
          "htim",
          "hw",
          "hcx",
          "hnum",
          "hpt",
          "hfill",
          "htxt",
          "hcol",
          "hdraw",
          "hbdraw"
        ]
      },
      {
        "id": "g7",
        "x": 1500,
        "y": 1620,
        "w": 990,
        "h": 700,
        "title": "signposts, palette and reset",
        "nodes": [
          "cap1",
          "cap3",
          "hintA",
          "hintB",
          "hintsel",
          "hinttxt",
          "nametxt",
          "namecol",
          "txtcol",
          "bgcol",
          "btn",
          "capdraw",
          "namedraw",
          "bg"
        ]
      }
    ]
  },
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
    /* — the zodiac: twelve glyphs on the ecliptic ring, boundary ticks every
       30° of longitude — same frame as the orbits, so the planets really do
       transit the signs (angles negated for screen-y like everything else) — */
    ['za', 'params/textlist', 260, 1460, { text: '♈︎\n♉︎\n♊︎\n♋︎\n♌︎\n♍︎\n♎︎\n♏︎\n♐︎\n♑︎\n♒︎\n♓︎' }],
    ['zs', 'sets/series', 520, 2140, { S: 0, N: 1, C: 12 }],
    ['ze', 'math/expr', 740, 2140, { expr: '-(30 * X + 15) * PI / 180' }],
    ['zr', 'math/mul', 740, 2280, { B: 34 }],
    ['zp', 'vec/polar', 960, 2140],
    ['zt', 'disp/text', 1180, 2140, { S: 13 }],
    ['zd', 'disp/draw', 1400, 2140, { S: { r: 139, g: 158, b: 191, a: 0.5 } }],
    ['zk', 'math/expr', 520, 2300, { expr: '-(30 * X) * PI / 180' }],
    ['z31', 'math/mul', 520, 2440, { B: 32.4 }],
    ['z33', 'math/mul', 520, 2580, { B: 35.6 }],
    ['zq1', 'vec/polar', 740, 2440],
    ['zq2', 'vec/polar', 740, 2600],
    ['zl', 'crv/line', 960, 2500],
    ['zw', 'disp/draw', 1180, 2500, { S: { r: 110, g: 125, b: 160, a: 0.22 }, W: 1 }],
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
    ['c3', 'G', 'c4', 'G'],
    /* zodiac ring */
    ['zs', 'S', 'ze', 'X'],
    ['u1', 'N', 'zr', 'A'],
    ['ze', 'R', 'zp', 'A'], ['zr', 'R', 'zp', 'R'],
    ['za', 'L', 'zt', 'T'], ['zp', 'P', 'zt', 'P'],
    ['zt', 'G', 'zd', 'G'],
    ['zs', 'S', 'zk', 'X'],
    ['u1', 'N', 'z31', 'A'],
    ['u1', 'N', 'z33', 'A'],
    ['zk', 'R', 'zq1', 'A'], ['z31', 'R', 'zq1', 'R'],
    ['zk', 'R', 'zq2', 'A'], ['z33', 'R', 'zq2', 'R'],
    ['zq1', 'P', 'zl', 'A'], ['zq2', 'P', 'zl', 'B'],
    ['zl', 'C', 'zw', 'G']
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
          "N": 36
        },
        "label": "root"
      },
      {
        "id": "d2",
        "type": "params/number",
        "x": 30,
        "y": 1040,
        "values": {
          "N": 43
        },
        "label": "fifth"
      },
      {
        "id": "d3",
        "type": "params/number",
        "x": 30,
        "y": 1130,
        "values": {
          "N": 48
        },
        "label": "octave"
      },
      {
        "id": "d4",
        "type": "audio/scale",
        "x": 249,
        "y": 990,
        "values": {
          "root": 9,
          "scale": "pentatonic"
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
          "text": "root\nfifth\noctave"
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
      },
      {
        "id": "k1",
        "type": "audio/key",
        "x": -340,
        "y": 380,
        "values": {
          "root": 9,
          "scale": "pentatonic"
        },
        "label": "the key"
      },
      {
        "id": "k2",
        "type": "math/add",
        "x": 30,
        "y": 850,
        "values": {},
        "label": "transpose by key"
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
          "k2",
          "A"
        ]
      },
      {
        "id": "w25",
        "from": [
          "d2",
          "N"
        ],
        "to": [
          "k2",
          "A"
        ]
      },
      {
        "id": "w26",
        "from": [
          "d3",
          "N"
        ],
        "to": [
          "k2",
          "A"
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
      },
      {
        "id": "w91",
        "from": [
          "k1",
          "R"
        ],
        "to": [
          "k2",
          "B"
        ]
      },
      {
        "id": "w92",
        "from": [
          "k2",
          "R"
        ],
        "to": [
          "d4",
          "V"
        ]
      },
      {
        "id": "w93",
        "from": [
          "k1",
          "R"
        ],
        "to": [
          "s2",
          "R"
        ]
      },
      {
        "id": "w94",
        "from": [
          "k1",
          "S"
        ],
        "to": [
          "s2",
          "S"
        ]
      },
      {
        "id": "w95",
        "from": [
          "k1",
          "R"
        ],
        "to": [
          "v3",
          "R"
        ]
      },
      {
        "id": "w96",
        "from": [
          "k1",
          "S"
        ],
        "to": [
          "v3",
          "S"
        ]
      },
      {
        "id": "w97",
        "from": [
          "k1",
          "R"
        ],
        "to": [
          "d4",
          "R"
        ]
      },
      {
        "id": "w98",
        "from": [
          "k1",
          "S"
        ],
        "to": [
          "d4",
          "S"
        ]
      }
    ],
    "groups": [
      {
        "id": "g1",
        "x": -366,
        "y": 330,
        "w": 222,
        "h": 176,
        "title": "one key, whole board",
        "nodes": [
          "k1"
        ]
      }
    ]
  },

  /* One sound, seen four ways. Two sliders are the whole instrument: a note
   * snapped into key, and an interval above it. The interval becomes a ratio
   * r, and r becomes k = (r+1)/(r−1) — which is at once the petal count of
   * the rose and the pendulum ratio (k−1):(k+1) of the harmonograph, because
   * a k-rose IS two partials at that ratio. A perfect fifth is a five-petal
   * flower and a 2:3 Lissajous; an octave is three petals and a figure eight.
   * Four rectangles go into ONE Hotspot (state is per list item, so each is
   * its own button); each contributes its own number 1–4 to a Mass Addition
   * when clicked, so the sum IS the tab pressed, and 0 when nothing is. A
   * Select keeps that number or falls back through a Delay to last frame's —
   * the one legal feedback edge, and the entire memory of the patch, whose
   * initial value 1 is why the Chladni plate is what you see first. Hiding
   * comes in two flavours: the wave and the flower are ordinary geometry, so
   * a Select with nothing wired into F empties the list and Draw skips it
   * (the flower's Path to Audio falls silent by the same wire — no geometry,
   * no sound); the plate and the pendulum draw themselves, so they can only
   * be hidden by taking their colour's alpha to zero, which means the sand
   * keeps settling while you are away. */
  'Seeing Sound': {
    "format": 2,
    "nodes": [
      {
        "id": "f1",
        "type": "params/slider",
        "x": 30,
        "y": 40,
        "values": {
          "min": 40,
          "max": 76,
          "value": 57,
          "mode": "int",
          "label": "note"
        },
        "label": "the note"
      },
      {
        "id": "f3",
        "type": "params/slider",
        "x": 30,
        "y": 190,
        "values": {
          "min": 3,
          "max": 12,
          "value": 7,
          "mode": "int",
          "label": "interval"
        },
        "label": "the interval (semitones)"
      },
      {
        "id": "f2",
        "type": "audio/scale",
        "x": 260,
        "y": 40,
        "values": {
          "root": 9,
          "scale": "pentatonic"
        },
        "label": "snapped into key"
      },
      {
        "id": "f4",
        "type": "math/expr",
        "x": 260,
        "y": 210,
        "values": {
          "expr": "pow(2, X/12)"
        },
        "label": "ratio r"
      },
      {
        "id": "f5",
        "type": "math/mul",
        "x": 490,
        "y": 40,
        "values": {},
        "label": "upper voice Hz"
      },
      {
        "id": "k1",
        "type": "math/expr",
        "x": 490,
        "y": 210,
        "values": {
          "expr": "(X+1)/(X-1)"
        },
        "label": "k = (r+1)/(r-1)"
      },
      {
        "id": "k2",
        "type": "math/round",
        "x": 720,
        "y": 210,
        "values": {},
        "label": "petal count k"
      },
      {
        "id": "k3",
        "type": "math/sub",
        "x": 950,
        "y": 150,
        "values": {
          "B": 1
        },
        "label": "k-1"
      },
      {
        "id": "k4",
        "type": "math/add",
        "x": 950,
        "y": 280,
        "values": {
          "B": 1
        },
        "label": "k+1"
      },
      {
        "id": "v1",
        "type": "audio/osc",
        "x": 720,
        "y": -80,
        "values": {
          "wave": "sine"
        },
        "label": "lower voice"
      },
      {
        "id": "v2",
        "type": "audio/osc",
        "x": 720,
        "y": 40,
        "values": {
          "wave": "sine",
          "D": 2
        },
        "label": "upper voice"
      },
      {
        "id": "v3",
        "type": "audio/mix",
        "x": 950,
        "y": -60,
        "values": {
          "G": 0.5
        }
      },
      {
        "id": "v4",
        "type": "audio/gain",
        "x": 1180,
        "y": -60,
        "values": {
          "G": 0.09
        }
      },
      {
        "id": "p1",
        "type": "math/cmp",
        "x": 1410,
        "y": 480,
        "values": {
          "mode": "=",
          "B": 1
        },
        "label": "on tab 1?"
      },
      {
        "id": "p2",
        "type": "math/mul",
        "x": 1640,
        "y": 480,
        "values": {
          "B": 0.9
        },
        "label": "alpha: 0.9 or nothing"
      },
      {
        "id": "p3",
        "type": "disp/hsl",
        "x": 1870,
        "y": 480,
        "values": {
          "H": 0.47,
          "S": 0.75,
          "L": 0.62
        }
      },
      {
        "id": "p4",
        "type": "disp/cymatics",
        "x": 2100,
        "y": 480,
        "values": {
          "S": 400,
          "N": 1500,
          "W": 1.1,
          "P": {
            "x": 0,
            "y": -20
          }
        },
        "label": "the plate"
      },
      {
        "id": "h1",
        "type": "math/cmp",
        "x": 1410,
        "y": 700,
        "values": {
          "mode": "=",
          "B": 2
        },
        "label": "on tab 2?"
      },
      {
        "id": "h2",
        "type": "math/mul",
        "x": 1640,
        "y": 700,
        "values": {
          "B": 0.85
        },
        "label": "alpha: 0.85 or nothing"
      },
      {
        "id": "h3",
        "type": "disp/hsl",
        "x": 1870,
        "y": 700,
        "values": {
          "H": 0.62,
          "S": 0.7,
          "L": 0.7
        }
      },
      {
        "id": "hT",
        "type": "input/time",
        "x": 1410,
        "y": 840,
        "values": {}
      },
      {
        "id": "h5",
        "type": "math/mul",
        "x": 1640,
        "y": 840,
        "values": {
          "B": 0.22
        },
        "label": "phase drift"
      },
      {
        "id": "h6",
        "type": "params/slider",
        "x": 1410,
        "y": 960,
        "values": {
          "min": 0,
          "max": 0.2,
          "value": 0.055,
          "label": "damping"
        }
      },
      {
        "id": "h7",
        "type": "disp/harmonograph",
        "x": 2100,
        "y": 700,
        "values": {
          "S": 400,
          "T": 30,
          "P": {
            "x": 0,
            "y": -20
          }
        },
        "label": "pendulums (k-1):(k+1)"
      },
      {
        "id": "w1",
        "type": "math/cmp",
        "x": 1410,
        "y": 1100,
        "values": {
          "mode": "=",
          "B": 3
        },
        "label": "on tab 3?"
      },
      {
        "id": "w2",
        "type": "sets/range",
        "x": 1410,
        "y": 1230,
        "values": {
          "A": 0,
          "B": 1,
          "N": 400
        },
        "label": "u across the window"
      },
      {
        "id": "w3",
        "type": "math/mul",
        "x": 1640,
        "y": 1100,
        "values": {
          "B": 0.025
        },
        "label": "cycles in view"
      },
      {
        "id": "w4",
        "type": "math/mul",
        "x": 1640,
        "y": 1230,
        "values": {},
        "label": "and r times as many"
      },
      {
        "id": "w5",
        "type": "math/expr",
        "x": 1870,
        "y": 1100,
        "values": {
          "expr": "sin(6.2832*(X*Y + T*2.2))"
        },
        "label": "lower voice"
      },
      {
        "id": "w6",
        "type": "math/expr",
        "x": 1870,
        "y": 1230,
        "values": {
          "expr": "sin(6.2832*(X*Y + T*2.2))"
        },
        "label": "upper voice"
      },
      {
        "id": "w7",
        "type": "math/add",
        "x": 2100,
        "y": 1160,
        "values": {},
        "label": "the two voices add"
      },
      {
        "id": "w8",
        "type": "math/expr",
        "x": 2330,
        "y": 1160,
        "values": {
          "expr": "X * -52 - 20"
        },
        "label": "to px, y-up"
      },
      {
        "id": "w9",
        "type": "math/remap",
        "x": 2100,
        "y": 1320,
        "values": {
          "S0": 0,
          "S1": 1,
          "T0": -350,
          "T1": 350
        }
      },
      {
        "id": "w10",
        "type": "vec/construct",
        "x": 2560,
        "y": 1230,
        "values": {}
      },
      {
        "id": "w11",
        "type": "crv/polyline",
        "x": 2790,
        "y": 1230,
        "values": {
          "C": false
        }
      },
      {
        "id": "w13",
        "type": "disp/hsl",
        "x": 2790,
        "y": 1370,
        "values": {
          "H": 0.13,
          "S": 0.85,
          "L": 0.66
        }
      },
      {
        "id": "w12",
        "type": "sets/select",
        "x": 3020,
        "y": 1230,
        "values": {},
        "label": "gate: nothing wired into F"
      },
      {
        "id": "w14",
        "type": "disp/draw",
        "x": 3250,
        "y": 1230,
        "values": {
          "W": 1.6
        }
      },
      {
        "id": "r1",
        "type": "sets/range",
        "x": 1410,
        "y": 1520,
        "values": {
          "A": 0,
          "B": 6.28319,
          "N": 511
        },
        "label": "theta, once round"
      },
      {
        "id": "r14",
        "type": "math/cmp",
        "x": 1410,
        "y": 1670,
        "values": {
          "mode": "=",
          "B": 4
        },
        "label": "on tab 4?"
      },
      {
        "id": "r2",
        "type": "math/mul",
        "x": 1640,
        "y": 1520,
        "values": {},
        "label": "k * theta"
      },
      {
        "id": "r4",
        "type": "math/cos",
        "x": 1640,
        "y": 1650,
        "values": {}
      },
      {
        "id": "r5",
        "type": "math/sin",
        "x": 1640,
        "y": 1770,
        "values": {}
      },
      {
        "id": "r3",
        "type": "math/cos",
        "x": 1870,
        "y": 1520,
        "values": {},
        "label": "r = cos(k*theta)"
      },
      {
        "id": "r6",
        "type": "math/mul",
        "x": 2100,
        "y": 1520,
        "values": {}
      },
      {
        "id": "r7",
        "type": "math/mul",
        "x": 2100,
        "y": 1650,
        "values": {}
      },
      {
        "id": "r8",
        "type": "math/mul",
        "x": 2330,
        "y": 1520,
        "values": {
          "B": 188
        }
      },
      {
        "id": "r9",
        "type": "math/mul",
        "x": 2330,
        "y": 1650,
        "values": {
          "B": 188
        }
      },
      {
        "id": "r10",
        "type": "vec/construct",
        "x": 2560,
        "y": 1580,
        "values": {}
      },
      {
        "id": "r11",
        "type": "crv/polyline",
        "x": 2790,
        "y": 1580,
        "values": {
          "C": true
        }
      },
      {
        "id": "r12",
        "type": "xf/move",
        "x": 3020,
        "y": 1580,
        "values": {
          "T": {
            "x": 0,
            "y": -20
          }
        }
      },
      {
        "id": "r15",
        "type": "disp/hsl",
        "x": 3020,
        "y": 1740,
        "values": {
          "H": 0.92,
          "S": 0.72,
          "L": 0.7
        }
      },
      {
        "id": "r13",
        "type": "sets/select",
        "x": 3250,
        "y": 1580,
        "values": {},
        "label": "gate: nothing wired into F"
      },
      {
        "id": "r16",
        "type": "disp/draw",
        "x": 3480,
        "y": 1580,
        "values": {
          "W": 1.6
        }
      },
      {
        "id": "r17",
        "type": "audio/path",
        "x": 3480,
        "y": 1740,
        "values": {},
        "label": "the flower sings itself"
      },
      {
        "id": "r18",
        "type": "audio/gain",
        "x": 3710,
        "y": 1740,
        "values": {
          "G": 0.06
        }
      },
      {
        "id": "v5",
        "type": "audio/out",
        "x": 3940,
        "y": 1740,
        "values": {
          "V": 0.8
        },
        "label": "click once to let sound in"
      },
      {
        "id": "t1",
        "type": "sets/series",
        "x": 30,
        "y": 2060,
        "values": {
          "S": -258,
          "N": 172,
          "C": 4
        },
        "label": "four tab positions"
      },
      {
        "id": "t5",
        "type": "sets/series",
        "x": 30,
        "y": 2210,
        "values": {
          "S": 1,
          "N": 1,
          "C": 4
        },
        "label": "tab numbers 1-4"
      },
      {
        "id": "t2",
        "type": "vec/construct",
        "x": 260,
        "y": 2060,
        "values": {
          "Y": 250
        }
      },
      {
        "id": "t3",
        "type": "crv/rect",
        "x": 490,
        "y": 2060,
        "values": {
          "W": 158,
          "H": 36
        },
        "label": "the four tabs"
      },
      {
        "id": "t4",
        "type": "input/hotspot",
        "x": 720,
        "y": 2060,
        "values": {},
        "label": "one hotspot, four buttons"
      },
      {
        "id": "t6",
        "type": "math/expr",
        "x": 950,
        "y": 2210,
        "values": {
          "expr": "Y > 0.5 ? X : 0"
        },
        "label": "my number, if I was clicked"
      },
      {
        "id": "t7",
        "type": "math/masadd",
        "x": 1180,
        "y": 2210,
        "values": {},
        "label": "the sum IS the tab pressed"
      },
      {
        "id": "t8",
        "type": "math/cmp",
        "x": 1410,
        "y": 2210,
        "values": {
          "mode": ">",
          "B": 0
        },
        "label": "anything pressed at all?"
      },
      {
        "id": "t9",
        "type": "sets/select",
        "x": 1640,
        "y": 2210,
        "values": {},
        "label": "the new tab, or the old one"
      },
      {
        "id": "t10",
        "type": "state/delay",
        "x": 1410,
        "y": 2360,
        "values": {
          "I": 1
        },
        "label": "memory - starts on tab 1"
      },
      {
        "id": "t11",
        "type": "params/relay",
        "x": 1180,
        "y": 2480,
        "values": {},
        "label": "active view"
      },
      {
        "id": "t12",
        "type": "math/expr",
        "x": 1410,
        "y": 2610,
        "values": {
          "expr": "X == Y ? 1 : (Z > 0.5 ? 0.5 : 0.22)"
        },
        "label": "lit / hovered / resting"
      },
      {
        "id": "t13",
        "type": "disp/hsl",
        "x": 1640,
        "y": 2610,
        "values": {
          "H": 0.5,
          "S": 0.3,
          "L": 0.88
        }
      },
      {
        "id": "t15",
        "type": "math/expr",
        "x": 1410,
        "y": 2750,
        "values": {
          "expr": "X == Y ? 0.18 : 0.04"
        },
        "label": "fill of the live tab"
      },
      {
        "id": "t16",
        "type": "disp/hsl",
        "x": 1640,
        "y": 2750,
        "values": {
          "H": 0.5,
          "S": 0.55,
          "L": 0.6
        }
      },
      {
        "id": "t14",
        "type": "disp/draw",
        "x": 1870,
        "y": 2610,
        "values": {
          "W": 1.2
        }
      },
      {
        "id": "t17",
        "type": "params/textlist",
        "x": 1180,
        "y": 2890,
        "values": {
          "text": "plate\npendulum\nwave\nflower"
        }
      },
      {
        "id": "t18",
        "type": "disp/text",
        "x": 1640,
        "y": 2890,
        "values": {
          "S": 15
        }
      },
      {
        "id": "t19",
        "type": "disp/draw",
        "x": 1870,
        "y": 2890,
        "values": {
          "W": 1
        }
      },
      {
        "id": "x1",
        "type": "disp/text",
        "x": 2400,
        "y": 2060,
        "values": {
          "T": "seeing sound",
          "S": 20,
          "P": {
            "x": 0,
            "y": -272
          }
        }
      },
      {
        "id": "x2",
        "type": "math/round",
        "x": 2400,
        "y": 2210,
        "values": {},
        "label": "Hz, rounded"
      },
      {
        "id": "x3",
        "type": "disp/text",
        "x": 2630,
        "y": 2210,
        "values": {
          "S": 13,
          "P": {
            "x": 0,
            "y": -246
          }
        }
      },
      {
        "id": "x4",
        "type": "disp/hsl",
        "x": 2630,
        "y": 2350,
        "values": {
          "H": 0.5,
          "S": 0.15,
          "L": 0.78,
          "A": 0.55
        }
      },
      {
        "id": "x5",
        "type": "disp/draw",
        "x": 2860,
        "y": 2060,
        "values": {
          "W": 1
        }
      },
      {
        "id": "bg",
        "type": "disp/bg",
        "x": 2860,
        "y": 2210,
        "values": {
          "C": {
            "r": 8,
            "g": 10,
            "b": 15,
            "a": 1
          }
        }
      }
    ],
    "wires": [
      {
        "from": [
          "f1",
          "N"
        ],
        "to": [
          "f2",
          "V"
        ]
      },
      {
        "from": [
          "f3",
          "N"
        ],
        "to": [
          "f4",
          "X"
        ]
      },
      {
        "from": [
          "f2",
          "F"
        ],
        "to": [
          "f5",
          "A"
        ]
      },
      {
        "from": [
          "f4",
          "R"
        ],
        "to": [
          "f5",
          "B"
        ]
      },
      {
        "from": [
          "f4",
          "R"
        ],
        "to": [
          "k1",
          "X"
        ]
      },
      {
        "from": [
          "k1",
          "R"
        ],
        "to": [
          "k2",
          "V"
        ]
      },
      {
        "from": [
          "k2",
          "R"
        ],
        "to": [
          "k3",
          "A"
        ]
      },
      {
        "from": [
          "k2",
          "R"
        ],
        "to": [
          "k4",
          "A"
        ]
      },
      {
        "from": [
          "f2",
          "F"
        ],
        "to": [
          "v1",
          "F"
        ]
      },
      {
        "from": [
          "f5",
          "R"
        ],
        "to": [
          "v2",
          "F"
        ]
      },
      {
        "from": [
          "v1",
          "A"
        ],
        "to": [
          "v3",
          "In"
        ]
      },
      {
        "from": [
          "v2",
          "A"
        ],
        "to": [
          "v3",
          "In"
        ]
      },
      {
        "from": [
          "v3",
          "A"
        ],
        "to": [
          "v4",
          "In"
        ]
      },
      {
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
        "from": [
          "t11",
          "V"
        ],
        "to": [
          "p1",
          "A"
        ]
      },
      {
        "from": [
          "p1",
          "R"
        ],
        "to": [
          "p2",
          "A"
        ]
      },
      {
        "from": [
          "p2",
          "R"
        ],
        "to": [
          "p3",
          "A"
        ]
      },
      {
        "from": [
          "p3",
          "C"
        ],
        "to": [
          "p4",
          "C"
        ]
      },
      {
        "from": [
          "f2",
          "F"
        ],
        "to": [
          "p4",
          "F"
        ]
      },
      {
        "from": [
          "t11",
          "V"
        ],
        "to": [
          "h1",
          "A"
        ]
      },
      {
        "from": [
          "h1",
          "R"
        ],
        "to": [
          "h2",
          "A"
        ]
      },
      {
        "from": [
          "h2",
          "R"
        ],
        "to": [
          "h3",
          "A"
        ]
      },
      {
        "from": [
          "hT",
          "T"
        ],
        "to": [
          "h5",
          "A"
        ]
      },
      {
        "from": [
          "k3",
          "R"
        ],
        "to": [
          "h7",
          "X"
        ]
      },
      {
        "from": [
          "k4",
          "R"
        ],
        "to": [
          "h7",
          "Y"
        ]
      },
      {
        "from": [
          "h5",
          "R"
        ],
        "to": [
          "h7",
          "H"
        ]
      },
      {
        "from": [
          "h6",
          "N"
        ],
        "to": [
          "h7",
          "D"
        ]
      },
      {
        "from": [
          "h3",
          "C"
        ],
        "to": [
          "h7",
          "C"
        ]
      },
      {
        "from": [
          "t11",
          "V"
        ],
        "to": [
          "w1",
          "A"
        ]
      },
      {
        "from": [
          "f2",
          "F"
        ],
        "to": [
          "w3",
          "A"
        ]
      },
      {
        "from": [
          "w3",
          "R"
        ],
        "to": [
          "w4",
          "A"
        ]
      },
      {
        "from": [
          "f4",
          "R"
        ],
        "to": [
          "w4",
          "B"
        ]
      },
      {
        "from": [
          "w2",
          "R"
        ],
        "to": [
          "w5",
          "X"
        ]
      },
      {
        "from": [
          "w3",
          "R"
        ],
        "to": [
          "w5",
          "Y"
        ]
      },
      {
        "from": [
          "w2",
          "R"
        ],
        "to": [
          "w6",
          "X"
        ]
      },
      {
        "from": [
          "w4",
          "R"
        ],
        "to": [
          "w6",
          "Y"
        ]
      },
      {
        "from": [
          "w5",
          "R"
        ],
        "to": [
          "w7",
          "A"
        ]
      },
      {
        "from": [
          "w6",
          "R"
        ],
        "to": [
          "w7",
          "B"
        ]
      },
      {
        "from": [
          "w7",
          "R"
        ],
        "to": [
          "w8",
          "X"
        ]
      },
      {
        "from": [
          "w2",
          "R"
        ],
        "to": [
          "w9",
          "V"
        ]
      },
      {
        "from": [
          "w9",
          "R"
        ],
        "to": [
          "w10",
          "X"
        ]
      },
      {
        "from": [
          "w8",
          "R"
        ],
        "to": [
          "w10",
          "Y"
        ]
      },
      {
        "from": [
          "w10",
          "P"
        ],
        "to": [
          "w11",
          "V"
        ]
      },
      {
        "from": [
          "w11",
          "C"
        ],
        "to": [
          "w12",
          "T"
        ]
      },
      {
        "from": [
          "w1",
          "R"
        ],
        "to": [
          "w12",
          "P"
        ]
      },
      {
        "from": [
          "w12",
          "L"
        ],
        "to": [
          "w14",
          "G"
        ]
      },
      {
        "from": [
          "w13",
          "C"
        ],
        "to": [
          "w14",
          "S"
        ]
      },
      {
        "from": [
          "t11",
          "V"
        ],
        "to": [
          "r14",
          "A"
        ]
      },
      {
        "from": [
          "r1",
          "R"
        ],
        "to": [
          "r2",
          "A"
        ]
      },
      {
        "from": [
          "k2",
          "R"
        ],
        "to": [
          "r2",
          "B"
        ]
      },
      {
        "from": [
          "r2",
          "R"
        ],
        "to": [
          "r3",
          "V"
        ]
      },
      {
        "from": [
          "r1",
          "R"
        ],
        "to": [
          "r4",
          "V"
        ]
      },
      {
        "from": [
          "r1",
          "R"
        ],
        "to": [
          "r5",
          "V"
        ]
      },
      {
        "from": [
          "r3",
          "R"
        ],
        "to": [
          "r6",
          "A"
        ]
      },
      {
        "from": [
          "r4",
          "R"
        ],
        "to": [
          "r6",
          "B"
        ]
      },
      {
        "from": [
          "r3",
          "R"
        ],
        "to": [
          "r7",
          "A"
        ]
      },
      {
        "from": [
          "r5",
          "R"
        ],
        "to": [
          "r7",
          "B"
        ]
      },
      {
        "from": [
          "r6",
          "R"
        ],
        "to": [
          "r8",
          "A"
        ]
      },
      {
        "from": [
          "r7",
          "R"
        ],
        "to": [
          "r9",
          "A"
        ]
      },
      {
        "from": [
          "r8",
          "R"
        ],
        "to": [
          "r10",
          "X"
        ]
      },
      {
        "from": [
          "r9",
          "R"
        ],
        "to": [
          "r10",
          "Y"
        ]
      },
      {
        "from": [
          "r10",
          "P"
        ],
        "to": [
          "r11",
          "V"
        ]
      },
      {
        "from": [
          "r11",
          "C"
        ],
        "to": [
          "r12",
          "G"
        ]
      },
      {
        "from": [
          "r12",
          "G"
        ],
        "to": [
          "r13",
          "T"
        ]
      },
      {
        "from": [
          "r14",
          "R"
        ],
        "to": [
          "r13",
          "P"
        ]
      },
      {
        "from": [
          "r13",
          "L"
        ],
        "to": [
          "r16",
          "G"
        ]
      },
      {
        "from": [
          "r15",
          "C"
        ],
        "to": [
          "r16",
          "S"
        ]
      },
      {
        "from": [
          "r13",
          "L"
        ],
        "to": [
          "r17",
          "G"
        ]
      },
      {
        "from": [
          "f2",
          "F"
        ],
        "to": [
          "r17",
          "F"
        ]
      },
      {
        "from": [
          "r17",
          "X"
        ],
        "to": [
          "r18",
          "In"
        ]
      },
      {
        "from": [
          "r18",
          "A"
        ],
        "to": [
          "v5",
          "In"
        ]
      },
      {
        "from": [
          "t1",
          "S"
        ],
        "to": [
          "t2",
          "X"
        ]
      },
      {
        "from": [
          "t2",
          "P"
        ],
        "to": [
          "t3",
          "P"
        ]
      },
      {
        "from": [
          "t3",
          "C"
        ],
        "to": [
          "t4",
          "G"
        ]
      },
      {
        "from": [
          "t5",
          "S"
        ],
        "to": [
          "t6",
          "X"
        ]
      },
      {
        "from": [
          "t4",
          "C"
        ],
        "to": [
          "t6",
          "Y"
        ]
      },
      {
        "from": [
          "t6",
          "R"
        ],
        "to": [
          "t7",
          "L"
        ]
      },
      {
        "from": [
          "t7",
          "R"
        ],
        "to": [
          "t8",
          "A"
        ]
      },
      {
        "from": [
          "t7",
          "R"
        ],
        "to": [
          "t9",
          "T"
        ]
      },
      {
        "from": [
          "t10",
          "V"
        ],
        "to": [
          "t9",
          "F"
        ]
      },
      {
        "from": [
          "t8",
          "R"
        ],
        "to": [
          "t9",
          "P"
        ]
      },
      {
        "from": [
          "t9",
          "L"
        ],
        "to": [
          "t10",
          "V"
        ]
      },
      {
        "from": [
          "t9",
          "L"
        ],
        "to": [
          "t11",
          "V"
        ]
      },
      {
        "from": [
          "t5",
          "S"
        ],
        "to": [
          "t12",
          "X"
        ]
      },
      {
        "from": [
          "t11",
          "V"
        ],
        "to": [
          "t12",
          "Y"
        ]
      },
      {
        "from": [
          "t4",
          "H"
        ],
        "to": [
          "t12",
          "Z"
        ]
      },
      {
        "from": [
          "t12",
          "R"
        ],
        "to": [
          "t13",
          "A"
        ]
      },
      {
        "from": [
          "t5",
          "S"
        ],
        "to": [
          "t15",
          "X"
        ]
      },
      {
        "from": [
          "t11",
          "V"
        ],
        "to": [
          "t15",
          "Y"
        ]
      },
      {
        "from": [
          "t15",
          "R"
        ],
        "to": [
          "t16",
          "A"
        ]
      },
      {
        "from": [
          "t3",
          "C"
        ],
        "to": [
          "t14",
          "G"
        ]
      },
      {
        "from": [
          "t13",
          "C"
        ],
        "to": [
          "t14",
          "S"
        ]
      },
      {
        "from": [
          "t16",
          "C"
        ],
        "to": [
          "t14",
          "F"
        ]
      },
      {
        "from": [
          "t17",
          "L"
        ],
        "to": [
          "t18",
          "T"
        ]
      },
      {
        "from": [
          "t2",
          "P"
        ],
        "to": [
          "t18",
          "P"
        ]
      },
      {
        "from": [
          "t18",
          "G"
        ],
        "to": [
          "t19",
          "G"
        ]
      },
      {
        "from": [
          "t13",
          "C"
        ],
        "to": [
          "t19",
          "S"
        ]
      },
      {
        "from": [
          "f2",
          "F"
        ],
        "to": [
          "x2",
          "V"
        ]
      },
      {
        "from": [
          "x2",
          "R"
        ],
        "to": [
          "x3",
          "T"
        ]
      },
      {
        "from": [
          "x1",
          "G"
        ],
        "to": [
          "x5",
          "G"
        ]
      },
      {
        "from": [
          "x3",
          "G"
        ],
        "to": [
          "x5",
          "G"
        ]
      },
      {
        "from": [
          "x4",
          "C"
        ],
        "to": [
          "x5",
          "S"
        ]
      }
    ],
    "notes": [
      {
        "id": "note1",
        "x": 30,
        "y": 430,
        "w": 340,
        "h": 250,
        "text": "one sound, four ways\n\nTwo sliders make the whole patch. The note snaps into key and becomes a frequency; the interval becomes a ratio r, and r becomes k = (r+1)/(r-1).\n\nThat k is the petal count of the flower AND the pendulum ratio (k-1):(k+1) of the harmonograph — a perfect fifth is a five-petal rose. Move either slider and all four views change together, because there is only one sound to change."
      },
      {
        "id": "note2",
        "x": 2400,
        "y": 2560,
        "w": 340,
        "h": 300,
        "text": "the tabs, wired\n\nFour rectangles go into ONE Hotspot, so each is its own button (state is per list item). Each tab contributes its own number 1-4 to a sum when clicked — so the sum IS the tab you pressed, and 0 when you press nothing.\n\nSelect keeps that number, or falls back to last frame's through the Delay: the one legal feedback edge, and the entire memory of this patch. Its initial value is 1, which is why the plate is what you see before you touch anything."
      },
      {
        "id": "note3",
        "x": 2790,
        "y": 2560,
        "w": 340,
        "h": 300,
        "text": "two ways to hide a view\n\nThe wave and the flower are ordinary geometry, so they pass through a Select with NOTHING wired into F. Off means an empty list, and Draw skips an empty list silently. The flower's Path to Audio goes quiet the same way — no geometry, no sound.\n\nThe plate and the pendulum are display instruments: they draw themselves, so they can only be hidden by taking their colour's alpha to zero. The sand keeps settling while you are away — come back and the figure has moved on."
      }
    ],
    "groups": [
      {
        "id": "g1",
        "x": 10,
        "y": -160,
        "w": 1370,
        "h": 540,
        "title": "the voice — one note, one interval",
        "nodes": [
          "f1",
          "f3",
          "f2",
          "f4",
          "f5",
          "k1",
          "k2",
          "k3",
          "k4",
          "v1",
          "v2",
          "v3",
          "v4"
        ]
      },
      {
        "id": "g2",
        "x": 1390,
        "y": 400,
        "w": 920,
        "h": 260,
        "title": "view 1 · the plate — the frequency as sand",
        "nodes": [
          "p1",
          "p2",
          "p3",
          "p4"
        ]
      },
      {
        "id": "g3",
        "x": 1390,
        "y": 620,
        "w": 920,
        "h": 480,
        "title": "view 2 · the pendulum — the ratio as a lissajous web",
        "nodes": [
          "h1",
          "h2",
          "h3",
          "hT",
          "h5",
          "h6",
          "h7"
        ]
      },
      {
        "id": "g4",
        "x": 1390,
        "y": 1020,
        "w": 2210,
        "h": 480,
        "title": "view 3 · the wave — the two voices, added",
        "nodes": [
          "w1",
          "w2",
          "w3",
          "w4",
          "w5",
          "w6",
          "w7",
          "w8",
          "w9",
          "w10",
          "w11",
          "w13",
          "w12",
          "w14"
        ]
      },
      {
        "id": "g5",
        "x": 1390,
        "y": 1440,
        "w": 2500,
        "h": 500,
        "title": "view 4 · the flower — the interval as a rose",
        "nodes": [
          "r1",
          "r14",
          "r2",
          "r4",
          "r5",
          "r3",
          "r6",
          "r7",
          "r8",
          "r9",
          "r10",
          "r11",
          "r12",
          "r15",
          "r13",
          "r16",
          "r17",
          "r18"
        ]
      },
      {
        "id": "g6",
        "x": 10,
        "y": 1980,
        "w": 2230,
        "h": 1080,
        "title": "the tabs — four hit areas, one remembered number",
        "nodes": [
          "t1",
          "t5",
          "t2",
          "t3",
          "t4",
          "t6",
          "t7",
          "t8",
          "t9",
          "t10",
          "t11",
          "t12",
          "t13",
          "t15",
          "t16",
          "t14",
          "t17",
          "t18",
          "t19"
        ]
      },
      {
        "id": "g7",
        "x": 2380,
        "y": 1980,
        "w": 900,
        "h": 460,
        "title": "caption & ground",
        "nodes": [
          "x1",
          "x2",
          "x3",
          "x4",
          "x5",
          "bg"
        ]
      }
    ]
  },
  'Loop pedal': {
    "format": 2,
    "nodes": [
      {
        "id": "b1",
        "type": "sets/series",
        "x": 40,
        "y": 0,
        "values": {
          "S": -150,
          "N": 150,
          "C": 3
        },
        "label": "button x"
      },
      {
        "id": "b2",
        "type": "vec/construct",
        "x": 270,
        "y": 0,
        "values": {
          "Y": 40
        },
        "label": "button centres"
      },
      {
        "id": "b3",
        "type": "crv/circle",
        "x": 500,
        "y": 0,
        "values": {
          "R": 34
        },
        "label": "three buttons"
      },
      {
        "id": "b4",
        "type": "input/hotspot",
        "x": 730,
        "y": 0,
        "values": {},
        "label": "one hotspot, three clicks"
      },
      {
        "id": "b5",
        "type": "sets/item",
        "x": 960,
        "y": -60,
        "values": {
          "i": 0
        },
        "label": "rec button"
      },
      {
        "id": "b6",
        "type": "sets/item",
        "x": 960,
        "y": 60,
        "values": {
          "i": 1
        },
        "label": "clear button"
      },
      {
        "id": "b7",
        "type": "sets/item",
        "x": 960,
        "y": 180,
        "values": {
          "i": 2
        },
        "label": "click button"
      },
      {
        "id": "l1",
        "type": "input/keyboard",
        "x": 40,
        "y": 150,
        "values": {
          "K": "space"
        },
        "label": "space"
      },
      {
        "id": "l14",
        "type": "input/keyboard",
        "x": 40,
        "y": 270,
        "values": {
          "K": "c"
        },
        "label": "c"
      },
      {
        "id": "k3",
        "type": "input/keyboard",
        "x": 40,
        "y": 390,
        "values": {
          "K": "m"
        },
        "label": "m"
      },
      {
        "id": "g1",
        "type": "math/logic",
        "x": 1190,
        "y": -60,
        "values": {
          "mode": "or"
        },
        "label": "space or rec"
      },
      {
        "id": "g2",
        "type": "math/logic",
        "x": 1190,
        "y": 60,
        "values": {
          "mode": "or"
        },
        "label": "c or clear"
      },
      {
        "id": "g3",
        "type": "math/logic",
        "x": 1190,
        "y": 180,
        "values": {
          "mode": "or"
        },
        "label": "m or click"
      },
      {
        "id": "l2",
        "type": "state/latch",
        "x": 1420,
        "y": -60,
        "values": {},
        "label": "recording"
      },
      {
        "id": "m0",
        "type": "state/latch",
        "x": 1420,
        "y": 180,
        "values": {},
        "label": "metronome on"
      },
      {
        "id": "b8",
        "type": "sets/select",
        "x": 960,
        "y": 310,
        "values": {
          "T": 0.34,
          "F": 0.16
        },
        "label": "hover lift"
      },
      {
        "id": "b9",
        "type": "disp/hsl",
        "x": 1190,
        "y": 310,
        "values": {
          "H": 0.55,
          "S": 0.3,
          "A": 1
        },
        "label": "button fill"
      },
      {
        "id": "b10",
        "type": "disp/draw",
        "x": 1420,
        "y": 310,
        "values": {
          "S": {
            "r": 158,
            "g": 180,
            "b": 210,
            "a": 0.9
          },
          "W": 1.5
        },
        "label": "draw buttons"
      },
      {
        "id": "b11",
        "type": "params/textlist",
        "x": 500,
        "y": 440,
        "values": {
          "text": "rec\nclear\nclick"
        },
        "label": "button labels"
      },
      {
        "id": "b15",
        "type": "vec/construct",
        "x": 730,
        "y": 440,
        "values": {
          "Y": 94
        },
        "label": "label centres"
      },
      {
        "id": "b13",
        "type": "disp/text",
        "x": 960,
        "y": 440,
        "values": {
          "S": 13
        },
        "label": "three labels, one node"
      },
      {
        "id": "b14",
        "type": "disp/draw",
        "x": 1190,
        "y": 440,
        "values": {
          "S": {
            "r": 206,
            "g": 217,
            "b": 236,
            "a": 0.85
          }
        },
        "label": "draw labels"
      },
      {
        "id": "l4",
        "type": "audio/mic",
        "x": 40,
        "y": 700,
        "values": {},
        "label": "mic"
      },
      {
        "id": "l6",
        "type": "params/slider",
        "x": 40,
        "y": 840,
        "values": {
          "min": 0.5,
          "max": 8,
          "value": 2,
          "label": "loop seconds"
        }
      },
      {
        "id": "l3",
        "type": "sets/select",
        "x": 1650,
        "y": 700,
        "values": {
          "T": 1,
          "F": 0
        },
        "label": "record gate"
      },
      {
        "id": "l5",
        "type": "audio/gain",
        "x": 1880,
        "y": 700,
        "values": {},
        "label": "let the mic in"
      },
      {
        "id": "l7",
        "type": "audio/delay",
        "x": 2110,
        "y": 700,
        "values": {
          "F": 1,
          "M": 1
        },
        "label": "the loop — feedback 1"
      },
      {
        "id": "l8",
        "type": "audio/out",
        "x": 2340,
        "y": 700,
        "values": {},
        "label": "speakers"
      },
      {
        "id": "l9",
        "type": "audio/scope",
        "x": 2340,
        "y": 860,
        "values": {
          "W": 460,
          "H": 140,
          "T": 60,
          "P": {
            "x": 0,
            "y": -150
          }
        },
        "label": "the loop, seen"
      },
      {
        "id": "m1",
        "type": "params/slider",
        "x": 40,
        "y": 1180,
        "values": {
          "min": 40,
          "max": 200,
          "value": 96,
          "mode": "int",
          "label": "metronome bpm"
        }
      },
      {
        "id": "m8",
        "type": "params/slider",
        "x": 40,
        "y": 1320,
        "values": {
          "min": 0,
          "max": 0.5,
          "value": 0.22,
          "label": "click level"
        }
      },
      {
        "id": "m2",
        "type": "math/expr",
        "x": 500,
        "y": 1180,
        "values": {
          "expr": "(T * X / 60) % 1"
        },
        "label": "beat phase 0..1"
      },
      {
        "id": "m3",
        "type": "math/expr",
        "x": 960,
        "y": 1180,
        "values": {
          "expr": "pow(1 - X, 40)"
        },
        "label": "click envelope"
      },
      {
        "id": "m4",
        "type": "sets/select",
        "x": 1650,
        "y": 1180,
        "values": {
          "F": 0
        },
        "label": "gate — silent when off"
      },
      {
        "id": "m5",
        "type": "math/mul",
        "x": 1880,
        "y": 1180,
        "values": {},
        "label": "× level"
      },
      {
        "id": "m6",
        "type": "audio/osc",
        "x": 1650,
        "y": 1320,
        "values": {
          "wave": "sine",
          "F": 1320
        },
        "label": "click tone"
      },
      {
        "id": "m7",
        "type": "audio/gain",
        "x": 1880,
        "y": 1320,
        "values": {},
        "label": "blip"
      },
      {
        "id": "m9",
        "type": "crv/circle",
        "x": 1650,
        "y": 1460,
        "values": {
          "R": 6,
          "P": {
            "x": 150,
            "y": -14
          }
        },
        "label": "beat dot"
      },
      {
        "id": "m10",
        "type": "disp/hsl",
        "x": 1880,
        "y": 1460,
        "values": {
          "H": 0.12,
          "S": 0.9,
          "L": 0.62
        },
        "label": "flash"
      },
      {
        "id": "m11",
        "type": "disp/draw",
        "x": 2110,
        "y": 1460,
        "values": {
          "W": 1
        },
        "label": "draw beat dot"
      },
      {
        "id": "l15",
        "type": "math/expr",
        "x": 500,
        "y": 1700,
        "values": {
          "expr": "0.5 + 0.5*sin(6.2832*T*8/X)"
        },
        "label": "8 pulses per loop"
      },
      {
        "id": "l10",
        "type": "sets/select",
        "x": 1650,
        "y": 1700,
        "values": {
          "T": "recording",
          "F": "space / rec  ·  c / clear  ·  m / click"
        },
        "label": "status line"
      },
      {
        "id": "l11",
        "type": "disp/text",
        "x": 1880,
        "y": 1700,
        "values": {
          "S": 16,
          "P": {
            "x": 20,
            "y": 150
          }
        }
      },
      {
        "id": "l12",
        "type": "disp/draw",
        "x": 2110,
        "y": 1700,
        "values": {
          "S": {
            "r": 230,
            "g": 237,
            "b": 250,
            "a": 0.8
          }
        },
        "label": "draw status"
      },
      {
        "id": "l16",
        "type": "sets/select",
        "x": 1650,
        "y": 1840,
        "values": {
          "F": 0.12
        },
        "label": "pulse only while recording"
      },
      {
        "id": "l17",
        "type": "disp/hsl",
        "x": 1880,
        "y": 1840,
        "values": {
          "H": 0,
          "S": 0.85,
          "L": 0.55
        },
        "label": "record red"
      },
      {
        "id": "l18",
        "type": "crv/circle",
        "x": 1650,
        "y": 1980,
        "values": {
          "R": 8,
          "P": {
            "x": -180,
            "y": 150
          }
        },
        "label": "record dot"
      },
      {
        "id": "l19",
        "type": "disp/draw",
        "x": 2110,
        "y": 1840,
        "values": {
          "W": 1.5
        },
        "label": "draw record dot"
      },
      {
        "id": "l13",
        "type": "disp/bg",
        "x": 2340,
        "y": 1700,
        "values": {}
      }
    ],
    "wires": [
      {
        "from": [
          "b1",
          "S"
        ],
        "to": [
          "b2",
          "X"
        ]
      },
      {
        "from": [
          "b2",
          "P"
        ],
        "to": [
          "b3",
          "P"
        ]
      },
      {
        "from": [
          "b3",
          "C"
        ],
        "to": [
          "b4",
          "G"
        ]
      },
      {
        "from": [
          "b4",
          "C"
        ],
        "to": [
          "b5",
          "L"
        ]
      },
      {
        "from": [
          "b4",
          "C"
        ],
        "to": [
          "b6",
          "L"
        ]
      },
      {
        "from": [
          "b4",
          "C"
        ],
        "to": [
          "b7",
          "L"
        ]
      },
      {
        "from": [
          "l1",
          "P"
        ],
        "to": [
          "g1",
          "A"
        ]
      },
      {
        "from": [
          "b5",
          "E"
        ],
        "to": [
          "g1",
          "B"
        ]
      },
      {
        "from": [
          "l14",
          "P"
        ],
        "to": [
          "g2",
          "A"
        ]
      },
      {
        "from": [
          "b6",
          "E"
        ],
        "to": [
          "g2",
          "B"
        ]
      },
      {
        "from": [
          "k3",
          "P"
        ],
        "to": [
          "g3",
          "A"
        ]
      },
      {
        "from": [
          "b7",
          "E"
        ],
        "to": [
          "g3",
          "B"
        ]
      },
      {
        "from": [
          "g1",
          "R"
        ],
        "to": [
          "l2",
          "T"
        ]
      },
      {
        "from": [
          "g3",
          "R"
        ],
        "to": [
          "m0",
          "T"
        ]
      },
      {
        "from": [
          "b4",
          "H"
        ],
        "to": [
          "b8",
          "P"
        ]
      },
      {
        "from": [
          "b8",
          "L"
        ],
        "to": [
          "b9",
          "L"
        ]
      },
      {
        "from": [
          "b3",
          "C"
        ],
        "to": [
          "b10",
          "G"
        ]
      },
      {
        "from": [
          "b9",
          "C"
        ],
        "to": [
          "b10",
          "F"
        ]
      },
      {
        "from": [
          "b1",
          "S"
        ],
        "to": [
          "b15",
          "X"
        ]
      },
      {
        "from": [
          "b11",
          "L"
        ],
        "to": [
          "b13",
          "T"
        ]
      },
      {
        "from": [
          "b15",
          "P"
        ],
        "to": [
          "b13",
          "P"
        ]
      },
      {
        "from": [
          "b13",
          "G"
        ],
        "to": [
          "b14",
          "G"
        ]
      },
      {
        "from": [
          "l2",
          "B"
        ],
        "to": [
          "l3",
          "P"
        ]
      },
      {
        "from": [
          "l4",
          "A"
        ],
        "to": [
          "l5",
          "In"
        ]
      },
      {
        "from": [
          "l3",
          "L"
        ],
        "to": [
          "l5",
          "G"
        ]
      },
      {
        "from": [
          "l5",
          "A"
        ],
        "to": [
          "l7",
          "In"
        ]
      },
      {
        "from": [
          "l6",
          "N"
        ],
        "to": [
          "l7",
          "T"
        ]
      },
      {
        "from": [
          "g2",
          "R"
        ],
        "to": [
          "l7",
          "C"
        ]
      },
      {
        "from": [
          "l7",
          "A"
        ],
        "to": [
          "l8",
          "In"
        ]
      },
      {
        "from": [
          "l7",
          "A"
        ],
        "to": [
          "l9",
          "In"
        ]
      },
      {
        "from": [
          "m1",
          "N"
        ],
        "to": [
          "m2",
          "X"
        ]
      },
      {
        "from": [
          "m2",
          "R"
        ],
        "to": [
          "m3",
          "X"
        ]
      },
      {
        "from": [
          "m3",
          "R"
        ],
        "to": [
          "m4",
          "T"
        ]
      },
      {
        "from": [
          "m0",
          "B"
        ],
        "to": [
          "m4",
          "P"
        ]
      },
      {
        "from": [
          "m4",
          "L"
        ],
        "to": [
          "m5",
          "A"
        ]
      },
      {
        "from": [
          "m8",
          "N"
        ],
        "to": [
          "m5",
          "B"
        ]
      },
      {
        "from": [
          "m6",
          "A"
        ],
        "to": [
          "m7",
          "In"
        ]
      },
      {
        "from": [
          "m5",
          "R"
        ],
        "to": [
          "m7",
          "G"
        ]
      },
      {
        "from": [
          "m7",
          "A"
        ],
        "to": [
          "l8",
          "In"
        ]
      },
      {
        "from": [
          "m4",
          "L"
        ],
        "to": [
          "m10",
          "A"
        ]
      },
      {
        "from": [
          "m9",
          "C"
        ],
        "to": [
          "m11",
          "G"
        ]
      },
      {
        "from": [
          "m10",
          "C"
        ],
        "to": [
          "m11",
          "F"
        ]
      },
      {
        "from": [
          "m10",
          "C"
        ],
        "to": [
          "m11",
          "S"
        ]
      },
      {
        "from": [
          "l2",
          "B"
        ],
        "to": [
          "l10",
          "P"
        ]
      },
      {
        "from": [
          "l10",
          "L"
        ],
        "to": [
          "l11",
          "T"
        ]
      },
      {
        "from": [
          "l11",
          "G"
        ],
        "to": [
          "l12",
          "G"
        ]
      },
      {
        "from": [
          "l6",
          "N"
        ],
        "to": [
          "l15",
          "X"
        ]
      },
      {
        "from": [
          "l15",
          "R"
        ],
        "to": [
          "l16",
          "T"
        ]
      },
      {
        "from": [
          "l2",
          "B"
        ],
        "to": [
          "l16",
          "P"
        ]
      },
      {
        "from": [
          "l16",
          "L"
        ],
        "to": [
          "l17",
          "A"
        ]
      },
      {
        "from": [
          "l18",
          "C"
        ],
        "to": [
          "l19",
          "G"
        ]
      },
      {
        "from": [
          "l17",
          "C"
        ],
        "to": [
          "l19",
          "S"
        ]
      },
      {
        "from": [
          "l17",
          "C"
        ],
        "to": [
          "l19",
          "F"
        ]
      }
    ],
    "notes": [
      {
        "id": "t1",
        "x": 1700,
        "y": -140,
        "w": 360,
        "h": 470,
        "text": "transport\n\nthree circles on the cloth are ONE Hotspot — List Item pulls each button's click out of the three-item list, and one Select paints all three hover states.\n\nthe keys still work: space = record, c = clear, m = metronome. each key meets its button in a Logic (or), so both paths drive the same wire and neither one wins."
      },
      {
        "id": "t2",
        "x": 2370,
        "y": 1180,
        "w": 320,
        "h": 340,
        "text": "the click track\n\nno metronome node needed: time modulo the beat period is a 0..1 ramp, and pow(1 - phase, 40) turns that ramp into an 11 ms spike.\n\nthe spike is the gain of a steady 1320 Hz tone — and the same number is the alpha of the beat dot, so you see what you hear."
      }
    ],
    "groups": [
      {
        "id": "g_a",
        "x": -20,
        "y": -140,
        "w": 1680,
        "h": 740,
        "title": "transport — three buttons on the cloth, three keys, one Logic (or) each",
        "nodes": [
          "b1",
          "b2",
          "b3",
          "b4",
          "b5",
          "b6",
          "b7",
          "l1",
          "l14",
          "k3",
          "g1",
          "g2",
          "g3",
          "l2",
          "m0",
          "b8",
          "b9",
          "b10",
          "b11",
          "b15",
          "b13",
          "b14"
        ]
      },
      {
        "id": "g_b",
        "x": -20,
        "y": 650,
        "w": 2580,
        "h": 450,
        "title": "the loop — mic through a gate into a Delay whose feedback is 1",
        "nodes": [
          "l4",
          "l6",
          "l3",
          "l5",
          "l7",
          "l8",
          "l9"
        ]
      },
      {
        "id": "g_c",
        "x": -20,
        "y": 1130,
        "w": 2350,
        "h": 500,
        "title": "metronome — one blip per beat, silent until you press click",
        "nodes": [
          "m1",
          "m8",
          "m2",
          "m3",
          "m4",
          "m5",
          "m6",
          "m7",
          "m9",
          "m10",
          "m11"
        ]
      },
      {
        "id": "g_d",
        "x": -20,
        "y": 1680,
        "w": 2580,
        "h": 480,
        "title": "readout — the status line and the pulsing record dot",
        "nodes": [
          "l15",
          "l10",
          "l11",
          "l12",
          "l16",
          "l17",
          "l18",
          "l19",
          "l13"
        ]
      }
    ]
  },
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
    ['s1', 'params/slider', 30, 40, { min: 2, max: 16, value: 5, mode: 'int', label: 'symmetry' }],
    ['s4', 'params/slider', 30, 150, { min: 60, max: 220, value: 150, mode: 'int', label: 'size' }],
    ['rg', 'sets/range', 30, 260, { A: 0, B: 6.2832, N: 256 }],
    ['t1', 'input/time', 30, 370],
    ['mb', 'math/mul', 210, 370, { B: 0.9 }],
    ['sn', 'math/sin', 390, 370],
    ['rb', 'math/remap', 570, 370, { S0: -1, S1: 1, T0: 0.18, T1: 0.42 }],
    ['js', 'meta/js', 280, 130, {
      title: 'superformula', mode: 'each',
      ins: [
        { name: 'T', type: 'number', default: 0 },
        { name: 'M', type: 'number', default: 5 },
        { name: 'N1', type: 'number', default: 0.3 },
        { name: 'N2', type: 'number', default: 1.6 },
        { name: 'R', type: 'number', default: 150 }
      ],
      outs: [{ name: 'P', type: 'point' }],
      code: 'const q = M * T / 4;\nconst f = Math.abs(Math.cos(q)), g = Math.abs(Math.sin(q));\nconst r = R * Math.pow(Math.pow(f, N2) + Math.pow(g, N2), -1 / N1);\nreturn { P: { x: r * Math.cos(T), y: r * Math.sin(T) } };'
    }],
    ['pl', 'crv/polyline', 560, 130, { C: true }],
    ['sr', 'sets/series', 560, 480, { S: 0, N: 1, C: 3 }],
    ['ma', 'math/mul', 740, 480, { B: 0.35 }],
    ['mt', 'math/mul', 740, 590, { B: 0.06 }],
    ['ad', 'math/add', 920, 480],
    ['ro', 'xf/rotate', 920, 130],
    ['rs', 'math/remap', 740, 260, { S0: 0, S1: 2, T0: 1, T1: 0.45 }],
    ['sc', 'xf/scale', 1100, 130],
    ['rc', 'math/remap', 920, 620, { S0: 0, S1: 2, T0: 0, T1: 1 }],
    ['gr', 'disp/gradient', 1100, 480, { A: { r: 255, g: 122, b: 40, a: 0.95 }, B: { r: 244, g: 63, b: 180, a: 0.95 } }],
    ['dr', 'disp/draw', 1320, 130, { F: { r: 255, g: 122, b: 40, a: 0.06 }, W: 2 }],
    ['bg', 'disp/bg', 1320, 330, { C: { r: 9, g: 8, b: 14, a: 1 } }]
  ], [
    ['rg', 'R', 'js', 'T'],
    ['s1', 'N', 'js', 'M'],
    ['s4', 'N', 'js', 'R'],
    ['t1', 'T', 'mb', 'A'],
    ['mb', 'R', 'sn', 'V'],
    ['sn', 'R', 'rb', 'V'],
    ['rb', 'R', 'js', 'N1'],
    ['js', 'P', 'pl', 'V'],
    ['pl', 'C', 'ro', 'G'],
    ['sr', 'S', 'ma', 'A'],
    ['t1', 'T', 'mt', 'A'],
    ['ma', 'R', 'ad', 'A'],
    ['mt', 'R', 'ad', 'B'],
    ['ad', 'R', 'ro', 'A'],
    ['ro', 'G', 'sc', 'G'],
    ['sr', 'S', 'rs', 'V'],
    ['rs', 'R', 'sc', 'F'],
    ['sc', 'G', 'dr', 'G'],
    ['sr', 'S', 'rc', 'V'],
    ['rc', 'R', 'gr', 'T'],
    ['gr', 'C', 'dr', 'S']
  ]),

  'Intersections': {
    "format": 2,
    "nodes": [
      {
        "id": "sdSpd",
        "type": "params/slider",
        "x": 30,
        "y": 40,
        "values": {
          "min": 0.1,
          "max": 1.5,
          "value": 0.5,
          "label": "speed"
        }
      },
      {
        "id": "sdR",
        "type": "params/slider",
        "x": 30,
        "y": 170,
        "values": {
          "min": 40,
          "max": 110,
          "value": 78,
          "label": "circle radius"
        }
      },
      {
        "id": "sdD",
        "type": "params/slider",
        "x": 30,
        "y": 300,
        "values": {
          "min": 34,
          "max": 112,
          "value": 70,
          "label": "drift"
        }
      },
      {
        "id": "t1",
        "type": "input/time",
        "x": 300,
        "y": 40,
        "values": {}
      },
      {
        "id": "mu",
        "type": "math/mul",
        "x": 530,
        "y": 40,
        "values": {}
      },
      {
        "id": "sn",
        "type": "math/sin",
        "x": 760,
        "y": 40,
        "values": {},
        "label": "the one drift"
      },
      {
        "id": "rm",
        "type": "math/remap",
        "x": 990,
        "y": 40,
        "values": {
          "S0": -1,
          "S1": 1,
          "T0": 24
        },
        "label": "hero offset"
      },
      {
        "id": "ng",
        "type": "math/neg",
        "x": 1220,
        "y": 40,
        "values": {}
      },
      {
        "id": "pa",
        "type": "vec/construct",
        "x": 1480,
        "y": 420,
        "values": {
          "Y": -152
        }
      },
      {
        "id": "pb",
        "type": "vec/construct",
        "x": 1480,
        "y": 560,
        "values": {
          "Y": -152
        }
      },
      {
        "id": "ca",
        "type": "crv/circle",
        "x": 1710,
        "y": 420,
        "values": {},
        "label": "circle A"
      },
      {
        "id": "cb",
        "type": "crv/circle",
        "x": 1710,
        "y": 560,
        "values": {},
        "label": "circle B"
      },
      {
        "id": "ix",
        "type": "crv/intersect",
        "x": 1940,
        "y": 420,
        "values": {},
        "label": "crossing points"
      },
      {
        "id": "rg1",
        "type": "crv/region",
        "x": 1940,
        "y": 570,
        "values": {
          "mode": "intersection"
        },
        "label": "the lens"
      },
      {
        "id": "rg2",
        "type": "crv/region",
        "x": 1940,
        "y": 720,
        "values": {
          "mode": "difference"
        },
        "label": "crescent"
      },
      {
        "id": "pl",
        "type": "crv/polyline",
        "x": 2170,
        "y": 420,
        "values": {
          "C": false
        },
        "label": "the chord"
      },
      {
        "id": "ar",
        "type": "crv/area",
        "x": 2170,
        "y": 570,
        "values": {}
      },
      {
        "id": "mi",
        "type": "xf/mirror",
        "x": 2170,
        "y": 720,
        "values": {},
        "label": "other crescent"
      },
      {
        "id": "rd",
        "type": "math/round",
        "x": 2400,
        "y": 570,
        "values": {}
      },
      {
        "id": "txArea",
        "type": "disp/text",
        "x": 2630,
        "y": 570,
        "values": {
          "P": {
            "x": 0,
            "y": -46
          },
          "S": 15
        }
      },
      {
        "id": "txCap",
        "type": "disp/text",
        "x": 2630,
        "y": 720,
        "values": {
          "T": "lens area (px²)",
          "P": {
            "x": 0,
            "y": -25
          },
          "S": 11
        }
      },
      {
        "id": "sdM",
        "type": "params/slider",
        "x": 30,
        "y": 980,
        "values": {
          "min": 0.2,
          "max": 0.5,
          "value": 0.36,
          "label": "vignette scale"
        }
      },
      {
        "id": "mrad",
        "type": "math/mul",
        "x": 300,
        "y": 980,
        "values": {},
        "label": "small radius"
      },
      {
        "id": "moff",
        "type": "math/expr",
        "x": 530,
        "y": 980,
        "values": {
          "expr": "Y * (0.42 + 0.22 * X)"
        },
        "label": "small offset"
      },
      {
        "id": "nof",
        "type": "math/neg",
        "x": 760,
        "y": 980,
        "values": {}
      },
      {
        "id": "spa",
        "type": "vec/construct",
        "x": 990,
        "y": 980,
        "values": {}
      },
      {
        "id": "spb",
        "type": "vec/construct",
        "x": 990,
        "y": 1120,
        "values": {}
      },
      {
        "id": "sca",
        "type": "crv/circle",
        "x": 1220,
        "y": 980,
        "values": {},
        "label": "small A"
      },
      {
        "id": "scb",
        "type": "crv/circle",
        "x": 1220,
        "y": 1120,
        "values": {},
        "label": "small B"
      },
      {
        "id": "v1",
        "type": "params/vector",
        "x": 1480,
        "y": 1320,
        "values": {
          "V": {
            "x": -204,
            "y": 42
          }
        },
        "label": "slot 1"
      },
      {
        "id": "rgU",
        "type": "crv/region",
        "x": 1710,
        "y": 1320,
        "values": {
          "mode": "union"
        },
        "label": "union"
      },
      {
        "id": "mvU",
        "type": "xf/move",
        "x": 1940,
        "y": 1320,
        "values": {}
      },
      {
        "id": "mvG1",
        "type": "xf/move",
        "x": 1940,
        "y": 1470,
        "values": {},
        "label": "ghost pair"
      },
      {
        "id": "v2",
        "type": "params/vector",
        "x": 1480,
        "y": 1660,
        "values": {
          "V": {
            "x": 0,
            "y": 42
          }
        },
        "label": "slot 2"
      },
      {
        "id": "rgI",
        "type": "crv/region",
        "x": 1710,
        "y": 1660,
        "values": {
          "mode": "intersection"
        },
        "label": "intersection"
      },
      {
        "id": "mvI",
        "type": "xf/move",
        "x": 1940,
        "y": 1660,
        "values": {}
      },
      {
        "id": "mvG2",
        "type": "xf/move",
        "x": 1940,
        "y": 1810,
        "values": {},
        "label": "ghost pair"
      },
      {
        "id": "v3",
        "type": "params/vector",
        "x": 1480,
        "y": 2000,
        "values": {
          "V": {
            "x": 204,
            "y": 42
          }
        },
        "label": "slot 3"
      },
      {
        "id": "rgD",
        "type": "crv/region",
        "x": 1710,
        "y": 2000,
        "values": {
          "mode": "difference"
        },
        "label": "difference"
      },
      {
        "id": "mvD",
        "type": "xf/move",
        "x": 1940,
        "y": 2000,
        "values": {}
      },
      {
        "id": "mvG3",
        "type": "xf/move",
        "x": 1940,
        "y": 2150,
        "values": {},
        "label": "ghost pair"
      },
      {
        "id": "v4",
        "type": "params/vector",
        "x": 1480,
        "y": 2340,
        "values": {
          "V": {
            "x": -204,
            "y": 196
          }
        },
        "label": "slot 4"
      },
      {
        "id": "trm",
        "type": "crv/trim",
        "x": 1710,
        "y": 2340,
        "values": {
          "mode": "outside"
        },
        "label": "A trimmed by B"
      },
      {
        "id": "mvT",
        "type": "xf/move",
        "x": 1940,
        "y": 2340,
        "values": {}
      },
      {
        "id": "mvG4",
        "type": "xf/move",
        "x": 1940,
        "y": 2490,
        "values": {},
        "label": "ghost pair"
      },
      {
        "id": "v5",
        "type": "params/vector",
        "x": 1480,
        "y": 2680,
        "values": {
          "V": {
            "x": 0,
            "y": 196
          }
        },
        "label": "slot 5"
      },
      {
        "id": "sdF",
        "type": "params/slider",
        "x": 1480,
        "y": 2830,
        "values": {
          "min": 0,
          "max": 30,
          "value": 14,
          "label": "fillet radius"
        }
      },
      {
        "id": "sxs",
        "type": "crv/intersect",
        "x": 1710,
        "y": 2680,
        "values": {},
        "label": "crossings"
      },
      {
        "id": "hl",
        "type": "crv/hull",
        "x": 1940,
        "y": 2680,
        "values": {},
        "label": "kite: centres + crossings"
      },
      {
        "id": "fil",
        "type": "crv/fillet",
        "x": 2170,
        "y": 2680,
        "values": {
          "N": 8
        },
        "label": "fillet"
      },
      {
        "id": "mvF",
        "type": "xf/move",
        "x": 2400,
        "y": 2680,
        "values": {}
      },
      {
        "id": "mvG5",
        "type": "xf/move",
        "x": 2400,
        "y": 2830,
        "values": {},
        "label": "ghosts + sharp kite"
      },
      {
        "id": "rn",
        "type": "sets/range",
        "x": 1480,
        "y": 3100,
        "values": {
          "A": 0,
          "B": 6.283185307179586,
          "N": 72
        }
      },
      {
        "id": "ek",
        "type": "math/remap",
        "x": 1480,
        "y": 3240,
        "values": {
          "S0": -1,
          "S1": 1,
          "T0": -0.55,
          "T1": 0.55
        },
        "label": "lobe bias"
      },
      {
        "id": "v6",
        "type": "params/vector",
        "x": 1480,
        "y": 3400,
        "values": {
          "V": {
            "x": 204,
            "y": 196
          }
        },
        "label": "slot 6"
      },
      {
        "id": "ex",
        "type": "math/expr",
        "x": 1710,
        "y": 3100,
        "values": {
          "Y": 44,
          "expr": "Y * cos(X)"
        }
      },
      {
        "id": "ey",
        "type": "math/expr",
        "x": 1710,
        "y": 3240,
        "values": {
          "Y": 30,
          "expr": "Y * sin(X) * (cos(X) + Z)"
        }
      },
      {
        "id": "vc8",
        "type": "vec/construct",
        "x": 1940,
        "y": 3100,
        "values": {}
      },
      {
        "id": "pl8",
        "type": "crv/polyline",
        "x": 2170,
        "y": 3100,
        "values": {
          "C": false
        },
        "label": "lemniscate"
      },
      {
        "id": "xs8",
        "type": "crv/intersect",
        "x": 2400,
        "y": 3240,
        "values": {
          "mode": "self"
        },
        "label": "where it crosses itself"
      },
      {
        "id": "mvE",
        "type": "xf/move",
        "x": 2630,
        "y": 3100,
        "values": {}
      },
      {
        "id": "mvX",
        "type": "xf/move",
        "x": 2630,
        "y": 3240,
        "values": {}
      },
      {
        "id": "txt",
        "type": "params/textlist",
        "x": 1480,
        "y": 3660,
        "values": {
          "text": "union\nintersection\ndifference\ntrim\nfillet\nself-crossing"
        },
        "label": "captions"
      },
      {
        "id": "tcap",
        "type": "disp/text",
        "x": 1710,
        "y": 3660,
        "values": {
          "P": {
            "x": 0,
            "y": 46
          },
          "S": 12
        }
      },
      {
        "id": "mvCap",
        "type": "xf/move",
        "x": 1940,
        "y": 3660,
        "values": {},
        "label": "one caption per slot"
      },
      {
        "id": "dwCirc",
        "type": "disp/draw",
        "x": 2900,
        "y": 40,
        "values": {
          "S": {
            "r": 110,
            "g": 125,
            "b": 160,
            "a": 0.34
          },
          "W": 1
        },
        "label": "sources (faint)"
      },
      {
        "id": "dwFill",
        "type": "disp/draw",
        "x": 2900,
        "y": 300,
        "values": {
          "S": {
            "r": 94,
            "g": 234,
            "b": 212,
            "a": 0.9
          },
          "F": {
            "r": 94,
            "g": 234,
            "b": 212,
            "a": 0.15
          },
          "W": 1.6
        },
        "label": "regions kept"
      },
      {
        "id": "dwCres",
        "type": "disp/draw",
        "x": 2900,
        "y": 560,
        "values": {
          "S": {
            "r": 129,
            "g": 140,
            "b": 248,
            "a": 0.85
          },
          "F": {
            "r": 129,
            "g": 140,
            "b": 248,
            "a": 0.12
          },
          "W": 1.4
        },
        "label": "regions removed"
      },
      {
        "id": "dwTrim",
        "type": "disp/draw",
        "x": 2900,
        "y": 820,
        "values": {
          "S": {
            "r": 251,
            "g": 172,
            "b": 0,
            "a": 0.9
          },
          "W": 2.4
        },
        "label": "trimmed arc"
      },
      {
        "id": "dwEight",
        "type": "disp/draw",
        "x": 2900,
        "y": 1080,
        "values": {
          "S": {
            "r": 129,
            "g": 140,
            "b": 248,
            "a": 0.9
          },
          "W": 1.6
        }
      },
      {
        "id": "dwMark",
        "type": "disp/draw",
        "x": 2900,
        "y": 1340,
        "values": {
          "S": {
            "r": 251,
            "g": 172,
            "b": 0,
            "a": 0.95
          },
          "W": 1.4
        },
        "label": "crossing points"
      },
      {
        "id": "dwNum",
        "type": "disp/draw",
        "x": 2900,
        "y": 1600,
        "values": {
          "S": {
            "r": 94,
            "g": 234,
            "b": 212,
            "a": 0.9
          }
        }
      },
      {
        "id": "dwTx",
        "type": "disp/draw",
        "x": 2900,
        "y": 1860,
        "values": {
          "S": {
            "r": 132,
            "g": 143,
            "b": 166,
            "a": 0.95
          }
        }
      },
      {
        "id": "bg",
        "type": "disp/bg",
        "x": 2900,
        "y": 2120,
        "values": {
          "C": {
            "r": 9,
            "g": 11,
            "b": 17,
            "a": 1
          }
        }
      }
    ],
    "wires": [
      {
        "from": [
          "t1",
          "T"
        ],
        "to": [
          "mu",
          "A"
        ]
      },
      {
        "from": [
          "sdSpd",
          "N"
        ],
        "to": [
          "mu",
          "B"
        ]
      },
      {
        "from": [
          "mu",
          "R"
        ],
        "to": [
          "sn",
          "V"
        ]
      },
      {
        "from": [
          "sn",
          "R"
        ],
        "to": [
          "rm",
          "V"
        ]
      },
      {
        "from": [
          "sdD",
          "N"
        ],
        "to": [
          "rm",
          "T1"
        ]
      },
      {
        "from": [
          "rm",
          "R"
        ],
        "to": [
          "ng",
          "V"
        ]
      },
      {
        "from": [
          "ng",
          "R"
        ],
        "to": [
          "pa",
          "X"
        ]
      },
      {
        "from": [
          "rm",
          "R"
        ],
        "to": [
          "pb",
          "X"
        ]
      },
      {
        "from": [
          "pa",
          "P"
        ],
        "to": [
          "ca",
          "P"
        ]
      },
      {
        "from": [
          "sdR",
          "N"
        ],
        "to": [
          "ca",
          "R"
        ]
      },
      {
        "from": [
          "pb",
          "P"
        ],
        "to": [
          "cb",
          "P"
        ]
      },
      {
        "from": [
          "sdR",
          "N"
        ],
        "to": [
          "cb",
          "R"
        ]
      },
      {
        "from": [
          "ca",
          "C"
        ],
        "to": [
          "ix",
          "C1"
        ]
      },
      {
        "from": [
          "cb",
          "C"
        ],
        "to": [
          "ix",
          "C2"
        ]
      },
      {
        "from": [
          "ca",
          "C"
        ],
        "to": [
          "rg1",
          "A"
        ]
      },
      {
        "from": [
          "cb",
          "C"
        ],
        "to": [
          "rg1",
          "B"
        ]
      },
      {
        "from": [
          "ca",
          "C"
        ],
        "to": [
          "rg2",
          "A"
        ]
      },
      {
        "from": [
          "cb",
          "C"
        ],
        "to": [
          "rg2",
          "B"
        ]
      },
      {
        "from": [
          "ix",
          "P"
        ],
        "to": [
          "pl",
          "V"
        ]
      },
      {
        "from": [
          "rg1",
          "C"
        ],
        "to": [
          "ar",
          "C"
        ]
      },
      {
        "from": [
          "ar",
          "A"
        ],
        "to": [
          "rd",
          "V"
        ]
      },
      {
        "from": [
          "rd",
          "R"
        ],
        "to": [
          "txArea",
          "T"
        ]
      },
      {
        "from": [
          "rg2",
          "C"
        ],
        "to": [
          "mi",
          "G"
        ]
      },
      {
        "from": [
          "sdR",
          "N"
        ],
        "to": [
          "mrad",
          "A"
        ]
      },
      {
        "from": [
          "sdM",
          "N"
        ],
        "to": [
          "mrad",
          "B"
        ]
      },
      {
        "from": [
          "sn",
          "R"
        ],
        "to": [
          "moff",
          "X"
        ]
      },
      {
        "from": [
          "mrad",
          "R"
        ],
        "to": [
          "moff",
          "Y"
        ]
      },
      {
        "from": [
          "moff",
          "R"
        ],
        "to": [
          "nof",
          "V"
        ]
      },
      {
        "from": [
          "nof",
          "R"
        ],
        "to": [
          "spa",
          "X"
        ]
      },
      {
        "from": [
          "moff",
          "R"
        ],
        "to": [
          "spb",
          "X"
        ]
      },
      {
        "from": [
          "spa",
          "P"
        ],
        "to": [
          "sca",
          "P"
        ]
      },
      {
        "from": [
          "mrad",
          "R"
        ],
        "to": [
          "sca",
          "R"
        ]
      },
      {
        "from": [
          "spb",
          "P"
        ],
        "to": [
          "scb",
          "P"
        ]
      },
      {
        "from": [
          "mrad",
          "R"
        ],
        "to": [
          "scb",
          "R"
        ]
      },
      {
        "from": [
          "sca",
          "C"
        ],
        "to": [
          "rgU",
          "A"
        ]
      },
      {
        "from": [
          "scb",
          "C"
        ],
        "to": [
          "rgU",
          "B"
        ]
      },
      {
        "from": [
          "rgU",
          "C"
        ],
        "to": [
          "mvU",
          "G"
        ]
      },
      {
        "from": [
          "v1",
          "V"
        ],
        "to": [
          "mvU",
          "T"
        ]
      },
      {
        "from": [
          "sca",
          "C"
        ],
        "to": [
          "mvG1",
          "G"
        ]
      },
      {
        "from": [
          "scb",
          "C"
        ],
        "to": [
          "mvG1",
          "G"
        ]
      },
      {
        "from": [
          "v1",
          "V"
        ],
        "to": [
          "mvG1",
          "T"
        ]
      },
      {
        "from": [
          "sca",
          "C"
        ],
        "to": [
          "rgI",
          "A"
        ]
      },
      {
        "from": [
          "scb",
          "C"
        ],
        "to": [
          "rgI",
          "B"
        ]
      },
      {
        "from": [
          "rgI",
          "C"
        ],
        "to": [
          "mvI",
          "G"
        ]
      },
      {
        "from": [
          "v2",
          "V"
        ],
        "to": [
          "mvI",
          "T"
        ]
      },
      {
        "from": [
          "sca",
          "C"
        ],
        "to": [
          "mvG2",
          "G"
        ]
      },
      {
        "from": [
          "scb",
          "C"
        ],
        "to": [
          "mvG2",
          "G"
        ]
      },
      {
        "from": [
          "v2",
          "V"
        ],
        "to": [
          "mvG2",
          "T"
        ]
      },
      {
        "from": [
          "sca",
          "C"
        ],
        "to": [
          "rgD",
          "A"
        ]
      },
      {
        "from": [
          "scb",
          "C"
        ],
        "to": [
          "rgD",
          "B"
        ]
      },
      {
        "from": [
          "rgD",
          "C"
        ],
        "to": [
          "mvD",
          "G"
        ]
      },
      {
        "from": [
          "v3",
          "V"
        ],
        "to": [
          "mvD",
          "T"
        ]
      },
      {
        "from": [
          "sca",
          "C"
        ],
        "to": [
          "mvG3",
          "G"
        ]
      },
      {
        "from": [
          "scb",
          "C"
        ],
        "to": [
          "mvG3",
          "G"
        ]
      },
      {
        "from": [
          "v3",
          "V"
        ],
        "to": [
          "mvG3",
          "T"
        ]
      },
      {
        "from": [
          "sca",
          "C"
        ],
        "to": [
          "trm",
          "C"
        ]
      },
      {
        "from": [
          "scb",
          "C"
        ],
        "to": [
          "trm",
          "X"
        ]
      },
      {
        "from": [
          "trm",
          "C"
        ],
        "to": [
          "mvT",
          "G"
        ]
      },
      {
        "from": [
          "v4",
          "V"
        ],
        "to": [
          "mvT",
          "T"
        ]
      },
      {
        "from": [
          "sca",
          "C"
        ],
        "to": [
          "mvG4",
          "G"
        ]
      },
      {
        "from": [
          "scb",
          "C"
        ],
        "to": [
          "mvG4",
          "G"
        ]
      },
      {
        "from": [
          "v4",
          "V"
        ],
        "to": [
          "mvG4",
          "T"
        ]
      },
      {
        "from": [
          "sca",
          "C"
        ],
        "to": [
          "sxs",
          "C1"
        ]
      },
      {
        "from": [
          "scb",
          "C"
        ],
        "to": [
          "sxs",
          "C2"
        ]
      },
      {
        "from": [
          "spa",
          "P"
        ],
        "to": [
          "hl",
          "P"
        ]
      },
      {
        "from": [
          "spb",
          "P"
        ],
        "to": [
          "hl",
          "P"
        ]
      },
      {
        "from": [
          "sxs",
          "P"
        ],
        "to": [
          "hl",
          "P"
        ]
      },
      {
        "from": [
          "hl",
          "C"
        ],
        "to": [
          "fil",
          "C"
        ]
      },
      {
        "from": [
          "sdF",
          "N"
        ],
        "to": [
          "fil",
          "R"
        ]
      },
      {
        "from": [
          "fil",
          "C"
        ],
        "to": [
          "mvF",
          "G"
        ]
      },
      {
        "from": [
          "v5",
          "V"
        ],
        "to": [
          "mvF",
          "T"
        ]
      },
      {
        "from": [
          "sca",
          "C"
        ],
        "to": [
          "mvG5",
          "G"
        ]
      },
      {
        "from": [
          "scb",
          "C"
        ],
        "to": [
          "mvG5",
          "G"
        ]
      },
      {
        "from": [
          "hl",
          "C"
        ],
        "to": [
          "mvG5",
          "G"
        ]
      },
      {
        "from": [
          "v5",
          "V"
        ],
        "to": [
          "mvG5",
          "T"
        ]
      },
      {
        "from": [
          "rn",
          "R"
        ],
        "to": [
          "ex",
          "X"
        ]
      },
      {
        "from": [
          "rn",
          "R"
        ],
        "to": [
          "ey",
          "X"
        ]
      },
      {
        "from": [
          "sn",
          "R"
        ],
        "to": [
          "ek",
          "V"
        ]
      },
      {
        "from": [
          "ek",
          "R"
        ],
        "to": [
          "ey",
          "Z"
        ]
      },
      {
        "from": [
          "ex",
          "R"
        ],
        "to": [
          "vc8",
          "X"
        ]
      },
      {
        "from": [
          "ey",
          "R"
        ],
        "to": [
          "vc8",
          "Y"
        ]
      },
      {
        "from": [
          "vc8",
          "P"
        ],
        "to": [
          "pl8",
          "V"
        ]
      },
      {
        "from": [
          "pl8",
          "C"
        ],
        "to": [
          "xs8",
          "C1"
        ]
      },
      {
        "from": [
          "pl8",
          "C"
        ],
        "to": [
          "mvE",
          "G"
        ]
      },
      {
        "from": [
          "v6",
          "V"
        ],
        "to": [
          "mvE",
          "T"
        ]
      },
      {
        "from": [
          "xs8",
          "P"
        ],
        "to": [
          "mvX",
          "G"
        ]
      },
      {
        "from": [
          "v6",
          "V"
        ],
        "to": [
          "mvX",
          "T"
        ]
      },
      {
        "from": [
          "txt",
          "L"
        ],
        "to": [
          "tcap",
          "T"
        ]
      },
      {
        "from": [
          "tcap",
          "G"
        ],
        "to": [
          "mvCap",
          "G"
        ]
      },
      {
        "from": [
          "v1",
          "V"
        ],
        "to": [
          "mvCap",
          "T"
        ]
      },
      {
        "from": [
          "v2",
          "V"
        ],
        "to": [
          "mvCap",
          "T"
        ]
      },
      {
        "from": [
          "v3",
          "V"
        ],
        "to": [
          "mvCap",
          "T"
        ]
      },
      {
        "from": [
          "v4",
          "V"
        ],
        "to": [
          "mvCap",
          "T"
        ]
      },
      {
        "from": [
          "v5",
          "V"
        ],
        "to": [
          "mvCap",
          "T"
        ]
      },
      {
        "from": [
          "v6",
          "V"
        ],
        "to": [
          "mvCap",
          "T"
        ]
      },
      {
        "from": [
          "ca",
          "C"
        ],
        "to": [
          "dwCirc",
          "G"
        ]
      },
      {
        "from": [
          "cb",
          "C"
        ],
        "to": [
          "dwCirc",
          "G"
        ]
      },
      {
        "from": [
          "mvG1",
          "G"
        ],
        "to": [
          "dwCirc",
          "G"
        ]
      },
      {
        "from": [
          "mvG2",
          "G"
        ],
        "to": [
          "dwCirc",
          "G"
        ]
      },
      {
        "from": [
          "mvG3",
          "G"
        ],
        "to": [
          "dwCirc",
          "G"
        ]
      },
      {
        "from": [
          "mvG4",
          "G"
        ],
        "to": [
          "dwCirc",
          "G"
        ]
      },
      {
        "from": [
          "mvG5",
          "G"
        ],
        "to": [
          "dwCirc",
          "G"
        ]
      },
      {
        "from": [
          "rg1",
          "C"
        ],
        "to": [
          "dwFill",
          "G"
        ]
      },
      {
        "from": [
          "mvU",
          "G"
        ],
        "to": [
          "dwFill",
          "G"
        ]
      },
      {
        "from": [
          "mvI",
          "G"
        ],
        "to": [
          "dwFill",
          "G"
        ]
      },
      {
        "from": [
          "mvF",
          "G"
        ],
        "to": [
          "dwFill",
          "G"
        ]
      },
      {
        "from": [
          "rg2",
          "C"
        ],
        "to": [
          "dwCres",
          "G"
        ]
      },
      {
        "from": [
          "mi",
          "G"
        ],
        "to": [
          "dwCres",
          "G"
        ]
      },
      {
        "from": [
          "mvD",
          "G"
        ],
        "to": [
          "dwCres",
          "G"
        ]
      },
      {
        "from": [
          "mvT",
          "G"
        ],
        "to": [
          "dwTrim",
          "G"
        ]
      },
      {
        "from": [
          "mvE",
          "G"
        ],
        "to": [
          "dwEight",
          "G"
        ]
      },
      {
        "from": [
          "pl",
          "C"
        ],
        "to": [
          "dwMark",
          "G"
        ]
      },
      {
        "from": [
          "ix",
          "P"
        ],
        "to": [
          "dwMark",
          "G"
        ]
      },
      {
        "from": [
          "mvX",
          "G"
        ],
        "to": [
          "dwMark",
          "G"
        ]
      },
      {
        "from": [
          "txArea",
          "G"
        ],
        "to": [
          "dwNum",
          "G"
        ]
      },
      {
        "from": [
          "txCap",
          "G"
        ],
        "to": [
          "dwTx",
          "G"
        ]
      },
      {
        "from": [
          "mvCap",
          "G"
        ],
        "to": [
          "dwTx",
          "G"
        ]
      }
    ],
    "groups": [
      {
        "id": "g1",
        "x": 12,
        "y": -6,
        "w": 1420,
        "h": 480,
        "title": "one drift for the whole board",
        "nodes": [
          "sdSpd",
          "sdR",
          "sdD",
          "t1",
          "mu",
          "sn",
          "rm",
          "ng"
        ]
      },
      {
        "id": "g2",
        "x": 1462,
        "y": 374,
        "w": 1370,
        "h": 520,
        "title": "hero — the vesica",
        "nodes": [
          "pa",
          "pb",
          "ca",
          "cb",
          "ix",
          "rg1",
          "rg2",
          "pl",
          "ar",
          "mi",
          "rd",
          "txArea",
          "txCap"
        ]
      },
      {
        "id": "g3",
        "x": 12,
        "y": 934,
        "w": 1420,
        "h": 380,
        "title": "the shared small pair (every vignette reads these)",
        "nodes": [
          "sdM",
          "mrad",
          "moff",
          "nof",
          "spa",
          "spb",
          "sca",
          "scb"
        ]
      },
      {
        "id": "g4",
        "x": 1462,
        "y": 1274,
        "w": 680,
        "h": 400,
        "title": "1 · union",
        "nodes": [
          "v1",
          "rgU",
          "mvU",
          "mvG1"
        ]
      },
      {
        "id": "g5",
        "x": 1462,
        "y": 1614,
        "w": 680,
        "h": 400,
        "title": "2 · intersection",
        "nodes": [
          "v2",
          "rgI",
          "mvI",
          "mvG2"
        ]
      },
      {
        "id": "g6",
        "x": 1462,
        "y": 1954,
        "w": 680,
        "h": 400,
        "title": "3 · difference",
        "nodes": [
          "v3",
          "rgD",
          "mvD",
          "mvG3"
        ]
      },
      {
        "id": "g7",
        "x": 1462,
        "y": 2294,
        "w": 680,
        "h": 400,
        "title": "4 · trim",
        "nodes": [
          "v4",
          "trm",
          "mvT",
          "mvG4"
        ]
      },
      {
        "id": "g8",
        "x": 1462,
        "y": 2634,
        "w": 1140,
        "h": 400,
        "title": "5 · fillet on the kite through the crossings",
        "nodes": [
          "v5",
          "sdF",
          "sxs",
          "hl",
          "fil",
          "mvF",
          "mvG5"
        ]
      },
      {
        "id": "g9",
        "x": 1462,
        "y": 3054,
        "w": 1370,
        "h": 500,
        "title": "6 · self-crossing",
        "nodes": [
          "rn",
          "ek",
          "v6",
          "ex",
          "ey",
          "vc8",
          "pl8",
          "xs8",
          "mvE",
          "mvX"
        ]
      },
      {
        "id": "g10",
        "x": 1462,
        "y": 3614,
        "w": 680,
        "h": 260,
        "title": "captions — one Text node, six slots",
        "nodes": [
          "txt",
          "tcap",
          "mvCap"
        ]
      },
      {
        "id": "g11",
        "x": 2882,
        "y": -6,
        "w": 240,
        "h": 2320,
        "title": "ink",
        "nodes": [
          "dwCirc",
          "dwFill",
          "dwCres",
          "dwTrim",
          "dwEight",
          "dwMark",
          "dwNum",
          "dwTx",
          "bg"
        ]
      }
    ],
    "notes": [
      {
        "id": "t1n",
        "x": 12,
        "y": 500,
        "w": 400,
        "h": 130,
        "text": "every vignette hangs off the same Sine — the whole board breathes together. Each cluster does one operation on the SAME two small circles, then Move drops the result into its slot."
      }
    ]
  },

  /* Stonehenge (2026-08-09) — the monument as arithmetic. Every stone is one
   * d3/box built on the +z axis and swung onto its bearing by a Rotate3 about
   * the origin, so position and facing can never disagree: thirty sarsens from
   * one Series, five trilithons from a ten-item list split by floor(i/2) and
   * i mod 2, a bluestone ring from a third.
   *
   * The ruin is not hand-placed. A seeded roll plus cos(angle) scores each of
   * the thirty sockets, so the north-east arc that faces the avenue survives
   * and the south-west falls; two thresholds cut that score into standing,
   * fallen and gone, and Cull Pattern takes the geometry list rather than the
   * parameters, so one node does the work. Shift List moves the standing
   * pattern one place and ANDs it with itself — a lintel exists only where two
   * neighbours are both still up, which is why the run of lintels comes out
   * continuous, exactly as it is on Salisbury Plain.
   *
   * Two things worth stealing. The sun rides the camera: Orbit's A output goes
   * through sin/cos into Project's light, so the key light stays off the
   * shoulder at every angle of the drift instead of swinging from front-lit to
   * dead. And the plain is a SECOND Project and Draw whose nodes sit first in
   * the graph — draw order follows node order, so the ground is painted before
   * a single stone and no depth sort can ever put it in front of the monument.
   * That is also why it can be a flat revolved disc in one colour: subdivided
   * into rings only so that a camera wheeled in close loses the cell it stands
   * on rather than the whole plain. */
  'Stonehenge': {
    "format": 2,
    "nodes": [
      {
        "id": "gcol",
        "type": "params/swatch",
        "x": 260,
        "y": 2870,
        "values": {
          "hex": "#2e2924",
          "a": 1
        },
        "label": "the plain"
      },
      {
        "id": "gser",
        "type": "sets/series",
        "x": 490,
        "y": 2870,
        "values": {
          "S": 0,
          "N": 140,
          "C": 5
        },
        "label": "radii out to 560"
      },
      {
        "id": "gpt",
        "type": "vec/construct",
        "x": 720,
        "y": 2870,
        "values": {}
      },
      {
        "id": "gpl",
        "type": "crv/polyline",
        "x": 950,
        "y": 2870,
        "values": {
          "C": false
        },
        "label": "a flat profile"
      },
      {
        "id": "grnd",
        "type": "d3/revolve",
        "x": 1180,
        "y": 2870,
        "values": {
          "N": 40,
          "A": 6.283185307179586
        },
        "label": "spun into rings"
      },
      {
        "id": "gpj",
        "type": "d3/project",
        "x": 1410,
        "y": 2870,
        "values": {
          "mode": "shaded"
        }
      },
      {
        "id": "gdraw",
        "type": "disp/draw",
        "x": 1640,
        "y": 2870,
        "values": {
          "W": 1
        },
        "label": "drawn FIRST — see the note"
      },
      {
        "id": "sRad",
        "type": "params/slider",
        "x": 30,
        "y": 40,
        "values": {
          "min": 120,
          "max": 250,
          "value": 180,
          "label": "Ring radius"
        }
      },
      {
        "id": "sHgt",
        "type": "params/slider",
        "x": 30,
        "y": 170,
        "values": {
          "min": 26,
          "max": 74,
          "value": 46,
          "label": "Stone height"
        }
      },
      {
        "id": "sRuin",
        "type": "params/slider",
        "x": 30,
        "y": 300,
        "values": {
          "min": 0.1,
          "max": 0.9,
          "value": 0.42,
          "label": "Ruin"
        }
      },
      {
        "id": "ss",
        "type": "sets/series",
        "x": 260,
        "y": 40,
        "values": {
          "S": 0,
          "N": 1,
          "C": 30
        },
        "label": "30 sockets"
      },
      {
        "id": "sjA",
        "type": "sets/random",
        "x": 260,
        "y": 170,
        "values": {
          "N": 30,
          "A": -0.04,
          "B": 0.04,
          "S": 5
        },
        "label": "angle jitter"
      },
      {
        "id": "sjH",
        "type": "sets/random",
        "x": 260,
        "y": 300,
        "values": {
          "N": 30,
          "A": -5,
          "B": 7,
          "S": 12
        },
        "label": "height jitter"
      },
      {
        "id": "sjR",
        "type": "sets/random",
        "x": 260,
        "y": 430,
        "values": {
          "N": 30,
          "A": -7,
          "B": 7,
          "S": 23
        },
        "label": "radius jitter"
      },
      {
        "id": "srnd",
        "type": "sets/random",
        "x": 260,
        "y": 560,
        "values": {
          "N": 30,
          "A": 0,
          "B": 1,
          "S": 3
        },
        "label": "survival roll"
      },
      {
        "id": "sjT",
        "type": "sets/random",
        "x": 260,
        "y": 690,
        "values": {
          "N": 30,
          "A": -0.075,
          "B": 0.075,
          "S": 57
        },
        "label": "lean jitter"
      },
      {
        "id": "sang",
        "type": "math/mul",
        "x": 490,
        "y": 40,
        "values": {
          "B": 0.20943951023931953
        },
        "label": "socket angle"
      },
      {
        "id": "sh2",
        "type": "math/add",
        "x": 490,
        "y": 300,
        "values": {},
        "label": "stone height"
      },
      {
        "id": "sz",
        "type": "math/add",
        "x": 490,
        "y": 430,
        "values": {},
        "label": "stone radius"
      },
      {
        "id": "sjW",
        "type": "sets/random",
        "x": 490,
        "y": 690,
        "values": {
          "N": 30,
          "A": 19,
          "B": 28,
          "S": 71
        },
        "label": "width jitter"
      },
      {
        "id": "sa2",
        "type": "math/add",
        "x": 720,
        "y": 40,
        "values": {},
        "label": "angle + jitter"
      },
      {
        "id": "sy",
        "type": "math/mul",
        "x": 720,
        "y": 300,
        "values": {
          "B": -0.5
        },
        "label": "half height up"
      },
      {
        "id": "sscore",
        "type": "math/expr",
        "x": 720,
        "y": 560,
        "values": {
          "expr": "X + Z*cos(Y)",
          "Z": 0.58
        },
        "label": "survival score"
      },
      {
        "id": "sp",
        "type": "d3/point3",
        "x": 950,
        "y": 300,
        "values": {},
        "label": "socket, on +z"
      },
      {
        "id": "sstand",
        "type": "math/cmp",
        "x": 950,
        "y": 560,
        "values": {
          "mode": ">"
        },
        "label": "still standing"
      },
      {
        "id": "t0",
        "type": "math/sub",
        "x": 950,
        "y": 690,
        "values": {
          "B": 0.18
        },
        "label": "fallen floor"
      },
      {
        "id": "sbp",
        "type": "d3/point3",
        "x": 1180,
        "y": 170,
        "values": {
          "Y": 0
        },
        "label": "its base, to lean about"
      },
      {
        "id": "sbox",
        "type": "d3/box",
        "x": 1180,
        "y": 300,
        "values": {
          "W": 23,
          "D": 13
        },
        "label": "sarsen upright"
      },
      {
        "id": "sfp",
        "type": "d3/point3",
        "x": 1180,
        "y": 430,
        "values": {
          "Y": -7
        },
        "label": "toppled centre"
      },
      {
        "id": "snot",
        "type": "math/logic",
        "x": 1180,
        "y": 560,
        "values": {
          "mode": "not"
        }
      },
      {
        "id": "sabove",
        "type": "math/cmp",
        "x": 1180,
        "y": 690,
        "values": {
          "mode": ">"
        }
      },
      {
        "id": "stilt",
        "type": "d3/rotate3",
        "x": 1410,
        "y": 300,
        "values": {
          "A": {
            "x": 1,
            "y": 0,
            "z": 0
          }
        },
        "label": "nothing stands quite straight"
      },
      {
        "id": "sfbox",
        "type": "d3/box",
        "x": 1410,
        "y": 430,
        "values": {
          "W": 23,
          "H": 13
        },
        "label": "toppled slab"
      },
      {
        "id": "sfall",
        "type": "math/logic",
        "x": 1410,
        "y": 620,
        "values": {
          "mode": "and"
        },
        "label": "down but not gone"
      },
      {
        "id": "srot",
        "type": "d3/rotate3",
        "x": 1640,
        "y": 300,
        "values": {
          "A": {
            "x": 0,
            "y": 1,
            "z": 0
          }
        },
        "label": "swing onto the ring"
      },
      {
        "id": "scull",
        "type": "sets/cullpat",
        "x": 1870,
        "y": 300,
        "values": {},
        "label": "the standing stones"
      },
      {
        "id": "sfrot",
        "type": "d3/rotate3",
        "x": 1870,
        "y": 430,
        "values": {
          "A": {
            "x": 0,
            "y": 1,
            "z": 0
          }
        }
      },
      {
        "id": "sfcull",
        "type": "sets/cullpat",
        "x": 2100,
        "y": 430,
        "values": {},
        "label": "the fallen ones"
      },
      {
        "id": "lhi",
        "type": "math/add",
        "x": 490,
        "y": 1080,
        "values": {
          "B": 0.15
        },
        "label": "lintels need better than that"
      },
      {
        "id": "lang",
        "type": "math/add",
        "x": 720,
        "y": 820,
        "values": {
          "B": 0.10471975511965977
        },
        "label": "half a step over"
      },
      {
        "id": "lhsh",
        "type": "sets/shift",
        "x": 720,
        "y": 950,
        "values": {
          "S": 1,
          "W": true
        },
        "label": "next stone's height"
      },
      {
        "id": "lcmp",
        "type": "math/cmp",
        "x": 720,
        "y": 1080,
        "values": {
          "mode": ">"
        },
        "label": "the most intact arc"
      },
      {
        "id": "lhmax",
        "type": "math/max",
        "x": 950,
        "y": 950,
        "values": {},
        "label": "rest on the taller"
      },
      {
        "id": "lw",
        "type": "math/expr",
        "x": 1180,
        "y": 820,
        "values": {
          "expr": "2*X*sin(Y)*1.02",
          "Y": 0.10471975511965977
        },
        "label": "chord = lintel span"
      },
      {
        "id": "ly",
        "type": "math/expr",
        "x": 1180,
        "y": 950,
        "values": {
          "expr": "-(X + Y/2)",
          "Y": 9
        }
      },
      {
        "id": "lpsh",
        "type": "sets/shift",
        "x": 1180,
        "y": 1080,
        "values": {
          "S": 1,
          "W": true
        }
      },
      {
        "id": "lp",
        "type": "d3/point3",
        "x": 1410,
        "y": 950,
        "values": {}
      },
      {
        "id": "land",
        "type": "math/logic",
        "x": 1410,
        "y": 1080,
        "values": {
          "mode": "and"
        },
        "label": "both neighbours up"
      },
      {
        "id": "lbox",
        "type": "d3/box",
        "x": 1640,
        "y": 950,
        "values": {
          "H": 9,
          "D": 15
        },
        "label": "lintel"
      },
      {
        "id": "lrot",
        "type": "d3/rotate3",
        "x": 1870,
        "y": 950,
        "values": {
          "A": {
            "x": 0,
            "y": 1,
            "z": 0
          }
        }
      },
      {
        "id": "lcull",
        "type": "sets/cullpat",
        "x": 2100,
        "y": 950,
        "values": {},
        "label": "the surviving run"
      },
      {
        "id": "sTri",
        "type": "params/slider",
        "x": 30,
        "y": 1240,
        "values": {
          "min": 52,
          "max": 130,
          "value": 92,
          "label": "Trilithon height"
        }
      },
      {
        "id": "sHorse",
        "type": "params/slider",
        "x": 30,
        "y": 1370,
        "values": {
          "min": 60,
          "max": 140,
          "value": 88,
          "label": "Horseshoe radius"
        }
      },
      {
        "id": "ts",
        "type": "sets/series",
        "x": 260,
        "y": 1240,
        "values": {
          "S": 0,
          "N": 1,
          "C": 10
        },
        "label": "5 pairs = 10 uprights"
      },
      {
        "id": "tdiv",
        "type": "math/div",
        "x": 490,
        "y": 1240,
        "values": {
          "B": 2
        }
      },
      {
        "id": "tmod",
        "type": "math/mod",
        "x": 490,
        "y": 1370,
        "values": {
          "B": 2
        }
      },
      {
        "id": "tk",
        "type": "math/floor",
        "x": 720,
        "y": 1240,
        "values": {},
        "label": "which trilithon"
      },
      {
        "id": "tside",
        "type": "math/expr",
        "x": 720,
        "y": 1370,
        "values": {
          "expr": "X*2 - 1"
        },
        "label": "left / right"
      },
      {
        "id": "tev",
        "type": "math/cmp",
        "x": 720,
        "y": 1500,
        "values": {
          "mode": "=",
          "B": 0
        },
        "label": "one per pair"
      },
      {
        "id": "tang",
        "type": "math/expr",
        "x": 950,
        "y": 1240,
        "values": {
          "expr": "Y + X*Z",
          "Y": 1.1915926535897934,
          "Z": 0.975
        },
        "label": "horseshoe, open to the avenue"
      },
      {
        "id": "th",
        "type": "math/expr",
        "x": 950,
        "y": 1370,
        "values": {
          "expr": "Y - Z*abs(X - 2)",
          "Z": 11
        },
        "label": "tallest at the apex"
      },
      {
        "id": "tx",
        "type": "math/mul",
        "x": 950,
        "y": 1500,
        "values": {
          "B": 15
        },
        "label": "the narrow gap"
      },
      {
        "id": "tacull",
        "type": "sets/cullpat",
        "x": 1180,
        "y": 1240,
        "values": {}
      },
      {
        "id": "ty",
        "type": "math/mul",
        "x": 1180,
        "y": 1370,
        "values": {
          "B": -0.5
        }
      },
      {
        "id": "tp",
        "type": "d3/point3",
        "x": 1180,
        "y": 1500,
        "values": {}
      },
      {
        "id": "thcull",
        "type": "sets/cullpat",
        "x": 1410,
        "y": 1240,
        "values": {}
      },
      {
        "id": "tbox",
        "type": "d3/box",
        "x": 1410,
        "y": 1500,
        "values": {
          "W": 24,
          "D": 15
        },
        "label": "trilithon upright"
      },
      {
        "id": "tly",
        "type": "math/expr",
        "x": 1640,
        "y": 1240,
        "values": {
          "expr": "-(X + Y/2)",
          "Y": 12
        }
      },
      {
        "id": "trot",
        "type": "d3/rotate3",
        "x": 1640,
        "y": 1500,
        "values": {
          "A": {
            "x": 0,
            "y": 1,
            "z": 0
          }
        }
      },
      {
        "id": "tlp",
        "type": "d3/point3",
        "x": 1870,
        "y": 1240,
        "values": {}
      },
      {
        "id": "tlbox",
        "type": "d3/box",
        "x": 2100,
        "y": 1240,
        "values": {
          "W": 62,
          "H": 12,
          "D": 17
        },
        "label": "trilithon lintel"
      },
      {
        "id": "tlrot",
        "type": "d3/rotate3",
        "x": 2330,
        "y": 1240,
        "values": {
          "A": {
            "x": 0,
            "y": 1,
            "z": 0
          }
        }
      },
      {
        "id": "bs",
        "type": "sets/series",
        "x": 260,
        "y": 1920,
        "values": {
          "S": 0,
          "N": 1,
          "C": 26
        }
      },
      {
        "id": "bjA",
        "type": "sets/random",
        "x": 260,
        "y": 2050,
        "values": {
          "N": 26,
          "A": -0.06,
          "B": 0.06,
          "S": 31
        }
      },
      {
        "id": "bh",
        "type": "sets/random",
        "x": 260,
        "y": 2180,
        "values": {
          "N": 26,
          "A": 15,
          "B": 29,
          "S": 41
        },
        "label": "no two alike"
      },
      {
        "id": "brnd",
        "type": "sets/random",
        "x": 260,
        "y": 2310,
        "values": {
          "N": 26,
          "A": 0,
          "B": 1,
          "S": 17
        }
      },
      {
        "id": "bang",
        "type": "math/mul",
        "x": 490,
        "y": 1920,
        "values": {
          "B": 0.24166097335362405
        }
      },
      {
        "id": "by",
        "type": "math/mul",
        "x": 490,
        "y": 2180,
        "values": {
          "B": -0.5
        }
      },
      {
        "id": "bcmp",
        "type": "math/cmp",
        "x": 490,
        "y": 2310,
        "values": {
          "mode": ">",
          "B": 0.42
        }
      },
      {
        "id": "ba2",
        "type": "math/add",
        "x": 720,
        "y": 1920,
        "values": {}
      },
      {
        "id": "bp",
        "type": "d3/point3",
        "x": 720,
        "y": 2180,
        "values": {
          "Z": 124
        }
      },
      {
        "id": "bbox",
        "type": "d3/box",
        "x": 950,
        "y": 2180,
        "values": {
          "W": 13,
          "D": 9
        },
        "label": "bluestone"
      },
      {
        "id": "brot",
        "type": "d3/rotate3",
        "x": 1180,
        "y": 2180,
        "values": {
          "A": {
            "x": 0,
            "y": 1,
            "z": 0
          }
        }
      },
      {
        "id": "bcull",
        "type": "sets/cullpat",
        "x": 1410,
        "y": 2180,
        "values": {},
        "label": "what is left of the ring"
      },
      {
        "id": "heel",
        "type": "d3/box",
        "x": 260,
        "y": 2480,
        "values": {
          "P": {
            "x": 0,
            "y": -32,
            "z": 265
          },
          "W": 22,
          "H": 64,
          "D": 18
        },
        "label": "Heel Stone"
      },
      {
        "id": "slau",
        "type": "d3/box",
        "x": 260,
        "y": 2610,
        "values": {
          "P": {
            "x": -46,
            "y": -7,
            "z": 224
          },
          "W": 62,
          "H": 14,
          "D": 22
        },
        "label": "Slaughter Stone"
      },
      {
        "id": "altar",
        "type": "d3/box",
        "x": 260,
        "y": 2740,
        "values": {
          "P": {
            "x": 0,
            "y": -8,
            "z": -68
          },
          "W": 78,
          "H": 16,
          "D": 22
        },
        "label": "Altar Stone"
      },
      {
        "id": "heelr",
        "type": "d3/rotate3",
        "x": 490,
        "y": 2480,
        "values": {
          "R": 0.17,
          "A": {
            "x": 1,
            "y": 0,
            "z": 0
          },
          "C": {
            "x": 0,
            "y": 0,
            "z": 265
          }
        },
        "label": "its famous lean"
      },
      {
        "id": "sSun",
        "type": "params/slider",
        "x": 30,
        "y": 3010,
        "values": {
          "min": -0.7,
          "max": -0.05,
          "value": -0.22,
          "label": "Sun height"
        }
      },
      {
        "id": "sDrift",
        "type": "params/slider",
        "x": 30,
        "y": 3140,
        "values": {
          "min": -0.2,
          "max": 0.2,
          "value": 0.05,
          "label": "Drift"
        }
      },
      {
        "id": "turn",
        "type": "input/turntable",
        "x": 260,
        "y": 3010,
        "values": {}
      },
      {
        "id": "yaw",
        "type": "math/add",
        "x": 490,
        "y": 3010,
        "values": {
          "B": 3.6
        }
      },
      {
        "id": "orb",
        "type": "d3/orbit",
        "x": 720,
        "y": 3010,
        "values": {
          "T": {
            "x": 0,
            "y": -34,
            "z": 0
          },
          "D": 760,
          "E": 0.27,
          "F": 46
        },
        "label": "drag to walk round it"
      },
      {
        "id": "la",
        "type": "math/add",
        "x": 950,
        "y": 3010,
        "values": {
          "B": -1.35
        },
        "label": "a step round from the eye"
      },
      {
        "id": "lsx",
        "type": "math/sin",
        "x": 1180,
        "y": 3010,
        "values": {}
      },
      {
        "id": "lcz",
        "type": "math/cos",
        "x": 1180,
        "y": 3140,
        "values": {}
      },
      {
        "id": "lnz",
        "type": "math/neg",
        "x": 1410,
        "y": 3140,
        "values": {}
      },
      {
        "id": "sun",
        "type": "d3/point3",
        "x": 1640,
        "y": 3010,
        "values": {},
        "label": "a low sun, off the shoulder"
      },
      {
        "id": "pj",
        "type": "d3/project",
        "x": 2560,
        "y": 1500,
        "values": {
          "mode": "shaded"
        },
        "label": "one sort for the whole site"
      },
      {
        "id": "rmL",
        "type": "math/remap",
        "x": 2790,
        "y": 1630,
        "values": {
          "S0": 0,
          "S1": 1,
          "T0": 0.1,
          "T1": 0.7
        },
        "label": "shade → lightness"
      },
      {
        "id": "rmS",
        "type": "math/remap",
        "x": 2790,
        "y": 1760,
        "values": {
          "S0": 0,
          "S1": 1,
          "T0": 0.06,
          "T1": 0.24
        },
        "label": "lit stone runs warmer"
      },
      {
        "id": "hsl",
        "type": "disp/hsl",
        "x": 3020,
        "y": 1700,
        "values": {
          "H": 0.085
        }
      },
      {
        "id": "draw",
        "type": "disp/draw",
        "x": 3250,
        "y": 1500,
        "values": {
          "W": 1
        },
        "label": "every face, one Draw"
      },
      {
        "id": "bg",
        "type": "disp/bg",
        "x": 3250,
        "y": 1700,
        "values": {
          "C": {
            "r": 9,
            "g": 10,
            "b": 14,
            "a": 1
          }
        }
      }
    ],
    "wires": [
      {
        "from": [
          "sRad",
          "N"
        ],
        "to": [
          "sz",
          "A"
        ]
      },
      {
        "from": [
          "sRad",
          "N"
        ],
        "to": [
          "lw",
          "X"
        ]
      },
      {
        "from": [
          "sRad",
          "N"
        ],
        "to": [
          "lp",
          "Z"
        ]
      },
      {
        "from": [
          "sHgt",
          "N"
        ],
        "to": [
          "sh2",
          "A"
        ]
      },
      {
        "from": [
          "sRuin",
          "N"
        ],
        "to": [
          "sstand",
          "B"
        ]
      },
      {
        "from": [
          "sRuin",
          "N"
        ],
        "to": [
          "t0",
          "A"
        ]
      },
      {
        "from": [
          "ss",
          "S"
        ],
        "to": [
          "sang",
          "A"
        ]
      },
      {
        "from": [
          "sang",
          "R"
        ],
        "to": [
          "sa2",
          "A"
        ]
      },
      {
        "from": [
          "sang",
          "R"
        ],
        "to": [
          "sscore",
          "Y"
        ]
      },
      {
        "from": [
          "sang",
          "R"
        ],
        "to": [
          "lang",
          "A"
        ]
      },
      {
        "from": [
          "sjA",
          "R"
        ],
        "to": [
          "sa2",
          "B"
        ]
      },
      {
        "from": [
          "sjH",
          "R"
        ],
        "to": [
          "sh2",
          "B"
        ]
      },
      {
        "from": [
          "sjR",
          "R"
        ],
        "to": [
          "sz",
          "B"
        ]
      },
      {
        "from": [
          "srnd",
          "R"
        ],
        "to": [
          "sscore",
          "X"
        ]
      },
      {
        "from": [
          "sh2",
          "R"
        ],
        "to": [
          "sy",
          "A"
        ]
      },
      {
        "from": [
          "sh2",
          "R"
        ],
        "to": [
          "sbox",
          "H"
        ]
      },
      {
        "from": [
          "sh2",
          "R"
        ],
        "to": [
          "sfbox",
          "D"
        ]
      },
      {
        "from": [
          "sh2",
          "R"
        ],
        "to": [
          "lhsh",
          "L"
        ]
      },
      {
        "from": [
          "sh2",
          "R"
        ],
        "to": [
          "lhmax",
          "A"
        ]
      },
      {
        "from": [
          "sy",
          "R"
        ],
        "to": [
          "sp",
          "Y"
        ]
      },
      {
        "from": [
          "sz",
          "R"
        ],
        "to": [
          "sp",
          "Z"
        ]
      },
      {
        "from": [
          "sz",
          "R"
        ],
        "to": [
          "sfp",
          "Z"
        ]
      },
      {
        "from": [
          "sp",
          "P"
        ],
        "to": [
          "sbox",
          "P"
        ]
      },
      {
        "from": [
          "sa2",
          "R"
        ],
        "to": [
          "srot",
          "R"
        ]
      },
      {
        "from": [
          "sa2",
          "R"
        ],
        "to": [
          "sfrot",
          "R"
        ]
      },
      {
        "from": [
          "srot",
          "G"
        ],
        "to": [
          "scull",
          "L"
        ]
      },
      {
        "from": [
          "sscore",
          "R"
        ],
        "to": [
          "sstand",
          "A"
        ]
      },
      {
        "from": [
          "sscore",
          "R"
        ],
        "to": [
          "sabove",
          "A"
        ]
      },
      {
        "from": [
          "t0",
          "R"
        ],
        "to": [
          "sabove",
          "B"
        ]
      },
      {
        "from": [
          "sstand",
          "R"
        ],
        "to": [
          "scull",
          "P"
        ]
      },
      {
        "from": [
          "sstand",
          "R"
        ],
        "to": [
          "snot",
          "A"
        ]
      },
      {
        "from": [
          "sRuin",
          "N"
        ],
        "to": [
          "lhi",
          "A"
        ]
      },
      {
        "from": [
          "sscore",
          "R"
        ],
        "to": [
          "lcmp",
          "A"
        ]
      },
      {
        "from": [
          "lhi",
          "R"
        ],
        "to": [
          "lcmp",
          "B"
        ]
      },
      {
        "from": [
          "lcmp",
          "R"
        ],
        "to": [
          "lpsh",
          "L"
        ]
      },
      {
        "from": [
          "lcmp",
          "R"
        ],
        "to": [
          "land",
          "A"
        ]
      },
      {
        "from": [
          "sabove",
          "R"
        ],
        "to": [
          "sfall",
          "A"
        ]
      },
      {
        "from": [
          "snot",
          "R"
        ],
        "to": [
          "sfall",
          "B"
        ]
      },
      {
        "from": [
          "sfp",
          "P"
        ],
        "to": [
          "sfbox",
          "P"
        ]
      },
      {
        "from": [
          "sfbox",
          "G"
        ],
        "to": [
          "sfrot",
          "G"
        ]
      },
      {
        "from": [
          "sfrot",
          "G"
        ],
        "to": [
          "sfcull",
          "L"
        ]
      },
      {
        "from": [
          "sfall",
          "R"
        ],
        "to": [
          "sfcull",
          "P"
        ]
      },
      {
        "from": [
          "lhsh",
          "L"
        ],
        "to": [
          "lhmax",
          "B"
        ]
      },
      {
        "from": [
          "lhmax",
          "R"
        ],
        "to": [
          "ly",
          "X"
        ]
      },
      {
        "from": [
          "ly",
          "R"
        ],
        "to": [
          "lp",
          "Y"
        ]
      },
      {
        "from": [
          "lp",
          "P"
        ],
        "to": [
          "lbox",
          "P"
        ]
      },
      {
        "from": [
          "lw",
          "R"
        ],
        "to": [
          "lbox",
          "W"
        ]
      },
      {
        "from": [
          "lbox",
          "G"
        ],
        "to": [
          "lrot",
          "G"
        ]
      },
      {
        "from": [
          "lang",
          "R"
        ],
        "to": [
          "lrot",
          "R"
        ]
      },
      {
        "from": [
          "lrot",
          "G"
        ],
        "to": [
          "lcull",
          "L"
        ]
      },
      {
        "from": [
          "lpsh",
          "L"
        ],
        "to": [
          "land",
          "B"
        ]
      },
      {
        "from": [
          "land",
          "R"
        ],
        "to": [
          "lcull",
          "P"
        ]
      },
      {
        "from": [
          "sTri",
          "N"
        ],
        "to": [
          "th",
          "Y"
        ]
      },
      {
        "from": [
          "sHorse",
          "N"
        ],
        "to": [
          "tp",
          "Z"
        ]
      },
      {
        "from": [
          "sHorse",
          "N"
        ],
        "to": [
          "tlp",
          "Z"
        ]
      },
      {
        "from": [
          "ts",
          "S"
        ],
        "to": [
          "tdiv",
          "A"
        ]
      },
      {
        "from": [
          "ts",
          "S"
        ],
        "to": [
          "tmod",
          "A"
        ]
      },
      {
        "from": [
          "tdiv",
          "R"
        ],
        "to": [
          "tk",
          "V"
        ]
      },
      {
        "from": [
          "tmod",
          "R"
        ],
        "to": [
          "tside",
          "X"
        ]
      },
      {
        "from": [
          "tmod",
          "R"
        ],
        "to": [
          "tev",
          "A"
        ]
      },
      {
        "from": [
          "tk",
          "R"
        ],
        "to": [
          "tang",
          "X"
        ]
      },
      {
        "from": [
          "tk",
          "R"
        ],
        "to": [
          "th",
          "X"
        ]
      },
      {
        "from": [
          "tside",
          "R"
        ],
        "to": [
          "tx",
          "A"
        ]
      },
      {
        "from": [
          "tx",
          "R"
        ],
        "to": [
          "tp",
          "X"
        ]
      },
      {
        "from": [
          "th",
          "R"
        ],
        "to": [
          "ty",
          "A"
        ]
      },
      {
        "from": [
          "th",
          "R"
        ],
        "to": [
          "tbox",
          "H"
        ]
      },
      {
        "from": [
          "th",
          "R"
        ],
        "to": [
          "thcull",
          "L"
        ]
      },
      {
        "from": [
          "ty",
          "R"
        ],
        "to": [
          "tp",
          "Y"
        ]
      },
      {
        "from": [
          "tp",
          "P"
        ],
        "to": [
          "tbox",
          "P"
        ]
      },
      {
        "from": [
          "tbox",
          "G"
        ],
        "to": [
          "trot",
          "G"
        ]
      },
      {
        "from": [
          "tang",
          "R"
        ],
        "to": [
          "trot",
          "R"
        ]
      },
      {
        "from": [
          "tang",
          "R"
        ],
        "to": [
          "tacull",
          "L"
        ]
      },
      {
        "from": [
          "tev",
          "R"
        ],
        "to": [
          "tacull",
          "P"
        ]
      },
      {
        "from": [
          "tev",
          "R"
        ],
        "to": [
          "thcull",
          "P"
        ]
      },
      {
        "from": [
          "thcull",
          "L"
        ],
        "to": [
          "tly",
          "X"
        ]
      },
      {
        "from": [
          "tly",
          "R"
        ],
        "to": [
          "tlp",
          "Y"
        ]
      },
      {
        "from": [
          "tlp",
          "P"
        ],
        "to": [
          "tlbox",
          "P"
        ]
      },
      {
        "from": [
          "tlbox",
          "G"
        ],
        "to": [
          "tlrot",
          "G"
        ]
      },
      {
        "from": [
          "tacull",
          "L"
        ],
        "to": [
          "tlrot",
          "R"
        ]
      },
      {
        "from": [
          "bs",
          "S"
        ],
        "to": [
          "bang",
          "A"
        ]
      },
      {
        "from": [
          "bang",
          "R"
        ],
        "to": [
          "ba2",
          "A"
        ]
      },
      {
        "from": [
          "bjA",
          "R"
        ],
        "to": [
          "ba2",
          "B"
        ]
      },
      {
        "from": [
          "bh",
          "R"
        ],
        "to": [
          "by",
          "A"
        ]
      },
      {
        "from": [
          "bh",
          "R"
        ],
        "to": [
          "bbox",
          "H"
        ]
      },
      {
        "from": [
          "by",
          "R"
        ],
        "to": [
          "bp",
          "Y"
        ]
      },
      {
        "from": [
          "bp",
          "P"
        ],
        "to": [
          "bbox",
          "P"
        ]
      },
      {
        "from": [
          "bbox",
          "G"
        ],
        "to": [
          "brot",
          "G"
        ]
      },
      {
        "from": [
          "ba2",
          "R"
        ],
        "to": [
          "brot",
          "R"
        ]
      },
      {
        "from": [
          "brot",
          "G"
        ],
        "to": [
          "bcull",
          "L"
        ]
      },
      {
        "from": [
          "brnd",
          "R"
        ],
        "to": [
          "bcmp",
          "A"
        ]
      },
      {
        "from": [
          "bcmp",
          "R"
        ],
        "to": [
          "bcull",
          "P"
        ]
      },
      {
        "from": [
          "heel",
          "G"
        ],
        "to": [
          "heelr",
          "G"
        ]
      },
      {
        "from": [
          "sDrift",
          "N"
        ],
        "to": [
          "turn",
          "R"
        ]
      },
      {
        "from": [
          "turn",
          "T"
        ],
        "to": [
          "yaw",
          "A"
        ]
      },
      {
        "from": [
          "yaw",
          "R"
        ],
        "to": [
          "orb",
          "A"
        ]
      },
      {
        "from": [
          "scull",
          "L"
        ],
        "to": [
          "pj",
          "G"
        ]
      },
      {
        "from": [
          "sfcull",
          "L"
        ],
        "to": [
          "pj",
          "G"
        ]
      },
      {
        "from": [
          "lcull",
          "L"
        ],
        "to": [
          "pj",
          "G"
        ]
      },
      {
        "from": [
          "trot",
          "G"
        ],
        "to": [
          "pj",
          "G"
        ]
      },
      {
        "from": [
          "tlrot",
          "G"
        ],
        "to": [
          "pj",
          "G"
        ]
      },
      {
        "from": [
          "bcull",
          "L"
        ],
        "to": [
          "pj",
          "G"
        ]
      },
      {
        "from": [
          "heelr",
          "G"
        ],
        "to": [
          "pj",
          "G"
        ]
      },
      {
        "from": [
          "slau",
          "G"
        ],
        "to": [
          "pj",
          "G"
        ]
      },
      {
        "from": [
          "altar",
          "G"
        ],
        "to": [
          "pj",
          "G"
        ]
      },
      {
        "from": [
          "orb",
          "C"
        ],
        "to": [
          "pj",
          "C"
        ]
      },
      {
        "from": [
          "sun",
          "P"
        ],
        "to": [
          "pj",
          "L"
        ]
      },
      {
        "from": [
          "pj",
          "S"
        ],
        "to": [
          "rmL",
          "V"
        ]
      },
      {
        "from": [
          "pj",
          "S"
        ],
        "to": [
          "rmS",
          "V"
        ]
      },
      {
        "from": [
          "rmL",
          "R"
        ],
        "to": [
          "hsl",
          "L"
        ]
      },
      {
        "from": [
          "rmS",
          "R"
        ],
        "to": [
          "hsl",
          "S"
        ]
      },
      {
        "from": [
          "pj",
          "F"
        ],
        "to": [
          "draw",
          "G"
        ]
      },
      {
        "from": [
          "hsl",
          "C"
        ],
        "to": [
          "draw",
          "F"
        ]
      },
      {
        "from": [
          "hsl",
          "C"
        ],
        "to": [
          "draw",
          "S"
        ]
      },
      {
        "from": [
          "orb",
          "A"
        ],
        "to": [
          "la",
          "A"
        ]
      },
      {
        "from": [
          "la",
          "R"
        ],
        "to": [
          "lsx",
          "V"
        ]
      },
      {
        "from": [
          "la",
          "R"
        ],
        "to": [
          "lcz",
          "V"
        ]
      },
      {
        "from": [
          "lcz",
          "R"
        ],
        "to": [
          "lnz",
          "V"
        ]
      },
      {
        "from": [
          "lsx",
          "R"
        ],
        "to": [
          "sun",
          "X"
        ]
      },
      {
        "from": [
          "sSun",
          "N"
        ],
        "to": [
          "sun",
          "Y"
        ]
      },
      {
        "from": [
          "lnz",
          "R"
        ],
        "to": [
          "sun",
          "Z"
        ]
      },
      {
        "from": [
          "sz",
          "R"
        ],
        "to": [
          "sbp",
          "Z"
        ]
      },
      {
        "from": [
          "sbox",
          "G"
        ],
        "to": [
          "stilt",
          "G"
        ]
      },
      {
        "from": [
          "sjT",
          "R"
        ],
        "to": [
          "stilt",
          "R"
        ]
      },
      {
        "from": [
          "sbp",
          "P"
        ],
        "to": [
          "stilt",
          "C"
        ]
      },
      {
        "from": [
          "stilt",
          "G"
        ],
        "to": [
          "srot",
          "G"
        ]
      },
      {
        "from": [
          "orb",
          "C"
        ],
        "to": [
          "gpj",
          "C"
        ]
      },
      {
        "from": [
          "gpj",
          "F"
        ],
        "to": [
          "gdraw",
          "G"
        ]
      },
      {
        "from": [
          "gcol",
          "C"
        ],
        "to": [
          "gdraw",
          "F"
        ]
      },
      {
        "from": [
          "gcol",
          "C"
        ],
        "to": [
          "gdraw",
          "S"
        ]
      },
      {
        "from": [
          "gser",
          "S"
        ],
        "to": [
          "gpt",
          "X"
        ]
      },
      {
        "from": [
          "gpt",
          "P"
        ],
        "to": [
          "gpl",
          "V"
        ]
      },
      {
        "from": [
          "gpl",
          "C"
        ],
        "to": [
          "grnd",
          "G"
        ]
      },
      {
        "from": [
          "grnd",
          "G"
        ],
        "to": [
          "gpj",
          "G"
        ]
      },
      {
        "from": [
          "sjW",
          "R"
        ],
        "to": [
          "sbox",
          "W"
        ]
      }
    ],
    "groups": [
      {
        "id": "gA",
        "x": 20,
        "y": 0,
        "w": 2260,
        "h": 800,
        "title": "sarsen circle — 30 sockets, and which of them are still up",
        "nodes": [
          "ss",
          "sjA",
          "sjH",
          "sjR",
          "srnd",
          "sang",
          "sh2",
          "sz",
          "sa2",
          "sy",
          "sscore",
          "sp",
          "sstand",
          "t0",
          "sbox",
          "sfp",
          "snot",
          "sabove",
          "srot",
          "sfbox",
          "sfall",
          "scull",
          "sfrot",
          "sfcull",
          "sjT",
          "sbp",
          "stilt",
          "sjW",
          "sRad",
          "sHgt",
          "sRuin"
        ]
      },
      {
        "id": "gB",
        "x": 465,
        "y": 810,
        "w": 1825,
        "h": 380,
        "title": "lintels — one bridges a gap only where both its stones survive",
        "nodes": [
          "lang",
          "lhsh",
          "lhmax",
          "lw",
          "ly",
          "lhi",
          "lcmp",
          "lpsh",
          "lp",
          "land",
          "lbox",
          "lrot",
          "lcull"
        ]
      },
      {
        "id": "gC",
        "x": 20,
        "y": 1210,
        "w": 2495,
        "h": 400,
        "title": "trilithon horseshoe — five pairs from one 10-item list",
        "nodes": [
          "ts",
          "tdiv",
          "tmod",
          "tk",
          "tside",
          "tev",
          "tang",
          "th",
          "tx",
          "tacull",
          "ty",
          "tp",
          "thcull",
          "tbox",
          "tly",
          "trot",
          "tlp",
          "tlbox",
          "tlrot",
          "sTri",
          "sHorse"
        ]
      },
      {
        "id": "gD",
        "x": 235,
        "y": 1880,
        "w": 1360,
        "h": 530,
        "title": "bluestone circle",
        "nodes": [
          "bs",
          "bjA",
          "bh",
          "brnd",
          "bang",
          "by",
          "bcmp",
          "ba2",
          "bp",
          "bbox",
          "brot",
          "bcull"
        ]
      },
      {
        "id": "gE",
        "x": 235,
        "y": 2440,
        "w": 1585,
        "h": 540,
        "title": "outliers, and the plain they stand on",
        "nodes": [
          "heel",
          "heelr",
          "slau",
          "altar",
          "gcol",
          "gser",
          "gpt",
          "gpl",
          "grnd",
          "gpj",
          "gdraw"
        ]
      },
      {
        "id": "gF",
        "x": 20,
        "y": 2990,
        "w": 1800,
        "h": 330,
        "title": "camera, and a sun that rides with it",
        "nodes": [
          "turn",
          "yaw",
          "orb",
          "la",
          "lsx",
          "lcz",
          "lnz",
          "sun",
          "sSun",
          "sDrift"
        ]
      },
      {
        "id": "gG",
        "x": 2525,
        "y": 1430,
        "w": 920,
        "h": 470,
        "title": "project, shade, draw",
        "nodes": [
          "pj",
          "rmL",
          "rmS",
          "hsl",
          "draw",
          "bg"
        ]
      }
    ],
    "notes": [
      {
        "id": "nt1",
        "x": 2400,
        "y": 60,
        "w": 340,
        "h": 190,
        "text": "Every stone is built once, on the +z axis, then swung onto its bearing by Rotate3 about the origin — so position and facing can never disagree. The whole site is one list of boxes."
      },
      {
        "id": "nt2",
        "x": 2400,
        "y": 300,
        "w": 340,
        "h": 210,
        "text": "Ruin is a score, not a hand-placed gap: a seeded roll plus cos(angle), so the north-east arc facing the avenue survives and the south-west falls. Above the line the stone stands, just below it lies where it fell, below that it is gone."
      },
      {
        "id": "nt3",
        "x": 2400,
        "y": 560,
        "w": 340,
        "h": 200,
        "text": "The plain is a flat circle with its own Project and Draw, and those nodes sit FIRST in the graph — so the ground is painted before a single stone. One disc, one draw item, and no depth sort can ever put it in front of the monument."
      }
    ]
  },

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
    img: 'assets/iso-field.png',
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
    blurb: 'A small machine made of memory — the disc changes the scene, the pads latch and grow the figure, the bar times how long you hold it, and if you walk away it advances itself.',
    teaches: 'The whole state family in one toy: one Hotspot and one Latch behind a list of pads are five independent machines, Select swaps each pad’s shape, Edge splits press from release, and Sample & Hold turns “seconds since you last touched anything” into a self-winding clock.',
    tags: ['hotspot', 'latch', 'counter', 'edge', 'timer', 'select', 'per-item state', 'button', 'dom'],
    needs: [], frames: 40
  },
  'Solar system': {
    cat: 'Lists & grids',
    blurb: 'The solar system as a dataflow — one Kepler machine, eight planets, real J2000 elements, and a zodiac ring the planets truly transit.',
    teaches: 'List matching at full scale: mean anomaly → true anomaly → radius, solved once and answered for eight bodies — and the zodiac is twelve glyphs in the same ecliptic frame.',
    tags: ['list matching', 'kepler', 'text list', 'data', 'orbits', 'planets', 'zodiac'],
    needs: [], frames: 40
  },
  'Scale board': {
    cat: 'Audio synthesis',
    blurb: 'The theremin grown into an instrument you can see — labelled rungs, a live trace of the melody, and real button drones underneath, the whole board tuned from one Key node.',
    teaches: 'One Key node is the tuning: its root and scale wire into every Scale node, so changing the key in one place retunes the rungs, the pointer and the drone triad together.',
    tags: ['key', 'scale', 'set union', 'dom', 'buttons', 'instrument', 'trace'],
    needs: ['gesture'], frames: 40
  },
  'Seeing Sound': {
    cat: 'Scopes & figures',
    blurb: 'One note, one interval, four ways of looking at them — sand on a plate, a pendulum web, the waveform, and the interval as a flower. Click the tabs.',
    teaches: 'Tabs are just geometry: four rects into one Hotspot, each contributing its own number to a sum, remembered through a Delay — and a view is hidden either by a Select with nothing wired into F, or by taking its colour’s alpha to zero.',
    tags: ['tabs', 'hotspot', 'delay', 'select', 'cymatics', 'harmonograph', 'rose', 'interval', 'ui'],
    needs: ['gesture'], frames: 110
  },
  'Loop pedal': {
    cat: 'Audio input',
    blurb: 'Space or the rec button toggles recording, c or clear empties the loop; the mic pours into a feedback-1 Delay and circles forever — with a click track to keep you honest.',
    teaches: 'Delay with feedback 1 IS a loop pedal — and three circles through one Hotspot become three transport buttons that meet the keyboard in a Logic (or), so both paths drive the same wire.',
    tags: ['looper', 'loop pedal', 'delay', 'overdub', 'mic', 'metronome', 'hotspot buttons'],
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
    blurb: 'One superformula in a Custom JS node, pushed to embers — three nested layers breathe their pinch with time and grade from ember orange to magenta.',
    teaches: 'Layer variation is list matching: one three-step Series fans the shape into three scales, three spins and three colours through a single Gradient node.',
    tags: ['custom js', 'superformula', 'layers', 'gradient', 'ember'],
    needs: [], frames: 60
  },
  'Intersections': {
    cat: 'Geometry',
    blurb: 'The drifting vesica as the hero, with a plate of six vignettes below it — union, intersection, difference, trim, a fillet on the kite through the crossings, and a figure-eight crossing itself.',
    teaches: 'One small pair of circles feeds every vignette and a Move drops each result into its slot, so the whole intersection toolkit breathes off a single Sine — and one Text node list-matched against six slot vectors captions all of them.',
    tags: ['intersection', 'region boolean', 'trim', 'fillet', 'self-intersection', 'multi-wire'],
    needs: [], frames: 40
  },
  'Stonehenge': {
    cat: '3D',
    blurb: 'The sarsen circle, its surviving lintels and the trilithon horseshoe, standing half-ruined on a dark plain that turns slowly under a low sun.',
    teaches: 'Ruin as arithmetic — a seeded roll biased by cos(angle) sorts thirty sockets into standing, fallen and gone, and shifting that same pattern by one place says where a lintel can still bridge two stones.',
    tags: ['3d', 'stonehenge', 'ruins', 'cull pattern', 'shift list', 'orbit camera', 'draw order'],
    needs: [], frames: 40
  },

};
