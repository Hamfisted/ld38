const Actor = require('./actor');
const Cutscene = require('./narrative/cutscene');
const SPRITE_KEY = 'old_guy';
const OBJECT_LAYER_NAME = 'Npcs';

const Npc = function(game, x, y) {
  Actor.call(this, game, x, y, SPRITE_KEY);
  this.initialDialogue = "Hello young fellow";
  this.body.immovable = true;
  this.body.setSize(16, 16, 8, 16);  // w h x y
  this.bob();
  this.state = 0;

  // unused
  this.dialogueData = {
    // when you first talk to him
    0: [["Welcome! You're the first person I’ve seen in... a week? Two weeks?", "Doesn't matter. Welcome!", ""]],
    // randomly choose from these until you get him a pretzel
    1: [["My family left me here and they haven't come back for me, but that’s okay!"],
        ["I eat dinner out of the pretzel shop trash!"],
        ["Last week I spent a whole day counting ketchup packets!"],
        ["I remember when all of this was nothing but farmland and varmint country!"],
        [["Have you ever gotten locked in a bathroom stall?", "Me neither!"]]],
    // randomly choose from these afterward
    2: [["I love it that someone else exists!"],
        ["I dated the mop for a while, but that was way before you arrived!"],
        [["Have you ever danced with the devil in the pale moonlight?", "Me neither!"]],
        ["Bugs are deadly and delicious!"],
        ["I can hear the mad scrambling of the thirsty rampaging hordes, clawing at the gates, desperate for ingress, the fury of nature licking the walls, emasculated by the structures of mankind. I deny them with my entire spirit."],
        [["You remind me of the daughter that abandoned me.", "You're much nicer, though!"]],
        ["It's scary when you leave me alone in here, but that’s okay!"],
        ["Talk to me and stuff!"],
        [["It's just like", "It's just like", "A mini-mall, hey hey", "You heard me!"]],
        [["Do you like to eat organ meats?", "I have the gout!"]],
        ["Sometimes I like to sit outside the pretzel shop and watch the world not go by!"],
        [["Have you ever taken acid?", "Me neither!"]],
        ["You crack me up!"],
        ["I'm wrinkled and wise!"]]
      };
}
//Later prompts (after successfully making pretzels, leaving, and returning):
//(If player finds mop at some point and steals it to use as a weapon) "Have you seen that mop at all? Not that I'm worried about her…"
//"...it! Worried about it!"


Npc.prototype = Object.create(Actor.prototype);
Npc.prototype.constructor = Npc;
Npc.SPRITE_KEY = SPRITE_KEY;
Npc.OBJECT_LAYER_NAME = OBJECT_LAYER_NAME;

Npc.prototype.bob = function(){
  this.loadTexture('old_guy_idle', 0);
  this.animations.add('old_guy_idle');
  this.animations.play('old_guy_idle', 3, true);
}

// unused
Npc.prototype.chooseText = function(cutscene){
  let choices = this.dialogueData[this.state];
  let randomNum = Math.floor((Math.random() * choices.length));
  let choice = choices[randomNum];

  cutscene.playLines(choice);
};
module.exports = Npc;
