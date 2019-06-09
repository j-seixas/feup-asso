# Simple Draw Project

Development of a very simple graphical editor to draw basic geometric objects, manipulate and persist them.

* Develop using HTML-related technologies (SVG, Canvas);
* All client-side (running in the browser);
* Typescript instead of pure javascript (because, sanity);
* Zero-dependencies for the engine (i.e. d3);
* Libraries for non-engine stuff only (i.e. sass, bootstrap).

## Functionalities

* [x] Documents are rendered both in SVG or HTMLCanvas;
* [x] Support persistence in multiple formats (TXT, XML, BIN...);
* [x] Extensible with different objects (triangles, arrows...);
* [ ] Extensible with new tools (rotate, translate, grid...);
* [x] Drag to select multiple objects;
* [x] Document layers (with compositing strategies).

## Advanced Functionalities

* [x] Multiple views (viewports) of the same model;
* [x] Viewport tools (translate, zoom);
* [ ] Different view styles per viewport (wireframe, color);
* [ ] Two interaction modes: point-n-click and REPLs;
* [x] Support (un)limited Undo / Redo of all operations.

---

## Approach

Identification of the main problems, design patterns and solutions.

[**INSERT DIAGRAM HERE:** how files communicate and stuff, how everything is connected]

### Factory Method

**Problem:** Develop a simple graphical editor to draw different objects, such as rectangles and circles.

#### Solution

Firstly, the superclass *Shape* was created. It specifies all standard and generic behavior of an object and then delegates the creation details to subclasses that are supplied by the user.
In this case, it was implemented two different shapes, subclasses of Shape: rectangle and circle.

```javascript
export abstract class Shape {
    constructor(public x: number, public y: number) { }

    translate(xd: number, yd: number): void {
        this.x += xd
        this.y += yd
    }
}

export class Rectangle extends Shape {
    constructor(public x: number, public y: number, public width: number, public height: number) {
        super(x, y)
    }
}

export class Circle extends Shape {
    constructor(public x: number, public y: number, public radius: number) {
        super(x, y)
    }
}
```

The creation of shapes is done by creating objects by calling a factory method rather than calling a constructor, which makes future extensibility quite easier.

```javascript
createRectangle(x: number, y: number, width: number, height: number): Shape {
    return this.do(new CreateRectangleAction(this, x, y, width, height))
}

createCircle(x: number, y: number, radius: number): Shape {
    return this.do(new CreateCircleAction(this, x, y, radius))
}
```

```javascript
export class CreateCircleAction extends CreateShapeAction<Circle> {
    constructor(doc: SimpleDrawDocument, private x: number, private y: number, private radius: number) {
        super(doc, new Circle(x, y, radius))
    }
}

export class CreateRectangleAction extends CreateShapeAction<Rectangle> {
    constructor(doc: SimpleDrawDocument, private x: number, private y: number, private width: number, private height: number) {
        super(doc, new Rectangle(x, y, width, height))
    }
}
```

### Command

**Problem:** Support (un)limited undo/redo of all operations.

#### Solution

Simple Draw allows you to perform multiple actions, such as creating shapes. The undo/redo functionality enables you to, well, undo or redo the actions previously executed. The command pattern helps to achieve these behaviors. Basically, it encapsulates a request as an object thereby letting you parameterize clients with different requests, queue or log requests, and support undoable operations.

To implement this pattern three roles are necessary: the requester, the command and the invoker.

The **SimpleDrawDocument** class is the invoker, this class receives the operations and it’s responsible for their execution. Every time we perform an operation, an action is created. For this same reason, the class **UndoManager** was created, so that it stores all the actions that were done and undone. The requester is the **Shape** class because every action is performed on it.

```javascript
export class SimpleDrawDocument {
  undoManager = new UndoManager()

  undo() {
    this.undoManager.undo()
  }

  redo() {
    this.undoManager.redo()
  }

  do<T>(a: Action<T>): T {
    this.undoManager.onActionDone(a)
    return a.do()
  }
}
```

