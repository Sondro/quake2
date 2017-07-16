$(function () {
  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');

  const dimension = Math.max(canvas.width, canvas.height);

  const loader = new Quake2.Loader();

  loader.loadMap('base1').then(function (assets) {
    const game = new Quake2.Game(gl, assets);

    const keys = Object.create(null);

    var t0 = Date.now();

    window.setInterval(function () {
      const t1 = Date.now();
      game.tick(t0, t1, keys);
      t0 = t1;
    }, 33);

    var active = false;
    var x0, y0;

    $(canvas).on('click', function () {
      canvas.requestPointerLock();
    }).on('mousemove', function (event) {
      const x1 = event.clientX;
      const y1 = event.clientY;
      if (!active) {
        active = true;
        x0 = x1;
        y0 = y1;
      }
      game.camera.rotate((y0 - y1) * 2 / dimension, (x0 - x1) * 2 / dimension);
      x0 = x1;
      y0 = y1;
    });

    $(window).on('keydown', function (event) {
      keys[event.which] = true;
    }).on('keyup', function (event) {
      keys[event.which] = false;
    });

    (function render() {
      game.render();
      window.requestAnimationFrame(render);
    }());

  });

});
