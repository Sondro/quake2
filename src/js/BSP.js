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

Quake2.BSP.prototype._getLeafPlanes = function (data, leafIndex) {
  const first = data.leaves.brushes.first[leafIndex];
  const count = data.leaves.brushes.count[leafIndex];
  const brushes = data.leaves.brushes.table.slice(first, first + count);
  return brushes.map(function (brushIndex) {
    const first = data.brushes.first[brushIndex];
    const count = data.brushes.count[brushIndex];
    return data.brushes.planes.slice(first, first + count);
  }).flatten().unique().map(function (planeIndex) {
    return data.planes.slice(planeIndex * 4, (planeIndex + 1) * 4);
  }).flatten();
};

Quake2.BSP.prototype._parse = function (data, index) {
  if (index < 0) {
    const leafIndex = -(index + 1);
    const clusters = this._getLeafClusters(data, leafIndex);
    const planes = this._getLeafPlanes(data, leafIndex);
    return new Quake2.BSP.Leaf(data, leafIndex, clusters, planes);
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


Quake2.BSP.Leaf = function (data, index, clusters, planes) {
  this.index = index;  // TODO: remove
  this._clusterIndex = data.leaves.cluster[index];
  this._clusters = clusters;
  this._planes = planes;
  for (var i in clusters) {
    this.empty = false;
    return;
  }
  this.empty = true;
};

Quake2.BSP.Leaf.prototype.locate = function () {
  return this;
};

Quake2.BSP.Leaf.prototype.views = function (leaf) {
  return leaf._clusterIndex in this._clusters;
};

Quake2.BSP.Leaf.prototype.clip = function (position, offset) {
  const x0 = position.x;
  const y0 = position.y;
  const z0 = position.z;
  const x1 = position.x + offset.x;
  const y1 = position.y + offset.y;
  const z1 = position.z + offset.z;
  const count = this._planes.length / 4;
  for (var i = 0; i < count; i++) {
    const nx = this._planes[i * 4 + 0];
    const ny = this._planes[i * 4 + 1];
    const nz = this._planes[i * 4 + 2];
    const d = this._planes[i * 4 + 3];
    const a0 = x0 * nx + y0 * ny + z0 * nz - d;
    const a1 = x1 * nx + y1 * ny + z1 * nz - d;
    if (a0 >= 0 && a1 < 0) {
      Quake2.Physics.clip(offset, nx, ny, nz, d);
    }
  }
};

Quake2.BSP.Leaf.prototype.render = function () {
  for (var i in this._clusters) {
    this._clusters[i].render();
  }
};
