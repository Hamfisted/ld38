module.exports = function preloadSprites(game) {
  // sheets
  game.load.spritesheet('player', 'assets/sprites/player.png', 32, 32);
  game.load.spritesheet('hearts', 'assets/sprites/hearts.png', 7, 7);
  game.load.spritesheet('hearts42x14', 'assets/sprites/hearts42x14.png', 14, 14);
  game.load.spritesheet('hearts63x21', 'assets/sprites/hearts63x21.png', 21, 21);
  game.load.spritesheet('player', 'assets/sprites/player.png', 32, 32);
  game.load.spritesheet('ant_green_walk', 'assets/sprites/ant_green_walk.png', 32, 32);
  game.load.spritesheet('ant_pink_walk', 'assets/sprites/ant_pink_walk.png', 32, 32);
  game.load.spritesheet('ant_yellow_flying', 'assets/sprites/ant_yellow_flying.png', 32, 32);

  // player static, probably don't need these
  game.load.image('player_up', 'assets/sprites/player/up.png');
  game.load.image('player_down', 'assets/sprites/player/down.png');
  game.load.image('player_left', 'assets/sprites/player/left.png');
  game.load.image('player_right', 'assets/sprites/player/right.png');

  // player sheets
  game.load.spritesheet('player_up_bob', 'assets/sprites/player/up_bob.png', 32, 32);
  game.load.spritesheet('player_down_bob', 'assets/sprites/player/down_bob.png', 32, 32);
  game.load.spritesheet('player_left_bob', 'assets/sprites/player/left_bob.png', 32, 32);
  game.load.spritesheet('player_right_bob', 'assets/sprites/player/right_bob.png', 32, 32);

  game.load.spritesheet('player_up_walk', 'assets/sprites/player/up_walk.png', 32, 32);
  game.load.spritesheet('player_down_walk', 'assets/sprites/player/down_walk.png', 32, 32);
  game.load.spritesheet('player_left_walk', 'assets/sprites/player/left_walk.png', 32, 32);
  game.load.spritesheet('player_right_walk', 'assets/sprites/player/right_walk.png', 32, 32);

  game.load.spritesheet('player_up_attack', 'assets/sprites/player/up_attack.png', 32, 32);
  game.load.spritesheet('player_down_attack', 'assets/sprites/player/down_attack.png', 32, 32);
  game.load.spritesheet('player_left_attack', 'assets/sprites/player/left_attack.png', 32, 32);
  game.load.spritesheet('player_right_attack', 'assets/sprites/player/right_attack.png', 32, 32);


  game.load.image('ant', 'assets/sprites/ant.png');
  game.load.image('npc', 'assets/sprites/npc.png');
  game.load.image('old_guy', 'assets/sprites/old_guy.png');
  game.load.image('pretzel', 'assets/sprites/pretzel.png');
  game.load.image('hockey_stick', 'assets/sprites/hockey_stick.png');
  game.load.image('baseball_bat', 'assets/sprites/baseball_bat.png');

  game.load.image('ant_yellow_part', 'assets/sprites/ant_yellow_part.png');
  game.load.image('ant_green_part', 'assets/sprites/ant_green_part.png');
  game.load.image('ant_pink_part', 'assets/sprites/ant_pink_part.png');
  game.load.image('yellow_pretzel', 'assets/sprites/yellow_pretzel.png');
  game.load.image('green_pretzel', 'assets/sprites/green_pretzel.png');
  game.load.image('pink_pretzel', 'assets/sprites/pink_pretzel.png');
  game.load.image('yellow_pretzel_stand', 'assets/sprites/yellow_pretzel_stand.png');
  game.load.image('green_pretzel_stand', 'assets/sprites/green_pretzel_stand.png');
  game.load.image('pink_pretzel_stand', 'assets/sprites/pink_pretzel_stand.png');

  game.load.image('area', 'assets/sprites/area.png');
  game.load.image('textbox', 'assets/sprites/textbox.png');
};
