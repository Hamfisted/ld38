const Phaser = require('Phaser');
const Player = require('./player');  // relative import

const game = new Phaser.Game(256, 240, Phaser.CANVAS, '', { init: init, preload: preload, create: create, update: update, render: render });
const pixel = { scale: 3, canvas: null, context: null, width: 0, height: 0 };

var player;
var cursors;

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
  game.load.image('white_box', 'assets/sprites/white_box.png');  // remove me once we have a map
}

function create() {
  player = new Player(this);
  game.add.sprite(0, 0, 'white_box');
  game.add.existing(player);
  game.camera.follow(player);
  cursors = game.input.keyboard.createCursorKeys();
}


function update() {
  player.updateControls(cursors);
}

function render() {
  //  Every loop we need to render the un-scaled game canvas to the displayed scaled canvas:
  pixel.context.drawImage(game.canvas, 0, 0, game.width, game.height, 0, 0, pixel.width, pixel.height);
}
