class BaseLevel extends Phaser.Scene {

    constructor (key) {
        super(key);

        this.map = null;
        this.groundLayer = null;
        this.player = null;
        this.virgil = null;
        this.ui = null;
        this.cursors = null;
        this.levelObjects = [];

        this.dialogues = null;

        this.changeLevelRequested = false;
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
}

class Level2Wtf extends BaseLevel {

    constructor () {
        super('Level2Wtf');
    }

    preload () {
        super.preload();

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

    create () {
        super.create();

        this.add.text(this.player.x, this.player.y, 'WOW SECOND LEVEL')
    }

}