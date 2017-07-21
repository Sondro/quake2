Quake2.Entities.Boss2 = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/boss2', position, angle);
  this._model.setSkin('models/monsters/boss2/skin');
  this._model.play('stand');
};

Quake2.Entities.Boss2.MODELS = ['monsters/boss2'];

Quake2.Entities.Boss2.prototype.tick = function () {};

Quake2.Entities.dictionary['monster_boss2'] = Quake2.Entities.Boss2;
