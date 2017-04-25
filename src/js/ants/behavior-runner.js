function behaviorRunner(ant, behaviorArray, startingBehavior) {
  const prevBehavior = startingBehavior;

  const getState = (s) => behaviorArray.filter((b) => b.state === s)[0];

  let currentBehavior = getState(startingBehavior);

  return {
    update() {
      const transitionBehavior = getState(currentBehavior.to(ant) || currentBehavior.state);
      if (transitionBehavior.state !== currentBehavior.state) { transitionBehavior.start(ant);}
      currentBehavior = transitionBehavior;
      transitionBehavior.update(ant);
    }
  }
}

module.exports = behaviorRunner;
