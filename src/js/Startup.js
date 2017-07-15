$(function () {
  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');

  const loader = new Quake2.Loader();

  loader.loadMap('base1').then(function (assets) {
    const bsp = new Quake2.BSP(gl, assets.data);

    // TODO

  });

});
