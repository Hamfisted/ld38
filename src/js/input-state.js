function InputState(game) {
  this.game = game;
  this.keyMap = {
    interact: [Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.ENTER],
    item: [Phaser.Keyboard.F],
    up: [Phaser.Keyboard.UP, Phaser.Keyboard.W, Phaser.Keyboard.Z], // french people
    down: [Phaser.Keyboard.DOWN, Phaser.Keyboard.S],
    left: [Phaser.Keyboard.LEFT, Phaser.Keyboard.A, Phaser.Keyboard.Q], // french people
    right: [Phaser.Keyboard.RIGHT, Phaser.Keyboard.D],
    debug: [Phaser.Keyboard.T],
    restart: [Phaser.Keyboard.R],
  };

  this.keys = {};
  Object.keys(this.keyMap).forEach(function (key) {
    this.keys[key] = { isDown: false, _wasDown: false, wasJustReleased: false };
  }, this);
}

InputState.prototype.update = function update() {
  Object.keys(this.keyMap).forEach(function(action) {
    const keyState = this.keys[action];
    const wasDown = keyState.isDown;

    keyState.isDown = false;
    this.keyMap[action].forEach(function (keyCode) {
      keyState.isDown = keyState.isDown || this.game.input.keyboard.isDown(keyCode);
    }, this);

    keyState.wasJustReleased = wasDown && !keyState.isDown;
  }, this);
};

module.exports = InputState;
