var lightmap = require('./lightmap.js');
var atlas = require('./atlas.js');


Array.prototype.flatten = function () {
  return [].concat.apply([], this);
};


module.exports = function (data, lightmaps) {
  var buffers = Object.create(null);

  data.faces.edges.offset.forEach(function (offset, index) {
    var lightmapOffset = data.faces.lightmapOffset[index];
    if (!(lightmapOffset in buffers)) {
      var vertices = data.faceEdges.slice(
        offset, offset + data.faces.edges.size[index]).map(function (index) {
          index = Math.abs(index);
          return data.edges.slice(index * 2, (index + 1) * 2);
        }).flatten().map(function (index) {
          return data.vertices.slice(index * 3, (index + 1) * 3);
        }).flatten();
      var textureIndex = data.faces.textureInformation[index];
      var u = data.textureInformation.u.slice(textureIndex * 4, (textureIndex + 1) * 4);
      var v = data.textureInformation.v.slice(textureIndex * 4, (textureIndex + 1) * 4);
      var buffer = lightmaps.slice(lightmapOffset);
      buffers[lightmapOffset] = lightmap(vertices, u, v, buffer);
    }
  });

  // TODO: don't add borders to lightmaps
  return atlas(buffers);
};
