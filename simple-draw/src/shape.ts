export enum ShapeStyle {
    Default, Wireframe, Color
}

export abstract class Shape {

    visible = true
    selected = false
  

    constructor(public x: number, public y: number, public rotation: number) { }

    translate(xd: number, yd: number): void {
        this.x += xd
        this.y += yd
    }

    rotate(degree: number): void {
        this.rotation += degree
    }
}

export class Rectangle extends Shape {
    constructor(public x: number, public y: number, public width: number, public height: number, public rotation: number) {
        super(x, y, rotation)
    }
}

export class Circle extends Shape {
    constructor(public x: number, public y: number, public radius: number, public rotation: number) {
        super(x, y, rotation)
    }
}