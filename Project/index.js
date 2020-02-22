

const config = {
  type: Phaser.AUTO, // Which renderer to use
  width: 800, // Canvas width in pixels
  height: 600, // Canvas height in pixels
  parent: "game-container", // ID of the DOM element to add the canvas to
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 600 }, // Top down game, so no gravity
	  debug: true
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
var player;
var cursors;

function preload() {
	// Runs once, loads up assets like images and audio
	this.load.image("background","assets/images/4.png");
	this.load.image("background2","assets/images/3.png");
	this.load.tilemapTiledJSON("level0","assets/tileMap/Level0.json");
	this.load.image("tileSet","assets/tileSet/tileset32x32.png");
	this.load.multiatlas('player', 'assets/mainCharacter.json', 'assets');
	  
}

function create() {
	// Runs once, after all assets in preload are loaded
	this.add.image (0,0,"background").setOrigin(0,0).setScale(0.9);
	this.add.image (0,0,"background2").setOrigin(0,0).setScale(0.9);
	map = this.make.tilemap({ key: "level0" });
	this.debugGraphics = this.add.graphics();

	// Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
	// Phaser's cache (i.e. the name you used in preload)
	tileset = map.addTilesetImage("tiles-1", "tileSet");

	// Parameters: layer name (or index) from Tiled, tileset, x, y
	worldLayer = map.createStaticLayer("World", tileset, 0, 360).setScale(1.57);
	worldLayer.setCollisionByProperty({ collides: true });
	
	behindLayer = map.createStaticLayer("Behind Player", tileset, 0, 360).setScale(1.57);
	spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
	
	player = this.physics.add.sprite(spawnPoint.x+75, spawnPoint.y+410, 'player', 'Walking/0_Golem_Walking_000.png');
	player.setSize(40,60, true);
	var walkFrames = this.anims.generateFrameNames('player', {
                         start: 1, end: 23, zeroPad: 3,
                         prefix: 'Walking/0_Golem_Walking_', suffix: '.png'
                     });
					 
	this.anims.create({ key: 'right', frames: walkFrames, frameRate: 10, repeat: -1 });
    player.anims.play('right');
	
	var idleFrames = this.anims.generateFrameNames('player', {
                         start: 1, end: 17, zeroPad: 3,
                         prefix: 'Idle_Blinking/0_Golem_Idle Blinking_', suffix: '.png'
                     });
	this.anims.create({ key: 'idle', frames: idleFrames, frameRate: 10, repeat: -1 });
    player.anims.play('idle');
	
	var walkLeftFrames = this.anims.generateFrameNames('player', {
                         start: 1, end: 23, zeroPad: 3,
                         prefix: 'WalkingLeft/0_Golem_Walking_', suffix: '.png'
                     });
					 
	this.anims.create({ key: 'left', frames: walkLeftFrames, frameRate: 10, repeat: -1 });
    player.anims.play('left');
	
	var jumpFrames = this.anims.generateFrameNames('player', {
                         start: 1, end: 5, zeroPad: 3,
                         prefix: 'Jump_Start/0_Golem_Jump Start_', suffix: '.png'
                     });
					 
	this.anims.create({ key: 'jump', frames: jumpFrames, frameRate: 10, repeat: -1 });
    player.anims.play('jump');
	
	//  Populates cursors objects with four properties:, up,down,left,right
	cursors = this.input.keyboard.createCursorKeys();

	
	//this.physics.arcade.enable(player);
	player.setCollideWorldBounds(true);
	player.setBounce(0.2);
	this.physics.add.collider(player, worldLayer);
	
	this.cameras.main.startFollow(player).setFollowOffset(-250, 100).setZoom(1.3); //Camera follows player

	
	// To simulate gravity on a sprite 
	player.body.setGravityY(3000); 
	
	map.renderDebug(this.debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128), 
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) 
    });
}

function update(time, delta) {
	// Stop any previous movement from the last frame
	player.body.setVelocity(0);
	
  // Runs once per frame for the duration of the scene
	if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
	else if (cursors.left.isDown)
	{
		player.setVelocityX(-160);
		player.anims.play('left', true);
	}
	else
    {
        player.setVelocityX(0);

        player.anims.play('idle', true);
    }
	
	// player.body.touching.down -> on the floor; else, can jump mid-air
	if (cursors.up.isDown )
	{
		player.setVelocityY(-160);
		player.anims.play('jump', true);
		/* Double jump
		if (cursors.up.isDown){
			player.setVelocityY(-160);
			player.anims.play('doubleJump', true);
		}*/
	}
	
}