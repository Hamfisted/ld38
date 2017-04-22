// pickup.js
const Pickup = function(game, x, y, imageName) {
  this.is_picked_up = false
  Phaser.Sprite.call(this, game, x, y, imageName);
  game.physics.arcade.enable(this);
}
Pickup.prototype = Object.create(Phaser.Sprite.prototype);
Pickup.prototype.constructor = Pickup;

module.exports = Pickup
