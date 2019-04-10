class AsyncSemaphore {
    private available = 0;

    signal(): void {
        this.available++
    }

    async wait(): Promise<void> {
        return new Promise<void>(resolve => {
            if(this.available > 0){
                this.available--
                resolve()
            }
        })

    }
}

class AsyncQueue<T> {
    queue = Array<T>();
    semaphore = new AsyncSemaphore();


    async dequeue(): Promise<T> {
        console.log("here\n");
        await this.semaphore.wait()
        return new Promise<T>(resolve => {
            console.log("here 1\n");
            if(this.queue.length > 0)
                resolve(this.queue.shift())
        })

        
    }

    enqueue(input : T) {
        console.log("here 2\n");
        this.queue.push(input)
        this.semaphore.signal()
        console.log("here 3\n");
    }
} 




setInterval(() => { }, 1000); // run program until explicit exit

(async () => {
    const q = new AsyncQueue<number>()
    q.enqueue(3)
    q.dequeue().then(m => console.log(m))
    q.dequeue().then(m => console.log(m))
    q.enqueue(3)
    process.exit()
})()

// const isArraySorted = require('is-array-sorted')

// async function testAsyncQueueBehavior(nOps: number): Promise<Boolean> {
//     const result = new Array<number>()
//     const q = new AsyncQueue<number>()

//     const enqueue = (m: number) => q.enqueue(m)
//     const dequeue = () => q.dequeue()
//     const promises = Array<Promise<void>>()

//     let enqueues = 0
//     let dequeues = 0

//     // Do a random permutation of enqueing and dequeing
//     for (let i = 0; i < nOps; i += 1) {
//         if (Math.random() > 0.5) {
//             enqueues += 1
//             // console.log(`${Date.now()} Enqueuing ${enqueues}`)
//             enqueue(enqueues)
//         } else {
//             dequeues += 1
//             // console.log(`${Date.now()} Dequeuing`)
//             promises.push(dequeue().then(v => { result.push(v) }))
//         }
//     }

//     // console.log(`Total enqueues ${enqueues}; dequeues ${dequeues}`)
//     const pending = Math.min(enqueues, dequeues)
//     await Promise.all(promises.slice(0, pending))

//     // Length should be equal minimum between enqueues and dequeues
//     const isLengthOk = pending === result.length 

//     // Messages should be ordered
//     const isSorted = isArraySorted(result)

//     return isLengthOk && isSorted
// }

// setInterval(() => { }, 1000); // run program forever until an explicit exit occurs
// (async () => {
//     const success = await testAsyncQueueBehavior(100)
//     console.log(success)
//     process.exit()
// })()