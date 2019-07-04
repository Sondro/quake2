const { createCanvas } = require('canvas');


module.exports = function (buffer, width, height) {
  var data = new Uint8Array(buffer);

  var canvas = createCanvas(width, height);
  var context = canvas.getContext('2d');
  var imageData = context.createImageData(width, height);

  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var i = y * width + x;
      imageData.data[i * 4 + 0] = data[i * 3 + 0];
      imageData.data[i * 4 + 1] = data[i * 3 + 1];
      imageData.data[i * 4 + 2] = data[i * 3 + 2];
      imageData.data[i * 4 + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);

  return canvas.toBuffer();
};
