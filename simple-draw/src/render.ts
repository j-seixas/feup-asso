import { Shape, Circle, Rectangle, ShapeStyle } from "./shape"
import { Layer } from "./layer"
import { Selection } from './selection'

export enum RenderStyle {
    Normal, Backgrounded
}

export abstract class RenderStyler {
    static style: RenderStyle

    static changeStyle() {
        if (RenderStyler.style === RenderStyle.Normal) {
            RenderStyler.style = RenderStyle.Backgrounded
        }
        else if (RenderStyler.style === RenderStyle.Backgrounded) {
            RenderStyler.style = RenderStyle.Normal
        }
    }
}

export interface Render {
    zoom: number
    positionX: number
    positionY: number
    selectionStartX: number
    selectionStartY: number
    selectionEndX: number
    selectionEndY: number
    shapeStyle: ShapeStyle
    draw(...objs: Array<Shape>): void

    increaseZoom(factor: number): void
    decreaseZoom(factor: number): void
    setX(x: number): void
    setY(y: number): void
}

export class SVGRender extends RenderStyler implements Render {
    shapeStyle: ShapeStyle;
    svg: SVGElement
    zoom: number
    positionX: number
    positionY: number
    selectionStartX: number
    selectionStartY: number
    selectionEndX: number
    selectionEndY: number


    constructor() {
        super();
        this.zoom = 1
        this.positionX = 0
        this.positionY = 0
        var container = <HTMLElement>document.getElementById('renders')

        const col = document.createElement('div')
        col.className = "col render d-flex flex-column-reverse align-items-center"
        container.appendChild(col)

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        if (RenderStyler.style === RenderStyle.Normal) {
            this.svg.setAttribute('style', 'border: 1px solid blue')
        }
        else if (RenderStyler.style === RenderStyle.Backgrounded) {
            this.svg.setAttribute('style', 'border: 3px solid blue; background-color: #9BC1FF; ')
        }
        this.svg.setAttribute('width', '550')
        this.svg.setAttribute('height', '500')
        this.svg.addEventListener('mousedown', (e: MouseEvent) => {

            const svgElem = <SVGSVGElement>e.currentTarget
            var pt = svgElem.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            var svgP = pt.matrixTransform(svgElem.getScreenCTM().inverse());

            this.selectionStartX = svgP.x / this.zoom - this.positionX
            this.selectionStartY = svgP.y / this.zoom - this.positionY
        })
        this.svg.addEventListener('mouseup', (e: MouseEvent) => {

            const svgElem = <SVGSVGElement>e.currentTarget
            var pt = svgElem.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            var svgP = pt.matrixTransform(svgElem.getScreenCTM().inverse());

            this.selectionEndX = svgP.x / this.zoom - this.positionX
            this.selectionEndY = svgP.y / this.zoom - this.positionY

            Selection.getInstance().newSelection(this.selectionStartX, this.selectionStartY, this.selectionEndX, this.selectionEndY)
        })
        col.appendChild(this.svg)
    }

    mouseDown(e: MouseEvent): void {

    }

    increaseZoom(factor: number): void {
        this.zoom *= factor
    }

    decreaseZoom(factor: number): void {
        this.zoom /= factor
    }

    setX(x: number): void {
        this.positionX += x
    }

    setY(y: number): void {
        this.positionY += y
    }

    setFillUpSvg(shape: Shape, firstColor: string, secondColor: string): string{
        if (shape instanceof Rectangle) {
            return "fill: " + firstColor + ";" 
        }
        if (shape instanceof Circle) {
            return "fill: " + secondColor + ";" 
        }
    }

    setStyleSvg(shape: Shape): string{
        let stringToReturn = ""
        stringToReturn += shape.selected ? 'stroke: blue;'  : 'stroke:black; ' 
        if(this.shapeStyle === ShapeStyle.Color){
            stringToReturn += shape.selected ? "fill-opacity: 0.75;" : ""
            stringToReturn += this.setFillUpSvg(shape,"green; ", "red;")
        }
        else if(this.shapeStyle === ShapeStyle.Wireframe){
            stringToReturn += this.setFillUpSvg(shape, "white; fill-opacity: 0;", "white; fill-opacity: 0;")
        }
        else{
            stringToReturn += shape.selected ? "fill-opacity: 0.75;" : ""
            stringToReturn += this.setFillUpSvg(shape, "grey;", "grey;")
        }
        
        return stringToReturn
    }

