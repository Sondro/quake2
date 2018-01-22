Quake2.SkyBox = function (gl, assets, camera) {
  this._gl = gl;
  this._camera = camera;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, document.getElementById('skybox-vertex-shader').text);
  gl.compileShader(vertexShader);
  console.log(gl.getShaderInfoLog(vertexShader));

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, document.getElementById('skybox-fragment-shader').text);
  gl.compileShader(fragmentShader);
  console.log(gl.getShaderInfoLog(fragmentShader));

  this._program = gl.createProgram();
  gl.attachShader(this._program, vertexShader);
  gl.attachShader(this._program, fragmentShader);
  gl.bindAttribLocation(this._program, 0, 'in_Vertex');
  gl.linkProgram(this._program);
  console.log(gl.getProgramInfoLog(this._program));

  this._locations = {
    angle: gl.getUniformLocation(this._program, 'Angle'),
    texture: gl.getUniformLocation(this._program, 'Texture'),
    screenSize: gl.getUniformLocation(this._program, 'ScreenSize'),
  };

  gl.useProgram(this._program);

  this._vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      1, 1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1, 1, 1, 1, 1, -1,  // right
      -1, 1, 1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, 1, 1,  // left
      -1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1,  // up
      -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, 1, 1, -1, -1, -1, -1, -1,  // down
      1, 1, 1, 1, -1, 1, -1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, 1,  // front
      -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,  // back
  ]), gl.STATIC_DRAW);

  gl.activeTexture(gl.TEXTURE3);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, assets.skyBox.right);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, assets.skyBox.left);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, assets.skyBox.up);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, assets.skyBox.down);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, assets.skyBox.back);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, assets.skyBox.front);

  gl.uniform1i(this._locations.texture, 3);

};


Quake2.SkyBox.prototype.resizeScreen = function (width, height) {
  const gl = this._gl;
  gl.useProgram(this._program);
  gl.uniform3f(this._locations.screenSize, width, height, Math.max(width, height));
};


Quake2.SkyBox.prototype.render = function () {
  const gl = this._gl;
  gl.useProgram(this._program);
  gl.uniform2f(
      this._locations.angle,
      this._camera.angle.x,
      this._camera.angle.y
      );
  gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
  gl.disableVertexAttribArray(1);
  gl.disableVertexAttribArray(2);
  gl.disableVertexAttribArray(3);
  gl.disableVertexAttribArray(4);
  gl.disableVertexAttribArray(5);
  gl.disableVertexAttribArray(6);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 36);
};
