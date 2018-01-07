$(function () {
  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');

  const loadMap = function () {
    const hash = Object.create(null);
    window.location.search
        .replace(/^\?/, '')
        .split('&')
        .forEach(function (parameter) {
          const index = parameter.indexOf('=');
          if (index < 0) {
            hash[decodeURIComponent(parameter)] = true;
          } else {
            const key = decodeURIComponent(parameter.slice(0, index));
            const value = decodeURIComponent(parameter.slice(index + 1));
            hash[key] = value;
          }
        });
    const loader = new Quake2.Loader();
    if ('map' in hash) {
      return loader.loadMap(hash.map);
    } else {
      return loader.loadMap('base1');
    }
  };

  loadMap().then(function (assets) {
    const game = new Quake2.Game(gl, assets);

    const keys = Object.create(null);

    const resolution = 0.75;
    var dimension;

    const resize = function () {
      dimension = Math.max(window.innerWidth, window.innerHeight);
      const width = window.innerWidth * resolution;
      const height = window.innerHeight * resolution;
      canvas.width = width;
      canvas.height = height;
      game.resize(width, height);
    };

    resize();

    var t0 = Date.now();
    window.setInterval(function () {
      const t1 = Date.now();
      game.tick(t0, t1, keys);
      t0 = t1;
    }, 33);

    $(canvas).on('click', function () {
      canvas.requestPointerLock();
    });

    canvas.addEventListener('mousemove', function (event) {
      game.camera.rotate(
          -(event.movementY || 0) * 2 / dimension,
          -(event.movementX || 0) * 2 / dimension);
    }, true);

    $(window).on('resize', function () {
      resize();
    }).on('keydown', function (event) {
      event.preventDefault();
      keys[event.which] = true;
    }).on('keyup', function (event) {
      event.preventDefault();
      keys[event.which] = false;
    });

    (function render() {
      game.render();
      window.requestAnimationFrame(render);
    }());

  });

});
