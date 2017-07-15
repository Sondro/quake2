Quake2.BSP.Node = function (bsp, data, index) {
  const planeIndex = data.nodes.plane[index];
  this.plane = data.planes.slice(planeIndex * 4, (planeIndex + 1) * 4);
  this.front = bsp._parse(data, data.nodes.front[index]);
  this.back = bsp._parse(data, data.nodes.back[index]);
};

Quake2.BSP.Node.prototype.locate = function (position) {
  const x = position.x * this.plane[0] + position.y * this.plane[1] +
      position.z * this.plane[2] + this.plane[3];
  if (x < 0) {
    return this.back.locate(position);
  } else {
    return this.front.locate(position);
  }
};
