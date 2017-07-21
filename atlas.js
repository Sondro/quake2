var path = require('path');
var fs = require('fs');
var Canvas = require('canvas');

var wal2png = require('./wal2png.js');
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


function atlas(names, images) {
  var area = images.reduce(function (area, image) {
    return area + image.width * image.height;
  }, 0);

  var area = nextPowerOfTwo(area);
  var exponent = Math.round(Math.log2(area));
  var width = Math.pow(2, Math.ceil(exponent / 2));
  var height = Math.pow(2, Math.floor(exponent / 2));

  var canvas = new Canvas(width, height);
  var context = canvas.getContext('2d');

  var tree = new Node(0, 0, width, height);
  var map = Object.create(null);

  images.forEach(function (image, index) {
    var leaf = tree.insert(image.width, image.height);
    if (leaf) {
      context.drawImage(image, leaf.x, leaf.y);
      map[names[index]] = {
        x: leaf.x,
        y: leaf.y,
        width: leaf.width,
        height: leaf.height
      };
    } else {
      throw new Error();
    }
  });

  return {
    atlas: canvas.toBuffer(),
    map: map
  };
}


module.exports = function (basePath, names) {
  return atlas(names, names.map(function (name) {
    var image = new Canvas.Image();
    image.src = wal2png(fs.readFileSync(path.join(basePath, name.toLowerCase() + '.wal')));
    return image;
  }));
};
