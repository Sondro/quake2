Quake2.Entities.Infantry = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/infantry', position, angle);
  this._model.setSkin('models/monsters/infantry/skin');
  this._model.playFrames('stand', 48, 70);
};

Quake2.Entities.Infantry.MODELS = ['monsters/infantry'];

Quake2.Entities.Infantry.prototype.tick = function () {};

Quake2.Entities.dictionary['monster_infantry'] = Quake2.Entities.Infantry;
