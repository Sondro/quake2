Quake2.Door = function (descriptor, bsp) {
  this._bsp = bsp;
  this._startPosition = {
    x: 0,
    y: 0,
    z: 0,
  };
  const lip = descriptor.lip || 8;
  const size = bsp.getSize();
  if (descriptor.angle === -1) {
    this._endPosition = {
      x: 0,
      y: size.y - lip,
      z: 0,
    };
  } else if (descriptor.angle === -2) {
    this._endPosition = {
      x: 0,
      y: lip - size.y,
      z: 0,
    };
  } else {
    this._endPosition = {
      x: Math.cos(descriptor.angle) * size.x - lip,
      y: 0,
      z: Math.sin(descriptor.angle) * size.z - lip,
    };
  }
  this._speed = descriptor.speed || 100;
  this._wait = descriptor.wait || 3;
  this._open = false;
  this._moving = false;
  this._timeout = null;
  this._close = this._close.bind(this);
};

Quake2.Door.SOUNDS = [
    'doors/dr1_strt',
    'doors/dr1_end',
];

Quake2.Door.prototype.getDuration = function () {
  const dx = this._endPosition.x - this._startPosition.x;
  const dy = this._endPosition.y - this._startPosition.y;
  const dz = this._endPosition.z - this._startPosition.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return distance * 1000 / this._speed;
};

Quake2.Door.prototype.trigger = function () {
  if (this._open) {
    if (this._timeout !== null) {
      window.clearTimeout(this._timeout);
      this._setTimeout(0);
    }
  } else if (this._moving) {
    // TODO: interrupt movement and reopen
  } else {
    this._open = true;
    this._moving = true;
    const duration = this.getDuration();
    this._bsp.translate(this._startPosition, this._endPosition, duration);
    Quake2.Sound.play('doors/dr1_strt');
    this._setTimeout(duration);
  }
};

Quake2.Door.prototype._setTimeout = function (delay) {
  if (this._wait > 0) {
    this._timeout = window.setTimeout(this._close, delay + this._wait * 1000);
  }
};

Quake2.Door.prototype._close = function () {
  this._open = false;
  this._moving = true;
  const duration = this.getDuration();
  this._bsp.translate(this._endPosition, this._startPosition, duration);
  window.setTimeout(function () {
    this._moving = false;
    Quake2.Sound.play('doors/dr1_end');
  }.bind(this), duration);
};
