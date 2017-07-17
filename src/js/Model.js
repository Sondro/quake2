Quake2.BaseModel = function (gl, name, data, normalTable) {
  this._gl = gl;

  this.name = name;
  this.animations = new Animations(data);
  this._vertexBuffer = gl.createBuffer();
  this._normalBuffer = gl.createBuffer();
  this._textureCoordinateBuffer = gl.createBuffer();
  this._size = data.triangles.vertices.length;

  const vertices = new Float32Array(data.frames.names.length * data.triangles.vertices.length * 3);
  for (var i = 0; i < data.frames.names.length; i++) {
    for (var j = 0; j < data.triangles.vertices.length; j++) {
      vertices[(i * data.triangles.vertices.length + j) * 3 + 0] = data.frames.vertices[(i * data.frames.vertexCount + data.triangles.vertices[j]) * 3 + 0] * data.frames.scale[i * 3 + 0] + data.frames.translate[i * 3 + 0];
      vertices[(i * data.triangles.vertices.length + j) * 3 + 2] = data.frames.vertices[(i * data.frames.vertexCount + data.triangles.vertices[j]) * 3 + 1] * data.frames.scale[i * 3 + 1] + data.frames.translate[i * 3 + 1];
      vertices[(i * data.triangles.vertices.length + j) * 3 + 1] = data.frames.vertices[(i * data.frames.vertexCount + data.triangles.vertices[j]) * 3 + 2] * data.frames.scale[i * 3 + 2] + data.frames.translate[i * 3 + 2];
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  vertices = null;

  const normals = new Float32Array(data.frames.names.length * data.triangles.vertices.length * 3);
  for (var i = 0; i < data.frames.names.length; i++) {
    for (var j = 0; j < data.triangles.vertices.length; j++) {
      const normal = normalTable[data.frames.normals[i * data.frames.vertexCount + data.triangles.vertices[j]]];
      normals[(i * data.triangles.vertices.length + j) * 3 + 0] = normal[0];
      normals[(i * data.triangles.vertices.length + j) * 3 + 2] = normal[1];
      normals[(i * data.triangles.vertices.length + j) * 3 + 1] = normal[2];
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, this._normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  normals = null;

  const textureCoordinates = new Float32Array(data.triangles.textureCoordinates.length * 2);
  for (var i = 0; i < data.triangles.textureCoordinates.length; i++) {
    const j = data.triangles.textureCoordinates[i] * 2;
    textureCoordinates[i * 2 + 0] = data.textureCoordinates[j + 0] / data.skin.width;
    textureCoordinates[i * 2 + 1] = data.textureCoordinates[j + 1] / data.skin.height;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, this._textureCoordinateBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
  textureCoordinates = null;

  this._textures = {};
  gl.activeTexture(gl.TEXTURE2);
  for (var name in skins) {
    if (skins.hasOwnProperty(name)) {
      this._textures[name] = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this._textures[name]);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skins[name]);
    }
  }

};


Quake2.BaseModel.prototype.render = function (program, x, y, z, a, t, skin) {
  const gl = this._gl;

  gl.uniform3f(program.locations.position, x, y, z);
  gl.uniform1f(program.locations.angle, a);
  gl.uniform1f(program.locations.step, t);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, this._size * 12 * i);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, this._size * 12 * j);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._normalBuffer);
  gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, this._size * 12 * i);
  gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 0, this._size * 12 * j);

  gl.bindBuffer(gl.ARRAY_BUFFER, this._textureCoordinateBuffer);
  gl.vertexAttribPointer(4, 2, gl.FLOAT, false, 0, 0);

  gl.bindTexture(gl.TEXTURE_2D, this._textures[skin]);

  gl.drawArrays(gl.TRIANGLES, 0, this._size);

};
