var Canvas = require('canvas');

module.exports = function (buffer) {
  buffer = new Uint8Array(buffer).buffer;

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

  var canvas = new Canvas(header.width, header.height);
  var context = canvas.getContext('2d');
  var imageData = context.createImageData(header.width, header.height);

  for (var y = 0; y < header.height; y++) {
    for (var x = 0; x < header.width; x++) {
      var i = y * header.width + x;
      imageData.data[i * 4 + 0] = data[i];
      imageData.data[i * 4 + 1] = data[i];
      imageData.data[i * 4 + 2] = data[i];
      imageData.data[i * 4 + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);

  return canvas.toBuffer();
};
