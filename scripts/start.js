class start extends Phaser.State {
    preload(){
        this.game.load.image('player', './images/player.png');
        this.game.load.audio('start1', './sounds/000029f8.wav');
    }

    create(){
        let x = this.game.width;
        this.player = this.game.add.sprite(x/2, x/2, 'player');
        this.player.width = x/24;
        this.player.height = x/24;
        this.player.anchor.set(0.5);
        this.start1 = this.game.add.audio('start1');
        this.frame = 0;
    }

    update(){
        if (this.frame === 40){
            this.game.state.start('level');
        }
        if (this.frame % 10 === 0){
            this.player.visible = false;
        }
        if (this.frame % 20 === 0){
            this.player.visible = true;
            this.start1.play();
        }
        this.frame++;
    }
}