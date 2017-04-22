function HeartContainer(game, x, y) {

  const heartGroup = game.make.group();
  const fullHeart = game.make.sprite(x, y, 'hearts', 0);
  const halfHeart = game.make.sprite(x, y, 'hearts', 1);
  const emptyHeart = game.make.sprite(x, y, 'hearts', 2);

  heartGroup.add(fullHeart);
  heartGroup.add(halfHeart);
  heartGroup.add(emptyHeart);

  return {
    render: function(state) {
      fullHeart.alpha = (state === "FULL") ? 1 : 0;
      halfHeart.alpha = (state === "HALF") ? 1 : 0;
      emptyHeart.alpha = (state === "EMPTY") ? 1 : 0;
    },
    group: heartGroup
  }
};

module.exports = HeartContainer;
