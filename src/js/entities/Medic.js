Quake2.Entities.Medic = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/medic', position, angle);
  this._model.setSkin('models/monsters/medic/skin');
  this._model.play('wait');
};

Quake2.Entities.Medic.MODELS = ['monsters/medic'];

Quake2.Entities.Medic.prototype.tick = function () {};

Quake2.Entities.dictionary['monster_medic'] = Quake2.Entities.Medic;
