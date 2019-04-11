import { AsyncSemaphore } from './AsyncSemaphore'

export abstract class Queue<T> {
    public queue = Array<T>()
    public semaphore = new AsyncSemaphore(0)

    async abstract dequeue(): Promise<T>
    abstract enqueue(input: T): any
}