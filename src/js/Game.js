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
      const explosion = new Quake2.Entities.Explosion(this._modelFactory, entity);
      this.tickers.push(explosion);
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
    return entity.classname !== 'func_door' && (
        entity.hasOwnProperty('targetname') ||
        entity.hasOwnProperty('model'));
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

  const pvs = Quake2.PVS.parse(assets.data);

  assets.data.nodes.loaded = assets.data.nodes.plane.map(function () {
    return false;
  });

  this._bsps = [];
  var bspIndex = 0;
  for (var i = 0; i < assets.data.nodes.count; i++) {
    if (!assets.data.nodes.loaded[i]) {
      const callback = this._bindBspCallback(bspIndex++);
      this._bsps.push(new Quake2.BSP(gl, assets.data, i, pvs, callback));
    }
  }
  this._bsp = this._bsps[0];

  assets.data.entities.filter(function (entity) {
    return entity.classname === 'func_rotating' &&
        entity.model < this._bsps.length;
  }, this).forEach(function (entity) {
    this._bsps[entity.model].rotate(entity.origin, entity.speed * Math.PI / 180);
  }, this);

  assets.data.entities.filter(function (entity) {
    return entity.classname === 'func_door' &&
        entity.model < this._bsps.length;
  }, this).map(function (entity) {
    return {
      entity: entity,
      door: new Quake2.Door(entity, this._bsps[entity.model]),
    };
  }, this).forEach(function (pair) {
    const entity = pair.entity;
    const door = pair.door;
    if (entity.hasOwnProperty('targetname')) {
      if (!this._targets[entity.targetname]) {
        this._targets[entity.targetname] = [];
      }
      this._targets[entity.targetname].push(door);
    }
    if (entity.hasOwnProperty('model')) {
      if (!this._triggers[entity.model]) {
        this._triggers[entity.model] = [];
      }
      this._triggers[entity.model].push(door);
    }
  }, this);

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


Quake2.Game.prototype._bindBspCallback = function (bspIndex) {
  return function () {
    const triggers = this._triggers[bspIndex];
    if (triggers) {
      for (var i = 0; i < triggers.length; i++) {
        triggers[i].trigger();
      }
    }
  }.bind(this);
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
  var i = 0;
  while (i < this.tickers.length) {
    if (this.tickers[i].tick(t1)) {
      this.tickers.splice(i, 1);
    } else {
      i++;
    }
  }
};


Quake2.Game.prototype.render = function () {
  const gl = this._gl;

  const t = Date.now();

  gl.clear(gl.DEPTH_BUFFER_BIT);

  this._skyBox.render();

  this._worldProgram.prepare1();
  const leaf = this._bsp.render(this._worldProgram, this.camera.head, t);

  for (var i = 1; i < this._bsps.length; i++) {
    this._bsps[i].render(this._worldProgram, this.camera.head, t);
  }

  this._modelProgram.prepareForEntities();
  this._modelFactory.renderModels(this._bsp, leaf, t);

  this._modelProgram.prepareForWeapon();
  this.weapon.render(t);

  gl.flush();
};
