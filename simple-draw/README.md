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

* [ ] Multiple views (viewports) of the same model;
* [ ] Viewport tools (translate, zoom);
* [ ] Different view styles per viewport (wireframe, color);
* [ ] Two interaction modes: point-n-click and REPLs;
* [x] Support (un)limited Undo / Redo of all operations.

---

## Approach

Identification of the main problems, design patterns and solutions.

### Factory Method

**Problem:** Develop a simple graphical editor to draw different objects, such as rectangles and circles.

#### Solution

Firstly,  the superclass *Shape* was created. It specifies all standard and generic behavior of an object and then delegates the creation details to subclasses that are supplied by the user.
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