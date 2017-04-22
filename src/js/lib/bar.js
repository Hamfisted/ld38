function Bar(game, { x, y, w, h }, color) {
  var graphics = game.make.graphics(x, y);

  graphics.beginFill(color);

  // draw a shape
  graphics.moveTo(x    , y    );
  graphics.lineTo(x + w, y    );
  graphics.lineTo(x + w, y + h);
  graphics.lineTo(x    , y + h);
  graphics.lineTo(x    , y    );
  graphics.endFill();

  return graphics
};

module.exports = Bar;
