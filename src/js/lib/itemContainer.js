function ItemContainer(game, dimensions, pickupGroup, itemType) {
  const itemGroup = game.make.group();
  itemGroup.x = dimensions.x;
  itemGroup.y = dimensions.y;

  const pickupables = pickupGroup.children.map((i) => i.name)

  const spritesPairs = pickupables.map(function (name) {
    const sprite = game.make.sprite(0, 0, name);
    itemGroup.add(sprite);
    return [name, sprite];
  });

  return {
    update: function(player) {
      const pickupName = player[itemType] && player[itemType].name;

      spritesPairs.forEach(function ([name, sprite]) {
        sprite.alpha = ((name === pickupName) ? 1 : 0);
      });
    },
    group: itemGroup
  }
};

module.exports = ItemContainer;
