Quake2.Sound = function () {};

Quake2.Sound._sounds = Object.create(null);

Quake2.Sound.initialize = function (sounds) {
  Quake2.Sound._sounds = sounds;
};

Quake2.Sound.play = function (name) {
  if (name in Quake2.Sound._sounds) {
    Quake2.Sound._sounds[name].play();
  }
};

Quake2.Sound.playWeapon = function (name) {
  this.play('weapons/' + name);
};
