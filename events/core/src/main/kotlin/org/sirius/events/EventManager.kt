package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.annotation.PostConstruct
import jakarta.annotation.PreDestroy
import org.sirius.common.tracer.TraceLevel
import org.sirius.common.tracer.Tracer
import org.springframework.beans.BeansException
import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.beans.factory.config.BeanDefinition
import org.springframework.beans.factory.support.DefaultListableBeanFactory
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider
import org.springframework.core.type.filter.AnnotationTypeFilter
import org.springframework.stereotype.Component
import java.util.concurrent.ConcurrentHashMap

@Component
class EventManager() : ApplicationContextAware, EnvelopeHandler {
    // local classes

    internal class EventProvider : ClassPathScanningCandidateComponentProvider(false) {
        init {
            addIncludeFilter(AnnotationTypeFilter(Event::class.java, false))
        }
    }

    internal class EnvelopePipelineProvider : ClassPathScanningCandidateComponentProvider(false) {
        init {
            addIncludeFilter(AnnotationTypeFilter(EnvelopePipeline::class.java, false))
        }
    }

    internal class EventListenerProvider : ClassPathScanningCandidateComponentProvider(false) {
        init {
            addIncludeFilter(AnnotationTypeFilter(EventListener::class.java, false))
        }
    }

    class BeanFactory(applicationContext : ApplicationContext) : DefaultListableBeanFactory(applicationContext) {
        // public

        fun <T>make(beanDefinition: BeanDefinition, clazz: Class<*>): T {
            val name = beanDefinition.beanClassName!!

            registerBeanDefinition(name, beanDefinition)

            return getBean(name, clazz) as T
        }
    }



    // instance data

    @Value("\${event.root:org.sirius}")
    lateinit var rootPackage: String

    @JvmField
    final var applicationContext: ApplicationContext? = null
    lateinit var beanFactory : BeanFactory

    val events : MutableMap<Class<*>, EventDescriptor> = ConcurrentHashMap()

    @Autowired
    lateinit var eventing : Eventing

    lateinit var envelopeHandler : EnvelopeHandler

    // public

    fun sendEvent(event: Any) {
        val eventDescriptor = this.findEventDescriptor(event.javaClass)

        if ( Tracer.ENABLED)
            Tracer.trace("org.sirius.events", TraceLevel.HIGH, "%s event %s", eventDescriptor.name, if (eventDescriptor.broadcast) "broadcast" else "send")

        val envelope = eventing.create(event)

         envelopeHandler.send(envelope)
    }

    fun handleEvent(envelope: Envelope, eventDescriptor: EventListenerDescriptor) {
        // run handler

        envelopeHandler.handle(envelope, eventDescriptor)
    }

    // protected

    private fun scanEnvelopePipelines() {
        // i am the last handler

        this.envelopeHandler = this

        for (bean in EnvelopePipelineProvider().findCandidateComponents(rootPackage)) {
            if (bean is AnnotatedBeanDefinition) {
                if (Tracer.ENABLED)
                    Tracer.trace(
                        "org.sirius.events",
                        TraceLevel.HIGH,
                        "register envelope pipeline %s",
                        bean.beanClassName!!
                    )

                val pipeline : EnvelopeHandler = this.beanFactory.make(bean, EnvelopeHandler::class.java)

                if ( pipeline is AbstractEnvelopeHandler)
                    pipeline.next = this.envelopeHandler

                envelopeHandler = pipeline
            }
        } // for

        // last handler is me


    }

    private fun scanEvents() {
        for (bean in EventProvider().findCandidateComponents(rootPackage)) {
            if (bean is AnnotatedBeanDefinition) {
                val annotations = bean
                    .metadata
                    .getAnnotationAttributes(Event::class.java.getCanonicalName())!!

                var name = annotations["name"] as String
                val broadcast = annotations["broadcast"] as Boolean
                val durable = annotations["durable"] as Boolean
                val clazz = Class.forName(bean.beanClassName)

                if ( name.isBlank())
                    name = bean.beanClassName!!

                if ( Tracer.ENABLED)
                    Tracer.trace("org.sirius.events", TraceLevel.HIGH, "register event %s", name)

                val descriptor = EventDescriptor(name, clazz, broadcast, durable)
                events[clazz] = descriptor

                eventing.registerEvent(this, descriptor)
            }
        }
    }

    private fun scanEventListener() {
        val groupEventListener = HashMap<Class<out Any>, EventListenerDescriptor>()

        for (bean in EventListenerProvider().findCandidateComponents(rootPackage)) {
            val annotations = (bean as AnnotatedBeanDefinition)
                .metadata
                .getAnnotationAttributes(EventListener::class.java.getCanonicalName())!!

            val group = annotations["group"] as String
            val perProcess = annotations["perProcess"] as Boolean
            var name = annotations["name"] as String
            if ( name.isBlank())
                name = bean.beanClassName!!

            val eventClass = annotations["event"] as Class<out Any>

            val eventDescriptor = findEventDescriptor(eventClass)

            if ( Tracer.ENABLED)
                Tracer.trace("org.sirius.events", TraceLevel.HIGH, "register event listener %s for event %s", bean.beanClassName!!, eventDescriptor.name)

            var descriptor = groupEventListener[eventClass]
            if ( descriptor !== null) {
                if ( group.isNotEmpty()) {
                    (descriptor.instance as GroupEventListener<Any>).list.add(BeanEventListener(beanFactory, bean))
                    descriptor = null
                }
            }
            else {
                if ( group.isNotEmpty()) {
                    val listener = mutableListOf<AbstractEventListener<Any>>(BeanEventListener(beanFactory, bean))
                    descriptor = EventListenerDescriptor(name, group, perProcess, eventDescriptor, GroupEventListener(listener))
                    groupEventListener[eventClass] = descriptor
                }
                else {
                    descriptor = EventListenerDescriptor(name, group, perProcess, eventDescriptor, BeanEventListener(beanFactory, bean))
                }
            }

            if ( descriptor != null)
                eventing.registerEventListener(this, descriptor)
        }
    }

    private fun findEventDescriptor(eventClass: Class<out Any>) : EventDescriptor {
        val descriptor = events[eventClass]
        if ( descriptor != null )
            return descriptor
        else
            throw EventError("no registered event for class ${eventClass.name}")
    }

    fun dispatch(event: Any, eventListenerDescriptor: EventListenerDescriptor) {
        if (Tracer.ENABLED)
            Tracer.trace("org.sirius.events",  TraceLevel.HIGH,"dispatch event ${event.javaClass.name} to listener ${eventListenerDescriptor.name}")

        eventListenerDescriptor.instance.on(event)
    }

    // lifecycle

    @PostConstruct
    fun startup() {
        if ( Tracer.ENABLED)
            Tracer.trace("org.sirius.events", TraceLevel.HIGH, "startup")

        eventing.startup()

        scanEvents()
        scanEventListener()
        scanEnvelopePipelines()
    }

    @PreDestroy
    fun shutdown() {
        if ( Tracer.ENABLED)
            Tracer.trace("org.sirius.events", TraceLevel.HIGH, "shutdown")

        eventing.shutdown()
    }

    // implement ApplicationContextAware

    @Throws(BeansException::class)
    override fun setApplicationContext(applicationContext: ApplicationContext) {
        this.beanFactory = BeanFactory(applicationContext)
    }

    // implement EnvelopeHandler

    override fun send(envelope: Envelope) {
        eventing.send(this, envelope)
    }

    override fun handle(envelope: Envelope, eventDescriptor: EventListenerDescriptor) {
        dispatch(envelope.event, eventDescriptor)
    }
}