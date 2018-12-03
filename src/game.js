let game = new Phaser.Game(600, 600);

game.state.add('preload', new preload());
game.state.add('level', new level());

game.state.start('preload');