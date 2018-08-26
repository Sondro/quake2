if (process.argv.length !== 4) {
  console.error('Usage: node all.js <path_to_baseq2> <output_path>');
  process.exit(1);
}

var path = require('path');
var fs = require('fs');

var md22json = require('./md22json.js');
var bsp2json = require('./bsp2json.js');
var pcx2png = require('./pcx2png.js');

function convert(root, target, palette) {
  fs.mkdirSync(target);
  fs.readdirSync(root).forEach(function (entry) {
    if (fs.statSync(path.join(root, entry)).isDirectory()) {
      console.log('Entering ' + entry);
      convert(path.join(root, entry), path.join(target, entry), palette);
    } else {
      console.log(entry);
      switch (true) {
      case /\.md2$/.test(entry):
        fs.writeFileSync(
            path.join(target, entry.replace(/\.md2$/, '.json')),
            md22json(fs.readFileSync(path.join(root, entry)))
            );
        break;
      case /\.bsp$/.test(entry):
        try {
          var output = bsp2json(
              fs.readFileSync(path.join(root, entry)),
              path.join(process.argv[2], 'textures'),
              palette);
          fs.writeFileSync(path.join(target, entry.replace(/\.bsp$/, '.json')), output.data);
          fs.writeFileSync(path.join(target, entry.replace(/\.bsp$/, '.png')), output.atlas.texture);
          fs.writeFileSync(path.join(target, entry.replace(/\.bsp$/, '.light.png')), output.atlas.lightmap);
        } catch (error) {
          console.error(error);
        }
        break;
      case /\.pcx$/.test(entry):
        pcx2png(fs.readFileSync(path.join(root, entry))).then(function (buffer) {
          fs.writeFileSync(path.join(target, entry.replace(/\.pcx$/, '.png')), buffer);
        }, function (error) {
          throw error;
        });
        break;
      case /\.wav$/i.test(entry):
        fs.writeFileSync(
            path.join(target, entry.toLowerCase()),
            fs.readFileSync(path.join(root, entry)));
        break;
      }
    }
  });
}

var palettePath = path.join(process.argv[2], 'pics', 'colormap.pcx');
console.log('Loading palette "' + palettePath + '"');
var palette = fs.readFileSync(palettePath);
pcx2png(palette).then(function (palette) {
  convert(process.argv[2], process.argv[3], palette);
  console.log('normals.json');
  var normals = require('./normals.json');
  fs.writeFileSync(path.join(process.argv[3], 'normals.json'), JSON.stringify(normals));
}).catch(function (error) {
  console.error(error);
});
