import { Shape, Circle, Rectangle } from './shape'
import { Layer } from './layer'

export interface Action<T> {
    do(): T
    undo(): void
}

abstract class CreateShapeAction<S extends Shape> implements Action<S> {
    constructor(private layer: Layer, public readonly shape: S) { }

    do(): S {
        this.layer.add(this.shape)
        return this.shape
    }

    undo() {
        this.layer.objects = this.layer.objects.filter(obj => obj !== this.shape)
    }
}

export class CreateCircleAction extends CreateShapeAction<Circle> {
    constructor(layer: Layer, private x: number, private y: number, private radius: number) {
        super(layer, new Circle(x, y, radius, 0))
    }
}

export class CreateRectangleAction extends CreateShapeAction<Rectangle> {
    constructor(layer: Layer, private x: number, private y: number, private width: number, private height: number) {
        super(layer, new Rectangle(x, y, width, height, 0))
    }
}

export class TranslateAction implements Action<void> {
    oldX: number
    oldY: number

    constructor(public shape: Shape, private xd: number, private yd: number) { }

    do(): void {
        this.oldX = this.shape.x
        this.oldY = this.shape.y
        this.shape.translate(this.xd, this.yd)
    }

    undo() {
        this.shape.x = this.oldX
        this.shape.y = this.oldY
    }
}

export class RotateAction implements Action<void> {
    oldDegree: number

    constructor(public shape: Shape, private degree: number) { }

    do(): void {
        this.oldDegree = this.shape.rotation
        this.shape.rotate(this.degree)
    }

    undo() {
        this.shape.rotation = this.oldDegree
    }
}