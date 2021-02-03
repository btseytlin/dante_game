/* Game */
let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 1500},
            debug: false
        }
    },
    scene: [
        Level1Wood, 
        Level2Limbo,
        Level3Lust,
        Level4Gluttony,
        Level5Greed,
    ]
};
 
let game = new Phaser.Game(config);


const globalAssets = [
    'player', 'virgil', 'elevator', 'elevator_doors'
];

function getNextLevel(cur_key) {
    const level_order = [
        'Level1Wood', 'Level2Limbo', 'Level3Lust', 'Level4Gluttony', 
        'Level5Greed', 
    ];

    const cur_index = level_order.indexOf(cur_key);

    return level_order[Math.min(cur_index+1, level_order.length-1)]
}

function preloadCommon(scene) {
    scene.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);

    loadFont("ffforward", "assets/fonts/FFFFORWA.TTF");

    scene.load.spritesheet('tiles', 'assets/tileset.png', 
        {frameWidth: 128, frameHeight: 128});
    scene.load.spritesheet('player', 'assets/dante.png',
        {frameWidth: 120, frameHeight: 192});
    scene.load.spritesheet('virgil', 'assets/virgil.png',
        {frameWidth: 120, frameHeight: 192});

    scene.load.spritesheet('elevator', 'assets/elevator.png', 
        {frameWidth: 375, frameHeight: 350});
    scene.load.spritesheet('elevator_doors', 'assets/elevator_doors.png', 
        {frameWidth: 375, frameHeight: 350});

    const ui_assets = ['button_left_active', 'button_left_passive', 'button_right_active', 'button_right_passive']
    for (let image_key of ui_assets) {
        scene.load.image(image_key, 'assets/ui/' + image_key + '.png');
    }
}

function initMap(scene) {
    return scene.add.tilemap(scene.assetPrefix('map'));
}

function initGround(scene, map) {
    let groundTiles = map.addTilesetImage('tiles', 'tiles');
    let ground = map.createLayer('ground', groundTiles);
    ground.setCollisionByExclusion([-1]);
 
    scene.physics.world.bounds.width = ground.width;
    scene.physics.world.bounds.height = ground.height;

    return ground;
}

function initBackground(scene, map) {

    for (let img of map.imageCollections[0].images) {
        let parts = img.image.split('/');
        const fname = parts[parts.length - 1];
        const key = scene.assetPrefix(fname.split('.')[0]);
        map.createFromObjects('background', {gid: img.gid, key: key});

    }

    for (let img of map.imageCollections[0].images) {
        let parts = img.image.split('/');
        const fname = parts[parts.length - 1];
        const key = scene.assetPrefix(fname.split('.')[0]);
        map.createFromObjects('background_objects_2', {gid: img.gid, key: key});
    }

    for (let img of map.imageCollections[0].images) {
        let parts = img.image.split('/');
        const fname = parts[parts.length - 1];
        const key = scene.assetPrefix(fname.split('.')[0]);
        map.createFromObjects('background_objects_1', {gid: img.gid, key: key});
    }

    
}


function initPlayer(scene, map) {
    let player_spawns = map.createFromObjects('game', {name: "player", key: "player"});
    let ply_spawn = player_spawns[0];
    let ply = objectFromSpawnPoint(scene, ply_spawn, 'player')
    ply.setBounce(0.1); // our player will bounce from items
    ply.setCollideWorldBounds(true); // don't go out of the map
    return ply;    
}

function initVirgil(scene, map) {
    let spawns = map.createFromObjects('game', {name: "virgil"});
    let spawn = spawns[0];

    let obj = objectFromSpawnPoint(scene, spawn, 'virgil')
    obj.setBounce(0.1); // our player will bounce from items
    obj.setCollideWorldBounds(true); // don't go out of the map
    return obj;    
}

function changeLevel(scene, nextLevel) {
    scene.scene.start(nextLevel);
}

function onElevatorDoorsCollidePlayer(scene) {
    if (!scene.changeLevelRequested) {
        scene.player.anims.play('player_idle', true);
        scene.player.setImmovable = true;
        scene.player.body.enable = false;
        scene.changeLevelRequested = true;
        scene.waitingForVirgil = true;
    }
}

