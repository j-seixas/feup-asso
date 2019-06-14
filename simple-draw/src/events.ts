import { SimpleDrawDocument } from './document'
import { ViewController, SVGFactory, CanvasFactory } from './view'
import { FileExporter, ConsolePrinter } from './export';
import { ExportFactory, FileFormat } from './exportFactory';
import { saveAs } from 'file-saver';
import { RenderStyle } from './render';
import { Repl } from './repl';

export class EventListener {
    doc: SimpleDrawDocument
    view: ViewController
    fileExporter: ExportFactory
    interpreter: Repl
    export: FileExporter
    undoButton: HTMLElement
    redoButton: HTMLElement
    rectangleButton: HTMLElement
    circleButton: HTMLElement
    canvasButton: HTMLElement
    svgButton: HTMLElement
    exportXmlButton: HTMLElement
    exportTextButton: HTMLElement
    changeStyleButton: HTMLElement
    commandInput: HTMLElement;


    constructor(doc: SimpleDrawDocument, view: ViewController, fileExporter: ExportFactory) {
        this.doc = doc
        this.view = view
        this.fileExporter = fileExporter
        this.interpreter = new Repl(doc);

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
            let stringToReturn = fileExporter.ExportFile(FileFormat.Txt, this.doc.layers)
            this.DownloadFile(stringToReturn,FileFormat.Txt)    
        })

        this.exportXmlButton = <HTMLElement>document.getElementById('export-xml')
        this.exportXmlButton.addEventListener("click", (e: Event) => {
            let stringToReturn = fileExporter.ExportFile(FileFormat.Xml, this.doc.layers)
            this.DownloadFile(stringToReturn,FileFormat.Xml)  
        })

        this.changeStyleButton = <HTMLElement>document.getElementById('change-style')
        this.changeStyleButton.addEventListener("click", (e: Event) => {
            this.view.changeState()
            if(this.view.styler.style=== RenderStyle.Backgrounded){
                this.changeStyleButton.style.backgroundColor = 'red'
            }
            else if(this.view.styler.style=== RenderStyle.Normal){
                this.changeStyleButton.style.backgroundColor = ''
            }
            
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

        this.commandInput = <HTMLElement>document.getElementById('commandForm');
        this.commandInput.addEventListener("submit", (e: Event) => { e.preventDefault(); this.runCommand()})
    }

    runCommand(): void {
        let input : HTMLInputElement = <HTMLInputElement>document.getElementById('commandLine');
        (<HTMLInputElement>document.getElementById('errorMessage')).hidden = this.interpreter.intepretCommand(input.value);
        input.value = "";
        this.view.setLayers()
        this.view.render();
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

    DownloadFile(text: string, format: FileFormat) {
        var file;
        var fileName =  "simpleDraw." + FileFormat[format]

        if(format === FileFormat.Txt){
            file = new File([text], fileName, {type: "text/plain;charset=utf-8"});
        }
        else if(format === FileFormat.Xml){
            file = new File([text], fileName, {type: "text/xml;charset=utf-8"});
        }
        saveAs(file);
    }
}