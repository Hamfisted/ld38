const Actor = require('./actor');

const SPRITE_KEY='ant';

const Ant = function(game, x, y, key=SPRITE_KEY, frame=0) {
  Actor.call(this, game, x, y, key);
  game.physics.arcade.enable(this);
  this.body.immovable = true;
}

Ant.prototype = Object.create(Actor.prototype);
Ant.prototype.constructor = Ant;

Ant.getSpriteKey = function() {
  return SPRITE_KEY;
}

module.exports = Ant
