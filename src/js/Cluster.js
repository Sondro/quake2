Quake2.Cluster = function (gl, data, faces) {
  this._gl = gl;

  var vertices = [];
  var normals = [];
  var textureCoordinates = [];
  var textureOrigins = [];
  var textureSizes = [];
  var lightmapOrigins = [];
  var lightmapSizes = [];

  const _pushElement = function (faceIndex, vertexIndex) {
    vertices.push(
        data.vertices[vertexIndex * 3],
        data.vertices[vertexIndex * 3 + 1],
        data.vertices[vertexIndex * 3 + 2]);
    const normalIndex = data.faces.planes[faceIndex];
    if (normalIndex < 0) {
      normals.push(
          -data.planes.data[-normalIndex * 4],
          -data.planes.data[-normalIndex * 4 + 1],
          -data.planes.data[-normalIndex * 4 + 2]);
    } else {
      normals.push(
          data.planes.data[normalIndex * 4],
          data.planes.data[normalIndex * 4 + 1],
          data.planes.data[normalIndex * 4 + 2]);
    }
    const textureIndex = data.faces.textureInformation[faceIndex];
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
    const lightmapIndex = data.faces.lightmapInformation[faceIndex];
    lightmapOrigins.push(
        data.lightmapInformation.x[lightmapIndex],
        data.lightmapInformation.y[lightmapIndex]);
    lightmapSizes.push(
        data.lightmapInformation.w[lightmapIndex],
        data.lightmapInformation.h[lightmapIndex]);
  };

  const _pushFace = function (i) {
    var k0 = data.faceEdges[data.faces.edges.offset[i]];
    if (k0 < 0) {
      k0 = data.edges[-k0 * 2 + 1];
    } else {
      k0 = data.edges[k0 * 2];
    }
    for (var j = 1; j < data.faces.edges.size[i] - 1; j++) {
      _pushElement(i, k0);
      const k = data.faceEdges[data.faces.edges.offset[i] + j];
      if (k < 0) {
        _pushElement(i, data.edges[-k * 2 + 1]);
        _pushElement(i, data.edges[-k * 2]);
      } else {
        _pushElement(i, data.edges[k * 2]);
        _pushElement(i, data.edges[k * 2 + 1]);
      }
    }
  };

  for (var i = 0; i < faces.length; i++) {
    _pushFace(faces[i]);
  }

  this._size = vertices.length / 3;

  this._vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  delete vertices;

  this._normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this._normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  delete normals;

  this._textureCoordinateBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this._textureCoordinateBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
  delete textureCoordinates;

  this._textureOriginBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this._textureOriginBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureOrigins), gl.STATIC_DRAW);
  delete textureOrigins;

  this._textureSizeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this._textureSizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureSizes), gl.STATIC_DRAW);
  delete textureSizes;

  this._lightmapOriginBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this._lightmapOriginBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lightmapOrigins), gl.STATIC_DRAW);
  delete lightmapOrigins;

  this._lightmapSizeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this._lightmapSizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lightmapSizes), gl.STATIC_DRAW);
  delete lightmapSizes;

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

  gl.bindBuffer(gl.ARRAY_BUFFER, this._lightmapOriginBuffer);
  gl.vertexAttribPointer(5, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._lightmapSizeBuffer);
  gl.vertexAttribPointer(6, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, this._size);
};
