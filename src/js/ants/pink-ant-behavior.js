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
