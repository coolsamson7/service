package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.exception.ExceptionManager
import com.serious.exception.FatalException
import com.serious.service.BaseDescriptor.Companion.createImplementations
import com.serious.service.BaseDescriptor.Companion.forService
import com.serious.service.ChannelInvocationHandler.Companion.forComponent
import com.serious.service.exception.ServiceRuntimeException
import jakarta.annotation.PreDestroy
import org.slf4j.LoggerFactory
import org.springframework.beans.BeansException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method
import java.lang.reflect.Proxy
import java.lang.reflect.UndeclaredThrowableException
import java.util.concurrent.ConcurrentHashMap

/**
 * The [ComponentLocator] has already scanned and registered the corresponding descriptor and beans.
 * In a postConstruct phase the following logic is executed
 *
 *
 *  * component descriptors are copied fom the locator
 *  * local implementations are instantiated
 *  * local components are published to the registry
 *  * local components start up
 *
 */
@org.springframework.stereotype.Component
class ServiceManager @Autowired internal constructor(
    var componentRegistry: ComponentRegistry,
    var channelManager: ChannelManager,
    var serviceInstanceRegistry: ServiceInstanceRegistry
) : ApplicationContextAware {
    // instance data

    @JvmField
    var applicationContext: ApplicationContext? = null
    @JvmField
    var componentDescriptors: MutableMap<String, ComponentDescriptor<Component>> = HashMap()
    var proxies: MutableMap<String, Service> = ConcurrentHashMap()
    @Autowired
    lateinit var exceptionManager : ExceptionManager

    // public

    fun startup(port: Int) {
        AbstractComponent.port = port.toString()

        // register components

        for (componentDescriptor in ComponentLocator.components)
            addComponentDescriptor(componentDescriptor)

        ComponentLocator.components.clear()

        // create local component and service implementations

        createImplementations(applicationContext!!)

        // publish local components

        for (componentDescriptor in componentDescriptors.values)
            if (componentDescriptor.hasImplementation())
                componentRegistry.startup(componentDescriptor)

        // force update of the service instance registry

        serviceInstanceRegistry.startup()

        // startup

        for (componentDescriptor in componentDescriptors.values) if (componentDescriptor.hasImplementation()) {
            log.info("startup {}", componentDescriptor.name)

            (componentDescriptor.local!! as Component).startup()
        }

        // report

        report()
    }

    @PreDestroy
    fun shutdown() {
        for (componentDescriptor in componentDescriptors.values)
            if (componentDescriptor.hasImplementation()) {
                log.info("shutdown {}", componentDescriptor.name)

                (componentDescriptor.local!! as Component).shutdown()

                componentRegistry.shutdown(componentDescriptor)
            }
    }

    // private
    private fun addComponentDescriptor(descriptor: ComponentDescriptor<Component>) {
        componentDescriptors[descriptor.name] = descriptor
        descriptor.serviceManager = this
    }

    private fun report() {
        val builder = StringBuilder()
        for (componentDescriptor in componentDescriptors.values)
            componentDescriptor.report(builder)

        println(builder)
    }

    // public
    fun <T : Service> acquireLocalService(serviceClass: Class<T>): T {
        val descriptor = forService<T>(serviceClass)

        return if (descriptor.hasImplementation())
            acquireService(descriptor, ServiceAddress.LOCAL)
        else
            throw ServiceRuntimeException("cannot create local service for %s, implementation missing", descriptor.serviceInterface.getName())
    }

    fun <T : Service> acquireService(serviceClass: Class<T>, vararg channels: String?): T {
        val descriptor = forService(serviceClass)
        val serviceAddress = getServiceAddress(descriptor.getComponentDescriptor(), *channels)
            ?: throw ServiceRuntimeException("no service instances for %s", descriptor.getComponentDescriptor().name + if (channels.size > 0) " channels..." else "")

        return acquireService(descriptor, serviceAddress)
    }

    fun <T : Service> acquireService(descriptor: BaseDescriptor<T>, address: ServiceAddress): T {
        val serviceClass: Class<out T> = descriptor.serviceInterface
        val key = "${serviceClass.getName()}:${address.channel}"

        return proxies.computeIfAbsent(key) { _ ->
            log.info("create proxy for {}.{}", descriptor.name, address.channel)

            if (address.channel == "local")
                Proxy.newProxyInstance(serviceClass.getClassLoader(), arrayOf(serviceClass)) { _: Any?, method: Method, args: Array<Any>? ->
                    try {
                        method.invoke(descriptor.local, *args ?: emptyArgs)
                    }
                    catch(exception: Throwable) {
                        handleException(method, exception)
                    }
                } as T
            else
                Proxy.newProxyInstance(serviceClass.getClassLoader(), arrayOf(serviceClass), forComponent(descriptor.getComponentDescriptor(), address.channel, address)) as T
        } as T
    }

    fun getServiceAddress(componentDescriptor: ComponentDescriptor<*>, vararg channels: String?): ServiceAddress? {
        return serviceInstanceRegistry.getServiceAddress(componentDescriptor, *channels)
    }

     fun handleException(method: Method, e: Throwable) : Throwable {
         // some local functions

         fun isPartOfSignature(throwable: Throwable, method: Method): Boolean {
             for (exceptionType in method.exceptionTypes)
                 if (exceptionType.isAssignableFrom(throwable.javaClass))
                     return true

             return false
         }

         // get rid of stupid reflection wrappers, etc.
         fun unwrapException(ex: Throwable): Throwable {
             var exception = ex
             var more = true
             while (more) {
                 more = false

                 // invocation target
                 if (exception is InvocationTargetException) {
                     exception = exception.targetException
                     more = true
                 } // if

                 else if (exception is UndeclaredThrowableException) {
                     exception = exception.undeclaredThrowable
                     more = true
                 } // if
             } // while

             return exception
         }

         // go forrest

         val unwrapped = unwrapException(e)

         // check exception type

         if (isPartOfSignature(unwrapped, method)) // TODO or alwaysthrow...
             throw unwrapped

         else {
             if (unwrapped is FatalException)
                 throw unwrapped
             else
                 throw FatalException(exceptionManager.handleException(unwrapped)) // details
         } // else
     }

    fun getChannel(descriptor: ComponentDescriptor<*>, address: ServiceAddress): Channel {
        return makeChannel(descriptor.getComponentDescriptor(), address)
    }

    private fun makeChannel(componentDescriptor: ComponentDescriptor<out Component>, address: ServiceAddress): Channel {
        return channelManager.make(componentDescriptor, address)
    }

    // implement ApplicationContextAware
    @Throws(BeansException::class)
    override fun setApplicationContext(applicationContext: ApplicationContext) {
        this.applicationContext = applicationContext
    }

    companion object {
        // static data

        var emptyArgs = arrayOf<Any>()

        var log = LoggerFactory.getLogger(ServiceManager::class.java)
    }
}
