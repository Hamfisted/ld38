// Really ugly and coupled, want to merge and then split up sanely
const Player = require('./player');
const Ant = require('./ant');
const Npc = require('./npc');
const PLAYER_OBJECT_LAYER = "PlayerLayer";
const ANTS_OBJECT_LAYER = "Ants";
const NPCS_OBJECT_LAYER = "Npcs";
const ANT_GID = 3;
const NPC_GID = 4;

const BACKGROUND_TILE_LAYER = "BackgroundLayer";
const COLLISION_TILE_LAYER = "CollisionLayer";

// map.js
const WorldMap = function(game, tileset, tiles, tilemap) {
  // Tilemap object
  this.map = game.add.tilemap(tilemap);

  // Kinda vauge, but works. Maybe cleanup later
  this.map.addTilesetImage(tileset, tiles);

  // Background layer is the floor, mostly
  this.backgroundlayer = this.map.createLayer(BACKGROUND_TILE_LAYER);

  // Walls, obstacles, etc as part of your surroundings
  this.collisionLayer = this.map.createLayer(COLLISION_TILE_LAYER);
  this.map.setCollisionByExclusion([], true, COLLISION_TILE_LAYER);

  //Change the world size to match the size of this layer
  this.collisionLayer.resizeWorld();
}

WorldMap.prototype.getMap = function(){
  return this.map;
}

WorldMap.prototype.getCollisionLayer = function(){
  return this.collisionLayer;
}

WorldMap.prototype.placePlayer = function(player){
  const playerObj = this.getObjectsLayer(PLAYER_OBJECT_LAYER)[0];
  player.x = playerObj.x;
  player.y = playerObj.y;
}

WorldMap.prototype.getObjects = function() {
  return this.map.objects;
}

WorldMap.prototype.getObjectsLayer = function(layerName) {
  return this.map.objects[layerName];
}

WorldMap.prototype.spawn = function(game, objectClass, objectGroup) {
  const objects = this.getObjectsLayer(objectClass.OBJECT_LAYER_NAME);
  for (let obj of objects) {
    objectGroup.add(new objectClass(game, obj['x'], obj['y']));
  }
}

WorldMap.prototype.constructor = WorldMap;



module.exports = WorldMap
