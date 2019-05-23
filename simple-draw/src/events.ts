import { SimpleDrawDocument } from './document'
import { ViewController, SVGFactory, CanvasFactory } from './view'

export class EventListener {
    doc: SimpleDrawDocument
    view: ViewController
    undoButton: HTMLElement
    redoButton: HTMLElement
    rectangleButton: HTMLElement
    circleButton: HTMLElement
    canvasButton: HTMLElement
    svgButton: HTMLElement

    constructor(doc: SimpleDrawDocument, view: ViewController) {
        this.doc = doc
        this.view = view

        this.undoButton = <HTMLElement>document.getElementById('undo')
        this.undoButton.addEventListener("click", (e: Event) => {
            this.doc.undo()
            this.view.render()
        })

        this.redoButton = <HTMLElement>document.getElementById('redo')
        this.redoButton.addEventListener("click", (e: Event) => {
            this.doc.redo()
            this.view.render()
        })

        this.rectangleButton = <HTMLElement>document.getElementById('create-rectangle')
        this.rectangleButton.addEventListener("click", (e: Event) => this.drawRectangle())

        this.circleButton = <HTMLElement>document.getElementById('create-circle')
        this.circleButton.addEventListener("click", (e: Event) => this.drawCircle())

        this.canvasButton = <HTMLElement>document.getElementById('create-canvas')
        this.canvasButton.addEventListener("click", (e: Event) => {
            this.view.addRender(new CanvasFactory())
        })

        this.svgButton = <HTMLElement>document.getElementById('create-svg')
        this.svgButton.addEventListener("click", (e: Event) => {
            this.view.addRender(new SVGFactory())
        })
    }

    drawRectangle() {
        var xPosition = parseInt((<HTMLInputElement>document.getElementById('input-rect-x')).value)
        var yPosition = parseInt((<HTMLInputElement>document.getElementById('input-rect-y')).value)
        var heigth = parseInt((<HTMLInputElement>document.getElementById('input-rect-h')).value)
        var width = parseInt((<HTMLInputElement>document.getElementById('input-rect-w')).value)

        this.doc.createRectangle(xPosition, yPosition, width, heigth)
        this.view.render()
    }

    drawCircle() {
        var xPosition = parseInt((<HTMLInputElement>document.getElementById('input-circle-x')).value)
        var yPosition = parseInt((<HTMLInputElement>document.getElementById('input-circle-y')).value)
        var r = parseInt((<HTMLInputElement>document.getElementById('input-circle-r')).value)

        this.doc.createCircle(xPosition, yPosition, r)
        this.view.render()
    }
}