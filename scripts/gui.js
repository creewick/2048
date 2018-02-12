class GUI extends Phaser.State {

    constructor(logic){
        super();
        this.logic = logic;
        this.controller = new Controller();
        this.field = null;
        this.isOver = false;
        this.guns = [];
        this.gunsSpr = [];
        this.animationTimeout = 0;
        this.animationLength = 10;
        this.colors = {
            2:   '#eee4da',
            4:   '#ece0c8',
            8:   '#f2b179',
            16:  '#f49660',
            32:  '#f47d5f',
            64:  '#f65e39',
            128: '#edce71',
            256: '#edcc61',
            512: '#ecc850',
            1024:'#edc53f',
            2048:'#eab914'
        };
    }

    create() {
        this.game.add.audio('start2').play();
        this.bgm = this.game.add.audio('bgm');
        this.bgm.loop = true;
        this.bgm.play();
        this.gunSound = this.game.add.audio('gun');
        this.shootSound = this.game.add.audio('shoot');
        this.death1 = this.game.add.audio('death1');
        this.death2 = this.game.add.audio('death2');
        this.logic.start();
        this.createOutline();
        this.createField();
        this.createPlayer();
    }

    createField(){
        this.field = [];
        for (let y = 0; y < 4; y++){
            this.field[y] = [];
            for (let x = 0; x < 4; x++){
                if (this.logic.field[y][x] > 0){
                    this.field[y][x] = {};
                    this.createRectangle(x, y);
                    this.createText(x, y);
                }
            }
        }
    }

    createRectangle(x, y){
        let size = this.game.width;
        let canvas = this.game.add.bitmapData(size/6 + 2, size/6 + 2);
        canvas.ctx.beginPath();
        canvas.ctx.rect(0, 0, size/6 + 2, size/6 + 2);
        if (this.logic.field[y][x] in this.colors)
            canvas.ctx.fillStyle = this.colors[this.logic.field[y][x]];
        else
            canvas.ctx.fillStyle = '#eab914';
        canvas.ctx.strokeStyle = '#ffffff';
        canvas.ctx.lineWidth = '4';
        canvas.ctx.fill();
        canvas.ctx.stroke();
        let coords = this.toDrawCoords(new Vector(x, y));
        this.field[y][x].rect = this.game.add.sprite(
            coords.x - 1, coords.y - 1,
            canvas);
        this.game.physics.enable(this.field[y][x].rect);
    }

    createText(x, y){
        let size = this.game.width;
        let length = String(this.logic.field[y][x]).length - 1;
        let style = {
            font: `bold ${size / (12 + 2 * length)}px ClearSans`,
            boundsAlignH: 'center',
            boundsAlignV: 'middle',
        };
        if (this.logic.field[y][x] < 8)
            style.fill = '#776e65';
        else
            style.fill = '#f9f6f2';
        this.field[y][x].text = this.game.add.text(
            ...this.toDrawCoords(new Vector(x + 0.5, y + 0.5)).values(),
            this.logic.field[y][x],
            style
        );
        this.field[y][x].text.anchor.set(0.5);
        this.game.physics.enable(this.field[y][x].text);
    }

    createPlayer(){
        this.player = this.game.add.sprite(
            ...this.toDrawCoords(this.logic.position).values(),
            'player');
        let x = this.game.width;
        this.player.width = x/24;
        this.player.height = x/24;
        this.player.anchor.set(0.5);
    }

    createOutline(){
        let graphics = this.game.add.graphics();
        let size = this.toDrawCoords(new Vector(0, 0));
        graphics.lineStyle(2, 0xffffff, 1);
        for (let x = 0; x < 4; x++)
            for (let y = 0; y < 4; y++){
                let begin = this.toDrawCoords(new Vector(x, y));
                graphics.drawRect(begin.x, begin.y, size.x, size.y);
            }
        window.graphics = graphics;
    }

    toDrawCoords(vector) {
        return new Vector((vector.x + 1) * this.game.width / 6,
                          (vector.y + 1) * this.game.width / 6)
    }

    gameOver(){
        this.isOver = true;
        this.player.destroy();
        this.death1.play();
        this.player = this.game.add.sprite(
            ...this.toDrawCoords(this.logic.position).values(),
            'dead');
        let x = this.game.width;
        this.player.width = x/24;
        this.player.height = x/24;
        this.player.anchor.set(0.5);
        setTimeout(() => {
            this.death2.play();
        }, 500);
        setTimeout(() => {
            game.state.remove('level');
            game.state.add('level', new GUI(new Logic()));
            this.game.state.start('level');
        }, 1000);
    }

    update() {
        if (this.logic.isOver && !this.isOver)
            this.gameOver();
        this.actPressedKeys();
        this.logic.update();
        this.player.position = new PIXI.Point(...this.toDrawCoords(this.logic.position).values());
        this.animateGuns();
        if (this.logic.animationField !== null)
            this.animateTiles();
        if (this.animationTimeout === 1) {
            this.clearField();
            this.createField();
            this.player.destroy();
            this.createPlayer();
        }
        if (this.animationTimeout > 0)
            this.animationTimeout--;
        else
            this.tiltTiles();
    }

    animateGuns(){
        this.incomeAnimations();
        this.shootAnimations();
    }

    createLight(index){
        let size = this.game.width;
        let canvas = null;
        if (this.guns[index].position.y < 0 || this.guns[index].position.y > 4)
            canvas = this.game.add.bitmapData(size/6, size);
        else
            canvas = this.game.add.bitmapData(size, size/6);
        canvas.ctx.beginPath();
        canvas.ctx.rect(0, 0, canvas.width, canvas.height);
        canvas.ctx.fillStyle = '#ffffff';
        canvas.ctx.fill();
        let light = null;
        if (this.guns[index].position.y < 0 || this.guns[index].position.y > 4)
            light = this.game.add.sprite(
                this.gunsSpr[index].position.x - size/12, 0, canvas);
        else
            light = this.game.add.sprite(
            0, this.gunsSpr[index].position.y - size/12, canvas);
        return light;
    }

    shootAnimations(){
        for (let oldI = 0; oldI < this.guns.length; oldI++)
            if (this.logic.guns.indexOf(this.guns[oldI]) === -1){
                this.shootSound.play();
                let light = this.createLight(oldI);
                this.game.add.tween(light).to( { alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, 500, true);
                this.guns.splice(oldI, 1);
                setTimeout(() => {light.destroy();}, 500);
                setTimeout(() => {
                    this.gunsSpr[oldI].destroy();
                    this.gunsSpr.splice(oldI, 1);
                }, 250);
            }
    }

    incomeAnimations(){
        for (let newI = 0; newI < this.logic.guns.length; newI++)
            if (this.guns.indexOf(this.logic.guns[newI]) === -1){
                this.gunSound.play();
                this.guns.push(this.logic.guns[newI]);
                let gunSprite = this.createGunSprite(this.logic.guns[newI]);
                this.gunsSpr.push(gunSprite);
                setTimeout(() => {
                    gunSprite.body.velocity.x = 0;
                    gunSprite.body.velocity.y = 0;
                }, 120);
            }
    }

    createGunSprite(gun){
        let vector = new Vector(gun.position.x, gun.position.y);
        if (vector.x === -1) vector.x -= 2;
        if (vector.x === 5)  vector.x += 2;
        if (vector.y === -1) vector.y -= 2;
        if (vector.y === 5)  vector.y += 2;
        let oldPosition = this.toDrawCoords(vector);
        let newPosition = this.toDrawCoords(gun.position);
        let deltaX = newPosition.x - oldPosition.x;
        let deltaY = newPosition.y - oldPosition.y;
        let gunSpr = this.game.add.sprite(
            ...oldPosition.values(), 'gun');
        let x = this.game.width;
        gunSpr.width = x/3;
        gunSpr.height = x/3;
        gunSpr.anchor.set(0.5);
        if (vector.x === -3) gunSpr.angle = -90;
        if (vector.y === 7) gunSpr.angle = 180;
        if (vector.x === 7) gunSpr.angle = 90;
        this.game.physics.enable(gunSpr);
        gunSpr.body.velocity.x = deltaX * 60 / 5;
        gunSpr.body.velocity.y = deltaY * 60 / 5;
        return gunSpr;
    }

    clearField(){
        for (let y = 0; y < 4; y++)
            for (let x = 0; x < 4; x++)
                if (this.field[y][x] !== undefined) {
                    this.field[y][x].rect.destroy();
                    this.field[y][x].text.destroy();
                }
    }

    animateTiles(){
        this.animationTimeout = this.animationLength;
        for (let y = 0; y < 4; y++)
            for (let x = 0; x < 4; x++)
                if (this.field[y][x] !== undefined)
                    this.animateTile(x, y);
        this.logic.animationField = null;
    }

    animateTile(x, y){
        let newPosition = this.toDrawCoords(this.logic.animationField[y][x]);
        let oldPosition = this.field[y][x].rect.position;
        let deltaX = newPosition.x - oldPosition.x;
        let deltaY = newPosition.y - oldPosition.y;
        this.field[y][x].rect.body.velocity.x = deltaX * 60 / this.animationLength;
        this.field[y][x].rect.body.velocity.y = deltaY * 60 / this.animationLength;
        this.field[y][x].text.body.velocity.x = deltaX * 60 / this.animationLength;
        this.field[y][x].text.body.velocity.y = deltaY * 60 / this.animationLength;
    }

    tiltTiles(){
        let tiltVector = this.logic.position
                         .sub(this.logic.anchor);
        for (let y = 0; y < 4; y++){
            for (let x = 0; x < 4; x++){
                if (this.field[y][x] !== undefined)
                    this.tiltTile(x, y, tiltVector);
            }
        }
    }

    tiltTile(x, y, vector){
        let rectLogicCoords = new Vector(
            Math.max(0, Math.min(3, x + vector.x)),
            Math.max(0, Math.min(3, y + vector.y))
        );
        let textLogicCoords = new Vector(
            Math.max(0, Math.min(3, x + vector.x)) + 0.5,
            Math.max(0, Math.min(3, y + vector.y)) + 0.5
        );
        let rectDrawCoords = this.toDrawCoords(rectLogicCoords);
        this.field[y][x].rect.position = new PIXI.Point(
            rectDrawCoords.x - 1, rectDrawCoords.y - 1
        );
        let textDrawCoords = this.toDrawCoords(textLogicCoords);
        this.field[y][x].text.position = new PIXI.Point(
            textDrawCoords.x - 1, textDrawCoords.y - 1
        );
    }

    actPressedKeys(){
        let pressed = [];
        for (let key in this.controller.controls)
            if (this.game.input.keyboard.isDown(key))
                pressed.push(key);
        this.controller.act(this.logic, pressed);
    }
}