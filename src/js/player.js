const Actor = require('./actor');
const SPRITE_KEY = 'player';

const HUNGER_GROWTH_PERIODICITY = 250; // millis
const OBJECT_LAYER_NAME = 'PlayerLayer';
const MOVE_SPEED = 150;
const sqrt2 = Math.sqrt(2);

const Player = function Player(game, x=0, y=0) {
  Actor.call(this, game, x, y, SPRITE_KEY);
  game.physics.arcade.enable(this);
  this.body.setSize(16, 16, 8, 16);  // w h x y

  this.pretzel = null;
  this.weapon = null;
  this.swingTimeout = 300; // ms
  this.canSwing = true;
  this.isInDialogue = false;
  game.time.events.add(HUNGER_GROWTH_PERIODICITY, this.buildHunger, this, game);
};

Player.SPRITE_KEY = SPRITE_KEY;
Player.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;

Player.prototype.updateControls = function (cursors) {
  if (this.isInDialogue) {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    return;
  }

  if (cursors.left.isDown) {
    this.frame = 3;
    this.body.velocity.x = -MOVE_SPEED;
  } else if (cursors.right.isDown) {
    this.frame = 1;
    this.body.velocity.x = MOVE_SPEED;
  } else {
    this.body.velocity.x = 0;
  }

  if (cursors.up.isDown) {
    this.frame = 0;
    this.body.velocity.y = -MOVE_SPEED;
  } else if (cursors.down.isDown) {
    this.frame = 2;
    this.body.velocity.y = MOVE_SPEED;
  } else {
    this.body.velocity.y = 0;
  }

  if (this.body.velocity.x && this.body.velocity.y) {
    this.body.velocity.x = Math.floor(this.body.velocity.x / sqrt2);
    this.body.velocity.y = Math.floor(this.body.velocity.y / sqrt2);
  }

  if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
    this.swing();
  }
};

Player.prototype.swing = function () {
  if (!this.weapon || !this.canSwing) {
    return;
  }
  console.log('swing');

  this.canSwing = false;
  this.game.time.events.add(this.swingTimeout, function() {
    this.canSwing = true;
  }, this);
};

Player.prototype.pickupItem = function(pickup) {
  if (pickup.name == 'pretzel') {
    this.pretzel = pickup.getMetaData();
  }
  if (pickup.type == 'weapon') {
    this.weapon = pickup.getMetaData();
  }
}
Player.prototype.useItem = function(pickup) {
  if (pickup.name == 'pretzel') {
    this.pretzel = null;
  }
  if (pickup.name == 'weapon') {
    this.weapon = null;
  }
}

Player.prototype.buildHunger = function (game) {
  this.fullness--;
  if (this.fullness <= 0) {
    this.health = 0;
  }
  game.time.events.add(HUNGER_GROWTH_PERIODICITY, this.buildHunger, this, game);
}

module.exports = Player
