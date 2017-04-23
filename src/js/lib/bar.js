function Bar(game, { x, y, w, h }, color) {
  var graphics = game.make.graphics(0,0);

  graphics.beginFill(color);
  graphics.drawRect(x, y, w, h);
  graphics.endFill();

  return graphics
};

module.exports = Bar;
