// old-guy-photo.js

const OldGuyPhoto = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'old_guy_photo');
}
OldGuyPhoto.prototype = Object.create(Phaser.Sprite.prototype);
OldGuyPhoto.prototype.constructor = OldGuyPhoto

module.exports = OldGuyPhoto
