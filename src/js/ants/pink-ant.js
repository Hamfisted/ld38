const Ant = require('./ant');

const OBJECT_LAYER_NAME = 'PinkAnts';

const PinkAnt = function(game, x, y) {
  this.color = 'pink'
  this.spriteName = 'ant_pink_walk';
  this.sprite = Ant.call(this, game, x, y, this.spriteName);
  this.attackSpeed = 130;
  this.wanderSpeed = 90;
  this.health = 3;
  this.damageAmount = 2;
};

PinkAnt.prototype = Object.create(Ant.prototype);
PinkAnt.prototype.constructor = PinkAnt;
PinkAnt.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;


module.exports = PinkAnt;
