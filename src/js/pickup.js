// pickup.js
const Pickup = function(game, x, y, imageName) {
  this.is_picked_up = false
  Phaser.Sprite.call(this, game, x, y, imageName);
  game.physics.arcade.enable(this);

  this.originalX = x;
  this.originalY = y;
}


Pickup.prototype = Object.create(Phaser.Sprite.prototype);
Pickup.prototype.constructor = Pickup;

Pickup.prototype.update = function () {
  Phaser.Sprite.prototype.update.call(this);

  const seconds = new Date().getTime() / 1000;
  const movementsPerSecond = 10;
  const height = 8;

  this.body.y = this.originalY + Math.sin(seconds * movementsPerSecond) * (height / (2 * Math.PI));
};

module.exports = Pickup
