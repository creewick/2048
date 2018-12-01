class Controller {
    constructor() {
        this.controls = this.controls();
    }

    controls(){
        let dict = {};
        dict[Phaser.Keyboard.A] = new Vector(-1, 0);
        dict[Phaser.Keyboard.D] = new Vector(1, 0);
        dict[Phaser.Keyboard.W] = new Vector(0, -1);
        dict[Phaser.Keyboard.S] = new Vector(0, 1);
        dict[Phaser.Keyboard.LEFT] = new Vector(-1, 0);
        dict[Phaser.Keyboard.RIGHT] = new Vector(1, 0);
        dict[Phaser.Keyboard.UP] = new Vector(0, -1);
        dict[Phaser.Keyboard.DOWN] = new Vector(0, 1);
        return dict;
    }

    act(logic, pressed){
        let result = new Vector(0, 0);
        for (let index in pressed)
            result = result.add(
                this.controls[pressed[index]]);
        logic.move(result);
    }
}

