// pretzel-maker.js
const numInsectPartsToCreatePretzel = 3;
const pretzelEjectionY = 60;
const Pretzel = require('./pretzel');

const PretzelMaker = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, this.imageName);
  game.physics.arcade.enable(this);
  this.body.immovable = true;
  this.pretzelPrompt = `Would you like to create a ${this.pretzelColor} pretzel?`;
};
PretzelMaker.prototype = Object.create(Phaser.Sprite.prototype);
PretzelMaker.prototype.constructor = PretzelMaker;

PretzelMaker.prototype.dispensePretzel = function() {
  return new Pretzel(this.game, this.x, this.y + pretzelEjectionY, this.pretzelColor)
}

PretzelMaker.prototype.configPrompt = function(player, textBox, pickupGroup) {
  textBox.displayPrompt(this.pretzelPrompt, [
    {
      message: 'yes',
      onChoose: function() {
        if (player.insectParts[this.pretzelColor] < numInsectPartsToCreatePretzel) {
          textBox.clearPrompt();
          textBox.displayText(`Not enough ${this.pretzelColor} pretzels!`);
          console.log("not enough pretzel pieces");
        } else if (player.insectParts[this.pretzelColor] >= numInsectPartsToCreatePretzel) {
          console.log(player.insectParts[this.pretzelColor]);
          player.insectParts[this.pretzelColor] = player.insectParts[this.pretzelColor] - numInsectPartsToCreatePretzel;
          textBox.clearPrompt();
          pickupGroup.add(this.dispensePretzel());
        }
        console.log('yes');
        return true;
      }.bind(this),
    },
    {
      message: 'no',
      onChoose: function() {
        textBox.clearPrompt();
        console.log('no');
        return false;
      }.bind(this),
    }]
  );
};

module.exports = PretzelMaker
