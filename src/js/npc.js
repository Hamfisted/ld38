const Actor = require('./actor');

const Npc = function(game) {
  const x = 200;
  const y = 200;

  Actor.call(this, game, x, y, 'npc');
  game.physics.arcade.enable(this);
  this.body.immovable = true;
}
Npc.prototype = Object.create(Actor.prototype);
Npc.prototype.constructor = Npc;

module.exports = Npc
