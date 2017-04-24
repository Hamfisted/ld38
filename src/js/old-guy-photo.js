// old-guy-photo.js

const QuestItem = require('./quest-item');

const OldGuyPhoto = function(game, x, y) {
  QuestItem.call(this, game, x, y, 'old_guy_photo');
  this.name = 'old_guy_photo';
}
OldGuyPhoto.prototype = Object.create(QuestItem.prototype);
OldGuyPhoto.prototype.constructor = OldGuyPhoto

module.exports = OldGuyPhoto;
