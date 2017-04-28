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
