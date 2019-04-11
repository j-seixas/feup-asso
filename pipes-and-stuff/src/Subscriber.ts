import { Queue } from './Queue'

export class Subscriber<T> {

    constructor(public id: string, private queue: Queue<T>) { }
    
    pull() {
        this.queue.dequeue().then(m => console.log(this.id + " processed this message: " + m))
    }
}