const { range } = require('./utils');
const HeartContainer = require('./heartContainer');
const Stomach = require('./stomach');
const Bar = require('./bar');

const Hud = (game, hudDimension, heartsLocation) => {
  const { x, y, w, h } = hudDimension;
  const hudGroup = game.make.group();
  const heartSize = 7

  hudGroup.add(Bar(game, hudDimension, 0x0000FF));

  function playerHud(player) {
    // console.log("player = %j", player)

    const { maxHealth } = player;
    const heartContainers = range(Math.ceil(maxHealth / 2)).map(function (o) {
      return HeartContainer(game, x + heartsLocation.x + o * heartSize, y + heartsLocation.y);
    });

    heartContainers.map(function (heart) {
      hudGroup.add(heart.group);
    });

    const stomach = Stomach(game, {x: 10, y: 10, w: 50, h: 20})

    hudGroup.add(stomach.group);

    function drawHeartAtOffsets(heartType, offset, end) {
      heartContainers.slice(offset, end).map(function (heartContainer) {
        heartContainer.render(heartType);
      });
    }

    function drawHearts({ health, maxHealth }) {
      const hearts = health / 2;
      const maxHearts = maxHealth / 2;

      drawHeartAtOffsets('FULL', 0, Math.floor(hearts));
      drawHeartAtOffsets('HALF', Math.floor(hearts), Math.ceil(hearts));
      drawHeartAtOffsets('EMPTY', Math.ceil(hearts), maxHearts);
    }

    function drawStomach(player) {
      stomach.render(player);
    }

    function render(player) {
      drawHearts(player);
      drawStomach(player);
    }

    return { render };
  }

  return { playerHud, group: hudGroup };
}

module.exports = Hud;
