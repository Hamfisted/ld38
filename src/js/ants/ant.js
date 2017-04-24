const Config = require('../config');
const Actor = require('../actor');
const sounds = require('../sounds');

const SPRITE_KEY='ant';
const OBJECT_LAYER_NAME='Ants';
const ANT_SCREAM_PROBABILITY_A = 0.2;
const ANT_SCREAM_PROBABILITY_B = 0.1;

const BehaviorState = {
  WANDER: 1,
  ATTACK: 2,
  WAIT: 3,
};

const Ant = function(game, x, y, imageName) {
  Actor.call(this, game, x, y, imageName || SPRITE_KEY);
  game.physics.arcade.enable(this);

  this.health = 2;

  this.moveTo = new Phaser.Point(100, 100);
  this.addDetectionBubble();
  this.setState(BehaviorState.WANDER);

  this.animations.add('walk');
  const rate = 10;
  const shouldLoop = true;
  this.animations.play('walk', rate, shouldLoop);
};

Ant.prototype = Object.create(Actor.prototype);
Ant.prototype.constructor = Ant;
Ant.SPRITE_KEY = SPRITE_KEY;
Ant.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;

Ant.prototype.update = function () {
  Actor.prototype.update.call(this);
  if (!Config.activeEnemies) {
    return;
  }
  if (this.inHitStun) {
    return;
  }

  if (this.state === BehaviorState.WANDER) {
    var distance = this.moveTowards(this.moveTo, this.wanderSpeed);
    if (distance < 20) {
      this.setState(BehaviorState.WAIT);
    }
  }
  else if (this.state === BehaviorState.ATTACK) {
    this.moveTowards(this.moveTo, this.attackSpeed);
  }
  else if (this.state === BehaviorState.WAIT) {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }

  // face the horizontal direction it is moving in
  if (this.body.velocity.x > 0) {
    this.scale.x = -1; // flipped
  } else if (this.body.velocity.x < 0) {
    this.scale.x = 1; // facing default direction
  }
};

Ant.prototype.damage = function () {
  const isDamageSuccess = Actor.prototype.damage.call(this);
  if(isDamageSuccess) { 
    sounds.play('hit_enemy'); 
    if (Math.random() <= ANT_SCREAM_PROBABILITY_A) {
      sounds.play('ant_scream_a');
    }
    else if (Math.random() <= ANT_SCREAM_PROBABILITY_B) {
      sounds.play('ant_scream_b');
    }
  }
}

Ant.prototype.setState = function (state) {
  this.game.time.events.remove(this.event);
  this.state = state;
  if (this.state === BehaviorState.WAIT) {
    this.event = this.game.time.events.add(1000, this.wander, this);
  }
  if (this.state === BehaviorState.WANDER) {
    this.event = this.game.time.events.add(3000, this.giveUp, this);
  }
};

Ant.prototype.wander = function () {
  this.setState(BehaviorState.WANDER);
  var heading = this.game.rnd.realInRange(0, Phaser.Math.PI2);
  var distance = this.game.rnd.integerInRange(1, 3) * 75;
  this.moveTo.x = this.body.x + Math.cos(heading) * distance;
  this.moveTo.y = this.body.y + Math.sin(heading) * distance;
};

Ant.prototype.addDetectionBubble = function () {
  // can't ever give this an image, because phaser is friggin zany
  // http://www.html5gamedevs.com/topic/25475-spritebody-bounding-box-ignores-sprite-anchorsetto/
  const RADIUS = 64;
  this.detectionBubble = new Phaser.Sprite(this.game, 0, 0, null);
  this.game.physics.arcade.enable(this.detectionBubble);
  this.detectionBubble.body.setCircle(RADIUS, -RADIUS, -RADIUS);
  this.addChild(this.detectionBubble);
};

Ant.prototype.giveUp = function () {
  // callback as a failsafe to give up moving towards a goal
  console.log("give up");
  this.setState(BehaviorState.WAIT);
};

Ant.prototype.seePlayer = function (player) {
  this.moveTo.x = player.x;
  this.moveTo.y = player.y;
  this.setState(BehaviorState.ATTACK);
  this.event = this.game.time.events.add(3000, this.giveUp, this);
};

module.exports = Ant;