function onElevatorDoorsCollideVirgil(scene) {
    if (scene.changeLevelRequested && scene.waitingForVirgil) {
        scene.virgil.anims.play('virgil_idle', true);
        scene.virgil.setImmovable = true;
        scene.virgil.body.enable = false;

        elevator_doors.setVisible(true);
        elevator_doors.anims.play('elevator_doors_close', false);

        const nextLevel = getNextLevel(scene.scene.key);

        const timer = scene.time.addEvent({
            delay: changeLevelDelay,
            callback: changeLevel,
            args: [scene, nextLevel],
            loop: false
        });
    }
}


function initElevatorDoors(scene, map, player) {
    let elevator_doors_spawn = map.createFromObjects('game', {name: "elevator_doors", key: "elevator_doors"})[0];
    let elevator_doors = objectFromSpawnPoint(scene, elevator_doors_spawn, 'elevator_doors');
    elevator_doors.setImmovable(true);
    elevator_doors.setVisible(false);
    elevator_doors.body.allowGravity = false;
    elevator_doors.body.setSize(10, 10);

    scene.physics.add.overlap(player, elevator_doors, () => onElevatorDoorsCollidePlayer(scene) );
    scene.physics.add.overlap(scene.virgil, elevator_doors, () => onElevatorDoorsCollideVirgil(scene) );
    return elevator_doors;    
}


function initInput(scene) {
    return scene.input.keyboard.createCursorKeys();
}

function initCamera(scene, map) {
    scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    scene.cameras.main.startFollow(scene.player);
    scene.cameras.main.setBackgroundColor('#ccccff');
}

function initAnimations(scene) { 
    scene.anims.create({
        key: 'player_idle',
        frames: scene.anims.generateFrameNames('player', 
            { start: 0, end: 0}),
        frameRate: 1,
        repeat: 0
    });

    scene.anims.create({
        key: 'player_walk',
        frames: scene.anims.generateFrameNames('player', 
            { start: 2, end: 5}),
        frameRate: 5,
        repeat: -1
    });


    scene.anims.create({
        key: 'virgil_walk',
        frames: scene.anims.generateFrameNames('virgil', 
            { start: 1, end: 3}),
        frameRate: 5,
        repeat: -1
    });

    scene.anims.create({
        key: 'virgil_idle',
        frames: scene.anims.generateFrameNames('virgil', 
            { start: 0, end: 0}),
        frameRate: 1,
        repeat: 0
    });

    scene.anims.create({
        key: 'elevator_doors_close',
        frames: scene.anims.generateFrameNames('elevator_doors', 
            { start: 1, end: 9}),
        frameRate: 10,
        repeat: 0
    });
}

function initUI(scene) { 
    const headlineHeight = 130;
    const headlinePadding = (headlineHeight * UIScale)/2 + 25;
    let headline_img = scene.add.sprite(screenWidth/2, headlinePadding, scene.assetPrefix('headline'));

    const x_padding = 100; 
    const buttonWidth = 127;
    const buttonWidthScaled = (buttonWidth * UIScale);
    const y_padding = buttonWidthScaled/2 + 30;
    let button_left_img = scene.add.sprite(x_padding, screenHeight-y_padding, 'button_left_passive');
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

    let button_right_img = scene.add.sprite(screenWidth-x_padding, screenHeight-y_padding, 'button_right_passive');
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
        ui[key].depth = 999;
    }

    return ui;
}

function initObjectDialogues(scene, obj, obj_name) {
    obj.setInteractive();
    const obj_dialogues = scene.dialogues[obj_name];
    const phrases = obj_dialogues.phrases;
    const style = obj_dialogues.style;

    const text = scene.add.rexBBCodeText(-1000, -1000, 'dummy text', style);
    text.setOrigin(obj_dialogues.origin[0], obj_dialogues.origin[1]);
    text.setPadding(obj_dialogues.padding);
    text.setVisible(0);

    obj.text = {
        'dialogues': obj_dialogues,
        'text': text,
        'offset': obj_dialogues.offset, 
        'cur_phrase_num': -1, 
        'cur_phrase': undefined, 
        "hide_timer": undefined,
        "draw_timer": undefined
    };

    obj.on('pointerdown', function (pointer) {
        if (displayFullPhrase(scene, obj)) {
            return;
        }

        clearDrawnDialogue(scene, obj);

        if (obj.text.cur_phrase_num == obj.text.dialogues.phrases.length-1) {
            obj.text.cur_phrase_num = -1;
        } else {
            drawNextPhrase(scene, obj);
        }
    });
}

