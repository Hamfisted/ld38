// pretzel.js
const Pickup = require('./pickup');

const Pretzel = function(game, x, y, type) {
  Pickup.call(this, game, x, y, 'green_pretzel');
  this.name = 'pretzel'
  this.type = type
  if (type === 1){
    this.hp = 10
  }
  else if (type === 2){
    this.hp = 20
  }
  else {
    this.hp = 0
  }
}
Pretzel.prototype = Object.create(Pickup.prototype);
Pretzel.prototype.constructor = Pretzel

Pretzel.prototype.getMetaData = function() {
  return {name: this.name, type: this.type, hp: this.hp}
}
module.exports = Pretzel
