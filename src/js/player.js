const Actor = require('./actor');

const MOVE_SPEED = 150;

const HUNGER_INCREASE_RATE = 200; // millis
// How many hunger before death.
const STARVING_TO_DEATH = 8;

const Player = function(game) {
  const x = 100;
  const y = 100;

  // Used to track hunger. Half sandwhich to represent one level.
  this.hungerLevel = 0;

  this.hungerTimer = game.time.create(false);
  this.hungerTimer.add(
    HUNGER_INCREASE_RATE, // delay
    this.hungerCallback, // callback
    this, // callbackContext
    null // arguments
  );
  this.hungerTimer.start();
  console.log(this.hungerTimer);

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

Player.prototype.eatAFood = function (a_food) {
  this.hungerTimer.clearPendingEvents();
  this.hungerLevel -= a_food.calories;
  if (this.hungerLevel < 0) {
    this.hungerLevel = 0;
  }
  this.hungerTimer.add(
    HUNGER_INCREASE_RATE, // delay
    this.hungerCallback, // callback
    this, // callbackContext
    null // arguments
  );
}

Player.prototype.getCurrentHungerLevel = function () {
  return this.hungerLevel;
}

Player.prototype.getMaxHungerLevel = function () {
  return STARVING_TO_DEATH;
}

Player.prototype.hungerCallback = function () {
  console.log("I LOGGED IT CALLED>>> BACK");
  this.hungerTimer.clearPendingEvents();
  this.hungerLevel++;
  if (this.hungerLevel >= STARVING_TO_DEATH) {
    console.log("OH NOOOOO YOU STARVED TO DEATH :(((");
  } else {
    console.log("ooooo so hungry...");
    this.hungerTimer.add(
      HUNGER_INCREASE_RATE, // delay
      this.hungerCallback, // callback
      this, // callbackContext
      null // arguments
    );
  }
}

module.exports = Player
