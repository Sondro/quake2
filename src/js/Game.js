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

  this._targets = Object.create(null);
  this._triggers = Object.create(null);

  const playEntity = function (entity) {
    console.dir(entity);
    if (entity.hasOwnProperty('noise')) {
      Quake2.Sound.play(entity.noise);
    } else if (entity.classname === 'target_explosion') {
      new Quake2.Entities.Explosion(this._modelFactory, entity);
    }
    if (entity.hasOwnProperty('target')) {
      if (entity.target in this._targets) {
        const targets = this._targets[entity.target];
        for (var i = 0; i < targets.length; i++) {
          targets[i].trigger();
        }
      }
    }
  };

  assets.data.entities.filter(function (entity) {
    return entity.hasOwnProperty('targetname') ||
        entity.hasOwnProperty('model');
  }).map(function (entity) {
    const play = playEntity.bind(this, entity);
    const createTarget = function () {
      switch (entity.classname) {
      case 'trigger_once':
        return new Quake2.Target.Once(play, entity.delay || 0);
      case 'trigger_multiple':
        return new Quake2.Target.Multiple(play, entity.delay || 0);
      case 'trigger_relay':
        return new Quake2.Target.Relay(play, play, entity.delay || 0);
      default:
        return new Quake2.Target.Default(play, entity.delay || 0);
      }
    };
    const target = createTarget();
    if (target) {
      return {
        entity: entity,
        target: target,
      };
    } else {
      return null;
    }
  }, this).filter(function (pair) {
    return pair !== null;
  }).forEach(function (pair) {
    const entity = pair.entity;
    const target = pair.target;
    if (entity.hasOwnProperty('targetname')) {
      if (!this._targets[entity.targetname]) {
        this._targets[entity.targetname] = [];
      }
      this._targets[entity.targetname].push(target);
    }
    if (entity.hasOwnProperty('model')) {
      if (!this._triggers[entity.model]) {
        this._triggers[entity.model] = [];
      }
      this._triggers[entity.model].push(target);
    }
  }, this);

  this._rotations = Object.create(null);
  assets.data.entities.filter(function (entity) {
    return entity.classname === 'func_rotating';
  }).forEach(function (entity) {
    // TODO: rotation data should be stored inside BSP objects and taken into
    // account for collisions.
    this._rotations[entity.model] = {
      origin: {
        x: entity.origin[0],
        y: entity.origin[1],
        z: entity.origin[2],
      },
      speed: entity.speed * Math.PI / 180,
    };
  }, this);

  const bindBspCallback = function (triggers) {
    if (triggers) {
      return function () {
        for (var i = 0; i < triggers.length; i++) {
          triggers[i].trigger();
        }
      };
    } else {
      return null;
    }
  };

  const pvs = Quake2.PVS.parse(assets.data);

  assets.data.nodes.loaded = assets.data.nodes.plane.map(function () {
    return false;
  });

  this._bsps = [];
  var bspIndex = 0;
  for (var i = 0; i < assets.data.nodes.count; i++) {
    if (!assets.data.nodes.loaded[i]) {
      const callback = bindBspCallback(this._triggers[bspIndex++]);
      this._bsps.push(new Quake2.BSP(gl, assets.data, i, pvs, callback));
    }
  }
  this._bsp = this._bsps[0];

  this.camera = new Quake2.Camera(this._bsps);

  this._skyBox = new Quake2.SkyBox(gl, assets, this.camera);
  this._worldProgram = new Quake2.WorldProgram(gl, assets, this.camera);
  this._modelProgram = new Quake2.ModelProgram(gl, this.camera);

  this._modelFactory = new Quake2.ModelFactory(
      gl, this._modelProgram, assets.models, assets.normals);

  this.weapon = new Quake2.Weapons.Blaster(this._modelFactory);

  this.entities = assets.data.entities.filter(function (descriptor) {
    return descriptor.classname in Quake2.Entities.dictionary;
  }).filter(function (descriptor) {
    const EntityClass = Quake2.Entities.dictionary[descriptor.classname];
    return EntityClass !== Quake2.Entities.Explosion;
  }).map(function (descriptor) {
    const EntityClass = Quake2.Entities.dictionary[descriptor.classname];
    return new EntityClass(this._modelFactory, descriptor);
  }, this);

  this.tickers = this.entities.filter(function (entity) {
    return !!entity.tick;
  });

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
  this.camera.tick(t0, t1, keys);
  this.weapon.tick(t1, keys);
  for (var i = 0; i < this.tickers.length; i++) {
    this.tickers[i].tick(t1);
  }
};


Quake2.Game.prototype.render = function () {
  const gl = this._gl;

  const t = Date.now();

  gl.clear(gl.DEPTH_BUFFER_BIT);

  this._skyBox.render();

  this._worldProgram.prepare1();
  const leaf = this._bsp.locate(this.camera.head);
  leaf.render();

  for (var i = 1; i < this._bsps.length; i++) {
    if (i in this._rotations) {
      const offset = this._rotations[i].origin;
      const period = Math.PI * 2000 / this._rotations[i].speed;
      const angle = (t % period) * Math.PI * 2 / period;
      this._worldProgram.prepare2(offset.x, offset.y, offset.z, angle);
    } else {
      this._worldProgram.prepare2(0, 0, 0, 0);
    }
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
