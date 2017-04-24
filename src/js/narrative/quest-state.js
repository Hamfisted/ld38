const questDefinitions = require('./quest-definitions');
const Weapon = require('../Weapon');
const OldGuyPhoto = require('../old-guy-photo');
const Key = require('../key');

function QuestState(game, pickupGroup) {
  this.game = game;
  this.pickupGroup = pickupGroup;

  this.questIndex = 0;
  this.player = null;

  // bunch of shit
  this.currentQuestItem = null;
  this.hasTalkedToNpc = false;
  this.hasPickedUpQuestPretzel = false;
  this.hasPickedUpOldGuyPhoto = false;
}

QuestState.prototype.setPlayer = function (player) {
  this.player = player;
};
QuestState.prototype.setPickupGroup = function (pickupGroup) {
  this.pickupGroup = pickupGroup;
};

QuestState.prototype.triggerNpcInteraction = function (npc, cutscene) {
  const quest = questDefinitions[this.questIndex];
  if (quest.isComplete(this, this.player)) {

    if (quest.successLines) {
      this.displayDialogue(cutscene, quest.successLines, function() {
        this.completeCurrentQuest();
      }.bind(this));
    } else {
      this.completeCurrentQuest();
    }

  } else {
    const lines = this.chooseRandomText();
    this.displayDialogue(cutscene, lines);
  }
};

QuestState.prototype.chooseRandomText = function () {
  const currentQuest = questDefinitions[this.questIndex];
  const choices = currentQuest.npcLines;
  const randomIndex = Math.floor((Math.random() * choices.length));
  return choices[randomIndex];
};

QuestState.prototype.displayDialogue = function(cutscene, lines, callback) {
  cutscene.playLines(lines, callback);
};

QuestState.prototype.completeCurrentQuest = function() {
  const currentQuest = questDefinitions[this.questIndex];
  currentQuest.onComplete.call(this, this, this.player);
  this.questIndex += 1;
};

QuestState.prototype.removeQuestItem = function() {
  this.player.removeQuestItem();
};

QuestState.prototype.giveWeaponToPlayer = function(type) {
  const weapon = new Weapon(this.game, this.player.x, this.player.y, type);
  this.pickupGroup.add(weapon);
}

QuestState.prototype.giveQuestItemToPlayer = function(type) {
  let questItem;
  if (type === 'old_guy_photo') {
    questItem = new OldGuyPhoto(this.game, this.player.x, this.player.y);
  } else if (type === 'key') {
    questItem = new Key(this.game, this.player.x, this.player.y);
  }
  this.pickupGroup.add(questItem);
};

module.exports = QuestState;
