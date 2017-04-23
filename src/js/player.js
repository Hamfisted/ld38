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

  this.animationData = {
    bob: {
      rate: 3,
      shouldLoop: true,
    },
    walk: {
      rate: 10,
      shouldLoop: true,
    },
  };

  this.direction = 'down';
  this.currentAnimation = 'bob';
  this.changeAnimation('bob');

  this.quest = null;
  this.insectParts = {
    yellow: 0,
    green: 0,
    pink: 0
  };
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
    this.changeAnimation('bob');
    return;
  }

  if (cursors.up.isDown) {
    this.direction = 'up';
    this.body.velocity.y = -MOVE_SPEED;
  } else if (cursors.down.isDown) {
    this.direction = 'down';
    this.body.velocity.y = MOVE_SPEED;
  } else {
    this.body.velocity.y = 0;
  }

  if (cursors.left.isDown) {
    this.direction = 'left';
    this.body.velocity.x = -MOVE_SPEED;
  } else if (cursors.right.isDown) {
    this.direction = 'right';
    this.body.velocity.x = MOVE_SPEED;
  } else {
    this.body.velocity.x = 0;
  }

  if (this.body.velocity.x && this.body.velocity.y) {
    this.body.velocity.x = Math.floor(this.body.velocity.x / sqrt2);
    this.body.velocity.y = Math.floor(this.body.velocity.y / sqrt2);
  }

  if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
    this.swing();
  }

  if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
    this.changeAnimation('walk');
  } else {
    this.changeAnimation('bob');
  }
};

// pretty broken
Player.prototype.changeAnimation = function(type) {
  const animData = this.animationData[type];
  const name = `player_${this.direction}_${type}`;
  if (this.animations.name === name) {
    return;
  }
  this.loadTexture(name, 0);
  this.animations.add(name);
  this.animations.play(name, animData.rate, animData.shouldLoop);
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
  if (pickup.name == 'pretzel' || pickup.name.indexOf("pretzel") >= 0) {
    this.pretzel = pickup.getMetaData();
  }

  if (pickup.type == 'weapon') {
    this.weapon = pickup.getMetaData();
  }

  if (pickup.type == 'quest') {
    this.quest = pickup.getMetaData();
  }

  if (pickup.name == 'insectPart') {
    this.insectParts[pickup.color]++;
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
  // game.time.events.add(HUNGER_GROWTH_PERIODICITY, this.buildHunger, this, game);
}

module.exports = Player
