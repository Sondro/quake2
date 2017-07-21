Quake2.Entities.Gladiator = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/gladiatr', position, angle);
  this._model.setSkin('models/monsters/gladiatr/skin');
  this._model.play('stand');
};

Quake2.Entities.Gladiator.MODELS = ['monsters/gladiatr'];

Quake2.Entities.Gladiator.prototype.tick = function () {};

Quake2.Entities.dictionary['monster_gladiator'] = Quake2.Entities.Gladiator;
