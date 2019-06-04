(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
class CreateShapeAction {
    constructor(layer, shape) {
        this.layer = layer;
        this.shape = shape;
    }
    do() {
        this.layer.add(this.shape);
        return this.shape;
    }
    undo() {
        this.layer.objects = this.layer.objects.filter(obj => obj !== this.shape);
    }
}
class CreateCircleAction extends CreateShapeAction {
    constructor(layer, x, y, radius) {
        super(layer, new shape_1.Circle(x, y, radius));
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}
exports.CreateCircleAction = CreateCircleAction;
class CreateRectangleAction extends CreateShapeAction {
    constructor(layer, x, y, width, height) {
        super(layer, new shape_1.Rectangle(x, y, width, height));
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}
exports.CreateRectangleAction = CreateRectangleAction;
class TranslateAction {
    constructor(layer, shape, xd, yd) {
        this.layer = layer;
        this.shape = shape;
        this.xd = xd;
        this.yd = yd;
    }
    do() {
        this.oldX = this.shape.x;
        this.oldY = this.shape.y;
        this.shape.translate(this.xd, this.yd);
    }
    undo() {
        this.shape.x = this.oldX;
        this.shape.y = this.oldY;
        // this.shape.translate(-this.xd, -this.yd)
    }
}
exports.TranslateAction = TranslateAction;

},{"./shape":8}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = require("./layer");
const actions_1 = require("./actions");
const undo_1 = require("./undo");
class SimpleDrawDocument {
    constructor(numLayers) {
        this.undoManager = new undo_1.UndoManager();
        this.layers = new Array();
        for (let i = 0; i < numLayers; i++) {
            this.layers.push(new layer_1.Layer("Layer " + i, 10, 10));
        }
    }
    undo() {
        this.undoManager.undo();
    }
    redo() {
        this.undoManager.redo();
    }
    draw(render) {
        render.draw(...this.layers);
    }
    do(a) {
        this.undoManager.onActionDone(a);
        return a.do();
    }
    createRectangle(x, y, width, height, layer) {
        return this.do(new actions_1.CreateRectangleAction(this.layers[layer - 1], x, y, width, height));
    }
    createCircle(x, y, radius, layer) {
        return this.do(new actions_1.CreateCircleAction(this.layers[layer - 1], x, y, radius));
    }
}
exports.SimpleDrawDocument = SimpleDrawDocument;

},{"./actions":1,"./layer":4,"./undo":9}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
class EventListener {
    constructor(doc, view) {
        this.doc = doc;
        this.view = view;
        this.undoButton = document.getElementById('undo');
        this.undoButton.addEventListener("click", (e) => {
            this.doc.undo();
            this.view.setLayers();
            this.view.render();
        });
        this.redoButton = document.getElementById('redo');
        this.redoButton.addEventListener("click", (e) => {
            this.doc.redo();
            this.view.setLayers();
            this.view.render();
        });
        this.rectangleButton = document.getElementById('create-rectangle');
        this.rectangleButton.addEventListener("click", (e) => this.createRectangle());
        this.circleButton = document.getElementById('create-circle');
        this.circleButton.addEventListener("click", (e) => this.createCircle());
        this.canvasButton = document.getElementById('create-canvas');
        this.canvasButton.addEventListener("click", (e) => {
            this.view.addRender(new view_1.CanvasFactory());
        });
        this.svgButton = document.getElementById('create-svg');
        this.svgButton.addEventListener("click", (e) => {
            this.view.addRender(new view_1.SVGFactory());
        });
    }
    createRectangle() {
        var xPosition = parseInt(document.getElementById('input-rect-x').value);
        var yPosition = parseInt(document.getElementById('input-rect-y').value);
        var heigth = parseInt(document.getElementById('input-rect-h').value);
        var width = parseInt(document.getElementById('input-rect-w').value);
        var layer = parseInt(document.getElementById('input-rect-layer').value);
        this.doc.createRectangle(xPosition, yPosition, Math.abs(width), Math.abs(heigth), layer);
        this.view.setLayers();
        this.view.render();
    }
    createCircle() {
        var xPosition = parseInt(document.getElementById('input-circle-x').value);
        var yPosition = parseInt(document.getElementById('input-circle-y').value);
        var radius = parseInt(document.getElementById('input-circle-r').value);
        var layer = parseInt(document.getElementById('input-circle-layer').value);
        this.doc.createCircle(xPosition, yPosition, Math.abs(radius), layer);
        this.view.setLayers();
        this.view.render();
    }
}
exports.EventListener = EventListener;

},{"./view":10}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
class Layer extends shape_1.Shape {
    constructor(name, x, y) {
        super(x, y);
        this.name = name;
        this.x = x;
        this.y = y;
        this.objects = new Array();
    }
    add(shape) {
        this.objects.push(shape);
    }
}
exports.Layer = Layer;

},{"./shape":8}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
const selection_1 = require("./selection");
class SVGRender {
    constructor() {
        this.zoom = 1;
        this.positionX = 0;
        this.positionY = 0;
        var container = document.getElementById('renders');
        const col = document.createElement('div');
        col.className = "col render d-flex flex-column-reverse align-items-center";
        container.appendChild(col);
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute('style', 'border: 1px solid blue');
        this.svg.setAttribute('width', '550');
        this.svg.setAttribute('height', '550');
        this.svg.addEventListener('mousedown', (e) => {
            const svgElem = e.currentTarget;
            var pt = svgElem.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            var svgP = pt.matrixTransform(svgElem.getScreenCTM().inverse());
            this.selectionStartX = svgP.x / this.zoom - this.positionX;
            this.selectionStartY = svgP.y / this.zoom - this.positionY;
        });
        this.svg.addEventListener('mouseup', (e) => {
            const svgElem = e.currentTarget;
            var pt = svgElem.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            var svgP = pt.matrixTransform(svgElem.getScreenCTM().inverse());
            this.selectionEndX = svgP.x / this.zoom - this.positionX;
            this.selectionEndY = svgP.y / this.zoom - this.positionY;
            selection_1.Selection.getInstance().newSelection(this.selectionStartX, this.selectionStartY, this.selectionEndX, this.selectionEndY);
        });
        col.appendChild(this.svg);
    }
    mouseDown(e) {
    }
    increaseZoom() {
        this.zoom *= 2;
    }
    decreaseZoom() {
        this.zoom /= 2;
    }
    setX(x) {
        this.positionX += x;
    }
    setY(y) {
        this.positionY += y;
    }
    draw(...layers) {
        this.svg.innerHTML = "";
        for (const layer of layers) {
            if (layer.visible)
                for (const shape of layer.objects) {
                    if (shape instanceof shape_1.Rectangle && shape.visible) {
                        const e = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        e.setAttribute('style', shape.selected ? 'stroke: blue; fill: white; fill-opacity: 0.75' : 'stroke: black; fill: tomato');
                        const x = (shape.x + this.positionX) * this.zoom;
                        e.setAttribute('x', x.toString());
                        const y = (shape.y + this.positionY) * this.zoom;
                        e.setAttribute('y', y.toString());
                        const w = shape.width * this.zoom;
                        e.setAttribute('width', w.toString());
                        const h = shape.height * this.zoom;
                        e.setAttribute('height', h.toString());
                        this.svg.appendChild(e);
                    }
                    else if (shape instanceof shape_1.Circle && shape.visible) {
                        const e = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        e.setAttribute('style', shape.selected ? 'stroke: blue; fill: white; fill-opacity: 0.75' : 'stroke: black; fill: orange');
                        const x = (shape.x + this.positionX) * this.zoom;
                        e.setAttribute('cx', x.toString());
                        const y = (shape.y + this.positionY) * this.zoom;
                        e.setAttribute('cy', y.toString());
                        const r = shape.radius * this.zoom;
                        e.setAttribute('r', r.toString());
                        this.svg.appendChild(e);
                    }
                }
        }
    }
}
exports.SVGRender = SVGRender;
class CanvasRender {
    constructor() {
        this.zoom = 1;
        this.positionX = 0;
        this.positionY = 0;
        var container = document.getElementById('renders');
        const col = document.createElement('div');
        col.className = "col render d-flex flex-column-reverse align-items-center";
        container.appendChild(col);
        const canvas = document.createElement('canvas');
        canvas.setAttribute('style', 'border: 1px solid red');
        canvas.setAttribute('width', '550');
        canvas.setAttribute('height', '550');
        canvas.addEventListener('mousedown', (e) => {
            const canvasElem = e.currentTarget;
            const rect = canvasElem.getBoundingClientRect();
            this.selectionStartX = (e.clientX - rect.left) / this.zoom - this.positionX;
            this.selectionStartY = (e.clientY - rect.top) / this.zoom - this.positionY;
        });
        canvas.addEventListener('mouseup', (e) => {
            const canvasElem = e.currentTarget;
            const rect = canvasElem.getBoundingClientRect();
            this.selectionEndX = (e.clientX - rect.left) / this.zoom - this.positionX;
            this.selectionEndY = (e.clientY - rect.top) / this.zoom - this.positionY;
            selection_1.Selection.getInstance().newSelection(this.selectionStartX, this.selectionStartY, this.selectionEndX, this.selectionEndY);
        });
        col.appendChild(canvas);
        this.ctx = canvas.getContext('2d');
    }
    increaseZoom() {
        this.zoom *= 2;
    }
    decreaseZoom() {
        this.zoom /= 2;
    }
    setX(x) {
        this.positionX += x;
    }
    setY(y) {
        this.positionY += y;
    }
    draw(...layers) {
        this.ctx.clearRect(0, 0, 550, 550);
        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);
        for (const layer of layers) {
            if (layer.visible)
                for (const shape of layer.objects) {
                    if (shape instanceof shape_1.Circle && shape.visible) {
                        this.ctx.beginPath();
                        this.ctx.arc(shape.x + this.positionX, shape.y + this.positionY, shape.radius, 0, 2 * Math.PI);
                        this.ctx.fillStyle = shape.selected ? "rgba(255, 255, 255, 0.75)" : "orange";
                        this.ctx.fill();
                        this.ctx.strokeStyle = shape.selected ? "blue" : "black";
                        this.ctx.stroke();
                        this.ctx.closePath();
                    }
                    else if (shape instanceof shape_1.Rectangle && shape.visible) {
                        this.ctx.fillStyle = shape.selected ? "rgba(255, 255, 255, 0.75)" : "tomato";
                        this.ctx.fillRect(shape.x + this.positionX, shape.y + this.positionY, shape.width, shape.height);
                        this.ctx.strokeStyle = shape.selected ? "blue" : "black";
                        this.ctx.strokeRect(shape.x + this.positionX, shape.y + this.positionY, shape.width, shape.height);
                    }
                }
        }
        this.ctx.restore();
    }
}
exports.CanvasRender = CanvasRender;

},{"./selection":7,"./shape":8}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_1 = require("./document");
const view_1 = require("./view");
const events_1 = require("./events");
const doc = new document_1.SimpleDrawDocument(4);
const c1 = doc.createCircle(100, 50, 30, 2);
const r1 = doc.createRectangle(10, 10, 80, 80, 2);
const r2 = doc.createRectangle(30, 60, 80, 40, 3);
const view = new view_1.ViewController(doc, new view_1.SVGFactory());
const eventListener = new events_1.EventListener(doc, view);
/* const s1 = sdd.createSelection(c1, r1, r2)
sdd.translate(s1, 10, 10) */
view.render();

},{"./document":2,"./events":3,"./view":10}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
class Selection {
    constructor() {
        this.selectedObjects = Array();
    }
    static getInstance() {
        if (!Selection.instance)
            Selection.instance = new Selection();
        return Selection.instance;
    }
    newSelection(x1, y1, x2, y2) {
        this.clearSelection();
        this.x = x1 > x2 ? x2 : x1;
        this.y = y1 > y2 ? y2 : y1;
        this.width = Math.abs(x1 - x2);
        this.height = Math.abs(y1 - y2);
        if (!this.view)
            return;
        for (const layer of this.layers) {
            if (layer.visible) {
                for (const shape of layer.objects) {
                    if (this.isInside(shape)) {
                        this.selectedObjects.push(shape);
                        shape.selected = true;
                    }
                }
            }
        }
        this.view.render();
    }
    clearSelection() {
        for (const shape of this.selectedObjects)
            shape.selected = false;
        this.selectedObjects = new Array();
    }
    isInside(shape) {
        if (shape instanceof shape_1.Rectangle && shape.visible) {
            return !(this.x + this.width < shape.x ||
                this.x > shape.x + shape.width ||
                this.y + this.height < shape.y ||
                this.y > shape.y + shape.height);
        }
        else if (shape instanceof shape_1.Circle && shape.visible) {
            const distX = Math.abs(shape.x - this.x);
            const distY = Math.abs(shape.y - this.y);
            if (distX > (this.width / 2 + shape.radius) ||
                distY > (this.height / 2 + shape.radius))
                return false;
            if (distX <= this.width / 2 ||
                distY <= this.height / 2)
                return true;
            return Math.pow(distX - this.width / 2, 2) + Math.pow(distY - this.height / 2, 2)
                <= Math.pow(shape.radius, 2);
        }
        return false;
    }
    setView(view) {
        this.view = view;
        this.layers = this.view.doc.layers;
    }
}
exports.Selection = Selection;

},{"./shape":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Shape {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.visible = true;
        this.selected = false;
    }
    translate(xd, yd) {
        this.x += xd;
        this.y += yd;
    }
}
exports.Shape = Shape;
class Rectangle extends Shape {
    constructor(x, y, width, height) {
        super(x, y);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}
exports.Rectangle = Rectangle;
class Circle extends Shape {
    constructor(x, y, radius) {
        super(x, y);
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}
exports.Circle = Circle;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UndoManager {
    constructor() {
        this.doStack = new Array();
        this.undoStack = new Array();
    }
    undo() {
        if (this.doStack.length > 0) {
            const a1 = this.doStack.pop();
            a1.undo();
            this.undoStack.push(a1);
        }
    }
    redo() {
        if (this.undoStack.length > 0) {
            const a1 = this.undoStack.pop();
            a1.do();
            this.doStack.push(a1);
        }
    }
    onActionDone(a) {
        this.doStack.push(a);
        this.undoStack.length = 0;
    }
}
exports.UndoManager = UndoManager;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const render_1 = require("./render");
const selection_1 = require("./selection");
class SVGFactory {
    createRender() {
        return new render_1.SVGRender();
    }
}
exports.SVGFactory = SVGFactory;
class CanvasFactory {
    createRender() {
        return new render_1.CanvasRender();
    }
}
exports.CanvasFactory = CanvasFactory;
class ViewController {
    constructor(doc, factory) {
        this.doc = doc;
        this.renders = new Array();
        this.renders.push(factory.createRender());
        this.setLayers();
        this.createViewportTools();
        selection_1.Selection.getInstance().setView(this);
    }
    addRender(factory) {
        this.renders.push(factory.createRender());
        this.createViewportTools();
        this.render();
    }
    increaseZoom(idRender) {
        this.renders[idRender].increaseZoom();
    }
    decreaseZoom(idRender) {
        this.renders[idRender].decreaseZoom();
    }
    setPositionX(idRender, n) {
        this.renders[idRender].setX(n);
    }
    setPositionY(idRender, n) {
        this.renders[idRender].setY(n);
    }
    render() {
        for (const render of this.renders) {
            this.doc.draw(render);
        }
    }
    createViewportTools() {
        const lastRender = document.querySelectorAll("[id=renders] > .render");
        const lastRenderId = lastRender.length - 1;
        const buttonContainer = document.createElement('div');
        buttonContainer.className = "viewport-tools";
        buttonContainer.appendChild(this.createZoomTools(lastRenderId));
        buttonContainer.appendChild(this.createTranslateTools(lastRenderId));
        lastRender[lastRenderId].appendChild(buttonContainer);
    }
    createZoomTools(lastRenderId) {
        const zoomContainer = document.createElement('div');
        const buttonGroup = document.createElement('div');
        buttonGroup.className = "btn-group";
        const buttonZoomIn = document.createElement('button');
        buttonZoomIn.className = "btn btn-dark";
        const iconZoomIn = document.createElement('i');
        iconZoomIn.className = "fas fa-search-plus";
        buttonZoomIn.appendChild(iconZoomIn);
        buttonZoomIn.addEventListener("click", (e) => { this.increaseZoom(lastRenderId); this.render(); });
        const buttonZoomOut = document.createElement('button');
        buttonZoomOut.className = "btn btn-dark";
        const iconZoomOut = document.createElement('i');
        iconZoomOut.className = "fa fa-search-minus";
        buttonZoomOut.appendChild(iconZoomOut);
        buttonZoomOut.addEventListener("click", (e) => { this.decreaseZoom(lastRenderId); this.render(); });
        buttonGroup.appendChild(buttonZoomIn);
        buttonGroup.appendChild(buttonZoomOut);
        zoomContainer.appendChild(buttonGroup);
        return zoomContainer;
    }
    createTranslateTools(lastRenderId) {
        const translateContainer = document.createElement('div');
        const buttonGroup = document.createElement('div');
        buttonGroup.className = "btn-group";
        const buttonUp = document.createElement('button');
        buttonUp.className = "btn btn-dark";
        buttonUp.innerHTML = "up";
        buttonUp.addEventListener("click", (e) => { this.setPositionY(lastRenderId, -10); this.render(); });
        const buttonLeft = document.createElement('button');
        buttonLeft.className = "btn btn-dark";
        buttonLeft.innerHTML = "left";
        buttonLeft.addEventListener("click", (e) => { this.setPositionX(lastRenderId, -10); this.render(); });
        const buttonDown = document.createElement('button');
        buttonDown.className = "btn btn-dark";
        buttonDown.innerHTML = "down";
        buttonDown.addEventListener("click", (e) => { this.setPositionY(lastRenderId, 10); this.render(); });
        const buttonRight = document.createElement('button');
        buttonRight.className = "btn btn-dark";
        buttonRight.innerHTML = "right";
        buttonRight.addEventListener("click", (e) => { this.setPositionX(lastRenderId, 10); this.render(); });
        buttonGroup.appendChild(buttonLeft);
        buttonGroup.appendChild(buttonUp);
        buttonGroup.appendChild(buttonDown);
        buttonGroup.appendChild(buttonRight);
        translateContainer.appendChild(buttonGroup);
        return translateContainer;
    }
    setLayers() {
        const layerContainer = document.getElementById('layer-container');
        layerContainer.innerHTML = "";
        for (let i = 0; i < this.doc.layers.length; i++) {
            layerContainer.appendChild(this.createLayer(this.doc.layers[i], i + 1));
        }
    }
    createLayer(layer, id) {
        const div = document.createElement('div');
        div.appendChild(this.createCheckbox(layer, id));
        layer.objects.forEach(object => div.appendChild(this.createCheckbox(object)));
        return div;
    }
    createCheckbox(shape, id) {
        const checkbox = document.createElement('div');
        const input = document.createElement('input');
        input.className = "form-check-input";
        input.type = "checkbox";
        input.checked = true;
        input.addEventListener("change", (e) => {
            if (input.checked)
                shape.visible = true;
            else
                shape.visible = false;
            this.render();
        });
        const label = document.createElement('label');
        label.className = "form-check-label";
        if (shape.constructor.name === "Layer") {
            checkbox.className = "form-check heading";
            label.innerText = "Layer " + id;
        }
        else {
            checkbox.className = "form-check";
            label.innerText = shape.constructor.name;
        }
        checkbox.appendChild(input);
        checkbox.appendChild(label);
        return checkbox;
    }
}
exports.ViewController = ViewController;

},{"./render":5,"./selection":7}]},{},[6]);
