Quake2.Entities.Barrel = function (models, descriptor) {
  var position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  var angle = descriptor.angle || 0;
  this._model = models.spawn('objects/barrels', position, angle);
  this._model.setSkin('models/objects/barrels/skin');
  this._model.playFrames('barrel', 0, 0);
};

Quake2.Entities.Barrel.MODELS = ['objects/barrels'];

Quake2.Entities.Barrel.prototype.tick = function () {};

Quake2.Entities.dictionary['misc_explobox'] = Quake2.Entities.Barrel;
