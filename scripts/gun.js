class Gun {
    constructor(logic){
        this.logic = logic;
        this.timer = Logic.randomInt(50 + (2048 - logic.fieldSum()) / 40, 100);
        let orientations = {
            1: 'up',
            2: 'right',
            3: 'down',
            4: 'left'
        };
        let positions = {
            'up': new Vector(logic.position.x, -1),
            'right': new Vector(5, logic.position.y),
            'down': new Vector(logic.position.x, 5),
            'left': new Vector(-1, logic.position.y)
        };
        this.color = logic.state;
        this.orientation = orientations[Logic.randomInt(1, 4)];
        this.position = positions[this.orientation];
        this.action = {
            'red': this.redGunAction,
            'green': this.greenGunAction
        }[logic.state];
    }

    isVertical(){
        return ['up', 'down'].includes(this.orientation);
    }

    redGunAction(){
        if (Math.abs(this.logic.position.x - this.position.x) < 0.5 ||
            Math.abs(this.logic.position.y - this.position.y) < 0.5)
            this.logic.isOver = true;
    }

    greenGunAction(){
        let first = -1;
        let last = 4;
        if (this.isVertical() && Math.floor(this.logic.position.x) === Math.floor(this.position.x)) {
            if (this.orientation === 'up')
                last = Math.round(this.logic.position.y);
            if (this.orientation === 'down')
                first = Math.round(this.logic.position.y);
        }
        if (!this.isVertical() && Math.floor(this.logic.position.y) === Math.floor(this.position.y)) {
            if (this.orientation === 'left')
                last = Math.round(this.logic.position.x);
            if (this.orientation === 'right')
                first = Math.round(this.logic.position.x);
        }
        if (this.isVertical()) {
            let x = Math.round(this.position.x - this.logic.position.x + this.logic.anchor.x - 0.5);
            x = Math.min(3, Math.max(0, x));
            for (let y = 0; y < 4; y++)
                if (y > first && y < last)
                    this.logic.field[y][x] = 0;
        } else {
            let y = Math.round(this.position.y - this.logic.position.y + this.logic.anchor.y - 0.5);
            y = Math.min(3, Math.max(0, y));
            for (let x = 0; x < 4; x++)
                if (x > first && x < last)
                    this.logic.field[y][x] = 0;
        }
    }
}