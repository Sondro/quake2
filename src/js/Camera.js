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

Quake2.Camera.HEIGHT  = 45;         // Y offset from position
Quake2.Camera.WALKING_SPEED = 200;  // Quake units per second
Quake2.Camera.RUNNING_SPEED = 320;  // Quake units per second

Quake2.Camera.prototype._collision = function () {
  const leaf = this._bsp.locate(this._temp);
  return leaf.empty;
};

Quake2.Camera.prototype._fall = function (dt) {
  dt /= 1000;
  const a = -Quake2.Physics.GRAVITY * dt;
  const d = (this.velocity.y + a / 2) * dt;
  this._temp.x = this.origin.x;
  this._temp.y = this.origin.y + d;
  this._temp.z = this.origin.z;
  if (this._collision()) {
    this.velocity.y = 0;
  } else {
    this.velocity.y += a;
    this.origin.y += d;
    this.head.y = this.origin.y + Quake2.Camera.HEIGHT;
  }
};

Quake2.Camera.prototype._move = function (x, z) {
  const vx = x * Math.cos(this.angle.y) + z * -Math.sin(this.angle.y);
  const vz = x * Math.sin(this.angle.y) + z * Math.cos(this.angle.y);
  this._temp.x = this.origin.x + vx;
  this._temp.y = this.origin.y;
  this._temp.z = this.origin.z + vz;
  if (!this._collision()) {
    this.origin.x += vx;
    this.origin.z += vz;
    this.head.x = this.origin.x;
    this.head.z = this.origin.z;
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
  const dt = t1 - t0;
  const d = this._getSpeed(keys) * dt / 1000;
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
  this._fall(dt);
  this._move(x, z);
};
