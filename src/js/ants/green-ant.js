const Ant = require('./ant');

const OBJECT_LAYER_NAME = 'GreenAnts';

const GreenAnt = function(game, x, y) {
  this.color = 'green';
  this.spriteName = 'ant_green_walk';
  this.sprite = Ant.call(this, game, x, y, this.spriteName);
  this.attackSpeed = 90;
  this.wanderSpeed = 50;
  this.health = 5;
};

GreenAnt.prototype = Object.create(Ant.prototype);
GreenAnt.prototype.constructor = GreenAnt;
GreenAnt.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;


module.exports = GreenAnt;
