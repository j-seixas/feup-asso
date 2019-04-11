import { Queue } from './Queue'

export class Publisher<T> {

    constructor(public id: string, private queue: Queue<T>) { }

    push(input: T) {
        this.queue.enqueue(input)
        console.log("Publisher " + this.id + " sent message: " + input)
    }
}