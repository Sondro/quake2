Quake2.WorldProgram = function (gl, assets, camera) {
  this._gl = gl;
  this._camera = camera;

  this._textures = {
    atlas: gl.createTexture(),
    lightmap: gl.createTexture(),
  };

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this._textures.atlas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, assets.texture);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, this._textures.lightmap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, assets.lightmap);

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
  gl.bindAttribLocation(this._program, 1, 'in_TextureCoordinates');
  gl.bindAttribLocation(this._program, 2, 'in_TextureOrigin');
  gl.bindAttribLocation(this._program, 3, 'in_TextureSize');
  gl.bindAttribLocation(this._program, 4, 'in_LightmapCoordinates');
  gl.bindAttribLocation(this._program, 5, 'in_LightmapOrigin');
  gl.bindAttribLocation(this._program, 6, 'in_LightmapSize');
  gl.linkProgram(this._program);
  console.log(gl.getProgramInfoLog(this._program));

  this._locations = {
    screenSize: gl.getUniformLocation(this._program, 'ScreenSize'),
    position: gl.getUniformLocation(this._program, 'Position'),
    angle: gl.getUniformLocation(this._program, 'Angle'),
    atlasSize: gl.getUniformLocation(this._program, 'AtlasSize'),
    atlas: gl.getUniformLocation(this._program, 'Atlas'),
    lightmapSize: gl.getUniformLocation(this._program, 'LightmapSize'),
    lightmap: gl.getUniformLocation(this._program, 'Lightmap'),
  };

  gl.useProgram(this._program);

  gl.uniform2f(this._locations.atlasSize, assets.texture.width, assets.texture.height);
  gl.uniform1i(this._locations.atlas, 0);

  gl.uniform2f(this._locations.lightmapSize, assets.lightmap.width, assets.lightmap.height);
  gl.uniform1i(this._locations.lightmap, 1);

};


Quake2.WorldProgram.prototype.resizeScreen = function (width, height) {
  const gl = this._gl;
  gl.useProgram(this._program);
  gl.uniform3f(this._locations.screenSize, width, height, Math.max(width, height));
};


Quake2.WorldProgram.prototype.prepare = function () {
  const gl = this._gl;

  gl.useProgram(this._program);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this._textures.atlas);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, this._textures.lightmap);

  gl.uniform3f(
      this._locations.position,
      this._camera.head.x,
      this._camera.head.y,
      this._camera.head.z
      );
  gl.uniform2f(
      this._locations.angle,
      this._camera.angle.x,
      this._camera.angle.y
      );

};
