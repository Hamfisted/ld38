const Phaser = require('Phaser');
const Config = require('./config');
const Player = require('./player');
const WorldMap = require('./world-map');
const Npc = require('./npc');
const YellowAnt = require('./ants/yellow-ant');
const GreenAnt = require('./ants/green-ant');
const PinkAnt = require('./ants/pink-ant');
const Hud = require('./lib/hud');
const Pretzel = require('./pretzel');
const Weapon = require('./weapon');
const InsectPart = require('./insect-part');
const PinkPretzelMaker = require('./pink-pretzel-maker');
const GreenPretzelMaker = require('./green-pretzel-maker');
const YellowPretzelMaker = require('./yellow-pretzel-maker');
const TextBox = require('./narrative/text-box');
const Cutscene = require('./narrative/cutscene');
const preloadSprites = require('./preload-sprites');
const sounds = require('./sounds');
const InputState = require('./input-state');
const DebugInfo = require('./debug-info');
const QuestState = require('./narrative/quest-state');

// quest items
const QuestItem = require('./quest-item');
const Key = require('./key');

const GAME_DIMENSION = { w: 256, h: 240 };

const game = new Phaser.Game(GAME_DIMENSION.w, GAME_DIMENSION.h, Phaser.CANVAS, 'game', { init: init, preload: preload, create: create, update: update, render: render });
const pixel = { scale: 3, canvas: null, context: null, width: 0, height: 0 };
const hudDimension = { x: 0, y: 0, w: GAME_DIMENSION.w, h: 48}

let worldMap;
let player;
let inputState;
let debugInfo;
let questState;
let actorGroup;
let enemyGroup;
let enemyArr;
let npcGroup;
let npcArr;
let hudGroup;
let hud;
let curPlayerHud;
let insectPart;
let hockeyStick;
let pickupGroup;
let enemyDetectionSet;
let pinkPretzelMaker;
let yellowPretzelMaker;
let greenPretzelMaker;
let pretzelMakerGroup;
let resetGameGroup;
let textBox;
let textBoxGroup;
let cutscene;
let soundsInit;

function init() {
  //  Hide the un-scaled game canvas
  game.canvas.style['display'] = 'none';

  //  Create our scaled canvas. It will be the size of the game * whatever scale value you've set
  pixel.canvas = Phaser.Canvas.create(game, game.width * pixel.scale, game.height * pixel.scale);

  //  Store a reference to the Canvas Context
  pixel.context = pixel.canvas.getContext('2d');

  //  Add the scaled canvas to the DOM
  Phaser.Canvas.addToDOM(pixel.canvas, 'game');

  //  Disable smoothing on the scaled canvas
  Phaser.Canvas.setSmoothingEnabled(pixel.context, false);

  //  Cache the width/height to avoid looking it up every render
  pixel.width = pixel.canvas.width;
  pixel.height = pixel.canvas.height;
}

function preload() {
  this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

  WorldMap.preload(game);

  // moved all the "game.load.image()" things in here
  preloadSprites(game);
  soundsInit = sounds.load(game)
  game.load.bitmapFont('pixel8px', 'assets/fonts/pixel.png', 'assets/fonts/pixel.xml');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  // keep the space/arrow key events from propagating up to the browser
  game.input.keyboard.addKeyCapture([
    Phaser.Keyboard.SPACEBAR,
    Phaser.Keyboard.UP,
    Phaser.Keyboard.DOWN,
    Phaser.Keyboard.LEFT,
    Phaser.Keyboard.RIGHT,
  ]);
  worldMap = new WorldMap(game);
  inputState = new InputState(game);
  debugInfo = new DebugInfo(game);
  questState = new QuestState(game);

  game.renderer.renderSession.roundPixels = true;  // avoid camera jitter

  resetGameGroup = game.add.group();
  textBoxGroup = game.add.group();
  textBoxGroup.fixedToCamera = true;
  textBox = new TextBox(game, 30, 140);
  textBoxGroup.add(textBox);

  soundsInit.init(game);
  reset();
}

