const DISTANCE_CLOSE_ENOUGH = 5;
const Actor = function(game, x, y, image, objectLayerName) {
  Phaser.Sprite.call(this, game, x, y, image);
  game.physics.arcade.enable(this);
  this.anchor.x = 0.5;
  this.anchor.y = 0.5;

  this.knockbackVelocity = new Phaser.Point();
  this.inHitStun = false;
  this.hitStunTimeout = 360;
  this.inKnockback = false;
  this.knockbackTimeout = 500;
};
Actor.prototype = Object.create(Phaser.Sprite.prototype);
Actor.prototype.constructor = Actor;

Actor.prototype.damage = function (amount) {
  if (this.inHitStun) {
    return false;
  }

  this.inHitStun = true;
  this.health -= amount;
  this.game.time.events.add(this.hitStunTimeout, this.stopHitStun, this);
  if (this.health <= 0) {
    console.log('actor dead');
    this.kill();
  }

  return true;
};

Actor.prototype.moveTowards = function (point, speed) {
  var distance = this.body.position.distance(point);
  if(distance < DISTANCE_CLOSE_ENOUGH) {
    this.body.x = point.x;
    this.body.y = point.y;
  }
  else {
    var unitVelocity = new Phaser.Point(
      (point.x - this.body.x) / distance,
      (point.y - this.body.y) / distance
    );
    this.body.velocity.x = unitVelocity.x * speed;
    this.body.velocity.y = unitVelocity.y * speed;
  }
  return distance;
}

Actor.prototype.knockback = function (angle, force = 300) {
  if (this.inKnockback) {
    return;
  }
  this.body.drag.x = 1200;
  this.body.drag.y = 1200;
  this.inKnockback = true;
  this.body.velocity.x = Math.cos(angle) * force;
  this.body.velocity.y = Math.sin(angle) * force;
  this.game.time.events.add(this.knockbackTimeout, this.stopKnockback, this);
};

Actor.prototype.stopKnockback = function () {
  this.inKnockback = false;
}

Actor.prototype.stopHitStun = function () {
  this.inHitStun = false;
};

module.exports = Actor;
