const Actor = require('./actor');
const SPRITE_KEY = 'player';
<<<<<<< HEAD
<<<<<<< HEAD
const HUNGER_GROWTH_PERIODICITY = 250; // millis

const MOVE_SPEED = 150;
const sqrt2 = Math.sqrt(2);

const Player = function(game, x=0, y=0, key=SPRITE_KEY, frame=0) {
  Actor.call(this, game, x, y, key);
  this.fullness = 100;

=======
const MOVE_SPEED = 150;
const sqrt2 = Math.sqrt(2);

const Player = function(game, x=0, y=0, key=SPRITE_KEY, frame=0) {
  Actor.call(this, game, x, y, key);
>>>>>>> 3f6ff6c... Spawning npcs
=======
const OBJECT_LAYER_NAME = 'PlayerLayer';
const MOVE_SPEED = 150;
const sqrt2 = Math.sqrt(2);

const Player = function(game, x=0, y=0) {
  Actor.call(this, game, x, y, SPRITE_KEY);
>>>>>>> b65c7ca... Better spawn
  game.physics.arcade.enable(this);
  this.pretzel = null
  this.weapon = null
  game.time.events.add(HUNGER_GROWTH_PERIODICITY, this.buildHunger, this, game);
}
<<<<<<< HEAD
Player.getSpriteKey = function() {
  return SPRITE_KEY;
}
<<<<<<< HEAD

=======
Player.getSpriteKey = function() {
  return SPRITE_KEY;
}
>>>>>>> 3f6ff6c... Spawning npcs
=======

Player.SPRITE_KEY = SPRITE_KEY;
Player.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;
>>>>>>> b65c7ca... Better spawn
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;

Player.prototype.updateControls = function (cursors) {
  if (cursors.left.isDown) {
    this.body.velocity.x = -MOVE_SPEED;
  }
  else if (cursors.right.isDown) {
    this.body.velocity.x = MOVE_SPEED;
  }
  else {
    this.body.velocity.x = 0;
  }
  if (cursors.up.isDown) {
    this.body.velocity.y = -MOVE_SPEED;
  }
  else if (cursors.down.isDown) {
    this.body.velocity.y = MOVE_SPEED;
  }
  else {
    this.body.velocity.y = 0;
  }

  if (this.body.velocity.x && this.body.velocity.y) {
    this.body.velocity.x = Math.floor(this.body.velocity.x / sqrt2);
    this.body.velocity.y = Math.floor(this.body.velocity.y / sqrt2);
  }
};

Player.prototype.pickupItem = function(pickup) {
  if (pickup.name == 'pretzel') {
    this.pretzel = pickup.getMetaData();
  }
  if (pickup.name == 'weapon') {
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
