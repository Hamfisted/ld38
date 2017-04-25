const Actor = require('./actor');
const OBJECT_LAYER_NAME = 'Npcs';

const Npc = function(game, x, y, name) {
  Actor.call(this, game, x, y, name);
  this.name = name;
  this.body.immovable = true;
  this.body.setSize(16, 16, 8, 16);  // w h x y
  this.bob();
  this.state = 0;
};

Npc.prototype = Object.create(Actor.prototype);
Npc.prototype.constructor = Npc;
Npc.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;

Npc.prototype.bob = function() {
  if (this.name === 'old_guy') {
    this.loadTexture('old_guy_idle', 0);
    this.animations.add('old_guy_idle');
    this.animations.play('old_guy_idle', 3, true);
  } else if (this.name === 'mouse_man') {
    this.loadTexture('mouse_man_idle', 0);
    this.animations.add('mouse_man_idle');
    this.animations.play('mouse_man_idle', 3, true);
  }
};

module.exports = Npc;
