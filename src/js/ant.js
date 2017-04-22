const Actor = require('./actor');

const SPRITE_KEY='ant';
const OBJECT_LAYER_NAME='Ants';

const Ant = function(game, x, y) {
  Actor.call(this, game, x, y, SPRITE_KEY);
  game.physics.arcade.enable(this);
  this.body.immovable = true;
}

Ant.prototype = Object.create(Actor.prototype);
Ant.prototype.constructor = Ant;
Ant.SPRITE_KEY = SPRITE_KEY;
Ant.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;

module.exports = Ant