function reset() {


  sounds.stop('fightloop');
  if(!sounds.isPlaying('mainloop')) {
    sounds.play('mainloop', 0.2, true);
  }

  if(enemyGroup) {
    enemyGroup.forEach(function (e) { e.damageHurtBox.destroy(); })
  }

  resetGameGroup.forEach(function (c) {
    c.forEach(function (d) { d.destroy(); });
    c.removeAll();
  });
  player = new Player(game, null, null, questState);
  player.maxHealth = 10;
  player.health = 10;
  player.maxFullness = 100;
  player.fullness = 100;
  player.onDie(function () {
    textBox.displayPrompt(
      'Would you like to play again?',
      [{
        message: 'yes',
        onChoose: function() {
          textBox.clearPrompt();
          reset();
        }.bind(this)
      }]
    );
  }.bind(this));

  worldMap.initGameObjectPosition(player, Player.OBJECT_LAYER_NAME);

  // sprite group creation - order matters!
  pretzelMakerGroup = game.add.group();
  pickupGroup = game.add.group();
  npcGroup = game.add.group();
  actorGroup = game.add.group();
  enemyGroup = game.add.group();
  hudGroup = game.add.group();
  hudGroup.fixedToCamera = true;

  resetGameGroup.add(pretzelMakerGroup)
  resetGameGroup.add(pickupGroup)
  resetGameGroup.add(npcGroup)
  resetGameGroup.add(enemyGroup)
  resetGameGroup.add(actorGroup)
  resetGameGroup.add(hudGroup)

  enemyDetectionSet = [];
  enemyHurtBoxSet = [];

  // can't add sprites to multiple groups -- use arrays
  enemyArr = [];
  npcArr = [];

  worldMap.spawn(game, GreenAnt, (ant) => {
    ant.setPickupGroup(pickupGroup);
    actorGroup.add(ant);
    enemyArr.push(ant);
    enemyDetectionSet.push(ant.detectionBubble);
    enemyHurtBoxSet.push(ant.damageHurtBox)
  });

  worldMap.spawn(game, PinkAnt, (ant) => {
    ant.setPickupGroup(pickupGroup);
    actorGroup.add(ant);
    enemyArr.push(ant);
    enemyDetectionSet.push(ant.detectionBubble);
    enemyHurtBoxSet.push(ant.damageHurtBox)
  });

  worldMap.spawn(game, YellowAnt, (ant) => {
    ant.setPickupGroup(pickupGroup);
    actorGroup.add(ant);
    enemyArr.push(ant);
    enemyDetectionSet.push(ant.detectionBubble);
    enemyHurtBoxSet.push(ant.damageHurtBox)
  });

  worldMap.spawnNpc(game, Npc, (npc) => {
    actorGroup.add(npc);
    npcArr.push(npc);
  });

  worldMap.spawnQuestItem(game, QuestItem, (questItem) => {
    pickupGroup.add(questItem);
  });

  actorGroup.add(player);
  game.camera.follow(player);

  const yellowPretzel = new Pretzel(game, -10, -10, 'yellow'); // A hack to get them to show up in pickup
  const pinkPretzel = new Pretzel(game, -10, -10, 'pink'); // A hack to get them to show up in pickup
  const greenPretzel = new Pretzel(game, -10, -10, 'green');
  hockeyStick = new Weapon(game, -10, -10, 'hockey_stick');
  // insectPart = new InsectPart(game, 500, 500, 'green');

  pickupGroup.add(yellowPretzel);
  pickupGroup.add(pinkPretzel);
  pickupGroup.add(greenPretzel);
  pickupGroup.add(hockeyStick);
  // pickupGroup.add(insectPart);

  const key = new Key(game, -10, -10);
  pickupGroup.add(key);

  hud = Hud(game, hudDimension, pickupGroup);

  hudGroup.add(hud.group);

  curPlayerHud = hud.playerHud(player);
  // pretzel makers
  yellowPretzelMaker = new YellowPretzelMaker(game, 200, 240);
  greenPretzelMaker = new GreenPretzelMaker(game, 280, 240);
  pinkPretzelMaker = new PinkPretzelMaker(game, 360, 240);
  pretzelMakerGroup.add(yellowPretzelMaker);
  pretzelMakerGroup.add(greenPretzelMaker);
  pretzelMakerGroup.add(pinkPretzelMaker);

  //text box

  textBox.setPlayer(player);

  cutscene = new Cutscene(game, inputState, textBox);
  hudGroup.add(cutscene); // idk where this belongs but it doesn't really matter

  questState.setPlayer(player);
  questState.setPickupGroup(pickupGroup);
}


