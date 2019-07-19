Quake2.BSP = function (gl, data, index, pvs, on, off) {
  const loader = new Quake2.BSP.Loader(gl, data, index, pvs);
  this._root = loader.parse(data, index);
  this._collides = false;
  this._on = on || null;
  this._off = off || null;
};

Quake2.BSP.prototype.locate = function (position) {
  return this._root.locate(position);
};

Quake2.BSP._temp = {
  x: 0,
  y: 0,
  z: 0,
};

Quake2.BSP.prototype._clip = function (position, offset) {
  if (this._root.blocks) {
    const temp = Quake2.BSP._temp;
    temp.x = position.x + offset.x;
    temp.y = position.y + offset.y;
    temp.z = position.z + offset.z;
    var result = false;
    while (this._root.clip(position, offset, temp)) {
      result = true;
      temp.x = position.x + offset.x;
      temp.y = position.y + offset.y;
      temp.z = position.z + offset.z;
    }
    return result;
  } else {
    return this._root.collides(position);
  }
};

Quake2.BSP.prototype.clip = function (position, offset) {
  const collides = this._clip(position, offset);
  if (collides !== this._collides) {
    if (collides) {
      this._on && this._on();
    } else {
      this._off && this._off();
    }
  }
  return this._collides = collides;
};


Quake2.BSP.Loader = function (gl, data, index, pvs) {
  this._clusters = Object.create(null);
  this._mapFaces(data, index);
  this._createClusters(gl, data);
  this._pvs = pvs;
};

Quake2.BSP.Loader.prototype._mapFaces = function (data, index) {
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

Quake2.BSP.Loader.prototype._createClusters = function (gl, data) {
  for (var i in this._clusters) {
    this._clusters[i] = new Quake2.Cluster(gl, data, this._clusters[i]);
  }
};

Quake2.BSP.Loader.prototype._getLeafClusters = function (data, leafIndex) {
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

Quake2.BSP.Loader.prototype.parse = function (data, index) {
  if (index < 0) {
    const leafIndex = -(index + 1);
    const clusters = this._getLeafClusters(data, leafIndex);
    return new Quake2.BSP.Leaf(data, leafIndex, clusters);
  } else {
    return new Quake2.BSP.Node(this, data, index);
  }
};


Quake2.BSP.Node = function (loader, data, index) {
  data.nodes.loaded[index] = true;
  const planeIndex = data.nodes.plane[index];
  this.plane = data.planes.data.slice(planeIndex * 4, (planeIndex + 1) * 4);
  this.front = loader.parse(data, data.nodes.front[index]);
  this.back = loader.parse(data, data.nodes.back[index]);
  this.blocks = this.front.blocks || this.back.blocks;
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

Quake2.BSP.Node.prototype.collides = function (position) {
  const x = position.x * this.plane[0] + position.y * this.plane[1] +
      position.z * this.plane[2] - this.plane[3];
  if (x < 0) {
    return this.back.collides(position);
  } else {
    return this.front.collides(position);
  }
};

Quake2.BSP.Node.prototype.clip = function (position, offset, final) {
  const nx = this.plane[0];
  const ny = this.plane[1];
  const nz = this.plane[2];
  const d = this.plane[3];
  const x0 = position.x;
  const y0 = position.y;
  const z0 = position.z;
  const x1 = x0 + offset.x;
  const y1 = y0 + offset.y;
  const z1 = z0 + offset.z;
  const a0 = x0 * nx + y0 * ny + z0 * nz;
  const a1 = x1 * nx + y1 * ny + z1 * nz;
  if (a0 < d) {
    if (a1 < d) {
      return this.back.clip(position, offset, final);
    } else {
      if (this.collides(final)) {
        Quake2.Physics.clip(position, offset, -nx, -ny, -nz, -d);
        return true;
      } else {
        return false;
      }
    }
  } else {
    if (a1 < d) {
      if (this.collides(final)) {
        Quake2.Physics.clip(position, offset, nx, ny, nz, d);
        return true;
      } else {
        return false;
      }
    } else {
      return this.front.clip(position, offset, final);
    }
  }
};


Quake2.BSP.Leaf = function (data, index, clusters) {
  this._clusterIndex = data.leaves.cluster[index];
  this._clusters = clusters;
  this.blocks = Quake2.BSP.Leaf._blocks(data, index);
  for (var i in clusters) {
    this.empty = false;
    return;
  }
  this.empty = true;
};

Quake2.BSP.Leaf._blocks = function (data, index) {
  const first = data.leaves.faces.first[index];
  const count = data.leaves.faces.count[index];
  const faces = data.leaves.faces.table.slice(first, first + count);
  return faces.reduce(function (accumulator, currentValue) {
    const textureIndex = data.faces.textureInformation[currentValue];
    return accumulator || !(data.textureInformation.flags[textureIndex] & 128 /* trigger */);
  }, false);
};

Quake2.BSP.Leaf.prototype.locate = function () {
  return this;
};

Quake2.BSP.Leaf.prototype.collides = function (position) {
  return this.empty;
};

Quake2.BSP.Leaf.prototype.clip = function () {
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
