package com.serious.service.channel
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.*
import java.lang.reflect.InvocationHandler
import java.lang.reflect.Method
import java.net.URI
import java.util.concurrent.atomic.AtomicInteger

/**
 * abstract base class for [Channel]s
 */
abstract class AbstractChannel protected constructor(protected val channelManager: ChannelManager, override val componentDescriptor: ComponentDescriptor<out Component>, override var address: ServiceAddress) : Channel, InvocationHandler {
    // local interfaces

    /**
     * A [URIProviderFactory] is a factory creating [URIProvider]s
     *
     * @constructor Create empty U r i provider factory
     */
    interface URIProviderFactory {
        /**
         * Create and return a [URIProvider] for the given address
         *
         * @param address a [ServiceAddress]
         * @return the provider
         */
        fun create(address :ServiceAddress) : URIProvider
    }

    /**
     * Base class for providers based on a [ServiceAddress]
     *
     * @property address the [ServiceAddress]
     */
    abstract class URIProvider(var address :ServiceAddress) {
        open fun update(newAddress :ServiceAddress) {
            address = newAddress
        }
        abstract fun provide() : URI
    }

    /**
     * Provider that will simply return the first uri of a [ServiceAddress]
     *
     * @constructor
     *
     * @param address the [ServiceAddress]
     */
    class FirstMatchURIProvider(address :ServiceAddress) : URIProvider(address) {
        // implement URIProvider
        override fun provide(): URI {
            return address.uri.get(0)
        }
    }

    /**
     * provider that will iterate over all uris of the address
     *
     * @constructor
     *
     * @param address the [ServiceAddress]
     */
    class RoundRobinURIProvider(address :ServiceAddress) : URIProvider(address) {
        // instance data

        private var index = AtomicInteger(0)

        // implement URIProvider
        override fun update(newAddress: ServiceAddress) {
            super.update(newAddress)

            index.set(0)
        }

        override fun provide(): URI {
            return address.uri.get(index.getAndUpdate { value ->  (value + 1) % address.uri.size})
        }
    }

    // instance data

    lateinit protected var uriProvider : URIProvider

    // public

    /**
     * set the uri provider factory
     *
     * @param factory the [URIProviderFactory]
     */
    fun uriProvider(factory : URIProviderFactory) {
        uriProvider = factory.create(address)
    }

    /**
     * set a round robin uri provider factory
     *
     */
    fun roundRobin() {
        uriProvider = RoundRobinURIProvider(address)
    }

    // implement Channel

    override val name: String
        get() = address.channel

    override fun setup() {}

    override fun topologyUpdate(newAddress: ServiceAddress) {
        address = newAddress
        uriProvider.update(newAddress)
    }

    // implement InvocationHandler

    @Throws(Throwable::class)
    override fun invoke(target: Any, method: Method, args: Array<Any>): Any? {
        return this.invoke(SimpleMethodInvocation(target, method, *args))
    }
}
