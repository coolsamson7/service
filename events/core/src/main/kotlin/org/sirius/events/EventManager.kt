package org.sirius.events
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.ObjectMapper
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

    class ListenerFactory(applicationContext : ApplicationContext) : DefaultListableBeanFactory(applicationContext) {
        // public

        fun make(beanDefinition: BeanDefinition): AbstractEventListener<Any> {
            val name = beanDefinition.beanClassName!!

            registerBeanDefinition(name, beanDefinition)

            return getBean(name) as AbstractEventListener<Any>
        }
    }

    // instance data

    @Value("\${event.root:org.sirius}")
    lateinit var rootPackage: String

    @Autowired
    lateinit var objectMapper : ObjectMapper

    lateinit var listenerFactory : ListenerFactory

    val events : MutableMap<Class<*>, EventDescriptor> = ConcurrentHashMap()
    val eventListener : MutableMap<Class<out Any>, EventListenerDescriptor> = ConcurrentHashMap()

    @Autowired
    lateinit var eventing : Eventing

    // public

    fun send(event: Any) {
        if ( Tracer.ENABLED)
            Tracer.trace("org.sirius.events", TraceLevel.HIGH, "send event %s", event.javaClass.name)

        eventing.send(this, event)
    }

    // protected

    private fun scanEvents() {
        val beans = EventProvider().findCandidateComponents(rootPackage)

        for (bean in beans) {
            if (bean is AnnotatedBeanDefinition) {
                val annotations = bean
                    .metadata
                    .getAnnotationAttributes(Event::class.java.getCanonicalName())!!

                var name = annotations["name"] as String
                val broadcast = annotations["broadcast"] as Boolean
                val clazz = Class.forName(bean.beanClassName)

                if ( name.isBlank())
                    name = bean.beanClassName!!

                if ( Tracer.ENABLED)
                    Tracer.trace("org.sirius.events", TraceLevel.HIGH, "register event %s", name)

                val descriptor = EventDescriptor(name, clazz, broadcast)
                events[clazz] = descriptor

                eventing.registerEvent(this, descriptor)
            }
        }
    }

    private fun scanEventListener() {
        val beans = EventListenerProvider().findCandidateComponents(rootPackage)

        for (bean in beans) {
            val annotations = (bean as AnnotatedBeanDefinition)
                .metadata
                .getAnnotationAttributes(EventListener::class.java.getCanonicalName())!!

            val eventClass = annotations["event"] as Class<out Any>

            val eventDescriptor = findEventDescriptor(eventClass)

            if ( Tracer.ENABLED)
                Tracer.trace("org.sirius.events", TraceLevel.HIGH, "register event listener %s for event %s", bean.beanClassName!!, eventDescriptor.name)

            val descriptor = EventListenerDescriptor(bean, eventDescriptor)

            eventListener[eventClass] = descriptor

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

    public fun dispatch(event: Any, eventClass: Class<out Any>) {
        eventListener(eventClass).on(event)
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
                        descriptor.event.name
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

        eventing.startup()

        scanEvents()
        scanEventListener()
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
        this.listenerFactory = ListenerFactory(applicationContext)
    }
}