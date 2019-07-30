var path = require('path');
var fs = require('fs');

var readCString = require('./cstring.js');

var entities = require('./entities.js');
var wal2png = require('./wal2png.js');
var lightmaps = require('./lightmaps.js');
var atlas = require('./atlas.js');


module.exports = function (buffer, texturePath, palette) {
  buffer = new Uint8Array(buffer).buffer;

  var headerArray = new Uint32Array(buffer.slice(0, 160));

  var header = {
    signature: headerArray[0],
    version: headerArray[1]
  };

  if (header.signature !== 0x50534249) { // "IBSP"
    throw new Error('invalid signature');
  }

  if (header.version !== 38) {
    throw new Error('invalid version: ' + version);
  }

  [
    'entities',
    'planes',
    'vertices',
    'visibility',
    'nodes',
    'textureInformation',
    'faces',
    'lightmaps',
    'leaves',
    'leafFaceTable',
    'leafBrushTable',
    'edges',
    'faceEdges',
    'models',
    'brushes',
    'brushSides',
    'pop',
    'areas',
    'portals'
  ].forEach(function (name, index) {
    header[name] = {
      offset: headerArray[index * 2 + 2],
      size: headerArray[index * 2 + 3]
    };
  });

  var vertices = new Float32Array(buffer.slice(header.vertices.offset, header.vertices.offset + header.vertices.size));
  var edges = new Uint16Array(buffer.slice(header.edges.offset, header.edges.offset + header.edges.size));
  var faceEdges = new Int32Array(buffer.slice(header.faceEdges.offset, header.faceEdges.offset + header.faceEdges.size));
  var faces = buffer.slice(header.faces.offset, header.faces.offset + header.faces.size);
  var planes = buffer.slice(header.planes.offset, header.planes.offset + header.planes.size);
  var nodes = buffer.slice(header.nodes.offset, header.nodes.offset + header.nodes.size);
  var leaves = buffer.slice(header.leaves.offset, header.leaves.offset + header.leaves.size);
  var leafFaces = new Uint16Array(buffer.slice(header.leafFaceTable.offset, header.leafFaceTable.offset + header.leafFaceTable.size));
  var visibility = buffer.slice(header.visibility.offset, header.visibility.offset + header.visibility.size);
  var textureInformation = buffer.slice(header.textureInformation.offset, header.textureInformation.offset + header.textureInformation.size);
  var models = buffer.slice(header.models.offset, header.models.offset + header.models.size);
  var lightmapLump = buffer.slice(header.lightmaps.offset, header.lightmaps.offset + header.lightmaps.size);

  function fixVertices(vertices) {
    var vertices = Array.prototype.slice.call(vertices);
    for (var i = 0; i < vertices.length; i += 3) {
      var t = vertices[i + 1];
      vertices[i + 1] = vertices[i + 2];
      vertices[i + 2] = t;
    }
    return vertices;
  }

  var output = {
    entities: entities(readCString(buffer, header.entities.offset, header.entities.size)),
    vertices: fixVertices(vertices),
    edges: Array.prototype.slice.call(edges),
    faceEdges: Array.prototype.slice.call(faceEdges),
    faces: {
      count: header.faces.size / 20,
      edges: {
        offset: [],
        size: []
      },
      planes: [],
      textureInformation: [],
      lightmapOffset: [],  // this is temporary
      lightmapInformation: [],
    },
    planes: {
      data: [],
      type: [],
    },
    nodes: {
      count: header.nodes.size / 28,
      plane: [],
      front: [],
      back: [],
      min: [],
      max: [],
      faces: {
        first: [],
        count: [],
      },
    },
    leaves: {
      count: header.leaves.size / 28,
      cluster: [],
      min: [],
      max: [],
      faces: {
        first: [],
        count: [],
        table: Array.prototype.slice.call(leafFaces),
      },
    },
    models: {
      origin: [],
      root: [],
    },
    visibility: [],
    textureInformation: {
      u: [],
      v: [],
      x: [],
      y: [],
      w: [],
      h: [],
      flags: [],
    },
    lightmapInformation: {
      x: [],
      y: [],
      w: [],
      h: [],
    },
  };

  for (var i = 0; i < output.faces.count; i++) {
    var face = new Buffer(new Uint8Array(faces.slice(i * 20, (i + 1) * 20)));
    output.faces.edges.offset.push(face.readUInt32LE(4));
    output.faces.edges.size.push(face.readUInt16LE(8));
    if (face.readUInt16LE(2)) {
      output.faces.planes.push(-face.readUInt16LE(0));
    } else {
      output.faces.planes.push(face.readUInt16LE(0));
    }
    output.faces.textureInformation.push(face.readUInt16LE(10));
    output.faces.lightmapOffset.push(face.readUInt32LE(16));
  }

  var planeCount = header.planes.size / 20;
  for (var i = 0; i < planeCount; i++) {
    var plane = new Buffer(new Uint8Array(planes.slice(i * 20, (i + 1) * 20)));
    output.planes.data.push(
      plane.readFloatLE(0),
      plane.readFloatLE(8),
      plane.readFloatLE(4),
      plane.readFloatLE(12)
      );
    output.planes.type.push(plane.readUInt32LE(16));
  }

  for (var i = 0; i < output.nodes.count; i++) {
    var node = new Buffer(new Uint8Array(nodes.slice(i * 28, (i + 1) * 28)));
    output.nodes.plane.push(node.readUInt32LE(0));
    output.nodes.front.push(node.readInt32LE(4));
    output.nodes.back.push(node.readInt32LE(8));
    output.nodes.min.push(
        node.readInt16LE(12),
        node.readInt16LE(16),
        node.readInt16LE(14)
        );
    output.nodes.max.push(
        node.readInt16LE(18),
        node.readInt16LE(22),
        node.readInt16LE(20)
        );
    output.nodes.faces.first.push(node.readUInt16LE(24));
    output.nodes.faces.count.push(node.readUInt16LE(26));
  }

  for (var i = 0; i < output.leaves.count; i++) {
    var leaf = new Buffer(new Uint8Array(leaves.slice(i * 28, (i + 1) * 28)));
    var cluster = leaf.readUInt16LE(4);
    if (cluster === 65535) {
      cluster = -1;
    }
    output.leaves.cluster.push(cluster);
    output.leaves.min.push(
        leaf.readInt16LE(8),
        leaf.readInt16LE(10),
        leaf.readInt16LE(12)
        );
    output.leaves.max.push(
        leaf.readInt16LE(14),
        leaf.readInt16LE(16),
        leaf.readInt16LE(18)
        );
    output.leaves.faces.first.push(leaf.readUInt16LE(20));
    output.leaves.faces.count.push(leaf.readUInt16LE(22));
  }

  var modelCount = header.models.size / 48;
  for (var i = 0; i < modelCount; i++) {
    var model = new Buffer(new Uint8Array(models.slice(i * 48, (i + 1) * 48)));
    output.models.origin.push(
        model.readFloatLE(24),
        model.readFloatLE(32),
        model.readFloatLE(28)
        );
    output.models.root.push(model.readUInt32LE(36));
  }

  var clusterCount = (new Uint32Array(visibility.slice(0, 4)))[0];
  for (var i = 0; i < clusterCount; i++) {
    var entry = new Buffer(new Uint8Array(visibility.slice(4 + i * 8, 4 + (i + 1) * 8)));
    var offset = entry.readUInt32LE(0);
    var bytes = new Uint8Array(visibility.slice(offset, header.visibility.size));
    var size = 0;
    for (var c = 0; c < clusterCount; size++) {
      if (bytes[size]) {
        c += 8;
      } else {
        c += 8 * bytes[++size];
      }
    }
    var pvs = new Buffer(new Uint8Array(visibility.slice(offset, offset + size)));
    output.visibility.push(pvs.toString('base64'));
  }

  var textureInformationCount = header.textureInformation.size / 76;

  var textureNames = [];
  for (var i = 0; i < textureInformationCount; i++) {
    var block = new Buffer(new Uint8Array(textureInformation.slice(i * 76, (i + 1) * 76)));
    textureNames.push(readCString(block, 40, 32));
  }

  var textureBuffers = Object.create(null);
  textureNames.forEach(function (name) {
    if (!(name in textureBuffers)) {
      textureBuffers[name] = wal2png(
          fs.readFileSync(path.join(texturePath, name.toLowerCase() + '.wal')),
          palette);
    }
  });
  var textureAtlas = atlas(textureBuffers, 'wrap');

  for (var i = 0; i < textureInformationCount; i++) {
    var block = new Buffer(new Uint8Array(textureInformation.slice(i * 76, (i + 1) * 76)));
    output.textureInformation.u.push(
        block.readFloatLE(0),
        block.readFloatLE(8),
        block.readFloatLE(4),
        block.readFloatLE(12)
        );
    output.textureInformation.v.push(
        block.readFloatLE(16),
        block.readFloatLE(24),
        block.readFloatLE(20),
        block.readFloatLE(28)
        );
    output.textureInformation.x.push(textureAtlas.map[textureNames[i]].x);
    output.textureInformation.y.push(textureAtlas.map[textureNames[i]].y);
    output.textureInformation.w.push(textureAtlas.map[textureNames[i]].width);
    output.textureInformation.h.push(textureAtlas.map[textureNames[i]].height);
    output.textureInformation.flags.push(block.readUInt32LE(32));
  }

  var lightmapAtlas = lightmaps(output, lightmapLump);
  var lightmapIndex = Object.keys(lightmapAtlas.map);
  var reverseLightmapIndex = Object.create(null);
  lightmapIndex.forEach(function (offset, index) {
    reverseLightmapIndex[offset] = index;
    output.lightmapInformation.x.push(lightmapAtlas.map[offset].x);
    output.lightmapInformation.y.push(lightmapAtlas.map[offset].y);
    output.lightmapInformation.w.push(lightmapAtlas.map[offset].width);
    output.lightmapInformation.h.push(lightmapAtlas.map[offset].height);
  });
  for (var i = 0; i < output.faces.count; i++) {
    output.faces.lightmapInformation.push(
        reverseLightmapIndex[output.faces.lightmapOffset[i]]);
  }
  delete output.faces.lightmapOffset;

  var fixClusters = function () {
    var loaded = output.nodes.plane.map(function () {
      return false;
    });

    var loadTree = function loadTree(index) {
      if (index < 0) {
        return {
          leaf: true,
          index: -(index + 1),
        };
      } else {
        loaded[index] = true;
        return {
          front: loadTree(output.nodes.front[index]),
          back: loadTree(output.nodes.back[index]),
        };
      }
    };

    var fix = function fix(node) {
      if (node.front.leaf) {
        if (node.back.leaf) {
          output.leaves.cluster[node.back.index] = -1;
        } else {
          fix(node.back);
        }
      } else if (node.back.leaf) {
        fix(node.front);
      }
    };

    var trees = [];
    for (var i = 0; i < output.nodes.count; i++) {
      if (!loaded[i]) {
        trees.push(loadTree(i));
      }
    }

    trees.forEach(function (tree) {
      fix(tree);
    });
  };

  fixClusters();

  return {
    data: JSON.stringify(output),
    atlas: {
      texture: textureAtlas.atlas,
      lightmap: lightmapAtlas.atlas,
    },
  };
};
