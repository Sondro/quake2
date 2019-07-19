Quake2.Trigger = function (bsp, entities, callback) {
  this._bsp = bsp;
  this._entities = entities;
  this._callback = callback;
  this._colliding = false;
};

Quake2.Trigger.prototype.test = function (position) {
  const colliding = this._bsp.collides(position);
  if (colliding !== this._colliding) {
    if (colliding) {
      this._entities.forEach(function (entity) {
        console.log(`"${entity.target}" activated`);
      });
    } else {
      this._entities.forEach(function (entity) {
        console.log(`"${entity.target}" deactivated`);
      });
    }
    this._colliding = colliding;
  }
};
