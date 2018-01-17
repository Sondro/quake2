var lightmap2png = require('./lightmap2png.js');
var atlas = require('./atlas.js');


Array.prototype.flatten = function () {
  return [].concat.apply([], this);
};


function lightmap(vertices, u, v, buffer) {
  var s = [], t = [];
  var count = vertices.length / 3;
  for (var i = 0; i < count; i++) {
    s.push(
        vertices[i * 3 + 0] * u[0] +
        vertices[i * 3 + 1] * u[1] +
        vertices[i * 3 + 2] * u[2] +
        u[3]);
    t.push(
        vertices[i * 3 + 0] * v[0] +
        vertices[i * 3 + 1] * v[1] +
        vertices[i * 3 + 2] * v[2] +
        v[3]);
  }
  var width = Math.ceil(Math.max.apply(Math, s) / 16) - Math.floor(Math.min.apply(Math, s) / 16) + 1;
  var height = Math.ceil(Math.max.apply(Math, t) / 16) - Math.floor(Math.min.apply(Math, t) / 16) + 1;
  return lightmap2png(buffer, width, height);
}


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

  return atlas(buffers);
};
