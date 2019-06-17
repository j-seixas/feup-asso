# Simple Draw Project

Development of a very simple graphical editor to draw basic geometric objects, manipulate and persist them.

* Develop using HTML-related technologies (SVG, Canvas);
* All client-side (running in the browser);
* Typescript instead of pure javascript (because, sanity);
* Zero-dependencies for the engine (i.e. d3);
* Libraries for non-engine stuff only (i.e. sass, bootstrap).

### Functionalities

* [x] Documents are rendered both in SVG or HTMLCanvas;
* [x] Support persistence in multiple formats (TXT, XML, BIN...);
* [x] Extensible with different objects (triangles, arrows...);
* [ ] Extensible with new tools (rotate, translate...);
* [x] Drag to select multiple objects;
* [x] Document layers (with compositing strategies).

### Advanced Functionalities

* [x] Multiple views (viewports) of the same model;
* [x] Viewport tools (translate, zoom);
* [x] Different view styles per viewport (wireframe, color);
* [x] Two interaction modes: point-n-click and REPLs;
* [x] Support (un)limited Undo / Redo of all operations.

## Table of Contents
* [Approach](#Approach)
* [Features](#Features)
* [Architecture](#Architecture)
* [Questions For The Design Review](#Questions-For-The-Design-Review)

---

## Approach

Identification of the main problems, design patterns and solutions.

[**INSERT DIAGRAM HERE:** how files communicate and stuff, how everything is connected]

### Features

![Figure 1](https://github.com/literallysofia/feup-asso/blob/master/simple-draw/assets/feature-1.gif)

**Figure 1:** Documents are rendered both in SVG or HTMLCanvas and multiple views (viewports) of the same model.

![Figure 2](https://github.com/literallysofia/feup-asso/blob/master/simple-draw/assets/feature-2.gif)

**Figure 2:** Support persistence in multiple formats: TXT and XML.

![Figure 3](https://github.com/literallysofia/feup-asso/blob/master/simple-draw/assets/feature-3.gif)

**Figure 3:** Extensible with different objects: rectangles and circles.

![Figure 4](https://github.com/literallysofia/feup-asso/blob/master/simple-draw/assets/feature-4.gif)

**Figure 4:** Extensible with new tools: translate and rotate.

![Figure 5](https://github.com/literallysofia/feup-asso/blob/master/simple-draw/assets/feature-5.gif)

**Figure 5:** Drag to select multiple objects.

![Figure 6](https://github.com/literallysofia/feup-asso/blob/master/simple-draw/assets/feature-6.gif)

**Figure 6:** Document layers.

![Figure 7](https://github.com/literallysofia/feup-asso/blob/master/simple-draw/assets/feature-7.gif)

**Figure 7:** Viewport tools: translate and zoom.

![Figure 8](https://github.com/literallysofia/feup-asso/blob/master/simple-draw/assets/feature-8.gif)

**Figure 8:** Different view styles per viewport: default, wireframe and color.

![Figure 9](https://github.com/literallysofia/feup-asso/blob/master/simple-draw/assets/feature-9.gif)

**Figure 9:** Two interaction modes: point-n-click and REPLs.

![Figure 10](https://github.com/literallysofia/feup-asso/blob/master/simple-draw/assets/feature-10.gif)

**Figure 10:** Undo and redo of all operations.

### Architecture

#### Model-View-Controller (MVC)
MVC is an architectural pattern, basically a way of organizing code. The idea behind it is that each section of code has a purpose, and those purposes are different.

- **Model**: Typically reflects real-world things. This code can hold raw data, or it defines the essential components of the app.
- **View**: Made up of all the functions that directly interact with the user. This is the code that makes the app look nice, and otherwise defines how the user sees and interacts with it.
- **Controller**: Acts as a link between the Model and the View, receiving user input and deciding what to do with it.

### Factory Method

**Problem:** Develop a simple graphical editor to draw different objects, such as rectangles and circles.

#### Solution

Firstly, the superclass `Shape` was created. It specifies all standard and generic behavior of an object and then delegates the creation details to subclasses that are supplied by the user.
In this case, it was implemented two different shapes, subclasses of `Shape`: **rectangle and circle**.

```typescript
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

```typescript
createRectangle(x: number, y: number, width: number, height: number): Shape {
    return this.do(new CreateRectangleAction(this, x, y, width, height))
}

createCircle(x: number, y: number, radius: number): Shape {
    return this.do(new CreateCircleAction(this, x, y, radius))
}
```

```typescript
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

The `SimpleDrawDocument` class is the **invoker**, this class receives the operations and it’s responsible for their execution. Every time we perform an operation, an **action** is created. For this same reason, the class `UndoManager` was created, so that it stores all the actions that were done and undone. The **requester** is the `Shape` class because every action is performed on it.

```typescript
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

```typescript
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

The `Action` class **(the command)** is extended and implemented by each type of action. It has two methods:
* *do*: execution of an action;
* *undo*: un-execution of an action.

```typescript
export interface Action<T> {
    do(): T
    undo(): void
}
```

**Create Shape Action**
```typescript
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
TODO
```typescript
add when working
```

### Strategy

**Problem:** Multiple views of the same model.

#### Solution

The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary depending on clients that use it.
In order to achieve this, the `Render` class was created with a method called draw which takes care of mapping the model according to a certain renderer.

```typescript
export interface Render {
    draw(...objs: Array<Shape>): void
}
```

One of this project's requirements is for documents to be rendered both in SVG or HTMLCanvas. For this reason, two renderers were created: `SVGRender` and `CanvasRender`. Each one of these classes extends the `Render` class.

### Abstract Factory

**Problem:** Add different views of the same model.

#### Solution

Abstract Factory is a creational design pattern that lets you produce families of related objects without specifying their concrete classes.

In this case, there's only one family of related products, the `Render`. This pattern suggests declaring interfaces for each distinct product of the product family, so the **Render will be an interface**. Then, there are two variants of this family: `SVGRender` and `CanvasRender` class. These classes implement the Render interface.

```typescript
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

The next move is to declare the Abstract Factory - `RenderFactory` - an interface with a list of creation methods for all products that are part of the product family. These methods must return abstract render types. For each variant of a product family, we create a separate factory class based on the `RenderFactory` interface. A factory is a class that returns products of a particular kind.

```typescript
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

When launching the application, the `ViewController` class is initialized with a type of `RenderFactory`, we decided to use the SVG as default. Then, when adding new renders to the application the same method is used!

```typescript
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

In this case, the pattern was used to define groups of shapes called **layers**. So, the class `Layer` was created, it extends `Shape` and encapsulates objects of type shape.

```typescript
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

Previously, the `SimpleDrawDocument` class had an array of shapes. By implementing the composite pattern, this array has been replaced with an array of layers. Each layer contains an array of shapes. When rendering the document, we go layer by layer.

Some of the major changes can be seen below.

```typescript
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

### Singleton

**Problem:** Drag to select multiple objects.

#### Solution
The Singleton pattern is a software design pattern that restrains the instantiation of a class to one object. This is useful when precisely one object is required to coordinate actions across the system. 

In this specific case, we want a single selection of multiple objects in the document, that can be obtained globally (in the render's `eventListeners` and in the `ViewController`).

Here we have the `Selection` class that has a private constructor to make sure that nobody makes a new instance. To get the existing instance or to create the one instance, simply call the method `getInstance()` that creates one if none exists and returns the instance.

````typescript
export class Selection {
    private static instance: Selection
    selectedObjects = Array<Shape>()

    // some private variables

    private constructor() {}

    static getInstance(): Selection {
        if (!Selection.instance)
            Selection.instance = new Selection()
        return Selection.instance
    }
}
````

In order to select the multiple objects, we added event listeners to the viewports. This was necessary so that we could drag the mouse and make a rectangular selection. The event listeners call the function `newSelection` in the `Selection` class.

Example of a call to the `newSelection` in `SVGRender` (in `CanvasRender` is similar):

````typescript
this.svg.addEventListener('mousedown', (e: MouseEvent) => {
    // get start position of the selection rectangle
})
this.svg.addEventListener('mouseup', (e: MouseEvent) => {
    //get end position of the selection rectangle

    Selection.getInstance().newSelection(this.selectionStartX, this.selectionStartY, this.selectionEndX, this.selectionEndY)
})
````

The following code shows the implementation of `newSelection`. First, the previous selection is cleared, then the values of x and y of two points are taken and a rectangle selection is made with them.
Next, the array of layers is examined to detect if the objects (shapes) are inside of the rectangle (fully or part of it). Finally, the shape's variable `selected` is set to `true`.

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

To make the selection visible, a different color is assigned to the objects in the method `draw` of the `Render` class, making use of the variable `selected`.

````typescript
draw(...layers: Array<Layer>): void {
    // ... some conditions and unnecessary code for this pattern

    if (shape instanceof Rectangle && shape.visible) {
        const e = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        e.setAttribute('style', shape.selected ? 'stroke: blue; fill: white; fill-opacity: 0.75' : 'stroke: black; fill: tomato')
}
````

### Factory Method

**Problem:** SimpleDraw supports exporting of created view (with layers) in different format types, such as XML, console, txt and bin. 

#### Solution

The first problem that needed to be solved was to create an architecture working with different sources of data. Data is generally focused on the same goals, but it can be achieved in a lot of ways. To support the possibility of creating outputs we decided to use factory pattern. The `FileFormat` enum holds all the file formats available. The `ExportFactory` class handles the exportation of the document in one of those formats.

```typescript
export enum FileFormat {
    Console,
    Txt,
    Xml
}

export class ExportFactory {
    outputTypes= new Map<FileFormat, FileExporter>();

    constructor() {
        this.outputTypes.set(FileFormat.Console, new ConsolePrinter())
        this.outputTypes.set(FileFormat.Txt, new TextFileExporter())
        this.outputTypes.set(FileFormat.Xml, new XmlFileExporter())
    }

    ExportFile(format: FileFormat, layers: Array<Layer>){
        let exporter = this.outputTypes.get(format)
        exporter.CreateFileHeader()
        exporter.CreateFileContent(layers)
        exporter.CreateFileFooter()
        return exporter.DownloadFile()
    }
}
```

Then, the `FileExporter` interface declares methods that all types of file exportation must implement.

```typescript
export interface FileExporter {
    CreateFileHeader(): void
    CreateFileContent(layers: Array<Layer>): void
    CreateFileFooter(): void
    DownloadFile(): string
}
```

### Facade

**Problem:** SimpleDraw supports exporting of created view (with layers) in different format types, such as XML, console, txt and bin. 

#### Solution

The factory created above also includes a small implementation of the facade pattern. Using factory user invokes only `ExportFile` method, and he doesn't have to know which methods are invoked inside. It's not necessary to know that creating file contains create of header, content, and footer (it can happen when we want to use HTML for example). The response contains only fully created file.

```typescript
ExportFile (format: FileFormat, layers: Array<Layer>) {
    let exporter = this.outputTypes.get(format)
    exporter.CreateFileHeader()
    exporter.CreateFileContent(layers)
    exporter.CreateFileFooter()
    return exporter.DownloadFile()
}
```

### State

**Problem:** Different view styles per viewport such as wireframe and color.

#### Solution 

That problem can be quickly solved by using the state pattern. The viewport can be rendered in two styles:
* `normal`: Which means that the views are going to be created in the standard way.
* `backgrounded`: Which means that the views are going to be created in a different style. In this case, with a different border and background color.

The state is placed in the abstract class `RenderStyler`, which includes only one method used to change the state of style: `RenderStyle`. At this moment this class is handling only two states, but there is no problem to extend this enum with additional states and just pass a value through the parameter of the method.

````typescript
export enum RenderStyle {
    Normal, Backgrounded
}

export abstract class RenderStyler {
    static style: RenderStyle

    static changeStyle() {
        if (RenderStyler.style === RenderStyle.Normal) {
            RenderStyler.style = RenderStyle.Backgrounded
        }
        else if (RenderStyler.style === RenderStyle.Backgrounded) {
            RenderStyler.style = RenderStyle.Normal
        }
    }
}
````

In this step, we had to extend factories with this class to get access to the current state. If the state is **backgrounded** factories are setting up style with a colored background.

````typescript
export class SVGRender extends RenderStyler implements Render {...}
export class CanvasRender extends RenderStyler implements Render {...}
````

Another implementation of state we puted into render object. As long as application, objects also can have their own states. In this case render can be in "Default", "Wireframe" and "Color" state, this information is stored in "style" field. In class there is a special method to change it, called setStyle() - you have to select one of three fields contained in enum and pass it as a parameter. This information allows to render objects in proper way in every implementation of renderer.

````typescript
export enum ShapeStyle {
    Default, Wireframe, Color
}

setStyle(style: ShapeStyle){
	this.style = style
}
````

### Interpreter

**Problem:** Two interaction modes are required, the standard point-n-click interface and REPLs (read–eval–print loop), which involves text commands. Therefore it is needed an interpreter to understand and convert the text commands into the required actions.

#### Solution

The problem was solved using the Interpreter design pattern. This design pattern maps a language to a grammar, and to a hierarchical object-oriented design. It uses two types of classes representing the grammar of the expression to be interpreted, the **composite expression** classes, which the name indicates, contains the **Composite** design pattern, which means it contains other expression classes, and the **terminal expression** classes, which represent the terminal symbols/tokens of the grammar. It has also a `Context` class, which contains information of the input being processed, and is passed to all of the grammar/expression classes.

In this case, we implemented several different expression classes, related to different types of commands, and variations of the same command, for example, all of the commands which started with "create" are processed by the composite expression class `CreateExp`:

````typescript
 class CreateExp implements Expression {
    interpret(context: Context): boolean {
        let and: Array<Expression> = [new TerminalExpression(new RegExp("^create$"))];
        let or: Array<Expression> = [new RectangleExp(), new CircleExp()];
        let ret : boolean = true;
        for (const exp of and)
            if (!exp.interpret(context)) return false;
        for (const exp of or)
            if (exp.interpret(context)) return true;
        return false;
    }
     
 }
````

The `interpret` method of the this class, tries to match the input being processed, which is passed by `Context`, to the derivation of the grammar which corresponds to this class, which is `CreateExp -> create RectangleExp | CircleExp`, where *create* is a terminal symbol, and *RectangleExp* and *CircleExp* are non-terminals, which the remaining input is matched recursively. If the input is matched, the method returns `true`, and the input is correctly processed, if not the class rejects the input, and returns `false`, because the input does not match this grammar rule. 

For example the `Command` class, which represents the root of the grammar tree, tries to match the input to all of the types of commands it knows, which include `CreateExp` for the *create* command, `RotateExp` for the *rotate* command, etc. If the input does not match any known type of command syntax, then it is rejected as incorrect:

````typescript
 class Command implements Expression {
     interpret(context: Context): boolean {
         let or: Array<Expression> = [new CreateExp(), new RotateExp(), new TranslateExp(), 
            new UndoExp(), new RedoExp(), new ZoomExp(), new CreateViewportExp()];
         for (const exp of or) {
             if (exp.interpret(context)) return true;
         }
         return false;
     }   
 }
 ````
 
 With the **composite expression** classes, we also implemented the `TerminalExpression` class, which corresponds to specific terminal symbols, which can be specified in the creation of the class using a `RegExp` object. The class simply tests the next token in the context against the *regex* to verify if it matches, and if it matches, it stores the token in the `capture` field, so it is used later. There also is a `TerminalExpressionNumber` class, in the frequent case where the token it matches is any number:
 
````typescript
 class TerminalExpression implements Expression {
     
     protected capture: string;
     constructor(private regExp: RegExp){}

     interpret(context: Context): boolean {
         return context.hasNext() && this.regExp.test(this.capture = context.getToken()) && context.next();
     }

 }
 
 class TerminalExpressionNumber extends TerminalExpression {
    constructor(float: boolean){
        if (float) super(new RegExp('^[0-9]+(\.[0-9]+)?$'));
        else super(new RegExp('^[0-9]+$'));
    }

    public getValue(): number {
        return Number(this.capture);
    }
 }
````

Eventually, with the processing of the grammar, it arrives at final rules, where all the descendants are terminal symbols. In this case, the class must obtain the information from the `Context` and `TerminalExpression` classes, such as the values for the command arguments, and then when all of the input is matched successfully, it can execute the action. For example in the `RectangleExp` and `CircleExp` classes, which call the `createRectangle` and `createCircle` methods, respectively:

````typescript
 class RectangleExp implements Expression {
     interpret(context: Context): boolean {
        let args: Array<Expression> = [new TerminalExpression(new RegExp('^rectangle$')), new TerminalExpressionNumber(true),
            new TerminalExpressionNumber(true), new TerminalExpressionNumber(true), new TerminalExpressionNumber(true), new TerminalExpressionNumber(false)];
        for (const exp of args)
            if (!exp.interpret(context)) return false;
        // parse parameters
        try {
            return context.getDoc().createRectangle(params[0], params[1], params[2], params[3], params[4]) !== null;
        } catch (e){
            return false;
        }
     }
 }

 class CircleExp implements Expression {
     interpret(context: Context): boolean {
        let args: Array<Expression> = [new TerminalExpression(new RegExp('^circle$')), new TerminalExpressionNumber(true), 
            new TerminalExpressionNumber(true), new TerminalExpressionNumber(false)];
        for (const exp of args)
            if (!exp.interpret(context)) return false;
        // parse parameters
        try {
            return (context.getDoc().createCircle(params[0], params[1], params[2], params[3]) !== null);
        } catch (e){
            return false;
        }
     }    
}
````

Finally, there is the `Context` class. This is the class that contains the input, which is tokenized during the creation of the class. Because it is passed through all the extension classes, there should be a way to access its elements sequentially, without needing to access the data structure directly, or save the token number to access the variable. For that, we used the **Iterator** design pattern, intialized in element 0, with method to traverse the list `getToken`, to get the current item, `hasNext`, to check is if there are more elements left, and `next`, to advance the iterator:

````typescript
class Context {
     private input : Array<string>;
     private i : number = 0; 

     constructor(cmd: string, private doc: SimpleDrawDocument, private view: ViewController) {
        this.input = cmd.split(' ');
     }

    hasNext(): boolean {
        return this.i < this.input.length
    }

    getToken(): string {
        return this.input[this.i];
    }

    next(): boolean {
        this.i++;
        return true;
    }
    
 }
````

This is the list of valid commands by the command line interaction mode, with syntax corresponding:
- **Create shape**: `create rectangle <x> <y> <width> <height> <layerNumber>` for rectangles;
		    `create circle <x> <y> <radius> <layerNumber>` for circles
- **Translate**: `translate selection <x> <y>` to translate shapes, after selecting shapes with mouse;
		 `translate <viewportNumber> <x> <y>` to translate a specific viewport
- **Rotate**: `rotate selection <degree>` to rotate shapes by `degree`, after selecting shapes with mouse
- **Undo**: `undo`, undo action in any viewport
- **Redo**: `redo`, redo action in any viewport
- **Zoom**: `zoom <viewportNumber> <factor>` where `factor` can be > 1, to zoom in, or between 0 and 1, to zoom out
- **Create viewport**: `viewport canvas` to create new `HTMLCanvas` viewport;
		       `viewport svg` to create new `SVG` viewport;

### Observer

**Problem:** All views should update automatically on change.

#### Solution

To implement new tools that act on shapes of the document, instead of the viewports, it is important that all of the viewports of the document, which are the **View** in the MVC architecture update automatically with changes in the document, which is the **Model** in the MVC architecture. To do that we used the **Observer** design pattern, which is adequate for cases for these. In this pattern, objects called **observers**, watch over for a set of subject objects by registering with them (**observables**), each of which keep a list of which observers are watching it, and when an important event happens, notify all of them. Then the observers can perform a specific action to handle the event:

````typescript
export interface Observer {
    update(): void
}

export class Observable {
    observers : Array<Observer> = new Array<Observer>();
    register(obs: Observer): void {this.observers.push(obs);}
    notify(): void {
        for (let obs of this.observers) 
            obs.update();
    }
}
````

In this implementation, our View, or in this case, the `ViewController`, which contains all of the viewports, is the `Observer`:

````typescript
export class ViewController implements Observer {

    constructor(public doc: SimpleDrawDocument, factory: RenderFactory) {
        // unrelated code
        this.doc.register(this);
        //.....
    }
````

As you can see, this `Observer` registers itself with `doc`, which is a `SimpleDrawDocument`. This object represents our model, with all of the shapes it contains, and it will be the `Observable`, in this case:

````typescript
export class SimpleDrawDocument extends Observable {
     //....
     do<T>(a: Action<T>): T {
        this.undoManager.onActionDone(a)
        let ret : T = a.do();
        this.notify();
        return ret
     }
     //....
}
````

Every time an (undoable) action/operation is performed in the `SimpleDrawDocument`, the `do` method is executed with that action. Because the actions or operations performed in the document need to be updated automatically on the view, after the action is performed, this method informs the `Observer` objects, which include the view, to redraw all of the viewports. This is implemented in the method `update`, in `ViewController`:

````typescript
export class ViewController implements Observer {
    //....
    update(): void {
        this.render();
    }

    render(): void {
        for (const render of this.renders) {
            this.doc.draw(render)
        }
    }
    //....
}
````

---

## Questions For The Design Review

1. Does the architecture satisfy the requirements?

**Answer:** All operations described in the requirements can be achieved, so it should meet the user's expectations. You can see more [here](#Architecture).

2. Is effective modularity achieved?

**Answer:** Yes. As an example, you can ignore creating new viewports focusing only on one and the rest of the functionalities will work. The same experiment will also work with the rest of the collateral tasks. Also, deleting supporting output formats would not change the behavior of application - these modules can be easily excluded from the project.

3. Are interfaces defined for modules and external system elements?

**Answer:** Yes. The functionalities are working with a defined interface. File exporting is using `FileExporter` interface, which contains methods to support different file formats, and after implementation of this interface, new data source should be working without any problems. Factories are implementing `RenderFactory` interface with a function returning an object of type Render. This type is also an interface implemented by our render classes, and it ensures necessary methods and fields for working with shape objects. After the implementation of that interface, a new class will work with the rest of the code.

TODO
***here should be something about external tools***

4. Is the structure of the data and its organisation consistent with the domain of the requirements?

**Answer:** Our structure of data supports layers and shapes, which go inside these layers. It's easy to represent in different file formats with exporting tools. Undo/Redo operations are easy to do with this structure as well as modifying the position of this object in views. It can be rendered in a different way (SVG, HTMLCanvas) which is also important in the requirements, as well as have multiple views and manipulate them. If we create a new shape it will work with the rest of the shapes and they can be selected and manipulated with tools. With these arguments, we can assume that our application's structure is consistent with the domain requirements.

5. Is the structure of the data consistent with the requirements?

**Answer:** Following the last answers. Operations considered in requirements are possible to do. Extending this with new shapes and tools is also predicted. We are not changing the existing code by adding new functionalities. In this case, we think that data is consistent with requirements.

6. Has maintainability been considered?

**Answer:** If we are considering design patterns, we are doing this mostly for **two reasons**. Firstly to solve our problem, secondly to make our code easier to maintain. If a developer who is going to make a modification in our system sees the implementation of a design pattern and he knows this pattern, then he will instantly know what is going on in the code. His modification is going to be faster in this case. Also, the architecture of the application is built to make adding new tools as easy as it is possible. Adding new export needs only to implement one interface and add one enum. Making a new render also needs to implement only one interface without any changes in the rest of the code. If a developer wants to support different types of views, there is only one class which he should use (extend) in his new tool.

7. Have quality factors been explicitly assessed?

**Answer:** As we developed the system, we had in mind the modularity and the coupling between them, so we can say that yes, quality factors were taken into account while developing the features and using the patterns
