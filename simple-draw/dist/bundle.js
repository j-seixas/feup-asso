(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
class CreateShapeAction {
    constructor(doc, shape) {
        this.doc = doc;
        this.shape = shape;
    }
    do() {
        this.doc.add(this.shape);
        return this.shape;
    }
    undo() {
        this.doc.objects = this.doc.objects.filter(o => o !== this.shape);
    }
}
class CreateCircleAction extends CreateShapeAction {
    constructor(doc, x, y, radius) {
        super(doc, new shape_1.Circle(x, y, radius));
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}
exports.CreateCircleAction = CreateCircleAction;
class CreateRectangleAction extends CreateShapeAction {
    constructor(doc, x, y, width, height) {
        super(doc, new shape_1.Rectangle(x, y, width, height));
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}
exports.CreateRectangleAction = CreateRectangleAction;
class TranslateAction {
    constructor(doc, shape, xd, yd) {
        this.doc = doc;
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

},{"./shape":6}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_1 = require("./actions");
const undo_1 = require("./undo");
class SimpleDrawDocument {
    constructor() {
        this.objects = new Array();
        this.undoManager = new undo_1.UndoManager();
    }
    undo() {
        this.undoManager.undo();
    }
    redo() {
        this.undoManager.redo();
    }
    draw(render) {
        // this.objects.forEach(o => o.draw(ctx))
        render.draw(...this.objects);
    }
    add(r) {
        this.objects.push(r);
    }
    do(a) {
        this.undoManager.onActionDone(a);
        return a.do();
    }
    createRectangle(x, y, width, height) {
        return this.do(new actions_1.CreateRectangleAction(this, x, y, width, height));
    }
    createCircle(x, y, radius) {
        return this.do(new actions_1.CreateCircleAction(this, x, y, radius));
    }
    translate(s, xd, yd) {
        return this.do(new actions_1.TranslateAction(this, s, xd, yd));
    }
}
exports.SimpleDrawDocument = SimpleDrawDocument;

},{"./actions":1,"./undo":7}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventListener {
    constructor(doc, view) {
        this.doc = doc;
        this.view = view;
        this.undoButton = document.getElementById('undo');
        this.undoButton.addEventListener("click", (e) => {
            this.doc.undo();
            this.view.render();
        });
        this.redoButton = document.getElementById('redo');
        this.redoButton.addEventListener("click", (e) => {
            this.doc.redo();
            this.view.render();
        });
        this.rectangleButton = document.getElementById('create-rectangle');
        this.rectangleButton.addEventListener("click", (e) => this.drawRectangle());
        this.circleButton = document.getElementById('create-circle');
        this.circleButton.addEventListener("click", (e) => this.drawCircle());
        this.canvasButton = document.getElementById('create-canvas');
        this.canvasButton.addEventListener("click", (e) => {
            this.view.addRender(this.view.createCanvas());
            this.createViewportTools();
        });
        this.svgButton = document.getElementById('create-svg');
        this.svgButton.addEventListener("click", (e) => {
            this.view.addRender(this.view.createSVG());
            this.createViewportTools();
        });
    }
    drawRectangle() {
        var xPosition = parseInt(document.getElementById('input-rect-x').value);
        var yPosition = parseInt(document.getElementById('input-rect-y').value);
        var heigth = parseInt(document.getElementById('input-rect-h').value);
        var width = parseInt(document.getElementById('input-rect-w').value);
        this.doc.createRectangle(xPosition, yPosition, width, heigth);
        this.view.render();
    }
    drawCircle() {
        var xPosition = parseInt(document.getElementById('input-circle-x').value);
        var yPosition = parseInt(document.getElementById('input-circle-y').value);
        var r = parseInt(document.getElementById('input-circle-r').value);
        this.doc.createCircle(xPosition, yPosition, r);
        this.view.render();
    }
    createViewportTools() {
        const lastRender = document.querySelectorAll("[id=renders] > .col");
        const lastRenderId = lastRender.length - 1;
        const buttonZoomIn = document.createElement('button');
        buttonZoomIn.className = "btn btn-outline-primary";
        const iconZoomIn = document.createElement('i');
        iconZoomIn.className = "fa fa-search-plus";
        buttonZoomIn.appendChild(iconZoomIn);
        buttonZoomIn.addEventListener("click", (e) => { this.view.increaseZoom(lastRenderId); this.view.render(); });
        const buttonZoomOut = document.createElement('button');
        buttonZoomOut.className = "btn btn-outline-danger";
        const iconZoomOut = document.createElement('i');
        iconZoomOut.className = "fa fa-search-minus";
        buttonZoomOut.appendChild(iconZoomOut);
        buttonZoomOut.addEventListener("click", (e) => { this.view.decreaseZoom(lastRenderId); this.view.render(); });
        const buttonUp = document.createElement('button');
        buttonUp.className = "btn btn-outline-primary";
        buttonUp.innerHTML = "up";
        buttonUp.addEventListener("click", (e) => { this.view.setPositionY(lastRenderId, -10); this.view.render(); });
        const buttonLeft = document.createElement('button');
        buttonLeft.className = "btn btn-outline-primary";
        buttonLeft.innerHTML = "left";
        buttonLeft.addEventListener("click", (e) => { this.view.setPositionX(lastRenderId, -10); this.view.render(); });
        const buttonDown = document.createElement('button');
        buttonDown.className = "btn btn-outline-primary";
        buttonDown.innerHTML = "down";
        buttonDown.addEventListener("click", (e) => { this.view.setPositionY(lastRenderId, 10); this.view.render(); });
        const buttonRight = document.createElement('button');
        buttonRight.className = "btn btn-outline-primary";
        buttonRight.innerHTML = "right";
        buttonRight.addEventListener("click", (e) => { this.view.setPositionX(lastRenderId, 10); this.view.render(); });
        lastRender[lastRenderId].appendChild(buttonZoomIn);
        lastRender[lastRenderId].appendChild(buttonZoomOut);
        lastRender[lastRenderId].appendChild(buttonUp);
        lastRender[lastRenderId].appendChild(buttonDown);
        lastRender[lastRenderId].appendChild(buttonLeft);
        lastRender[lastRenderId].appendChild(buttonRight);
    }
}
exports.EventListener = EventListener;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
class SVGRender {
    constructor() {
        this.zoom = 1;
        this.positionX = 0;
        this.positionY = 0;
        var container = document.getElementById('renders');
        const col = document.createElement('div');
        col.className = "col";
        container.appendChild(col);
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute('style', 'border: 1px solid blue');
        this.svg.setAttribute('width', '550');
        this.svg.setAttribute('height', '550');
        col.appendChild(this.svg);
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
    draw(...objs) {
        this.svg.innerHTML = "";
        for (const shape of objs) {
            if (shape instanceof shape_1.Rectangle) {
                const e = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                e.setAttribute('style', 'stroke: black; fill: transparent');
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
            else if (shape instanceof shape_1.Circle) {
                const e = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                e.setAttribute('style', 'stroke: black; fill: transparent');
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
exports.SVGRender = SVGRender;
class CanvasRender {
    constructor() {
        this.zoom = 1;
        this.positionX = 0;
        this.positionY = 0;
        var container = document.getElementById('renders');
        const col = document.createElement('div');
        col.className = "col";
        container.appendChild(col);
        const canvas = document.createElement('canvas');
        canvas.setAttribute('style', 'border: 1px solid red');
        canvas.setAttribute('width', '550');
        canvas.setAttribute('height', '550');
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
    draw(...objs) {
        this.ctx.clearRect(0, 0, 550, 550);
        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);
        for (const shape of objs) {
            if (shape instanceof shape_1.Circle) {
                this.ctx.beginPath();
                this.ctx.arc(shape.x + this.positionX, shape.y + this.positionY, shape.radius, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            else if (shape instanceof shape_1.Rectangle) {
                this.ctx.strokeRect(shape.x + this.positionX, shape.y + this.positionY, shape.width, shape.height);
            }
        }
        this.ctx.restore();
    }
}
exports.CanvasRender = CanvasRender;

},{"./shape":6}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_1 = require("./document");
const view_1 = require("./view");
const events_1 = require("./events");
const doc = new document_1.SimpleDrawDocument();
const view = new view_1.ViewsController(doc);
const eventListener = new events_1.EventListener(doc, view);
const c1 = doc.createCircle(50, 50, 30);
const r1 = doc.createRectangle(10, 10, 80, 80);
/* const r2 = sdd.createRectangle(30, 30, 40, 40) */
/* const s1 = sdd.createSelection(c1, r1, r2)
sdd.translate(s1, 10, 10) */
view.render();

},{"./document":2,"./events":3,"./view":8}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Shape {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const render_1 = require("./render");
class ViewsController {
    constructor(doc) {
        this.doc = doc;
        this.renders = new Array();
        this.renders.push(new render_1.SVGRender());
    }
    addRender(render) {
        this.renders.push(render);
        this.render();
    }
    createSVG() {
        return new render_1.SVGRender();
    }
    createCanvas() {
        return new render_1.CanvasRender();
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
}
exports.ViewsController = ViewsController;

},{"./render":4}]},{},[5]);
