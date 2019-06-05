import { FileExporter, ConsolePrinter, TextFileExporter } from "./export";
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
        this.outputTypes.set(FileFormat.Txt, new TextFileExporter())
    }

    ExportFile(format: FileFormat, layers: Array<Layer>){
        let exporter = this.outputTypes.get(format)
        exporter.CreateFileHeader()
        exporter.CreateFileContent(layers)
        exporter.CreateFileFooter()
        return exporter.DownloadFile()
    }

}