// player.js
const Player = function(game) {
  const x = 100;
  const y = 100;
  Phaser.Sprite.call(this, game, x, y, 'player');
}
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.updateControls = function (cursors) {
};
module.exports = Player
