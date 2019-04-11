import {Queue} from './scenario-1'

export class AsyncSemaphore {
    constructor(private available: number){}

    signal(): void {
        this.available++
    }

    async wait(): Promise<void> {
        if (this.available == 0) {
            return new Promise<void>(resolve => resolve())
        }
        this.available--
    }
}

export class BoundedAsyncQueue<T> extends Queue<T>{
    enqueueSemaphore = new AsyncSemaphore(10)
    constructor(bound: number) {
        super()
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

/* setInterval(() => { }, 1000); // run program until explicit exit

(async () => {
    const q = new AsyncQueue<number>()

    const s1 = new Subscriber("s1", q)
    const s2 = new Subscriber("s2", q)

    const p1 = new Publisher("p1", q)
    const p2 = new Publisher("p2", q)
    const p3 = new Publisher("p3", q)

    p1.push(1111)
    s1.pull()
    s1.pull()
    s1.pull()
    p1.push(2222)
    p1.push(3334)

    for (let i = 0; i < 100; i += 1) {
        if (Math.random() > 0.5) {
            s1.pull()
        } else {
            p1.push(i)
        }
    }

    // process.exit()
})() */

const isArraySorted = require('is-array-sorted')

async function testAsyncQueueBehavior(nOps: number): Promise<Boolean> {
    const result = new Array<number>()
    const q = new BoundedAsyncQueue<number>(10)

    const enqueue = (m: number) => q.enqueue(m)
    const dequeue = () => q.dequeue()
    const promises = Array<Promise<void>>()

    let enqueues = 0
    let dequeues = 0

    // Do a random permutation of enqueing and dequeing
    for (let i = 0; i < nOps; i += 1) {
        if (Math.random() > 0.5) {
            enqueues += 1
            // console.log(`${Date.now()} Enqueuing ${enqueues}`)
            enqueue(enqueues)
        } else {
            dequeues += 1
            // console.log(`${Date.now()} Dequeuing`)
            promises.push(dequeue().then(v => { result.push(v) }))
        }
    }

    // console.log(`Total enqueues ${enqueues}; dequeues ${dequeues}`)
    const pending = Math.min(enqueues, dequeues)
    await Promise.all(promises.slice(0, pending))

    // Length should be equal minimum between enqueues and dequeues
    const isLengthOk = pending === result.length

    // Messages should be ordered
    const isSorted = isArraySorted(result)

    return isLengthOk && isSorted
}

setInterval(() => { }, 1000); // run program forever until an explicit exit occurs
(async () => {
    const success = await testAsyncQueueBehavior(100)
    console.log(success)
    process.exit()
})()
