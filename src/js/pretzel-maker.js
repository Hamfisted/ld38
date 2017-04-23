// pretzel-maker.js

const PretzelMaker = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, this.imageName);
  game.physics.arcade.enable(this);
  this.body.immovable = true;
  this.textString = `Would you like to create a ${this.pretzelColor} pretzel?`;
};
PretzelMaker.prototype = Object.create(Phaser.Sprite.prototype);
PretzelMaker.prototype.constructor = PretzelMaker;

PretzelMaker.prototype.insertInsectParts = function(insectPart) {
  if (insectPart.type === this.type) {
    this.numInsects++;
  }
  else {
    console.log("wrong insect input");
  }
}

PretzelMaker.prototype.configPrompt = function(player, textBox) {
  textBox.displayPrompt(this.textString, [
    {
      message: 'yes',
      onChoose: function() {
        // this.insertInsectParts(player)
        console.log('yes');
        return true;
      },
    },
    {
      message: 'no',
      onChoose: function() {
        console.log('no');
        return true;
      },
    },
  ]);
};

module.exports = PretzelMaker
