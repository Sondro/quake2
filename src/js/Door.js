Quake2.Door = function (descriptor, bsp) {
  this._bsp = bsp;
  this._startPosition = {
    x: 0,
    y: 0,
    z: 0,
  };
  const offset = descriptor.lip || 8;
  if (descriptor.angle === -1) {
    this._endPosition = {
      x: 0,
      y: offset,
      z: 0,
    };
  } else if (descriptor.angle === -2) {
    this._endPosition = {
      x: 0,
      y: -offset,
      z: 0,
    };
  } else {
    this._endPosition = {
      x: Math.cos(descriptor.angle) * offset,
      y: 0,
      z: Math.sin(descriptor.angle) * offset,
    };
  }
  this._speed = descriptor.speed || 100;
  this._wait = descriptor.wait || 3;
  this._open = false;
  this._moving = false;
  this._timeout = null;
  this._close = this._close.bind(this);
};

Quake2.Door.prototype.trigger = function () {
  if (this._open) {
    if (this._timeout !== null) {
      window.clearTimeout(this._timeout);
      this._setTimeout();
    }
  } else if (this._moving) {
    // TODO: interrupt movement and reopen
  } else {
    this._open = true;
    this._moving = true;
    this._bsp.translate(this._startPosition, this._endPosition, this._speed);
    this._setTimeout();
  }
};

Quake2.Door.prototype._setTimeout = function () {
  if (this._wait > 0) {
    this._timeout = window.setTimeout(this._close, this._wait * 1000);
  }
};

Quake2.Door.prototype._close = function () {
  this._open = false;
  this._moving = true;
  this._bsp.translate(this._endPosition, this._startPosition, this._speed);
};
