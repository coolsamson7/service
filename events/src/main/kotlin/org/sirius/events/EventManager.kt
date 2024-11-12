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
import org.apache.activemq.artemis.api.core.client.ActiveMQClient
import org.apache.activemq.artemis.api.core.client.ClientProducer
import org.apache.activemq.artemis.api.core.client.ClientSession
import org.apache.activemq.artemis.api.core.client.MessageHandler
import org.apache.activemq.artemis.core.server.embedded.EmbeddedActiveMQ
import org.sirius.common.tracer.TraceLevel
import org.sirius.common.tracer.Tracer
import org.springframework.beans.BeansException
import org.springframework.beans.factory.BeanFactory
import org.springframework.beans.factory.BeanFactoryAware
import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.config.BeanDefinition
import org.springframework.beans.factory.config.BeanPostProcessor
import org.springframework.beans.factory.support.DefaultListableBeanFactory
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider
import org.springframework.core.type.filter.AnnotationTypeFilter
import org.springframework.stereotype.Component
import java.util.concurrent.ConcurrentHashMap

class ChildBeanFactory(parentBeanFactory: ConfigurableApplicationContext) : DefaultListableBeanFactory(parentBeanFactory) {
    // local classes
    internal class ParentContextBeanPostProcessor(
        parent: ConfigurableApplicationContext,
        private val beanFactory: BeanFactory
    ) : BeanPostProcessor {
        // instance data
        private val parentProcessors: Collection<BeanPostProcessor>
        private val parentBeanFactory: BeanFactory
        // constructor
        /**
         * @param parent      the parent context
         * @param beanFactory the beanFactory associated with this post processor's context
         */
        init {
            parentProcessors = parent.getBeansOfType(BeanPostProcessor::class.java).values
            parentBeanFactory = parent.beanFactory
        }

        @Throws(BeansException::class)
        override fun postProcessBeforeInitialization(bean: Any, beanName: String): Any {
            var bean = bean
            for (processor in parentProcessors) {
                if (processor is BeanFactoryAware)
                    (processor as BeanFactoryAware).setBeanFactory(beanFactory)

                bean = try {
                    processor.postProcessBeforeInitialization(bean, beanName)
                } finally {
                    if (processor is BeanFactoryAware)
                        (processor as BeanFactoryAware).setBeanFactory(parentBeanFactory)
                }!!
            }
            return bean
        }

        @Throws(BeansException::class)
        override fun postProcessAfterInitialization(bean: Any, beanName: String): Any {
            var bean = bean
            for (processor in parentProcessors) {
                if (processor is BeanFactoryAware) (processor as BeanFactoryAware).setBeanFactory(beanFactory)
                bean = try {
                    processor.postProcessAfterInitialization(bean, beanName)
                } finally {
                    if (processor is BeanFactoryAware)
                        (processor as BeanFactoryAware).setBeanFactory(parentBeanFactory)
                }!!
            }
            return bean
        }
    }

    // constructor
    init {
        for (postProcessor in parentBeanFactory.getBeansOfType(BeanPostProcessor::class.java).values)
            addBeanPostProcessor(postProcessor)

        //addBeanPostProcessor(new ParentContextBeanPostProcessor(parentBeanFactory, this));
    }
}


@Component
class EventManager : ApplicationContextAware {
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

    class ListenerFactory(val applicationContext : ConfigurableApplicationContext) {
        fun make(beanDefinition: BeanDefinition): AbstractEventListener<Any> {
            val beanFactory = ChildBeanFactory(applicationContext)
            val name = beanDefinition.beanClassName!!

            beanFactory.registerBeanDefinition(name, beanDefinition)

            return beanFactory.getBean(name) as AbstractEventListener<Any>
        }

        companion object {
            //var logger = LoggerFactory.getLogger(SpringChannelFactory::class.java)
        }
    }

    // instance data

    val embedded : EmbeddedActiveMQ
    val session: ClientSession

    @Autowired
    lateinit var objectMapper : ObjectMapper

    @JvmField
    final var applicationContext: ApplicationContext? = null

    lateinit var listenerFactory : ListenerFactory

    val events : MutableMap<Class<*>, EventDescriptor> = ConcurrentHashMap()
    val eventListener : MutableMap<Class<out Any>, EventListenerDescriptor> = ConcurrentHashMap()

    // constructor

    constructor() {
        this.embedded = EmbeddedActiveMQ()
        this.embedded.start()

        val serverLocator = ActiveMQClient.createServerLocator("vm://0")
        val sessionFactory = serverLocator.createSessionFactory()

        session = sessionFactory.createSession()
    }

    // public

    fun send(event: Any) {
        val json = objectMapper.writeValueAsString(event)
        val message = session.createMessage(true)
        message.writeBodyBufferString(json)

        producer4(event.javaClass).send(message)
    }

    // private

    private fun producer4(clazz: Class<*>) : ClientProducer {
        return this.events[clazz]!!.producer
    }

    private fun scanEvents() {
        val provider = EventProvider()
        val beans = provider.findCandidateComponents("org.sirius")
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

                /* create a queue per event

                session.createQueue(name, RoutingType.ANYCAST, name) // address, queue name

                // create the consumer per message

                val consumer = session.createConsumer(name) // queue name

                consumer.messageHandler = object : MessageHandler {
                    override fun onMessage(message: ClientMessage) {
                        println("##### GOT ")
                        val body = message.bodyBuffer.readString()

                        println(body)
                        val event = objectMapper.readValue(body, clazz)

                        eventListener(clazz).on(event)
                        //System.out.println("message = " + body + " from " + message.getAddress())
                    }
                }*/
            }
        }
    }

    private fun scanEventListener() {
        val provider = EventListenerProvider()
        val beans = provider.findCandidateComponents("org.sirius")
        for (bean in beans) {
            val annotations = (bean as AnnotatedBeanDefinition)
                .metadata
                .getAnnotationAttributes(EventListener::class.java.getCanonicalName())!!

            val name = annotations["name"] as String
            val eventClass = annotations["event"] as Class<out Any>

            if ( Tracer.ENABLED)
                Tracer.trace("org.sirius.events", TraceLevel.HIGH, "register event listener for event %s", name)

            eventListener[eventClass] = EventListenerDescriptor(name, bean, eventClass.kotlin)

            // force eager creation ( for whatever reason... )

            eventListener(eventClass)

            // consumer

            val eventName = events[eventClass]!!.name

            // create a queue per listener

            session.createQueue(eventName, RoutingType.ANYCAST, eventName) // address, queue name

            // create the consumer per message

            val consumer = session.createConsumer(eventName) // queue name

            consumer.messageHandler = MessageHandler { message ->
                val body = message.bodyBuffer.readString()

                val event = objectMapper.readValue(body, eventClass)

                eventListener(eventClass).on(event)
            }
        }
    }

    private fun eventListener(event: Class<out Any>) : AbstractEventListener<Any> {
        val descriptor = eventListener[event]!!

        if ( descriptor.instance == null) {
            descriptor.instance = listenerFactory.make(descriptor.beanDefinition)
        }

        return descriptor.instance!!
    }

    // lifecycle

    @PostConstruct
    fun startup() {
        session.start()

        scanEvents()
        scanEventListener()
    }

    @PreDestroy
    fun shutdown() {
        session.stop()
        this.embedded.stop()
    }

    // implement ApplicationContextAware

    @Throws(BeansException::class)
    override fun setApplicationContext(applicationContext: ApplicationContext) {
        this.applicationContext = applicationContext
        this.listenerFactory = ListenerFactory(applicationContext as ConfigurableApplicationContext)
    }
}