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
const preloadSprites = require('./preload-sprites');
const sounds = require('./sounds');
const InputState = require('./input-state');
const DebugInfo = require('./debug-info');

const GAME_DIMENSION = { w: 256, h: 240 };

const game = new Phaser.Game(GAME_DIMENSION.w, GAME_DIMENSION.h, Phaser.CANVAS, 'game', { init: init, preload: preload, create: create, update: update, render: render });
const pixel = { scale: 3, canvas: null, context: null, width: 0, height: 0 };

let worldMap;
let player;
// let cursors;
let inputState;
let debugInfo;
let actorGroup;
let enemyGroup;
let npcGroup;
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
let textBox;
let textBoxGroup;
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

  const hudDimension = { x: 0, y: 0, w: GAME_DIMENSION.w, h: 48}

  inputState = new InputState(game);
  debugInfo = new DebugInfo(game);
  player = new Player(game);
  worldMap.initGameObjectPosition(player, Player.OBJECT_LAYER_NAME);
  player.maxHealth = 6;
  player.health = 5;
  player.maxFullness = 100;
  player.fullness = 100;

  // sprite group creation - order matters!
  pretzelMakerGroup = game.add.group();
  pickupGroup = game.add.group();
  actorGroup = game.add.group();
  enemyGroup = game.add.group();
  npcGroup = game.add.group();
  enemyDetectionSet = [];
  hudGroup = game.add.group();
  hudGroup.fixedToCamera = true;
  textBoxGroup = this.game.add.group();
  textBoxGroup.fixedToCamera = true;

  // Example to load ants
  worldMap.spawn(game, GreenAnt, (ant) => {
    enemyGroup.add(ant);
    enemyDetectionSet.push(ant.detectionBubble);
  });

  worldMap.spawn(game, PinkAnt, (ant) => {
    enemyGroup.add(ant);
    enemyDetectionSet.push(ant.detectionBubble);
  });

  worldMap.spawn(game, YellowAnt, (ant) => {
    enemyGroup.add(ant);
    enemyDetectionSet.push(ant.detectionBubble);
  });
  // End ants example


  worldMap.spawn(game, Npc, (npc) => {
    actorGroup.add(npc)
    npcGroup.add(npc);
  });

  actorGroup.add(player);
  game.camera.follow(player);
  // cursors = game.input.keyboard.createCursorKeys();
  game.renderer.renderSession.roundPixels = true;  // avoid camera jitter

  const yellowPretzel = new Pretzel(game, -10, -10, 'yellow'); // A hack to get them to show up in pickup
  const pinkPretzel = new Pretzel(game, -10, -10, 'pink'); // A hack to get them to show up in pickup
  const greenPretzel = new Pretzel(game, 400, 400, 'green');
  hockeyStick = new Weapon(game, 320, 300, 'hockey_stick');
  insectPart = new InsectPart(game, 500, 500, 1);

  pickupGroup.add(yellowPretzel);
  pickupGroup.add(pinkPretzel);
  pickupGroup.add(greenPretzel);
  pickupGroup.add(hockeyStick);
  pickupGroup.add(insectPart);

  hud = Hud(game, hudDimension, pickupGroup);

  hudGroup.add(hud.group);

  curPlayerHud = hud.playerHud(player);
  // pretzel makers
  yellowPretzelMaker = new YellowPretzelMaker(game, 200, 200);
  greenPretzelMaker = new GreenPretzelMaker(game, 260, 200);
  pinkPretzelMaker = new PinkPretzelMaker(game, 320, 200);
  pretzelMakerGroup.add(yellowPretzelMaker);
  pretzelMakerGroup.add(greenPretzelMaker);
  pretzelMakerGroup.add(pinkPretzelMaker);

  //text box
  textBox = new TextBox(this.game, 50, 100, player);
  textBoxGroup.add(textBox);

  soundsInit.init(game);
  sounds.play('mainloop', 0.2, true);
}


function update() {
  inputState.update(); // let this go first plz
  debugInfo.update(inputState.keys);

  curPlayerHud.update(player);
  player.updateControls(inputState.keys);
  game.physics.arcade.collide(actorGroup);
  if (Config.activeEnemyCollision) {
    game.physics.arcade.overlap(player, enemyGroup, onPlayerHit, null, this);
  }

  game.physics.arcade.overlap(player, pickupGroup, pickupCollisionHandler, null, this);
  game.physics.arcade.overlap(player.attackHitbox, enemyGroup, onEnemyHit, null, this);
  game.physics.arcade.overlap(player, enemyDetectionSet, onEnemyDetect, null, this);
  game.physics.arcade.collide(player, worldMap.getCollisionLayer());
  game.physics.arcade.collide(enemyGroup, worldMap.getCollisionLayer());
  game.physics.arcade.collide(player, pretzelMakerGroup, pretzelMakerCollisionHandler, null, this);
  game.physics.arcade.collide(player, npcGroup, npcHandler, null, this);
  game.physics.arcade.collide(enemyGroup, enemyGroup, () => ({}), null, this);
  game.physics.arcade.collide(player, worldMap.getDoorwayLayer(), worldMap.doorwayHandlerGenerator(game), null, this);
  game.physics.arcade.collide(enemyGroup, worldMap.getDoorwayLayer());

  game.physics.arcade.collide(player, worldMap.getVoidLayer());
  game.physics.arcade.collide(enemyGroup, worldMap.getVoidLayer());
}

function onPlayerHit(player, enemy) {
  sounds.play('player_hit', 0.1);
  const angle = Math.atan2(player.body.y - enemy.body.y, player.body.x - enemy.body.x);
  player.knockback(angle);
  player.damage(1);
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

function onEnemyDetect(player, bubble) {
  bubble.parent.seePlayer(player);
}

function pickupCollisionHandler(player, pickup){
  player.pickupItem(pickup);
  pickup.kill();
}

function pretzelMakerCollisionHandler(player, pretzelMaker){
  pretzelMaker.configPrompt(player, textBox, pickupGroup);
}

function npcHandler(player, npc) {
  npc.chooseText(textBox);
  console.log("grunts")
}

function render() {
  debugInfo.render(player);

  //  Every loop we need to render the un-scaled game canvas to the displayed scaled canvas:
  pixel.context.drawImage(game.canvas, 0, 0, game.width, game.height, 0, 0, pixel.width, pixel.height);
}
