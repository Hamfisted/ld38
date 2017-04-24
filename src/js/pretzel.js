// pretzel.js
const Pickup = require('./pickup');

const Pretzel = function(game, x, y, type) {
  this.type = type;
  this.name = type + '_pretzel';

  if(type === 'green') {
    this.hp = 4
  }else if(type === 'pink'){
    this.hp = 8
  }else {
    this.hp = 2
  }

  Pickup.call(this, game, x, y, this.name);

}
Pretzel.prototype = Object.create(Pickup.prototype);
Pretzel.prototype.constructor = Pretzel

Pretzel.prototype.getMetaData = function() {
  return {name: this.name, type: this.type, hp: this.hp}
}
module.exports = Pretzel
