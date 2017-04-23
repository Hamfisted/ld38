// weapon.js
const Pickup = require('./pickup');

const QuestItem = function(game, x, y, name) {
  Pickup.call(this, game, x, y, name);
  this.type = 'quest';
  this.name = name;
}
QuestItem.prototype = Object.create(Pickup.prototype);
QuestItem.prototype.constructor = QuestItem

QuestItem.prototype.getMetaData = function() {
  return {name: this.name}
}
module.exports = QuestItem

