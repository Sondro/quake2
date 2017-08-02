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

Quake2.Loader.prototype._loadHash = function (hash) {
  const keys = Object.keys(hash);
  return Promise.all(keys.map(function (key) {
    return Promise.resolve(hash[key]);
  })).then(function (values) {
    const result = Object.create(null);
    keys.forEach(function (key, index) {
      result[key] = values[index];
    });
    return result;
  });
};

Quake2.Loader.prototype.loadData = function (path) {
  return Promise.resolve($.getJSON('baseq2/' + path + '.json'));
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
      reject(new Error('Failed to load ' + path));
    };
    image.src = 'baseq2/' + path;
  });
};

Quake2.Loader.prototype.loadImages = function (paths) {
  return Promise.all(paths.map(function (path) {
    return this.loadImage(path);
  }, this));
};

Quake2.Loader.prototype.loadTexture = function (name) {
  return this.loadImage('textures/' + name + '.png');
};

Quake2.Loader.prototype.loadTextures = function (names) {
  return this.loadImages(names.map(function (name) {
    return 'textures/' + name + '.png';
  }));
};

Quake2.Loader.prototype.loadSkins = function (names) {
  return Promise.all(names.map(function (name) {
    return this.loadImage(name + '.png');
  }, this)).then(function (images) {
    const hash = Object.create(null);
    names.forEach(function (name, index) {
      hash[name] = images[index];
    });
    return hash;
  });
};

Quake2.Loader.prototype.loadModel = function (name) {
  const response = {};
  return this.loadData('models/' + name + '/tris').then(function (data) {
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
  return this._loadHash({
    data: this.loadData('maps/' + name),
    texture: this.loadImage('maps/' + name + '.png'),
    normals: this.loadData('normals'),
  }).then(function (response) {
    const entities = response.data.entities;
    return this._loadEntityModels(entities).then(function (models) {
      response.models = models;
      return response;
    });
  }.bind(this));
};
