import { SimpleDrawDocument } from './document'
import { Shape } from './shape'
import { Layer } from './layer'
import { Render, SVGRender, CanvasRender, RenderStyle, RenderStyler } from './render'
import { Selection } from './selection'
import { Zoom, Translate } from './tools'

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
    styler = RenderStyler

    constructor(public doc: SimpleDrawDocument, factory: RenderFactory) {
        this.styler.style = RenderStyle.Normal
        this.renders.push(factory.createRender())
        this.setLayers()
        this.createViewportTools()
        Selection.getInstance().setView(this);
    }

    changeState(){
        this.styler.changeStyle()
    }

    addRender(factory: RenderFactory): void {
        this.renders.push(factory.createRender())
        this.createViewportTools()
        this.render()
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

        buttonContainer.appendChild(new Zoom(this.renders[lastRenderId], this.doc).createTool());
        buttonContainer.appendChild(new Translate(this.renders[lastRenderId], this.doc).createTool());

        lastRender[lastRenderId].appendChild(buttonContainer)
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