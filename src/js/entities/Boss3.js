Quake2.Entities.Jorg = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/boss3/jorg', position, angle);
  this._model.setSkin('models/monsters/boss3/jorg/skin');
  this._model.play('stand');
};

Quake2.Entities.Jorg.MODELS = ['monsters/boss3/jorg', 'monsters/boss3/rider'];

Quake2.Entities.dictionary['monster_jorg'] = Quake2.Entities.Jorg;


Quake2.Entities.Rider = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/boss3/rider', position, angle);
  this._model.setSkin('models/monsters/boss3/rider/skin');
  this._model.play('stand');
};

Quake2.Entities.Rider.MODELS = ['monsters/boss3/rider'];

Quake2.Entities.dictionary['monster_boss3_stand'] = Quake2.Entities.Rider;
