const Ant = require('./ant');

const OBJECT_LAYER_NAME = 'GreenAnts';

const GreenAnt = function(game, x, y) {
  Ant.call(this, game, x, y, 'ant_green_walk');
};

GreenAnt.prototype = Object.create(Ant.prototype);
GreenAnt.prototype.constructor = GreenAnt;
GreenAnt.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;


module.exports = GreenAnt;
