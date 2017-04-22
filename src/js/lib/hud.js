const Hud = (game, hudDimension) => {
  const { x, y, w, h } = hudDimension;

  var graphics = game.add.graphics(x, y);

  graphics.beginFill(0x0000FF);

  // draw a shape
  graphics.moveTo(x + w, y);
  graphics.lineTo(x + w, y + h);
  graphics.lineTo(x, y + h);
  graphics.lineTo(x, y);
  graphics.endFill();

  // const fullHeart = game.make.sprite(0,0, 'hearts', 0);
  // const halfHeart = game.make.sprite(0,0, 'hearts', 1);
  // const emptyHeart = game.make.sprite(0,0, 'hearts', 2);

  // let bmd = game.add.bitmapData(game.width, game.height);
  // bmd.addToWorld();
  // bmd.smoothed = false;

  // function drawHeartAtOffsets(heart, offset, end) {
  //   myGame.Utils.range(offset, end).map(function (o) {
  //     bmd.draw(heart, heartsLocation.x + o * heartSize, heartsLocation.y);
  //   });
  // }

  // function drawHearts({ health, maxHealth }) {
  //   bmd.cls();
  //   drawHeartAtOffsets(fullHeart, 0, Math.floor(health));
  //   drawHeartAtOffsets(halfHeart, Math.floor(health), Math.ceil(health));
  //   drawHeartAtOffsets(emptyHeart, Math.ceil(health), maxHealth);
  // }

}

module.exports = Hud;
