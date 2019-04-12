export class AsyncSemaphore {
    private queueWaitingPromises: Array<() => void> = []

    constructor(private available: number) { }

    signal(): void {
        if (this.queueWaitingPromises.length > 0) {
            this.queueWaitingPromises.shift()()
            this.available--
        }
        this.available++
    }

    async wait() {
        if (this.available == 0 || this.queueWaitingPromises.length > 0) {
            await new Promise(r => this.queueWaitingPromises.push(r))
        }
        this.available--
    }
}