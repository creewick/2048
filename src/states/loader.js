class Loader extends Phaser.State {
    preload() {
        this.counter = 0;
        this.setupProgressBar();

        this.loadFiles('./src/sounds', 
            ['green/shot', 'green/warn', 'red/shot', 'red/warn', 'break', 'change', 'death', 'hit', 'loading', 'start'],'ogg');
        this.loadFiles('./src/images', ['dead'], 'gif');
        this.loadFiles('./src/music', ['dogsong', 'sans', 'undyne'], 'ogg');
    }

    create() {
        this.game.state.start('level');
    }

    loadFiles(dir, names, ext) {
        for (var i in names)
            this.loadFile(dir, names[i], ext)
    }

    loadFile(dir, name, ext) {
        var path = `${dir}/${name}.${ext}`;

        if (ext === 'ogg')
            this.game.load.audio(name, path);
        else if (ext === 'gif')
            this.game.load.image(name, path);
    }

    setupProgressBar() {
        var white = this.getSprite();
        var red = this.getSprite();
        red.tint = 0xff0000;
        red.anchor.set(0);
        red.position.x = red.position.y = this.game.width * 31 / 64;
        this.load.setPreloadSprite(red);

        this.loading = this.game.add.audio('loading');
        this.load.onFileComplete.add(this.fileComplete, this);
    }

    getSprite() {
        var x = this.game.width;
        var sprite = this.add.sprite(x/2, x/2, 'player');
        sprite.width = sprite.height = x/32;
        sprite.anchor.set(0.5);

        return sprite;
    }

    fileComplete() {
        if (this.counter++ % 10 == 0) {
            this.loading.play();
        }
    }
}