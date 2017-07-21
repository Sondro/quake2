Quake2.Entities.Hover = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/hover', position, angle);
  this._model.setSkin('models/monsters/hover/skin');
  this._model.play('stand');
};

Quake2.Entities.Hover.MODELS = ['monsters/hover'];

Quake2.Entities.Hover.prototype.tick = function () {};

Quake2.Entities.dictionary['monster_hover'] = Quake2.Entities.Hover;
