import { Layer, } from './layer'
import { Shape, Circle, Rectangle } from './shape';


export interface FileExporter {
    CreateFileHeader(): void
    CreateFileContent(layers: Array<Layer>): void
    CreateFileFooter(): void
    DownloadFile(): string
}


export class ConsolePrinter implements FileExporter {
    CreateFileHeader() {

    }

    CreateFileContent(layers: Array<Layer>) {
        for (const layer of layers) {
            console.log(layer.name)
            if (layer.visible) {
                for (const shape of layer.objects) {
                    if (shape instanceof Rectangle) {
                        console.log('Rectangle', shape.x, shape.y, shape.width, shape.height)
                    }
                    if (shape instanceof Circle) {
                        console.log('Circle', shape.x, shape.y, shape.radius)
                    }
                }
            }
        }
    }

    CreateFileFooter() {

    }

    DownloadFile() {
        return ''
    }
}


export class TextFileExporter implements FileExporter {
    textToReturn: string

    CreateFileHeader() {

    }

    CreateFileContent(layers: Array<Layer>) {
        for (const layer of layers) {
            this.textToReturn += layer.name + "\n"
            if (layer.visible) {
                for (const shape of layer.objects) {
                    if (shape instanceof Rectangle) {
                        this.textToReturn += 'Rectangle ' + shape.x + ' ' + shape.y + ' ' + shape.width + ' ' + shape.height + '\n'
                    }
                    if (shape instanceof Circle) {
                        this.textToReturn += 'Circle ' + ' ' + shape.x + ' ' + shape.y + ' ' + shape.radius + "\n"
                    }
                }
            }
        }
    }

    CreateFileFooter() {

    }

    DownloadFile()
    {
        return this.textToReturn
    }

    
}