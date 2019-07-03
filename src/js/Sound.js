Quake2.Sound = function () {};

Quake2.Sound.Pool = function (sound) {
  sound.addEventListener('ended', Quake2.Sound.Pool._resetSound);
  this._sounds = [sound];
};

Quake2.Sound.Pool._resetSound = function (event) {
  event.target.currentTime = 0;
};

Quake2.Sound.Pool.prototype.play = function () {
  for (var i = 0; i < this._sounds.length; i++) {
    if (!this._sounds[i].currentTime) {
      this._sounds[i].play();
      return;
    }
  }
  this._sounds.push(this._sounds[0].cloneNode(false));
  this._sounds[this._sounds.length - 1].play();
};

Quake2.Sound._sounds = Object.create(null);

Quake2.Sound.initialize = function (sounds) {
  for (var key in sounds) {
    Quake2.Sound._sounds[key] = new Quake2.Sound.Pool(sounds[key]);
  }
};

Quake2.Sound.play = function (name) {
  if (name in Quake2.Sound._sounds) {
    Quake2.Sound._sounds[name].play();
  }
};

Quake2.Sound.playWeapon = function (name) {
  this.play('weapons/' + name);
};
