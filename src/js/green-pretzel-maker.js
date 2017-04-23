// green-pretzel-maker.js
const PretzelMaker = require('./pretzel-maker');

const GreenPretzelMaker = function(game, x, y) {
  this.type = 2;
  this.imageName = 'greenPretzelMaker';
  this.pretzelColor = 'green';
  PretzelMaker.call(this, game, x, y)
}
GreenPretzelMaker.prototype = Object.create(PretzelMaker.prototype);
GreenPretzelMaker.prototype.constructor = GreenPretzelMaker

module.exports = GreenPretzelMaker

