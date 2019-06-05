import { Layer, } from './layer'
import { Shape, Circle, Rectangle} from './shape';

export interface FileExporter{
    CreateFileHeader(): void
    CreateFileContent(layers: Array<Layer>): void
    CreateFileFooter(): void
}


export class ConsolePrinter implements FileExporter{
    CreateFileHeader() {

    }

    CreateFileContent(layers: Array<Layer>){
        console.log("inside console printer class")
        for (const layer of layers) {
            console.log(layer.name)
            if (layer.visible) {
                for (const shape of layer.objects) {
                    if(shape instanceof Rectangle){
                        console.log('Rectangle', shape.x, shape.y, shape.width, shape.height)
                    }
                    if(shape instanceof Circle){
                        console.log('Circle', shape.x, shape.y, shape.radius)
                    }
                }
            }
        }
    }

    CreateFileFooter(){

    }
}

