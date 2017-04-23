const { range } = require('./utils');
const HeartContainer = require('./heartContainer');
const Stomach = require('./stomach');
const Bar = require('./bar');
const ItemContainer = require('./itemContainer');

function Hud(game, hudDimension, heartsLocation, pickupGroup) {
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

    const stomach = Stomach(game, {x: 10, y: 10, w: 50, h: 20});
    const pretzelContainer = ItemContainer(game, {x: 80, y: 10, w: 50, h: 20}, pickupGroup, 'pretzel');
    const weaponContainer = ItemContainer(game, {x: 120, y: 10, w: 50, h: 20}, pickupGroup, 'weapon');

    hudGroup.add(stomach.group);
    hudGroup.add(pretzelContainer.group);
    hudGroup.add(weaponContainer.group);

    function drawHeartAtOffsets(heartType, offset, end) {
      heartContainers.slice(offset, end).map(function (heartContainer) {
        heartContainer.update(heartType);
      });
    }

    function updateHearts({ health, maxHealth }) {
      const hearts = health / 2;
      const maxHearts = maxHealth / 2;

      drawHeartAtOffsets('FULL', 0, Math.floor(hearts));
      drawHeartAtOffsets('HALF', Math.floor(hearts), Math.ceil(hearts));
      drawHeartAtOffsets('EMPTY', Math.ceil(hearts), maxHearts);
    }

    function update(player) {
      stomach.update(player);
      updateHearts(player);
      pretzelContainer.update(player);
      weaponContainer.update(player);
    }

    return { update };
  }

  return { playerHud, group: hudGroup };
}

module.exports = Hud;
