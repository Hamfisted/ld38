function HeartContainer(game, heartDimensions) {
  const { x, y, h } = heartDimensions;



  const heartGroup = game.make.group();
  heartGroup.x = x;
  heartGroup.y = y;


  const fullHeart = game.make.sprite(0, 0, 'hearts42x14', 0);
  const halfHeart = game.make.sprite(0, 0, 'hearts42x14', 1);
  const emptyHeart = game.make.sprite(0, 0, 'hearts42x14', 2);

  const scalingParameter = h / fullHeart.height;

  heartGroup.scale.setTo(scalingParameter , scalingParameter);

  heartGroup.add(fullHeart);
  heartGroup.add(halfHeart);
  heartGroup.add(emptyHeart);

  return {
    update: function(state) {
      fullHeart.alpha = (state === "FULL") ? 1 : 0;
      halfHeart.alpha = (state === "HALF") ? 1 : 0;
      emptyHeart.alpha = (state === "EMPTY") ? 1 : 0;
    },
    group: heartGroup
  }
};

module.exports = HeartContainer;
