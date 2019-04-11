export class AsyncSemaphore {
    private queueWaitingPromises: Array<()=> void> = []
    
    constructor(private available: number){}

    signal(): void {
        if(this.queueWaitingPromises.length > 0){
            this.queueWaitingPromises.shift()()
            this.available--
        }
        
        this.available++
    }

    async wait(): Promise<void> {
        if(this.available == 0 || this.queueWaitingPromises.length > 0){
            return new Promise<void>(resolve => this.queueWaitingPromises.push(resolve))
        }
        this.available--
    }
}

export abstract class Queue<T> {
    queue = Array<T>()
    semaphore = new AsyncSemaphore(0);

    async abstract dequeue()
    abstract enqueue(input: T)
}

export class AsyncQueue<T> extends Queue<T> {

    async dequeue(): Promise<T> {
        await this.semaphore.wait()
        return Promise.resolve(this.queue.shift())
    }

    enqueue(input: T) {
        this.queue.push(input)
        this.semaphore.signal()
    }
}

export class Subscriber<T> {

    constructor(public id: string, private queue: Queue<T>) { }
    pull() {
        this.queue.dequeue().then(m => console.log(this.id + " processed this message: " + m))
    }
}

export class Publisher<T> {

    constructor(public id: string, private queue: Queue<T>) { }
    push(input: T) {
        this.queue.enqueue(input)
        console.log("Publisher " + this.id + " sent message: " + input)
    }
}

