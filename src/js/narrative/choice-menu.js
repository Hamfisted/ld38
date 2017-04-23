const ChoiceMenu = function(game, choices, x, y) {
  Phaser.Sprite.call(this, game, x, y);
  this.choices = choices;

  this.activeAlpha = 1;
  this.inactiveAlpha = 0.5;

  this.choiceTextObjects = [];
  this.highlightedChoiceIndex = 0;


  choices.forEach(function(choice, i) {
    const text = this.game.add.bitmapText(10, 10*i, 'pixel8px', choice.message, 8);
    if (i > 0) {
      text.alpha = this.inactiveAlpha;
    }
    this.choiceTextObjects.push(text);
    this.addChild(text);
  }, this);
};


ChoiceMenu.prototype = Object.create(Phaser.Sprite.prototype);
ChoiceMenu.prototype.constructor = ChoiceMenu;

ChoiceMenu.prototype.onCursorInput = function(direction) {
  if (direction === 'up') {
    this.highlightedChoiceIndex--;
  } else {
    this.highlightedChoiceIndex++;
  }
  if (this.highlightedChoiceIndex < 0) {
    this.highlightedChoiceIndex = this.choices.length - 1;
  } else if (this.highlightedChoiceIndex >= this.choices.length) {
    this.highlightedChoiceIndex = 0;
  }
  this.highlightChoice(this.highlightedChoiceIndex);
};

ChoiceMenu.prototype.highlightChoice = function(index) {
  this.choiceTextObjects.forEach(function(obj) {
    obj.alpha = this.inactiveAlpha;
  }, this);
  this.choiceTextObjects[index].alpha = this.activeAlpha;
};

ChoiceMenu.prototype.selectChoice = function() {
  return this.choices[this.highlightedChoiceIndex].onChoose();
};

module.exports = ChoiceMenu;
