Quake2.BSP = function (gl, data) {
  this._gl = gl;
  this._clusterMap = Object.create(null);
  const root = this._parse(data, 0);
  this._setPVS(data);
  return root;
};

Quake2.BSP.prototype._parse = function (data, index) {
  if (index < 0) {
    return new Quake2.BSP.Leaf(this._gl, data, -(index + 1), this._clusterMap);
  } else {
    return new Quake2.BSP.Node(this, data, index);
  }
};

Quake2.BSP.prototype._setPVS = function (data) {
  const pvs = Quake2.PVS.parse(data);
  for (var i in this._clusterMap) {
    this._clusterMap[i]._setPVS(pvs[i].map(function (j) {
      return this._clusterMap[j];
    }, this));
  }
};
