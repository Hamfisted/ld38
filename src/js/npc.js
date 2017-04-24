const Actor = require('./actor');
const SPRITE_KEY = 'old_guy';
const OBJECT_LAYER_NAME = 'Npcs';

const Npc = function(game, x, y) {
  Actor.call(this, game, x, y, SPRITE_KEY);
  game.physics.arcade.enable(this);
  this.body.immovable = true;
  this.bob();
}

Npc.prototype = Object.create(Actor.prototype);
Npc.prototype.constructor = Npc;
Npc.SPRITE_KEY = SPRITE_KEY;
Npc.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;

Npc.prototype.bob = function(){
  this.loadTexture('old_guy_idle', 0);
  this.animations.add('old_guy_idle');
  this.animations.play('old_guy_idle', 3, true);
}
module.exports = Npc
