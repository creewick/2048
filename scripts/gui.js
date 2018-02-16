const FieldAnimationLength = 10;
class GUI extends Phaser.State {

    constructor(logic){
        super();
        this.logic = logic;
        this.controller = new Controller();
        this.field = null;
        this.isOver = false;
        this.state = '';
        this.guns = [];
        this.gunsSpr = [];
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
        this.playerTint = {
            'red': 0xff0000,
            'green': 0x00ff00
        }
    }

    create() {
        this.game.add.audio('start2').play();
        this.death1 = this.game.add.audio('death1');
        this.logic.start();
        this.createOutline();
        this.createField();
        this.createPlayer();
        if (this.game.width <= 926)
            this.createStick();
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

    createStick() {
        this.stickBase =  this.game.add.sprite(
            ...this.toDrawCoords(new Vector(2, 6)).values(),
            'stick1');
        let x = this.game.width;
        this.stickBase.width = x/4.5;
        this.stickBase.height = x/4.5;
        this.stickBase.anchor.set(0.5);
        this.stick =  this.game.add.sprite(
            ...this.toDrawCoords(new Vector(2, 6)).values(),
            'stick2');
        this.stick.width = x/4.5;
        this.stick.height = x/4.5;
        this.stick.anchor.set(0.5);
        this.game.input.addPointer();
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
        this.player.tint = this.playerTint[this.logic.state];
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
        this.bgm.stop();
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
            this.game.state.add('gameover', new gameover());
            this.game.state.start('gameover');
        }, 1000);
    }

    update() {
        if (this.logic.isOver && !this.isOver)
            this.gameOver();
        this.actPressedKeys();
        if (this.stick !== undefined)
            this.actStick();
        this.colorPlayer();
        this.changeMusic();
        this.logic.update();
        this.player.position = new PIXI.Point(...this.toDrawCoords(this.logic.position).values());
        this.animateGuns();
        this.animateTiles();
    }

    changeMusic(){
        if (this.state !== this.logic.state){
            this.state = this.logic.state;
            if (this.bgm !== undefined)
                this.bgm.stop();
            this.bgm = this.game.add.audio(`${this.state}Music`);
            this.bgm.loop = true;
            this.bgm.play();
        }
    }

    colorPlayer(){
        this.player.tint = this.playerTint[this.logic.state];
    }

    animateTiles(){
        if (this.logic.animationField !== null)
            this.startFieldAnimation();
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

    startFieldAnimation(){
        this.animationTimeout = FieldAnimationLength;
        for (let y = 0; y < 4; y++)
            for (let x = 0; x < 4; x++)
                if (this.field[y][x] !== undefined)
                    this.startTileAnimation(x, y);
        this.logic.animationField = null;
    }

    startTileAnimation(x, y){
        let newPosition = this.toDrawCoords(this.logic.animationField[y][x]);
        let oldPosition = this.field[y][x].rect.position;
        let deltaX = newPosition.x - oldPosition.x;
        let deltaY = newPosition.y - oldPosition.y;
        this.field[y][x].rect.body.velocity.x = deltaX * 60 / FieldAnimationLength;
        this.field[y][x].rect.body.velocity.y = deltaY * 60 / FieldAnimationLength;
        this.field[y][x].text.body.velocity.x = deltaX * 60 / FieldAnimationLength;
        this.field[y][x].text.body.velocity.y = deltaY * 60 / FieldAnimationLength;
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

    animateGuns(){
        this.incomeAnimations();
        this.shootAnimations();
    }

    createLight(gun){
        let size = this.game.width;
        let light = null;
        let vector = this.toDrawCoords(gun.position);
        if (gun.color === 'red') {
            let canvas = null;
            if (gun.isVertical())
                canvas = this.game.add.bitmapData(size / 6, size);
            else
                canvas = this.game.add.bitmapData(size, size / 6);
            canvas.ctx.beginPath();
            canvas.ctx.rect(0, 0, canvas.width, canvas.height);
            canvas.ctx.fillStyle = '#ffffff';
            canvas.ctx.fill();
            if (gun.isVertical())
                light = this.game.add.sprite(
                    vector.x - size / 12, 0, canvas);
            else
                light = this.game.add.sprite(
                    0, vector.y - size / 12, canvas);
        }
        if (gun.color == 'green'){
            if (gun.isVertical())
                light = this.game.add.sprite(
                    vector.x, size/2, 'greenGun');
            else
                light = this.game.add.sprite(
                    size/2, vector.y, 'greenGun');
            light.height = size;
            light.width = size / 15;
            light.anchor.set(0.5);
            if (gun.orientation === 'left') light.angle = -90;
            if (gun.orientation === 'down') light.angle = 180;
            if (gun.orientation === 'right') light.angle = 90;
        }
        return light;
    }

    shootAnimations(){
        for (let oldI = 0; oldI < this.guns.length; oldI++)
            if (this.logic.guns.indexOf(this.guns[oldI]) === -1){
                this.clearField();
                this.createField();
                this.player.destroy();
                this.createPlayer();
                this.shootSound = this.game.add.audio(`${this.logic.state}Shoot`);
                this.shootSound.play();
                let light = this.createLight(this.guns[oldI]);
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
        for (let i = 0; i < this.gunsSpr.length; i++){
            if (this.gunsSpr[i].timeout === 1){
                this.gunsSpr[i].body.velocity.x = 0;
                this.gunsSpr[i].body.velocity.y = 0;
            }
            if (this.gunsSpr[i].timeout > 0)
                this.gunsSpr[i].timeout--;
        }
        for (let newI = 0; newI < this.logic.guns.length; newI++)
            if (this.guns.indexOf(this.logic.guns[newI]) === -1) {
                this.gunSound = this.game.add.audio(`${this.logic.state}Gun`);
                this.gunSound.play();
                this.guns.push(this.logic.guns[newI]);
                let gunSprite = this.createGunSprite(this.logic.guns[newI]);
                this.gunsSpr.push(gunSprite);
            }
    }

    createGunSprite(gun){
        let vector = new Vector(gun.position.x, gun.position.y);
        if (gun.orientation === 'left') vector.x -= 2;
        if (gun.orientation === 'right')  vector.x += 2;
        if (gun.orientation === 'up') vector.y -= 2;
        if (gun.orientation === 'down')  vector.y += 2;
        let oldPosition = this.toDrawCoords(vector);
        let newPosition = this.toDrawCoords(gun.position);
        let deltaX = newPosition.x - oldPosition.x;
        let deltaY = newPosition.y - oldPosition.y;
        let gunSpr = this.game.add.sprite(
            ...oldPosition.values(), `${this.logic.state}Gun`);
        let x = this.game.width;
        gunSpr.width = {
            'red': x / 4.5,
            'green': x / 15
        }[gun.color];
        gunSpr.height = {
            'red': x / 3,
            'green': x / 3
        }[gun.color];
        gunSpr.anchor.set(0.5);
        if (gun.orientation === 'left') gunSpr.angle = -90;
        if (gun.orientation === 'down') gunSpr.angle = 180;
        if (gun.orientation === 'right') gunSpr.angle = 90;
        this.game.physics.enable(gunSpr);
        gunSpr.body.velocity.x = deltaX * 60 / FieldAnimationLength;
        gunSpr.body.velocity.y = deltaY * 60 / FieldAnimationLength;
        gunSpr.timeout = FieldAnimationLength;
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

    actPressedKeys(){
        if (this.game.input.pointer1.isDown)
            return;
        let pressed = [];
        for (let key in this.controller.controls)
            if (this.game.input.keyboard.isDown(key))
                pressed.push(key);
        this.controller.act(this.logic, pressed);
    }

    actStick(){
        if (this.game.input.pointer1.isDown){
            let position = new Vector(this.game.input.pointer1.position.x,
                                  this.game.input.pointer1.position.y);
            let anchor = new Vector(this.stickBase.position.x,
                                    this.stickBase.position.y);
            let vector = position.sub(anchor);
            let size = this.stickBase.width;
            if (vector.norm() < size * 3){
                let stick = position;
                if (vector.norm() > size / 2)
                    stick = vector.normalize().mul(size / 2).add(anchor);
                this.stick.position = new PIXI.Point(...stick.values());
                if (size / 8 < vector.norm())
                    this.logic.move(vector.normalize());
                return;
            }
        }
        this.stick.position = this.stickBase.position;
    }
}