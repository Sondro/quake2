const Quake2 = {};

Quake2.inherit = function (Base, Derived) {
  Derived.prototype = Object.create(Base.prototype);
  Derived.prototype.constructor = Derived;
};

Array.prototype.unique = function () {
  const sorted = this.slice().sort(function (a, b) {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  });
  if (sorted.length) {
    var last = sorted[0];
    const result = [last];
    for (var i = 1; i < sorted.length; i++) {
      if (sorted[i] !== last) {
        last = sorted[i];
        result.push(last);
      }
    }
    return result;
  } else {
    return [];
  }
};

Array.prototype.flatten = function () {
  return [].concat.apply([], this);
};
