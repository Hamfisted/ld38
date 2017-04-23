// insect-part.js
const Pickup = require('./pickup');

const InsectPart = function(game, x, y, type) {



  this.type = type
  this.name = 'insectPart';
  if (this.type === 1){
    this.color = 'yellow'
  }
  else if (this.type === 2){
    this.color = 'green'
  }
  else if (this.type === 3){
    this.color = 'pink'
  }

  Pickup.call(this, game, x, y, 'ant_' + this.color + '_part')
}
InsectPart.prototype = Object.create(Pickup.prototype);
InsectPart.prototype.constructor = InsectPart

InsectPart.prototype.getMetaData = function() {
  return {type: this.type, color: this.color}
}
module.exports = InsectPart;
