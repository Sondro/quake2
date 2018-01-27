var Canvas = require('canvas');


function getImageData(image) {
  var canvas = new Canvas(image.width, image.height);
  var context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
}


function mod2(a, b) {
  return (a % b + b) % b;
}


module.exports = function (buffer, mode) {
  var image = new Canvas.Image();
  image.src = buffer;
  var imageData = getImageData(image);

  var width = image.width;
  var height = image.height;

  var canvas = new Canvas(width + 2, height + 2);
  var context = canvas.getContext('2d');

  var canvasData = context.createImageData(width + 2, height + 2);

  var copy = function (x0, y0, x1, y1) {
    var i = y1 * (width + 2) + x1;
    var j = y0 * width + x0;
    canvasData.data[i * 4 + 0] = imageData.data[j * 4 + 0];
    canvasData.data[i * 4 + 1] = imageData.data[j * 4 + 1];
    canvasData.data[i * 4 + 2] = imageData.data[j * 4 + 2];
    canvasData.data[i * 4 + 3] = imageData.data[j * 4 + 3];
  };

  if (mode === 'wrap') {
    for (var y = 0; y < height + 2; y++) {
      for (var x = 0; x < width + 2; x++) {
        copy(mod2(x - 1, width), mod2(y - 1, height), x, y);
      }
    }
  } else if (mode === 'extend') {
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        copy(x, y, x + 1, y + 1);
      }
    }
    for (var x = 0; x < width; x++) {
      copy(x, 0, x + 1, 0);
      copy(x, height - 1, x + 1, height + 1);
    }
    for (var y = 0; y < height; y++) {
      copy(0, y, 0, y + 1);
      copy(width - 1, y, width + 1, y + 1);
    }
    copy(0, 0, 0, 0);
    copy(width - 1, 0, width + 1, 0);
    copy(0, height - 1, 0, height + 1);
    copy(width - 1, height - 1, width + 1, height + 1);
  } else {
    throw new Error('Invalid border mode: ' + mode);
  }

  context.putImageData(canvasData, 0, 0);

  return canvas.toBuffer();
};
