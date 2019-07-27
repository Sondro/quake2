module.exports = function (script) {
  var lines = script.split(/\n+/g);
  var entities = [];
  for (var i = 0; i < lines.length; i++) {
    if (!lines[i]) {
      continue;
    }
    if (lines[i] !== '{') {
      throw new Error('Line ' + i + ': "{" expected instead of: ' + lines[i]);
    }
    var entity = {};
    entities.push(entity);
    while (lines[++i] !== '}') {
      var re = /^\"([^"]*)\"\s+\"([^"]*)\"$/.exec(lines[i]);
      if (re) {
        var key = re[1];
        var value = re[2];
        switch (key) {
        case 'spawnflags':
          value = parseInt(value, 10);
          break;
        case 'origin':
          var splitted = value.split(/\s+/g);
          value = [
            parseFloat(splitted[0]),
            parseFloat(splitted[2]),
            parseFloat(splitted[1])
          ];
          break;
        case 'angle':
          value = parseFloat(value);
          if (value > 0) {
            value = value * Math.PI / 180;
          }
          break;
        case 'model':
          var re = /\*([0-9]+)/.exec(value);
          value = parseInt(re[1], 10);
          break;
        case 'delay':
        case 'dmg':
        case 'health':
        case 'speed':
          value = parseFloat(value);
          break;
        case 'noise':
          value = value.replace(/\.wav$/, '');
          break;
        }
        entity[key] = value;
      } else {
        throw new Error('Line ' + i + ': unrecognized syntax: ' + lines[i]);
      }
    }
  }
  return entities;
};
