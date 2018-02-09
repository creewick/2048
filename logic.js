class Logic {

    constructor(field=null, pos=null){
        this.field = Logic.checkField(field);
        this.animationField = null;
        this.guns = [];
        this.speed = 0.02;
        this.anchorSpeed = this.speed / 2.5;
        this.position = Logic.checkPosition(pos);
        this.anchor = this.position.copy();
        this.over = false;
    }

    start() {
        for (let i = 0; i < 2; i++)
            this.placeTile();
    }

    update() {
        if (!this.over){
            if (this.shouldAddGun())
                this.addGun();
            this.moveAnchor();
            if (this.shouldMoveTiles()) {
                this.moveTiles();
                this.placeTile();
            }
        }
    }

    move(vector){
        if (Math.abs(vector.x) <= 1 && Math.abs(vector.y) <= 1){
            this.position.x = Math.min(4, Math.max(0,
                vector.x * this.speed + this.position.x));
            this.position.y = Math.min(4, Math.max(0,
                vector.y * this.speed + this.position.y));
        }
    }

    moveTiles(){
        let vector = this.position.sub(this.anchor);
        this.dropAnchor();
        if (Math.abs(vector.x) > Math.abs(vector.y))
            if (vector.x > 0)
                this.moveRight();
            else
                this.moveLeft();
        else
            if (vector.y > 0)
                this.moveDown();
            else
                this.moveUp();
    }

//  ANCHOR
    dropAnchor(){
        this.anchor = new Vector(this.position.x, this.position.y);
    }

    moveAnchor(){
        let vector = this.position.sub(this.anchor);
        if (vector.norm() > 0.01)
            this.anchor = this.anchor.add(
                          vector.normalize()
                                .mul(this.anchorSpeed)
            );
    }

//  MOVEMENT
    moveLeft(){
        this.animationField = [];
        for (let y = 0; y < 4; y++){
            this.animationField[y] = [];
            let result = new Mover(this.field[y]).act();
            let line = result.getArray();
            for (let x = 0; x < 4; x++)
                this.field[y][x] = line[x];
            let animation = result.getAnimation();
            for (let x = 0; x < 4; x++) {
                if (animation[x] === undefined)
                    animation[x] = x;
                this.animationField[y][x] = new Vector(animation[x], y);
            }
        }
    }

    moveRight(){
        this.animationField = [];
        for (let y = 0; y < 4; y++){
            this.animationField[y] = [];
            let result = new Mover(this.field[y])
                             .reverse().act().reverse();
            let line = result.getArray();
            for (let x = 0; x < 4; x++)
                this.field[y][x] = line[x];
            let animation = result.getAnimation();
            for (let x = 0; x < 4; x++) {
                if (animation[x] === undefined)
                    animation[x] = x;
                this.animationField[y][x] = new Vector(animation[x], y);
            }
        }
    }

    moveDown(){
        this.animationField = [];
        for (let y = 0; y < 4; y++)
            this.animationField[y] = [];
        for (let x = 0; x < 4; x++){
            let line = [];
            for (let y = 0; y < 4; y++)
                line.push(this.field[y][x]);
            let result = new Mover(line)
                              .reverse().act().reverse();
            line = result.getArray();
            for (let y = 0; y < 4; y++)
                this.field[y][x] = line[y];
            let animation = result.getAnimation();
            for (let y = 0; y < 4; y++){
                if (animation[y] === undefined)
                    animation[y] = y;
                this.animationField[y][x] = new Vector(x, animation[y]);
            }
        }
    }

    moveUp(){
        this.animationField = [];
        for (let y = 0; y < 4; y++)
            this.animationField[y] = [];
        for (let x = 0; x < 4; x++) {
            let line = [];
            for (let y = 0; y < 4; y++)
                line.push(this.field[y][x]);
            let result = new Mover(line).act();
            line = result.getArray();
            for (let y = 0; y < 4; y++)
                this.field[y][x] = line[y];
            let animation = result.getAnimation();
            for (let y = 0; y < 4; y++){
                if (animation[y] === undefined)
                    animation[y] = y;
                this.animationField[y][x] = new Vector(x, animation[y]);
            }
        }
    }

    shouldMoveTiles(){
        let vector = this.position.sub(this.anchor);
        return Math.abs(vector.x) > 0.5 || Math.abs(vector.y) > 0.5;
    }

    shouldAddGun(){
        return false;
    }

    addGun(){
        let gunsPosition = {
            1: new Vector(this.position.x, -1),
            2: new Vector(5, this.position.y),
            3: new Vector(this.position.x, 5),
            4: new Vector(-1, this.position.y)
        };
        this.guns.push(gunsPosition[Logic.randomInt(1, 4)]);
    }

    placeTile() {
        let emptyTiles = this.emptyTiles();
        if (emptyTiles.length === 0)
        {
            this.over = 0;
            return
        }
        let i = Logic.randomInt(0, emptyTiles.length - 1);
        let emptyCoords = emptyTiles[i];
        if (Logic.randomInt(0, 99) <= 90)
            this.field[emptyCoords.y][emptyCoords.x] = 2;
        else
            this.field[emptyCoords.y][emptyCoords.x] = 4;
    }

    emptyTiles(){
        let emptyTiles = [];
        for (let x = 0; x < 4; x++)
            for (let y = 0; y < 4; y++)
                if (this.field[y][x] === 0)
                    emptyTiles.push(new Vector(x, y));
        return emptyTiles;
    }

    static randomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

//  CHECK METHODS
    static checkPosition(pos) {
        if (pos instanceof Vector &&
            0 <= pos.x <= 4 && 0 <= pos.y <= 4)
            return pos;
        return new Vector(2, 2);
    }

    static checkField(field){
        if (!Array.isArray(field) || field.length !== 4 ||
            !Array.isArray(field[0]) || field[0].length !== 4)
            return Logic.emptyField();
        for (let y = 0; y < 4; y++)
            for (let x = 0; x < 4; x++)
                if (!Logic.isLegalValue(field[y][x]))
                    return Logic.emptyField();
        return field;
    }

    static isLegalValue(value){
        return value === 0 || !(value & (value - 1));
    }

    static emptyField(){
        let field = [];
        for (let y = 0; y < 4; y++) {
            field[y] = [];
            for (let x = 0; x < 4; x++)
                field[y][x] = 0;
        }
        return field;
    }
}