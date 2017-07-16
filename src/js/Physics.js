Quake2.Physics = {};

Quake2.Physics.cross = function (u, v) {
  const x = u.y * v.z - u.z * v.y;
  const y = u.z * v.x - u.x * v.z;
  const z = u.x * v.y - u.y * v.x;
  u.x = x;
  u.y = y;
  u.z = z;
};

Quake2.Physics.clip = function (position, velocity, normal) {
  Quake2.Physics.cross(velocity, normal);
  Quake2.Physics.cross(velocity, normal);
  velocity.x = -velocity.x;
  velocity.y = -velocity.y;
  velocity.z = -velocity.z;
  position.x += velocity.x;
  position.y += velocity.y;
  position.z += velocity.z;
};
