/* Util functions */
function loadFont(name, url) {
    var newFont = new FontFace(name, `url(${url})`);
    newFont.load().then(function (loaded) {
        document.fonts.add(loaded);
    }).catch(function (error) {
        return error;
    });
}

function objectFromSpawnPoint(game, spawn_point_obj, sprite_key) {
    let obj = game.physics.add.sprite(spawn_point_obj.x, spawn_point_obj.y, sprite_key); 
    spawn_point_obj.destroy();
    return obj;
}

/* Game */

const UIScale = 0.6;
const textHideDelay = 2400;
const textCharDrawDelay = 7;
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

let groundLayer;

let player;
let virgil;
let elevator_doors;
let levelObjects = [];

let cursors;
let text;
let dialogues;

let score = 0;
let ui = {};

let changeLevelRequested = false;

function preload() {
    /* Load common */

    this.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);

    loadFont("ffforward", "assets/fonts/FFFFORWA.TTF");

    this.load.spritesheet('tiles', 'assets/tileset.png', 
        {frameWidth: 128, frameHeight: 128});
    this.load.spritesheet('player', 'assets/dante.png',
        {frameWidth: 152, frameHeight: 248});
    this.load.spritesheet('virgil', 'assets/virgil.png',
        {frameWidth: 152, frameHeight: 248});

    this.load.spritesheet('elevator', 'assets/elevator.png', 
        {frameWidth: 350, frameHeight: 392});
    this.load.spritesheet('elevator_doors', 'assets/elevator_doors.png', 
        {frameWidth: 196, frameHeight: 322});

    const ui_assets = ['button_left_active', 'button_left_passive', 'button_right_active', 'button_right_passive']
    for (let image_key of ui_assets) {
        this.load.image(image_key, 'assets/ui/' + image_key + '.png');
    }

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

function changeLevel() {
    console.log('level change!')
}

function onElevatorDoorsCollidePlayer(game) {
    if (!changeLevelRequested) {
        changeLevelRequested = true;
        elevator_doors.setVisible(true);
        elevator_doors.anims.play('elevator_doors_close', false);

        const timer = game.time.addEvent({
                delay: 600,
                callback: changeLevel,
                loop: false
        });
    }
}

function initElevatorDoors(game, map, player) {
    let elevator_doors_spawn = map.createFromObjects('game', {name: "elevator_doors", key: "elevator_doors"})[0];
    let elevator_doors = objectFromSpawnPoint(game, elevator_doors_spawn, 'elevator_doors');
    elevator_doors.setImmovable(true);
    elevator_doors.setVisible(false);
    elevator_doors.body.allowGravity = false;
    elevator_doors.body.setSize(10, 10);

    game.physics.add.overlap(player, elevator_doors, () => onElevatorDoorsCollidePlayer(game) );
    return elevator_doors;    
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

    game.anims.create({
        key: 'elevator_doors_close',
        frames: game.anims.generateFrameNames('elevator_doors', 
            { start: 0, end: 6}),
        frameRate: 15,
        repeat: 0
    });
}

function initUI(game) { 
    const headlineHeight = 130;
    const headlinePadding = (headlineHeight * UIScale)/2 + 25;
    let headline_img = game.add.sprite(screenWidth/2, headlinePadding, 'headline');

    const x_padding = 100; 
    const buttonWidth = 127;
    const buttonWidthScaled = (buttonWidth * UIScale);
    const y_padding = buttonWidthScaled/2 + 30;
    let button_left_img = game.add.sprite(x_padding, screenHeight-y_padding, 'button_left_passive');
    button_left_img.setInteractive();
    button_left_img.on('pointerdown', function (pointer) {
        button_left_img.isPressed = true;
    });
    button_left_img.on('pointerout', function (pointer) {
        button_left_img.isPressed = false;
    });

    button_left_img.on('pointerup', function (pointer) {
        button_left_img.isPressed = false;
    });

    let button_right_img = game.add.sprite(screenWidth-x_padding, screenHeight-y_padding, 'button_right_passive');
    button_right_img.setInteractive();
    button_right_img.on('pointerdown', function (pointer) {
        button_right_img.isPressed = true;
    });
    button_right_img.on('pointerout', function (pointer) {
        button_right_img.isPressed = false;
    });

    button_right_img.on('pointerup', function (pointer) {
        button_right_img.isPressed = false;
    });

    const ui = {
        headline_img: headline_img,
        button_left_img: button_left_img,
        button_right_img: button_right_img,
    };

    for (const key in ui) {
        ui[key].setScrollFactor(0);
        ui[key].scale = UIScale;
    }

    return ui;
}

function displayFullPhrase(game, obj) {
    if (obj.text.draw_timer && obj.text.draw_timer.getOverallProgress() < 1) {
        obj.text.text.setText(obj.text.draw_timer.args[1])
        obj.text.draw_timer.remove();
        return true;
    }
}

