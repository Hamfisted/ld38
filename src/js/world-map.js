const Player = require('./player');
const BACKGROUND_TILE_LAYER = "BackgroundLayer";
const COLLISION_TILE_LAYER = "CollisionLayer";
const DOORWAY_TILE_LAYER = "DoorwayLayer";
const OUTDOORWAY_TILE_LAYER = "OutDoorwayLayer";
const SCENARY_TILE_LAYER = "ScenaryLayer";
const VOID_TILE_LAYER = "VoidLayer";
const sounds = require('./sounds');

const TILEMAP_CONFIG = {
  'mall_world': {
    'tilemap': "assets/tilemaps/maps/mall_world.json",
    'tilemap_name': "mall_world_tilemap",
    'tileset': "mall_world",
    'tiles': "assets/tilemaps/tiles/mall_world.png",
    'tiles_name': "mall_world_tiles",
  },
  // 'outside_world': {
  //   'tilemap': "assets/tilemaps/maps/outside_world.json",
  //   'tilemap_name': "outside_world_tilemap",
  //   'tileset': "outside_world",
  //   'tiles': "assets/tilemaps/tiles/outside_world.png",
  //   'tiles_name': "outside_world_tiles",
  // },
  // This is used throughout
  'scene_objects': {
    'tileset': "scene_objects",
    'tiles': "assets/tilemaps/tiles/scene_objects.png",
    'tiles_name': "scene_objects_tiles",
  },
};

// map.js
const WorldMap = function(game) {
  this.environmentKey = "mall_world";
  this.setEnvironment(game, this.environmentKey);
}

WorldMap.preload = function(game) {
  for (let env_key in TILEMAP_CONFIG) {
    let env = TILEMAP_CONFIG[env_key];
    if (env['tilemap']) {
      game.load.tilemap(
        env['tilemap_name'],
        env['tilemap'],
        null,
        Phaser.Tilemap.TILED_JSON
      );
    }

    game.load.image(env['tiles_name'], env['tiles']);
  }
}

WorldMap.prototype.getMap = function() {
  return this.map;
}

WorldMap.prototype.getCollisionLayer = function(){
  return this.collisionLayer;
}

WorldMap.prototype.initGameObjectPosition = function(object, layerName, name='init'){
  for (let obj of this.getObjectsLayer(layerName)) {
    if (obj.name == name) {
      object.x = obj.x;
      object.y = obj.y;
    }
  }
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

WorldMap.prototype.spawnNpc = function(game, objectClass, callback) {
  const objects = this.getObjectsLayer(objectClass.OBJECT_LAYER_NAME);
  for (let obj of objects) {
    var objInstance = new objectClass(game, obj['x'], obj['y'], obj['name']);
    callback(objInstance);
  }
}

WorldMap.prototype.spawnQuestItem = function(game, objectClass, callback) {
  const objects = this.getObjectsLayer('Items');
  for (let obj of objects) {
    var objInstance = new objectClass(game, obj['x'], obj['y'], obj['name']);
    callback(objInstance);
  }
}

WorldMap.prototype.setEnvironment = function(game, env_key) {
  if (this.map) {
    this.map.destroy();
  }

  // Tilemap object
  this.map = game.add.tilemap(TILEMAP_CONFIG[env_key]['tilemap_name']);
  this.map.addTilesetImage(TILEMAP_CONFIG[env_key]['tileset'], TILEMAP_CONFIG[env_key]['tiles_name']);
  this.map.addTilesetImage(TILEMAP_CONFIG['scene_objects']['tileset'], TILEMAP_CONFIG['scene_objects']['tiles_name']);

  this.voidLayer = this.map.createLayer(VOID_TILE_LAYER);
  this.map.setCollisionByExclusion([], true, VOID_TILE_LAYER);
  // Background layer is the floor, mostly
  this.backgroundlayer = this.map.createLayer(BACKGROUND_TILE_LAYER);

  // Walls, obstacles, etc as part of your surroundings
  this.collisionLayer = this.map.createLayer(COLLISION_TILE_LAYER);
  this.map.setCollisionByExclusion([], true, COLLISION_TILE_LAYER);

  //Change the world size to match the size of this layer
  this.collisionLayer.resizeWorld();
  this.doorwayLayer = this.map.createLayer(DOORWAY_TILE_LAYER);
  this.outDoorwayLayer = this.map.createLayer(OUTDOORWAY_TILE_LAYER);
  this.map.setCollisionByExclusion([], true, DOORWAY_TILE_LAYER);
  this.map.setCollisionByExclusion([], true, OUTDOORWAY_TILE_LAYER);
  this.scenaryLayer = this.map.createLayer(SCENARY_TILE_LAYER);

};

WorldMap.prototype.getDoorwayLayer = function() {
  return this.doorwayLayer;
};

WorldMap.prototype.getOutDoorwayLayer = function() {
  return this.outDoorwayLayer;
};

WorldMap.prototype.getVoidLayer = function() {
  return this.voidLayer;
};

WorldMap.prototype.getEnvironmentKey = function() {
  return this.environmentKey;
};

WorldMap.prototype.setEnvironmentKey = function(envKey) {
  this.environmentKey = envKey;
};

WorldMap.prototype.doorwayHandlerGenerator = function(game) {
  let worldMapRef = this;
  return (function(player, door) {
    if (worldMapRef.getEnvironmentKey() == 'mall_world') {
      worldMapRef.setEnvironmentKey('outside_world');
      sounds.stop('mainloop');
      sounds.play('fightloop', 0.2, true);
    } else {
      worldMapRef.setEnvironmentKey('mall_world');
      sounds.stop('fightloop');
      sounds.play('mainloop', 0.2, true);
    }
    worldMapRef.initGameObjectPosition(player, Player.OBJECT_LAYER_NAME, worldMapRef.getEnvironmentKey());
  });
};

WorldMap.prototype.outDoorwayHandlerGenerator = function(player, layer) {
  return (function(player, layer){
    if (player.quest) {
      if (player.quest.name === 'key'){
        this.map.removeTile(161, 44, layer.layer.name);
        this.map.removeTile(162, 44, layer.layer.name);
        this.map.removeTile(161, 45, layer.layer.name);
        this.map.removeTile(162, 45, layer.layer.name);
      }
    }
  }).bind(this);
};

WorldMap.prototype.constructor = WorldMap;

module.exports = WorldMap
