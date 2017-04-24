const questDefinitions = [
  // 0 starting state
  {
    npcLines: [["debug"]],
    isComplete: function(questState, player) {
      return true;
    },
    successLines: [
      "Welcome! You're the first person I’ve seen in... a week? Two weeks?",
      "Doesn't matter. Welcome!",
    ],
    onComplete: function(questState, player) {
      questState.hasTalkedToNpc = true;
    },
  },
  // give him a quest pretzel
  // he gives you a weapon
  {
    npcLines: [
      ["You know it hasn't felt like I've had a pretzel since 1958."],
      ["I don't have many teeth, but man I want to gum on a pretzel!"],
      ["Can you hear that? My stomach is growling louder than that locomotive I took to the mines in '42."],
    ],
    successLines: [
      "Eating this makes me feel like pacman!",
      "Here, take this so you can go outside. *programmer writing*",
    ],
    isComplete: function(questState, player) {
      return questState.hasPickedUpQuestPretzel;
    },
    onComplete: function(questState, player) {
      questState.removeQuestItem();
      questState.giveWeaponToPlayer('hockey_stick');
      // todo: spawn hockey stick beside npc
    },
  },
  {
    npcLines: [
      ["You know it feels like I've had a pretzel since 1958."],
      ["I don't have many teeth, but man I want to gum on a pretzel!"],
      ["Can you hear that? My stomach is growling louder than that locomotive I took to the mines in '42."],
    ],
    isComplete: function(questState, player) {
      return false;
    }
  },
];

module.exports = questDefinitions;
