const BACKGROUND_TILE_LAYER = "BackgroundLayer";
const COLLISION_TILE_LAYER = "CollisionLayer";

// DO NOT CHANGE, TILED MAP REQUIRES NAMED TILESETS!
const MALL_WORLD_TILESET = "mall_world";
const SCENE_OBJECT_TILESET = "scene_objects";
// END DO NOT CHANGE

const MALL_WORLD_TILEMAP = "mall_world_tilemap";
const SCENE_OBJECT_TILES = "scene_objects_tiles";
const MALL_WORLD_TILES = "mall_world_tiles";

// new WorldMap(game, 'mall_world', 'tiles', 'tilemap')
// function(game, tileset, tiles, tilemap)
// map.js
const WorldMap = function(game) {
  // Tilemap object
  this.map = game.add.tilemap(MALL_WORLD_TILEMAP);

  // Kinda vauge, but works. Maybe cleanup later
  this.map.addTilesetImage(MALL_WORLD_TILESET, MALL_WORLD_TILES);
  this.map.addTilesetImage(SCENE_OBJECT_TILESET, SCENE_OBJECT_TILES);

  // Background layer is the floor, mostly
  this.backgroundlayer = this.map.createLayer(BACKGROUND_TILE_LAYER);

  // Walls, obstacles, etc as part of your surroundings
  this.collisionLayer = this.map.createLayer(COLLISION_TILE_LAYER);
  this.map.setCollisionByExclusion([], true, COLLISION_TILE_LAYER);

  //Change the world size to match the size of this layer
  this.collisionLayer.resizeWorld();
}

WorldMap.preload = function(game) {
  // PRELOAD
  game.load.tilemap(MALL_WORLD_TILEMAP, 'assets/tilemaps/maps/mall_world.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image(MALL_WORLD_TILES, 'assets/tilemaps/tiles/mall_world.png');
  game.load.image(SCENE_OBJECT_TILES, 'assets/tilemaps/tiles/scene_objects.png');
}

WorldMap.prototype.getMap = function() {
  return this.map;
}

WorldMap.prototype.getCollisionLayer = function(){
  return this.collisionLayer;
}

WorldMap.prototype.initGameObjectPosition = function(object, layerName, index=0){
  const initObjectPos = this.getObjectsLayer(layerName)[index];
  object.x = initObjectPos.x;
  object.y = initObjectPos.y;
}

WorldMap.prototype.getObjects = function() {
  return this.map.objects;
}

WorldMap.prototype.getObjectsLayer = function(layerName) {
  return this.map.objects[layerName];
}

WorldMap.prototype.spawn = function(game, objectClass, callback) {
  const objects = this.getObjectsLayer(objectClass.OBJECT_LAYER_NAME);
  for (let obj of objects) {
    var objInstance = new objectClass(game, obj['x'], obj['y']);
    callback(objInstance);
  }
}

WorldMap.prototype.constructor = WorldMap;



module.exports = WorldMap
