import { SimpleDrawDocument } from './document'
import { ViewsController } from './view'
import { EventListener } from './events'

const doc = new SimpleDrawDocument()
const view = new ViewsController(doc)
const eventListener = new EventListener(doc, view)

const c1 = doc.createCircle(50, 50, 30)
const r1 = doc.createRectangle(10, 10, 80, 80)
/* const r2 = sdd.createRectangle(30, 30, 40, 40) */

/* const s1 = sdd.createSelection(c1, r1, r2)
sdd.translate(s1, 10, 10) */

view.render()