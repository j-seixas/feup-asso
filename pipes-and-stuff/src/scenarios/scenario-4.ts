import { AsyncQueue } from '../AsyncQueue'
import { Publisher, BrokerPublisher } from '../Publisher'
import { VentilatorSubscriber, BrokerSubscriber } from '../Subscriber'
import { Ventilator } from '../Ventilator'
import { Broker } from '../Broker';

const isArraySorted = require('is-array-sorted')

async function testAsyncQueueBehavior(nOps: number): Promise<Boolean> {
    const result = new Array<number>()

    const publisher1 = new BrokerPublisher<number>('p1')
    const publisher2 = new BrokerPublisher<number>('p2')
    const subscriber1 = new BrokerSubscriber<number>('s1')
    //subscriber1.addSubscription('p1')
    subscriber1.addSubscription('p2')
    const subscriber2 = new BrokerSubscriber<number>('s2')
    subscriber2.addSubscription('p1')

    const broker = new Broker<number>()
    broker.addPublisher(publisher1)
    broker.addPublisher(publisher2)
    broker.addSubscriber(subscriber1)
    broker.addSubscriber(subscriber2)
    

   
    const promises = Array<Promise<void>>()

    let enqueues = 0
    let dequeues = 0

    // Do a random permutation of enqueing and dequeing
    for (let i = 0; i < nOps; i += 1) {
        if (Math.random() > 0.5) {
            enqueues += 1
            // console.log(`${Date.now()} Enqueuing ${enqueues}`)
            //enqueue(enqueues)
            if (Math.random() > 0.5) 
                publisher1.push(enqueues)
            else 
                publisher2.push(enqueues + 1000)
            
            broker.iterateQueues()
        } else {
            dequeues += 1
            // console.log(`${Date.now()} Dequeuing`)

            // Problema e aqui pq ele da pull nos 2 subscribers e 
            // cria mais promises (result.length) do que o 
            // min (enqueues, dequeues) que e a comparacao mais abaixo
            promises.push(subscriber1.pull().then(v => { result.push(v) }))
            promises.push(subscriber2.pull().then(v => { result.push(v) }))
        }
    }

   // broker.runForever()
    console.log(`Total enqueues ${enqueues}; dequeues ${dequeues}`)
    const pending = Math.min(enqueues, dequeues)
    await Promise.all(promises.slice(0, pending))

    // Length should be equal minimum between enqueues and dequeues
    const isLengthOk = pending === result.length
    console.log(result.length + " == " + pending)

    // Messages shouldn't be ordered since they come from different publishers

    return isLengthOk
}

setInterval(() => { }, 1000); // run program forever until an explicit exit occurs
(async () => {
    const success = await testAsyncQueueBehavior(100)
    console.log(success)
    process.exit()
})()