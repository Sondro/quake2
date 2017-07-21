Quake2.Entities.DeadBody = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn('deadbods/dude', position, angle);

  this._model.setSkin('models/deadbods/dude/dead1');

  // https://github.com/id-Software/Quake-2/blob/master/game/g_misc.c#L1243a
  var frame;
  if (descriptor.spawnflags & 2) {
    frame = 1;
  } else if (descriptor.spawnflags & 4) {
    frame = 2;
  } else if (descriptor.spawnflags & 8) {
    frame = 3;
  } else if (descriptor.spawnflags & 16) {
    frame = 4;
  } else if (descriptor.spawnflags & 32) {
    frame = 5;
  } else {
    frame = 0;
  }
  this._model.playFrames('body', frame, frame);
};


Quake2.Entities.DeadBody.MODELS = ['deadbods/dude'];


Quake2.Entities.DeadBody.prototype.tick = function () {};


Quake2.Entities.dictionary['misc_deadsoldier'] = Quake2.Entities.DeadBody;
