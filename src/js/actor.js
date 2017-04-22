const knockbackForce = 1000;
const Actor = function(game, x, y, image) {
  Phaser.Sprite.call(this, game, x, y, image);
  game.physics.arcade.enable(this);
  this.anchor.x = 0.5;
  this.anchor.y = 0.5;
  this.body.drag.x = 1000;
  this.body.drag.y = 1000;

  this.knockbackForce = 0;
  this.knockbackVelocity = new Phaser.Point();
  this.invincible = false;
}
Actor.prototype = Object.create(Phaser.Sprite.prototype);
Actor.prototype.constructor = Actor;

Actor.prototype.update = function () {
  if (this.knockbackForce !== 0) {
    this.body.velocity.x = this.knockbackVelocity.x;
    this.body.velocity.y = this.knockbackVelocity.y;
  }
}

Actor.prototype.damage = function (amount) {
  if (!this.invincible) {
    this.invincible = true;
    this.health -= amount;
    this.game.time.events.add(30, this.stopInvincibility, this);
  }
}

Actor.prototype.knockback = function (angle) {
  this.knockbackForce = knockbackForce;
  this.knockbackVelocity.x = Math.cos(angle) * knockbackForce;
  this.knockbackVelocity.y = Math.sin(angle) * knockbackForce;
  this.game.time.events.add(30, this.stopKnockback, this);
};

Actor.prototype.stopKnockback = function () {
  this.knockbackForce = 0;
}

Actor.prototype.stopInvincibility = function () {
  this.invincible = false;
}

module.exports = Actor;
