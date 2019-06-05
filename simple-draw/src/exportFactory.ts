import { FileExporter, ConsolePrinter } from "./export";
import { Layer } from "./layer";


export enum FileFormat{
    Console,
    Txt,
    Xml
}


export class ExportFactory {
    outputTypes= new Map<FileFormat, FileExporter>();

    constructor() {
        this.outputTypes.set(FileFormat.Console, new ConsolePrinter())
    }

    ExportFile(format: FileFormat, layers: Array<Layer>){
        console.log('inside factory')
        let exporter = this.outputTypes.get(format)
        exporter.CreateFileHeader()
        exporter.CreateFileContent(layers)
        exporter.CreateFileFooter()
    }

}