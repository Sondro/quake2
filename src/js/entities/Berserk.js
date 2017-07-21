Quake2.Entities.Berserk = function (models, descriptor) {
  var position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  var angle = descriptor.angle || 0;
  this._model = models.spawn('monsters/berserk', position, angle);
  this._model.setSkin('models/monsters/berserk/skin');
  this._model.play('stand');
};

Quake2.Entities.Berserk.MODELS = ['monsters/berserk'];

Quake2.Entities.Berserk.prototype.tick = function () {};

Quake2.Entities.dictionary['monster_berserk'] = Quake2.Entities.Berserk;
