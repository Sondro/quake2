Quake2.Entities.Infantry = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/infantry', position, angle);
  this._model.setSkin('models/monsters/infantry/skin');

  // https://github.com/id-Software/Quake-2/blob/master/game/m_infantry.c#L73
  this._model.playFrames('stand', 49, 70);
};

Quake2.Entities.Infantry.MODELS = ['monsters/infantry'];

Quake2.Entities.dictionary['monster_infantry'] = Quake2.Entities.Infantry;
