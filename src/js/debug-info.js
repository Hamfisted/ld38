const Config = require('./config');


const numChildrenOfGroup = function (group, onlyCountAliveChildren) {
  if (group.children && group.children.length) {
    return group.children.reduce(function (acc, child) {
      return acc + numChildrenOfGroup(child, onlyCountAliveChildren);
    }, 0);
  }
  return onlyCountAliveChildren ? (group.alive ? 1 : 0) : 1;
};
const debugColor = 'rgba(0,255,0,0.8)';
const debugFont = '8px pixelmix';

function DebugInfo(game) {
  this.game = game;
  this.numAliveChildren = 0;
  this.numChildren = 0;
}

DebugInfo.prototype.update = function update(keys) {
  if (keys.debug.wasJustReleased) {
    Config.debug = !Config.debug;
    this.game.time.advancedTiming = Config.debug;
  }
  if (!Config.debug) {
    return;
  }

  this.numChildren = numChildrenOfGroup(this.game.world, false);
  this.numAliveChildren = numChildrenOfGroup(this.game.world, true);
};

DebugInfo.prototype.render = function render(player) {
  if (!Config.debug) {
    return;
  }
  const game = this.game;

  if (player.attackHitbox.body.enable) {
    game.debug.body(player.attackHitbox, 'rgba(255, 0, 0, 0.3)');
  }


  game.debug.text(`fps ${game.time.fps}` || '-', 2, 10, debugColor, debugFont);
  game.debug.text(`alive ${this.numAliveChildren}` || '-', 2, 20, debugColor, debugFont);
  game.debug.text(`sum ${this.numChildren}` || '-', 2, 30, debugColor, debugFont);
  let i = 0;
  for (let key in Config){
    i = i + 10;
    game.debug.text(`${key}: ${Config[key]}`, 50, i, debugColor, debugFont);
  }
};

module.exports = DebugInfo;
