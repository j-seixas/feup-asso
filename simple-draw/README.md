# Simple Draw Project

Development of a very simple graphical editor to draw basic geometric objects, manipulate and persist them.

* Develop using HTML-related technologies (SVG, Canvas);
* All client-side (running in the browser);
* Typescript instead of pure javascript (because, sanity);
* Zero-dependencies for the engine (i.e. d3);
* Libraries for non-engine stuff only (i.e. sass, bootstrap).

## Functionalities

* [ ] SimpleDraw is based on the notion of documents;
* [ ] Documents are rendered both in SVG or HTMLCanvas;
* [ ] Support persistence in multiple formats (TXT, XML, BIN);
* [ ] Extensible with different objects (triangles, arrows...);
* [ ] Extensible with new tools (rotate, translate, grid...); Drag to select multiple objects;
* [ ] Document layers (with compositing strategies).

## Advanced Functionalities

* [ ] Multiple views (viewports) of the same model;
* [ ] Viewport tools (translate, zoom);
* [ ] Different view styles per viewport (wireframe, color);
* [ ] Two interaction modes: point-n-click and REPLs;
* [ ] Support (un)limited Undo / Redo of all operations.

---

## Approach

Identification of the main problems and patterns.

### Functionality 1 (change text)

Description of the implementation progress and patterns used to solve the problem.