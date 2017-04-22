const Actor = require('./actor');
const SPRITE_KEY = 'npc';
const Npc = function(game, x, y, key=SPRITE_KEY, frame=0) {
  Actor.call(this, game, x, y, key);
  game.physics.arcade.enable(this);
  this.body.immovable = true;
}
Npc.prototype = Object.create(Actor.prototype);
Npc.prototype.constructor = Npc;
Npc.getSpriteKey = function() {
  return SPRITE_KEY;
}
module.exports = Npc
