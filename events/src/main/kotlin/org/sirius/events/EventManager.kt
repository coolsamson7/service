package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.annotation.PostConstruct
import jakarta.annotation.PreDestroy
import org.apache.activemq.artemis.api.core.RoutingType
import org.apache.activemq.artemis.api.core.client.*
import org.apache.activemq.artemis.core.server.embedded.EmbeddedActiveMQ
import org.sirius.common.tracer.TraceLevel
import org.sirius.common.tracer.Tracer
import org.springframework.beans.BeansException
import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.config.BeanDefinition
import org.springframework.beans.factory.support.DefaultListableBeanFactory
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider
import org.springframework.core.type.filter.AnnotationTypeFilter
import org.springframework.stereotype.Component
import java.util.concurrent.ConcurrentHashMap

@Component
class EventManager() : ApplicationContextAware {
    // local classes

    internal class EventProvider : ClassPathScanningCandidateComponentProvider(false) {
        init {
            addIncludeFilter(AnnotationTypeFilter(Event::class.java, false))
        }
    }

    internal class EventListenerProvider : ClassPathScanningCandidateComponentProvider(false) {
        init {
            addIncludeFilter(AnnotationTypeFilter(EventListener::class.java, false))
        }
    }

    class ListenerFactory(applicationContext : ConfigurableApplicationContext) : DefaultListableBeanFactory(applicationContext) {
        // public

        fun make(beanDefinition: BeanDefinition): AbstractEventListener<Any> {
            val name = beanDefinition.beanClassName!!

            registerBeanDefinition(name, beanDefinition)

            return getBean(name) as AbstractEventListener<Any>
        }
    }

    // instance data

    private final val embedded = EmbeddedActiveMQ()
    final val session: ClientSession

    @Autowired
    lateinit var objectMapper : ObjectMapper

    lateinit var listenerFactory : ListenerFactory

    val events : MutableMap<Class<*>, EventDescriptor> = ConcurrentHashMap()
    val eventListener : MutableMap<Class<out Any>, EventListenerDescriptor> = ConcurrentHashMap()

    // constructor

    init {
        this.embedded.start()
        val serverLocator = ActiveMQClient.createServerLocator("vm://0")
        val sessionFactory = serverLocator.createSessionFactory()
        session = sessionFactory.createSession()
    }

    // public

    fun send(event: Any) {
        if ( Tracer.ENABLED)
            Tracer.trace("org.sirius.events", TraceLevel.HIGH, "send event %s", event.javaClass.name)

        val json = objectMapper.writeValueAsString(event)
        val message = session.createMessage(true)
        message.writeBodyBufferString(json)

        producer4(event.javaClass).send(message)
    }

    // private

    private fun producer4(clazz: Class<*>) : ClientProducer {
        return this.findEventDescriptor(clazz).producer
    }

    private fun scanEvents() {
        val beans = EventProvider().findCandidateComponents("org.sirius") // TODO....where to set that?

        for (bean in beans) {
            if (bean is AnnotatedBeanDefinition) {
                val annotations = bean
                    .metadata
                    .getAnnotationAttributes(Event::class.java.getCanonicalName())!!

                val name = annotations["name"] as String
                val clazz = Class.forName(bean.beanClassName)

                if ( Tracer.ENABLED)
                    Tracer.trace("org.sirius.events", TraceLevel.HIGH, "register event %s", name)

                events[clazz] = EventDescriptor(name, clazz, session.createProducer(name)) // address
            }
        }
    }

    private fun scanEventListener() {
        val beans = EventListenerProvider().findCandidateComponents("org.sirius") // TODO

        for (bean in beans) {
            val annotations = (bean as AnnotatedBeanDefinition)
                .metadata
                .getAnnotationAttributes(EventListener::class.java.getCanonicalName())!!

            val eventClass = annotations["event"] as Class<out Any>
            val name = findEventDescriptor(eventClass).name

            if ( Tracer.ENABLED)
                Tracer.trace("org.sirius.events", TraceLevel.HIGH, "register event listener %s for event %s", bean.beanClassName!!, name)

            eventListener[eventClass] = EventListenerDescriptor(name, bean, eventClass.kotlin)

            // consumer

            val event = findEventDescriptor(eventClass)
            val eventName = event.name

            val address = eventName
            val queueName = eventName

            // create a queue per listener

            session.createQueue(address, RoutingType.ANYCAST, queueName) // address, queue name

            // create the consumer per message

            val consumer = session.createConsumer(queueName) // queue name

            consumer.messageHandler = MessageHandler { message ->
                if ( Tracer.ENABLED)
                    Tracer.trace("org.sirius.events", TraceLevel.HIGH, "handle event %s from address %s", eventClass.name, message.address)

                dispatch(createEvent(message, eventClass), eventClass)
            }
        }
    }

    private fun findEventDescriptor(eventClass: Class<out Any>) : EventDescriptor {
        val descriptor = events[eventClass]
        if ( descriptor != null )
            return descriptor
        else
            throw EventError("no registered event for class ${eventClass.name}")
    }

    private fun dispatch(event: Any, eventClass: Class<out Any>) {
        eventListener(eventClass).on(event)
    }

    private fun createEvent(message : ClientMessage, eventClass: Class<*>) : Any {
        val body = message.bodyBuffer.readString()

        return objectMapper.readValue(body, eventClass)
    }

    private fun eventListener(event: Class<out Any>) : AbstractEventListener<Any> {
        val descriptor = eventListener[event]

        if ( descriptor != null) {
            if (descriptor.instance == null) {
                if (Tracer.ENABLED)
                    Tracer.trace(
                        "org.sirius.events",
                        TraceLevel.HIGH,
                        "create listener %s for event %s",
                        descriptor.beanDefinition.beanClassName!!,
                        descriptor.name
                    )

                descriptor.instance = listenerFactory.make(descriptor.beanDefinition)
            }

            return descriptor.instance!!
        }
        else throw EventError("unknown listener for event ${event.name}")
    }

    // lifecycle

    @PostConstruct
    fun startup() {
        if ( Tracer.ENABLED)
            Tracer.trace("org.sirius.events", TraceLevel.HIGH, "startup")

        session.start()

        scanEvents()
        scanEventListener()
    }

    @PreDestroy
    fun shutdown() {
        if ( Tracer.ENABLED)
            Tracer.trace("org.sirius.events", TraceLevel.HIGH, "shutdown")

        session.stop()
        this.embedded.stop()
    }

    // implement ApplicationContextAware

    @Throws(BeansException::class)
    override fun setApplicationContext(applicationContext: ApplicationContext) {
        this.listenerFactory = ListenerFactory(applicationContext as ConfigurableApplicationContext)
    }
}