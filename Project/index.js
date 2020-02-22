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
//Game objects
var player;
var cursors;
var fire;
var platform;
var spikes;
var bat;

//Health
var health = 3;
var healthText;

//Coins
var coins;
var coinScore = 0;
var coinText;

//Status
var gameOver = false;
var losingHealth = false;
var refreshStatus = 0;

//For jumping
var jumpLimit;
var jumping;

function preload() {
	// Runs once, loads up assets like images and audio
	//Clear cache
	//this.textures.remove('monsters');
	
	this.load.image("background","assets/images/4.png");
	this.load.image("background2","assets/images/3.png");
	this.load.image("star","assets/images/coin.png");
	this.load.tilemapTiledJSON("level1","assets/tileMap/LevelA2.json");
	this.load.image("tileSet","assets/tileSet/TilesSet16x16(E).png");
	this.load.multiatlas('player', 'assets/mainCharacter.json', 'assets');
	this.load.multiatlas('object', 'assets/object.json', 'assets'); 
	this.load.multiatlas('monsters', 'assets/monsters.json', 'assets');
	this.load.image("platform","assets/images/platform.png");
	this.load.image("upSpikes","assets/images/UpSpikes.png");
	this.load.setPath('assets/');
	
}

function create() {
	// Runs once, after all assets in preload are loaded
	this.add.image (0,0,"background").setOrigin(0,0);
	this.add.image (0,0,"background2").setOrigin(0,0);
	
	const map = this.make.tilemap({ key: "level1" });
	
	// Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
	// Phaser's cache (i.e. the name you used in preload)
	const tileset = map.addTilesetImage("TilesSet16x16(E)", "tileSet");

	// Parameters: layer name (or index) from Tiled, tileset, x, y
	const behindLayer = map.createStaticLayer("World Background", tileset, 0, 0);
	const worldLayer = map.createStaticLayer("Player Path", tileset, 0, 0);	
	spawnPoint = map.findObject("SpawnPoint", obj => obj.name === "Spawn Point");
	var coinLayer = map.getObjectLayer('Collectibles')['objects'];
	
	//Player creation + animation
	player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y-30, 'player', 'Walking/0_Golem_Walking_000.png');
	player.setSize(40,70, true);
	player.setBounce(0.2);
	player.setDrag(50, 50);
	
	var walkFrames = this.anims.generateFrameNames('player', {
                         start: 0, end: 23, zeroPad: 3,
                         prefix: 'Walking/0_Golem_Walking_', suffix: '.png'
                     });				 
	this.anims.create({ key: 'right', frames: walkFrames, frameRate: 10, repeat: -1 });
	 player.anims.play('right');

	
	var idleFrames = this.anims.generateFrameNames('player', {
                         start: 0, end: 17, zeroPad: 3,
                         prefix: 'Idle_Blinking/0_Golem_Idle Blinking_', suffix: '.png'
                     });
	this.anims.create({ key: 'idle', frames: idleFrames, frameRate: 10, repeat: -1 });
    player.anims.play('idle');
	
	var walkLeftFrames = this.anims.generateFrameNames('player', {
                         start: 0, end: 23, zeroPad: 3,
                         prefix: 'WalkingLeft/0_Golem_Walking_', suffix: '.png'
                     });				 
	this.anims.create({ key: 'left', frames: walkLeftFrames, frameRate: 10, repeat: -1 });
	player.anims.play('left');
	
	var jumpFrames = this.anims.generateFrameNames('player', {
                         start: 0, end: 5, zeroPad: 3,
                         prefix: 'Jump_Start/0_Golem_Jump Start_', suffix: '.png'
                     });
					 
	this.anims.create({ key: 'jump', frames: jumpFrames, frameRate: 10, repeat: -1 });
	player.anims.play('jump');
	
	//console.log(this.textures.get('player').frames);

	//Fire creation + animation
	fire = this.physics.add.sprite(1230, 780, 'object', 'fire/Fogo_1.png').setScale(2.0);
	fire.setSize(40, 35, true);	//Collision box
	
	var fireFrames = this.anims.generateFrameNames('object', {
                         start: 1, end: 4, zeroPad: 1,
                         prefix: 'fire/Fogo_', suffix: '.png'
                     });
					 
	this.anims.create({ key: 'fireburnStatusing', frames: fireFrames, frameRate: 10, repeat: -1 });
    fire.anims.play('fireburnStatusing');

	fire.body.offset.y = 115;
	fire.body.offset.x = 110;
	
	console.log(this.textures.get('monsters').frames);
	
	//Bat
	
	bat = this.physics.add.sprite(800, 420, 'monsters', 'bat/Fly/__Bat02_Fly_000.png').setVelocityX(50);
	bat.body.setAllowGravity(false);
	bat.setSize(115,60, true);
	
	var batWalkFrames = this.anims.generateFrameNames('monsters', {
                         start: 0, end: 7, zeroPad: 3,
                         prefix: 'bat/Fly/__Bat02_Fly_', suffix: '.png'
                     });
					 
	this.anims.create({ key: 'batRight', frames: batWalkFrames, frameRate: 10, repeat: -1 });
    bat.anims.play('batRight');
	
	var batWalkLeftFrames = this.anims.generateFrameNames('monsters', {
                         start:0, end: 23, zeroPad: 3,
                         prefix: 'bat/FlyLeft/__Bat02_Fly_', suffix: '.png'
                     });
					 
	this.anims.create({ key: 'batLeft', frames: batWalkLeftFrames, frameRate: 10, repeat: -1 });
    bat.anims.play('batLeft');
	
	//Coins
	coins = this.physics.add.staticGroup()
    //this is how we actually render our coin object with coin asset we loaded into our game in the preload function
    
	coinLayer.forEach(object => {
    let obj = coins.create(object.x, object.y, "star"); 
	   obj.setScale(object.width/16, object.height/16); 
	   //obj.setOrigin(0); // Not needed here
	   obj.body.width = object.width; 
	   obj.body.height = object.height; 
	});
	
	//Platform (move up and down)
	platform = this.physics.add.image(450, 600, 'platform').setImmovable(true);
	platform.body.setAllowGravity(false);
	
	this.tweens.timeline({
		targets: platform.body.velocity,
		loop: -1,
		tweens: [
		  { x:    0, y: -150, duration: 2500, ease: 'Stepped' },
		  { x:    0, y:  150, duration: 2500, ease: 'Stepped' },
		]
	});
	
	
	//Spikes
	spikes = this.physics.add.image(342, 828, 'upSpikes').setImmovable(true).setScale(1.5);
	spikes.body.setAllowGravity(false);
	this.physics.add.collider(player, spikes, loseHealth, null, this);
	
	spikes = this.physics.add.image(412, 828, 'upSpikes').setImmovable(true).setScale(1.5);
	spikes.body.setAllowGravity(false);
	this.physics.add.collider(player, spikes, loseHealth, null, this);
	
	//Collision
	//this.physics.arcade.enable(player);
	worldLayer.setCollisionByExclusion(-1, true);
	player.setCollideWorldBounds(true);
	
	// To simulate gravity on a sprite 
	player.body.setGravityY(160);
	
	this.physics.add.collider(player, platform);
	this.physics.add.collider(player, worldLayer);
	this.physics.add.collider(fire, worldLayer);
	//this.physics.add.collider(bat, worldLayer);
	
	//Overlap w monster
	this.physics.add.overlap(player, bat, loseHealth, null, this);
	//Collide with spikes
	this.physics.add.collider(player, spikes, loseHealth, null, this);
	//Overlap with fire
	this.physics.add.overlap(player, fire, loseHealth, null, this);
	//Overlap with coins
	this.physics.add.overlap(player, coins, collectCoin, null, this);
	
	//Simple healthbar (text based)
	healthText = this.add.text(1100, 290, `Health: ${health}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });
    healthText.setScrollFactor(0);
	
	//Coin text
	coinText = this.add.text(1100, 260, `Coins: ${coinScore}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });
    coinText.setScrollFactor(0);
	//Camera
	this.cameras.main.startFollow(player).setFollowOffset(-250, 50).setZoom(1.8); //Camera follows player
	
	
	// Check for collision before check for input
	//  Populates cursors objects with four properties:, up,down,left,right
	cursors = this.input.keyboard.createCursorKeys();
	
}

