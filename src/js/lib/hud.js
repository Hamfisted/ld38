const { range } = require('./utils');
const HeartContainer = require('./heartContainer');

const Hud = (game, hudDimension, heartsLocation) => {
  const { x, y, w, h } = hudDimension;

  const hudGroup = game.add.group();
  hudGroup.fixedToCamera = true;

  var graphics = game.make.graphics(x, y);

  graphics.beginFill(0x0000FF);

  const heartSize = 7

  // draw a shape
  graphics.moveTo(x + w, y);
  graphics.lineTo(x + w, y + h);
  graphics.lineTo(x, y + h);
  graphics.lineTo(x, y);
  graphics.endFill();

  hudGroup.add(graphics);

  const playerHud = ({ maxHealth }) => {
    const heartContainers = range(Math.ceil(maxHealth / 2)).map(function (o) {
      return HeartContainer(game, x + heartsLocation.x + o * heartSize, y + heartsLocation.y);
    });

    heartContainers.map(function (heart) {
      hudGroup.add(heart.group);
    });

    function drawHeartAtOffsets(heartType, offset, end) {
      heartContainers.slice(offset, end).map(function (heartContainer) {
        heartContainer.render(heartType);
      })
    }

    function drawHearts({ health, maxHealth }) {
      const hearts = health / 2;
      const maxHearts = maxHealth / 2;

      drawHeartAtOffsets('FULL', 0, Math.floor(hearts));
      drawHeartAtOffsets('HALF', Math.floor(hearts), Math.ceil(hearts));
      drawHeartAtOffsets('EMPTY', Math.ceil(hearts), maxHearts);
    }

    return {
      render: (player) => { drawHearts(player) }
    }
  }

  return { playerHud }
}

module.exports = Hud;
