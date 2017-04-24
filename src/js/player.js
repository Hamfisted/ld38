const Actor = require('./actor');
const sounds = require('./sounds');
const SPRITE_KEY = 'player';

const HUNGER_GROWTH_PERIODICITY = 250; // millis
const OBJECT_LAYER_NAME = 'PlayerLayer';
const MOVE_SPEED = 150;
const sqrt2 = Math.sqrt(2);

const Player = function Player(game, x=0, y=0) {
  Actor.call(this, game, x, y, SPRITE_KEY);
  this.body.setSize(16, 16, 8, 16);  // w h x y

  this.attackHitboxWidth = 26;
  this.attackHitboxDepth = 28;
  this.attackHitbox = new Phaser.Sprite(game, 0, 0, null);
  game.physics.arcade.enable(this.attackHitbox);
  this.attackHitbox.body.enable = false;
  this.addChild(this.attackHitbox);

  this.animationData = {
    bob: {
      rate: 3,
      shouldLoop: true,
      isDirectional: true,
    },
    walk: {
      rate: 10,
      shouldLoop: true,
      isDirectional: true,
    },
    attack: {
      rate: 18,
      shouldLoop: false,
      frames: [1, 2, 3, 4], // skip the first one
      isDirectional: true,
    },
    hurt: {
      rate: 7,
      shouldLoop: false,
      frames: [1, 2],
      isDirectional: true,
    },
    death: {
      rate: 3,
      shouldLoop: true,
      isDirectional: false,
    },
  };

  this.direction = 'down';
  this.currentAnimation = 'bob';
  this.changeAnimation('bob');

  this.quest = null;
  this.insectParts = {
    yellow: 7,
    green: 0,
    pink: 0
  };
  this.pretzel = null;
  this.weapon = null;

  this.swingTimeout = 360; // ms
  this.swingTimer = this.game.time.create(false);
  this.swingTimer.start();
  this.canSwing = true;
  this.isInDialogue = false;
  game.time.events.add(HUNGER_GROWTH_PERIODICITY, this.buildHunger, this, game);

  this.hitStunTimeout = 500;
  this.knockbackTimeout = 200;
};

Player.SPRITE_KEY = SPRITE_KEY;
Player.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;

Player.prototype.updateControls = function (keys) {

  if (this.isInDialogue || this.swingTimer.length || !this.alive) {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  } else if (this.inKnockback) {
    // do nothing, maintain knockback velocity
  } else if (keys.interact.isDown && this.weapon && this.canSwing) {
    this.swing();
  } else {

    if (keys.item.isDown && this.pretzel) {
      this.health = this.health + this.pretzel.hp;
      this.useItem(this.pretzel);
    }

    if (keys.up.isDown) {
      this.direction = 'up';
      this.body.velocity.y = -MOVE_SPEED;
    } else if (keys.down.isDown) {
      this.direction = 'down';
      this.body.velocity.y = MOVE_SPEED;
    } else {
      this.body.velocity.y = 0;
    }

    if (keys.left.isDown) {
      this.direction = 'left';
      this.body.velocity.x = -MOVE_SPEED;
    } else if (keys.right.isDown) {
      this.direction = 'right';
      this.body.velocity.x = MOVE_SPEED;
    } else {
      this.body.velocity.x = 0;
    }

    if (this.body.velocity.x && this.body.velocity.y) {
      this.body.velocity.x = Math.floor(this.body.velocity.x / sqrt2);
      this.body.velocity.y = Math.floor(this.body.velocity.y / sqrt2);
    }
  }


  if (!this.alive) {
    // continue playing animation
    this.die();
  } else if (this.swingTimer.length) {
    // continue playing animation
  } else if (this.inHitStun) {
    this.changeAnimation('hurt');
  } else if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
    this.changeAnimation('walk');
  } else {
    this.changeAnimation('bob');
  }
};

