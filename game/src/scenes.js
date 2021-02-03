class BaseLevel extends Phaser.Scene {

    constructor (key) {
        super(key);
        this.map = null;
        this.groundLayer = null;
        this.player = null;
        this.virgil = null;
        this.elevator_doors = null;
        this.ui = null;
        this.cursors = null;
        this.levelObjects = [];

        this.dialogues = null;

        this.changeLevelRequested = false;
        this.waitingForVirgil = false;
    }

    assetPrefix(str) {
        return this.scene.key + '_' + str;
    }

    preload () {
        preloadCommon(this);
    }

    create () {
        createCommon(this);
    }

    update () {
        commonUpdate(this);
    }
}

class Level1Wood extends BaseLevel {

    constructor () {
        super('Level1Wood');
    }

    preload () {
        super.preload();

        this.load.tilemapTiledJSON(this.assetPrefix('map'), 'maps/level1_wood.json');
        this.load.json(this.assetPrefix('dialogues'), 'assets/level1_wood/dialogues.json');

        const level_assets = [
            'background', 'star1', 'star2', 'star3', 'strip', 
            'tree1', 'tree2', 'tree3', 'tree3', 'tree4', 'tree5', 'tree6',
            'owl',
            'headline'
        ]

        for (let image_key of level_assets) {
            this.load.image(this.assetPrefix(image_key), 'assets/level1_wood/' + image_key + '.png');
        }
    }

    create() {
        super.create();

        const text_style = {
            fontSize: "30px",
            fontFamily: "Courier",
            fontStyle: "bold",
            wrap: {
                 "width": 400, 
                 "mode": "word"
            },
            align: "center", 
            color: "#e3e3e3",
            backgroundColor: "#000000"
        };

        const text_padding = {
            "x": 10,
            "y": 10
        };

        let txt = this.add.text(180, 550, "Use arrow keys to move")
        txt.setStyle(text_style);
        txt.setPadding(text_padding);

        txt = this.add.text(1450, 550, "Click Virgil, ask him what's up")
        txt.setStyle(text_style);
        txt.setPadding(text_padding);

        txt = this.add.text(900, 550, "Click the owl")
        txt.setStyle(text_style);
        txt.setPadding(text_padding);
        
    }
}

class Level2Limbo extends BaseLevel {

    constructor () {
        super('Level2Limbo');
    }

    preload () {

        super.preload();

        this.load.tilemapTiledJSON(this.assetPrefix('map'), 'maps/level2_limbo.json');
        this.load.json(this.assetPrefix('dialogues'), 'assets/level2_limbo/dialogues.json');

        const level_assets = [
            'background', 'headline',
            'aristotle', 'homer', 'pythagoras',
            'baby', 'baby2',
            'vase', 'vase2',
            'column', 'shrine', 'cloud',
        ]

        for (let image_key of level_assets) {
            this.load.image(this.assetPrefix(image_key), 'assets/level2_limbo/' + image_key + '.png');
        }
    }

    create () {
        console.log('Creating limbo')
        super.create();
    }

}


class Level3Lust extends BaseLevel {

    constructor () {
        super('Level3Lust');
    }

    preload () {

        super.preload();

        this.load.tilemapTiledJSON(this.assetPrefix('map'), 'maps/level3_lust.json');
        this.load.json(this.assetPrefix('dialogues'), 'assets/level3_lust/dialogues.json');

        const level_assets = [
            'background', 'headline',
            'ass', 'fountain', 'house1', 'house2', 'house3', 'house4', 'house5',
            'tornado',
            'elena', 'cleopatra', 'francheska_and_paulo', 
        ]

        for (let image_key of level_assets) {
            this.load.image(this.assetPrefix(image_key), 'assets/level3_lust/' + image_key + '.png');
        }
    }

    create () {
        super.create();
    }

}