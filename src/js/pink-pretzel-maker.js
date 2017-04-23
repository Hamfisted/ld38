// pink-pretzel-maker.js
const PretzelMaker = require('./pretzel-maker');

const PinkPretzelMaker = function(game, x, y) {
  this.type = 3;
  this.imageName = 'pinkPretzelMaker';
  PretzelMaker.call(this, game, x, y)
}
PinkPretzelMaker.prototype = Object.create(PretzelMaker.prototype);
PinkPretzelMaker.prototype.constructor = PinkPretzelMaker

module.exports = PinkPretzelMaker
