import { Shape, Circle, Rectangle } from "./shape"

export interface Render {
    draw(...objs: Array<Shape>): void
}

export class SVGRender implements Render {
    svg: SVGElement

    constructor() {
        var container = <HTMLElement>document.getElementById('renders')

        const col = document.createElement('div')
        col.className = "col"
        container.appendChild(col)

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        this.svg.setAttribute('style', 'border: 1px solid blue')
        this.svg.setAttribute('width', '550')
        this.svg.setAttribute('height', '550')
        col.appendChild(this.svg)
    }

    draw(...objs: Array<Shape>): void {
        this.svg.innerHTML = ""
        for (const shape of objs) {
            if (shape instanceof Rectangle) {
                const e = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                e.setAttribute('style', 'stroke: black; fill: transparent')
                e.setAttribute('x', shape.x.toString())
                e.setAttribute('y', shape.y.toString())
                e.setAttribute('width', shape.width.toString())
                e.setAttribute('height', shape.height.toString())
                this.svg.appendChild(e)
            } else if (shape instanceof Circle) {
                const e = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
                e.setAttribute('style', 'stroke: black; fill: transparent')
                e.setAttribute('cx', shape.x.toString())
                e.setAttribute('cy', shape.y.toString())
                e.setAttribute('r', shape.radius.toString())
                this.svg.appendChild(e)
            }
        }
    }
}

export class CanvasRender implements Render {
    ctx: CanvasRenderingContext2D

    constructor() {
        const canvas = <HTMLCanvasElement>document.getElementById('canvas')
        this.ctx = canvas.getContext('2d')
    }

    draw(...objs: Array<Shape>): void {
        for (const shape of objs) {
            if (shape instanceof Circle) {
                this.ctx.ellipse(shape.x, shape.y, shape.radius, shape.radius, 0, 0, 2 * Math.PI)
                this.ctx.stroke()
            } else if (shape instanceof Rectangle) {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
            }
        }
    }
}