function initGameObject(scene, object, map) {
    const obj_key = globalAssets.indexOf(object.name) != -1? object.name : scene.assetPrefix(object.name);
    const obj = scene.map.createFromObjects('game', {id: object.id, key: obj_key})[0];

    const obj_clickable = object.properties ? object.properties.filter(property => property.name == 'clickable')[0].value : false ;
    if (obj_clickable === true) {
        initObjectDialogues(scene, obj, object.name);
    }
    return obj;
}

function initGameObjects(scene, map) {
    const objectsLayer = map.objects.filter(layer => layer.name == 'game')[0];
    for (let object of objectsLayer.objects) {
        if (['player', 'virgil', 'elevator_doors'].includes(object.name)) {
            continue
        }
        const new_sprite = initGameObject(scene, object, map);
        scene.levelObjects.push(new_sprite);
    }

    scene.player = initPlayer(scene, map);

    scene.virgil = initVirgil(scene, map);
    initObjectDialogues(scene, scene.virgil, 'virgil');
    scene.levelObjects.push(scene.virgil);

    scene.physics.add.collider(scene.groundLayer, scene.player);
    scene.physics.add.collider(scene.groundLayer, scene.virgil);

    elevator_doors = initElevatorDoors(scene, map, scene.player);
    scene.elevator_doors = elevator_doors;
    scene.levelObjects.push(elevator_doors);
}

function createCommon(scene) {
    scene.dialogues = scene.cache.json.get(scene.assetPrefix('dialogues'));
    scene.map = initMap(scene);
    initBackground(scene, scene.map);
    scene.groundLayer = initGround(scene, scene.map);  
    
    initGameObjects(scene, scene.map);

    scene.cursors = initInput(scene);
    initCamera(scene, scene.map);
    initAnimations(scene);
    scene.ui = initUI(scene);
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


function virgilMove(scene) {

    if (!scene.waitingForVirgil) {
        // Virgil follows player
        const ply_virgil_dist = Math.abs(scene.player.x - scene.virgil.x);
        if (ply_virgil_dist > virgilFollowThreshold) {
            if (scene.player.x > scene.virgil.x) { // Player to the right of Virgil, Virgil walks left
                scene.virgil.body.setVelocityX(virgilSpeed); // move left
                scene.virgil.anims.play('virgil_walk', true);
                scene.virgil.flipX = false;
            } else {
                scene.virgil.body.setVelocityX(-virgilSpeed); // move right
                scene.virgil.anims.play('virgil_walk', true);
                scene.virgil.flipX = true;
            }
        } else {
            scene.virgil.body.setVelocityX(0);
            scene.virgil.anims.play('virgil_idle', false);
        }

    } else {
        // Virgil moves to elevator
        const virgil_elevator_dist = Math.abs(scene.elevator_doors.x - scene.virgil.x);

        if (virgil_elevator_dist > 0) {
            if (scene.elevator_doors.x > scene.virgil.x) { // Elevator to the right of Virgil, Virgil walks left
                scene.virgil.body.setVelocityX(virgilSpeed); // move left
                scene.virgil.anims.play('virgil_walk', true);
                scene.virgil.flipX = false;
            } else {
                scene.virgil.body.setVelocityX(-virgilSpeed); // move right
                scene.virgil.anims.play('virgil_walk', true);
                scene.virgil.flipX = true;
            }
        } else {
            scene.virgil.body.setVelocityX(0);
            scene.virgil.anims.play('virgil_idle', false);
        }

    }
}

function commonUpdate(scene) {
    if (scene.cursors.left.isDown || scene.ui.button_left_img.isPressed)
    {
        scene.ui.button_left_img.setTexture('button_left_active');
        plyMove(scene.player, left=true);
    }
    else if (scene.cursors.right.isDown || scene.ui.button_right_img.isPressed)
    {
        scene.ui.button_right_img.setTexture('button_right_active');
        plyMove(scene.player, left=false);
    } else if (scene.player.body.onFloor()) {
        scene.player.body.setVelocityX(0);
        scene.player.anims.play('player_walk', false);
        scene.ui.button_left_img.setTexture('button_left_passive');
        scene.ui.button_right_img.setTexture('button_right_passive');
    }

    virgilMove(scene);

    for (let obj of scene.levelObjects) {
        if (obj.text) {
            let text = obj.text.text;

            text.x = obj.x + obj.text.offset[0];
            text.y = obj.y - obj.height/2 - text.height/2 + obj.text.offset[1];
        }
    }
 }
