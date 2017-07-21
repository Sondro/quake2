var nextPowerOfTwo = require('./pot.js');

var gm = require('gm').subClass({
  imageMagick: true
});

var Canvas = require('canvas');

function resize(buffer) {
  var image = new Canvas.Image();
  image.src = buffer;
  var canvas = new Canvas(nextPowerOfTwo(image.width), nextPowerOfTwo(image.height));
  var context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  return canvas.toBuffer();
};

module.exports = function (buffer) {
  return new Promise(function (resolve, reject) {
    gm(buffer, 'image.pcx').toBuffer('PNG', function (error, buffer) {
      if (error) {
        reject(error);
      } else {
        resolve(resize(buffer));
      }
    });
  });
};
