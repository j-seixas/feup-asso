import { VentilatorSubscriber } from './Subscriber'
import { AsyncQueue } from 'AsyncQueue';


export class Ventilator<T> {
    private observers: Array<VentilatorSubscriber<T>> = new Array<VentilatorSubscriber<T>>()

    constructor(private queue: AsyncQueue<T>){}

    addObserver(observer: VentilatorSubscriber<T>){
        this.observers.push(observer)
    }

    notifyObservers(message: T){
        this.observers.forEach(o => o.sendMessage(message))
    }

    async pull(): Promise<T> {
        const queuedMsg = await this.queue.dequeue()
        this.notifyObservers(queuedMsg)
        return queuedMsg
    }
}