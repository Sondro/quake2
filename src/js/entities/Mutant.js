Quake2.Entities.Mutant = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/mutant', position, angle);
  this._model.setSkin('models/monsters/mutant/skin');
  this._model.play('stand');
};

Quake2.Entities.Mutant.MODELS = ['monsters/mutant'];

Quake2.Entities.dictionary['monster_mutant'] = Quake2.Entities.Mutant;
