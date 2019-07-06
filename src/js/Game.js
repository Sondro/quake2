Quake2.Game = function (gl, assets) {
  Quake2.Sound.initialize(assets.sounds);

  this._gl = gl;

  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.clearDepth(0);
  gl.depthFunc(gl.GREATER);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CW);

  // All programs have at least one attribute array. Other arrays are
  // selectively enabled or disabled by each program.
  gl.enableVertexAttribArray(0);

  const pvs = Quake2.PVS.parse(assets.data);

  assets.data.nodes.loaded = assets.data.nodes.plane.map(function () {
    return false;
  });

  this._bsps = [];
  for (var i = 0; i < assets.data.nodes.count; i++) {
    if (!assets.data.nodes.loaded[i]) {
      this._bsps.push(new Quake2.BSP(gl, assets.data, i, pvs));
    }
  }
  this._bsp = this._bsps[0];

  this.camera = new Quake2.Camera(this._bsp);

  this._skyBox = new Quake2.SkyBox(gl, assets, this.camera);
  this._worldProgram = new Quake2.WorldProgram(gl, assets, this.camera);
  this._modelProgram = new Quake2.ModelProgram(gl, this.camera);

  this._modelFactory = new Quake2.ModelFactory(
      gl, this._modelProgram, assets.models, assets.normals);

  this.weapon = new Quake2.Weapons.Blaster(this._modelFactory);

  this.entities = assets.data.entities.filter(function (descriptor) {
    return descriptor.classname in Quake2.Entities.dictionary;
  }).map(function (descriptor) {
    const EntityClass = Quake2.Entities.dictionary[descriptor.classname];
    return new EntityClass(this._modelFactory, descriptor);
  }, this);

  this.tickers = this.entities.filter(function (entity) {
    return !!entity.tick;
  });

  this._targets = Object.create(null);
  assets.data.entities.filter(function (entity) {
    return entity.hasOwnProperty('targetname');
  }).forEach(function (entity) {
    if (!this._targets[entity.targetname]) {
      this._targets[entity.targetname] = [];
    }
    this._targets[entity.targetname].push(entity);
  }, this);

  this._triggers = Object.create(null);
  assets.data.entities.filter(function (entity) {
    return /\*[0-9]+/.test(entity.model || '');
  }).forEach(function (entity) {
    const index = /\*([0-9]+)/.exec(entity.model)[1] - 1;
    if (!this._triggers[index]) {
      this._triggers[index] = [];
    }
    this._triggers[index].push(entity);
  }, this);

  assets.data.entities.filter(function (entity) {
    return entity.classname === 'info_player_start';
  }).forEach(function (spawnPoint) {
    this.camera.setPosition(
        spawnPoint.origin[0],
        spawnPoint.origin[1],
        spawnPoint.origin[2]);
    this.camera.angle.y = spawnPoint.angle - Math.PI / 2;
  }, this);

};


Quake2.Game.prototype.resize = function (width, height) {
  this._gl.viewport(0, 0, width, height);
  this._skyBox.resizeScreen(width, height);
  this._worldProgram.resizeScreen(width, height);
  this._modelProgram.resizeScreen(width, height);
};


Quake2.Game.prototype.tick = function (t0, t1, keys) {
  for (var i in this._triggers) {
    if (i in this._bsps) {
      if (this._bsps[i].collides(this.camera.origin)) {
        console.dir(this._triggers[i]);
      }
    }
  }
  for (var i = 0; i < this.tickers.length; i++) {
    this.tickers[i].tick(t1);
  }
  this.camera.tick(t0, t1, keys);
  this.weapon.tick(t1, keys);
};


Quake2.Game.prototype.render = function () {
  const gl = this._gl;

  const t = Date.now();

  gl.clear(gl.DEPTH_BUFFER_BIT);

  this._skyBox.render();

  this._worldProgram.prepare();
  const leaf = this._bsp.locate(this.camera.head);
  leaf.render();

  for (var i = 1; i < this._bsps.length; i++) {
    this._bsps[i].locate(this.camera.head).render();
  }

  this._modelProgram.prepareForEntities();
  for (var i = 0; i < this._modelFactory.models.length; i++) {
    const model = this._modelFactory.models[i];
    const modelLeaf = this._bsp.locate(model.position);
    if (leaf.views(modelLeaf)) {
      model.render(t);
    }
  }

  this._modelProgram.prepareForWeapon();
  this.weapon.render(t);

  gl.flush();
};
