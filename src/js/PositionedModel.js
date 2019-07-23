Quake2.PositionedModel = function (model, factory, id, position, angle) {
  Quake2.AnimatedModel.call(this, model);
  this._factory = factory;
  this._id = id;
  this.position = position;
  this.angle = angle;
};

Quake2.inherit(Quake2.AnimatedModel, Quake2.PositionedModel);

Quake2.PositionedModel.prototype.render = function (t) {
  Quake2.AnimatedModel.prototype.render.call(
    this,
    this.position.x,
    this.position.y,
    this.position.z,
    this.angle,
    t
    );
};

Quake2.PositionedModel.prototype.destroy = function () {
  this._factory.destroy(this._id);
};
