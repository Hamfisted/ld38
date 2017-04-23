function insectPartCounter(game, dimensions, insectPartColor) {
  const itemGroup = game.make.group();
  itemGroup.x = dimensions.x;
  itemGroup.y = dimensions.y;
  itemGroup.height = dimensions.h;

  const height = dimensions.h;

  const scaleInteger = Math.floor(dimensions.h / 8);
  const numberSize = (scaleInteger * 8);
  const textHeight = Math.floor((height - numberSize) / 2);

  const textObj = game.add.bitmapText(17, textHeight, 'pixel8px', 'x 0', numberSize);

  const sprite = game.make.sprite(0, 0, 'ant_' + insectPartColor + '_part');
  const scalingParameter = height / sprite.height;
  sprite.scale.setTo(scalingParameter , scalingParameter);

  itemGroup.add(sprite)
  itemGroup.add(textObj)

  return {
    update: function(player) {
      const number = player.insectParts[insectPartColor];
      textObj.text = "x " + number;
    },
    group: itemGroup
  }
};

module.exports = insectPartCounter;
