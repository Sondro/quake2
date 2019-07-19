Quake2.Loader = function () {};

Quake2.Loader._WEAPON_MODELS = [
  'weapons/v_bfg',
  'weapons/v_blast',
  'weapons/v_chain',
  'weapons/v_disint',
  'weapons/v_flareg',
  'weapons/v_handgr',
  'weapons/v_hyperb',
  'weapons/v_launch',
  'weapons/v_machn',
  'weapons/v_rail',
  'weapons/v_rocket',
  'weapons/v_shotg',
  'weapons/v_shotg2',
];

Quake2.Loader.prototype._zip = function (keys, values) {
  const result = Object.create(null);
  keys.forEach(function (key, index) {
    result[key] = values[index];
  });
  return result;
};

Quake2.Loader.prototype._loadHash = function (hash) {
  const keys = Object.keys(hash);
  return Promise.all(keys.map(function (key) {
    return Promise.resolve(hash[key]);
  })).then(function (values) {
    return this._zip(keys, values);
  }.bind(this));
};

Quake2.Loader.prototype.loadData = function (path) {
  return Promise.resolve($.getJSON(`baseq2/${path}.json`));
};

Quake2.Loader.prototype.loadImage = function (path) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload = function () {
      image.onload = null;
      image.onerror = null;
      resolve(image);
    };
    image.onerror = function () {
      image.onload = null;
      image.onerror = null;
      reject(new Error(`Failed to load ${path}`));
    };
    image.src = `baseq2/${path}`;
  });
};

Quake2.Loader.prototype.loadImages = function (paths) {
  return Promise.all(paths.map(function (path) {
    return this.loadImage(path);
  }, this));
};

Quake2.Loader.prototype.loadSkyBox = function (name) {
  const hash = Object.create(null);
  hash.back = this.loadImage(`env/${name}bk.png`);
  hash.down = this.loadImage(`env/${name}dn.png`);
  hash.front = this.loadImage(`env/${name}ft.png`);
  hash.left = this.loadImage(`env/${name}lf.png`);
  hash.right = this.loadImage(`env/${name}rt.png`);
  hash.up = this.loadImage(`env/${name}up.png`);
  return this._loadHash(hash);
};

Quake2.Loader.prototype.loadTexture = function (name) {
  return this.loadImage(`textures/${name}.png`);
};

Quake2.Loader.prototype.loadTextures = function (names) {
  return this.loadImages(names.map(function (name) {
    return `textures/${name}.png`;
  }));
};

Quake2.Loader.prototype.loadSkins = function (names) {
  return Promise.all(names.map(function (name) {
    return this.loadImage(`${name}.png`);
  }, this)).then(function (images) {
    return this._zip(names, images);
  }.bind(this));
};

Quake2.Loader.prototype.loadSound = function (path) {
  return new Promise(function (resolve, reject) {
    const audio = new Audio(`baseq2/sound/${path}.wav`);
    audio.oncanplaythrough = function () {
      audio.oncanplaythrough = null;
      audio.onerror = null;
      resolve(audio);
    };
    audio.onerror = function () {
      audio.oncanplaythrough = null;
      audio.onerror = null;
      reject(new Error(`Failed to load ${path}.wav`));
    };
    audio.load();
  });
};

Quake2.Loader.prototype.loadSounds = function (names) {
  return Promise.all(names.map(function (name) {
    return this.loadSound(name);
  }, this)).then(function (sounds) {
    return this._zip(names, sounds);
  }.bind(this));
};

Quake2.Loader.prototype._loadWeaponSounds = function () {
  return this.loadSounds([
      Quake2.Weapons.Blaster,
      // TODO: other weapons
  ].map(function (WeaponClass) {
    return WeaponClass.SOUNDS.map(function (path) {
      return `weapons/${path}`;
    });
  }).flatten());
};

Quake2.Loader.prototype._loadNoises = function (entities) {
  return this.loadSounds(entities.filter(function (entity) {
    return entity.hasOwnProperty('noise');
  }).map(function (entity) {
    return entity.noise.replace(/\.wav$/, '');
  }));
};

Quake2.Loader.prototype.loadModel = function (name) {
  const response = {};
  return this.loadData(`models/${name}/tris`).then(function (data) {
    response.data = data;
    return this.loadSkins(data.skin.names);
  }.bind(this)).then(function (skins) {
    response.skins = skins;
    return response;
  }.bind(this));
};

Quake2.Loader.prototype._loadEntityModels = function (entities) {
  const hash = Object.create(null);
  Quake2.Loader._WEAPON_MODELS.forEach(function (model) {
    hash[model] = true;
  });
  entities.filter(function (entity) {
    return entity.classname in Quake2.Entities.dictionary;
  }, this).forEach(function (entity) {
    const models = Quake2.Entities.dictionary[entity.classname].MODELS;
    models.forEach(function (model) {
      hash[model] = true;
    }, this);
  }, this);
  for (var name in hash) {
    hash[name] = this.loadModel(name);
  }
  return this._loadHash(hash);
};

Quake2.Loader.prototype.loadMap = function (name) {
  var data;
  return this._loadHash({
    data: this.loadData(`maps/${name}`),
    texture: this.loadImage(`maps/${name}.png`),
    lightmap: this.loadImage(`maps/${name}.light.png`),
    normals: this.loadData('normals'),
  }).then(function (response) {
    data = response;
    const skyBoxNames = response.data.entities.filter(function (entity) {
      return entity.classname === 'worldspawn';
    }).map(function (entity) {
      return entity.sky;
    });
    const entities = response.data.entities;
    return Promise.all([
      skyBoxNames.length ? this.loadSkyBox(skyBoxNames[0]) : null,
      this._loadEntityModels(entities),
      this._loadWeaponSounds(),
      this._loadNoises(entities),
    ]);
  }.bind(this)).then(function (response) {
    data.skyBox = response[0];
    data.models = response[1];
    data.sounds = response[2];
    return data;
  });
};
