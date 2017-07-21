if (process.argv.length !== 5) {
  console.error('Invalid number of arguments');
  process.exit(1);
}

var fs = require('fs');

var input = fs.readFileSync(process.argv[3]);

Promise.resolve(require('./' + process.argv[2])(input)).then(function (output) {
  fs.writeFileSync(process.argv[4], output);
}).catch(function (error) {
  console.log(error);
});
