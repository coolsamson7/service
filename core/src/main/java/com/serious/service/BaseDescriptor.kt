package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.exception.ServiceRuntimeException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.config.BeanDefinition
import org.springframework.beans.factory.support.DefaultListableBeanFactory
import org.springframework.context.ApplicationContext
import java.net.URI
import java.util.*

/**
 * A <code>BaseDescriptor</code> covers the meta-data for both services and components.
 */
abstract class BaseDescriptor<T : Service> protected constructor(@JvmField var serviceInterface: Class<out T>) {
    // instance data

    @JvmField
    var local: Service? = null
    var name: String
        protected set
    var label: String
        protected set
    @JvmField
    var description = ""

    // constructor
    init {
        name = serviceInterface.getName() // that's the default
        label = name
        descriptors[serviceInterface] = this
    }

    // public
    open fun registerBeans(registry: DefaultListableBeanFactory) {
        // let's look for local implementations
        for (name in registry.getBeanNamesForType(serviceInterface)) rememberImplementation(
            this as BaseDescriptor<Service>,
            registry.getBeanDefinition(name)
        )
    }

    open val isService: Boolean
        get() = false

    abstract fun getComponentDescriptor(): ComponentDescriptor<out Component>

    val uri: URI?
        get() = null

    fun hasImplementation(): Boolean {
        return local != null || implementingBeans.get<BaseDescriptor<out Service>, BeanDefinition>(this) != null
    }

    // override Object

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || javaClass != other.javaClass) return false
        val that = other as BaseDescriptor<*>
        return serviceInterface == that.serviceInterface
    }

    override fun hashCode(): Int {
        return Objects.hash(serviceInterface)
    }

    companion object {
        // static data
        var logger = LoggerFactory.getLogger(BaseDescriptor::class.java)
        var descriptors: MutableMap<Class<out Service>, BaseDescriptor<*>> = HashMap()
        @JvmField
        var implementingBeans: MutableMap<BaseDescriptor<out Service>, BeanDefinition> = HashMap()

        fun rememberImplementation(descriptor: BaseDescriptor<out Service>, bean: BeanDefinition) {
            implementingBeans[descriptor] = bean
        }

        @JvmStatic
        fun createImplementations(applicationContext: ApplicationContext) {
            // fetch instances
            for ((descriptor) in implementingBeans) {
                logger.info("create implementation for {}", descriptor.name)

                var s : Service? =  applicationContext.getBean(descriptor.serviceInterface)
                descriptor.local = s
            }
            implementingBeans.clear()
        }

        @JvmStatic
        fun <T : Service> forService(serviceClass: Class<T>): BaseDescriptor<T> {
            return descriptors[serviceClass] as BaseDescriptor<T>?
                ?: throw ServiceRuntimeException("unknown service %s", serviceClass.getName())
        }
    }
}
