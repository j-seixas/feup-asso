import { ViewController } from './view'

export abstract class Tool {
    constructor(protected controller: ViewController){}
    abstract createTool(lastRenderId: number): Element;
}

export class Zoom extends Tool {

    increaseZoom(idRender: number): void {
        this.controller.renders[idRender].increaseZoom()
    }

    decreaseZoom(idRender: number): void {
        this.controller.renders[idRender].decreaseZoom()
    }

    createTool(lastRenderId: number): Element {
        const zoomContainer = document.createElement('div')

        const buttonGroup = document.createElement('div')
        buttonGroup.className = "btn-group"

        const buttonZoomIn = document.createElement('button')
        buttonZoomIn.className = "btn btn-dark"

        const iconZoomIn = document.createElement('i')
        iconZoomIn.className = "fas fa-search-plus"
        buttonZoomIn.appendChild(iconZoomIn)

        buttonZoomIn.addEventListener("click", (e: Event) => { this.increaseZoom(lastRenderId); this.controller.render() })

        const buttonZoomOut = document.createElement('button')
        buttonZoomOut.className = "btn btn-dark"

        const iconZoomOut = document.createElement('i')
        iconZoomOut.className = "fa fa-search-minus"
        buttonZoomOut.appendChild(iconZoomOut)

        buttonZoomOut.addEventListener("click", (e: Event) => { this.decreaseZoom(lastRenderId); this.controller.render() })

        buttonGroup.appendChild(buttonZoomIn)
        buttonGroup.appendChild(buttonZoomOut)
        zoomContainer.appendChild(buttonGroup)

        return zoomContainer
    }
}

export class Translate extends Tool {

    setPositionX(idRender: number, n: number): void {
        this.controller.renders[idRender].setX(n)
    }

    setPositionY(idRender: number, n: number): void {
        this.controller.renders[idRender].setY(n)
    }

    createTool(lastRenderId: number): Element {
        const translateContainer = document.createElement('div')

        const buttonGroup = document.createElement('div')
        buttonGroup.className = "btn-group"

        const buttonUp = document.createElement('button')
        buttonUp.className = "btn btn-dark"
        buttonUp.innerHTML = "up"
        buttonUp.addEventListener("click", (e: Event) => { this.setPositionY(lastRenderId, -10); this.controller.render() })

        const buttonLeft = document.createElement('button')
        buttonLeft.className = "btn btn-dark"
        buttonLeft.innerHTML = "left"
        buttonLeft.addEventListener("click", (e: Event) => { this.setPositionX(lastRenderId, -10); this.controller.render() })

        const buttonDown = document.createElement('button')
        buttonDown.className = "btn btn-dark"
        buttonDown.innerHTML = "down"
        buttonDown.addEventListener("click", (e: Event) => { this.setPositionY(lastRenderId, 10); this.controller.render() })

        const buttonRight = document.createElement('button')
        buttonRight.className = "btn btn-dark"
        buttonRight.innerHTML = "right"
        buttonRight.addEventListener("click", (e: Event) => { this.setPositionX(lastRenderId, 10); this.controller.render() })

        buttonGroup.appendChild(buttonLeft)
        buttonGroup.appendChild(buttonUp)
        buttonGroup.appendChild(buttonDown)
        buttonGroup.appendChild(buttonRight)
        translateContainer.appendChild(buttonGroup)

        return translateContainer
    }
}