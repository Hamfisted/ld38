// insect-part.js
const Pickup = require('./pickup');

const InsectPart = function(game, x, y, color) {
  this.name = 'insectPart';
  this.color = color;

  this.type = 1;
  if(color === 'yellow') { this.type = 1; }
  if(color === 'green')  { this.type = 2; }
  if(color === 'pink')   { this.type = 3; }

  Pickup.call(this, game, x, y, 'ant_' + this.color + '_part')
}
InsectPart.prototype = Object.create(Pickup.prototype);
InsectPart.prototype.constructor = InsectPart

InsectPart.prototype.getMetaData = function() {
  return {type: this.type, color: this.color}
}
module.exports = InsectPart;
