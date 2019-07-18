Quake2.ModelFactory = function (gl, program, models, normalTable) {
  this._baseModels = Object.create(null);

  for (var name in models) {
    this._baseModels[name] = new Quake2.BaseModel(
      gl, program, name, models[name].data, models[name].skins, normalTable);
  }

  this.models = [];

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
    const model = new Quake2.PositionedModel(baseModel, position, angle);
    this.models.push(model);
    return model;
  } else {
    throw new Error(`unknown model "${name}"`);
  }
};
