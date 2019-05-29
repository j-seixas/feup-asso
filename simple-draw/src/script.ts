import { SimpleDrawDocument } from './document'
import { ViewController, SVGFactory } from './view'
import { EventListener } from './events'

const doc = new SimpleDrawDocument(4)
const c1 = doc.createCircle(100, 50, 30, 2)
const r1 = doc.createRectangle(10, 10, 80, 80, 2)
const r2 = doc.createRectangle(30, 60, 80, 40, 3)

const view = new ViewController(doc, new SVGFactory())
const eventListener = new EventListener(doc, view)

/* const s1 = sdd.createSelection(c1, r1, r2)
sdd.translate(s1, 10, 10) */

view.render()