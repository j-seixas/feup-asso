import { Shape, Circle, Rectangle } from "./shape"
import { Layer } from "./layer"

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
    selectionStartX: number
    selectionStartY: number
    selectionEndX: number
    selectionEndY: number

    constructor() {
        this.zoom = 1
        this.positionX = 0
        this.positionY = 0
        var container = <HTMLElement>document.getElementById('renders')

        const col = document.createElement('div')
        col.className = "col render d-flex flex-column-reverse align-items-center"
        container.appendChild(col)

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        this.svg.setAttribute('style', 'border: 1px solid blue')
        this.svg.setAttribute('width', '550')
        this.svg.setAttribute('height', '550')
        this.svg.addEventListener("mousedown", (e: MouseEvent) => {
            e.preventDefault()
            console.log(e.currentTarget)
            const svgElem = <SVGSVGElement>e.currentTarget
            var pt = svgElem.createSVGPoint();
            
            pt.x = e.clientX;
            pt.y = e.clientY;
            var svgP = pt.matrixTransform(svgElem.getScreenCTM().inverse());
            console.log(svgP.x / this.zoom - this.positionX, svgP.y / this.zoom - this.positionY)
            // alert(this.selectionStartX + " : " + this.selectionStartY)
        })
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

    draw(...layers: Array<Layer>): void {
        this.svg.innerHTML = ""
        for (const layer of layers) {
            if (layer.visible)
                for (const shape of layer.objects) {
                    if (shape instanceof Rectangle && shape.visible) {
                        const e = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                        e.setAttribute('style', 'stroke: black; fill: tomato')
                        const x = (shape.x + this.positionX) * this.zoom
                        e.setAttribute('x', x.toString())
                        const y = (shape.y + this.positionY) * this.zoom
                        e.setAttribute('y', y.toString())
                        const w = shape.width * this.zoom
                        e.setAttribute('width', w.toString())
                        const h = shape.height * this.zoom
                        e.setAttribute('height', h.toString())
                        this.svg.appendChild(e)
                    } else if (shape instanceof Circle && shape.visible) {
                        const e = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
                        e.setAttribute('style', 'stroke: black; fill: orange')
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
        col.className = "col render d-flex flex-column-reverse align-items-center"
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

    draw(...layers: Array<Layer>): void {
        this.ctx.clearRect(0, 0, 550, 550)
        this.ctx.save()
        this.ctx.scale(this.zoom, this.zoom)
        for (const layer of layers) {
            if (layer.visible)
                for (const shape of layer.objects) {
                    if (shape instanceof Circle && shape.visible) {
                        this.ctx.beginPath()
                        this.ctx.arc(shape.x + this.positionX, shape.y + this.positionY, shape.radius, 0, 2 * Math.PI)
                        this.ctx.fillStyle = "orange";
                        this.ctx.fill()
                        this.ctx.stroke()
                        this.ctx.closePath()
                    } else if (shape instanceof Rectangle && shape.visible) {
                        this.ctx.fillStyle = "tomato";
                        this.ctx.fillRect(shape.x + this.positionX, shape.y + this.positionY, shape.width, shape.height)
                        this.ctx.strokeRect(shape.x + this.positionX, shape.y + this.positionY, shape.width, shape.height)
                    }
                }
        }
        this.ctx.restore()
    }
}