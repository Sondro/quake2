if (process.argv.length !== 4) {
  console.error('Usage: node unpack <pak_file> <output_path>');
  process.exit(1);
}

var fs = require('fs');
var path = require('path');

var buffer = fs.readFileSync(process.argv[2]);

var signature = buffer.toString('ascii', 0, 4);
if (signature != 'PACK') {
  throw new Error('invalid file signature: "' + signature + '"');
}

var directoryOffset = buffer.readUInt32LE(4);
var directoryLength = buffer.readUInt32LE(8);
var directory = buffer.slice(directoryOffset, directoryOffset + directoryLength);

console.log('extracting...');

function readCString(buffer, start, end) {
  var slice = buffer.slice(start, end);
  var string = '';
  for (var i = 0; i < slice.length; i++) {
    var character = slice.readUInt8(i);
    if (character) {
      string += String.fromCharCode(character);
    }
  }
  return string;
}

for (var offset = 0; offset < directoryLength; offset += 64) {
  var entry = directory.slice(offset, offset + 64);
  var name = readCString(entry, 0, 56).replace('\\', '/');
  console.log(name);
  var pathComponents = name.split('/');
  (function ensureDirectory(rootPath, componentIndex) {
    if (componentIndex < pathComponents.length - 1) {
      var currentPath = path.join(rootPath, pathComponents[componentIndex]);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      } else if (!fs.statSync(currentPath).isDirectory()) {
        throw new Error('unable to create directory "' + currentPath + '"');
      }
      ensureDirectory(currentPath, componentIndex + 1);
    }
  }(process.argv[3], 0));
  var dataOffset = entry.readUInt32LE(56);
  var dataLength = entry.readUInt32LE(60);
  fs.writeFileSync(path.join(process.argv[3], name), buffer.slice(dataOffset, dataOffset + dataLength));
}

console.log('done.');