```javascript
type UndoableAction<S> = { do(): S; undo(): void }

export class UndoManager<S, A extends UndoableAction<S>> {
  doStack = new Array<A>();
  undoStack = new Array<A>();

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

  onActionDone(a: A): void {
    this.doStack.push(a);
    this.undoStack.length = 0;
  }
}
```

The **Action** class (the command) is extended and implemented by each type of action. It has two methods:
* *do*: execution of an action;
* *undo*: un-execution of an action.

```javascript
export interface Action<T> {
    do(): T
    undo(): void
}
```

**Create Shape Action**
```javascript
abstract class CreateShapeAction<S extends Shape> implements Action<S> {
    constructor(private doc: SimpleDrawDocument, public readonly shape: S) { }

    do(): S {
        this.doc.add(this.shape)
        return this.shape
    }

    undo() {
        this.doc.objects = this.doc.objects.filter(o => o !== this.shape)
    }
}
```

**Translate Shape Action**
```javascript
add when working
```

### Strategy

**Problem:** Multiple views of the same model.

#### Solution

The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary depending on clients that use it.
In order to achieve this, the **Render** class was created with a method called draw which takes care of mapping the model according to a certain renderer.

```javascript
export interface Render {
    draw(...objs: Array<Shape>): void
}
```

One of this project's requirements is for documents to be rendered both in SVG or HTMLCanvas. For this reason, two renderers were created: **SVGRender** and **CanvasRender**. Each one of these classes extends the **Render** class.

### Abstract Factory

**Problem:** Add different views of the same model.

#### Solution

Abstract Factory is a creational design pattern that lets you produce families of related objects without specifying their concrete classes.

In this case, there's only one family of related products, the **Render**. This pattern suggests declaring interfaces for each distinct product of the product family, so the **Render will be an interface**. Then, there are two variants of this family: **SVGRender and CanvasRender class**. These classes implement the Render interface.

```javascript
export interface Render {
    draw(...objs: Array<Shape>): void
}

export class SVGRender implements Render {
    draw(...objs: Array<Shape>): void
    // Draw svg render
}

export class CanvasRender implements Render {
    draw(...objs: Array<Shape>): void
    // Draw canvas render
}
```

The next move is to declare the Abstract Factory - **RenderFactory** - an interface with a list of creation methods for all products that are part of the product family. These methods must return abstract render types. For each variant of a product family, we create a separate factory class based on the RenderFactory interface. A factory is a class that returns products of a particular kind.

```javascript
export interface RenderFactory {
    createRender(): Render
}

export class SVGFactory implements RenderFactory {
    createRender(): Render {
        return new SVGRender()
    }
}

export class CanvasFactory implements RenderFactory {
    createRender(): Render {
        return new CanvasRender()
    }
}
```

When launching the application, the **ViewController** class is initialized with a type of **RenderFactory**, we decided to use the SVG as default. Then, when adding new renders to the application the same method is used!

```javascript
export class ViewController {
    renders = new Array<Render>()

    constructor(public doc: SimpleDrawDocument, factory: RenderFactory) {
        this.renders.push(factory.createRender())
    }

    addRender(factory: RenderFactory) {
        this.renders.push(factory.createRender())
        this.render()
    }
}
```

This pattern makes it easier when adding new products or families of products to the program, so you don’t have to change existing code! In this case, adding a new type of render would be very simple.

### Composite

**Problem:** Document layers: group graphical objects.

#### Solution

The Composite pattern is a structural design pattern that lets you compose objects into tree structures and then work with these structures as if they were individual objects. Basically, it lets clients treat the individual objects in a uniform manner.

In this case, the pattern was used to define groups of shapes called **layers**. So, the class **Layer** was created, it extends **Shape** and encapsulates objects of type shape.

```javascript
export class Layer extends Shape {

    objects = new Array<Shape>()

    constructor(public name: string, public x: number, public y: number) {
        super(x, y)
    }

    add(shape: Shape): void {
        this.objects.push(shape)
    }
}
```

This pattern allows associating shapes with other shapes, which will be very useful when moving multiple shapes at once. By now, it is possible to hide layers and/or objects! For this to work, it was necessary to change the code from many modules.

