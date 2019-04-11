import {Queue, AsyncSemaphore} from './scenario-1'

export class BoundedAsyncQueue<T> extends Queue<T>{
    enqueueSemaphore: AsyncSemaphore
    constructor(bound: number) {
        super()
        this.enqueueSemaphore = new AsyncSemaphore(bound)
    }

    async dequeue(): Promise<T> {
        await this.semaphore.wait()
        this.enqueueSemaphore.signal()
        return new Promise<T>(resolve => {
            if (this.queue.length > 0)
                resolve(this.queue.shift())
        })
    }

    async enqueue(input: T): Promise<void> {
        await this.enqueueSemaphore.wait()
        this.queue.push(input)
        this.semaphore.signal()
    }
}

class Subscriber<T> {

    constructor(public id: string, private queue: Queue<T>) { }
    pull() {
        this.queue.dequeue().then(m => console.log(this.id + " processed this message: " + m))
    }
}

class Publisher<T> {

    constructor(public id: string, private queue: Queue<T>) { }

    push(input: T) {
        this.queue.enqueue(input)
        console.log("Publisher " + this.id + " sent message: " + input)
    }
}