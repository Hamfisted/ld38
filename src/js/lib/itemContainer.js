function ItemContainer(game, dimensions, pickupGroup) {
  const itemGroup = game.make.group();
  itemGroup.x = dimensions.x;
  itemGroup.y = dimensions.y;

  const padding = 1;

  const pickupables = pickupGroup.children.map((i) => i.name)

  const spritesPairs = pickupables.map(function (name) {
    const sprite = game.make.sprite(0, 0, name);
    itemGroup.add(sprite);
    return [name, sprite];
  });

  return {
    update: function(player) {
      const { weapon, pretzel } = player;
      const weaponName = weapon && weapon.name;
      const pretzelName = pretzel && pretzel.name;

      spritesPairs.forEach(function ([name, sprite]) {
        sprite.alpha = ((name === weaponName) ? 1 : 0) || ((name === pretzelName) ? 1 : 0);
      });
    },
    group: itemGroup
  }
};

module.exports = ItemContainer;
