const config = {
  type: Phaser.AUTO, // Which renderer to use
  width: 1600, // Canvas width in pixels
  height: 1120, // Canvas height in pixels
  parent: "game-container", // ID of the DOM element to add the canvas to
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 }, // Top down game, so no gravity
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
var fire;
var health = 3;
var healthText;
var gameOver = false;
var burnStatus = false;
var refreshStatus = 0;
var jumpLimit;

function preload() {
	// Runs once, loads up assets like images and audio
	this.load.image("background","assets/images/4.png");
	this.load.image("background2","assets/images/3.png");
	this.load.tilemapTiledJSON("level1","assets/tileMap/LevelA2.json");
	this.load.image("tileSet","assets/tileSet/TilesSet16x16(E).png");
	this.load.multiatlas('player', 'assets/mainCharacter.json', 'assets');
	this.load.multiatlas('object', 'assets/object.json', 'assets');  
}

function create() {
	// Runs once, after all assets in preload are loaded
	this.add.image (0,0,"background").setOrigin(0,0);
	this.add.image (0,0,"background2").setOrigin(0,0);
	
	
	map = this.make.tilemap({ key: "level1" });
	
	// Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
	// Phaser's cache (i.e. the name you used in preload)
	tileset = map.addTilesetImage("TilesSet16x16(E)", "tileSet");

	// Parameters: layer name (or index) from Tiled, tileset, x, y
	behindLayer = map.createStaticLayer("World Background", tileset, 0, 0);

	worldLayer = map.createStaticLayer("Player Path", tileset, 0, 0);
	
	spawnPoint = map.findObject("SpawnPoint", obj => obj.name === "Spawn Point");
	
	//Player creation + animation
	player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y-10, 'player', 'Walking/0_Golem_Walking_000.png');
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
/*	
	var doubleJumpFrames = this.anims.generateFrameNames('player', {
                         start: 1, end: 5, zeroPad: 3,
                         prefix: 'Jump_Loop/0_Golem_Jump_Loop_', suffix: '.png'
                     });
					 
	this.anims.create({ key: 'doubleJump', frames: doubleJumpFrames, frameRate: 10, repeat: -1 });
    player.anims.play('doubleJump');
	
	
	var hurtFrames = this.anims.generateFrameNames('player', {
                         start: 1, end: 11, zeroPad: 3,
                         prefix: 'Hurt/0_Golem_Hurt_', suffix: '.png'
                     });
					 
	this.anims.create({ key: 'hurt', frames: hurtFrames, frameRate: 10, repeat: -1 });
*/
	
	//Fire creation + animation
	fire = this.physics.add.sprite(150, 450, 'object', 'fire/Fogo_1.png');
	
	var fireFrames = this.anims.generateFrameNames('object', {
                         start: 1, end: 4, zeroPad: 1,
                         prefix: 'fire/Fogo_', suffix: '.png'
                     });
					 
	this.anims.create({ key: 'fireburnStatusing', frames: fireFrames, frameRate: 10, repeat: -1 });
    fire.anims.play('fireburnStatusing');
	fire.setSize(40, 35, true);	//Collision box
	fire.body.offset.y = 115;
	fire.body.offset.x = 110;
	
	//Collision
	//this.physics.arcade.enable(player);
	worldLayer.setCollisionByExclusion(-1, true);
	player.setCollideWorldBounds(true);
	player.setBounce(0.2);
	
	// To simulate gravity on a sprite 
	player.body.setGravityY(160);
	
	this.physics.add.collider(player, worldLayer);
	this.physics.add.collider(fire, worldLayer);

	//Overlap with fire
	this.physics.add.overlap(player, fire, burnDamage, null, this);
	
	//Simple healthbar (text based)
	healthText = this.add.text(1100, 280, `Health: ${health}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });
    healthText.setScrollFactor(0);
	
	//Camera
	this.cameras.main.startFollow(player).setFollowOffset(-250, 50).setZoom(1.8); //Camera follows player
	
	
	// Check for collision before check for input
	//  Populates cursors objects with four properties:, up,down,left,right
	cursors = this.input.keyboard.createCursorKeys();
	
}

function update(time, delta) {

	refreshStatus+= 0.25;
	
	if (refreshStatus % 10 == 0){
		checkStatus(); 
	}
	
	if (gameOver)
    {
		this.physics.pause(); // stop the game
		player.anims.play('idle',true);
        return;
    }
	
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
    if (cursors.up.isDown && player.body.onFloor()) // jump
    {
        player.setVelocityY(-280);
    }
}


function burnDamage(player, fire){
	//player.anims.play('hurt');
	if (!burnStatus){
		player.setTint(0xff0000); // set player color
		health--;
		burnStatus = true;
		updateHealth();
	}
	return false;
}

function updateHealth (){
	healthText.setText(`Health: ${health}`);
	if (health === 0){
		 gameOver = true; 
	}
}

function checkStatus(){
	player.clearTint();
	burnStatus = false;
}