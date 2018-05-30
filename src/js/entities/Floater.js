Quake2.Entities.Floater = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/float', position, angle);
  this._model.setSkin('models/monsters/float/skin');
  this._model.play('stand');
};

Quake2.Entities.Floater.MODELS = ['monsters/float'];

Quake2.Entities.dictionary['monster_floater'] = Quake2.Entities.Floater;
