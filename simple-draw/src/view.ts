import { SimpleDrawDocument } from './document'
import { Render, SVGRender, CanvasRender } from './render'

export interface RenderFactory {
    createRender(): Render
}

export class SVGFactory implements RenderFactory {
    createRender(): Render {
        return new SVGRender()
    }
}

export class CanvasFactory implements RenderFactory {
    createRender(): Render {
        return new CanvasRender()
    }
}

export class ViewController {
    renders = new Array<Render>()

    constructor(public doc: SimpleDrawDocument, factory: RenderFactory) {
        this.renders.push(factory.createRender())
        this.createViewportTools()
        //this.createLayers()
    }

    addRender(factory: RenderFactory) {
        this.renders.push(factory.createRender())
        this.createViewportTools()
        this.render()
    }

    increaseZoom(idRender: number) {
        this.renders[idRender].increaseZoom()
    }

    decreaseZoom(idRender: number) {
        this.renders[idRender].decreaseZoom()
    }

    setPositionX(idRender: number, n: number) {
        this.renders[idRender].setX(n)
    }

    setPositionY(idRender: number, n: number) {
        this.renders[idRender].setY(n)
    }

    render() {
        for (const render of this.renders) {
            this.doc.draw(render)
        }
    }

    createViewportTools() {
        const lastRender = document.querySelectorAll("[id=renders] > .col .render")
        const lastRenderId = lastRender.length - 1

        const buttonContainer = document.createElement('div')
        buttonContainer.className = "viewport-tools"

        buttonContainer.appendChild(this.createZoomTools(lastRenderId))
        buttonContainer.appendChild(this.createTranslateTools(lastRenderId))

        lastRender[lastRenderId].appendChild(buttonContainer)
    }

    createZoomTools(lastRenderId: number) {
        const zoomContainer = document.createElement('div')

        const buttonGroup = document.createElement('div')
        buttonGroup.className = "btn-group"

        const buttonZoomIn = document.createElement('button')
        buttonZoomIn.className = "btn btn-dark"

        const iconZoomIn = document.createElement('i')
        iconZoomIn.className = "fas fa-search-plus"
        buttonZoomIn.appendChild(iconZoomIn)

        buttonZoomIn.addEventListener("click", (e: Event) => { this.increaseZoom(lastRenderId); this.render() })

        const buttonZoomOut = document.createElement('button')
        buttonZoomOut.className = "btn btn-dark"

        const iconZoomOut = document.createElement('i')
        iconZoomOut.className = "fa fa-search-minus"
        buttonZoomOut.appendChild(iconZoomOut)

        buttonZoomOut.addEventListener("click", (e: Event) => { this.decreaseZoom(lastRenderId); this.render() })

        buttonGroup.appendChild(buttonZoomIn)
        buttonGroup.appendChild(buttonZoomOut)
        zoomContainer.appendChild(buttonGroup)

        return zoomContainer
    }

    createTranslateTools(lastRenderId: number) {
        const translateContainer = document.createElement('div')

        const buttonGroup = document.createElement('div')
        buttonGroup.className = "btn-group"

        const buttonUp = document.createElement('button')
        buttonUp.className = "btn btn-dark"
        buttonUp.innerHTML = "up"
        buttonUp.addEventListener("click", (e: Event) => { this.setPositionY(lastRenderId, -10); this.render() })

        const buttonLeft = document.createElement('button')
        buttonLeft.className = "btn btn-dark"
        buttonLeft.innerHTML = "left"
        buttonLeft.addEventListener("click", (e: Event) => { this.setPositionX(lastRenderId, -10); this.render() })

        const buttonDown = document.createElement('button')
        buttonDown.className = "btn btn-dark"
        buttonDown.innerHTML = "down"
        buttonDown.addEventListener("click", (e: Event) => { this.setPositionY(lastRenderId, 10); this.render() })

        const buttonRight = document.createElement('button')
        buttonRight.className = "btn btn-dark"
        buttonRight.innerHTML = "right"
        buttonRight.addEventListener("click", (e: Event) => { this.setPositionX(lastRenderId, 10); this.render() })

        buttonGroup.appendChild(buttonLeft)
        buttonGroup.appendChild(buttonUp)
        buttonGroup.appendChild(buttonDown)
        buttonGroup.appendChild(buttonRight)
        translateContainer.appendChild(buttonGroup)

        return translateContainer
    }

    createLayers() {
        const lastRender = document.querySelectorAll("[id=renders] > .col")
        const lastRenderId = lastRender.length - 1

        const layerContainer = document.createElement('div')
        layerContainer.className = "layers"

        const title = document.createElement('h3')
        title.innerText = "Layers"

        const groupContainer = document.createElement('div')
        groupContainer.className = "text-left"
        const group = document.createElement('h5')
        group.innerText = "Group 1"

        groupContainer.appendChild(this.createCheckbox("Group 1"))
        groupContainer.appendChild(this.createCheckbox("Rectangle 1"))
        groupContainer.appendChild(this.createCheckbox("Circle 1"))

        layerContainer.appendChild(title)
        layerContainer.appendChild(groupContainer)
        lastRender[lastRenderId].appendChild(layerContainer)
    }

    createCheckbox(labelText: string) {
        const checkbox = document.createElement('div')
        checkbox.className = "form-check"
        const input = document.createElement('input')
        input.className = "form-check-input"
        input.type = "checkbox"
        const label = document.createElement('label')
        label.className = "form-check-label"
        label.innerText = labelText

        checkbox.appendChild(input)
        checkbox.appendChild(label)

        return checkbox
    }
}