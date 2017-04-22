// weapon.js
const Pickup = require('./pickup');

const Weapon = function(game, x, y, name) {
  Pickup.call(this, game, x, y, name)
  this.name = name
}
Weapon.prototype = Object.create(Pickup.prototype);
Weapon.prototype.constructor = Weapon

Weapon.prototype.getMetaData = function() {
  return {name: this.name}
}
module.exports = Weapon

