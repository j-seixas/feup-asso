import { Shape } from './shape'

export class Layer extends Shape {

    objects = new Array<Shape>()

    constructor(public name: string, public x: number, public y: number) {
        super(x, y)
    }

    add(shape: Shape): void {
        this.objects.push(shape)
    }
}