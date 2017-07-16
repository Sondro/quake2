Quake2.Cluster = function (gl, data, index) {
  this._gl = gl;

  this._vertexBuffer = gl.createBuffer();
  this._normalBuffer = gl.createBuffer();
  this._textureCoordinateBuffer = gl.createBuffer();
  this._textureOriginBuffer = gl.createBuffer();
  this._textureSizeBuffer = gl.createBuffer();

  var vertices = [];
  var normals = [];
  var textureCoordinates = [];
  var textureOrigins = [];
  var textureSizes = [];

  const _pushElement = function (vertexIndex, normalIndex, textureIndex) {
    vertices.push(
        data.vertices[vertexIndex * 3],
        data.vertices[vertexIndex * 3 + 1],
        data.vertices[vertexIndex * 3 + 2]);
    if (normalIndex < 0) {
      normals.push(
          -data.planes[-normalIndex * 4],
          -data.planes[-normalIndex * 4 + 1],
          -data.planes[-normalIndex * 4 + 2]);
    } else {
      normals.push(
          data.planes[normalIndex * 4],
          data.planes[normalIndex * 4 + 1],
          data.planes[normalIndex * 4 + 2]);
    }
    textureCoordinates.push(
        data.vertices[vertexIndex * 3 + 0] * data.textureInformation.u[textureIndex * 4 + 0] +
        data.vertices[vertexIndex * 3 + 1] * data.textureInformation.u[textureIndex * 4 + 1] +
        data.vertices[vertexIndex * 3 + 2] * data.textureInformation.u[textureIndex * 4 + 2] +
        data.textureInformation.u[textureIndex * 4 + 3]);
    textureCoordinates.push(
        data.vertices[vertexIndex * 3 + 0] * data.textureInformation.v[textureIndex * 4 + 0] +
        data.vertices[vertexIndex * 3 + 1] * data.textureInformation.v[textureIndex * 4 + 1] +
        data.vertices[vertexIndex * 3 + 2] * data.textureInformation.v[textureIndex * 4 + 2] +
        data.textureInformation.v[textureIndex * 4 + 3]);
    textureOrigins.push(
        data.textureInformation.x[textureIndex],
        data.textureInformation.y[textureIndex]);
    textureSizes.push(
        data.textureInformation.w[textureIndex],
        data.textureInformation.h[textureIndex]);
  };

  const _pushFace = function (i) {
    var k0 = data.faceEdges[data.faces.edges.offset[i]];
    if (k0 < 0) {
      k0 = data.edges[-k0 * 2 + 1];
    } else {
      k0 = data.edges[k0 * 2];
    }
    for (var j = 1; j < data.faces.edges.size[i] - 1; j++) {
      _pushElement(k0, data.faces.planes[i], data.faces.textureInformation[i]);
      const k = data.faceEdges[data.faces.edges.offset[i] + j];
      if (k < 0) {
        _pushElement(data.edges[-k * 2 + 1], data.faces.planes[i], data.faces.textureInformation[i]);
        _pushElement(data.edges[-k * 2], data.faces.planes[i], data.faces.textureInformation[i]);
      } else {
        _pushElement(data.edges[k * 2], data.faces.planes[i], data.faces.textureInformation[i]);
        _pushElement(data.edges[k * 2 + 1], data.faces.planes[i], data.faces.textureInformation[i]);
      }
    }
  };

  for (var i = 0; i < data.leaves.faces.count[index]; i++) {
    _pushFace(data.leaves.faces.table[data.leaves.faces.first[index] + i]);
  }

  this._size = vertices.length / 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._textureCoordinateBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._textureOriginBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureOrigins), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._textureSizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureSizes), gl.STATIC_DRAW);

};


Quake2.Cluster.prototype.render = function () {
  const gl = this._gl;

  gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._normalBuffer);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._textureCoordinateBuffer);
  gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._textureOriginBuffer);
  gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._textureSizeBuffer);
  gl.vertexAttribPointer(4, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, this._size);
};


Quake2.Cluster.load = function (gl, data, index) {
  if (data.leaves.faces.count[index] > 0) {
    return new Quake2.Cluster(gl, data, index);
  } else {
    return null;
  }
};
