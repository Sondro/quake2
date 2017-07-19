Quake2.Weapons.Blaster = function (models) {
  this._model = models.create('weapons/v_blast');
  this._model.setSkin('models/weapons/v_blast/skin');
  this._model.play('idle');
};

Quake2.Weapons.Blaster.prototype.render = function (t) {
  this._model.render(0, 0, 0, Math.PI / 2, t);
};
