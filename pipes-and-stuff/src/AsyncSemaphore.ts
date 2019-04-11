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

    async wait(): Promise<void> {
        if (this.available == 0 || this.queueWaitingPromises.length > 0) {
            return new Promise<void>(resolve => this.queueWaitingPromises.push(resolve))
        }
        this.available--
    }
}