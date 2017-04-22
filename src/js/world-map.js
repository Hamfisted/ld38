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
