// map.js
const WorldMap = function(game, tileset, tiles, tilemap) {
  this.map = game.add.tilemap(tilemap);
  console.log(tileset);
  console.log(tiles);
  this.map.addTilesetImage(tileset, tiles);
  this.backgroundlayer = this.map.createLayer('BackgroundLayer');
  this.collisionLayer = this.map.createLayer('CollisionLayer');
  this.map.setCollisionByExclusion([], true, 'CollisionLayer');
  //Change the world size to match the size of this layer
  this.collisionLayer.resizeWorld();
}

WorldMap.prototype.getCollisionLayer = function(){
  return this.collisionLayer;
}

WorldMap.prototype.constructor = WorldMap;



module.exports = WorldMap
