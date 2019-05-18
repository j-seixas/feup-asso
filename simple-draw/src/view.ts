import { SimpleDrawDocument } from './document'
import { Render, SVGRender, CanvasRender } from './render';

export class View {
    renders = new Array<Render>()

    constructor(public doc: SimpleDrawDocument) {
        this.renders.push(new SVGRender())
    }

    addRender(render: Render) {
        this.renders.push(render)
        this.render()
    }

    createSVG() {
        return new SVGRender()
    }

    createCanvas() {
        return new CanvasRender()
    }

    render() {
        for (const render of this.renders) {
            this.doc.draw(render)
        }
    }
}