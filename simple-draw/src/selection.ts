import { Layer } from './layer';
import { Shape, Rectangle, Circle } from './shape';
import { throws } from 'assert';

export class Selection {
    private static instance: Selection
    selectedObjects: Array<Shape>

    private x: number
    private y: number
    private width: number
    private height: number

    private constructor() {

    }

    static getInstance(): Selection {
        if(!Selection.instance)
            Selection.instance = new Selection()
        return Selection.instance
    }

    newSelection(x: number, y: number, width: number, height: number, layers: Array<Layer>) {
        this.clearSelection()
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        for (const layer of layers) {
            if (layer.visible) {
                for (const shape of layer.objects) {
                    if (this.isInside(shape))
                        shape.selected = true;
                }
            }
        }
    }

    clearSelection(): void {
        for(const shape of this.selectedObjects)
            shape.selected = false
        
        this.selectedObjects = new Array<Shape>()
    }

    isInside(shape: Shape): boolean {
        if (shape instanceof Rectangle && shape.visible) {
            return !(this.x + this.width < shape.x &&
                this.x > shape.x + shape.width &&
                this.y + this.height < shape.y &&
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



}