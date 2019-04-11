import { Queue } from './Queue'
import { AsyncSemaphore } from './AsyncSemaphore'

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