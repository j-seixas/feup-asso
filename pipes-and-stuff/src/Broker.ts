import { BrokerPublisher } from './Publisher'
import { AsyncQueue } from './AsyncQueue'
import { BrokerSubscriber } from './Subscriber'

export class Broker<T> {
    // Map < publisher id, publisher queue>
    publishers = new Map<string, AsyncQueue<T>>()

    // Map < publisher-id, subscribers>
    subscribers = new Map<string, Array<BrokerSubscriber<T>>>()

    addPublisher(publisher: BrokerPublisher<T>){
        this.publishers.set(publisher.id, publisher.getQueue())
        if(!this.subscribers.has(publisher.id))
            this.subscribers.set(publisher.id, new Array<BrokerSubscriber<T>>())
    }

    addSubscriber(subscriber: BrokerSubscriber<T>) {
        subscriber.publishersSubscribed.forEach(p => {
            if(this.subscribers.has(p)) {
                const a = this.subscribers.get(p)
                a.push(subscriber)
                this.subscribers.delete(p)
                this.subscribers.set(p, a)

            } else 
                console.log("Publisher " + p + "doesn't exist")
            console.log(subscriber.id + " added subscription to " + p);
        })
    }

    async pull(id: string): Promise<T> {
        
        const message = await this.publishers.get(id).dequeue()

        this.subscribers.get(id).forEach(element => {
            element.getQueue().enqueue(message) 
        });
        return message
    }
    

    iterateQueues() {
        this.publishers.forEach((value, key) => this.pull(key))
        
    }

}