Quake2.Target = {};


Quake2.Target.Once = function (callback, delay) {
  this.name = name;
  this._callback = callback;
  this._delay = delay;
  this._triggered = false;
};

Quake2.Target.Once.prototype.trigger = function () {
  if (!this._triggered) {
    this._triggered = true;
    window.setTimeout(this._callback, this._delay);
  }
};


Quake2.Target.Multiple = function (callback, delay) {
  this._callback = callback;
  this._delay = delay;
  this._waiting = false;
  this._timeoutCallback = this._timeoutCallback.bind(this);
};

Quake2.Target.Multiple.prototype._timeoutCallback = function () {
  this._waiting = false;
  this._callback();
};

Quake2.Target.Multiple.prototype.trigger = function () {
  if (!this._waiting) {
    this._waiting = true;
    window.setTimeout(this._timeoutCallback, this._delay);
  }
};


Quake2.Target.Relay = function (on, off, delay) {
  this.name = name;
  this._on = on;
  this._off = off;
  this._delay = delay;
  this._state = Quake2.Target.Relay.STATES.OFF;
  this._onCallback = this._onCallback.bind(this);
  this._offCallback = this._offCallback.bind(this);
};

Quake2.Target.Relay.STATES = {
  OFF: 0,        // 0b00
  ON: 1,         // 0b01
  ALMOST_OFF: 2, // 0b10
  ALMOST_ON: 3,  // 0b11
};

Quake2.Target.Relay.prototype._onCallback = function () {
  this._state = Quake2.Target.Relay.STATES.ON;
  this._on();
};

Quake2.Target.Relay.prototype._offCallback = function () {
  this._state = Quake2.Target.Relay.STATES.OFF;
  this._off();
};

Quake2.Target.Relay.prototype.trigger = function () {
  const states = Quake2.Target.Relay.STATES;
  switch (this._state) {
  case states.OFF:
    this._state = states.ALMOST_ON;
    this._timeout = window.setTimeout(this._onCallback, this._delay);
    break;
  case states.ON:
    this._state = states.ALMOST_OFF;
    this._timeout = window.setTimeout(this._offCallback, this._delay);
    break;
  case states.ALMOST_ON:
    this._state = states.ALMOST_OFF;
    window.clearTimeout(this._timeout);
    this._timeout = window.setTimeout(this._offCallback, this._delay);
    break;
  case states.ALMOST_OFF:
    this._state = states.ALMOST_ON;
    window.clearTimeout(this._timeout);
    this._timeout = window.setTimeout(this._onCallback, this._delay);
    break;
  default:
    throw new Error('invalid trigger state');
  }
};
