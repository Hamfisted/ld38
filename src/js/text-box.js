//text-box.js
const TextBox = function(game, x, y, player) {
  Phaser.Sprite.call(this, game, x, y, 'textbox');
  this.player = player;
  this.visible = false;
  this.isPrompting = false;
  this.style = {font: "10px Arial", fill: "#fff",
        align: "center",
        wordWrap: true, wordWrapWidth: this.width - 20
  };
  game.physics.arcade.enable(this);
}

TextBox.prototype = Object.create(Phaser.Sprite.prototype);
TextBox.prototype.constructor = TextBox;

TextBox.prototype.displayPrompt = function(textString) {
  this.player.isInDialogue = true;
  this.isPrompting = true;
  this.visible = true;
  let text = this.game.add.text(10, 10, textString, this.style);
  this.addChild(text);
}

TextBox.prototype.displayText = function(textString) {
  this.player.isInDialogue = true;
  this.visible = true;
  let text = this.game.add.text(10, 10, textString, this.style);
  this.addChild(text);
}

TextBox.prototype.update = function(){
  if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
    this.isPrompting = false;
    this.player.isInDialogue = false;
    this.visible = false;
  }
}
module.exports = TextBox
