const ChoiceMenu = function(game, choices, x, y) {
  Phaser.Sprite.call(this, game, x, y);
  this.choices = choices;

  this.activeFill = '#FFF';
  this.inactiveFill = '#CCC';

  this.style = {
    font: '10px Arial',
    fill: this.activeFill,
    align: 'center',
    wordWrap: true,
    wordWrapWidth: this.width - 20,
  };

  this.choiceTextObjects = [];
  this.highlightedChoiceIndex = 0;


  choices.forEach(function(choice, i) {
    const text = this.game.add.text(10, 10*i, choice.message, this.style);
    if (i > 0) {
      text.fill = this.inactiveFill;
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
    obj.fill = this.inactiveFill;
  }, this);
  this.choiceTextObjects[index].fill = this.activeFill;
};

ChoiceMenu.prototype.selectChoice = function() {
  return this.choices[this.highlightedChoiceIndex].onChoose();
};

module.exports = ChoiceMenu;
