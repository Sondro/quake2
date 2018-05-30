Quake2.Entities.Chick = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/bitch', position, angle);
  this._model.setSkin('models/monsters/bitch/skin');
  this._model.play('stand');
};

Quake2.Entities.Chick.MODELS = ['monsters/bitch'];

Quake2.Entities.dictionary['monster_chick'] = Quake2.Entities.Chick;
