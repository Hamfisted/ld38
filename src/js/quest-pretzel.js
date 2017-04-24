const QuestItem = require('./quest-item');

const QuestPretzel = function(game, x, y) {
  QuestItem.call(this, game, x, y, 'yellow_pretzel');
  this.type = 'quest';
  this.name = 'yellow_pretzel';
};
QuestPretzel.prototype = Object.create(QuestItem.prototype);
QuestPretzel.prototype.constructor = QuestPretzel;

module.exports = QuestPretzel;
