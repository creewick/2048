class Preloader extends Phaser.State {
    preload() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas)
        this.game.load.image('player', './src/images/player.gif');
        this.game.load.audio('loading', './src/sounds/loading.ogg');
    }

    create() {
        this.game.state.start('loader');
    }
}