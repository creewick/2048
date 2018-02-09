class Mover {
    constructor(array){
        this.state = [];
        for (let i = 0; i < array.length; i++)
            this.state[i] = {
                    value: array[i],
                    oldIndex: [i]
                };
    }

    act(){
        return this.removeZeros()
                   .glueSameNumbers()
                   .removeZeros()
                   .formatTo(4);
    }

    getArray(){
        let array = [];
        for (let index in this.state)
            array[index] = this.state[index].value;
        return array;
    }

    getAnimation(){
        let animation = [];
        for (let newIndex = 0; newIndex < this.state.length; newIndex++){
            if (this.state[newIndex].oldIndex !== undefined) {
                for (let i = 0; i < this.state[newIndex].oldIndex.length; i++) {
                    let oldIndex = this.state[newIndex].oldIndex[i];
                    animation[oldIndex] = newIndex;
                }
            }
        }
        return animation;
    }

    reverse(){
        this.state.reverse();
        return this;
    }

    removeZeros(){
        let result = [];
        for (let index in this.state)
            if (this.state[index].value > 0)
                result.push(this.state[index]);
        this.state = result;
        return this;
    }

    glueSameNumbers(){
        for (let i = 0; i < this.state.length - 1; i++){
            if (this.state[i].value === this.state[i+1].value){
                this.state[i].value *= 2;
                this.state[i].oldIndex.push(
                    this.state[i+1].oldIndex
                );
                this.state[i+1].value = 0;
            }
        }
        return this;
    }

    formatTo(length){
        while (this.state.length < length)
            this.state.push(
                {
                    value: 0
                }
            );
        return this;
    }
}