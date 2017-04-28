const Config = require('../config');
const Actor = require('../actor');
const sounds = require('../sounds');
const InsectPart = require('../insect-part');

const behaviorRunner = require('./behavior-runner');
const genericAntBehavior = require('./generic-ant-behavior');

const SPRITE_KEY= 'ant';
const OBJECT_LAYER_NAME='Ants';
const ANT_SCREAM_PROBABILITY_A = 0.2;
const ANT_SCREAM_PROBABILITY_B = 0.1;


const Ant = function(game, x, y, imageName) {
  Actor.call(this, game, x, y, imageName || SPRITE_KEY);
  game.physics.arcade.enable(this);

  this.behavior = behaviorRunner(this, genericAntBehavior.antBehavior, genericAntBehavior.BehaviorState.WANDER);

  this.health = 2;

  this.moveTo = new Phaser.Point(100, 100);
  this.addDetectionBubble();
  this.addHurtBox();
  this.pickupGroup = null;

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
  if (this.inKnockback) {
    return;
  }

  this.behavior.update();
  if (this.body.velocity.x > 0) {
    this.scale.x = -1; // flipped
  } else if (this.body.velocity.x < 0) {
    this.scale.x = 1; // facing default direction
  }
};

Ant.prototype.damage = function (amount) {
  const isDamageSuccess = Actor.prototype.damage.call(this, amount);
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

Ant.prototype.setPickupGroup = function (pickupGroup) {
  this.pickupGroup = pickupGroup;
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

Ant.prototype.addHurtBox = function () {
  this.damageHurtBox = new Phaser.Sprite(this.game, 0, 0, null);
  this.game.physics.arcade.enable(this.damageHurtBox);
  hurtboxScale = 0.7;

  const scaledWidth = this.body.width * hurtboxScale;;
  const scaledHeight = this.body.height * hurtboxScale;
  const hurtbox = {
    x: -(scaledWidth / 2),
    y: -(scaledHeight / 2),
    w: scaledWidth,
    h: scaledHeight,
  }
  const { x, y, w, h } = hurtbox;
  this.damageHurtBox.body.setSize(w, h, x, y);
  this.addChild(this.damageHurtBox);
};

Ant.prototype.seePlayer = function (player, overlap) {
  this.seesPlayer = overlap;
  this.sawSwing = (!player.canSwing && this.seesPlayer);
  this.playerMemory = { x: player.body.center.x, y: player.body.center.y };
  if (!Config.activeEnemies || !player.alive) {
    return;
  }
};

Ant.prototype.die = function () {
  this.kill();

  const emitter = this.game.add.emitter(this.x, this.y, 15);

  emitter.makeParticles(this.spriteName);
  emitter.minParticleScale = 0.1;
  emitter.maxParticleScale = 0.5;
  emitter.gravity = 200;
  emitter.bounce.setTo(0.5, 0.5);
  emitter.angularDrag = 30;

  //  false means don't explode all the sprites at once, but instead release at a rate of 20 particles per frame
  //  The 2000 value is the lifespan of each particle
  emitter.start(false, 2000, 20);

  this.game.time.events.add(600, function () {
    emitter.destroy();
    const offsetRange = 50;

    const randomXOffset = Math.random();
    const randomYOffset = Math.random();

    const randomX = this.body.center.x - (offsetRange * ( 2 * randomXOffset - 1)) / 2;
    const randomY = this.body.center.y - (offsetRange * ( 2 * randomYOffset - 1)) / 2;

    this.pickupGroup.add(new InsectPart(this.game, randomX, randomY, this.color));
  }, this);
};

module.exports = Ant;
