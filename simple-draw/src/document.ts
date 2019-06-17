import { Shape } from './shape'
import { Layer } from './layer'
import { Action, CreateCircleAction, CreateRectangleAction, TranslateAction } from './actions'
import { Render } from './render';
import { UndoManager } from "./undo";
import { Observable } from './view';

export class SimpleDrawDocument extends Observable {
    undoManager = new UndoManager()
    layers = new Array<Layer>()

    constructor(numLayers: number) {
        super();
        for (let i = 0; i < numLayers; i++) {
            this.layers.push(new Layer("Layer " + i, 10, 10))
        }
    }

    undo(): void {
        this.undoManager.undo()
    }

    redo(): void {
        this.undoManager.redo()
    }

    draw(render: Render): void {
        render.draw(...this.layers)
    }

    do<T>(a: Action<T>): T {
        this.undoManager.onActionDone(a)
        let ret : T = a.do();
        this.notify();
        return ret
    }

    createRectangle(x: number, y: number, width: number, height: number, layer: number): Shape {
        return this.do(new CreateRectangleAction(this.layers[layer - 1], x, y, width, height))
        this.notify();
    }

    createCircle(x: number, y: number, radius: number, layer: number): Shape {
        return this.do(new CreateCircleAction(this.layers[layer - 1], x, y, radius))
    }

    translate(s: Shape, xd: number, yd: number): void {
        return this.do(new TranslateAction(s, xd, yd))
    }
}