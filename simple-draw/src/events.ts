import { SimpleDrawDocument } from './document'
import { ViewsController } from './view'

export class EventListener {
    doc: SimpleDrawDocument
    view: ViewsController
    undoButton: HTMLElement
    redoButton: HTMLElement
    rectangleButton: HTMLElement
    circleButton: HTMLElement
    canvasButton: HTMLElement
    svgButton: HTMLElement

    constructor(doc: SimpleDrawDocument, view: ViewsController) {
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
            this.view.addRender(this.view.createCanvas())
            this.createViewportTools()
        })
        
        this.svgButton = <HTMLElement>document.getElementById('create-svg')
        this.svgButton.addEventListener("click", (e: Event) => {
            this.view.addRender(this.view.createSVG())
            this.createViewportTools()
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

    createViewportTools(){
        const lastRender = document.querySelectorAll("[id=renders] > .col")
        const lastRenderId = lastRender.length - 1

        const buttonZoomIn = document.createElement('button')
        buttonZoomIn.className = "btn btn-outline-primary"
        
        const iconZoomIn = document.createElement('i')
        iconZoomIn.className = "fa fa-search-plus"
        buttonZoomIn.appendChild(iconZoomIn)

        buttonZoomIn.addEventListener("click", (e: Event) => {this.view.increaseZoom(lastRenderId); this.view.render()})

        const buttonZoomOut = document.createElement('button')
        buttonZoomOut.className = "btn btn-outline-danger"
        
        const iconZoomOut = document.createElement('i')
        iconZoomOut.className = "fa fa-search-minus"
        buttonZoomOut.appendChild(iconZoomOut)

        buttonZoomOut.addEventListener("click", (e: Event) => {this.view.decreaseZoom(lastRenderId); this.view.render()})

        const buttonUp = document.createElement('button')
        buttonUp.className = "btn btn-outline-primary"
        buttonUp.innerHTML = "up"
        buttonUp.addEventListener("click", (e: Event) => {this.view.setPositionY(lastRenderId, -10); this.view.render()})

        const buttonLeft = document.createElement('button')
        buttonLeft.className = "btn btn-outline-primary"
        buttonLeft.innerHTML = "left"
        buttonLeft.addEventListener("click", (e: Event) => {this.view.setPositionX(lastRenderId, -10); this.view.render()})

        const buttonDown = document.createElement('button')
        buttonDown.className = "btn btn-outline-primary"
        buttonDown.innerHTML = "down"
        buttonDown.addEventListener("click", (e: Event) => {this.view.setPositionY(lastRenderId, 10); this.view.render()})

        const buttonRight = document.createElement('button')
        buttonRight.className = "btn btn-outline-primary"
        buttonRight.innerHTML = "right"
        buttonRight.addEventListener("click", (e: Event) => {this.view.setPositionX(lastRenderId, 10); this.view.render()})

        lastRender[lastRenderId].appendChild(buttonZoomIn)
        lastRender[lastRenderId].appendChild(buttonZoomOut)
        lastRender[lastRenderId].appendChild(buttonUp)
        lastRender[lastRenderId].appendChild(buttonDown)
        lastRender[lastRenderId].appendChild(buttonLeft)
        lastRender[lastRenderId].appendChild(buttonRight)
    }
}