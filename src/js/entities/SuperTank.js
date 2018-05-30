Quake2.Entities.SuperTank = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/boss1', position, angle);
  this._model.setSkin('models/monsters/boss1/skin');
  this._model.play('stand');
};

Quake2.Entities.SuperTank.MODELS = ['monsters/boss1'];

Quake2.Entities.dictionary['monster_supertank'] = Quake2.Entities.SuperTank;
