class Vector {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    values(){
        return [this.x, this.y]
    }

    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    argument(){
        let radians = Math.acos(
            this.mul(new Vector(0, 1)) / this.norm());
        let degrees = radians * 180 / Math.PI;
        if (this.x < 0)
            return 360 - degrees;
        return degrees;
    }

    normalize() {
        let norm = this.norm();
        if (norm === 0)
            return new Vector(0, 0);
        return new Vector(this.x / norm, this.y / norm);
    }

    rotate(degrees){
        let radians = degrees * Math.PI / 180;
        let sin = Math.sin(radians);
        let cos = Math.cos(radians);
        return new Vector(cos * this.x - sin * this.y,
                          sin * this.x + cos * this.y);
    }

    copy(){
        return new Vector(this.x, this.y);
    }

//  MATH OPERATORS
    mul(arg){
        if (arg instanceof Vector)
            return this.x * arg.x + self.y * arg.y;
        if (typeof(arg) === 'number')
            return new Vector(this.x * arg, this.y * arg);
        throw TypeError;
    }

    div(arg){
        if (typeof(arg) === 'number')
            return new Vector(this.x / arg, this.y / arg);
        throw TypeError;
    }

    sub(arg){
        if (arg instanceof Vector)
            return new Vector(this.x - arg.x, this.y - arg.y);
        throw TypeError;
    }

    add(arg){
        if (arg instanceof Vector)
            return new Vector(this.x + arg.x, this.y + arg.y);
        throw TypeError;
    }
}
