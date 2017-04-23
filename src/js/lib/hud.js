const { range } = require('./utils');
const HeartContainer = require('./heartContainer');
// const Stomach = require('./stomach');
const Bar = require('./bar');
const ItemContainer = require('./itemContainer');
const InsectPartCounter = require('./insectPartCounter')

function Hud(game, hudDimension, pickupGroup) {


  const { x, y, w, h } = hudDimension;
  const hudGroup = game.make.group();
  const heartSize = 7

  hudGroup.add(Bar(game, hudDimension, 0x000000));

  function playerHud(player) {
    // console.log("player = %j", player)
    const { maxHealth } = player;






    // const stomach = Stomach(game, {x: 10, y: 10, w: 50, h: 20});
    const weaponContainer = ItemContainer(game, {x: 5, y: 5, w: 50, h: 40}, pickupGroup, 'weapon');
    const pretzelContainer = ItemContainer(game, {x: 45, y: 5, w: 50, h: 40}, pickupGroup, 'pretzel');
    const questContainer = ItemContainer(game, {x: 85, y: 5, w: 50, h: 40}, pickupGroup, 'item');

    const yellowInsectPart = InsectPartCounter(game, {x: 120, y: 2, w: 50, h: 15}, 'yellow');
    const greenInsectPart = InsectPartCounter(game, {x: 120, y: 15, w: 50, h: 15}, 'green');
    const pinkInsectPart = InsectPartCounter(game, {x: 120, y: 28, w: 50, h: 15}, 'pink');

    const heartsLocation = { x: 160, y: 35 };

    const heartContainers = range(Math.ceil(maxHealth / 2)).map(function (o) {
      return HeartContainer(game, x + heartsLocation.x + o * heartSize, y + heartsLocation.y);
    });

    heartContainers.map(function (heart) {
      hudGroup.add(heart.group);
    });

    // hudGroup.add(stomach.group);
    hudGroup.add(pretzelContainer.group);
    hudGroup.add(weaponContainer.group);
    hudGroup.add(questContainer.group);
    hudGroup.add(yellowInsectPart.group);
    hudGroup.add(greenInsectPart.group);
    hudGroup.add(pinkInsectPart.group);

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
      // stomach.update(player);
      updateHearts(player);
      pretzelContainer.update(player);
      weaponContainer.update(player);
      questContainer.update(player);
      yellowInsectPart.update(player);
      greenInsectPart.update(player);
      pinkInsectPart.update(player);
    }

    return { update };
  }

  return { playerHud, group: hudGroup };
}

module.exports = Hud;
