var Canvas = require('canvas');

var border = require('./border.js');
var nextPowerOfTwo = require('./pot.js');


function Node(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.leaf = false;
  this.left = null;
  this.right = null;
}

Node.prototype.insert = function (width, height) {
  if (this.leaf) {
    return null;
  } else if (this.left && this.right) {
    return this.left.insert(width, height) || this.right.insert(width, height);
  } else if (width < this.width) {
    if (height < this.height) {
      if (this.width - width > this.height - height) {
        this.left = new Node(this.x, this.y, width, this.height);
        this.right = new Node(this.x + width, this.y, this.width - width, this.height);
      } else {
        this.left = new Node(this.x, this.y, this.width, height);
        this.right = new Node(this.x, this.y + height, this.width, this.height - height);
      }
      return this.left.insert(width, height);
    } else if (height > this.height) {
      return null;
    } else {
      this.left = new Node(this.x, this.y, width, this.height);
      this.right = new Node(this.x + width, this.y, this.width - width, this.height);
      return this.left.insert(width, height);
    }
  } else if (width > this.width) {
    return null;
  } else if (height < this.height) {
    this.left = new Node(this.x, this.y, this.width, height);
    this.right = new Node(this.x, this.y + height, this.width, this.height - height);
    return this.left.insert(width, height);
  } else if (height > this.height) {
    return null;
  } else {
    this.leaf = true;
    return this;
  }
};


function atlas(images) {
  var area = 0;
  for (var name in images) {
    area += images[name].width * images[name].height;
  }
  area = nextPowerOfTwo(area);

  var exponent = Math.round(Math.log2(area));
  var width = Math.pow(2, Math.ceil(exponent / 2));
  var height = Math.pow(2, Math.floor(exponent / 2));

  var canvas = new Canvas(width, height);
  var context = canvas.getContext('2d');

  var tree = new Node(0, 0, width, height);
  var map = Object.create(null);

  var area = function (name) {
    return images[name].width * images[name].height;
  };

  var names = Object.keys(images).sort(function (a, b) {
    return area(b) - area(a);
  });

  names.forEach(function (name) {
    var image = images[name];
    var leaf = tree.insert(image.width, image.height);
    if (leaf) {
      context.drawImage(image, leaf.x, leaf.y);
      map[name] = {
        x: leaf.x + 1,
        y: leaf.y + 1,
        width: leaf.width - 2,
        height: leaf.height - 2,
      };
    } else {
      throw new Error('no room for ' + name);
    }
  });

  return {
    atlas: canvas.toBuffer(),
    map: map,
  };
}


module.exports = function (buffers) {
  var images = Object.create(null);
  for (var name in buffers) {
    images[name] = new Canvas.Image();
    images[name].src = border(buffers[name]);
  }
  return atlas(images);
};
