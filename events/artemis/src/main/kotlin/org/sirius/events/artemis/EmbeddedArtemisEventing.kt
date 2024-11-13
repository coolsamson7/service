package org.sirius.events.artemis
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.apache.activemq.artemis.api.core.QueueConfiguration
import org.apache.activemq.artemis.api.core.RoutingType
import org.apache.activemq.artemis.api.core.client.*
import org.apache.activemq.artemis.core.server.embedded.EmbeddedActiveMQ
import org.sirius.common.tracer.TraceLevel
import org.sirius.common.tracer.Tracer
import org.sirius.events.EventDescriptor
import org.sirius.events.EventError
import org.sirius.events.EventListenerDescriptor
import org.sirius.events.EventManager
import org.springframework.stereotype.Component
import java.util.concurrent.ConcurrentHashMap
@Component
class EmbeddedArtemisEventing : ArtemisEventing() {
    // instance data

    private val embedded = EmbeddedActiveMQ()
    val session: ClientSession
    val producer : MutableMap<Class<*>, ClientProducer> = ConcurrentHashMap()

    // init

    init {
        this.embedded.start()
        val serverLocator = ActiveMQClient.createServerLocator("vm://0")

        session = serverLocator.createSessionFactory().createSession()
    }

    // private

    protected fun createMessage(eventManager: EventManager, event: Any) : ClientMessage {
        val message = session.createMessage(true)

        message.writeBodyBufferString(asJSON(event))

        return message
    }

    private fun createEvent(message : ClientMessage, eventDescriptor: EventDescriptor) : Any {
        return asEvent(message.bodyBuffer.readString(), eventDescriptor)
    }

    private fun producer4(clazz: Class<*>) : ClientProducer {
        val producer = this.producer[clazz]
        if ( producer !== null)
            return producer
        else
            throw EventError("unknown producer for class ${clazz.name}")
    }

    // implement

    override fun registerEvent(eventManager: EventManager, eventDescriptor: EventDescriptor) {
        producer[eventDescriptor.clazz] = session.createProducer(eventDescriptor.name)
    }

    override fun registerEventListener(eventManager: EventManager, eventListenerDescriptor: EventListenerDescriptor) {
        // consumer

        val eventName = eventListenerDescriptor.event.name
        val eventClass =  eventListenerDescriptor.event.clazz

        val address = eventName
        val queueName = eventListenerDescriptor.name

        // create a queue per listener

        val configuration = QueueConfiguration()

        configuration.setAddress(address)
        configuration.setRoutingType(if ( eventListenerDescriptor.event.broadcast ) RoutingType.MULTICAST else RoutingType.ANYCAST)
        configuration.setName(queueName)
        configuration.setDurable(true) // ?

        session.createQueue(configuration)

        // create the consumer per message

        val consumer = session.createConsumer(queueName) // queue name

        consumer.messageHandler = MessageHandler { message ->
            if ( Tracer.ENABLED)
                Tracer.trace("org.sirius.events", TraceLevel.HIGH, "handle event %s from address %s", eventClass.name, message.address)

            eventManager.dispatch(createEvent(message, eventListenerDescriptor.event), eventClass)
        }
    }

    override fun send(eventManager: EventManager, event: Any) {
        producer4(event.javaClass).send(createMessage(eventManager, event))
    }

    // lifecycle

    override fun startup() {
        session.start()
    }

    override fun shutdown() {
        session.stop()
        this.embedded.stop()
    }
}