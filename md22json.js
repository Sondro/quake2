var nextPowerOfTwo = require('./pot.js');
var readCString = require('./cstring.js');

module.exports = function (buffer) {
  buffer = new Uint8Array(buffer).buffer;

  var headerArray = new Uint32Array(buffer.slice(0, 68));
  var header = {
    signature: headerArray[0],
    version: headerArray[1],
    skinWidth: headerArray[2],
    skinHeight: headerArray[3],
    frameSize: headerArray[4],
    skinCount: headerArray[5],
    vertexCount: headerArray[6],
    textureCoordinateCount: headerArray[7],
    triangleCount: headerArray[8],
    commandCount: headerArray[9],
    frameCount: headerArray[10],
    skinOffset: headerArray[11],
    textureCoordinateOffset: headerArray[12],
    triangleOffset: headerArray[13],
    frameOffset: headerArray[14],
    commandOffset: headerArray[15],
    fileSize: headerArray[16]
  };

  if (header.signature !== 0x32504449) { // "IDP2"
    throw new Error('invalid signature');
  }

  if (header.version !== 8) {
    throw new Error('invalid version: ' + version);
  }

  var skins = buffer.slice(header.skinOffset, header.skinOffset + header.skinCount * 64);
  var triangles = buffer.slice(header.triangleOffset, header.triangleOffset + header.triangleCount * 12);
  var textureCoordinates = buffer.slice(header.textureCoordinateOffset, header.textureCoordinateOffset + header.textureCoordinateCount * 4);
  var frames = buffer.slice(header.frameOffset, header.frameOffset + header.frameCount * header.frameSize);
  var commands = new Int32Array(buffer.slice(header.commandOffset));

  var output = {
    skin: {
      names: [],
      width: nextPowerOfTwo(header.skinWidth),
      height: nextPowerOfTwo(header.skinHeight)
    },
    textureCoordinates: [],
    frames: {
      vertexCount: header.vertexCount,
      names: [],
      scale: [],
      translate: [],
      vertices: [],
      normals: []
    },
    triangles: {
      vertices: [],
      textureCoordinates: []
    }
  };

  for (var i = 0; i < header.skinCount; i++) {
    output.skin.names.push(readCString(skins, i * 64, 64).replace(/\.pcx$/, ''));
  }

  output.textureCoordinates = Array.prototype.slice.call(new Uint16Array(textureCoordinates));

  for (var i = 0; i < header.frameCount; i++) {
    var frame = frames.slice(i * header.frameSize, (i + 1) * header.frameSize);
    output.frames.names.push(readCString(frame, 24, 16));
    output.frames.scale.push.apply(output.frames.scale, new Float32Array(frame.slice(0, 12)));
    output.frames.translate.push.apply(output.frames.translate, new Float32Array(frame.slice(12, 24)));
    var vertices = new Uint8Array(frame.slice(40));
    for (var j = 0; j < header.vertexCount; j++) {
      var vertex = new Uint8Array(vertices.slice(j * 4, (j + 1) * 4));
      output.frames.vertices.push(vertex[0], vertex[1], vertex[2]);
      output.frames.normals.push(vertex[3]);
    }
  }

  for (var i = 0; i < header.triangleCount; i++) {
    var triangle = new Uint16Array(triangles.slice(i * 12, (i + 1) * 12));
    output.triangles.vertices.push(triangle[0], triangle[1], triangle[2]);
    output.triangles.textureCoordinates.push(triangle[3], triangle[4], triangle[5]);
  }

  return JSON.stringify(output);
};
