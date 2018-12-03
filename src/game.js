let game = new Phaser.Game(600, 600);

game.state.add('preloader', new Preloader());
game.state.add('loader', new Loader());
game.state.add('level', new Level());

game.state.start('preloader');