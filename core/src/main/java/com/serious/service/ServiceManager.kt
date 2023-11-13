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
import com.serious.service.ChannelInvocationHandler.Companion.forChannel
import com.serious.service.ChannelInvocationHandler.Companion.forComponent
import com.serious.service.exception.ServiceRuntimeException
import jakarta.annotation.PostConstruct
import jakarta.annotation.PreDestroy
import org.slf4j.LoggerFactory
import org.springframework.beans.BeansException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cloud.client.DefaultServiceInstance
import org.springframework.cloud.client.ServiceInstance
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method
import java.lang.reflect.Proxy
import java.lang.reflect.UndeclaredThrowableException
import java.util.concurrent.ConcurrentHashMap

/**
 * `ServiceManager` is the central building block that knows about all registered components and services +
 * and is able to create the corresponding proxies.
 */
@org.springframework.stereotype.Component
class ServiceManager @Autowired internal constructor(
    var componentRegistry: ComponentRegistry,
    var channelManager: ChannelManager,
    var serviceInstanceRegistry: ServiceInstanceRegistry,

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

    @PostConstruct
    fun setup() {
        instance = this

        // register components

        for (componentDescriptor in ComponentLocator.components)
            addComponentDescriptor(componentDescriptor)

        ComponentLocator.components.clear()

        // create local component and service implementations

        createImplementations(applicationContext!!)
    }

    /**
     * startup the service manager under the passed local port which will in turn register all local components.
     *
     * @param port the local port
     */
    fun startup(port: Int) {
        AbstractComponent.port = port.toString()

        // publish local components

        for (componentDescriptor in componentDescriptors.values)
            if (componentDescriptor.hasImplementation() && componentDescriptor.externalAddresses!!.isNotEmpty())
                componentRegistry.register(componentDescriptor)

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

                componentRegistry.deregister(componentDescriptor)
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
    /**
     * create a service proxy which will call the local implementation
     *
     * @param T the service type
     * @param serviceClass the service class
     * @return the proxy
     */
    fun <T : Service> acquireLocalService(serviceClass: Class<T>): T {
        val descriptor = forService<T>(serviceClass)

        if (descriptor.hasImplementation())
            return acquireService(descriptor, "local", ServiceAddress.localAddress(descriptor.getComponentDescriptor()))
        else
            throw ServiceRuntimeException("cannot create local service for %s, implementation missing", descriptor.serviceInterface.getName())
    }

    /**
     * create a service proxy for a remote service. A proxy will be created even if no channels are registered.
     *
     * @param T the service type
     * @param serviceClass the service class
     * @param preferredChannel optional preferred channel name
     * @return the proxy
     */
    fun <T : Service> acquireService(serviceClass: Class<T>, preferredChannel: String? = null): T {
        val descriptor = forService(serviceClass)
        var serviceAddress = getServiceAddress(descriptor.getComponentDescriptor().name, preferredChannel)

        // local if available!

        if ( serviceAddress == null && descriptor.hasImplementation())
            serviceAddress = ServiceAddress.localAddress(descriptor.getComponentDescriptor())

        return acquireService(descriptor, preferredChannel, serviceAddress)
    }

    /**
     * create a service proxy for a remote service.
     *
     * @param T the service type
     * @param descriptor the descriptor
     * @param preferredChannel the preferred channel
     * @param address the resolved address
     * @return the proxy
     */
    private fun <T : Service> acquireService(descriptor: BaseDescriptor<T>,  preferredChannel: String? = null, address: ServiceAddress?): T {
        val serviceClass: Class<out T> = descriptor.serviceInterface
        var key = serviceClass.getName()
        if ( preferredChannel != null ) key += ":${preferredChannel}"

        return proxies.computeIfAbsent(key) { _ ->
            log.info("create proxy for {} at {}", descriptor.name, address.toString())

            if (address?.channel == "local")
                Proxy.newProxyInstance(serviceClass.getClassLoader(), arrayOf(serviceClass)) { _: Any?, method: Method, args: Array<Any>? ->
                    try {
                        method.invoke(descriptor.local, *args ?: emptyArgs)
                    }
                    catch(exception: Throwable) {
                        handleException(method, exception)
                    }
                } as T
            else
                Proxy.newProxyInstance(serviceClass.getClassLoader(), arrayOf(serviceClass), forComponent(this, descriptor.getComponentDescriptor().name, preferredChannel, address)) as T
        } as T
    }

    fun <T : Service> acquireLocalAdministrativeService(server: Server, clazz: Class<T>): T {
        val descriptor = forService(clazz).getComponentDescriptor()
        val key = "administration:" + server.host + ":" + server.port + ":" + clazz.name
        val address = ServiceAddress(
            descriptor.name,
            "rest",
            listOf( DefaultServiceInstance(
                key,// TODO instanceId,
                descriptor.name,
                 server.host,
                server.port,
                false,
                mapOf(Pair("channels", "rest(http://" + server.host + ":" + server.port + ")"))
            ) // TODO
            )
            )


        val channel = channelManager.channelFactories[address.channel]!!.makeChannel(descriptor.name, address)

        return proxies.computeIfAbsent(key) { _ ->
            log.info("create administrative proxy for {} at {}", descriptor.name, address.toString())

            Proxy.newProxyInstance(clazz.getClassLoader(), arrayOf(clazz), forChannel(this, descriptor.name, channel)) as T
        } as T
    }

    fun <T : Service> acquireAdministrativeService(component: String, clazz: Class<T>): T {
        val key = "administration:" + component + ":" + clazz.name
        val address = this.getServiceAddress(component) // address of the real component

        return proxies.computeIfAbsent(key) { _ ->
            log.info("create administrative proxy for {} at {}", component, address.toString())

            Proxy.newProxyInstance(clazz.getClassLoader(), arrayOf(clazz), forComponent(this, component, "rest", address)) as T
        } as T
    }

    /**
     * Get service address
     *
     * @param component the component name
     * @param preferredChannel the preferred channel
     * @return the [ServiceAddress] if it can be resolved
     */
    private fun getServiceAddress(component: String, preferredChannel: String? = null): ServiceAddress? {
        return serviceInstanceRegistry.getServiceAddress(component, preferredChannel)
    }

    /**
     * handle exceptions throw by the service method by unwrapping reflection wrappers ( e.g. UndeclaredThrowable ) first
     * If the exception is part of the signature, the exception is simply rethrown.
     * Only if not, it will be delegates to the central exception manager to handle it, and then wrapped in a [FatalException].
     * If a [FatalException] is caught it will be rethrown immediately
     * @param method the called method
     * @param e the exception
     * @return the exception
     */
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

         if (isPartOfSignature(unwrapped, method))
             throw unwrapped

         else {
             if (unwrapped is FatalException)
                 throw unwrapped
             else
                 throw FatalException(exceptionManager.handleException(unwrapped)) // details
         } // else
     }

    /**
     * Get return a suitable channel for the given component descriptor and address
     *
     * @param descriptor a [ComponentDescriptor]
     * @param address the [ServiceAddress]
     * @return the channel
     */
    fun getChannel(component: String, address: ServiceAddress): Channel {
        return makeChannel(component, address)
    }

    private fun makeChannel(component: String, address: ServiceAddress): Channel {
        return channelManager.make(component, address)
    }

    // implement ApplicationContextAware
    @Throws(BeansException::class)
    override fun setApplicationContext(applicationContext: ApplicationContext) {
        this.applicationContext = applicationContext
    }

    companion object {
        // static data

        var instance : ServiceManager? = null

        var emptyArgs = arrayOf<Any>()

        var log = LoggerFactory.getLogger(ServiceManager::class.java)
    }
}