Previously, the **SimpleDrawDocument** class had an array of shapes. By implementing the composite pattern, this array has been replaced with an array of layers. Each layer contains an array of shapes. When rendering the document, we go layer by layer.

Some of the major changes can be seen below.

```javascript
export class SimpleDrawDocument {
  undoManager = new UndoManager()
  layers = new Array<Layer>()

  constructor(numLayers: number) {
    // Set layer array
  }

  draw(render: Render): void {
    render.draw(...this.layers)
  }
}

abstract class CreateShapeAction<S extends Shape> implements Action<S> {
    constructor(private layer: Layer, public readonly shape: S) { }

    do(): S {
        this.layer.add(this.shape)
        return this.shape
    }

    undo() {
        this.layer.objects = this.layer.objects.filter(obj => obj !== this.shape)
    }
}
```

### Observer

**Problem:** All views should update automatically on change.

#### Solution


### Singleton

**Problem:** Drag to select multiple objects.

#### Solution
The singleton pattern is a software design pattern that restricts the instantiation of a class to one object. This is useful when exactly one object is needed to coordinate actions across the system. 

In this specific case, we want a single selection of multiple objects in the document, that can be obtained globally (in the render's `eventListeners` and in the `ViewController`).

Here we have the `Selection` class that has a private constructor to make sure that nobody makes a new instance. To get the existing instance or to create the one instance, simply call the method `getInstance()` that creates one if none exists and returns the instance.

````typescript
export class Selection {
    private static instance: Selection
    selectedObjects = Array<Shape>()

    // some private vars

    private constructor() {

    }

    static getInstance(): Selection {
        if (!Selection.instance)
            Selection.instance = new Selection()
        return Selection.instance
    }
````

In order to selected the multiple objects we added `eventListener`s in the Viewports in order to drag the mouse and make a rectangular selection. These `eventListener`s call the `Selection`'s function `newSelection`.

Example of the call to the `newSelection` in `SVGRender` (in `CanvasRender` is similar)
````typescript
this.svg.addEventListener('mousedown', (e: MouseEvent) => {
    // get start position of the selection rectangle
})
this.svg.addEventListener('mouseup', (e: MouseEvent) => {
    //get end position of the selection rectangle

    Selection.getInstance().newSelection(this.selectionStartX, this.selectionStartY, this.selectionEndX, this.selectionEndY)
})
````

Here it's our implementation of the `newSelection` function. We first clear the previous selection, then we take the values of x and y of two points and make a rectangle selection with them. Next, we loop the layers to see if the objects (shapes) are inside of the rectangle (fully or part of it) and we set the variable `selected` inside the `Shape` to `true`
````typescript
newSelection(x1: number, y1: number, x2: number, y2: number) {
    this.clearSelection()

    this.x = x1 > x2 ? x2 : x1
    this.y = y1 > y2 ? y2 : y1
    this.width = Math.abs(x1 - x2)
    this.height = Math.abs(y1 - y2)

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
    for (const shape of this.selectedObjects) 
        shape.selected = false
    

    this.selectedObjects = new Array<Shape>()
}
````

To make the selection visible, we added a different color to the objects in the `Render`'s method `draw`, making use of the variable `selected`.
````typescript
    draw(...layers: Array<Layer>): void {
    
        // ... some conditions and irrelevant code for this goes here
        if (shape instanceof Rectangle && shape.visible) {
            const e = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            e.setAttribute('style', shape.selected ? 'stroke: blue; fill: white; fill-opacity: 0.75' : 'stroke: black; fill: tomato')
````

### Model-View-Controller (MVC)
TODO 

**Problem:** 

#### Solution

---

## Questions For The Design Review

1. Does the architecture satisfy the requirements?

**Answer:** ...

2. Is effective modularity achieved?

**Answer:** ...

3. Are interfaces defined for modules and external system elements?

**Answer:** ...

4. Is the structure of the data and its organisation consistent with the domain of the requirements?

**Answer:** ...

5. Is the structure of the data consistent with the requirements?

**Answer:** ...

6. Has maintainability been considered?

**Answer:** ...

7. Have quality factors been explicitly assessed?

**Answer:** ...
