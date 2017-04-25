function behaviorRunner(ant, behaviorArray, startingBehavior) {
  const prevBehavior = startingBehavior;

  const getState = (s) => behaviorArray.filter((b) => b.state === s)[0];

  let currentBehavior = getState(startingBehavior);

  let start = true;

  return {
    update() {
      const transitionBehavior = getState(currentBehavior.to(ant) || currentBehavior.state);


      if (start || (transitionBehavior.state !== currentBehavior.state)) { transitionBehavior.start(ant);}
      start = false;
      currentBehavior = transitionBehavior;
      transitionBehavior.update(ant);
    }
  }
}

module.exports = behaviorRunner;