function clearDrawnDialogue(game, obj) {
    /* Speeds up drawing if text is still printing or clears up dialogue if its finished */
    if (obj.text.draw_timer) {
        obj.text.draw_timer.remove();
    }
    if (obj.text.hide_timer) {
        obj.text.hide_timer.remove();
    }
}

function drawDialoguePhrase(game, obj, phrase) {
    const draw_timer_event = {
        delay: textCharDrawDelay,
        callback: function(text, phrase_text){
            if (!this.char) {
                this.char = 1;
            }
            const visibleText = phrase_text.slice(0, this.char);
            const invisibleText = '[color=transparent]'+phrase_text.slice(this.char, phrase_text.length)+'[/color]';
            //console.log(visibleText+invisibleText);
            text.setText(visibleText+invisibleText);
            this.char += 1;
        },
        args: [obj.text.text, phrase],
        repeat: phrase.length,
    }
    obj.text.text.setText('[color=transparent]'+phrase+'[/color]');
    obj.text['draw_timer'] = game.time.addEvent(draw_timer_event);

    const hide_timer_event = {
        delay: textCharDrawDelay * phrase.length + textHideDelay,
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
    obj.text.text.setVisible(1);
}

function initObjectDialogues(game, obj, obj_name) {
    obj.setInteractive();
    console.log('Initting text for', obj, obj_name)
    const obj_dialogues = dialogues[obj_name];
    const phrases = obj_dialogues.phrases;
    const style = obj_dialogues.style;

    const text = game.add.rexBBCodeText(-1000, -1000, 'dummy text', style);
    text.setOrigin(obj_dialogues.origin[0], obj_dialogues.origin[1]);
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
        if (displayFullPhrase(game, obj)) {
            return;
        }

        clearDrawnDialogue(game, obj);

        const next_phrase = (obj.text['cur_phrase']+1)%phrases.length
        const next_phrase_text = phrases[next_phrase];

        obj.text['cur_phrase'] = next_phrase;

        drawDialoguePhrase(game, obj, next_phrase_text);
    });
}

function initGameObject(game, object) {
    const obj_key = object.name;
    const obj = map.createFromObjects('game', {id: object.id, key: obj_key})[0];

    const obj_clickable = object.properties ? object.properties.filter(property => property.name == 'clickable')[0].value : false ;
    if (obj_clickable === true) {
        initObjectDialogues(game, obj, object.name);
    }
    return obj;
}

function checkIfCollide(arg1, arg2, arg3) {
    console.log('Check')
    console.log(arg1)
    console.log(arg2)
    console.log(arg3)
}
function initGameObjects(game, map) {
    const objectsLayer = map.objects.filter(layer => layer.name == 'game')[0];
    for (let object of objectsLayer.objects) {
        if (['player', 'virgil', 'elevator_doors'].includes(object.name)) {
            continue
        }

        const new_sprite = initGameObject(game, object);
        levelObjects.push(new_sprite);
    }

    player = initPlayer(game, map);

    virgil = initVirgil(game, map);
    initObjectDialogues(game, virgil, 'virgil');
    levelObjects.push(virgil);

    game.physics.add.collider(groundLayer, player);
    game.physics.add.collider(groundLayer, virgil);

    elevator_doors = initElevatorDoors(game, map, player);
    levelObjects.push(elevator_doors);
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
    ui = initUI(this);
}


function plyMove(player, left=true){
    if (left) {
        player.body.setVelocityX(-plySpeed); // move left
        player.anims.play('player_walk', true); // play walk animation
        player.flipX = true; // flip the sprite to the left
    } else {
        player.body.setVelocityX(plySpeed); // move right
        player.anims.play('player_walk', true); // play walk animatio
        player.flipX = false; // use the original sprite looking to the right
    }
}

function update() {
    if (cursors.left.isDown || ui.button_left_img.isPressed)
    {
        ui.button_left_img.setTexture('button_left_active');
        plyMove(player, left=true);
    }
    else if (cursors.right.isDown || ui.button_right_img.isPressed)
    {
        ui.button_right_img.setTexture('button_right_active');
        plyMove(player, left=false);
    } else if (player.body.onFloor()) {
        player.body.setVelocityX(0);
        player.anims.play('player_walk', false);
        ui.button_left_img.setTexture('button_left_passive');
        ui.button_right_img.setTexture('button_right_passive');
    }

    for (let obj of levelObjects) {
        if (obj.text) {
            let text = obj.text.text;

            text.x = obj.x + obj.text.offset[0];
            text.y = obj.y - obj.height/2 - text.height/2 + obj.text.offset[1];
        }
    }
 }
