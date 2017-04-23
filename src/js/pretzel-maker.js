// pretzel-maker.js
const TextBox = require('./text-box');

const PretzelMaker = function(game, x, y) {
  this.textString = "PRESS SPACEBAR";
  Phaser.Sprite.call(this, game, x, y, this.imageName);
  game.physics.arcade.enable(this);
  this.body.immovable=true;
}
PretzelMaker.prototype = Object.create(Phaser.Sprite.prototype);
PretzelMaker.prototype.constructor = PretzelMaker;

PretzelMaker.prototype.insertInsectParts = function(insectPart){
  if (insectPart.type === this.type){
    this.numInsects++
  }
  else {
    console.log("wrong insect input")
  }
}
module.exports = PretzelMaker
