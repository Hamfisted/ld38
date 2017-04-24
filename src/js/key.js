// key.js
const QuestItem = require('./quest-item');

const Key = function(game, x, y) {
  QuestItem.call(this, game, x, y, 'key')
  this.type = 'quest';
  this.name = 'key';
}
Key.prototype = Object.create(QuestItem.prototype);
Key.prototype.constructor = Key

module.exports = Key
