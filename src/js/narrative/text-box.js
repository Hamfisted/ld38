//text-box.js
const ChoiceMenu = require('./choice-menu');

const TextBox = function(game, x, y, player) {
  Phaser.Sprite.call(this, game, x, y, 'textbox');
  this.player = player;
  this.visible = false;
  this.isPrompting = false;
  this.textObj = this.game.add.bitmapText(10, 10, 'pixel8px', '', 8);
  this.textObj.maxWidth = this.width - 20;
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
  this.releasePlayer();
};

TextBox.prototype.displayPrompt = function(textString, choices) {
  this.isPrompting = true;
  this.displayText(textString)
  this.choiceMenu = new ChoiceMenu(this.game, choices, 10, 40);
  this.addChild(this.choiceMenu);
};

TextBox.prototype.clearPrompt = function() {
  this.isPrompting = false;
  this.reset();
  this.removeChild(this.choiceMenu);
  this.choiceMenu.destroy();
  this.choiceMenu = null;
};

TextBox.prototype.displayText = function(textString) {
  this.player.isInDialogue = true;
  this.visible = true;
  this.textString = textString;
  this.textObj.text = '';
  this.addCharByChar(this.textObj, textString);
};

TextBox.prototype.update = function() {
  // Input handling
  if (!this.visible){return;}
  const interactionKey = Phaser.Keyboard.SPACEBAR;
  const upKey = Phaser.Keyboard.UP;
  const downKey = Phaser.Keyboard.DOWN;

  const isInteractionKeyDown = this.game.input.keyboard.isDown(interactionKey);
  const isUpKeyDown = this.game.input.keyboard.isDown(upKey);
  const isDownKeyDown = this.game.input.keyboard.isDown(downKey);

  if (this.wasInteractionKeyDown && !isInteractionKeyDown) {
    console.log("space was down but no longer")
    this.onKeyUp();
  } else if (this.wasUpKeyDown && !isUpKeyDown) {
    console.log("up key was down and no longer")
    this.onCursorInput('up');
  } else if (this.wasDownKeyDown && !isDownKeyDown) {
    console.log("down key was down and no longer")
    this.onCursorInput('down');
  }
  this.wasInteractionKeyDown = isInteractionKeyDown;
  this.wasUpKeyDown = isUpKeyDown;
  this.wasDownKeyDown = isDownKeyDown;
};

TextBox.prototype.releasePlayer = function() {
  this.player.isInDialogue = false;
}

TextBox.prototype.onKeyUp = function() {
  if (this.timer.length === 0) { // animation finished
    if (this.isPrompting) {
      const success = this.choiceMenu.selectChoice();
    } else {
      this.reset();
    }
  }
  if (this.isInDialogue) {
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
