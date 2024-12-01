package org.sirius.events.artemis
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.apache.activemq.artemis.api.core.QueueConfiguration
import org.apache.activemq.artemis.api.core.RoutingType
import org.apache.activemq.artemis.api.core.SimpleString
import org.apache.activemq.artemis.api.core.client.*
import org.apache.activemq.artemis.core.server.embedded.EmbeddedActiveMQ
import org.sirius.common.tracer.TraceLevel
import org.sirius.common.tracer.Tracer
import org.sirius.events.*
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap


class ArtemisEnvelope(event: Any, val message: ClientMessage) : Envelope(event) {
    // implement

    override fun setBody(body: String) {
        message.writeBodyBufferString(body)
    }

    override fun get(key: String): String {
        return message.getStringProperty(key)
    }

    override fun set(key: String, value: String) {
        message.putStringProperty(key, value)
    }

}


@Component
class EmbeddedArtemisEventing : Eventing() {
    // instance data

    private var embedded : EmbeddedActiveMQ? = null
    lateinit var session: ClientSession
    val producer : MutableMap<Class<*>, ClientProducer> = ConcurrentHashMap()

    @Value("\${events.artemis.server:vm://0}")
    lateinit var server: String
    @Value("\${events.artemis.user:artemis}")
    lateinit var user: String
    @Value("\${events.artemis.password:artemis}")
    lateinit var password: String
    @Value("\${events.artemis.xa:false}")
    lateinit var xa: String

    // init

    fun init() {
        if ( this.server.startsWith("vm:")) {
            this.embedded = EmbeddedActiveMQ()
            this.embedded!!.start()
        }

        val serverLocator = ActiveMQClient.createServerLocator(this.server)

        if ( embedded == null)
            session = serverLocator.createSessionFactory().createSession(this.user, this.password, xa.lowercase().equals("true"), true,true, true, -1)
        else
            session = serverLocator.createSessionFactory().createSession()
    }

    // private

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
        var queueName = if ( eventListenerDescriptor.group.isNotEmpty()) eventListenerDescriptor.group else eventListenerDescriptor.name

        if ( eventListenerDescriptor.perProcess)
            queueName = queueName + "-" + UUID.randomUUID()

        // create a queue per listener

        val configuration = QueueConfiguration()

        configuration.setAddress(address)
        configuration.setRoutingType(if ( eventListenerDescriptor.event.broadcast ) RoutingType.MULTICAST else RoutingType.ANYCAST)
        configuration.setName(queueName)
        configuration.setTemporary(eventListenerDescriptor.perProcess)
        configuration.setDurable(eventListenerDescriptor.event.durable)

        val query = session.queueQuery(SimpleString(queueName))
        if ( !query.isExists) {
            if ( Tracer.ENABLED)
                Tracer.trace("org.sirius.events.artemis", TraceLevel.FULL, "create queue ${queueName}")

            session.createQueue(configuration)
        }
        else {
            // TODO : check if queue parameters have changed???
            if ( Tracer.ENABLED)
                Tracer.trace("org.sirius.events.artemis", TraceLevel.FULL, "detected existing queue ${queueName}")
        }

        // create the consumer per message

        if ( Tracer.ENABLED)
            Tracer.trace("org.sirius.events.artemis", TraceLevel.FULL, "create consumer for queue ${queueName}")

        val consumer = session.createConsumer(queueName) // queue name

        consumer.messageHandler = MessageHandler { message ->
            if ( Tracer.ENABLED)
                Tracer.trace("org.sirius.events.artemis", TraceLevel.HIGH, "handle event ${eventName} from address ${address} delivered to queue ${queueName}")

            val event = asEvent(message.bodyBuffer.readString(), eventListenerDescriptor.event.clazz)

            val envelope = ArtemisEnvelope(event, message)
            eventManager.handleEvent(envelope, eventListenerDescriptor)
        }
    }

    override fun create(event: Any) : Envelope {
        val envelope = ArtemisEnvelope(event, session.createMessage(true)) // durabke ?

        envelope.setBody(asJSON(event))

        return envelope
    }

    override fun send(eventManager: EventManager, envelope: Envelope) {
        producer4(envelope.event.javaClass).send((envelope as ArtemisEnvelope).message)
    }

    // lifecycle

    override fun startup() {
        init()

        session.start()
    }

    override fun shutdown() {
        session.stop()

        this.embedded?.stop()
    }
}