Quake2.Weapons.Blaster = function (models) {
  this._model = models.create('weapons/v_blast');
  this._model.setSkin('models/weapons/v_blast/skin');
  this._model.play('idle');
  this._firing = false;
};

Quake2.Weapons.Blaster.prototype.tick = function (t, keys) {
  if (this._firing) {
    if (keys[17]) {
      Quake2.Sound.playWeapon('blastf1a');
    } else if (this._model.isAtFrame(t, 2)) {
      this._firing = false;
      this._model.play('idle');
    }
  } else if (keys[17]) {  // control key
    this._firing = true;
    Quake2.Sound.playWeapon('blastf1a');
    this._model.play('pow');
  }
};

Quake2.Weapons.Blaster.prototype.render = function (t) {
  this._model.render(0, 0, 0, Math.PI / 2, t);
};

Quake2.Weapons.Blaster.SOUNDS = ['weapons/blastf1a'];
