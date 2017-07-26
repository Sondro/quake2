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
  this.offset = {
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

Quake2.Camera.prototype._move = function (dt, x, z) {
  this.offset.x = x * Math.cos(this.angle.y) + z * -Math.sin(this.angle.y);
  this.offset.y = (this.velocity.y - Quake2.Physics.GRAVITY * dt / 2) * dt;
  this.offset.z = x * Math.sin(this.angle.y) + z * Math.cos(this.angle.y);
  this._bsp.locate(this.origin).clip(this.origin, this.offset);
  this.origin.x += this.offset.x;
  this.origin.y += this.offset.y;
  this.origin.z += this.offset.z;
  this.head.x = this.origin.x;
  this.head.y = this.origin.y + Quake2.Camera.HEIGHT;
  this.head.z = this.origin.z;
  this.velocity.y -= Quake2.Physics.GRAVITY * dt;
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
  const dt = (t1 - t0) / 1000;
  const d = this._getSpeed(keys) * dt;
  var x = 0;
  var z = 0;
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
  this._move(dt, x, z);
};
