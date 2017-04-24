const Ant = require('./ant');

const OBJECT_LAYER_NAME = 'YellowAnts';

const YellowAnt = function(game, x, y) {
  this.spriteName = 'ant_yellow_flying';
  this.sprite = Ant.call(this, game, x, y, this.spriteName);
  this.attackSpeed = 100;
  this.wanderSpeed = 70;
  this.health = 1;
};

YellowAnt.prototype = Object.create(Ant.prototype);
YellowAnt.prototype.constructor = YellowAnt;
YellowAnt.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;


module.exports = YellowAnt;
