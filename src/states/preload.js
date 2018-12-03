class preload extends Phaser.State {
    preload() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        var loadingBar = this.add.sprite();
    }

    create() {
        this.game.state.start('level');
    }
}