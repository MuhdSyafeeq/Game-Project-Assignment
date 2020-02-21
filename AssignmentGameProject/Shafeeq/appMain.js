var config = {

    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene:
    {
        preload: preload,
        create: create,
        update: update,
    }
};

var game = new Phaser.Game(config);

function preload()
{
    // --> Background
    this.load.image('bg', 'assets/games/starstruck/background.png');
    // --> Background

    // --> TileMaps
    this.load.tilemapTiledJSON('level1', 'assets/games/starstruck/level1-1.json');
    this.load.image('imageTile', 'assets/games/starstruck/tiles-1.png');
    // --> TileMaps

    // --> Player
    this.load.spritesheet('player', 'assets/games/starstruck/dude.png', { frameWidth: 32, frameHeight: 48 });
    // --> Player

    // --> Entities
    // --> Entities

    // --> Collectibles
    this.load.image('star2', 'assets/games/starstruck/star2.png');
    // --> Collectibles
}

var bat;
var player;
var stars;

// ---> Scoring Marks
var score = 0;
var scoreText;
// ---> Scoring Marks

var cdText;
var jpText;

function create()
{
    // --> Background
    var bg = this.add.image(0, 0, 'bg').setOrigin(0, 0);
            /*
    var bg = {};
    for (var counter = 0; counter < 7; counter++)
    {
        bg = this.add.image(counter * 160, 0, 'bg').setOrigin(0, 0);
    }
            */
    // --> Background

    // --> TileMaps
    var map = this.make.tilemap({ key: 'level1' });
    var tileset = map.addTilesetImage('tiles-1', 'imageTile');
    var layer = map.createStaticLayer('World', tileset);
    layer.setCollisionByExclusion([-1, 13, 14, 15, 46, 47, 48, 49, 52], true);
    // 13, 14 small Cactus, 48 spiky tree
    //layer = this.physics.add.staticGroup();
    // --> TileMaps

    // --> Player
    player = this.physics.add.sprite(32, 32, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.body.setGravityY(300);
    this.physics.add.collider(player, layer);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    // --> Player

    // --> Entities
    // --> Entities

    
    // --> Control Navigation
    cursors = this.input.keyboard.createCursorKeys();
    // --> Control Navigation

    // --> Collectibles
    stars = this.physics.add.group({
        key: 'star2',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    this.physics.add.collider(stars, layer);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    // --> Collectibles

    // ---> Score Marks
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '16px', fill: '#FFF' });
    // ---> Score Marks

    // --> Camera
    this.cameras.main.setBounds(0, 0, 1024, 1024);
    this.physics.world.setBounds(0, 0, 1024, 1024);
    this.cameras.main.startFollow(player, true, 0.05, 0.05);
    // --> Camera

    // --> Cooldown Interface
    jpText = this.add.text(16, 58, 'Jump Limit: 2', { fontSize: '16px', fill: '#FFF' });
    cdText = this.add.text(16, 36, 'Cooldown: 0', { fontSize: '16px', fill: '#FFF' });
    // --> Cooldown Interface

}

var jumpLimit = 2;
var cooldown = 0;

function update() {
    jpText.setText('Jump Limit: ' + jumpLimit);
    cdText.setText('Cooldown: ' + cooldown);
    // --> Control Navigation
    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown) { //&& player.body.touching.down
        if (jumpLimit == 2 || jumpLimit == 1)
        {
            player.setVelocityY(-450);
            jumpLimit -= 1;
        }

        if (jumpLimit < 2)
        {
            cooldown = 60;
        }

        if (cooldown == 0)
        {
            jumpLimit += 1;
        }
    }

    if (cooldown != 0)
    {
        cooldown--;
    }
    // --> Control Navigation
}

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);
}