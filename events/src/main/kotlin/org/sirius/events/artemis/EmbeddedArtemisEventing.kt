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
import org.sirius.events.EventListenerDescriptor
import org.sirius.events.EventManager
import java.util.concurrent.ConcurrentHashMap

class EmbeddedArtemisEventing(eventManager: EventManager) : ArtemisEventing(eventManager) {
    // instance data

    private val embedded = EmbeddedActiveMQ()
    val session: ClientSession
    val producer : MutableMap<Class<*>, ClientProducer> = ConcurrentHashMap()

    // init

    init {
        this.embedded.start()
        val serverLocator = ActiveMQClient.createServerLocator("vm://0")
        val sessionFactory = serverLocator.createSessionFactory()
        session = sessionFactory.createSession()
    }

    // private

    protected fun createMessage(event: Any) : ClientMessage {
        val json = eventManager.objectMapper.writeValueAsString(event)

        val message = session.createMessage(true)

        message.writeBodyBufferString(json)

        return message
    }

    private fun createEvent(message : ClientMessage, eventClass: Class<*>) : Any {
        val body = message.bodyBuffer.readString()

        return eventManager.objectMapper.readValue(body, eventClass)
    }


    private fun producer4(clazz: Class<*>) : ClientProducer {
        return this.producer[clazz]!!
    }

    // implement

    override fun registerEvent(eventDescriptor: EventDescriptor) {
        producer[eventDescriptor.clazz] = session.createProducer(eventDescriptor.name)
    }

    override fun registerEventListener(eventListenerDescriptor: EventListenerDescriptor) {
        // consumer

        val eventName = eventListenerDescriptor.event.name
        val eventClass =  eventListenerDescriptor.event.clazz

        val address = eventName
        val queueName = eventName

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

            eventManager.dispatch(createEvent(message, eventClass), eventClass)
        }
    }

    override fun send(event: Any) {
        if ( Tracer.ENABLED)
            Tracer.trace("org.sirius.events", TraceLevel.HIGH, "send event %s", event.javaClass.name)

        producer4(event.javaClass).send(createMessage(event))
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