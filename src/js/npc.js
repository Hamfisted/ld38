const Actor = require('./actor');
const SPRITE_KEY = 'old_guy';
const OBJECT_LAYER_NAME = 'Npcs';

const Npc = function(game, x, y) {
  Actor.call(this, game, x, y, SPRITE_KEY);
  game.physics.arcade.enable(this);
  this.body.immovable = true;
}

Npc.prototype = Object.create(Actor.prototype);
Npc.prototype.constructor = Npc;
Npc.SPRITE_KEY = SPRITE_KEY;
Npc.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;

module.exports = Npc
