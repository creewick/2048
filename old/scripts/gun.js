class Gun {
    constructor(logic){
        this.logic = logic;
        this.timer = Logic.randomInt(25 + (2048 - logic.fieldSum()) / 25, 100);
        let orientations = {
            1: 'up',
            2: 'right',
            3: 'down',
            4: 'left'
        };
        let positions = {
            'up': (x, y) => new Vector(x, -1),
            'right': (x, y) => new Vector(5, y),
            'down': (x, y) => new Vector(x, 5),
            'left': (x, y) => new Vector(-1, y)
        };
        this.color = logic.state;
        this.orientation = orientations[Logic.randomInt(1, 4)];
        if (this.color === 'green')
            this.position = positions[this.orientation](
                Logic.randomInt(0, 3) + 0.5, Logic.randomInt(0, 3) + 0.5
            );
        else
            this.position = positions[this.orientation](logic.position.x, logic.position.y);
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
        let tile = new Vector(
            Math.min(3, Math.max(0, Math.floor(this.logic.position.x))),
            Math.min(3, Math.max(0, Math.floor(this.logic.position.y)))
        );
        let gun = new Vector(
            Math.min(3, Math.max(0, Math.floor(this.position.x))),
            Math.min(3, Math.max(0, Math.floor(this.position.y)))
        );
        if (this.isVertical() && gun.x === tile.x) {
            if (this.orientation === 'up')
                last = tile.y;
            if (this.orientation === 'down')
                first = tile.y;
        }
        if (!this.isVertical() && gun.y === tile.y) {
            if (this.orientation === 'left')
                last = tile.x - 1;
            if (this.orientation === 'right')
                first = tile.x + 1;
        }
        let flag = false;
        if (this.isVertical()) {
            for (let y = 0; y < 4; y++)
                if (y > first && y < last)
                    if (this.logic.field[y][gun.x] > 0){
                        flag = true;
                        this.logic.field[y][gun.x] = 0;
                    }
        } else {
            for (let x = 0; x < 4; x++)
                if (x >= first && x <= last)
                    if (this.logic.field[gun.y][x] > 0) {
                        flag = true;
                        this.logic.field[gun.y][x] = 0;
                    }
        }
        if (flag) this.logic.changeState();
    }
}