class Level extends Phaser.State {
    create() {
        this.createBox();
        this.createPlayer();
    }

    createBox() {
        var box = this.game.add.graphics();
        box.lineStyle(4, 0xffffff, 1);
        box.drawRect(100, 100, 400, 400);
    }

    createPlayer() {
        var x = this.game.width;
        this.player = this.game.add.sprite(300, 300, 'player');
        this.player.width = this.player.height = x/32;
        this.player.anchor.set(0.5);
        this.player.tint = 0xff0000;
    }
}