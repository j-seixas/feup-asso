import { SimpleDrawDocument } from './document'
import { CanvasRender, SVGRender } from './render'

export class EventListener {
    doc: SimpleDrawDocument
    render: SVGRender
    rectangleButton: HTMLElement
    circleButton: HTMLElement

    constructor(doc: SimpleDrawDocument, render: SVGRender) {
        this.doc = doc
        this.render = render
        this.rectangleButton = <HTMLElement>document.getElementById('create-rectangle')
        this.rectangleButton.addEventListener("click", (e: Event) => this.drawRectangle())

        this.circleButton = <HTMLElement>document.getElementById('create-circle')
        this.circleButton.addEventListener("click", (e: Event) => this.drawCircle())
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