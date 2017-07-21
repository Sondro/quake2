Quake2.Entities.Parasite = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/parasite', position, angle);
  this._model.setSkin('models/monsters/parasite/skin');
  this._model.play('stand');
};

Quake2.Entities.Parasite.MODELS = [
  'monsters/parasite',
  'monsters/parasite/segment',
  'monsters/parasite/tip',
];

Quake2.Entities.Parasite.prototype.tick = function () {};

Quake2.Entities.dictionary['monster_parasite'] = Quake2.Entities.Parasite;
