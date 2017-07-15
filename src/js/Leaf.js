Quake2.BSP.Leaf = function (gl, data, index, clusterMap) {
  this._gl = gl;

  const clusterIndex = data.leaves.cluster[index];
  if (clusterIndex < 0) {
    this.pvs = [];
  } else {
    clusterMap[clusterIndex] = this;
  }

  // TODO
};

Quake2.BSP.Leaf.prototype._setPVS = function (pvs) {
  this.pvs = pvs;
};

Quake2.BSP.Leaf.prototype.locate = function () {
  return this;
};

Quake2.BSP.Leaf.prototype._render = function () {
  // TODO
};

Quake2.BSP.Leaf.prototype.render = function () {
  this._render();
  for (var i = 0; i < this.pvs.length; i++) {
    this.pvs[i]._render();
  }
};
