class GUI extends Phaser.State {

    constructor(logic){
        super();
        this.logic = logic;
        this.controller = new Controller();
        this.field = null;
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

    preload() {
        this.game.load.image('player', './images/player.png');
        this.game.load.image('dead', './images/red1.png');
        this.game.load.image('gun', './images/blaster.png');
    }

    create() {
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
        let canvas = this.game.add.bitmapData(size/6, size/6);
        canvas.ctx.beginPath();
        canvas.ctx.rect(0, 0, size/6 + 1, size/6 + 1);
        if (this.logic.field[y][x] in this.colors)
            canvas.ctx.fillStyle = this.colors[this.logic.field[y][x]];
        else
            canvas.ctx.fillStyle = '#eab914';
        canvas.ctx.strokeStyle = '#ffffff';
        canvas.ctx.lineWidth = '3';
        canvas.ctx.fill();
        canvas.ctx.stroke();
        this.field[y][x].rect = this.game.add.sprite(
            ...this.toDrawCoords(new Vector(x, y)).values(),
            canvas);
        this.game.physics.enable(this.field[y][x].rect);
    }

    createText(x, y){
        let size = this.game.width;
        let style = {
            font: `bold ${size / 12}px ClearSans`,
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
        graphics.lineStyle(1, 0xffffff, 1);
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

    toLogicCoords(vector) {
        return new Vector(vector.x * 6 / this.game.width - 1,
                          vector.y * 6 / this.game.width - 1)
    }

    update() {
        this.actPressedKeys();
        this.logic.update();
        this.player.position = new PIXI.Point(...this.toDrawCoords(this.logic.position).values());
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
        )
        this.field[y][x].rect.position = new PIXI.Point(
            ...this.toDrawCoords(rectLogicCoords).values()
        );
        this.field[y][x].text.position = new PIXI.Point(
            ...this.toDrawCoords(textLogicCoords).values()
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