// yellow-pretzel-maker.js
const PretzelMaker = require('./pretzel-maker');

const YellowPretzelMaker = function(game, x, y) {
  this.type = 1;
  this.imageName = 'yellow_pretzel_stand';
  this.pretzelColor = 'yellow';
  PretzelMaker.call(this, game, x, y);
}
YellowPretzelMaker.prototype = Object.create(PretzelMaker.prototype);
YellowPretzelMaker.prototype.constructor = YellowPretzelMaker

module.exports = YellowPretzelMaker

