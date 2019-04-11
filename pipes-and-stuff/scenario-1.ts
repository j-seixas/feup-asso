class AsyncSemaphore {
    private available = 0;

    signal(): void {
        this.available++
    }

    async wait(): Promise<void> {
        if(this.available == 0){
            return new Promise<void>(resolve => resolve())
        }
        this.available--

    }
}

class AsyncQueue<T> {
    queue = Array<T>();
    semaphore = new AsyncSemaphore();


    async dequeue(): Promise<T> {
        await this.semaphore.wait()
        return new Promise<T>(resolve => {
            if(this.queue.length > 0)
                resolve(this.queue.shift())
        })

 
    }

    enqueue(input : T) {
        this.queue.push(input)
        this.semaphore.signal()
    }
} 



setInterval(() => { }, 1000); // run program until explicit exit

(async () => {
    const q = new AsyncQueue<number>()
    q.dequeue().then(m => console.log(m))
    q.dequeue().then(m => console.log(m))
    q.enqueue(31)
    q.enqueue(51)
   // process.exit()
})()
