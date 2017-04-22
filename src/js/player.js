const Actor = require('./actor');

const MOVE_SPEED = 150;
const Player = function(game) {
  const x = 100;
  const y = 100;

  Actor.call(this, game, x, y, 'player');
  game.physics.arcade.enable(this);
  this.pretzel = null
  this.weapon = null
}
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

module.exports = Player
