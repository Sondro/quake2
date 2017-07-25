Quake2.Physics = {};

Quake2.Physics.cross = function (u, vx, vy, vz) {
  const x = u.y * vz - u.z * vy;
  const y = u.z * vx - u.x * vz;
  const z = u.x * vy - u.y * vx;
  u.x = x;
  u.y = y;
  u.z = z;
};

Quake2.Physics.clip = function (position, velocity, nx, ny, nz) {
  Quake2.Physics.cross(velocity, nx, ny, nz);
  Quake2.Physics.cross(velocity, nx, ny, nz);
  velocity.x = -velocity.x;
  velocity.y = -velocity.y;
  velocity.z = -velocity.z;
};

Quake2.Physics.GRAVITY = 800;  // Quake units per square second
