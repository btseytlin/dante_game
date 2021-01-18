/* Util functions */
function objectFromSpawnPoint(game, spawn_point_obj, sprite_key) {
    let obj = game.physics.add.sprite(spawn_point_obj.x, spawn_point_obj.y, sprite_key); 
    spawn_point_obj.destroy();
    return obj;
}

/* Game */


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
    this.load.tilemapTiledJSON('map', 'maps/level1.json');
    this.load.spritesheet('tiles', 'maps/tileset.png', 
        {frameWidth: 128, frameHeight: 128});
    this.load.atlas('player', 'assets/player.png', 'assets/player.json');
}

function initMap(game) {
    return game.add.tilemap('map');
}

function initGround(game, map) {
    let groundTiles = map.addTilesetImage('tiles', 'tiles');
    let ground = map.createLayer('ground', groundTiles);
    ground.setCollisionByExclusion([-1]);
 
    game.physics.world.bounds.width = ground.width;
    game.physics.world.bounds.height = ground.height;

    return ground;
}

function initBackground(game) {
    map = game.add.tilemap('map');
    let groundTiles = map.addTilesetImage('tiles', 'tiles');
    let ground = map.createLayer('ground', groundTiles);
    ground.setCollisionByExclusion([-1]);
 
    game.physics.world.bounds.width = ground.width;
    game.physics.world.bounds.height = ground.height;

    return ground;
}


function initPlayer(game, map) {
    let player_spawn = map.createFromObjects('game', {name: "player"}, {key: 'player'});
    let ply_spawn = player_spawn[0];

    let ply = objectFromSpawnPoint(game, ply_spawn, 'player')
    ply.setBounce(0.1); // our player will bounce from items
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
        key: 'player_walk',
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
    map = initMap(this);
    groundLayer = initGround(this, map);  
    player = initPlayer(this, map);
    
    this.physics.add.collider(groundLayer, player);

    cursors = initInput(this);

    initCamera(this);

    initAnimations(this);

    text = initUI(this);
}
 
function update() {
    if (cursors.left.isDown) // if the left arrow key is down
    {
        player.body.setVelocityX(-200); // move left
        player.anims.play('player_walk', true); // play walk animation
        player.flipX= true; // flip the sprite to the left
    }
    else if (cursors.right.isDown) // if the right arrow key is down
    {
        player.body.setVelocityX(200); // move right
        player.anims.play('player_walk', true); // play walk animatio
        player.flipX = false; // use the original sprite looking to the right
    } else if (player.body.onFloor()) {
        player.body.setVelocityX(0);
        player.anims.play('player_walk', false);
    }

    if ((cursors.space.isDown || cursors.up.isDown) && player.body.onFloor())
    {
        player.body.setVelocityY(-500); // jump up
        player.anims.play('player_walk', true);
    } 
 }


function collectCoin(sprite, tile) {
    coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
    score ++; // increment the score
    text.setText(score); // set the text to show the current score
    return false;
}