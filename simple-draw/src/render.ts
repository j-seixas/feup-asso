import { Shape, Circle, Rectangle } from "./shape"

export interface Render {
    zoom: number
    positionX: number
    positionY: number
    draw(...objs: Array<Shape>): void

    increaseZoom(): void
    decreaseZoom(): void
    setX(x: number): void
    setY(y: number): void
}

export class SVGRender implements Render {
    svg: SVGElement
    zoom: number
    positionX: number
    positionY: number

    constructor() {
        this.zoom = 1
        this.positionX = 0
        this.positionY = 0
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

    increaseZoom(): void {
        this.zoom *= 2
    }

    decreaseZoom(): void {
        this.zoom /= 2
    }

    setX(x: number): void {
        this.positionX += x
    }

    setY(y: number): void {
        this.positionY += y
    }

    draw(...objs: Array<Shape>): void {
        this.svg.innerHTML = ""
        for (const shape of objs) {
            if (shape instanceof Rectangle) {
                const e = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                e.setAttribute('style', 'stroke: black; fill: transparent')
                const x = (shape.x + this.positionX) * this.zoom
                e.setAttribute('x', x.toString())
                const y = (shape.y + this.positionY) * this.zoom
                e.setAttribute('y', y.toString())
                const w = shape.width * this.zoom
                e.setAttribute('width', w.toString())
                const h = shape.height * this.zoom
                e.setAttribute('height', h.toString())
                this.svg.appendChild(e)
            } else if (shape instanceof Circle) {
                const e = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
                e.setAttribute('style', 'stroke: black; fill: transparent')
                const x = (shape.x + this.positionX) * this.zoom
                e.setAttribute('cx', x.toString())
                const y = (shape.y + this.positionY) * this.zoom
                e.setAttribute('cy', y.toString())
                const r = shape.radius * this.zoom
                e.setAttribute('r', r.toString())
                this.svg.appendChild(e)
            }
        }
    }
}

export class CanvasRender implements Render {
    ctx: CanvasRenderingContext2D
    zoom: number
    positionX: number
    positionY: number

    constructor() {
        this.zoom = 1
        this.positionX = 0
        this.positionY = 0
        var container = <HTMLElement>document.getElementById('renders')

        const col = document.createElement('div')
        col.className = "col"
        container.appendChild(col)

        const canvas = document.createElement('canvas')
        canvas.setAttribute('style', 'border: 1px solid red')
        canvas.setAttribute('width', '550')
        canvas.setAttribute('height', '550')
        col.appendChild(canvas)

        this.ctx = canvas.getContext('2d')
    }

    increaseZoom(): void {
        this.zoom *= 2
    }

    decreaseZoom(): void {
        this.zoom /= 2
    }

    setX(x: number): void {
        this.positionX += x
    }

    setY(y: number): void {
        this.positionY += y
    }

    draw(...objs: Array<Shape>): void {
        this.ctx.clearRect(0, 0, 550, 550)
        this.ctx.save()
        this.ctx.scale(this.zoom, this.zoom)
        for (const shape of objs) {
            if (shape instanceof Circle) {
                this.ctx.beginPath()
                this.ctx.arc(shape.x + this.positionX, shape.y + this.positionY, shape.radius, 0, 2 * Math.PI)
                this.ctx.stroke()
                this.ctx.closePath()
            } else if (shape instanceof Rectangle) {
                this.ctx.strokeRect(shape.x + this.positionX, shape.y + this.positionY, shape.width, shape.height)
            }
        }
        this.ctx.restore()
    }
}