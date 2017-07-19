const Quake2 = {};

Quake2.inherit = function (Base, Derived) {
  Derived.prototype = Object.create(Base.prototype);
  Derived.prototype.constructor = Derived;
};
