Quake2.ModelFactory = function (gl, program, models, normalTable) {
  this._baseModels = Object.create(null);

  for (var name in models) {
    this._baseModels[name] = new Quake2.BaseModel(
      gl, program, name, models[name].data, models[name].skins, normalTable);
  }

  this._models = Object.create(null);

  this._nextId = 0;

};


Quake2.ModelFactory.prototype.create = function (name) {
  if (name in this._baseModels) {
    const baseModel = this._baseModels[name];
    return new Quake2.AnimatedModel(baseModel);
  } else {
    throw new Error(`unknown model "${name}"`);
  }
};


Quake2.ModelFactory.prototype.spawn = function (name, position, angle) {
  if (name in this._baseModels) {
    const baseModel = this._baseModels[name];
    const id = this._nextId++;
    const model = new Quake2.PositionedModel(baseModel, this, id, position, angle);
    return this._models[id] = model;
  } else {
    throw new Error(`unknown model "${name}"`);
  }
};


Quake2.ModelFactory.prototype.destroy = function (id) {
  delete this._models[id];
};


Quake2.ModelFactory.prototype.renderModels = function (bsp, leaf, t) {
  for (var id in this._models) {
    const model = this._models[id];
    const modelLeaf = bsp.locate(model.position);
    if (leaf.views(modelLeaf)) {
      model.render(t);
    }
  }
};
