import { AsyncQueue } from '../AsyncQueue'
import { Publisher } from '../Publisher'
import { Subscriber } from '../Subscriber'

const isArraySorted = require('is-array-sorted')

async function testAsyncQueueBehavior(nOps: number): Promise<Boolean> {
    const result = new Array<number>()
    const queue = new AsyncQueue<number>()

    const publisher = new Publisher<number>('p1', queue)
    const subscriber = new Subscriber<number>('s1', queue)

    const enqueue = (m: number) => queue.enqueue(m)
    const dequeue = () => queue.dequeue()
    const promises = Array<Promise<void>>()

    let enqueues = 0
    let dequeues = 0

    // Do a random permutation of enqueing and dequeing
    for (let i = 0; i < nOps; i += 1) {
        if (Math.random() > 0.5) {
            enqueues += 1
            // console.log(`${Date.now()} Enqueuing ${enqueues}`)
            publisher.push(enqueues)
        } else {
            dequeues += 1
            // console.log(`${Date.now()} Dequeuing`)
            promises.push(subscriber.pull().then(v => { result.push(v) }))
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