# Simple Draw Project

Development of a very simple graphical editor to draw basic geometric objects, manipulate and persist them.

* Develop using HTML-related technologies (SVG, Canvas);
* All client-side (running in the browser);
* Typescript instead of pure javascript (because, sanity);
* Zero-dependencies for the engine (i.e. d3);
* Libraries for non-engine stuff only (i.e. sass, bootstrap).

## Functionalities

* [x] Documents are rendered both in SVG or HTMLCanvas;
* [ ] Support persistence in multiple formats (TXT, XML, BIN);
* [x] Extensible with different objects (triangles, arrows...);
* [ ] Extensible with new tools (rotate, translate, grid...);
* [ ] Drag to select multiple objects;
* [ ] Document layers (with compositing strategies).

## Advanced Functionalities

* [x] Multiple views (viewports) of the same model;
* [x] Viewport tools (translate, zoom);
* [ ] Different view styles per viewport (wireframe, color);
* [ ] Two interaction modes: point-n-click and REPLs;
* [x] Support (un)limited Undo / Redo of all operations.

---

## Approach

Identification of the main problems, design patterns and solutions.

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

### Factory Method

**Problem:** Add different views of the same model.

#### Solution

(unsure, ask in class)


### Model-View-Controller (MVC)
TODO 

**Problem:** 

#### Solution