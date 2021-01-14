let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: false
        }
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};
 
let game = new Phaser.Game(config);
 
let map;
let player;
let cursors;
let groundLayer, coinLayer;
let text;
let score = 0;


function preload() {
    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    // tiles in spritesheet 
    this.load.spritesheet('tiles', 'assets/tiles.png', {frameWidth: 70, frameHeight: 70});
    // simple coin image
    this.load.image('coin', 'assets/coinGold.png');
    // player animations
    this.load.atlas('player', 'assets/player.png', 'assets/player.json');
}

function initGround(game) {
    map = game.make.tilemap({key: 'map'});
    let groundTiles = map.addTilesetImage('tiles');

    let ground = map.createLayer('World', groundTiles, 0, 0);
    ground.setCollisionByExclusion([-1]);
 
    game.physics.world.bounds.width = ground.width;
    game.physics.world.bounds.height = ground.height;

    return ground;
}

function initPlayer(game) {
    let ply = game.physics.add.sprite(200, 200, 'player'); 
    ply.setBounce(0.2); // our player will bounce from items
    ply.setCollideWorldBounds(true); // don't go out of the map

    return ply;    
}

function initInput(game) {
    return game.input.keyboard.createCursorKeys();
}

function initCamera(game) {
     // set bounds so the camera won't go outside the game world
    game.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // make the camera follow the player
    game.cameras.main.startFollow(player);
    
    // set background color, so the sky is not black    
    game.cameras.main.setBackgroundColor('#ccccff');
}

function initAnimations(game) { 
    game.anims.create({
        key: 'walk',
        frames: game.anims.generateFrameNames('player', 
            { prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2 }),
        frameRate: 10,
        repeat: -1
    });
}

function initUI(game) { 
    let txt = game.add.text(20, 570, '0', {
        fontSize: '20px',
        fill: '#ffffff'
    });
    txt.setScrollFactor(0);
    return txt
}

function create() {
    groundLayer = initGround(this); 
    player = initPlayer(this);
    
    this.physics.add.collider(groundLayer, player);

    cursors = initInput(this);

    initCamera(this);

    initAnimations(this);


    // coin image used as tileset
    var coinTiles = map.addTilesetImage('coin');
    // add coins as tiles
    coinLayer = map.createLayer('Coins', coinTiles, 0, 0);

    coinLayer.setTileIndexCallback(17, collectCoin, this); // the coin id is 17
    // when the player overlaps with a tile with index 17, collectCoin will be called 


    this.physics.add.overlap(player, coinLayer);


    text = initUI(this);
}
 
function update() {
    if (cursors.left.isDown) // if the left arrow key is down
    {
        player.body.setVelocityX(-200); // move left
        player.anims.play('walk', true); // play walk animation
        player.flipX= true; // flip the sprite to the left
    }
    else if (cursors.right.isDown) // if the right arrow key is down
    {
        player.body.setVelocityX(200); // move right
        player.anims.play('walk', true); // play walk animatio
        player.flipX = false; // use the original sprite looking to the right
    } else if (player.body.onFloor()) {
        player.body.setVelocityX(0);
        player.anims.play('walk', false);
    }

    if ((cursors.space.isDown || cursors.up.isDown) && player.body.onFloor())
    {
        player.body.setVelocityY(-500); // jump up
        player.anims.play('idle', true);
    } 
 }


function collectCoin(sprite, tile) {
    coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
    score ++; // increment the score
    text.setText(score); // set the text to show the current score
    return false;
}