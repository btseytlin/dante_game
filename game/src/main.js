/* Util functions */
function objectFromSpawnPoint(game, spawn_point_obj, sprite_key) {
    let obj = game.physics.add.sprite(spawn_point_obj.x, spawn_point_obj.y, sprite_key); 
    spawn_point_obj.destroy();
    return obj;
}

/* Game */

const textHideDelay = 1200;
const textCharDrawDelay = 30;
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
let dialogues;
let levelObjects = [];
let score = 0;


function preload() {
    /* Load common */

    this.load.spritesheet('tiles', 'assets/tileset.png', 
        {frameWidth: 128, frameHeight: 128});
    this.load.spritesheet('player', 'assets/dante.png',
        {frameWidth: 152, frameHeight: 248});
    this.load.spritesheet('virgil', 'assets/virgil.png',
        {frameWidth: 152, frameHeight: 248});

    /* Load map */

    this.load.tilemapTiledJSON('map', 'maps/level1.json');
    this.load.json('dialogues', 'assets/level1/dialogues.json');

    const level1_assets = [
        'background', 'star1', 'star2', 'star3', 'strip', 
        'tree1', 'tree2', 'tree3', 'tree3', 'tree4', 'tree5', 'tree6',
        'owl',
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
    let player_spawns = map.createFromObjects('game', {name: "player", key: "player"});
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


function initGameObject(game, object) {
    const obj_key = object.name;
    const obj = map.createFromObjects('game', {id: object.id, key: obj_key})[0];

    const obj_clickable = object.properties.filter(property => property.name == 'clickable')[0].value;
    if (obj_clickable === true) {
        obj.setInteractive();

        const obj_dialogues = dialogues[obj.name];
        const phrases = obj_dialogues.phrases;
        const style = obj_dialogues.style;

        const text = game.add.text(-1000, -1000, '');
        text.setOrigin(obj_dialogues.origin[0], obj_dialogues.origin[1]);
        text.setStyle(style);
        text.setPadding(obj_dialogues.padding);
        text.setVisible(0);

        obj.text = {
            'text': text,
            'offset': obj_dialogues.offset, 
            'cur_phrase': -1, 
            "hide_timer": undefined,
            "draw_timer": undefined
        };

        obj.on('pointerdown', function (pointer) {
            if (obj.text.draw_timer && obj.text.draw_timer.getOverallProgress() < 1) {
                obj.text.text.setText(obj.text.draw_timer.args[1])
                obj.text.draw_timer.remove();
                return;
            }

            if (obj.text.hide_timer) {
                obj.text.hide_timer.remove();
            }

            const next_phrase = (obj.text['cur_phrase']+1)%phrases.length

            const next_phrase_text = phrases[next_phrase];

            const draw_timer_event = {
                delay: textCharDrawDelay,
                callback: function(text, phrase_text){
                    if (!this.char) {
                        this.char = 0;
                    }
                    text.setText(next_phrase_text.slice(0, this.char));
                    this.char += 1;
                },
                args: [text, next_phrase_text],
                repeat: next_phrase_text.length,
            }

            obj.text['draw_timer'] = game.time.addEvent(draw_timer_event);
            obj.text['cur_phrase'] = next_phrase;

            const hide_timer_event = {
                delay: textCharDrawDelay * next_phrase_text.length + textHideDelay,
                callback: function(text){
                    text.text.setVisible(0);
                    text.text.setText('');
                    if (text.draw_timer) {
                        text.draw_timer.remove();
                    }
                },
                args: [obj.text],
            }

            obj.text.hide_timer = game.time.addEvent(hide_timer_event);
            text.setVisible(1);
        });

    }
    return obj;
}

function initGameObjects(game, map) {
    const objectsLayer = map.objects.filter(layer => layer.name == 'game')[0];
    for (let object of objectsLayer.objects) {
        if (['player', 'virgil'].includes(object.name)) {
            continue
        }

        const new_sprite = initGameObject(game, object);

        levelObjects.push(new_sprite);
    }

    player = initPlayer(game, map);
    virgil = initVirgil(game, map);
    game.physics.add.collider(groundLayer, player);
    game.physics.add.collider(groundLayer, virgil);
}

function create() {
    dialogues = this.cache.json.get('dialogues');

    map = initMap(this);
    initBackground(this, map);
    groundLayer = initGround(this, map);  
    
    initGameObjects(this, map);

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

    for (let obj of levelObjects) {
        const textBulb = obj.text;
        let text = textBulb.text;

        text.x = obj.x + textBulb.offset[0];
        text.y = obj.y + textBulb.offset[1];
    }
 }


function collectCoin(sprite, tile) {
    coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
    score ++; // increment the score
    text.setText(score); // set the text to show the current score
    return false;
}