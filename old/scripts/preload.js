class preload extends Phaser.State {
    preload() {
        this.game.load.image('player', './images/player.png');
        this.game.load.audio('start1', './sounds/000029f8.wav');
        this.load.onLoadComplete.add(
            () => this.game.state.start('load'),
            this);
    }
}
