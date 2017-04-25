const QuestItem = require('./quest-item');

const QuestPretzel = function(game, x, y) {
  QuestItem.call(this, game, x, y, 'quest_pretzel');
  this.type = 'quest';
  this.name = 'quest_pretzel';
};
QuestPretzel.prototype = Object.create(QuestItem.prototype);
QuestPretzel.prototype.constructor = QuestPretzel;

module.exports = QuestPretzel;
