import { Queue } from './Queue'
import { AsyncQueue } from './AsyncQueue'
import { Publisher } from './Publisher'

export class Subscriber<T> {

    constructor(public id: string, public queue: Queue<T>) { }

    async pull(): Promise<T> {
        const message = await this.queue.dequeue()
        console.log("Subscriber " + this.id + " processed message: " + message)
        return message
    }
}

export class VentilatorSubscriber<T> {
    constructor(public id: string) { }

    sendMessage(message: T){
        console.log("Subscriber " + this.id + " processed message: " + message)
    }
}

export class BrokerSubscriber<T> extends Subscriber<T> {
    publishersSubscribed: Array<string> = new Array<string>()
    
    constructor(public id: string){
        super(id, new AsyncQueue())
    }

    getQueue(): Queue<T> {
        return this.queue
    }

    addSubscription(id: string){
        this.publishersSubscribed.push(id)
    }
}