import { Queue } from './Queue'
import { AsyncQueue } from './AsyncQueue'

export class Publisher<T> {

    constructor(public id: string, public queue: Queue<T>) { }

    push(input: T) {
        this.queue.enqueue(input)
        console.log("Publisher " + this.id + " sent message: " + input)
    }
}

export class BrokerPublisher<T> extends Publisher<T> {
    constructor(public id: string) {
        super(id, new AsyncQueue())
    }

    getQueue(): Queue<T> {
        return this.queue
    }
}