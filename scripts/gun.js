class Gun {
    constructor(){
        this.position = this.generatePosition();
        this.timer = Logic.randomInt(100, 100);
    }

    generatePosition(){
        let gunsPosition = {
            1: new Vector(logic.position.x, -1),
            2: new Vector(5, logic.position.y),
            3: new Vector(logic.position.x, 5),
            4: new Vector(-1, logic.position.y)
        };
        return gunsPosition[Logic.randomInt(1, 4)];
    }

    action(){
        if (Math.abs(logic.position.x - this.position.x) < 0.5 ||
            Math.abs(logic.position.y - this.position.y) < 0.5)
            logic.isOver = true;
    }
}