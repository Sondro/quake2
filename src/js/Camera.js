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
  this.onGround = false;
};

Quake2.Camera.HEIGHT  = 45;         // Y offset from position
Quake2.Camera.WALKING_SPEED = 200;  // Quake units per second
Quake2.Camera.RUNNING_SPEED = 320;  // Quake units per second

Quake2.Camera.prototype._collision = function () {
  const leaf = this._bsp.locate(this._temp);
  return leaf.empty;
};

Quake2.Camera.prototype._fall = function (dt) {
  const a = -Quake2.Physics.GRAVITY * dt;
  const d = (this.velocity.y + a / 2) * dt;
  this._temp.x = this.origin.x;
  this._temp.y = this.origin.y + d;
  this._temp.z = this.origin.z;
  this.onGround = this._collision();
  if (this.onGround) {
    this.velocity.y = 0;
  } else {
    this.velocity.y += a;
    this.origin.y += d;
    this.head.y = this.origin.y + Quake2.Camera.HEIGHT;
  }
};

Quake2.Camera.prototype._jump = function (dt) {
  // TODO: find the actual value of jump acceleration. 10x gravity seems a good
  // estimate.
  const a = Quake2.Physics.GRAVITY * 10 * dt;
  const d = (this.velocity.y + a / 2) * dt;
  this._temp.x = this.head.x;
  this._temp.y = this.head.y + d;
  this._temp.z = this.head.z;
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
    this._temp.x = this.head.x + vx;
    this._temp.y = this.head.y;
    this._temp.z = this.head.z + vz;
    if (!this._collision()) {
      this.origin.x += vx;
      this.origin.z += vz;
      this.head.x = this.origin.x;
      this.head.z = this.origin.z;
    }
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
  const dt = (t1 - t0) / 1000;

  this._fall(dt);

  if (this.onGround) {
    if (keys[32]) {  // space
      this._jump(dt);
    }
  }

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
  this._move(x, z);

};
