(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
// weapon.js
const Pickup = require('./pickup');

const Weapon = function(game, x, y, name) {
  Pickup.call(this, game, x, y, name);
  this.type = 'weapon';
  this.name = name;
}
Weapon.prototype = Object.create(Pickup.prototype);
Weapon.prototype.constructor = Weapon

Weapon.prototype.getMetaData = function() {
  return {name: this.name}
}
module.exports = Weapon


},{"./pickup":33}],3:[function(require,module,exports){
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
    this.die();
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

},{}],4:[function(require,module,exports){
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
  this.backwards = false;

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
  if ((!this.backwards && this.body.velocity.x > 0) || (this.backwards && this.body.velocity.x < 0)) {
    this.scale.x = -1; // flipped
  } else if ((!this.backwards && this.body.velocity.x < 0) || (this.backwards && this.body.velocity.x > 0)) {
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

},{"../actor":3,"../config":12,"../insect-part":17,"../sounds":40,"./behavior-runner":5,"./generic-ant-behavior":6}],5:[function(require,module,exports){
function behaviorRunner(ant, behaviorArray, startingBehavior) {
  const prevBehavior = startingBehavior;

  const getState = (s) => behaviorArray.filter((b) => b.state === s)[0];



  let currentBehavior = getState(startingBehavior);

  let start = true;

  return {
    update() {
      const transitionBehavior = getState(currentBehavior.to(ant) || currentBehavior.state);


      if (start || (transitionBehavior.state !== currentBehavior.state)) {
        ant.game.time.events.remove(ant.event);
        transitionBehavior.start(ant);
      }
      start = false;
      currentBehavior = transitionBehavior;
      transitionBehavior.update(ant);
    }
  }
}

module.exports = behaviorRunner;

},{}],6:[function(require,module,exports){
const BehaviorState = {
  WANDER: 1,
  ATTACK: 2,
  WAIT: 3,
  ANGRY_RUNNING: 4,
};

const antBehavior = [
  {
    state: BehaviorState.WANDER,
    start: function(ant) {
      ant.bored = false;
      ant.event = ant.game.time.events.add(3000, function () {
        ant.giveUp = true;
      }, ant);

      var heading = ant.game.rnd.realInRange(0, Phaser.Math.PI2);
      var distance = ant.game.rnd.integerInRange(1, 3) * 75;
      ant.moveTo.x = ant.body.x + Math.cos(heading) * distance;
      ant.moveTo.y = ant.body.y + Math.sin(heading) * distance;
    },
    to: function(ant) {
      if(ant.seesPlayer) { return BehaviorState.ATTACK; }
      if(ant.giveUp) { return BehaviorState.WAIT; }
      if(ant.moveTowards(ant.moveTo, ant.wanderSpeed) < 20) { return BehaviorState.WAIT; }
    },
    update: function (ant) {
      ant.moveTowards(ant.moveTo, ant.wanderSpeed);
    }
  },
  {
    state: BehaviorState.ATTACK,
    start: function(ant) {
    },
    to: function (ant) {
      if (!ant.seesPlayer) { return BehaviorState.ANGRY_RUNNING; }
    },
    update: function (ant, player) {
      if (ant.seesPlayer){
        ant.moveTo.x = ant.playerMemory.x - ant.body.width / 2;
        ant.moveTo.y = ant.playerMemory.y - ant.body.height / 2;
      }
      ant.moveTowards(ant.moveTo, ant.attackSpeed);
    }
  },
  {
    state: BehaviorState.ANGRY_RUNNING,
    start: function(ant) {
      ant.event = ant.game.time.events.add(3000, function() {
        ant.giveUp = true;;
      }, ant);
    },
    to: function (ant) {
      if(ant.seesPlayer) { return BehaviorState.ATTACK; }
      if(ant.giveUp) { return BehaviorState.WAIT; }
    },
    update: function (ant) {
      ant.moveTowards(ant.moveTo, ant.attackSpeed);
    }
  },
  {
    state: BehaviorState.WAIT,
    start: function(ant) {
      ant.giveUp = false;
      ant.event = ant.game.time.events.add(1000, function() {
        ant.bored = true;
      }, ant);
    },
    to: function (ant) {
      if(ant.seesPlayer) { return BehaviorState.ATTACK; }
      if(ant.bored) { return BehaviorState.WANDER; }
    },
    update: function (ant) {
      ant.body.velocity.x = 0;
      ant.body.velocity.y = 0;
    }
  }
];

module.exports = {
  BehaviorState,
  antBehavior
};

},{}],7:[function(require,module,exports){
const Ant = require('./ant');

const OBJECT_LAYER_NAME = 'GreenAnts';

const GreenAnt = function(game, x, y) {
  this.color = 'green';
  this.spriteName = 'ant_green_walk';
  this.sprite = Ant.call(this, game, x, y, this.spriteName);
  this.attackSpeed = 80;
  this.wanderSpeed = 30;
  this.health = 3;
  this.damageAmount = 1;
};

GreenAnt.prototype = Object.create(Ant.prototype);
GreenAnt.prototype.constructor = GreenAnt;
GreenAnt.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;


module.exports = GreenAnt;

},{"./ant":4}],8:[function(require,module,exports){
const BehaviorState = {
  WANDER: 1,
  ATTACK: 2,
  WAIT: 3,
  ANGRY_RUNNING: 4,
  BACKOFF: 5,
  SWOOP: 6,
};

const backoffSpeed = 100;
const swoopSpeed = 300;

const antBehavior = [
  {
    state: BehaviorState.WANDER,
    start: function(ant) {
      ant.bored = false;
      ant.event = ant.game.time.events.add(3000, function () {
        ant.giveUp = true;
      }, ant);

      var heading = ant.game.rnd.realInRange(0, Phaser.Math.PI2);
      var distance = ant.game.rnd.integerInRange(1, 3) * 75;
      ant.moveTo.x = ant.body.x + Math.cos(heading) * distance;
      ant.moveTo.y = ant.body.y + Math.sin(heading) * distance;
    },
    to: function(ant) {
      if(ant.seesPlayer) { return BehaviorState.ATTACK; }
      if(ant.giveUp) { return BehaviorState.WAIT; }
      if(ant.moveTowards(ant.moveTo, ant.wanderSpeed) < 20) { return BehaviorState.WAIT; }
    },
    update: function (ant) {
      ant.moveTowards(ant.moveTo, ant.wanderSpeed);
    }
  },
  {
    state: BehaviorState.ATTACK,
    start: function(ant) {
      ant.done = false
    },
    to: function (ant) {
      if (!ant.seesPlayer) { return BehaviorState.ANGRY_RUNNING; }
      if (ant.sawSwing) { return BehaviorState.BACKOFF; }
    },
    update: function (ant, player) {
      if (ant.seesPlayer){
        ant.moveTo.x = ant.playerMemory.x - ant.body.width / 2;
        ant.moveTo.y = ant.playerMemory.y - ant.body.height / 2;
      }
      ant.moveTowards(ant.moveTo, ant.attackSpeed);
    }
  },
  {
    state: BehaviorState.ANGRY_RUNNING,
    start: function(ant) {
      ant.event = ant.game.time.events.add(3000, function() {
        ant.giveUp = true;;
      }, ant);
    },
    to: function (ant) {
      if(ant.seesPlayer) { return BehaviorState.ATTACK; }
      if(ant.giveUp) { return BehaviorState.WAIT; }
    },
    update: function (ant) {
      ant.moveTowards(ant.moveTo, ant.attackSpeed);
    }
  },
  {
    state: BehaviorState.WAIT,
    start: function(ant) {
      ant.giveUp = false;
      ant.event = ant.game.time.events.add(1000, function() {
        ant.bored = true;
      }, ant);
    },
    to: function (ant) {
      if(ant.seesPlayer) { return BehaviorState.ATTACK; }
      if(ant.bored) { return BehaviorState.WANDER; }
    },
    update: function (ant) {
      ant.body.velocity.x = 0;
      ant.body.velocity.y = 0;
    }
  },
  {
    state: BehaviorState.BACKOFF,
    start: function(ant) {
      ant.backwards = true;
      ant.event = ant.game.time.events.add(2000, function() {
        ant.swoop = true;
        ant.backwards = false;
      }, ant);
    },
    to: function (ant) {
      if(ant.swoop) { return BehaviorState.SWOOP; }
    },
    update: function (ant) {
      if (ant.seesPlayer){
        ant.moveTo.x = ant.playerMemory.x - ant.body.width / 2;
        ant.moveTo.y = ant.playerMemory.y - ant.body.height / 2;
      }else{
        const xDiff = ant.playerMemory.x - ant.body.width / 2 - ant.body.x;
        const yDiff = ant.playerMemory.y - ant.body.height / 2 - ant.body.y;

        const zoomDist = 1000;
        ant.moveTo = {
          x: ant.body.x + zoomDist * xDiff,
          y: ant.body.y + zoomDist * yDiff,
        }

      }
      ant.moveTowards(ant.moveTo, -backoffSpeed);
    }
  },
  {
    state: BehaviorState.SWOOP,
    start: function(ant) {
      ant.swoop = false;
      ant.event = ant.game.time.events.add(1000, function() {
        ant.done = true;
      }, ant);
    },
    to: function (ant) {
      if(ant.seesPlayer && ant.done) { return BehaviorState.ATTACK; }
      if(ant.sawSwing) { return BehaviorState.BACKOFF; }
      if(ant.done) { return BehaviorState.WANDER; }
    },
    update: function (ant) {
      if (ant.seesPlayer){
        ant.moveTo.x = ant.playerMemory.x - ant.body.width / 2;
        ant.moveTo.y = ant.playerMemory.y - ant.body.height / 2;
      } else {
        const xDiff = ant.playerMemory.x - ant.body.width / 2 - ant.body.x;
        const yDiff = ant.playerMemory.y - ant.body.height / 2 - ant.body.y;

        const zoomDist = 1000;
        ant.moveTo = {
          x: ant.body.x + zoomDist * xDiff,
          y: ant.body.y + zoomDist * yDiff,
        }

      }

      ant.moveTowards(ant.moveTo, swoopSpeed);
    }
  }
];

module.exports = {
  BehaviorState,
  antBehavior
};

},{}],9:[function(require,module,exports){
const Ant = require('./ant');
const pinkBehavior  = require('./pink-ant-behavior');
const behaviorRunner = require('./behavior-runner');

const OBJECT_LAYER_NAME = 'PinkAnts';

const PinkAnt = function(game, x, y) {
  this.color = 'pink'
  this.spriteName = 'ant_pink_walk';
  this.sprite = Ant.call(this, game, x, y, this.spriteName);
  this.attackSpeed = 130;
  this.wanderSpeed = 90;
  this.health = 3;
  this.damageAmount = 1;

  this.behavior = behaviorRunner(this, pinkBehavior.antBehavior, pinkBehavior.BehaviorState.WANDER);
};

PinkAnt.prototype = Object.create(Ant.prototype);
PinkAnt.prototype.constructor = PinkAnt;
PinkAnt.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;


module.exports = PinkAnt;

},{"./ant":4,"./behavior-runner":5,"./pink-ant-behavior":8}],10:[function(require,module,exports){
const BehaviorState = {
  WANDER: 1,
  ATTACK: 2,
  WAIT: 3,
  WANDER_NO_ATTACK: 4
};

const stopTime = 500;
const wanderTime = 1000;
const attackChance = 0.20;
const attackTime = 1000;
const attackNoSeeTime = 1000;

const antBehavior = [
  {
    state: BehaviorState.WANDER,
    start: function(ant) {
      ant.bored = false;
      ant.event = ant.game.time.events.add(wanderTime, function () {
        ant.giveUp = true;
      }, ant);

      var heading = ant.game.rnd.realInRange(0, Phaser.Math.PI2);
      var distance = ant.game.rnd.integerInRange(1, 3) * 75;
      ant.moveTo.x = ant.body.x + Math.cos(heading) * distance;
      ant.moveTo.y = ant.body.y + Math.sin(heading) * distance;
    },
    to: function(ant) {
      if(ant.seesPlayer) { return BehaviorState.ATTACK; }
      if(ant.giveUp) { return BehaviorState.WAIT; }
      if(ant.moveTowards(ant.moveTo, ant.wanderSpeed) < 20) { return BehaviorState.WAIT; }
    },
    update: function (ant) {
      ant.moveTowards(ant.moveTo, ant.wanderSpeed);
    }
  },
  {
    state: BehaviorState.ATTACK,
    start: function(ant) {
      ant.event = ant.game.time.events.add(attackTime, function() {
        ant.giveUp = true;;
      }, ant);
    },
    to: function (ant) {
      if (!ant.seesPlayer) { return BehaviorState.WAIT; }
      if (ant.giveUp) { return BehaviorState.WAIT; }
    },
    update: function (ant, player) {
      if (ant.seesPlayer){
        ant.moveTo.x = ant.playerMemory.x - ant.body.width / 2;
        ant.moveTo.y = ant.playerMemory.y - ant.body.height / 2;
      }
      ant.moveTowards(ant.moveTo, ant.attackSpeed);
    }
  },
  {
    state: BehaviorState.WAIT,
    start: function(ant) {
      ant.giveUp = false;
      ant.event = ant.game.time.events.add(stopTime, function() {
        ant.bored = true;
      }, ant);
    },
    to: function (ant) {
      if(ant.seesPlayer) {
        return Math.random() < attackChance ? BehaviorState.ATTACK : BehaviorState.WANDER_NO_ATTACK;
      }
      if(ant.bored) {
        return Math.random() < attackChance ? BehaviorState.WANDER : BehaviorState.WANDER_NO_ATTACK;
      }
    },
    update: function (ant) {
      ant.body.velocity.x = 0;
      ant.body.velocity.y = 0;
    }
  },
  {
    state: BehaviorState.WANDER_NO_ATTACK,
    start: function(ant) {
      ant.bored = false;
      ant.event = ant.game.time.events.add(wanderTime, function () {
        ant.giveUp = true;
      }, ant);

      var heading = ant.game.rnd.realInRange(0, Phaser.Math.PI2);
      var distance = ant.game.rnd.integerInRange(1, 3) * 75;
      ant.moveTo.x = ant.body.x + Math.cos(heading) * distance;
      ant.moveTo.y = ant.body.y + Math.sin(heading) * distance;
    },
    to: function(ant) {
      if(ant.giveUp) { return BehaviorState.WAIT; }
      if(ant.moveTowards(ant.moveTo, ant.wanderSpeed) < 20) { return BehaviorState.WAIT; }
    },
    update: function (ant) {
      ant.moveTowards(ant.moveTo, ant.wanderSpeed);
    }
  },
];

module.exports = {
  BehaviorState,
  antBehavior
};

},{}],11:[function(require,module,exports){
const Ant = require('./ant');
const yellowBehavior  = require('./yellow-ant-behavior');
const behaviorRunner = require('./behavior-runner');

const OBJECT_LAYER_NAME = 'YellowAnts';

const YellowAnt = function(game, x, y) {
  this.color = 'yellow'
  this.spriteName = 'ant_yellow_flying';
  this.sprite = Ant.call(this, game, x, y, this.spriteName);
  this.attackSpeed = 140;
  this.wanderSpeed = 140;
  this.health = 2;
  this.damageAmount = 1;

  this.behavior = behaviorRunner(this, yellowBehavior.antBehavior, yellowBehavior.BehaviorState.WANDER);
};

YellowAnt.prototype = Object.create(Ant.prototype);
YellowAnt.prototype.constructor = YellowAnt;
YellowAnt.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;


module.exports = YellowAnt;

},{"./ant":4,"./behavior-runner":5,"./yellow-ant-behavior":10}],12:[function(require,module,exports){
module.exports = {
  debug: false,
  activeEnemies: true,
  activeEnemyCollision: true,
};

},{}],13:[function(require,module,exports){
const Config = require('./config');


const numChildrenOfGroup = function (group, onlyCountAliveChildren) {
  if (group.children && group.children.length) {
    return group.children.reduce(function (acc, child) {
      return acc + numChildrenOfGroup(child, onlyCountAliveChildren);
    }, 0);
  }
  return onlyCountAliveChildren ? (group.alive ? 1 : 0) : 1;
};
const debugColor = 'rgba(0,255,0,0.8)';
const debugFont = '8px pixelmix';

function DebugInfo(game) {
  this.game = game;
  this.numAliveChildren = 0;
  this.numChildren = 0;

  game.debug.renderShadow = true;

  if (Config.debug) {
    game.time.advancedTiming = true;
  }
}

DebugInfo.prototype.update = function update(keys) {
  if (keys.debug.wasJustReleased) {
    Config.debug = !Config.debug;
    this.game.time.advancedTiming = Config.debug;
  }
  if (!Config.debug) {
    return;
  }

  this.numChildren = numChildrenOfGroup(this.game.world, false);
  this.numAliveChildren = numChildrenOfGroup(this.game.world, true);
};

DebugInfo.prototype.render = function render(player, actorGroup, enemyArr) {
  if (!Config.debug) {
    return;
  }
  const game = this.game;
  const hitboxColor = 'rgba(255, 0, 0, 0.3)';
  const hurtboxColor = 'rgba(0, 255, 255, 0.2)';
  const enemyDamagebox = 'rgba(0, 255, 0, 0.4)';
  const detectionBox = 'rgba(0, 0, 255, 0.1)';

  if (player.attackHitbox.body.enable) {
    game.debug.body(player.attackHitbox, hitboxColor);
  }

  actorGroup.forEach(function(actor) {
    if (actor.alive) {
      game.debug.body(actor, hurtboxColor);
    }
  });

  enemyArr.forEach(function(enemy) {
    if (enemy.alive) {
      game.debug.body(enemy.damageHurtBox, enemyDamagebox);
      game.debug.body(enemy.detectionBubble, detectionBox);
    }
  });


  game.debug.text(`fps ${game.time.fps}` || '-', 2, 10, debugColor, debugFont);
  game.debug.text(`alive ${this.numAliveChildren}` || '-', 2, 20, debugColor, debugFont);
  game.debug.text(`sum ${this.numChildren}` || '-', 2, 30, debugColor, debugFont);
  let i = 0;
  for (let key in Config){
    i = i + 10;
    game.debug.text(`${key}: ${Config[key]}`, 50, i, debugColor, debugFont);
  }
};

module.exports = DebugInfo;

},{"./config":12}],14:[function(require,module,exports){
// green-pretzel-maker.js
const PretzelMaker = require('./pretzel-maker');

const GreenPretzelMaker = function(game, x, y) {
  this.type = 2;
  this.imageName = 'green_pretzel_stand';
  this.pretzelColor = 'green';
  PretzelMaker.call(this, game, x, y)
}
GreenPretzelMaker.prototype = Object.create(PretzelMaker.prototype);
GreenPretzelMaker.prototype.constructor = GreenPretzelMaker

module.exports = GreenPretzelMaker


},{"./pretzel-maker":37}],15:[function(require,module,exports){
const Phaser = (window.Phaser);
const Config = require('./config');
const Player = require('./player');
const WorldMap = require('./world-map');
const Npc = require('./npc');
const YellowAnt = require('./ants/yellow-ant');
const GreenAnt = require('./ants/green-ant');
const PinkAnt = require('./ants/pink-ant');
const Hud = require('./lib/hud');
const Pretzel = require('./pretzel');
const Weapon = require('./weapon');
const InsectPart = require('./insect-part');
const PinkPretzelMaker = require('./pink-pretzel-maker');
const GreenPretzelMaker = require('./green-pretzel-maker');
const YellowPretzelMaker = require('./yellow-pretzel-maker');
const TextBox = require('./narrative/text-box');
const Cutscene = require('./narrative/cutscene');
const preloadSprites = require('./preload-sprites');
const sounds = require('./sounds');
const InputState = require('./input-state');
const DebugInfo = require('./debug-info');
const QuestState = require('./narrative/quest-state');

// quest items
const QuestItem = require('./quest-item');
const Key = require('./key');

const GAME_DIMENSION = { w: 256, h: 240 };

const game = new Phaser.Game(GAME_DIMENSION.w, GAME_DIMENSION.h, Phaser.CANVAS, 'game', { init: init, preload: preload, create: create, update: update, render: render });
const pixel = { scale: 3, canvas: null, context: null, width: 0, height: 0 };
const hudDimension = { x: 0, y: 0, w: GAME_DIMENSION.w, h: 48}

let worldMap;
let player;
let inputState;
let debugInfo;
let questState;
let actorGroup;
let enemyGroup;
let enemyArr;
let npcGroup;
let npcArr;
let hudGroup;
let hud;
let curPlayerHud;
let insectPart;
let hockeyStick;
let pickupGroup;
let enemyDetectionSet;
let pinkPretzelMaker;
let yellowPretzelMaker;
let greenPretzelMaker;
let pretzelMakerGroup;
let resetGameGroup;
let textBox;
let textBoxGroup;
let cutscene;
let soundsInit;

function init() {
  //  Hide the un-scaled game canvas
  game.canvas.style['display'] = 'none';

  //  Create our scaled canvas. It will be the size of the game * whatever scale value you've set
  pixel.canvas = Phaser.Canvas.create(game, game.width * pixel.scale, game.height * pixel.scale);

  //  Store a reference to the Canvas Context
  pixel.context = pixel.canvas.getContext('2d');

  //  Add the scaled canvas to the DOM
  Phaser.Canvas.addToDOM(pixel.canvas, 'game');

  //  Disable smoothing on the scaled canvas
  Phaser.Canvas.setSmoothingEnabled(pixel.context, false);

  //  Cache the width/height to avoid looking it up every render
  pixel.width = pixel.canvas.width;
  pixel.height = pixel.canvas.height;
}

function preload() {
  this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

  WorldMap.preload(game);

  // moved all the "game.load.image()" things in here
  preloadSprites(game);
  soundsInit = sounds.load(game)
  game.load.bitmapFont('pixel8px', 'assets/fonts/pixel.png', 'assets/fonts/pixel.xml');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  // keep the space/arrow key events from propagating up to the browser
  game.input.keyboard.addKeyCapture([
    Phaser.Keyboard.SPACEBAR,
    Phaser.Keyboard.UP,
    Phaser.Keyboard.DOWN,
    Phaser.Keyboard.LEFT,
    Phaser.Keyboard.RIGHT,
  ]);
  worldMap = new WorldMap(game);
  inputState = new InputState(game);
  debugInfo = new DebugInfo(game);

  game.renderer.renderSession.roundPixels = true;  // avoid camera jitter

  resetGameGroup = game.add.group();
  textBoxGroup = game.add.group();
  textBoxGroup.fixedToCamera = true;
  textBox = new TextBox(game, 30, 140);
  textBoxGroup.add(textBox);

  soundsInit.init(game);
  reset();
}

function reset() {


  sounds.stop('fightloop');
  if(!sounds.isPlaying('mainloop')) {
    sounds.play('mainloop', 0.2, true);
  }

  if(enemyGroup) {
    enemyGroup.forEach(function (e) { e.damageHurtBox.destroy(); })
  }

  resetGameGroup.forEach(function (c) {
    c.forEach(function (d) { d.destroy(); });
    c.removeAll();
  });
  questState = new QuestState(game);
  player = new Player(game, null, null, questState);
  player.maxHealth = 10;
  player.health = 10;
  player.maxFullness = 100;
  player.fullness = 100;
  player.onDie(function () {

    textBox.displayPrompt(
      'Would you like to continue?',
      [{
        message: 'yes',
        onChoose: function() {
          textBox.clearPrompt();
          worldMap.setEnvironmentKey('mall_world');
          worldMap.initGameObjectPosition(player, Player.OBJECT_LAYER_NAME);
          player.revive(10);
          player.changeAnimation('bob');
          sounds.stop('fightloop');
          if(!sounds.isPlaying('mainloop')) {
            sounds.play('mainloop', 0.2, true);
          }

        }.bind(this)
      }]
    );
  }.bind(this));

  worldMap.initGameObjectPosition(player, Player.OBJECT_LAYER_NAME);

  // sprite group creation - order matters!
  pretzelMakerGroup = game.add.group();
  pickupGroup = game.add.group();
  npcGroup = game.add.group();
  actorGroup = game.add.group();
  enemyGroup = game.add.group();
  hudGroup = game.add.group();
  hudGroup.fixedToCamera = true;

  resetGameGroup.add(pretzelMakerGroup)
  resetGameGroup.add(pickupGroup)
  resetGameGroup.add(npcGroup)
  resetGameGroup.add(enemyGroup)
  resetGameGroup.add(actorGroup)
  resetGameGroup.add(hudGroup)

  enemyDetectionSet = [];
  enemyHurtBoxSet = [];

  // can't add sprites to multiple groups -- use arrays
  enemyArr = [];
  npcArr = [];

  worldMap.spawn(game, GreenAnt, (ant) => {
    ant.setPickupGroup(pickupGroup);
    actorGroup.add(ant);
    enemyArr.push(ant);
    enemyDetectionSet.push(ant.detectionBubble);
    enemyHurtBoxSet.push(ant.damageHurtBox)
  });

  worldMap.spawn(game, PinkAnt, (ant) => {
    ant.setPickupGroup(pickupGroup);
    actorGroup.add(ant);
    enemyArr.push(ant);
    enemyDetectionSet.push(ant.detectionBubble);
    enemyHurtBoxSet.push(ant.damageHurtBox)
  });

  worldMap.spawn(game, YellowAnt, (ant) => {
    ant.setPickupGroup(pickupGroup);
    actorGroup.add(ant);
    enemyArr.push(ant);
    enemyDetectionSet.push(ant.detectionBubble);
    enemyHurtBoxSet.push(ant.damageHurtBox)
  });

  worldMap.spawnNpc(game, Npc, (npc) => {
    actorGroup.add(npc);
    npcArr.push(npc);
  });

  worldMap.spawnQuestItem(game, QuestItem, (questItem) => {
    pickupGroup.add(questItem);
  });

  actorGroup.add(player);
  game.camera.follow(player);

  const yellowPretzel = new Pretzel(game, -10, -10, 'yellow'); // A hack to get them to show up in pickup
  const pinkPretzel = new Pretzel(game, -10, -10, 'pink'); // A hack to get them to show up in pickup
  const greenPretzel = new Pretzel(game, -10, -10, 'green');
  hockeyStick = new Weapon(game, -10, -10, 'hockey_stick');
  // insectPart = new InsectPart(game, 500, 500, 'green');

  pickupGroup.add(yellowPretzel);
  pickupGroup.add(pinkPretzel);
  pickupGroup.add(greenPretzel);
  pickupGroup.add(hockeyStick);
  // pickupGroup.add(insectPart);

  const key = new Key(game, -10, -10);
  pickupGroup.add(key);

  hud = Hud(game, hudDimension, pickupGroup);

  hudGroup.add(hud.group);

  curPlayerHud = hud.playerHud(player);
  // pretzel makers
  greenPretzelMaker = new GreenPretzelMaker(game, 200, 240);
  yellowPretzelMaker = new YellowPretzelMaker(game, 280, 240);
  pinkPretzelMaker = new PinkPretzelMaker(game, 360, 240);
  pretzelMakerGroup.add(yellowPretzelMaker);
  pretzelMakerGroup.add(greenPretzelMaker);
  pretzelMakerGroup.add(pinkPretzelMaker);

  //text box

  textBox.setPlayer(player);

  cutscene = new Cutscene(game, inputState, textBox);
  hudGroup.add(cutscene); // idk where this belongs but it doesn't really matter

  questState.setPlayer(player);
  questState.setPickupGroup(pickupGroup);
}


function update() {
  inputState.update(); // let this go first plz
  // if (inputState.keys.restart.wasJustReleased) {
  //   // press R
  //   reset()
  //   return;
  // }

  debugInfo.update(inputState.keys);
  textBox.updateInput(inputState.keys);

  curPlayerHud.update(player);
  player.updateControls(inputState.keys);
  if (Config.activeEnemyCollision) {
    game.physics.arcade.overlap(player, enemyHurtBoxSet, onPlayerHit, null, this);
  }

  game.physics.arcade.overlap(player, pickupGroup, pickupCollisionHandler, null, this);
  game.physics.arcade.overlap(player.attackHitbox, enemyArr, onEnemyHit, null, this);
  // game.physics.arcade.overlap(player, enemyDetectionSet, onEnemyDetect, null, this);

  enemyDetectionSet.forEach(function (e) {
    onEnemyDetect(player, e, game.physics.arcade.overlap(player, e))
  });

  game.physics.arcade.collide(actorGroup, worldMap.getCollisionLayer());

  game.physics.arcade.collide(player, pretzelMakerGroup, pretzelMakerCollisionHandler, null, this);
  game.physics.arcade.collide(player, npcArr, npcHandler, null, this);
  game.physics.arcade.collide(player, worldMap.getDoorwayLayer(), worldMap.doorwayHandlerGenerator(game), null, this);
  game.physics.arcade.collide(player, worldMap.getOutDoorwayLayer(), worldMap.outDoorwayHandlerGenerator(game), null, this);
  game.physics.arcade.collide(actorGroup, worldMap.getDoorwayLayer());
  game.physics.arcade.collide(actorGroup, worldMap.getOutDoorwayLayer());

  game.physics.arcade.collide(actorGroup, worldMap.getVoidLayer());

  // depth sorting mothafucka!!!
  actorGroup.sort('y', Phaser.Group.SORT_ASCENDING);
}

function onPlayerHit(player, enemyHurtBox) {
  if (!player.alive || player.inHitStun || !enemyHurtBox.parent.alive) {
    return;
  }
  sounds.play('player_hit', 0.1);
  const angle = Math.atan2(player.body.y - enemyHurtBox.body.y, player.body.x - enemyHurtBox.body.x);

  const { x, y } = enemyHurtBox.parent.body.velocity;

  const speed = Math.sqrt(x * x + y * y);
  const forceMultiplier = 1.5;
  const forceFormula = 300 + speed * forceMultiplier

  player.knockback(angle, forceFormula);
  player.damage(enemyHurtBox.parent.damageAmount);
}

function onEnemyHit(playerAttackHitbox, enemy) {
  if (playerAttackHitbox.parent) {
    playerAttackHitbox.parent.hitEnemy(enemy);
    enemy.damage(1);

    game.camera.shake(0.005, 500);

    const emitter = this.game.add.emitter(enemy.body.center.x, enemy.body.center.y, 15);

    emitter.makeParticles( [ 'muzzleflash2', 'muzzleflash4' ] );
    emitter.gravity = 1000;
    emitter.setAlpha(1, 0, 3000);
    emitter.setScale(0.05, 0, 0.05, 0, 3000);

    emitter.start(false, 3000, 5);

    game.time.events.add(600, () => {emitter.destroy()}, this);
  }
}

function onEnemyDetect(player, bubble, overlap) {
  bubble.parent.seePlayer(player, overlap);
}

function pickupCollisionHandler(player, pickup){
  const pickedUp = player.pickupItem(pickup);
  if(pickedUp) { pickup.kill(); }
}

function pretzelMakerCollisionHandler(player, pretzelMaker){
  pretzelMaker.configPrompt(player, textBox, pickupGroup);
}

function npcHandler(player, npc) {
  questState.triggerNpcInteraction(npc, cutscene);
};

function render() {
  debugInfo.render(player, actorGroup, enemyArr);

  //  Every loop we need to render the un-scaled game canvas to the displayed scaled canvas:
  pixel.context.drawImage(game.canvas, 0, 0, game.width, game.height, 0, 0, pixel.width, pixel.height);
}

},{"./ants/green-ant":7,"./ants/pink-ant":9,"./ants/yellow-ant":11,"./config":12,"./debug-info":13,"./green-pretzel-maker":14,"./input-state":16,"./insect-part":17,"./key":18,"./lib/hud":21,"./narrative/cutscene":26,"./narrative/quest-state":28,"./narrative/text-box":30,"./npc":31,"./pink-pretzel-maker":34,"./player":35,"./preload-sprites":36,"./pretzel":38,"./quest-item":39,"./sounds":40,"./weapon":41,"./world-map":42,"./yellow-pretzel-maker":43}],16:[function(require,module,exports){
function InputState(game) {
  this.game = game;
  this.keyMap = {
    interact: [Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.ENTER],
    item: [Phaser.Keyboard.F],
    up: [Phaser.Keyboard.UP, Phaser.Keyboard.W, Phaser.Keyboard.Z], // french people
    down: [Phaser.Keyboard.DOWN, Phaser.Keyboard.S],
    left: [Phaser.Keyboard.LEFT, Phaser.Keyboard.A, Phaser.Keyboard.Q], // french people
    right: [Phaser.Keyboard.RIGHT, Phaser.Keyboard.D],
    debug: [Phaser.Keyboard.T],
    restart: [Phaser.Keyboard.R],
  };

  this.keys = {};
  Object.keys(this.keyMap).forEach(function (key) {
    this.keys[key] = { isDown: false, _wasDown: false, wasJustReleased: false };
  }, this);
}

InputState.prototype.update = function update() {
  Object.keys(this.keyMap).forEach(function(action) {
    const keyState = this.keys[action];
    const wasDown = keyState.isDown;

    keyState.isDown = false;
    this.keyMap[action].forEach(function (keyCode) {
      keyState.isDown = keyState.isDown || this.game.input.keyboard.isDown(keyCode);
    }, this);

    keyState.wasJustReleased = wasDown && !keyState.isDown;
  }, this);
};

module.exports = InputState;

},{}],17:[function(require,module,exports){
// insect-part.js
const Pickup = require('./pickup');

const InsectPart = function(game, x, y, color) {
  this.name = 'insectPart';
  this.color = color;

  this.type = 1;
  if(color === 'yellow') { this.type = 1; }
  if(color === 'green')  { this.type = 2; }
  if(color === 'pink')   { this.type = 3; }

  Pickup.call(this, game, x, y, 'ant_' + this.color + '_part')
}
InsectPart.prototype = Object.create(Pickup.prototype);
InsectPart.prototype.constructor = InsectPart

InsectPart.prototype.getMetaData = function() {
  return {type: this.type, color: this.color}
}
module.exports = InsectPart;

},{"./pickup":33}],18:[function(require,module,exports){
// key.js
const QuestItem = require('./quest-item');

const Key = function(game, x, y) {
  QuestItem.call(this, game, x, y, 'key')
  this.type = 'quest';
  this.name = 'key';
}
Key.prototype = Object.create(QuestItem.prototype);
Key.prototype.constructor = Key

module.exports = Key

},{"./quest-item":39}],19:[function(require,module,exports){
function Bar(game, { x, y, w, h }, color) {
  var graphics = game.make.graphics(0,0);

  graphics.beginFill(color);
  graphics.drawRect(x, y, w, h);
  graphics.endFill();

  return graphics
};

module.exports = Bar;

},{}],20:[function(require,module,exports){
function HeartContainer(game, heartDimensions) {
  const { x, y, h } = heartDimensions;



  const heartGroup = game.make.group();
  heartGroup.x = x;
  heartGroup.y = y;


  const fullHeart = game.make.sprite(0, 0, 'hearts42x14', 0);
  const halfHeart = game.make.sprite(0, 0, 'hearts42x14', 1);
  const emptyHeart = game.make.sprite(0, 0, 'hearts42x14', 2);

  const scalingParameter = h / fullHeart.height;

  heartGroup.scale.setTo(scalingParameter , scalingParameter);

  heartGroup.add(fullHeart);
  heartGroup.add(halfHeart);
  heartGroup.add(emptyHeart);

  return {
    update: function(state) {
      fullHeart.alpha = (state === "FULL") ? 1 : 0;
      halfHeart.alpha = (state === "HALF") ? 1 : 0;
      emptyHeart.alpha = (state === "EMPTY") ? 1 : 0;
    },
    group: heartGroup
  }
};

module.exports = HeartContainer;

},{}],21:[function(require,module,exports){
const { range } = require('./utils');
const HeartContainer = require('./heartContainer');
// const Stomach = require('./stomach');
const Bar = require('./bar');
const ItemContainer = require('./itemContainer');
const InsectPartCounter = require('./insectPartCounter')

function Hud(game, hudDimension, pickupGroup) {


  const { x, y, w, h } = hudDimension;
  const hudGroup = game.make.group();
  const heartSize = 7

  hudGroup.add(Bar(game, hudDimension, 0x000000));

  function playerHud(player) {
    // console.log("player = %j", player)
    const { maxHealth } = player;

    // const stomach = Stomach(game, {x: 10, y: 10, w: 50, h: 20});
    const weaponContainer = ItemContainer(game, {x: 5, y: 5, w: 50, h: 40}, pickupGroup, 'weapon');
    const pretzelContainer = ItemContainer(game, {x: 55, y: 5, w: 50, h: 40}, pickupGroup, 'pretzel');
    const questContainer = ItemContainer(game, {x: 105, y: 5, w: 50, h: 40}, pickupGroup, 'quest', 'item');

    const greenInsectPart = InsectPartCounter(game, {x: 140, y: 2, w: 50, h: 15}, 'green');
    const yellowInsectPart = InsectPartCounter(game, {x: 140, y: 15, w: 50, h: 15}, 'yellow');
    const pinkInsectPart = InsectPartCounter(game, {x: 140, y: 28, w: 50, h: 15}, 'pink');

    const heartSetLocation = { x: 180, y: 30, h: 14 };

    const heartContainers = range(Math.ceil(maxHealth / 2)).map(function (o) {

      const heartDim = {
        x: x + heartSetLocation.x + o * heartSetLocation.h,
        y: y + heartSetLocation.y,
        h: heartSetLocation.h
      }
      return HeartContainer(game, heartDim);
    });

    heartContainers.map(function (heart) {
      hudGroup.add(heart.group);
    });

    // hudGroup.add(stomach.group);
    hudGroup.add(pretzelContainer.group);
    hudGroup.add(weaponContainer.group);
    hudGroup.add(questContainer.group);
    hudGroup.add(yellowInsectPart.group);
    hudGroup.add(greenInsectPart.group);
    hudGroup.add(pinkInsectPart.group);

    function drawHeartAtOffsets(heartType, offset, end) {
      heartContainers.slice(offset, end).map(function (heartContainer) {
        heartContainer.update(heartType);
      });
    }

    function updateHearts({ health, maxHealth }) {
      const hearts = health / 2;
      const maxHearts = maxHealth / 2;

      drawHeartAtOffsets('FULL', 0, Math.floor(hearts));
      drawHeartAtOffsets('HALF', Math.floor(hearts), Math.ceil(hearts));
      drawHeartAtOffsets('EMPTY', Math.ceil(hearts), maxHearts);
    }

    function update(player) {
      // stomach.update(player);
      updateHearts(player);
      pretzelContainer.update(player);
      weaponContainer.update(player);
      questContainer.update(player);
      yellowInsectPart.update(player);
      greenInsectPart.update(player);
      pinkInsectPart.update(player);
    }

    return { update };
  }

  return { playerHud, group: hudGroup };
}

module.exports = Hud;

},{"./bar":19,"./heartContainer":20,"./insectPartCounter":22,"./itemContainer":23,"./utils":24}],22:[function(require,module,exports){
function insectPartCounter(game, dimensions, insectPartColor) {
  const itemGroup = game.make.group();
  itemGroup.x = dimensions.x;
  itemGroup.y = dimensions.y;
  itemGroup.height = dimensions.h;

  const height = dimensions.h;

  const scaleInteger = Math.floor(dimensions.h / 8);
  const numberSize = (scaleInteger * 8);
  const textHeight = Math.floor((height - numberSize) / 2);

  const textObj = game.add.bitmapText(17, textHeight, 'pixel8px', 'x 0', numberSize);

  const sprite = game.make.sprite(0, 0, 'ant_' + insectPartColor + '_part');
  const scalingParameter = height / sprite.height;
  sprite.scale.setTo(scalingParameter , scalingParameter);

  itemGroup.add(sprite)
  itemGroup.add(textObj)

  return {
    update: function(player) {
      const number = player.insectParts[insectPartColor];
      textObj.text = "x " + number;
    },
    group: itemGroup
  }
};

module.exports = insectPartCounter;

},{}],23:[function(require,module,exports){
function ItemContainer(game, dimensions, pickupGroup, itemType, itemTypeLabel) {
  const itemGroup = game.make.group();
  itemGroup.x = dimensions.x;
  itemGroup.y = dimensions.y;

  const pickupables = pickupGroup.children.map((i) => i.name)

  const spritesPairs = pickupables.map(function (name) {
    const sprite = game.make.sprite(0, 0, name);
    itemGroup.add(sprite);
    return [name, sprite];
  });

  const textObj = game.add.bitmapText(0, dimensions.h - 8, 'pixel8px', itemTypeLabel || itemType, 8);
  itemGroup.add(textObj);

  return {
    update: function(player) {
      const pickupName = player[itemType] && player[itemType].name;

      spritesPairs.forEach(function ([name, sprite]) {
        sprite.alpha = ((name === pickupName) ? 1 : 0);
      });
    },
    group: itemGroup
  }
};

module.exports = ItemContainer;

},{}],24:[function(require,module,exports){
module.exports = {
  range: function (first, second) {
    const end = !second ? first : second;
    const start = second ? first : 0;

    let array = [];
    for(let i = start; i < end; ++i) {
      array.push(i);
    }
    return array;
  }
}

},{}],25:[function(require,module,exports){
const ChoiceMenu = function(game, choices, x, y) {
  Phaser.Sprite.call(this, game, x, y);
  this.choices = choices;

  this.activeAlpha = 1;
  this.inactiveAlpha = 0.5;

  this.choiceTextObjects = [];
  this.highlightedChoiceIndex = 0;


  choices.forEach(function(choice, i) {
    const text = this.game.add.bitmapText(10, 10*i, 'pixel8px', choice.message, 8);
    if (i > 0) {
      text.alpha = this.inactiveAlpha;
    }
    this.choiceTextObjects.push(text);
    this.addChild(text);
  }, this);
};


ChoiceMenu.prototype = Object.create(Phaser.Sprite.prototype);
ChoiceMenu.prototype.constructor = ChoiceMenu;

ChoiceMenu.prototype.reset = function() {
  this.highlightedChoiceIndex = 0;
}

ChoiceMenu.prototype.onCursorInput = function(direction) {
  if (direction === 'up') {
    this.highlightedChoiceIndex--;
  } else {
    this.highlightedChoiceIndex++;
  }
  this.highlightedChoiceIndex = Math.max(this.highlightedChoiceIndex, 0);
  this.highlightedChoiceIndex = Math.min(this.highlightedChoiceIndex, this.choices.length - 1);
  this.highlightChoice(this.highlightedChoiceIndex);
};

ChoiceMenu.prototype.highlightChoice = function(index) {
  this.choiceTextObjects.forEach(function(obj) {
    obj.alpha = this.inactiveAlpha;
  }, this);
  this.choiceTextObjects[index].alpha = this.activeAlpha;
};

ChoiceMenu.prototype.selectChoice = function() {
  return this.choices[this.highlightedChoiceIndex].onChoose();
};

module.exports = ChoiceMenu;

},{}],26:[function(require,module,exports){
//cutscene.js
const StateManager = require('./state-manager');

function Cutscene(game, inputState, textBox) {
  Phaser.Sprite.call(this, game, null, null, null);

  this.inputState = inputState;
  this.textBox = textBox;
  this.reset();

  this.states = {
    default: [
      { duration: 0, after: 'enterPrintNarrativeLine' },
    ],
    enterPrintNarrativeLine: [
      {
        duration: Math.infinity,
        action: function () {
          this.currentDialogueIndex++;
          if (!this.lines[this.currentDialogueIndex]) {
            this.stateManager.setState('end');
          } else {
            this.stateManager.setState('printNarrativeLine');
          }
        }.bind(this)
      },
    ],
    printNarrativeLine: [
      {
        duration: Math.infinity,
        skipTo: 'narrativeLineWaiting',
        action: function() {
          this.textBox.displayText(this.lines[this.currentDialogueIndex]);
        }.bind(this)
      },
    ],
    // when entire line is printed out
    narrativeLineWaiting: [
      {
        duration: Math.infinity,
        skipTo: 'enterPrintNarrativeLine',
        action: function() {
          this.textBox.skipAnimatingText();
        }.bind(this)
      },
    ],
    end: [
      {
        duration: 0,
        action: function () {
          if (this.callback) {
            this.callback();
          }
          this.textBox.reset();
          this.reset(0);
        }.bind(this)
      },
    ],
  };
}

Cutscene.prototype = Object.create(Phaser.Sprite.prototype);
Cutscene.prototype.constructor = Cutscene;

Cutscene.prototype.reset = function () {
  this.currentDialogueIndex = -1;
  this.callback = null;

  if (this.stateManager) {
    this.stateManager.destroy();
  }
};

Cutscene.prototype.playLines = function (lines, callback) {
  this.lines = lines;
  this.stateManager = new StateManager(this.game, this.states);
  this.callback = callback;
};

Cutscene.prototype.update = function () {
  if (!this.stateManager) {
    return;
  }

  if (this.inputState.keys.interact.wasJustReleased) {
    this.skipTo();
  } else if (this.stateManager.state === 'printNarrativeLine' && this.textBox.timer.length === 0) {
    this.skipTo();
  }
};

Cutscene.prototype.skipTo = function () {
  if (this.stateManager.currentFrame.skipTo) {
    this.stateManager.setState(this.stateManager.currentFrame.skipTo);
  }
};

module.exports = Cutscene;

},{"./state-manager":29}],27:[function(require,module,exports){
const questDefinitions = [
  // 0 starting state
  {
    npcLines: [["debug"]],
    isComplete: function(questState, player) {
      return true;
    },
    successLines: [
      "Welcome! You're the first person I’ve seen in... a week? Two weeks?",
      "Doesn't matter. Welcome!",
    ],
    onComplete: function(questState, player) {
      questState.hasTalkedToNpc = true;
    },
  },
  // give him a quest pretzel
  // he gives you a weapon
  {
    npcLines: [
      ["I don't have many teeth, but man I want to gum on a pretzel!"],
      ["Can you hear that? My stomach is growling louder than that locomotive I took to the mines in '42."],
    ],
    successLines: [
      "You know it feels like I haven't had a pretzel since '58.\n Thank you!",
      "This here hockey stick reminds me of the one I used to beat the St. Louis Eagles in '38.",
      "Take it and maybe you'll...\n***dozes***",
    ],
    isComplete: function(questState, player) {
      return questState.hasPickedUpQuestPretzel;
    },
    onComplete: function(questState, player) {
      questState.removeQuestItem();
      questState.giveWeaponToPlayer('hockey_stick');
    },
  },
  // give him his family photo
  // he gives you a key
  {
    npcLines: [
      ["Oh no! I plum don't know where the polaroid of my late wife Gertrude is. Can you help me find it?", "This feels like the time I lost her engagement ring in...\n***dozes***"]
    ],
    successLines: [
      "Thank you kindly for finding the photograph! Here's a key--it unlocks...\n***dozes***",
    ],
    isComplete: function(questState, player) {
      return questState.hasPickedUpOldGuyPhoto;
    },
    onComplete: function(questState, player) {
      questState.removeQuestItem();
      questState.giveQuestItemToPlayer('key');
    },
  },
  // give him his family photo
  // he gives you a key
  {
    npcLines: [
      ["These pretzels are making me thirsty!"],
      ["I love it that someone else exists!"],
      ["I dated the mop for a while, but that was way before you arrived!"],
      ["Have you ever danced with the devil in the pale moonlight?", "Me neither!"],
      ["Bugs are deadly and delicious!"],
      ["I can hear the mad scrambling of the thirsty rampaging hordes, clawing at the gates, desperate for ingress, the fury of nature licking the walls, emasculated by the structures of mankind.", "I deny them with my entire spirit."],
      ["You remind me of the daughter that abandoned me.", "You're much nicer, though!"],
      ["It's scary when you leave me alone in here, but that’s okay!"],
      ["Talk to me and stuff!"],
      ["It's just like", "It's just like", "A mini-mall, hey hey", "You heard me!"],
      ["Do you like to eat organ meats?", "I have the gout!"],
      ["Sometimes I like to sit outside the pretzel shop and watch the world not go by!"],
      ["Have you ever taken acid?", "Me neither!"],
      ["You crack me up!"],
      ["I'm wrinkled and wise!"],
    ],
    mouseManLines: [
      ["You found me, the Mouse Man! This is the end of the game.\nThanks for playing!"]
    ],
    isComplete: function(questState, player) {
      return false;
    },
  },
];

module.exports = questDefinitions;

},{}],28:[function(require,module,exports){
const questDefinitions = require('./quest-definitions');
const Weapon = require('../Weapon');
const OldGuyPhoto = require('../old-guy-photo');
const Key = require('../key');

function QuestState(game, pickupGroup) {
  this.game = game;
  this.pickupGroup = pickupGroup;

  this.questIndex = 0;
  this.player = null;

  // bunch of shit
  this.currentQuestItem = null;
  this.hasTalkedToNpc = false;
  this.hasPickedUpQuestPretzel = false;
  this.hasPickedUpOldGuyPhoto = false;
}

QuestState.prototype.setPlayer = function (player) {
  this.player = player;
};
QuestState.prototype.setPickupGroup = function (pickupGroup) {
  this.pickupGroup = pickupGroup;
};

QuestState.prototype.triggerNpcInteraction = function (npc, cutscene) {
  const quest = questDefinitions[this.questIndex];
  if (quest.isComplete(this, this.player)) {

    if (quest.successLines) {
      this.displayDialogue(cutscene, quest.successLines, function() {
        this.completeCurrentQuest();
      }.bind(this));
    } else {
      this.completeCurrentQuest();
    }

  } else {
    const lines = this.chooseRandomText(npc);
    this.displayDialogue(cutscene, lines);
  }
};

QuestState.prototype.chooseRandomText = function (npc) {
  const currentQuest = questDefinitions[this.questIndex];
  let choices;
  if (npc.name === "mouse_man") {
    choices = currentQuest.mouseManLines || currentQuest.npcLines;
  } else {
    choices = currentQuest.npcLines;
  }
  const randomIndex = Math.floor((Math.random() * choices.length));
  return choices[randomIndex];
};

QuestState.prototype.displayDialogue = function(cutscene, lines, callback) {
  cutscene.playLines(lines, callback);
};

QuestState.prototype.completeCurrentQuest = function() {
  const currentQuest = questDefinitions[this.questIndex];
  currentQuest.onComplete.call(this, this, this.player);
  this.questIndex += 1;
};

QuestState.prototype.removeQuestItem = function() {
  this.player.removeQuestItem();
};

QuestState.prototype.giveWeaponToPlayer = function(type) {
  const weapon = new Weapon(this.game, this.player.x, this.player.y, type);
  this.pickupGroup.add(weapon);
}

QuestState.prototype.giveQuestItemToPlayer = function(type) {
  let questItem;
  if (type === 'old_guy_photo') {
    questItem = new OldGuyPhoto(this.game, this.player.x, this.player.y);
  } else if (type === 'key') {
    questItem = new Key(this.game, this.player.x, this.player.y);
  }
  this.pickupGroup.add(questItem);
};

module.exports = QuestState;

},{"../Weapon":2,"../key":18,"../old-guy-photo":32,"./quest-definitions":27}],29:[function(require,module,exports){
// a clone of behavior.lua from knife
function StateManager(game, states) {
  Phaser.Sprite.call(this, game, null, null, null);
  this.states = states;
  this.state = 'default';
  this.index = 0;
  this.timer = this.game.time.create(false);
  this.timer.start();
  this.currentFrame = this.getCurrentFrame();
  this.performAction();
  this.addTimerEvent();
}

StateManager.prototype = Object.create(Phaser.Sprite.prototype);
StateManager.prototype.constructor = StateManager;

StateManager.prototype.setState = function (state, index) {
  this.timer.removeAll();
  this.state = state; // state name
  this.index = index || 0;
  this.currentFrame = this.getCurrentFrame();
  this.performAction();
  this.addTimerEvent();
  return this;
};

StateManager.prototype.addTimerEvent = function() {
  this.timer.add(this.currentFrame.duration, function () {
    this.advanceFrame();
    this.performAction();
  }, this);
};

StateManager.prototype.advanceFrame = function () {
  const nextState = this.currentFrame.after;
  let nextIndex = this.index + 1;
  const maxIndex = this.states[this.state].length - 1;

  if (nextState) {
    this.state = nextState;
    nextIndex = 0;
  } else if (nextIndex > maxIndex) {
    nextIndex = 0;
  }

  this.index = nextIndex;
  this.currentFrame = this.getCurrentFrame();
};

StateManager.prototype.performAction = function () {
  if (this.currentFrame.action) {
    this.currentFrame.action();
  }
};

StateManager.prototype.getCurrentFrame = function () {
  return this.states[this.state][this.index];
};

module.exports = StateManager;


},{}],30:[function(require,module,exports){
//text-box.js
const ChoiceMenu = require('./choice-menu');

const TextBox = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, null);

  this.targetWidth = 200;
  this.background = this.createBackground();
  this.addChild(this.background);


  this.visible = false;
  this.isPrompting = false;
  this.textObj = this.game.add.bitmapText(16, 10, 'pixel8px', '', 8);
  this.textObj.maxWidth = this.targetWidth - 30;
  this.addChild(this.textObj);

  // text animation timer
  this.timer = this.game.time.create(false);
  this.timer.start();

  this.wasInteractionKeyDown = false;
  this.wasUpKeyDown = false;
  this.wasDownKeyDown = false;
};

TextBox.prototype = Object.create(Phaser.Sprite.prototype);
TextBox.prototype.constructor = TextBox;

TextBox.prototype.reset = function() {
  this.visible = false;
  this.textString = '';
  this.textObj.text = '';
  this.releasePlayer();
};

TextBox.prototype.createBackground = function() {
  const w = this.targetWidth;
  const h = 80;
  const bmd = this.game.add.bitmapData(0, 0);
  // draw to the canvas context like normal
  bmd.ctx.beginPath();
  bmd.ctx.rect(0, 0, w, h);
  bmd.ctx.fillStyle = '#000000';
  bmd.ctx.fill();
  // use the bitmap data as the texture for the sprite
  return this.game.add.sprite(0, 0, bmd);
};

TextBox.prototype.displayPrompt = function(textString, choices) {
  this.isPrompting = true;
  this.displayText(textString)
  this.choiceMenu = new ChoiceMenu(this.game, choices, 16, 40);
  this.addChild(this.choiceMenu);
};

TextBox.prototype.clearPrompt = function() {
  this.isPrompting = false;
  this.reset();
  this.removeChild(this.choiceMenu);
  this.choiceMenu.destroy();
  this.choiceMenu = null;
};

TextBox.prototype.displayText = function(textString) {
  if(this.player) { this.player.isInDialogue = true; }
  this.visible = true;
  this.textString = textString;
  this.textObj.text = '';
  this.addCharByChar(this.textObj, textString);
};

TextBox.prototype.setPlayer = function(player) {
  this.player = player;
}

TextBox.prototype.updateInput = function(keys) {
  // Input handling
  if (!this.visible) {
    return;
  }

  if (keys.interact.wasJustReleased) {
    this.onKeyUp();
  } else if (keys.up.wasJustReleased) {
    this.onCursorInput('up');
  } else if (keys.down.wasJustReleased) {
    this.onCursorInput('down');
  }
};

TextBox.prototype.releasePlayer = function() {
  if(this.player) { this.player.isInDialogue = false; }
}

TextBox.prototype.onKeyUp = function() {
  if (this.timer.length === 0) { // animation finished
    if (this.isPrompting) {
      this.choiceMenu.selectChoice();
    } else {
      this.reset();
    }
  }
  this.skipAnimatingText();
};

TextBox.prototype.onCursorInput = function(direction) {
  if (!this.choiceMenu) { return; }
  this.choiceMenu.onCursorInput(direction);
};

TextBox.prototype.skipAnimatingText = function() {
  this.timer.removeAll();
  this.textObj.text = this.textString;
};

// Add text, character by character
TextBox.prototype.addCharByChar = function(textObj, textString, ms = 20) {
  let totalTime = 0;
  // loop through each character of the custom text
  // debugger;
  for (let i = 0, txtLen = textString.length; i < txtLen; i++) {
    this.timer.add(totalTime, function() {
      // add the next character
      this.textObj.text += this.textString[this.i];
    }, { textObj: textObj, textString: textString, i: i }); // for scoping purposes
    // the next character will appear at this time
    totalTime += ms;
  }
};


module.exports = TextBox;

},{"./choice-menu":25}],31:[function(require,module,exports){
const Actor = require('./actor');
const OBJECT_LAYER_NAME = 'Npcs';

const Npc = function(game, x, y, name) {
  Actor.call(this, game, x, y, name);
  this.name = name;
  this.body.immovable = true;
  this.body.setSize(16, 16, 8, 16);  // w h x y
  this.bob();
  this.state = 0;
};

Npc.prototype = Object.create(Actor.prototype);
Npc.prototype.constructor = Npc;
Npc.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;

Npc.prototype.bob = function() {
  if (this.name === 'old_guy') {
    this.loadTexture('old_guy_idle', 0);
    this.animations.add('old_guy_idle');
    this.animations.play('old_guy_idle', 3, true);
  } else if (this.name === 'mouse_man') {
    this.loadTexture('mouse_man_idle', 0);
    this.animations.add('mouse_man_idle');
    this.animations.play('mouse_man_idle', 3, true);
  }
};

module.exports = Npc;

},{"./actor":3}],32:[function(require,module,exports){
// old-guy-photo.js

const QuestItem = require('./quest-item');

const OldGuyPhoto = function(game, x, y) {
  QuestItem.call(this, game, x, y, 'old_guy_photo');
  this.name = 'old_guy_photo';
}
OldGuyPhoto.prototype = Object.create(QuestItem.prototype);
OldGuyPhoto.prototype.constructor = OldGuyPhoto

module.exports = OldGuyPhoto;

},{"./quest-item":39}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
// pink-pretzel-maker.js
const PretzelMaker = require('./pretzel-maker');

const PinkPretzelMaker = function(game, x, y) {
  this.type = 3;
  this.imageName = 'pink_pretzel_stand';
  this.pretzelColor = 'pink';
  PretzelMaker.call(this, game, x, y);
}
PinkPretzelMaker.prototype = Object.create(PretzelMaker.prototype);
PinkPretzelMaker.prototype.constructor = PinkPretzelMaker

module.exports = PinkPretzelMaker

},{"./pretzel-maker":37}],35:[function(require,module,exports){
const Actor = require('./actor');
const sounds = require('./sounds');
const SPRITE_KEY = 'player';

const HUNGER_GROWTH_PERIODICITY = 250; // millis
const OBJECT_LAYER_NAME = 'PlayerLayer';
const MOVE_SPEED = 150;
const sqrt2 = Math.sqrt(2);

const Player = function Player(game, x=0, y=0, questState) {
  Actor.call(this, game, x, y, SPRITE_KEY);
  this.questState = questState;
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
    yellow: 0,
    green: 0,
    pink: 0,
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
  if (pickup.type === 'quest' && !this.quest) {
    this.quest = pickup.getMetaData();
    if (this.quest.name === 'quest_pretzel') { //todo
      this.questState.hasPickedUpQuestPretzel = true;
    } else if (this.quest.name === 'old_guy_photo') {
      this.questState.hasPickedUpOldGuyPhoto = true;
    }
    return true;
  }

  if ((pickup.name == 'pretzel' || pickup.name.indexOf("pretzel") >= 0) && !this.pretzel) {
    this.pretzel = pickup.getMetaData();
    sounds.play('pickup_pretzel', 0.1);
    return true;
  }

  if (pickup.type == 'weapon') {
    this.weapon = pickup.getMetaData();
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

Player.prototype.removeQuestItem = function() {
  this.quest = null;
};

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

},{"./actor":3,"./sounds":40}],36:[function(require,module,exports){
module.exports = function preloadSprites(game) {
  // sheets
  game.load.spritesheet('player', 'assets/sprites/player.png', 32, 32);
  game.load.spritesheet('hearts', 'assets/sprites/hearts.png', 7, 7);
  game.load.spritesheet('hearts42x14', 'assets/sprites/hearts42x14.png', 14, 14);
  game.load.spritesheet('hearts63x21', 'assets/sprites/hearts63x21.png', 21, 21);
  game.load.spritesheet('player', 'assets/sprites/player.png', 32, 32);
  game.load.spritesheet('old_guy_idle', 'assets/sprites/old_guy_idle.png', 32, 32);
  game.load.spritesheet('mouse_man', 'assets/sprites/mouse_man.png', 32, 32);
  game.load.spritesheet('mouse_man_idle', 'assets/sprites/mouse_man_idle.png', 32, 32);
  game.load.spritesheet('ant_green_walk', 'assets/sprites/ant_green_walk.png', 32, 32);
  game.load.spritesheet('ant_pink_walk', 'assets/sprites/ant_pink_walk.png', 32, 32);
  game.load.spritesheet('ant_yellow_flying', 'assets/sprites/ant_yellow_flying.png', 32, 32);

  // player static, probably don't need these
  game.load.image('player_up', 'assets/sprites/player/up.png');
  game.load.image('player_down', 'assets/sprites/player/down.png');
  game.load.image('player_left', 'assets/sprites/player/left.png');
  game.load.image('player_right', 'assets/sprites/player/right.png');

  // player sheets
  game.load.spritesheet('player_up_bob', 'assets/sprites/player/up_bob.png', 32, 32);
  game.load.spritesheet('player_down_bob', 'assets/sprites/player/down_bob.png', 32, 32);
  game.load.spritesheet('player_left_bob', 'assets/sprites/player/left_bob.png', 32, 32);
  game.load.spritesheet('player_right_bob', 'assets/sprites/player/right_bob.png', 32, 32);

  game.load.spritesheet('player_up_walk', 'assets/sprites/player/up_walk.png', 32, 32);
  game.load.spritesheet('player_down_walk', 'assets/sprites/player/down_walk.png', 32, 32);
  game.load.spritesheet('player_left_walk', 'assets/sprites/player/left_walk.png', 32, 32);
  game.load.spritesheet('player_right_walk', 'assets/sprites/player/right_walk.png', 32, 32);

  game.load.spritesheet('player_up_attack', 'assets/sprites/player/up_attack.png', 32, 32);
  game.load.spritesheet('player_down_attack', 'assets/sprites/player/down_attack.png', 32, 32);
  game.load.spritesheet('player_left_attack', 'assets/sprites/player/left_attack.png', 32, 32);
  game.load.spritesheet('player_right_attack', 'assets/sprites/player/right_attack.png', 32, 32);

  game.load.spritesheet('player_up_hurt', 'assets/sprites/player/up_hurt.png', 32, 32);
  game.load.spritesheet('player_down_hurt', 'assets/sprites/player/down_hurt.png', 32, 32);
  game.load.spritesheet('player_left_hurt', 'assets/sprites/player/left_hurt.png', 32, 32);
  game.load.spritesheet('player_right_hurt', 'assets/sprites/player/right_hurt.png', 32, 32);

  game.load.spritesheet('player_death', 'assets/sprites/player/death.png', 32, 32);

  game.load.image('ant', 'assets/sprites/ant.png');
  game.load.image('npc', 'assets/sprites/npc.png');
  game.load.image('old_guy', 'assets/sprites/old_guy.png');
  game.load.image('old_guy_photo', 'assets/sprites/old_guy_photo.png');
  game.load.image('key', 'assets/sprites/key.png');
  // game.load.image('pretzel', 'assets/sprites/pretzel.png');
  game.load.image('hockey_stick', 'assets/sprites/hockey_stick.png');
  game.load.image('baseball_bat', 'assets/sprites/baseball_bat.png');

  game.load.image('ant_yellow_part', 'assets/sprites/ant_yellow_part.png');
  game.load.image('ant_green_part', 'assets/sprites/ant_green_part.png');
  game.load.image('ant_pink_part', 'assets/sprites/ant_pink_part.png');
  game.load.image('quest_pretzel', 'assets/sprites/yellow_pretzel.png'); //fixme
  game.load.image('yellow_pretzel', 'assets/sprites/yellow_pretzel.png');
  game.load.image('green_pretzel', 'assets/sprites/green_pretzel.png');
  game.load.image('pink_pretzel', 'assets/sprites/pink_pretzel.png');
  game.load.image('yellow_pretzel_stand', 'assets/sprites/yellow_pretzel_stand.png');
  game.load.image('green_pretzel_stand', 'assets/sprites/green_pretzel_stand.png');
  game.load.image('pink_pretzel_stand', 'assets/sprites/pink_pretzel_stand.png');

  game.load.image('area', 'assets/sprites/area.png');
  game.load.image('textbox', 'assets/sprites/textbox.png');

  game.load.image('fire1', 'assets/sprites/fire1.png');
  game.load.image('fire2', 'assets/sprites/fire2.png');
  game.load.image('fire3', 'assets/sprites/fire3.png');
  game.load.image('flame1', 'assets/sprites/flame1.png');
  game.load.image('flame2', 'assets/sprites/flame2.png');
  game.load.image('flame2', 'assets/sprites/flame2.png');
  game.load.image('muzzleflash2', 'assets/sprites/muzzleflash2.png');
  game.load.image('muzzleflash4', 'assets/sprites/muzzleflash4.png');

  game.load.image('old_guy_phot', 'assets/sprites/old_guy_photo.png');
  game.load.image('key', 'assets/sprites/key.png');
};

},{}],37:[function(require,module,exports){
// pretzel-maker.js
const numInsectPartsToCreatePretzel = 3;
const pretzelEjectionY = 60;
const Pretzel = require('./pretzel');

const PretzelMaker = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, this.imageName);
  game.physics.arcade.enable(this);
  this.body.immovable = true;
  this.pretzelPrompt = `Would you like to create a ${this.pretzelColor} pretzel?`;
};
PretzelMaker.prototype = Object.create(Phaser.Sprite.prototype);
PretzelMaker.prototype.constructor = PretzelMaker;

PretzelMaker.prototype.dispensePretzel = function() {
  return new Pretzel(this.game, this.x, this.y + pretzelEjectionY, this.pretzelColor)
}

PretzelMaker.prototype.configPrompt = function(player, textBox, pickupGroup) {
  textBox.displayPrompt(this.pretzelPrompt, [
    {
      message: 'yes',
      onChoose: function() {
        if (player.insectParts[this.pretzelColor] < numInsectPartsToCreatePretzel) {
          textBox.clearPrompt();
          textBox.displayText(`Not enough ${this.pretzelColor} bug parts!\nYou need 3 to create a pretzel.`);
          console.log("not enough pretzel pieces");
        } else if (player.insectParts[this.pretzelColor] >= numInsectPartsToCreatePretzel) {
          console.log(player.insectParts[this.pretzelColor]);
          player.insectParts[this.pretzelColor] = player.insectParts[this.pretzelColor] - numInsectPartsToCreatePretzel;
          textBox.clearPrompt();
          pickupGroup.add(this.dispensePretzel());
        }
        console.log('yes');
        return true;
      }.bind(this),
    },
    {
      message: 'no',
      onChoose: function() {
        textBox.clearPrompt();
        console.log('no');
        return false;
      }.bind(this),
    }]
  );
};

module.exports = PretzelMaker

},{"./pretzel":38}],38:[function(require,module,exports){
// pretzel.js
const Pickup = require('./pickup');

const Pretzel = function(game, x, y, type) {
  this.type = type;
  this.name = type + '_pretzel';

  if(type === 'green') {
    this.hp = 4
  }else if(type === 'pink'){
    this.hp = 8
  }else {
    this.hp = 6
  }

  Pickup.call(this, game, x, y, this.name);

}
Pretzel.prototype = Object.create(Pickup.prototype);
Pretzel.prototype.constructor = Pretzel

Pretzel.prototype.getMetaData = function() {
  return {name: this.name, type: this.type, hp: this.hp}
}
module.exports = Pretzel

},{"./pickup":33}],39:[function(require,module,exports){
// weapon.js
const Pickup = require('./pickup');

const OBJECT_LAYER_NAME = 'Items';

const QuestItem = function(game, x, y, name) {
  Pickup.call(this, game, x, y, name);
  this.type = 'quest';
  this.name = name;
}
QuestItem.prototype = Object.create(Pickup.prototype);
QuestItem.prototype.constructor = QuestItem

QuestItem.prototype.getMetaData = function() {
  return {name: this.name}
}
module.exports = QuestItem


},{"./pickup":33}],40:[function(require,module,exports){
const soundEmitter = new (require('events').EventEmitter);

const soundFiles = {
  'mainloop': 'assets/sounds/mainloop.ogg',
  'fightloop': 'assets/sounds/fightloop.ogg',
  'player_hit': 'assets/sounds/Hit_Hurt44.wav',
  'whoosh': 'assets/sounds/whoosh.wav',
  'hit_enemy': 'assets/sounds/hit_enemy.wav',
  'ant_scream_a': 'assets/sounds/ant_scream_a.wav',
  'ant_scream_b': 'assets/sounds/ant_scream_b.wav',
  'pickup_bug_part': 'assets/sounds/pickup_bug_part.wav',
  'pickup_pretzel': 'assets/sounds/pickup_pretzel.wav',
  'chew': 'assets/sounds/chew.wav',
};

function load(game) {
  Object
    .entries(soundFiles)
    .map(([sound, file]) => game.load.audio(sound, file));

  return {
    init: function(game) {
      sounds = Object.keys(soundFiles)
        .reduce((acc, sound) => {
          acc[sound] = game.add.audio(sound)
          return acc;
        }, {});

      soundEmitter.on("play", function(name, volume, loop) {
        sounds[name].play(null, null, volume, loop);
      });
      soundEmitter.on('stop', function (name) {
        sounds[name].stop();
      });
    }
  };
}

module.exports = {
  load: load,
  play: function(name, volume, loop) {
    soundEmitter.emit("play", name, volume, loop);
  },
  stop: function(name, volume, loop) {
    soundEmitter.emit("stop", name);
  },
  isPlaying: function(name) {
    return sounds[name].isPlaying;
  },
  list: Object.keys(soundFiles)
};

},{"events":1}],41:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"./pickup":33,"dup":2}],42:[function(require,module,exports){
const Player = require('./player');
const BACKGROUND_TILE_LAYER = "BackgroundLayer";
const COLLISION_TILE_LAYER = "CollisionLayer";
const DOORWAY_TILE_LAYER = "DoorwayLayer";
const OUTDOORWAY_TILE_LAYER = "OutDoorwayLayer";
const SCENARY_TILE_LAYER = "ScenaryLayer";
const VOID_TILE_LAYER = "VoidLayer";
const sounds = require('./sounds');

const TILEMAP_CONFIG = {
  'mall_world': {
    'tilemap': "assets/tilemaps/maps/mall_world.json",
    'tilemap_name': "mall_world_tilemap",
    'tileset': "mall_world",
    'tiles': "assets/tilemaps/tiles/mall_world.png",
    'tiles_name': "mall_world_tiles",
  },
  // 'outside_world': {
  //   'tilemap': "assets/tilemaps/maps/outside_world.json",
  //   'tilemap_name': "outside_world_tilemap",
  //   'tileset': "outside_world",
  //   'tiles': "assets/tilemaps/tiles/outside_world.png",
  //   'tiles_name': "outside_world_tiles",
  // },
  // This is used throughout
  'scene_objects': {
    'tileset': "scene_objects",
    'tiles': "assets/tilemaps/tiles/scene_objects.png",
    'tiles_name': "scene_objects_tiles",
  },
};

// map.js
const WorldMap = function(game) {
  this.environmentKey = "mall_world";
  this.setEnvironment(game, this.environmentKey);
}

WorldMap.preload = function(game) {
  for (let env_key in TILEMAP_CONFIG) {
    let env = TILEMAP_CONFIG[env_key];
    if (env['tilemap']) {
      game.load.tilemap(
        env['tilemap_name'],
        env['tilemap'],
        null,
        Phaser.Tilemap.TILED_JSON
      );
    }

    game.load.image(env['tiles_name'], env['tiles']);
  }
}

WorldMap.prototype.getMap = function() {
  return this.map;
}

WorldMap.prototype.getCollisionLayer = function(){
  return this.collisionLayer;
}

WorldMap.prototype.initGameObjectPosition = function(object, layerName, name='init'){
  for (let obj of this.getObjectsLayer(layerName)) {
    if (obj.name == name) {
      object.x = obj.x;
      object.y = obj.y;
    }
  }
}

WorldMap.prototype.getObjects = function() {
  return this.map.objects;
}

WorldMap.prototype.getObjectsLayer = function(layerName) {
  return this.map.objects[layerName];
}

WorldMap.prototype.spawn = function(game, objectClass, callback) {
  const objects = this.getObjectsLayer(objectClass.OBJECT_LAYER_NAME);
  for (let obj of objects) {
    var objInstance = new objectClass(game, obj['x'], obj['y']);
    callback(objInstance);
  }
}

WorldMap.prototype.spawnNpc = function(game, objectClass, callback) {
  const objects = this.getObjectsLayer(objectClass.OBJECT_LAYER_NAME);
  for (let obj of objects) {
    var objInstance = new objectClass(game, obj['x'], obj['y'], obj['name']);
    callback(objInstance);
  }
}

WorldMap.prototype.spawnQuestItem = function(game, objectClass, callback) {
  const objects = this.getObjectsLayer('Items');
  for (let obj of objects) {
    var objInstance = new objectClass(game, obj['x'], obj['y'], obj['name']);
    callback(objInstance);
  }
}

WorldMap.prototype.setEnvironment = function(game, env_key) {
  if (this.map) {
    this.map.destroy();
  }

  // Tilemap object
  this.map = game.add.tilemap(TILEMAP_CONFIG[env_key]['tilemap_name']);
  this.map.addTilesetImage(TILEMAP_CONFIG[env_key]['tileset'], TILEMAP_CONFIG[env_key]['tiles_name']);
  this.map.addTilesetImage(TILEMAP_CONFIG['scene_objects']['tileset'], TILEMAP_CONFIG['scene_objects']['tiles_name']);

  this.voidLayer = this.map.createLayer(VOID_TILE_LAYER);
  this.map.setCollisionByExclusion([], true, VOID_TILE_LAYER);
  // Background layer is the floor, mostly
  this.backgroundlayer = this.map.createLayer(BACKGROUND_TILE_LAYER);

  // Walls, obstacles, etc as part of your surroundings
  this.collisionLayer = this.map.createLayer(COLLISION_TILE_LAYER);
  this.map.setCollisionByExclusion([], true, COLLISION_TILE_LAYER);

  //Change the world size to match the size of this layer
  this.collisionLayer.resizeWorld();
  this.doorwayLayer = this.map.createLayer(DOORWAY_TILE_LAYER);
  this.outDoorwayLayer = this.map.createLayer(OUTDOORWAY_TILE_LAYER);
  this.map.setCollisionByExclusion([], true, DOORWAY_TILE_LAYER);
  this.map.setCollisionByExclusion([], true, OUTDOORWAY_TILE_LAYER);
  this.scenaryLayer = this.map.createLayer(SCENARY_TILE_LAYER);

};

WorldMap.prototype.getDoorwayLayer = function() {
  return this.doorwayLayer;
};

WorldMap.prototype.getOutDoorwayLayer = function() {
  return this.outDoorwayLayer;
};

WorldMap.prototype.getVoidLayer = function() {
  return this.voidLayer;
};

WorldMap.prototype.getEnvironmentKey = function() {
  return this.environmentKey;
};

WorldMap.prototype.setEnvironmentKey = function(envKey) {
  this.environmentKey = envKey;
};

WorldMap.prototype.doorwayHandlerGenerator = function(game) {
  let worldMapRef = this;
  return (function(player, door) {
    if (worldMapRef.getEnvironmentKey() == 'mall_world') {
      worldMapRef.setEnvironmentKey('outside_world');
      sounds.stop('mainloop');
      sounds.play('fightloop', 0.2, true);
    } else {
      worldMapRef.setEnvironmentKey('mall_world');
      sounds.stop('fightloop');
      sounds.play('mainloop', 0.2, true);
    }
    worldMapRef.initGameObjectPosition(player, Player.OBJECT_LAYER_NAME, worldMapRef.getEnvironmentKey());
  });
};

WorldMap.prototype.outDoorwayHandlerGenerator = function(player, layer) {
  return (function(player, layer){
    if (player.quest) {
      if (player.quest.name === 'key'){
        this.map.removeTile(161, 44, layer.layer.name);
        this.map.removeTile(162, 44, layer.layer.name);
        this.map.removeTile(161, 45, layer.layer.name);
        this.map.removeTile(162, 45, layer.layer.name);
      }
    }
  }).bind(this);
};

WorldMap.prototype.constructor = WorldMap;

module.exports = WorldMap

},{"./player":35,"./sounds":40}],43:[function(require,module,exports){
// yellow-pretzel-maker.js
const PretzelMaker = require('./pretzel-maker');

const YellowPretzelMaker = function(game, x, y) {
  this.type = 1;
  this.imageName = 'yellow_pretzel_stand';
  this.pretzelColor = 'yellow';
  PretzelMaker.call(this, game, x, y);
}
YellowPretzelMaker.prototype = Object.create(PretzelMaker.prototype);
YellowPretzelMaker.prototype.constructor = YellowPretzelMaker

module.exports = YellowPretzelMaker


},{"./pretzel-maker":37}]},{},[15]);
