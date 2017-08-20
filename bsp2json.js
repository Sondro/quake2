var path = require('path');
var fs = require('fs');

var readCString = require('./cstring.js');

var entities = require('./entities.js');
var wal2png = require('./wal2png.js');
var lightmap = require('./lightmap.js');
var atlas = require('./atlas.js');


Array.prototype.flatten = function () {
  return [].concat.apply([], this);
};


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
  var brushes = buffer.slice(header.brushes.offset, header.brushes.offset + header.brushes.size);
  var brushPlanes = buffer.slice(header.brushSides.offset, header.brushSides.offset + header.brushSides.size);
  var leafBrushes = new Uint16Array(buffer.slice(header.leafBrushTable.offset, header.leafBrushTable.offset + header.leafBrushTable.size));
  var lightmaps = buffer.slice(header.lightmaps.offset, header.lightmaps.offset + header.lightmaps.size);

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
      lightmapOffset: [],
    },
    planes: {
      data: [],
      type: [],
    },
    brushes: {
      flags: [],
      first: [],
      count: [],
      planes: [],
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
      brushes: {
        first: [],
        count: [],
        table: Array.prototype.slice.call(leafBrushes),
      },
    },
    visibility: [],
    textureInformation: {
      u: [],
      v: [],
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

  var brushCount = header.brushes.size / 12;
  for (var i = 0; i < brushCount; i++) {
    var brush = new Buffer(new Uint8Array(brushes.slice(i * 12, (i + 1) * 12)));
    output.brushes.flags.push(brush.readUInt32LE(8));
    output.brushes.first.push(brush.readUInt32LE(0));
    output.brushes.count.push(brush.readUInt32LE(4));
  }

  var brushPlaneCount = header.brushSides.size / 4;
  for (var i = 0; i < brushPlaneCount; i++) {
    var brushPlane = new Buffer(new Uint8Array(brushPlanes.slice(i * 4, (i + 1) * 4)));
    output.brushes.planes.push(brushPlane.readUInt16LE(0));
  }

  for (var i = 0; i < output.nodes.count; i++) {
    var node = new Buffer(new Uint8Array(nodes.slice(i * 28, (i + 1) * 28)));
    output.nodes.plane.push(node.readUInt32LE(0));
    output.nodes.front.push(node.readInt32LE(4));
    output.nodes.back.push(node.readInt32LE(8));
    output.nodes.min.push(
        node.readInt16LE(12),
        node.readInt16LE(14),
        node.readInt16LE(16)
        );
    output.nodes.max.push(
        node.readInt16LE(18),
        node.readInt16LE(20),
        node.readInt16LE(22)
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
    output.leaves.brushes.first.push(leaf.readUInt16LE(24));
    output.leaves.brushes.count.push(leaf.readUInt16LE(26));
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
  var textureAtlas = atlas(textureBuffers);

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
  }

  var lightmapBuffers = Object.create(null);
  output.faces.edges.offset.forEach(function (offset, index) {
    var lightmapOffset = output.faces.lightmapOffset[index];
    if (!(lightmapOffset in lightmapBuffers)) {
      var vertices = output.faceEdges.slice(
        offset, offset + output.faces.edges.size[index]).map(function (index) {
          index = Math.abs(index);
          return output.edges.slice(index * 2, (index + 1) * 2);
        }).flatten().map(function (index) {
          return output.vertices.slice(index * 3, (index + 1) * 3);
        }).flatten();
      var textureIndex = output.faces.textureInformation[index];
      var u = output.textureInformation.u.slice(textureIndex * 4, (textureIndex + 1) * 4);
      var v = output.textureInformation.v.slice(textureIndex * 4, (textureIndex + 1) * 4);
      var buffer = lightmaps.slice(lightmapOffset);
      lightmapBuffers[lightmapOffset] = lightmap(vertices, u, v, buffer);
    }
  });

  // TODO: don't add borders to lightmaps
  var lightmapAtlas = atlas(lightmapBuffers);

  return {
    data: JSON.stringify(output),
    atlas: {
      texture: textureAtlas.atlas,
      lightmap: lightmapAtlas.atlas,
    },
  };
};
