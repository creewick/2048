class load extends Phaser.State {

    preload(){
        this.counter = 0;
        this.start1 = this.game.add.audio('start1');
        let x = this.game.width;
        this.player = this.game.add.sprite(x / 2, x / 2, 'player');
        this.player.width = x / 24;
        this.player.height = x / 24;
        this.player.anchor.set(0.5);
        this.player.tint = 0xff0000;

        this.load.setPreloadSprite(this.player);
        this.load.onFileComplete.add(this.complete, this);
        this.load.onLoadComplete.add(
            () => this.game.state.start('level'),
            this);

        this.game.load.image('dead', './images/dead.png');
        this.game.load.image('redGun', './images/blaster.png');
        this.game.load.image('stick1', './images/stick1.png');
        this.game.load.image('stick2', './images/stick2.png');
        this.game.load.audio('redShoot', './sounds/00000000.wav');
        this.game.load.audio('death2', './sounds/00002a1a.wav');
        this.game.load.audio('redGun', './sounds/00002a2e.wav');
        this.game.load.audio('death1', './sounds/000029ad.wav');
        this.game.load.audio('success', './sounds/000029e9.wav');
        this.game.load.audio('start2', './sounds/000029f7.wav');
        this.game.load.audio('bgm', './sounds/dogsong.wav');
    }

    complete(){
        this.counter++;
        if (this.counter % 4 === 1)
            this.start1.play();
    }
}