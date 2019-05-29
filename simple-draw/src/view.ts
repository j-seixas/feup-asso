import { SimpleDrawDocument } from './document'
import { Shape } from './shape'
import { Layer } from './layer'
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
        this.setLayers()
        this.createViewportTools()
    }

    addRender(factory: RenderFactory): void {
        this.renders.push(factory.createRender())
        this.createViewportTools()
        this.render()
    }

    increaseZoom(idRender: number): void {
        this.renders[idRender].increaseZoom()
    }

    decreaseZoom(idRender: number): void {
        this.renders[idRender].decreaseZoom()
    }

    setPositionX(idRender: number, n: number): void {
        this.renders[idRender].setX(n)
    }

    setPositionY(idRender: number, n: number): void {
        this.renders[idRender].setY(n)
    }

    render(): void {
        for (const render of this.renders) {
            this.doc.draw(render)
        }
    }

    createViewportTools(): void {
        const lastRender = document.querySelectorAll("[id=renders] > .render")
        const lastRenderId = lastRender.length - 1

        const buttonContainer = document.createElement('div')
        buttonContainer.className = "viewport-tools"

        buttonContainer.appendChild(this.createZoomTools(lastRenderId))
        buttonContainer.appendChild(this.createTranslateTools(lastRenderId))

        lastRender[lastRenderId].appendChild(buttonContainer)
    }

    createZoomTools(lastRenderId: number): Element {
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

    createTranslateTools(lastRenderId: number): Element {
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

    setLayers(): void {
        const layerContainer = document.getElementById('layer-container')
        layerContainer.innerHTML = ""
        for (let i = 0; i < this.doc.layers.length; i++) {
            layerContainer.appendChild(this.createLayer(this.doc.layers[i], i + 1))
        }
    }

    createLayer(layer: Layer, id: number): Element {
        const div = document.createElement('div')
        div.appendChild(this.createCheckbox(layer, id))
        layer.objects.forEach(object => div.appendChild(this.createCheckbox(object)))
        return div
    }

    createCheckbox(shape: Shape, id?: number): Element {
        const checkbox = document.createElement('div')
        const input = document.createElement('input')
        input.className = "form-check-input"
        input.type = "checkbox"
        input.checked = true
        input.addEventListener("change", (e: Event) => {
            if (input.checked)
                shape.visible = true
            else shape.visible = false
            this.render()
        })

        const label = document.createElement('label')
        label.className = "form-check-label"

        if (shape.constructor.name === "Layer") {
            checkbox.className = "form-check heading"
            label.innerText = "Layer " + id
        } else {
            checkbox.className = "form-check"
            label.innerText = shape.constructor.name
        }

        checkbox.appendChild(input)
        checkbox.appendChild(label)

        return checkbox
    }
}