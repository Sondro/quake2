var lightmap2png = require('./lightmap2png.js');

module.exports = function (vertices, u, v, buffer) {
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
  var width = Math.ceil(Math.max.apply(Math, s) - Math.min.apply(Math, s)) + 1;
  var height = Math.ceil(Math.max.apply(Math, t) - Math.min.apply(Math, t)) + 1;
  return lightmap2png(buffer, width, height);
};