function update(time, delta) {

	refreshStatus+= 0.25;
	
	if (!gameOver) {
		if (refreshStatus % 50 == 0){
			checkStatus(); 
		}
	} else {
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
	
	//onFloor()
	if ( player.body.onFloor() || player.body.touching.down ){
		jumpLimit = 2;
		jumping = false;
	}
	// player.body.touching.down -> on the floor; else, can jump mid-air
    if ( Phaser.Input.Keyboard.JustDown(cursors.up) && jumpLimit > 0 ) // jump
    {
		player.setVelocityY(-280);
		player.anims.play('jump', true);
		jumping = true;	
    }
	
	if ( jumping && cursors.up.isUp ) {
		jumpLimit--;
		jumping = false;
	}
	
	//Patrolling bat
	if ( bat.x > 900 ){
		bat.setVelocityX(-50);
	} else if ( bat.x < 750 ) {
		bat.setVelocityX(50);
	}
		
	if ( bat.body.velocity.x > 0){
		bat.anims.play('batRight');	
	} else {
		bat.anims.play('batLeft');
	}
}


function loseHealth(player, object){
	//player.anims.play('hurt');
	if (!losingHealth){
		losingHealth = true;
		player.setTint(0xff0000); // set player color
		health--;
		updateHealth();
	}
}

function updateHealth (){
	healthText.setText(`Health: ${health}`);
	if (health === 0){
		gameOver = true; 
	}
}

function checkStatus(){
	player.clearTint();
	losingHealth = false;
}

function collectCoin(player, coin) {
    coin.destroy(coin.x, coin.y); // remove the tile/coin
    coinScore ++; // increment the score
    coinText.setText(`Coins: ${coinScore}`); // set the text to show the current score
    return false;
}