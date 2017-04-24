// key.js

const Key = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'key');
}
Key.prototype = Object.create(Phaser.Sprite.prototype);
Key.prototype.constructor = Key

module.exports = Key
