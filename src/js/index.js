const Phaser = require('Phaser');
const Player = require('./player');
const WorldMap = require('./world-map');
const Npc = require('./npc');
const Ant = require('./ant');
const Hud = require('./lib/hud');
const TextBanner = require('./lib/textBanner');

const GAME_DIMENSION = { w: 256, h: 240 };

const game = new Phaser.Game(GAME_DIMENSION.w, GAME_DIMENSION.h, Phaser.CANVAS, '', { init: init, preload: preload, create: create, update: update, render: render });
const pixel = { scale: 3, canvas: null, context: null, width: 0, height: 0 };

let player;
let cursors;
let actorGroup;
let enemyGroup;
let hud;

function init() {
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
  game.load.image('player', 'assets/sprites/player.png');
  game.load.image('ant', 'assets/sprites/ant.png');
  game.load.image('npc', 'assets/sprites/npc.png');
  game.load.spritesheet('hearts', 'assets/sprites/hearts.png', 7, 7);

  // Tilemaps
  game.load.tilemap('tilemap', 'assets/tilemaps/maps/mall_world.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('tiles', 'assets/tilemaps/tiles/mall_world.png');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  worldMap = new WorldMap(game, 'mall_world', 'tiles', 'tilemap');

  const heartsLocation = { x: 128, y: 32 };
  const hudDimension = { x: 0, y: 0, w: GAME_DIMENSION.w, h: 48}

  hud = Hud(game, hudDimension, heartsLocation);

  player = new Player(this);
  player.maxHealth = 6;
  player.health = 4;
  curPlayerHud = hud.playerHud(player);
  actorGroup = game.add.group();
  enemyGroup = game.add.group();
  actorGroup.add(player);
  actorGroup.add(new Npc(this));
  enemyGroup.add(new Ant(this));
  game.camera.follow(player);
  cursors = game.input.keyboard.createCursorKeys();
}


function update() {
  player.updateControls(cursors);
  game.physics.arcade.collide(player, worldMap.getCollisionLayer());
  game.physics.arcade.collide(actorGroup);
  game.physics.arcade.overlap(player, enemyGroup, onPlayerHit, null, this);
}

function onPlayerHit(player, enemy) {
  var angle = Math.atan2(player.body.y - enemy.body.y, player.body.x - enemy.body.x);
  player.damage(1);
  player.knockback(angle);
}

function render() {
  curPlayerHud.render();
  //  Every loop we need to render the un-scaled game canvas to the displayed scaled canvas:
  pixel.context.drawImage(game.canvas, 0, 0, game.width, game.height, 0, 0, pixel.width, pixel.height);
}
