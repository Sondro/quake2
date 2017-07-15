const Quake2 = {};

Quake2.cross = function (u, v) {
  var x = u.y * v.z - u.z * v.y;
  var y = u.z * v.x - u.x * v.z;
  var z = u.x * v.y - u.y * v.x;
  u.x = x;
  u.y = y;
  u.z = z;
};

Quake2.clip = function (position, velocity, normal) {
  Quake2.cross(velocity, normal);
  Quake2.cross(velocity, normal);
  velocity.x = -velocity.x;
  velocity.y = -velocity.y;
  velocity.z = -velocity.z;
  position.x += velocity.x;
  position.y += velocity.y;
  position.z += velocity.z;
};
