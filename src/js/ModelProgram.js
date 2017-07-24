Quake2.ModelProgram = function (gl, camera) {
  this._gl = gl;
  this._camera = camera;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, document.getElementById('model-vertex-shader').text);
  gl.compileShader(vertexShader);
  console.log(gl.getShaderInfoLog(vertexShader));

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, document.getElementById('model-fragment-shader').text);
  gl.compileShader(fragmentShader);
  console.log(gl.getShaderInfoLog(fragmentShader));

  this._program = gl.createProgram();
  gl.attachShader(this._program, vertexShader);
  gl.attachShader(this._program, fragmentShader);
  gl.bindAttribLocation(this._program, 0, 'in_PreviousVertex');
  gl.bindAttribLocation(this._program, 1, 'in_NextVertex');
  gl.bindAttribLocation(this._program, 2, 'in_PreviousNormal');
  gl.bindAttribLocation(this._program, 3, 'in_NextNormal');
  gl.bindAttribLocation(this._program, 4, 'in_TextureCoordinates');
  gl.linkProgram(this._program);
  console.log(gl.getProgramInfoLog(this._program));

  this.locations = {
    camera: {
      position: gl.getUniformLocation(this._program, 'Camera.Position'),
      angle: gl.getUniformLocation(this._program, 'Camera.Angle'),
    },
    position: gl.getUniformLocation(this._program, 'Position'),
    angle: gl.getUniformLocation(this._program, 'Angle'),
    texture: gl.getUniformLocation(this._program, 'Texture'),
    step: gl.getUniformLocation(this._program, 'Step'),
    screenSize: gl.getUniformLocation(this._program, 'ScreenSize'),
  };

  gl.useProgram(this._program);

  gl.uniform1i(this.locations.texture, 2);

};


Quake2.ModelProgram.prototype.resizeScreen = function (width, height) {
  const gl = this._gl;
  gl.useProgram(this._program);
  gl.uniform3f(this.locations.screenSize, width, height, Math.max(width, height));
};


Quake2.ModelProgram.prototype.prepareForEntities = function () {
  const gl = this._gl;
  gl.useProgram(this._program);
  gl.uniform3f(
      this.locations.camera.position,
      this._camera.head.x,
      this._camera.head.y,
      this._camera.head.z
      );
  gl.uniform2f(
      this.locations.camera.angle,
      this._camera.angle.x,
      this._camera.angle.y
      );
  gl.activeTexture(gl.TEXTURE2);
};


Quake2.ModelProgram.prototype.prepareForWeapon = function () {
  const gl = this._gl;
  gl.uniform3f(this.locations.camera.position, 0, 0, 0);
  gl.uniform2f(this.locations.camera.angle, 0, 0);
};
