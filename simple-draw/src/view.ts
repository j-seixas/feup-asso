import { SimpleDrawDocument } from './document'
import { Render, SVGRender, CanvasRender } from './render';

export class ViewsController {
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

    increaseZoom(idRender: number){
        this.renders[idRender].increaseZoom()
    }

    decreaseZoom(idRender: number){
        this.renders[idRender].decreaseZoom()
    }

    setPositionX(idRender: number, n: number){
        this.renders[idRender].setX(n)
    }

    setPositionY(idRender: number, n: number){
        this.renders[idRender].setY(n)
    }

    render() {
        for (const render of this.renders) {
            this.doc.draw(render)
        }
    }
}