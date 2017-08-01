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


module.exports = function (buffer) {
  var image = new Canvas.Image();
  image.src = buffer;
  var imageData = getImageData(image);

  var width = image.width;
  var height = image.height;

  var canvas = new Canvas(width + 2, height + 2);
  var context = canvas.getContext('2d');

  var canvasData = context.createImageData(width + 2, height + 2);

  for (var y = 0; y < height + 2; y++) {
    for (var x = 0; x < width + 2; x++) {
      var i = y * (width + 2) + x;
      var j = mod2(y - 1, height) * width + mod2(x - 1, width);
      canvasData.data[i * 4 + 0] = imageData.data[j * 4 + 0];
      canvasData.data[i * 4 + 1] = imageData.data[j * 4 + 1];
      canvasData.data[i * 4 + 2] = imageData.data[j * 4 + 2];
      canvasData.data[i * 4 + 3] = imageData.data[j * 4 + 3];
    }
  }

  context.putImageData(canvasData, 0, 0);

  return canvas.toBuffer();
};
