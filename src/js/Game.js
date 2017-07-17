Quake2.Game = function (gl, assets) {
  this._gl = gl;

  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.clearDepth(0);
  gl.depthFunc(gl.GREATER);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CW);
  gl.enableVertexAttribArray(0);
  gl.enableVertexAttribArray(1);
  gl.enableVertexAttribArray(2);
  gl.enableVertexAttribArray(3);
  gl.enableVertexAttribArray(4);

  this._textures = {
    palette: gl.createTexture(),
    atlas: gl.createTexture()
  };

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this._textures.palette);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, assets.colormap);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, this._textures.atlas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, assets.texture);

  this._bsp = new Quake2.BSP(gl, assets.data);
  this.camera = new Quake2.Camera(this._bsp);

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, document.getElementById('world-vertex-shader').text);
  gl.compileShader(vertexShader);
  console.log(gl.getShaderInfoLog(vertexShader));

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, document.getElementById('world-fragment-shader').text);
  gl.compileShader(fragmentShader);
  console.log(gl.getShaderInfoLog(fragmentShader));

  this._program = gl.createProgram();
  gl.attachShader(this._program, vertexShader);
  gl.attachShader(this._program, fragmentShader);
  gl.bindAttribLocation(this._program, 0, 'in_Vertex');
  gl.bindAttribLocation(this._program, 1, 'in_Normal');
  gl.bindAttribLocation(this._program, 2, 'in_TextureCoordinates');
  gl.bindAttribLocation(this._program, 3, 'in_TextureOrigin');
  gl.bindAttribLocation(this._program, 4, 'in_TextureSize');
  gl.linkProgram(this._program);
  console.log(gl.getProgramInfoLog(this._program));

  this._locations = {
    position: gl.getUniformLocation(this._program, 'Position'),
    angle: gl.getUniformLocation(this._program, 'Angle'),
    atlasSize: gl.getUniformLocation(this._program, 'AtlasSize'),
    palette: gl.getUniformLocation(this._program, 'Palette'),
    atlas: gl.getUniformLocation(this._program, 'Atlas'),
  };

  gl.useProgram(this._program);

  gl.uniform2f(this._locations.atlasSize, assets.texture.width, assets.texture.height);
  gl.uniform1i(this._locations.palette, 0);
  gl.uniform1i(this._locations.atlas, 1);

  assets.data.entities.filter(function (entity) {
    return entity.classname === 'info_player_start';
  }).forEach(function (spawnPoint) {
    this.camera.position.x = spawnPoint.origin[0];
    this.camera.position.y = spawnPoint.origin[1];
    this.camera.position.z = spawnPoint.origin[2];
    this.camera.angle.y = spawnPoint.angle - Math.PI / 2;
  }, this);

};


Quake2.Game.prototype.tick = function (t0, t1, keys) {
  this.camera.tick(t0, t1, keys);
};


Quake2.Game.prototype.render = function () {
  const gl = this._gl;

  // TODO: don't clear the color buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(this._program);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this._textures.palette);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, this._textures.atlas);

  gl.uniform3f(
      this._locations.position,
      this.camera.position.x,
      this.camera.position.y,
      this.camera.position.z
      );
  gl.uniform2f(
      this._locations.angle,
      this.camera.angle.x,
      this.camera.angle.y
      );

  this._bsp.locate(this.camera.position).render();

  gl.flush();
};
