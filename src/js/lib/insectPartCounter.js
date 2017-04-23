function insectPartCounter(game, dimensions, insectPartColor) {
  const itemGroup = game.make.group();
  itemGroup.x = dimensions.x;
  itemGroup.y = dimensions.y;
  itemGroup.height = dimensions.h;

  const height = dimensions.h;

  const style = {
    font: height + 'px Arial',
    fill: '#fff',
    align: 'center',
    wordWrap: true
  };

  const textObj = game.add.text(0, 0, '0 x', style);

  const sprite = game.make.sprite(20, 0, 'ant_' + insectPartColor + '_part');
  const scalingParameter = height / sprite.height;
  sprite.scale.setTo(scalingParameter , scalingParameter);

  itemGroup.add(textObj)
  itemGroup.add(sprite)

  return {
    update: function(player) {
      const number = player.insectParts[insectPartColor];
      textObj.text = number + " x";
    },
    group: itemGroup
  }
};

module.exports = insectPartCounter;