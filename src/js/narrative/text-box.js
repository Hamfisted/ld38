//text-box.js
const ChoiceMenu = require('./choice-menu');

const TextBox = function(game, x, y, player) {
  Phaser.Sprite.call(this, game, x, y, 'textbox');
  this.player = player;
  this.visible = false;
  this.isPrompting = false;
  this.style = {
    font: '10px Arial',
    fill: '#fff',
    align: 'center',
    wordWrap: true,
    wordWrapWidth: this.width - 20,
  };
  this.textObj = this.game.add.text(10, 10, '', this.style);
  this.addChild(this.textObj);

  // text animation timer
  this.timer = this.game.time.create(false);
  this.timer.start();

  this.wasInteractionKeyDown = false;
  this.wasUpKeyDown = false;
  this.wasDownKeyDown = false;
};

TextBox.prototype = Object.create(Phaser.Sprite.prototype);
TextBox.prototype.constructor = TextBox;

TextBox.prototype.reset = function() {
  this.visible = false;
  this.textString = '';
  this.textObj.text = '';
};

TextBox.prototype.displayPrompt = function(textString, choices) {
  this.player.isInDialogue = true;
  this.isPrompting = true;
  this.visible = true;
  this.textString = textString;
  this.addCharByChar(this.textObj, textString);

  this.choiceMenu = new ChoiceMenu(this.game, choices, 10, 40);
  this.addChild(this.choiceMenu);
};

TextBox.prototype.clearPrompt = function() {
  this.isPrompting = false;
  this.player.isInDialogue = false;
  this.reset();
};

TextBox.prototype.displayText = function(textString) {
  this.player.isInDialogue = true;
  this.visible = true;
  this.textString = textString;
  this.addCharByChar(this.textObj, textString);
};

TextBox.prototype.update = function() {
  // Input handling
  const interactionKey = Phaser.Keyboard.SPACEBAR;
  const upKey = Phaser.Keyboard.UP;
  const downKey = Phaser.Keyboard.DOWN;

  const isInteractionKeyDown = this.game.input.keyboard.isDown(interactionKey);
  const isUpKeyDown = this.game.input.keyboard.isDown(upKey);
  const isDownKeyDown = this.game.input.keyboard.isDown(downKey);

  if (this.wasInteractionKeyDown && !isInteractionKeyDown) {
    this.onKeyUp();
  } else if (this.wasUpKeyDown && !isUpKeyDown) {
    this.onCursorInput('up');
  } else if (this.wasDownKeyDown && !isDownKeyDown) {
    this.onCursorInput('down');
  }
  this.wasInteractionKeyDown = isInteractionKeyDown;
  this.wasUpKeyDown = isUpKeyDown;
  this.wasDownKeyDown = isDownKeyDown;
};

TextBox.prototype.onKeyUp = function() {
  if (this.timer.length === 0) { // animation finished
    if (this.isPrompting) {
      const success = this.choiceMenu.selectChoice();
      if (success) {
        this.clearPrompt();
      } else {
        // do nothing because it was an invalid choice
      }
    }
  }

  if (this.isPrompting) {
    this.skipAnimatingText();
  }
};

TextBox.prototype.onCursorInput = function(direction) {
  if (!this.choiceMenu) { return; }
  this.choiceMenu.onCursorInput(direction);
};

TextBox.prototype.skipAnimatingText = function() {
  this.timer.removeAll();
  this.textObj.text = this.textString;
};

// Add text, character by character
TextBox.prototype.addCharByChar = function(textObj, textString, ms = 20) {
  let totalTime = 0;
  // loop through each character of the custom text
  // debugger;
  for (let i = 0, txtLen = textString.length; i < txtLen; i++) {
    this.timer.add(totalTime, function() {
      // add the next character
      this.textObj.text += this.textString[this.i];
    }, { textObj: textObj, textString: textString, i: i }); // for scoping purposes
    // the next character will appear at this time
    totalTime += ms;
  }
};


module.exports = TextBox;