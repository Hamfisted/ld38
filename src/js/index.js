const Phaser = require('Phaser');
const Config = require('./config');
const Player = require('./player');
const WorldMap = require('./world-map');
const Npc = require('./npc');
const Ant = require('./ants/ant');
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

const GAME_DIMENSION = { w: 256, h: 240 };

const game = new Phaser.Game(GAME_DIMENSION.w, GAME_DIMENSION.h, Phaser.CANVAS, '', { init: init, preload: preload, create: create, update: update, render: render });
const pixel = { scale: 3, canvas: null, context: null, width: 0, height: 0 };

let worldMap;
let player;
let cursors;
let actorGroup;
let enemyGroup;
let hudGroup;
let hud;
let curPlayerHud;
let pretzel;
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

function init() {
  // debug mode cfg
  if (Config.debug) {
    game.time.advancedTiming = true;
    game.debug.font = '8px Arial';
    game.debug.renderShadow = true;
  }


  //  Hide the un-scaled game canvas
  game.canvas.style['display'] = 'none';

  //  Create our scaled canvas. It will be the size of the game * whatever scale value you've set
  pixel.canvas = Phaser.Canvas.create(game, game.width * pixel.scale, game.height * pixel.scale);

  //  Store a reference to the Canvas Context
  pixel.context = pixel.canvas.getContext('2d');

  //  Add the scaled canvas to the DOM
  Phaser.Canvas.addToDOM(pixel.canvas);

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
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  worldMap = new WorldMap(game);

  const hudDimension = { x: 0, y: 0, w: GAME_DIMENSION.w, h: 48}

  player = new Player(game);
  worldMap.initGameObjectPosition(player, Player.OBJECT_LAYER_NAME);
  player.maxHealth = 6;
  player.health = 4;
  player.maxFullness = 100;
  player.fullness = 100;

  // sprite group creation - order matters!
  pretzelMakerGroup = game.add.group();
  pickupGroup = game.add.group();
  actorGroup = game.add.group();
  enemyGroup = game.add.group();
  enemyDetectionSet = [];

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

  hudGroup = game.add.group();
  hudGroup.fixedToCamera = true;
  textBoxGroup = this.game.add.group();
  textBoxGroup.fixedToCamera = true;

  worldMap.spawn(game, Npc, (npc) => actorGroup.add(npc));

  actorGroup.add(player);
  game.camera.follow(player);
  // keep the spacebar event from propagating up to the browser
  game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
  cursors = game.input.keyboard.createCursorKeys();
  game.renderer.renderSession.roundPixels = true;  // avoid camera jitter

  pretzel = new Pretzel(game, 400, 400, 1);
  hockeyStick = new Weapon(game, 320, 300, 'hockey_stick');
  insectPart = new InsectPart(game, 500, 500, 1);

  pickupGroup.add(pretzel);
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

}


function update() {
  curPlayerHud.update(player);
  player.updateControls(cursors);
  game.physics.arcade.collide(actorGroup);
  if (Config.activeEnemyCollision) {
    game.physics.arcade.overlap(player, enemyGroup, onPlayerHit, null, this);
  }
  game.physics.arcade.overlap(player, pickupGroup, pickupCollisionHandler, null, this);
  game.physics.arcade.overlap(player, enemyDetectionSet, onEnemyDetect, null, this);
  game.physics.arcade.collide(player, worldMap.getCollisionLayer());
  game.physics.arcade.collide(enemyGroup, worldMap.getCollisionLayer());
  game.physics.arcade.collide(player, pretzelMakerGroup, pretzelMakerCollisionHandler, null, this);
}

function onPlayerHit(player, enemy) {
  var angle = Math.atan2(player.body.y - enemy.body.y, player.body.x - enemy.body.x);
  player.damage(1);
  player.knockback(angle);
}

function onEnemyDetect(player, bubble) {
  bubble.parent.seePlayer(player);
}

function pickupCollisionHandler(player, pickup){
  player.pickupItem(pickup);
  pickup.kill();
}

function pretzelMakerCollisionHandler(player, pretzelMaker){
  pretzelMaker.configPrompt(player, textBox);
  const pretzelEjecttionY = 60;
  pickupGroup.add(new Pretzel(this, pretzelMaker.x, pretzelMaker.y + pretzelEjecttionY, 2));
}

function render() {
  if (Config.debug) {
    const debugColor = 'rgba(0,255,0,0.8)';
    const debugFont = '10px Arial';
    game.debug.text(`fps ${game.time.fps}` || '-', 2, 10, debugColor, debugFont);
    const numAliveChildrenOfGroup = function(group) {
      if (group.children && group.children.length) {
        return group.children.reduce(function(acc, child) {
          return acc + numAliveChildrenOfGroup(child);
        }, 0);
      }
      return group.alive ? 1 : 0;
    };
    const numChildren = numAliveChildrenOfGroup(game.world);
    game.debug.text(`obj ${numChildren}` || '-', 2, 20, debugColor, debugFont);
  }

  //  Every loop we need to render the un-scaled game canvas to the displayed scaled canvas:
  pixel.context.drawImage(game.canvas, 0, 0, game.width, game.height, 0, 0, pixel.width, pixel.height);
}
