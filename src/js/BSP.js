Quake2.BSP = function (gl, data) {
  this._clusters = Object.create(null);
  this._mapFaces(data, 0);
  this._createClusters(gl, data, 0);
  this._pvs = Quake2.PVS.parse(data);
  return this._parse(data, 0);
};

Quake2.BSP.prototype._mapFaces = function (data, index) {
  if (index < 0) {
    const leafIndex = -(index + 1);
    const first = data.leaves.faces.first[leafIndex];
    const count = data.leaves.faces.count[leafIndex];
    if (count > 0) {
      const faces = data.leaves.faces.table.slice(first, first + count);
      const clusterIndex = data.leaves.cluster[leafIndex];
      if (clusterIndex >= 0) {
        if (!(clusterIndex in this._clusters)) {
          this._clusters[clusterIndex] = [];
        }
        this._clusters[clusterIndex] = this._clusters[clusterIndex].concat(faces);
      }
    }
  } else {
    this._mapFaces(data, data.nodes.front[index]);
    this._mapFaces(data, data.nodes.back[index]);
  }
};

Quake2.BSP.prototype._createClusters = function (gl, data) {
  for (var i in this._clusters) {
    this._clusters[i] = new Quake2.Cluster(gl, data, this._clusters[i]);
  }
};

Quake2.BSP.prototype._getLeafClusters = function (data, leafIndex) {
  const clusters = Object.create(null);
  const clusterIndex = data.leaves.cluster[leafIndex];
  if (clusterIndex >= 0) {
    this._pvs[clusterIndex].forEach(function (i) {
      if (this._clusters[i]) {
        clusters[i] = this._clusters[i];
      }
    }, this);
  }
  return clusters;
};

Quake2.BSP.prototype._parse = function (data, index) {
  if (index < 0) {
    const leafIndex = -(index + 1);
    const clusters = this._getLeafClusters(data, leafIndex);
    return new Quake2.BSP.Leaf(data, leafIndex, clusters);
  } else {
    return new Quake2.BSP.Node(this, data, index);
  }
};


Quake2.BSP.Node = function (bsp, data, index) {
  const planeIndex = data.nodes.plane[index];
  this.plane = data.planes.data.slice(planeIndex * 4, (planeIndex + 1) * 4);
  this.front = bsp._parse(data, data.nodes.front[index]);
  this.back = bsp._parse(data, data.nodes.back[index]);
};

Quake2.BSP.Node._temp = {
  x: 0,
  y: 0,
  z: 0,
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

Quake2.BSP.Node.prototype._isEmpty = function () {
  const temp = Quake2.BSP.Node._temp;
  const x = temp.x * this.plane[0] + temp.y * this.plane[1] +
      temp.z * this.plane[2] - this.plane[3];
  if (x < 0) {
    return this.back._isEmpty();
  } else {
    return this.front._isEmpty();
  }
};

Quake2.BSP.Node.prototype._clip = function (position, offset) {
  const nx = this.plane[0];
  const ny = this.plane[1];
  const nz = this.plane[2];
  const d = this.plane[3];
  const x0 = position.x;
  const y0 = position.y;
  const z0 = position.z;
  const x1 = position.x + offset.x;
  const y1 = position.y + offset.y;
  const z1 = position.z + offset.z;
  const a0 = x0 * nx + y0 * ny + z0 * nz - d;
  const a1 = x1 * nx + y1 * ny + z1 * nz - d;
  if (a0 < 0) {
    if (a1 < 0) {
      return this.back._clip(position, offset);
    } else {
      if (this._isEmpty()) {
        Quake2.Physics.clip(position, offset, -nx, -ny, -nz, -d);
        return true;
      } else {
        return false;
      }
    }
  } else {
    if (a1 < 0) {
      if (this._isEmpty()) {
        Quake2.Physics.clip(position, offset, nx, ny, nz, d);
        return true;
      } else {
        return false;
      }
    } else {
      return this.front._clip(position, offset);
    }
  }
};

Quake2.BSP.Node.prototype.clip = function (position, offset) {
  const temp = Quake2.BSP.Node._temp;
  temp.x = position.x + offset.x;
  temp.y = position.y + offset.y;
  temp.z = position.z + offset.z;
  var result = false;
  while (this._clip(position, offset)) {
    result = true;
    temp.x = position.x + offset.x;
    temp.y = position.y + offset.y;
    temp.z = position.z + offset.z;
  }
  return result;
};


Quake2.BSP.Leaf = function (data, index, clusters) {
  this._clusterIndex = data.leaves.cluster[index];
  this._clusters = clusters;
  for (var i in clusters) {
    this.empty = false;
    return;
  }
  this.empty = true;
};

Quake2.BSP.Leaf.prototype.locate = function () {
  return this;
};

Quake2.BSP.Leaf.prototype._isEmpty = function () {
  return this.empty;
};

Quake2.BSP.Leaf.prototype._clip = function () {
  return false;
};

Quake2.BSP.Leaf.prototype.views = function (leaf) {
  return leaf._clusterIndex in this._clusters;
};

Quake2.BSP.Leaf.prototype.render = function () {
  for (var i in this._clusters) {
    this._clusters[i].render();
  }
};
