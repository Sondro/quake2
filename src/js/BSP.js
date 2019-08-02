Quake2.BSP = function (gl, data, index, pvs, callback) {
  const loader = new Quake2.BSP.Loader(gl, data, index, pvs);
  this._root = loader.parse(data, index);
  this._min = {
    x: data.nodes.min[index * 3],
    y: data.nodes.min[index * 3 + 1],
    z: data.nodes.min[index * 3 + 2],
  };
  this._max = {
    x: data.nodes.max[index * 3],
    y: data.nodes.max[index * 3 + 1],
    z: data.nodes.max[index * 3 + 2],
  };
  this._animation = {
    startPosition: {
      x: 0,
      y: 0,
      z: 0,
    },
    endPosition: {
      x: 0,
      y: 0,
      z: 0,
    },
    startTime: 0,
    duration: 0,
    rotationSpeed: 0,
  };
  this._collides = false;
  this._callback = callback || null;
};

Quake2.BSP.prototype.locate = function (position) {
  return this._root.locate(position);
};

Quake2.BSP._size = {
  x: 0,
  y: 0,
  z: 0,
};

Quake2.BSP.prototype.getSize = function () {
  const size = Quake2.BSP._size;
  size.x = this._max.x - this._min.x;
  size.y = this._max.y - this._min.y;
  size.z = this._max.z - this._min.z;
  return size;
};

Quake2.BSP.prototype.translate = function (startPosition, endPosition, duration) {
  this._animation.startPosition = startPosition;
  this._animation.endPosition = endPosition;
  this._animation.startTime = Date.now();
  this._animation.duration = duration;
};

Quake2.BSP.prototype.rotate = function (origin, speed) {
  this._animation.startPosition = {
    x: origin[0],
    y: origin[1],
    z: origin[2],
  };
  this._animation.endPosition = this._animation.startPosition;
  this._animation.rotationSpeed = speed;
};

Quake2.BSP._origin = {
  x: 0,
  y: 0,
  z: 0,
};

Quake2.BSP.prototype.getOrigin = function (t) {
  const origin = Quake2.BSP._origin;
  const startPosition = this._animation.startPosition;
  const duration = this._animation.duration;
  if (duration > 0) {
    const endPosition = this._animation.endPosition;
    const startTime = this._animation.startTime;
    const progress = Math.min(duration, t - startTime);
    origin.x = startPosition.x + (endPosition.x - startPosition.x) * progress / duration;
    origin.y = startPosition.y + (endPosition.y - startPosition.y) * progress / duration;
    origin.z = startPosition.z + (endPosition.z - startPosition.z) * progress / duration;
  } else {
    origin.x = startPosition.x;
    origin.y = startPosition.y;
    origin.z = startPosition.z;
  }
  return origin;
};

Quake2.BSP.prototype.render = function (worldProgram, position, t) {
  const leaf = this._root.locate(position);
  const origin = this.getOrigin(t);
  if (this._animation.rotationSpeed) {
    const period = Math.PI * 2000 / this._animation.rotationSpeed;
    angle = (t % period) * Math.PI * 2 / period;
  } else {
    angle = 0;
  }
  worldProgram.prepare2(origin.x, origin.y, origin.z, angle);
  leaf.render();
  return leaf;
};

Quake2.BSP._position = {
  x: 0,
  y: 0,
  z: 0,
};

Quake2.BSP.prototype._getCorrectedPosition = function (position, t) {
  const origin = this.getOrigin(t);
  const result = Quake2.BSP._position;
  result.x = position.x - origin.x;
  result.y = position.y - origin.y;
  result.z = position.z - origin.z;
  return result;
};

Quake2.BSP._temp = {
  x: 0,
  y: 0,
  z: 0,
};

Quake2.BSP.prototype._clip = function (t, position, offset) {
  // TODO: take rotations into account
  position = this._getCorrectedPosition(position, t);
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

Quake2.BSP.prototype.clip = function (t, position, offset) {
  const collides = this._clip(t, position, offset);
  if (collides && collides !== this._collides) {
    this._callback && this._callback();
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
  const a0 = position.x * nx + position.y * ny + position.z * nz;
  const a1 = final.x * nx + final.y * ny + final.z * nz;
  if (a0 < d) {
    if (a1 < d) {
      return this.back.clip(position, offset, final);
    } else {
      if (this.front.collides(final)) {
        Quake2.Physics.clip(position, offset, -nx, -ny, -nz, -d);
        return true;
      } else {
        return false;
      }
    }
  } else {
    if (a1 < d) {
      if (this.back.collides(final)) {
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
