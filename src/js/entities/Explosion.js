Quake2.Entities.Explosion = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = Math.random() * Math.PI * 2;
  this._model = models.spawn('objects/r_explode', position, angle);
  this._model.setSkin('models/objects/r_explode/skin2');

  // https://github.com/id-Software/Quake-2/blob/master/client/cl_tent.c#L901
  if (Math.random() < 0.5) {
    this._model.play('explodb');
  } else {
    this._model.play('explode');
  }

  Quake2.Sound.play('weapons/rocklx1a');
};

Quake2.Entities.Explosion.MODELS = ['objects/r_explode'];
Quake2.Entities.Explosion.SOUNDS = ['weapons/rocklx1a'],

Quake2.Entities.dictionary['target_explosion'] = Quake2.Entities.Explosion;
