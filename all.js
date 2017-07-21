if (process.argv.length !== 4) {
  console.error('Usage: node all.js <path_to_baseq2> <output_path>');
  process.exit(1);
}

var path = require('path');
var fs = require('fs');

var md22json = require('./md22json.js');
var bsp2json = require('./bsp2json.js');
var pcx2png = require('./pcx2png.js');

(function convert(root, target) {
  fs.mkdirSync(target);
  fs.readdirSync(root).forEach(function (entry) {
    if (fs.statSync(path.join(root, entry)).isDirectory()) {
      console.log('Entering ' + entry);
      convert(path.join(root, entry), path.join(target, entry));
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
        var output = bsp2json(
            fs.readFileSync(path.join(root, entry)),
            path.join(process.argv[2], 'textures'));
        fs.writeFileSync(path.join(target, entry.replace(/\.bsp$/, '.json')), output.data);
        fs.writeFileSync(path.join(target, entry.replace(/\.bsp$/, '.png')), output.atlas);
        break;
      case /\.pcx$/.test(entry):
        pcx2png(fs.readFileSync(path.join(root, entry))).then(function (buffer) {
          fs.writeFileSync(path.join(target, entry.replace(/\.pcx$/, '.png')), buffer);
        }, function (error) {
          throw error;
        });
        break;
      }
    }
  });
}(process.argv[2], process.argv[3]));

console.log('normals.json');
var normals = require('./normals.json');
fs.writeFileSync(path.join(process.argv[3], 'normals.json'), JSON.stringify(normals));
