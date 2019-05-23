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

    constructor(public doc: SimpleDrawDocument, public factory: RenderFactory) {
        this.renders.push(factory.createRender())
    }

    addRender(factory: RenderFactory) {
        this.renders.push(factory.createRender())
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
}