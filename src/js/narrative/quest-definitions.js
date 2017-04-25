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
      ["I don't have many teeth, but man I want to gum on a pretzel!"],
      ["Can you hear that? My stomach is growling louder than that locomotive I took to the mines in '42."],
    ],
    successLines: [
      "You know it feels like I haven't had a pretzel since '58.\n Thank you!",
      "This here hockey stick reminds me of the one I used to beat the St. Louis Eagles in '38.",
      "Take it and maybe you'll...\n ***dozes***",
    ],
    isComplete: function(questState, player) {
      return questState.hasPickedUpQuestPretzel;
    },
    onComplete: function(questState, player) {
      questState.removeQuestItem();
      questState.giveWeaponToPlayer('hockey_stick');
    },
  },
  // give him his family photo
  // he gives you a key
  {
    npcLines: [
      ["These pretzels are making me thirsty!"],
      ["I love it that someone else exists!"],
      ["I dated the mop for a while, but that was way before you arrived!"],
      ["Have you ever danced with the devil in the pale moonlight?", "Me neither!"],
      ["Bugs are deadly and delicious!"],
      ["I can hear the mad scrambling of the thirsty rampaging hordes, clawing at the gates, desperate for ingress, the fury of nature licking the walls, emasculated by the structures of mankind.", "I deny them with my entire spirit."],
      ["You remind me of the daughter that abandoned me.", "You're much nicer, though!"],
      ["It's scary when you leave me alone in here, but that’s okay!"],
      ["Talk to me and stuff!"],
      ["It's just like", "It's just like", "A mini-mall, hey hey", "You heard me!"],
      ["Do you like to eat organ meats?", "I have the gout!"],
      ["Sometimes I like to sit outside the pretzel shop and watch the world not go by!"],
      ["Have you ever taken acid?", "Me neither!"],
      ["You crack me up!"],
      ["I'm wrinkled and wise!"],
    ],
    successLines: [
      "Thanks for the photo, here's a key\n *what do we write here?*",
    ],
    isComplete: function(questState, player) {
      return questState.hasPickedUpOldGuyPhoto;
    },
    onComplete: function(questState, player) {
      questState.removeQuestItem();
      questState.giveQuestItemToPlayer('key');
    },
  },
  // give him his family photo
  // he gives you a key
  {
    npcLines: [
      ["Something about mouse man"],
      ["Something about door"],
    ],
    isComplete: function(questState, player) {
      return false;
    },
  },
];

module.exports = questDefinitions;
