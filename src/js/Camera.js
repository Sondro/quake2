Quake2.Camera = function () {
  this.position = {
    x: 0,
    y: 0,
    z: 0
  };
  this.velocity = {
    x: 0,
    y: 0,
    z: 0,
  };
  this.angle = {
    x: 0,
    y: 0
  };
}

Quake2.Camera.VELOCITY = 200;  // Quake units per second

Quake2.Camera.prototype.move = function (x, z) {
  this.velocity.x = x * Math.cos(this.angle.y) + z * -Math.sin(this.angle.y) * Math.cos(this.angle.x);
  this.velocity.y = z * Math.sin(this.angle.x);
  this.velocity.z = x * Math.sin(this.angle.y) + z * Math.cos(this.angle.y) * Math.cos(this.angle.x);
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  this.position.z += this.velocity.z;
};

Quake2.Camera.prototype.rotate = function (x, y) {
  this.angle.x = Math.min(Math.PI / 2, Math.max(-Math.PI / 2, this.angle.x + x));
  this.angle.y += y;
};

Quake2.Camera.prototype.tick = function (t0, t1, keys) {
  var x = 0;
  var z = 0;
  const d = Quake2.Camera.VELOCITY * (t1 - t0) / 1000;
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