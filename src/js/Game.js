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

  this._bsp = new Quake2.BSP(gl, assets.data);
  this.camera = new Quake2.Camera(this._bsp);

  this._worldProgram = new Quake2.WorldProgram(gl, assets, this.camera);
  this._modelProgram = new Quake2.ModelProgram(gl, this.camera);

  this._modelFactory = new Quake2.ModelFactory(
      gl, this._modelProgram, assets.models, assets.normals);

  this.weapon = new Quake2.Weapons.Blaster(this._modelFactory);

  assets.data.entities.filter(function (entity) {
    return entity.classname === 'info_player_start';
  }).forEach(function (spawnPoint) {
    this.camera.position.x = spawnPoint.origin[0];
    this.camera.position.y = spawnPoint.origin[1];
    this.camera.position.z = spawnPoint.origin[2];
    this.camera.angle.y = spawnPoint.angle - Math.PI / 2;
  }, this);

};


Quake2.Game.prototype.resize = function (width, height) {
  this._gl.viewport(0, 0, width, height);
  this._worldProgram.resizeScreen(width, height);
  this._modelProgram.resizeScreen(width, height);
};


Quake2.Game.prototype.tick = function (t0, t1, keys) {
  this.camera.tick(t0, t1, keys);
};


Quake2.Game.prototype.render = function () {
  const gl = this._gl;

  gl.clear(gl.DEPTH_BUFFER_BIT);

  const t = Date.now();

  this._worldProgram.prepare();
  this._bsp.locate(this.camera.position).render();

  this._modelProgram.prepareForEntities();
  // TODO: render entities

  this._modelProgram.prepareForWeapon();
  this.weapon.render(t);

  gl.flush();
};
