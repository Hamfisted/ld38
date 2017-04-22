const ANTS_OBJECT_LAYER = "Ants";
const ANT_GID = 3;

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

WorldMap.prototype.spawnEnemies = function(enemyGroup){
  this.map.createFromObjects(ANTS_OBJECT_LAYER, ANT_GID, 'ant', 0, true, false, enemyGroup);
}

WorldMap.prototype.constructor = WorldMap;



module.exports = WorldMap
