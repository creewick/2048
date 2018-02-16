class Gun {
    constructor(logic){
        console.log(this);
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

    }
}