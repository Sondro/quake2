module.exports = function (buffer, start, length) {
  var array = Array.prototype.slice.call(new Uint8Array(buffer.slice(start, start + length)));
  var firstNull = array.indexOf(0);
  if (firstNull >= 0) {
    array = array.slice(0, firstNull);
  }
  return array.map(function (code) {
    return String.fromCharCode(code);
  }).join('');
};
