Quake2.BSP = function (gl, data) {
  this._clusters = Object.create(null);
  this._createClusters(gl, data, 0);
  this._pvs = Quake2.PVS.parse(data);
  return this._parse(data, 0);
};

Quake2.BSP.prototype._createClusters = function (gl, data, index) {
  if (index < 0) {
    const clusterIndex = data.leaves.cluster[-(index + 1)];
    if (clusterIndex >= 0 && !this._clusters[clusterIndex]) {
      this._clusters[clusterIndex] = Quake2.Cluster.load(gl, data, clusterIndex);
    }
  } else {
    this._createClusters(gl, data, data.nodes.front[index]);
    this._createClusters(gl, data, data.nodes.back[index]);
  }
};

Quake2.BSP.prototype._parse = function (data, index) {
  if (index < 0) {
    const leafIndex = -(index + 1);
    const clusterIndex = data.leaves.cluster[leafIndex];
    const clusters = clusterIndex < 0 ? [] : this._pvs[clusterIndex].map(function (i) {
      return this._clusters[i];
    }, this).filter(function (cluster) {
      return !!cluster;
    });
    return new Quake2.BSP.Leaf(data, leafIndex, clusters);
  } else {
    return new Quake2.BSP.Node(this, data, index);
  }
};


Quake2.BSP.Node = function (bsp, data, index) {
  const planeIndex = data.nodes.plane[index];
  this.plane = data.planes.slice(planeIndex * 4, (planeIndex + 1) * 4);
  this.front = bsp._parse(data, data.nodes.front[index]);
  this.back = bsp._parse(data, data.nodes.back[index]);
};

Quake2.BSP.Node.prototype.locate = function (position) {
  const x = position.x * this.plane[0] + position.y * this.plane[1] +
      position.z * this.plane[2] - this.plane[3];
  if (x < 0) {
    return this.back.locate(position);
  } else {
    return this.front.locate(position);
  }
};


Quake2.BSP.Leaf = function (data, index, clusters) {
  this.clusters = clusters;
  // TODO: add planes
};

Quake2.BSP.Leaf.prototype.locate = function () {
  return this;
};

Quake2.BSP.Leaf.prototype.render = function () {
  for (var i = 0; i < this.clusters.length; i++) {
    this.clusters[i].render();
  }
};
