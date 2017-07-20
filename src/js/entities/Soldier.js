Quake2.Entities.Soldier = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/soldier', position, angle);

  // TODO: https://github.com/id-Software/Quake-2/blob/master/game/m_soldier.c#L213
  switch (descriptor.classname) {
  case 'monster_soldier_light':
    this._model.setSkin('models/monsters/soldier/skin_lt');
    this._model.playFrames('stand', 0, 29);
    break;
  case 'monster_soldier_ss':
    this._model.setSkin('models/monsters/soldier/skin_ss');
    this._model.playFrames('stand', 30, 68);
    break;
  default:
    this._model.setSkin('models/monsters/soldier/skin');
    this._model.playFrames('stand', 30, 68);
    break;
  }

};

Quake2.Entities.Soldier.MODELS = ['monsters/soldier'];

Quake2.Entities.Soldier.prototype.tick = function () {};

Quake2.Entities.dictionary['monster_soldier'] = Quake2.Entities.Soldier;
Quake2.Entities.dictionary['monster_soldier_light'] = Quake2.Entities.Soldier;
Quake2.Entities.dictionary['monster_soldier_ss'] = Quake2.Entities.Soldier;
