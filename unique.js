module.exports = function (array) {
  var sorted = array.slice().sort();
  if (sorted.length) {
    var last = sorted[0];
    var result = [last];
    for (var i = 1; i < sorted.length; i++) {
      if (sorted[i] !== last) {
        result.push(last = sorted[i]);
      }
    }
    return result;
  } else {
    return [];
  }
};
