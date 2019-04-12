import { Queue } from './Queue'

export class AsyncQueue<T> extends Queue<T> {

    async dequeue(): Promise<T> {
        await this.semaphore.wait()
        return this.queue.shift()!
    }

    enqueue(input: T) {
        this.queue.push(input)
        this.semaphore.signal()
    }
}