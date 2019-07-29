Quake2.Flags = function () {
  this._uriMap = this._parse();
  this._hash = Object.create(null);
};

Quake2.Flags.prototype._parse = function () {
  const hash = Object.create(null);
  window.location.search
      .replace(/^\?/, '')
      .split('&')
      .forEach(function (parameter) {
        const index = parameter.indexOf('=');
        if (index < 0) {
          hash[decodeURIComponent(parameter)] = true;
        } else {
          const key = decodeURIComponent(parameter.slice(0, index));
          const value = decodeURIComponent(parameter.slice(index + 1));
          hash[key] = value;
        }
      });
  return hash;
};

Quake2.Flags.prototype._define = function (parser, name, defaultValue) {
  if (name in this._hash) {
    throw new Error(`flag '${name}' is already defined`);
  } else if (name in this._uriMap) {
    this._hash[name] = parser(this._uriMap[name]);
  } else {
    this._hash[name] = parser(defaultValue);
  }
};

Quake2.Flags.prototype.defineString = function (name, defaultValue) {
  this._define(function (value) {
    return '' + value;
  }, name, defaultValue);
};

Quake2.Flags.prototype.defineBoolean = function (name, defaultValue) {
  this._define(function (value) {
    return Boolean(value);
  }, name, defaultValue);
};

Quake2.Flags.prototype.defineInteger = function (name, defaultValue) {
  this._define(function (value) {
    return ~~value;
  }, name, defaultValue);
};

Quake2.Flags.prototype.defineFloat = function (name, defaultValue) {
  this._define(function (value) {
    return parseFloat(value);
  }, name, defaultValue);
};

Quake2.Flags.prototype.get = function (name) {
  if (name in this._hash) {
    return this._hash[name];
  } else {
    throw new Error(`undefined flag '${name}'`);
  };
};

Quake2.Flags.prototype.set = function (name, value) {
  this._hash[name] = value;
  return this;
};

Quake2.FLAGS = new Quake2.Flags();
