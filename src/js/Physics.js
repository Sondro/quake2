Quake2.Physics = {};


Quake2.Physics.clip = function (position, offset, nx, ny, nz, d) {
  const x = position.x + offset.x;
  const y = position.y + offset.y;
  const z = position.z + offset.z;
  const backoff = d - x * nx - y * ny - z * nz + Quake2.Physics.EPSILON;
  offset.x += nx * backoff;
  offset.y += ny * backoff;
  offset.z += nz * backoff;
};


// Gravity acceleration expressed in Quake units per square second.
Quake2.Physics.GRAVITY = 800;


// Maximum height of obstacles on ground. Players and monsters may step onto
// obstacles at most this high, otherwise they are blocked.
Quake2.Physics.STEP_SIZE = 18;


// Security distance from any wall. Crossing a wall and ending up in an empty
// leaf has nasty consequences (the physics algorithm loops and the whole app
// becomes unresponsive), so we want to avoid even the slightest floating point
// error and keep some distance from the walls. We're using 0.125 rather than,
// say, 0.1, because its exponent is integer and can be expressed nicely in
// floating point format.
Quake2.Physics.EPSILON = 0.125;