Player.prototype.changeAnimation = function(type) {
  const animData = this.animationData[type];
  const name = animData.isDirectional ? `player_${this.direction}_${type}` : `player_${type}`;
  // idk man
  if (this.animations.name === name && type !== 'attack') {
    return;
  }
  this.loadTexture(name, 0);
  this.animations.add(name, animData.frames || null);
  this.animations.play(name, animData.rate, animData.shouldLoop);
};

Player.prototype.swing = function () {
  sounds.play('whoosh', 0.5);
  this.changeAnimation('attack');

  // calculate attack hitbox
  let w = this.attackHitboxDepth;
  let h = this.attackHitboxWidth;
  let offsetX = -this.body.width / 2;
  let offsetY = -this.attackHitboxWidth / 2;
  if (this.direction === 'left') {
    offsetX = (this.body.width / 2) - w;
  } else if (this.direction === 'up') {
    w = this.attackHitboxWidth;
    h = this.attackHitboxDepth;
    offsetX = -this.attackHitboxWidth / 2;
    offsetY = this.body.height - this.attackHitboxDepth;
  } else if (this.direction === 'down') {
    w = this.attackHitboxWidth;
    h = this.attackHitboxDepth;
    offsetX = -this.attackHitboxWidth / 2;
    offsetY = -this.body.height / 2;
  }
  this.attackHitbox.body.setSize(w, h, offsetX, offsetY);

  this.canSwing = false;
  this.swingTimer.add(this.swingTimeout, function() {
    this.canSwing = true;
    this.attackHitbox.body.enable = false;
  }, this);
  // a hack to fix the delayed hitbox position jumping
  this.swingTimer.add(1, function() {
    this.attackHitbox.body.enable = true;
  }, this);
};

Player.prototype.die = function () {
  this.alive = false;
  this.health = 0;
  this.changeAnimation('death');
  if (this.onDieCallback) {
    this.onDieCallback();
    this.onDieCallback = null;
  }
};

Player.prototype.isSwinging = function () {
  return !!this.swingTimer.length;
};

Player.prototype.hitEnemy = function (enemy) {
  if (enemy.inHitStun) {
    return false;
  }

  const enemyVec = [enemy.x - this.x, enemy.y - this.y];
  const facingVec = this.facingUnitVector();
  facingVec[0] *= 70;
  facingVec[1] *= 70;

  const angle = Math.atan2(facingVec[1] + enemyVec[1], facingVec[0] + enemyVec[0]);
  enemy.knockback(angle);
  enemy.damage(1);
};

Player.prototype.facingUnitVector = function() {
  if (this.direction === 'up') {
    return [0, -1];
  } else if (this.direction === 'down') {
    return [0, 1];
  } else if (this.direction === 'left') {
    return [-1, 0];
  } else {
    return [1, 0];
  }
};

Player.prototype.pickupItem = function(pickup) {
  if ((pickup.name == 'pretzel' || pickup.name.indexOf("pretzel") >= 0) && !this.pretzel) {
    this.pretzel = pickup.getMetaData();
    sounds.play('pickup_pretzel', 0.1);
    return true;
  }

  if (pickup.type == 'weapon') {
    this.weapon = pickup.getMetaData();
    return true;
  }

  if (pickup.type === 'quest' && !this.quest) {
    this.quest = pickup.getMetaData();
    return true;
  }

  if (pickup.name == 'insectPart') {
    this.insectParts[pickup.color]++;
    sounds.play('pickup_bug_part', 0.2);
    return true;
  }

  return false;
}
Player.prototype.useItem = function(pickup) {
  if (pickup.name == 'pretzel' || pickup.name.indexOf("pretzel") >= 0) {
    sounds.play('chew', 0.6);
    this.pretzel = null;
  }
}

Player.prototype.buildHunger = function (game) {
  this.fullness--;
  if (this.fullness <= 0) {
    this.health = 0;
  }
  // game.time.events.add(HUNGER_GROWTH_PERIODICITY, this.buildHunger, this, game);
}

Player.prototype.onDie = function(callback) {
  this.onDieCallback = callback;
};

module.exports = Player
