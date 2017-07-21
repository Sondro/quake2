Quake2.Entities.Flyer = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/flyer', position, angle);
  this._model.setSkin('models/monsters/flyer/skin');
  this._model.play('stand');
};

Quake2.Entities.Flyer.MODELS = ['monsters/flyer'];

Quake2.Entities.Flyer.prototype.tick = function () {};

Quake2.Entities.dictionary['monster_flyer'] = Quake2.Entities.Flyer;
