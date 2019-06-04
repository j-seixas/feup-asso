import { Layer } from './layer';
import { Shape, Rectangle, Circle } from './shape';
import { SimpleDrawDocument } from './document'
import { ViewController } from 'view';

export class Selection {
    private static instance: Selection
    selectedObjects = Array<Shape>()

    private view: ViewController
    private x: number
    private y: number
    private width: number
    private height: number
    private layers: Array<Layer>

    private constructor() {

    }

    static getInstance(): Selection {
        if (!Selection.instance)
            Selection.instance = new Selection()
        return Selection.instance
    }

    newSelection(x1: number, y1: number, x2: number, y2: number) {
        this.clearSelection()

        this.x = x1 > x2 ? x2 : x1
        this.y = y1 > y2 ? y2 : y1
        this.width = Math.abs(x1 - x2)
        this.height = Math.abs(y1 - y2)

        console.log('selection', this.x, this.y, this.width, this.height)

        if (!this.view)
            return

        for (const layer of this.layers) {
            if (layer.visible) {
                for (const shape of layer.objects) {
                    if (this.isInside(shape)) {
                        this.selectedObjects.push(shape)
                        shape.selected = true;
                    }
                }
            }
        }
        this.view.render()
    }

    clearSelection(): void {
        for (const shape of this.selectedObjects) {
            shape.selected = false
            console.log('is now false')
        }

        this.selectedObjects = new Array<Shape>()
    }

    isInside(shape: Shape): boolean {
        if (shape instanceof Rectangle && shape.visible) {
            return !(this.x + this.width < shape.x ||
                this.x > shape.x + shape.width ||
                this.y + this.height < shape.y ||
                this.y > shape.y + shape.height)

        } else if (shape instanceof Circle && shape.visible) {
            const distX = Math.abs(shape.x - this.x)
            const distY = Math.abs(shape.y - this.y)

            if (distX > (this.width / 2 + shape.radius) ||
                distY > (this.height / 2 + shape.radius))
                return false;

            if (distX <= this.width / 2 ||
                distY <= this.height / 2)
                return true;

            return Math.pow(distX - this.width / 2, 2) + Math.pow(distY - this.height / 2, 2)
                <= Math.pow(shape.radius, 2)
        }

        return false;
    }

    setView(view: ViewController) {
        this.view = view
        this.layers = this.view.doc.layers
    }

}