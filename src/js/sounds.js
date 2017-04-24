const soundEmitter = new (require('events').EventEmitter);

const soundFiles = {
  'ludumdare38loopable': 'assets/sounds/ludumdare38loopable.m4a'
};

function load(game) {
  Object
    .entries(soundFiles)
    .map(([sound, file]) => game.load.audio(sound, file));



  return {
    init: function(game) {
      sounds = Object.keys(soundFiles)
        .reduce((acc, sound) => {
          acc[sound] = game.add.audio(sound)
          return acc;
        }, {});

      soundEmitter.on("play", function(name, volume, loop) {
        sounds[name].play(null, null, volume, loop);
      });
    }
  }
}


module.exports = {
  load: load,
  play: function(name, volume, loop) {
    soundEmitter.emit("play", name, volume, loop);
  },
  list: Object.keys(soundFiles)
}
