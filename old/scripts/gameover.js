class gameover extends Phaser.State {
    update() {
        if (this.flag)
            return;
        this.flag = true;
        this.death2 = this.game.add.audio('death2');
        this.death2.play();
        setTimeout(()=>{
            this.game.state.add('level', new GUI(new Logic()));
            this.game.state.start('level');
        }, 2000);
    }
}