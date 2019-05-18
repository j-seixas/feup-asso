import { SimpleDrawDocument } from './document'
import { CanvasRender, SVGRender } from './render'

export class EventListener {
    doc: SimpleDrawDocument
    render: SVGRender
    undoButton: HTMLElement
    redoButton: HTMLElement
    rectangleButton: HTMLElement
    circleButton: HTMLElement
    canvasButton: HTMLElement
    svgButton: HTMLElement

    constructor(doc: SimpleDrawDocument, render: SVGRender) {
        this.doc = doc
        this.render = render

        this.undoButton = <HTMLElement>document.getElementById('undo')
        this.undoButton.addEventListener("click", (e: Event) => {
            this.doc.undo()
            this.doc.draw(this.render)
        })

        this.redoButton = <HTMLElement>document.getElementById('redo')
        this.redoButton.addEventListener("click", (e: Event) => {
            this.doc.redo()
            this.doc.draw(this.render)
        })

        this.rectangleButton = <HTMLElement>document.getElementById('create-rectangle')
        this.rectangleButton.addEventListener("click", (e: Event) => this.drawRectangle())

        this.circleButton = <HTMLElement>document.getElementById('create-circle')
        this.circleButton.addEventListener("click", (e: Event) => this.drawCircle())

        this.canvasButton = <HTMLElement>document.getElementById('create-canvas')
        this.canvasButton.addEventListener("click", (e: Event) => this.drawCircle())

        this.svgButton = <HTMLElement>document.getElementById('create-svg')
        this.svgButton.addEventListener("click", (e: Event) => this.drawCircle())
    }

    drawRectangle() {
        var xPosition = parseInt((<HTMLInputElement>document.getElementById('input-rect-x')).value)
        var yPosition = parseInt((<HTMLInputElement>document.getElementById('input-rect-y')).value)
        var heigth = parseInt((<HTMLInputElement>document.getElementById('input-rect-h')).value)
        var width = parseInt((<HTMLInputElement>document.getElementById('input-rect-w')).value)

        this.doc.createRectangle(xPosition, yPosition, width, heigth)
        this.doc.draw(this.render)
    }

    drawCircle() {
        var xPosition = parseInt((<HTMLInputElement>document.getElementById('input-circle-x')).value)
        var yPosition = parseInt((<HTMLInputElement>document.getElementById('input-circle-y')).value)
        var r = parseInt((<HTMLInputElement>document.getElementById('input-circle-r')).value)

        this.doc.createCircle(xPosition, yPosition, r)
        this.doc.draw(this.render)
    }
}