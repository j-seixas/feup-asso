import { SimpleDrawDocument } from 'document';
import { Render } from 'render';
import { Selection } from './selection';

export abstract class Tool {
    constructor(protected render: Render, protected doc: SimpleDrawDocument) { }
    abstract createTool(lastRenderId: number): Element;
}

export class Zoom extends Tool {

    increaseZoom(): void {
        Selection.getInstance();
        this.render.increaseZoom()
    }

    decreaseZoom(): void {
        this.render.decreaseZoom()
    }

    createTool(): Element {
        const zoomContainer = document.createElement('div')

        const buttonGroup = document.createElement('div')
        buttonGroup.className = "btn-group"

        const buttonZoomIn = document.createElement('button')
        buttonZoomIn.className = "btn btn-dark"

        const iconZoomIn = document.createElement('i')
        iconZoomIn.className = "fas fa-search-plus"
        buttonZoomIn.appendChild(iconZoomIn)

        buttonZoomIn.addEventListener("click", (e: Event) => { this.increaseZoom(); this.doc.draw(this.render) })

        const buttonZoomOut = document.createElement('button')
        buttonZoomOut.className = "btn btn-dark"

        const iconZoomOut = document.createElement('i')
        iconZoomOut.className = "fa fa-search-minus"
        buttonZoomOut.appendChild(iconZoomOut)

        buttonZoomOut.addEventListener("click", (e: Event) => { this.decreaseZoom(); this.doc.draw(this.render) })

        buttonGroup.appendChild(buttonZoomIn)
        buttonGroup.appendChild(buttonZoomOut)
        zoomContainer.appendChild(buttonGroup)

        return zoomContainer
    }
}

export class Translate extends Tool {

    setPositionX(n: number): void {
        this.render.setX(n)
    }

    setPositionY(n: number): void {
        this.render.setY(n)
    }

    createTool(): Element {
        const translateContainer = document.createElement('div')

        const buttonGroup = document.createElement('div')
        buttonGroup.className = "btn-group"

        const buttonUp = document.createElement('button')
        buttonUp.className = "btn btn-dark"
        buttonUp.innerHTML = "up"
        buttonUp.addEventListener("click", (e: Event) => { this.setPositionY(-10); this.doc.draw(this.render) })

        const buttonLeft = document.createElement('button')
        buttonLeft.className = "btn btn-dark"
        buttonLeft.innerHTML = "left"
        buttonLeft.addEventListener("click", (e: Event) => { this.setPositionX(-10); this.doc.draw(this.render) })

        const buttonDown = document.createElement('button')
        buttonDown.className = "btn btn-dark"
        buttonDown.innerHTML = "down"
        buttonDown.addEventListener("click", (e: Event) => { this.setPositionY(10); this.doc.draw(this.render) })

        const buttonRight = document.createElement('button')
        buttonRight.className = "btn btn-dark"
        buttonRight.innerHTML = "right"
        buttonRight.addEventListener("click", (e: Event) => { this.setPositionX(10); this.doc.draw(this.render) })

        buttonGroup.appendChild(buttonLeft)
        buttonGroup.appendChild(buttonUp)
        buttonGroup.appendChild(buttonDown)
        buttonGroup.appendChild(buttonRight)
        translateContainer.appendChild(buttonGroup)

        return translateContainer
    }
}

export class Style extends Tool {

    createTool(): Element {
        var options = ["Default", "Wireframe", "Color"]

        const select = document.createElement('select')
        select.className = "viewport-style"

        for (var i = 0; i < options.length; i++) {
            var option = document.createElement("option");
            option.value = options[i];
            option.text = options[i];
            select.appendChild(option);
        }

        return select
    }
}