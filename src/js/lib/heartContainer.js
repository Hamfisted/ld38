function HeartContainer(game, x, y) {

  const heartGroup = game.add.group();
  const fullHeart = game.add.sprite(x, y, 'hearts', 0);
  const halfHeart = game.add.sprite(x, y, 'hearts', 1);
  const emptyHeart = game.add.sprite(x, y, 'hearts', 2);

  heartGroup.add(fullHeart);
  heartGroup.add(halfHeart);
  heartGroup.add(emptyHeart);

  // heartGroup.alpha = 1;

  console.log("fullHeart")

  return {
    render: function(state) {
      // heartGroup.alpha = 0;

      fullHeart.alpha = (state === "FULL") ? 1 : 0;
      halfHeart.alpha = (state === "HALF") ? 1 : 0;
      emptyHeart.alpha = (state === "EMPTY") ? 1 : 0;

      // debugger
    },

    group: heartGroup
  }
};

module.exports = HeartContainer;