    draw(...layers: Array<Layer>): void {
        this.svg.innerHTML = ""
        for (const layer of layers) {
            if (layer.visible)
                for (const shape of layer.objects) {
                    if (shape instanceof Rectangle && shape.visible) {
                        const e = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                        e.setAttribute('style', this.setStyleSvg(shape))
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
                        e.setAttribute('style', this.setStyleSvg(shape))
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

export class CanvasRender extends RenderStyler implements Render {
    shapeStyle: ShapeStyle;
    ctx: CanvasRenderingContext2D
    zoom: number
    positionX: number
    positionY: number
    selectionStartX: number
    selectionStartY: number
    selectionEndX: number
    selectionEndY: number

    constructor() {
        super();
        this.zoom = 1
        this.positionX = 0
        this.positionY = 0
        var container = <HTMLElement>document.getElementById('renders')

        const col = document.createElement('div')
        col.className = "col render d-flex flex-column-reverse align-items-center"
        container.appendChild(col)

        const canvas = document.createElement('canvas')
        if (RenderStyler.style === RenderStyle.Normal) {
            canvas.setAttribute('style', 'border: 1px solid red')
        }
        else if (RenderStyle.Backgrounded === RenderStyle.Backgrounded) {
            canvas.setAttribute('style', 'border: 3px solid red; background-color: #9BC1FF;')
        }
        canvas.setAttribute('width', '550')
        canvas.setAttribute('height', '500')
        canvas.addEventListener('mousedown', (e: MouseEvent) => {

            const canvasElem = <HTMLElement>e.currentTarget
            const rect = canvasElem.getBoundingClientRect();

            this.selectionStartX = (e.clientX - rect.left) / this.zoom - this.positionX
            this.selectionStartY = (e.clientY - rect.top) / this.zoom - this.positionY
        })
        canvas.addEventListener('mouseup', (e: MouseEvent) => {

            const canvasElem = <HTMLElement>e.currentTarget
            const rect = canvasElem.getBoundingClientRect();

            this.selectionEndX = (e.clientX - rect.left) / this.zoom - this.positionX
            this.selectionEndY = (e.clientY - rect.top) / this.zoom - this.positionY

            Selection.getInstance().newSelection(this.selectionStartX, this.selectionStartY, this.selectionEndX, this.selectionEndY)
        })
        col.appendChild(canvas)

        this.ctx = canvas.getContext('2d')
    }

    increaseZoom(factor: number): void {
        this.zoom *= factor
    }

    decreaseZoom(factor: number): void {
        this.zoom /= factor
    }

    setX(x: number): void {
        this.positionX += x
    }

    setY(y: number): void {
        this.positionY += y
    }

    setFillUpCnvs(shape: Shape, firstColor: string, secondColor: string): void{
        if (shape instanceof Rectangle) {
            this.ctx.fillStyle = firstColor
        }
        if (shape instanceof Circle) {
            this.ctx.fillStyle = secondColor
        }
    }

    setStyleCnvs(shape: Shape): void{
        
        if(this.shapeStyle === ShapeStyle.Color){
            let color1 = shape.selected ? "rgba(0, 128, 0, 0.75)" : "rgba(0, 128, 0, 1)"
            let color2 = shape.selected ? "rgb(255, 0, 0, 0.75)" : "rgb(255, 0, 0, 1)"
            this.setFillUpCnvs(shape,color1, color2) //green / red
        }
        else if(this.shapeStyle === ShapeStyle.Wireframe){ 
            let color = shape.selected ? "rgba(255, 255, 255, 0)" :"rgba(255, 255, 255, 0)" 
            this.setFillUpCnvs(shape, color, color)
        }
        else{
            let color = shape.selected ? "rgba(128,128,128, 0.75)" : "rgba(128,128,128, 1)"
            this.setFillUpCnvs(shape, color, color)
        }
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
                        this.setStyleCnvs(shape)
                        this.ctx.fill()
                        this.ctx.strokeStyle = shape.selected ? "blue" : "black"
                        this.ctx.stroke()
                        this.ctx.closePath()
                    } else if (shape instanceof Rectangle && shape.visible) {
                        this.setStyleCnvs(shape)
                        this.ctx.fillRect(shape.x + this.positionX, shape.y + this.positionY, shape.width, shape.height)
                        this.ctx.strokeStyle = shape.selected ? "blue" : "black"
                        this.ctx.strokeRect(shape.x + this.positionX, shape.y + this.positionY, shape.width, shape.height)
                    }
                }
        }
        this.ctx.restore()
    }
}