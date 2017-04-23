const Ant = require('./ant');

const OBJECT_LAYER_NAME = 'YellowAnts';

const YellowAnt = function(game, x, y) {
  Ant.call(this, game, x, y, 'ant_yellow_flying');
  this.attackSpeed = 100;
  this.wanderSpeed = 70;
};

YellowAnt.prototype = Object.create(Ant.prototype);
YellowAnt.prototype.constructor = YellowAnt;
YellowAnt.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;


module.exports = YellowAnt;
