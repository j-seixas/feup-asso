import { Queue } from './Queue'

export class AsyncQueue<T> extends Queue<T> {

    async dequeue(): Promise<T> {
        await this.semaphore.wait()
        //return Promise.resolve(this.queue.shift())
        return this.queue.pop()!
    }

    enqueue(input: T) {
        this.queue.unshift(input)
        //this.queue.push(input)
        this.semaphore.signal()
    }
}