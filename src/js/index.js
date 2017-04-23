const Phaser = require('Phaser');
const Config = require('./config');
const Player = require('./player');
const WorldMap = require('./world-map');
const Npc = require('./npc');
const Ant = require('./ant');
const Hud = require('./lib/hud');
const Pretzel = require('./pretzel');
const Weapon = require('./weapon');
const PinkPretzelMaker = require('./pink-pretzel-maker');
const GreenPretzelMaker = require('./green-pretzel-maker');
const YellowPretzelMaker = require('./yellow-pretzel-maker');
const TextBox = require('./text-box');

const GAME_DIMENSION = { w: 256, h: 240 };

const game = new Phaser.Game(GAME_DIMENSION.w, GAME_DIMENSION.h, Phaser.CANVAS, '', { init: init, preload: preload, create: create, update: update, render: render });
const pixel = { scale: 3, canvas: null, context: null, width: 0, height: 0 };

let worldMap;
let player;
let cursors;
let actorGroup;
let enemyGroup;
let hud;
let curPlayerHud;
let pretzel;
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
    game.debug.renderShadow = false;
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
  game.load.spritesheet('player', 'assets/sprites/player.png', 32, 32);
  game.load.image('ant', 'assets/sprites/ant.png');
  game.load.image('npc', 'assets/sprites/npc.png');
  game.load.spritesheet('hearts', 'assets/sprites/hearts.png', 7, 7);

  // Tilemaps
  game.load.tilemap('tilemap', 'assets/tilemaps/maps/mall_world.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('tiles', 'assets/tilemaps/tiles/mall_world.png');

  game.load.image('pretzel', 'assets/sprites/pretzel.png');
  game.load.image('hockey_stick', 'assets/sprites/hockey_stick.png');

  game.load.image('area', 'assets/sprites/area.png');
  game.load.image('yellowPretzelMaker', 'assets/sprites/yellowPretzelMaker.png');
  game.load.image('greenPretzelMaker', 'assets/sprites/greenPretzelmaker.png');
  game.load.image('pinkPretzelMaker', 'assets/sprites/pinkPretzelMaker.png');
  game.load.image('textbox', 'assets/sprites/textbox.png');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  worldMap = new WorldMap(game, 'mall_world', 'tiles', 'tilemap');

  const heartsLocation = { x: 128, y: 32 };
  const hudDimension = { x: 0, y: 0, w: GAME_DIMENSION.w, h: 48}

  player = new Player(this);
  worldMap.initGameObjectPosition(player, Player.OBJECT_LAYER_NAME);
  player.maxHealth = 6;
  player.health = 4;
  player.maxFullness = 100;
  player.fullness = 100;

  actorGroup = game.add.group();
  enemyGroup = game.add.group();
  pretzelMakerGroup = game.add.group();
  enemyDetectionSet = [];
  pickupGroup = game.add.group();
  hudGroup = game.add.group();
  hudGroup.fixedToCamera = true;
  textBoxGroup = this.game.add.group();
  textBoxGroup.fixedToCamera = true;



  worldMap.spawn(game, Ant, (ant) => {
    enemyGroup.add(ant);
    enemyDetectionSet.push(ant.detectionBubble);
  });
  worldMap.spawn(game, Npc, (npc) => actorGroup.add(npc));

  actorGroup.add(player);
  game.camera.follow(player);
  // keep the spacebar event from propagating up to the browser
  game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
  cursors = game.input.keyboard.createCursorKeys();
  game.renderer.renderSession.roundPixels = true;  // avoid camera jitter

  pretzel = new Pretzel(this, 400, 400, 1);
  hockeyStick = new Weapon(this, 320, 300, 'hockey_stick');

  pickupGroup.add(pretzel);
  pickupGroup.add(hockeyStick);

  hud = Hud(game, hudDimension, heartsLocation, pickupGroup);

  hudGroup.add(hud.group)

  curPlayerHud = hud.playerHud(player);
  // pretzel makers
  pinkPretzelMaker = new PinkPretzelMaker(this, 200, 200);
  greenPretzelMaker = new GreenPretzelMaker(this, 230, 200);
  yellowPretzelMaker = new YellowPretzelMaker(this, 260, 200);
  pretzelMakerGroup.add(pinkPretzelMaker);
  pretzelMakerGroup.add(greenPretzelMaker);
  pretzelMakerGroup.add(yellowPretzelMaker);

  //text box
  textBox = new TextBox(this.game, 50, 100, player);
  textBoxGroup.add(textBox);
}


function update() {
  curPlayerHud.update(player);
  player.updateControls(cursors);
  game.physics.arcade.collide(actorGroup);
  if (Config.activeEnemies) {
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
  textBox.displayText(pretzelMaker.textString);
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
