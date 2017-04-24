const soundEmitter = new (require('events').EventEmitter);

const soundFiles = {
  'mainloop': 'assets/sounds/mainloop.ogg',
  'fightloop': 'assets/sounds/fightloop.ogg',
  'player_hit': 'assets/sounds/Hit_Hurt44.wav',
  'whoosh': 'assets/sounds/whoosh.wav',
  'hit_enemy': 'assets/sounds/hit_enemy.wav',
  'ant_scream_a': 'assets/sounds/ant_scream_a.wav',
  'ant_scream_b': 'assets/sounds/ant_scream_b.wav',
  'pickup_bug_part': 'assets/sounds/pickup_bug_part.wav',
  'pickup_pretzel': 'assets/sounds/pickup_pretzel.wav',
  'chew': 'assets/sounds/chew.wav',
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
      soundEmitter.on('stop', function (name) {
        sounds[name].stop();
      });
    }
  };
}

module.exports = {
  load: load,
  play: function(name, volume, loop) {
    soundEmitter.emit("play", name, volume, loop);
  },
  stop: function(name, volume, loop) {
    soundEmitter.emit("stop", name);
  },
  isPlaying: function(name) {
    return sounds[name].isPlaying;
  },
  list: Object.keys(soundFiles)
};
