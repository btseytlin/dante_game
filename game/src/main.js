/* Util functions */
function objectFromSpawnPoint(game, spawn_point_obj, sprite_key) {
    let obj = game.physics.add.sprite(spawn_point_obj.x, spawn_point_obj.y, sprite_key); 
    spawn_point_obj.destroy();
    return obj;
}

/* Game */

const screenWidth = 800;
const screenHeight = 600;
const plySpeed = 500;

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 1500},
            debug: true
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
let groundLayer;
let text;
let score = 0;


function preload() {
    this.load.tilemapTiledJSON('map', 'maps/level1.json');
    this.load.spritesheet('tiles', 'assets/tileset.png', 
        {frameWidth: 128, frameHeight: 128});
    this.load.spritesheet('player', 'assets/dante.png',
        {frameWidth: 152, frameHeight: 248});
    this.load.spritesheet('virgil', 'assets/virgil.png',
        {frameWidth: 152, frameHeight: 248});

    const level1_assets = [
        'background', 'star1', 'star2', 'star3', 'strip', 
        'tree1', 'tree2', 'tree3', 'tree3', 'tree4', 'tree5', 'tree6',
        'headline'
    ]

    for (let image_key of level1_assets) {
        this.load.image(image_key, 'assets/level1/' + image_key + '.png');
    }
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

function initBackground(game, map) {

    for (let img of map.imageCollections[0].images) {
        let parts = img.image.split('/');
        const fname = parts[parts.length - 1];
        const key = fname.split('.')[0];
        map.createFromObjects('background', {gid: img.gid, key: key});

    }

    for (let img of map.imageCollections[0].images) {
        let parts = img.image.split('/');
        const fname = parts[parts.length - 1];
        const key = fname.split('.')[0];
        map.createFromObjects('background_objects_2', {gid: img.gid, key: key});
    }

    for (let img of map.imageCollections[0].images) {
        let parts = img.image.split('/');
        const fname = parts[parts.length - 1];
        const key = fname.split('.')[0];
        map.createFromObjects('background_objects_1', {gid: img.gid, key: key});
    }

    
}


function initPlayer(game, map) {
    let player_spawns = map.createFromObjects('game', {name: "player"});
    let ply_spawn = player_spawns[0];

    let ply = objectFromSpawnPoint(game, ply_spawn, 'player')
    ply.setBounce(0.1); // our player will bounce from items
    ply.setCollideWorldBounds(true); // don't go out of the map
    return ply;    
}

function initVirgil(game, map) {
    let spawns = map.createFromObjects('game', {name: "virgil"});
    let spawn = spawns[0];

    let obj = objectFromSpawnPoint(game, spawn, 'virgil')
    obj.setBounce(0.1); // our player will bounce from items
    obj.setCollideWorldBounds(true); // don't go out of the map
    return obj;    
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
        key: 'idle',
        frames: game.anims.generateFrameNames('player', 
            { start: 0, end: 0}),
        frameRate: 10,
        repeat: -1
    });

    game.anims.create({
        key: 'player_walk',
        frames: game.anims.generateFrameNames('player', 
            { start: 0, end: 4}),
        frameRate: 5,
        repeat: -1
    });


    game.anims.create({
        key: 'virgil_walk',
        frames: game.anims.generateFrameNames('virgil', 
            { start: 0, end: 3}),
        frameRate: 5,
        repeat: -1
    });
}

function initUI(game) { 

    let headline_img = game.add.sprite(screenWidth/2, 50, 'headline');
    headline_img.setScrollFactor(0);
    headline_img.scale = 0.6;

    let txt = game.add.text(20, 570, '0', {
        fontSize: '20px',
        fill: '#ffffff'
    });
    txt.setScrollFactor(0);
    return txt
}

function create() {
    map = initMap(this);
    initBackground(this, map);
    groundLayer = initGround(this, map);  
    player = initPlayer(this, map);
    virgil = initVirgil(this, map);
    this.physics.add.collider(groundLayer, player);
    this.physics.add.collider(groundLayer, virgil);
    cursors = initInput(this);
    initCamera(this);
    initAnimations(this);
    text = initUI(this);
}
 
function update() {
    if (cursors.left.isDown) // if the left arrow key is down
    {
        player.body.setVelocityX(-plySpeed); // move left
        player.anims.play('player_walk', true); // play walk animation
        player.flipX= true; // flip the sprite to the left
    }
    else if (cursors.right.isDown) // if the right arrow key is down
    {
        player.body.setVelocityX(plySpeed); // move right
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