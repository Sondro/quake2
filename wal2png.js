const { createCanvas, Image } = require('canvas');


function toImageData(buffer) {
  var image = new Image();
  image.src = buffer;
  var width = image.width;
  var height = image.height;
  var canvas = createCanvas(width, height);
  var context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, width, height);
}


module.exports = function (buffer, palette) {
  buffer = new Uint8Array(buffer).buffer;
  palette = toImageData(palette);

  var headerData = new Buffer(buffer.slice(0, 160));
  var header = {
    width: headerData.readUInt32LE(32),
    height: headerData.readUInt32LE(36),
    offsets: [
      headerData.readUInt32LE(40),
      headerData.readUInt32LE(44),
      headerData.readUInt32LE(48),
      headerData.readUInt32LE(52),
    ]
  };

  var data = new Uint8Array(buffer.slice(
      header.offsets[0], header.offsets[0] + header.width * header.height));

  var canvas = createCanvas(header.width, header.height);
  var context = canvas.getContext('2d');
  var imageData = context.createImageData(header.width, header.height);

  for (var y = 0; y < header.height; y++) {
    for (var x = 0; x < header.width; x++) {
      var i = y * header.width + x;
      var j = data[i];
      imageData.data[i * 4 + 0] = palette.data[j * 4 + 0];
      imageData.data[i * 4 + 1] = palette.data[j * 4 + 1];
      imageData.data[i * 4 + 2] = palette.data[j * 4 + 2];
      imageData.data[i * 4 + 3] = palette.data[j * 4 + 3];
    }
  }

  context.putImageData(imageData, 0, 0);

  return canvas.toBuffer();
};
