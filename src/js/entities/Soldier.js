Quake2.Entities.Soldier = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/soldier', position, angle);

  switch (descriptor.classname) {
  case 'monster_soldier_light':
    this._model.setSkin('models/monsters/soldier/skin_lt');
    break;
  case 'monster_soldier_ss':
    this._model.setSkin('models/monsters/soldier/skin_ss');
    break;
  default:
    this._model.setSkin('models/monsters/soldier/skin');
    break;
  }

  // https://github.com/id-Software/Quake-2/blob/master/game/m_soldier.c#L213
  this._huh = false;
  this._model.playRandom('stand', 0, 29);
};

Quake2.Entities.Soldier.MODELS = ['monsters/soldier'];

Quake2.Entities.Soldier.prototype.tick = function (t) {
  if (this._model.isRestarting(t)) {
    if (this._huh) {
      this._huh = false;
      this._model.playFrames('stand', 0, 29);
    } else if (Math.random() < 0.2) {
      this._huh = true;
      this._model.playFrames('stand', 30, 68);
    }
  }
};

Quake2.Entities.dictionary['monster_soldier'] = Quake2.Entities.Soldier;
Quake2.Entities.dictionary['monster_soldier_light'] = Quake2.Entities.Soldier;
Quake2.Entities.dictionary['monster_soldier_ss'] = Quake2.Entities.Soldier;
