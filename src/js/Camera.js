Quake2.Camera = function (bsp) {
  this._bsp = bsp;
  this.origin = {
    x: 0,
    y: 0,
    z: 0,
  };
  this.head = {
    x: 0,
    y: 0,
    z: 0,
  };
  this._temp = {
    x: 0,
    y: 0,
    z: 0,
  };
  this.velocity = {
    x: 0,
    y: 0,
    z: 0,
  };
  this.angle = {
    x: 0,
    y: 0,
  };
};

Quake2.Camera.HEIGHT  = 40;         // Y offset from position
Quake2.Camera.WALKING_SPEED = 200;  // Quake units per second
Quake2.Camera.RUNNING_SPEED = 320;  // Quake units per second

Quake2.Camera.prototype._goingToCollide = function (position) {
  this._temp.x = position.x + this.velocity.x;
  this._temp.y = position.y + this.velocity.y;
  this._temp.z = position.z + this.velocity.z;
  const leaf = this._bsp.locate(this._temp);
  return leaf.empty;
};

Quake2.Camera.prototype.move = function (x, z) {
  this.velocity.x = x * Math.cos(this.angle.y) + z * -Math.sin(this.angle.y) * Math.cos(this.angle.x);
  this.velocity.y = z * Math.sin(this.angle.x);
  this.velocity.z = x * Math.sin(this.angle.y) + z * Math.cos(this.angle.y) * Math.cos(this.angle.x);
  if (this._goingToCollide(this.origin) || this._goingToCollide(this.head)) {
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;
  } else {
    this.origin.x += this.velocity.x;
    this.origin.y += this.velocity.y;
    this.origin.z += this.velocity.z;
    this.head.x += this.velocity.x;
    this.head.y += this.velocity.y;
    this.head.z += this.velocity.z;
  }
};

Quake2.Camera.prototype.setPosition = function (x, y, z) {
  this.origin.x = x;
  this.origin.y = y;
  this.origin.z = z;
  this.head.x = x;
  this.head.y = y + Quake2.Camera.HEIGHT;
  this.head.z = z;
};

Quake2.Camera.prototype.rotate = function (x, y) {
  this.angle.x = Math.min(Math.PI / 2, Math.max(-Math.PI / 2, this.angle.x + x));
  this.angle.y += y;
};

Quake2.Camera.prototype._getSpeed = function (keys) {
  if (keys[16]) {  // Shift
    return Quake2.Camera.RUNNING_SPEED;
  } else {
    return Quake2.Camera.WALKING_SPEED;
  }
};

Quake2.Camera.prototype.tick = function (t0, t1, keys) {
  var x = 0;
  var z = 0;
  const d = this._getSpeed(keys) * (t1 - t0) / 1000;
  if (keys[65]) {  // A
    x -= d;
  }
  if (keys[68]) {  // D
    x += d;
  }
  if (keys[83]) {  // S
    z -= d;
  }
  if (keys[87]) {  // W
    z += d;
  }
  this.move(x, z);
};
