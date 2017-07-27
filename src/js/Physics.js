Quake2.Physics = {};

Quake2.Physics.cross = function (u, vx, vy, vz) {
  const x = u.y * vz - u.z * vy;
  const y = u.z * vx - u.x * vz;
  const z = u.x * vy - u.y * vx;
  u.x = x;
  u.y = y;
  u.z = z;
};

Quake2.Physics.clip = function (offset, nx, ny, nz) {
  Quake2.Physics.cross(offset, nx, ny, nz);
  Quake2.Physics.cross(offset, nx, ny, nz);
  offset.x = -offset.x;
  offset.y = -offset.y;
  offset.z = -offset.z;
};

Quake2.Physics.GRAVITY = 800;   // Quake units per square second
Quake2.Physics.STEP_SIZE = 18;  // Maximum height of obstacles on ground
