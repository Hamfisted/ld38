// player.js
const Actor = require('./actor');

const MOVE_SPEED = 150;
const Player = function(game) {
  const x = 100;
  const y = 100;

  Actor.call(this, game, x, y, 'player');
  game.physics.arcade.enable(this);
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
module.exports = Player
