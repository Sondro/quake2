Quake2.Entities.Tank = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/tank', position, angle);
  switch (descriptor.classname) {
  case 'monster_tank_commander':
    this._model.setSkin('models/monsters/tank/../ctank/skin');
    break;
  default:
    this._model.setSkin('models/monsters/tank/skin');
    break;
  }
  this._model.play('stand');
};

Quake2.Entities.Tank.MODELS = ['monsters/tank'];

Quake2.Entities.Tank.prototype.tick = function () {};

Quake2.Entities.dictionary['monster_tank'] = Quake2.Entities.Tank;
Quake2.Entities.dictionary['monster_tank_commander'] = Quake2.Entities.Tank;
