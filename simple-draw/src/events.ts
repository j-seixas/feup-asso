import { SimpleDrawDocument } from './document'
import { ViewController, SVGFactory, CanvasFactory } from './view'
import { FileExporter, ConsolePrinter } from './export';

export class EventListener {
    doc: SimpleDrawDocument
    view: ViewController
    export: FileExporter
    undoButton: HTMLElement
    redoButton: HTMLElement
    rectangleButton: HTMLElement
    circleButton: HTMLElement
    canvasButton: HTMLElement
    svgButton: HTMLElement
    exportXmlButton: HTMLElement
    exportTextButton: HTMLElement

    constructor(doc: SimpleDrawDocument, view: ViewController) {
        this.doc = doc
        this.view = view


        this.undoButton = <HTMLElement>document.getElementById('undo')
        this.undoButton.addEventListener("click", (e: Event) => {
            this.doc.undo()
            this.view.setLayers()
            this.view.render()
        })

        this.redoButton = <HTMLElement>document.getElementById('redo')
        this.redoButton.addEventListener("click", (e: Event) => {
            this.doc.redo()
            this.view.setLayers()
            this.view.render()
        })

        this.exportTextButton = <HTMLElement>document.getElementById('export-text')
        this.exportTextButton.addEventListener("click", (e: Event) => {
            this.export = new ConsolePrinter()
            this.export.CreateFileHeader()
            this.export.CreateFileContent(this.doc.layers)
            this.export.CreateFileFooter()
        })

        this.exportXmlButton = <HTMLElement>document.getElementById('export-xml')
        this.exportXmlButton.addEventListener("click", (e: Event) => {
            console.debug("i'm handling xml")     
        })

        this.rectangleButton = <HTMLElement>document.getElementById('create-rectangle')
        this.rectangleButton.addEventListener("click", (e: Event) => this.createRectangle())

        this.circleButton = <HTMLElement>document.getElementById('create-circle')
        this.circleButton.addEventListener("click", (e: Event) => this.createCircle())

        this.canvasButton = <HTMLElement>document.getElementById('create-canvas')
        this.canvasButton.addEventListener("click", (e: Event) => {
            this.view.addRender(new CanvasFactory())
        })

        this.svgButton = <HTMLElement>document.getElementById('create-svg')
        this.svgButton.addEventListener("click", (e: Event) => {
            this.view.addRender(new SVGFactory())
        })
    }

    createRectangle(): void {
        var xPosition = parseInt((<HTMLInputElement>document.getElementById('input-rect-x')).value)
        var yPosition = parseInt((<HTMLInputElement>document.getElementById('input-rect-y')).value)
        var heigth = parseInt((<HTMLInputElement>document.getElementById('input-rect-h')).value)
        var width = parseInt((<HTMLInputElement>document.getElementById('input-rect-w')).value)
        var layer = parseInt((<HTMLInputElement>document.getElementById('input-rect-layer')).value)

        this.doc.createRectangle(xPosition, yPosition, Math.abs(width), Math.abs(heigth), layer)
        this.view.setLayers()
        this.view.render()
    }

    createCircle(): void {
        var xPosition = parseInt((<HTMLInputElement>document.getElementById('input-circle-x')).value)
        var yPosition = parseInt((<HTMLInputElement>document.getElementById('input-circle-y')).value)
        var radius = parseInt((<HTMLInputElement>document.getElementById('input-circle-r')).value)
        var layer = parseInt((<HTMLInputElement>document.getElementById('input-circle-layer')).value)

        this.doc.createCircle(xPosition, yPosition, Math.abs(radius), layer)
        this.view.setLayers()
        this.view.render()
    }
}