if (process.argv.length !== 5) {
  console.error('Usage: node onebsp.js <path_to_baseq2> <map_name> <output_path>');
  process.exit(1);
}

var path = require('path');
var fs = require('fs');
var pcx2png = require('./pcx2png.js');

var bsp2json = require('./bsp2json.js');

var palettePath = path.join(process.argv[2], 'pics', 'colormap.pcx');
console.log('Loading palette "' + palettePath + '"');
var palette = fs.readFileSync(palettePath);
pcx2png(palette).then(function (palette) {
  var output = bsp2json(
      fs.readFileSync(path.join(process.argv[2], 'maps', process.argv[3] + '.bsp')),
      path.join(process.argv[2], 'textures'), palette);

  fs.writeFileSync(path.join(process.argv[4], process.argv[3] + '.json'), output.data);
  fs.writeFileSync(path.join(process.argv[4], process.argv[3] + '.png'), output.atlas);
});
