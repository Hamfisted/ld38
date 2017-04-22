const Actor = require('./actor');

const Ant = function(game) {
  const x = 50;
  const y = 200;

  Actor.call(this, game, x, y, 'ant');
  game.physics.arcade.enable(this);
  this.body.immovable = true;
}
Ant.prototype = Object.create(Actor.prototype);
Ant.prototype.constructor = Ant;

module.exports = Ant
