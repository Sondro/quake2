Quake2.Entities.Gunner = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/gunner', position, angle);
  this._model.setSkin('models/monsters/gunner/skin');
  this._model.play('stand');
};

Quake2.Entities.Gunner.MODELS = ['monsters/gunner'];

Quake2.Entities.Gunner.prototype.tick = function () {};

Quake2.Entities.dictionary['monster_gunner'] = Quake2.Entities.Gunner;
