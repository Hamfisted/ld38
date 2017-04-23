const Ant = require('./ant');

const OBJECT_LAYER_NAME = 'PinkAnts';

const PinkAnt = function(game, x, y) {
  Ant.call(this, game, x, y, 'ant_pink_walk');
  this.attackSpeed = 130;
  this.wanderSpeed = 90;
};

PinkAnt.prototype = Object.create(Ant.prototype);
PinkAnt.prototype.constructor = PinkAnt;
PinkAnt.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;


module.exports = PinkAnt;