function update() {
  inputState.update(); // let this go first plz
  if (inputState.keys.restart.wasJustReleased) {
    // press R
    reset()
    return;
  }

  debugInfo.update(inputState.keys);

  curPlayerHud.update(player);
  player.updateControls(inputState.keys);
  if (Config.activeEnemyCollision) {
    game.physics.arcade.overlap(player, enemyHurtBoxSet, onPlayerHit, null, this);
  }

  game.physics.arcade.overlap(player, pickupGroup, pickupCollisionHandler, null, this);
  game.physics.arcade.overlap(player.attackHitbox, enemyArr, onEnemyHit, null, this);
  // game.physics.arcade.overlap(player, enemyDetectionSet, onEnemyDetect, null, this);

  enemyDetectionSet.forEach(function (e) {
    onEnemyDetect(player, e, game.physics.arcade.overlap(player, e))
  });

  game.physics.arcade.collide(actorGroup, worldMap.getCollisionLayer());

  game.physics.arcade.collide(player, pretzelMakerGroup, pretzelMakerCollisionHandler, null, this);
  game.physics.arcade.collide(player, npcArr, npcHandler, null, this);
  game.physics.arcade.collide(player, worldMap.getDoorwayLayer(), worldMap.doorwayHandlerGenerator(game), null, this);
  game.physics.arcade.collide(player, worldMap.getOutDoorwayLayer(), worldMap.outDoorwayHandlerGenerator(game), null, this);
  game.physics.arcade.collide(actorGroup, worldMap.getDoorwayLayer());

  game.physics.arcade.collide(actorGroup, worldMap.getVoidLayer());

  // depth sorting mothafucka!!!
  actorGroup.sort('y', Phaser.Group.SORT_ASCENDING);
}

function onPlayerHit(player, enemyHurtBox) {
  if (!player.alive || player.inHitStun || !enemyHurtBox.parent.alive) {
    return;
  }
  sounds.play('player_hit', 0.1);
  const angle = Math.atan2(player.body.y - enemyHurtBox.body.y, player.body.x - enemyHurtBox.body.x);
  player.knockback(angle);
  player.damage(enemyHurtBox.parent.damageAmount);
}

function onEnemyHit(playerAttackHitbox, enemy) {
  if (playerAttackHitbox.parent) {
    playerAttackHitbox.parent.hitEnemy(enemy);
    enemy.damage(1);

    game.camera.shake(0.005, 500);

    const emitter = this.game.add.emitter(enemy.body.x, enemy.body.y, 15);

    emitter.makeParticles( [ 'muzzleflash2', 'muzzleflash4' ] );
    emitter.gravity = 1000;
    emitter.setAlpha(1, 0, 3000);
    emitter.setScale(0.05, 0, 0.05, 0, 3000);

    emitter.start(false, 3000, 5);

    game.time.events.add(600, () => {emitter.destroy()}, this);
  }
}

function onEnemyDetect(player, bubble, overlap) {
  bubble.parent.seePlayer(player, overlap);
}

function pickupCollisionHandler(player, pickup){
  const pickedUp = player.pickupItem(pickup);
  if(pickedUp) { pickup.kill(); }
}

function pretzelMakerCollisionHandler(player, pretzelMaker){
  pretzelMaker.configPrompt(player, textBox, pickupGroup);
}

function npcHandler(player, npc) {
  questState.triggerNpcInteraction(npc, cutscene);
};

function render() {
  debugInfo.render(player, actorGroup, enemyArr);

  //  Every loop we need to render the un-scaled game canvas to the displayed scaled canvas:
  pixel.context.drawImage(game.canvas, 0, 0, game.width, game.height, 0, 0, pixel.width, pixel.height);
}
