const { range } = require('./utils');

const Hud = (game, hudDimension, heartsLocation) => {
  const { x, y, w, h } = hudDimension;

  var graphics = game.add.graphics(x, y);

  graphics.beginFill(0x0000FF);

  const heartSize = 7

  // draw a shape
  graphics.moveTo(x + w, y);
  graphics.lineTo(x + w, y + h);
  graphics.lineTo(x, y + h);
  graphics.lineTo(x, y);
  graphics.endFill();

  const fullHeart = game.make.sprite(0,0, 'hearts', 0);
  const halfHeart = game.make.sprite(0,0, 'hearts', 1);
  const emptyHeart = game.make.sprite(0,0, 'hearts', 2);

  let bmd = game.add.bitmapData(game.width, game.height);
  bmd.addToWorld();
  bmd.smoothed = false;

  const playerHud = (player) => {
    function drawHeartAtOffsets(heart, offset, end) {
      range(offset, end).map(function (o) {
        bmd.draw(heart, x + heartsLocation.x + o * heartSize, y + heartsLocation.y);
      });
    }

    function drawHearts({ health, maxHealth }) {
      bmd.cls();

      const hearts = health / 2;
      const maxHearts = maxHealth / 2;

      drawHeartAtOffsets(fullHeart, 0, Math.floor(hearts));
      drawHeartAtOffsets(halfHeart, Math.floor(hearts), Math.ceil(hearts));
      drawHeartAtOffsets(emptyHeart, Math.ceil(hearts), maxHearts);
    }

    return {
      render: () => { drawHearts(player); }
    }
  }

  return { playerHud }
}

module.exports = Hud;
