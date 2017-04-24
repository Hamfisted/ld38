// a clone of behavior.lua from knife
function StateManager(game, states) {
  Phaser.Sprite.call(this, game, null, null, null);
  this.states = states;
  this.state = 'default';
  this.index = 0;
  this.timer = this.game.time.create(false);
  this.timer.start();
  this.currentFrame = this.getCurrentFrame();
  this.performAction();
  this.addTimerEvent();
}

StateManager.prototype = Object.create(Phaser.Sprite.prototype);
StateManager.prototype.constructor = StateManager;

StateManager.prototype.setState = function (state, index) {
  this.timer.removeAll();
  this.state = state; // state name
  this.index = index || 0;
  this.currentFrame = this.getCurrentFrame();
  this.performAction();
  this.addTimerEvent();
  return this;
};

StateManager.prototype.addTimerEvent = function() {
  this.timer.add(this.currentFrame.duration, function () {
    this.advanceFrame();
    this.performAction();
  }, this);
};

StateManager.prototype.advanceFrame = function () {
  const nextState = this.currentFrame.after;
  let nextIndex = this.index + 1;
  const maxIndex = this.states[this.state].length - 1;

  if (nextState) {
    this.state = nextState;
    nextIndex = 0;
  } else if (nextIndex > maxIndex) {
    nextIndex = 0;
  }

  this.index = nextIndex;
  this.currentFrame = this.getCurrentFrame();
};

StateManager.prototype.performAction = function () {
  if (this.currentFrame.action) {
    this.currentFrame.action();
  }
};

StateManager.prototype.getCurrentFrame = function () {
  return this.states[this.state][this.index];
};

module.exports = StateManager;

