//cutscene.js
const StateManager = require('./state-manager');

function Cutscene(game, inputState, textBox) {
  Phaser.Sprite.call(this, game, null, null, null);

  this.inputState = inputState;
  this.textBox = textBox;
  this.reset();

  this.states = {
    default: [
      { duration: 0, after: 'enterPrintNarrativeLine' },
    ],
    enterPrintNarrativeLine: [
      {
        duration: Math.infinity,
        action: function () {
          this.currentDialogueIndex++;
          if (!this.lines[this.currentDialogueIndex]) {
            this.stateManager.setState('end');
          } else {
            this.stateManager.setState('printNarrativeLine');
          }
        }.bind(this)
      },
    ],
    printNarrativeLine: [
      {
        duration: Math.infinity,
        skipTo: 'narrativeLineWaiting',
        action: function() {
          this.textBox.displayText(this.lines[this.currentDialogueIndex]);
        }.bind(this)
      },
    ],
    // when entire line is printed out
    narrativeLineWaiting: [
      {
        duration: Math.infinity,
        skipTo: 'enterPrintNarrativeLine',
        action: function() {
          this.textBox.skipAnimatingText();
        }.bind(this)
      },
    ],
    end: [
      {
        duration: 0,
        action: function () {
          if (this.callback) {
            this.callback();
          }
          this.textBox.reset();
          this.reset(0);
        }.bind(this)
      },
    ],
  };
}

Cutscene.prototype = Object.create(Phaser.Sprite.prototype);
Cutscene.prototype.constructor = Cutscene;

Cutscene.prototype.reset = function () {
  this.currentDialogueIndex = -1;
  this.callback = null;

  if (this.stateManager) {
    this.stateManager.destroy();
  }
};

Cutscene.prototype.playLines = function (lines, callback) {
  this.lines = lines;
  this.stateManager = new StateManager(this.game, this.states);
  this.callback = callback;
};

Cutscene.prototype.update = function () {
  if (!this.stateManager) {
    return;
  }

  if (this.inputState.keys.interact.wasJustReleased) {
    this.skipTo();
  } else if (this.stateManager.state === 'printNarrativeLine' && this.textBox.timer.length === 0) {
    this.skipTo();
  }
};

Cutscene.prototype.skipTo = function () {
  if (this.stateManager.currentFrame.skipTo) {
    this.stateManager.setState(this.stateManager.currentFrame.skipTo);
  }
};

module.exports = Cutscene;
