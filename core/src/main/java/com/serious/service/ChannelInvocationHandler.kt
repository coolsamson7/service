package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.channel.MissingChannel
import org.slf4j.LoggerFactory
import java.lang.reflect.InvocationHandler
import java.lang.reflect.Method
import java.util.concurrent.ConcurrentHashMap

 /**
 * A special [InvocationHandler] that delegates calls to a [Channel]
 */
class ChannelInvocationHandler private constructor(private val componentDescriptor: ComponentDescriptor<*>, private val address: ServiceAddress) : InvocationHandler {
    // instance data

    private val serviceManager : ServiceManager
        get() = componentDescriptor.serviceManager!!

    private var channel: Channel

    // constructor

    init {
        channel = resolveChannel()
    }

    // private
    private fun topologyUpdate(newAddress: ServiceAddress?) {
        if (channel is MissingChannel) {
            if ( newAddress != null)
                channel = serviceManager.getChannel(componentDescriptor, newAddress)
        }
        else {
            if ( newAddress == null) {
                log.info("channel {} for {} is dead", address.channel, componentDescriptor.name)

                serviceManager.channelManager.removeChannel(channel)

                // resolve to missing channel

                resolveChannel()
            }
            else channel.topologyUpdate(newAddress)
        }
    }

    // public
    fun resolveChannel() : Channel {
        channel = serviceManager.getChannel(componentDescriptor, address)

        log.info("resolved channel {} for component {}", address.channel, componentDescriptor)

        return channel
    }

    // implement InvocationHandler

    @Throws(Throwable::class)
    override fun invoke(proxy: Any, method: Method, args: Array<out Any>?): Any? {
        return channel.invoke(proxy, method, args ?: emptyArgs )
    }

    companion object {
        // static data

        var emptyArgs = arrayOf<Any>()

        var log = LoggerFactory.getLogger(ChannelInvocationHandler::class.java)

        private val handlers: MutableMap<String, ChannelInvocationHandler> = ConcurrentHashMap()

        // static methods

        fun forComponent(componentDescriptor: ComponentDescriptor<*>, channel: String, address: ServiceAddress): ChannelInvocationHandler {
            val key = componentDescriptor.name + ":" + channel

           return handlers.computeIfAbsent(key) {_ ->  ChannelInvocationHandler(componentDescriptor, address)}
        }

        @JvmStatic
        fun updateTopology(serviceInstanceRegistry: ServiceInstanceRegistry, topologyUpdate: ServiceInstanceRegistry.TopologyUpdate) {
            // local functions

            fun equalObjects(o1: Any?, o2: Any?) : Boolean {
                if ( o1 == null || o2 == null)
                    return o1 == o2
                else
                    return o1.equals(o2)
            }

            // recheck missing channels

            for (invocationHandler in handlers.values)
                if (topologyUpdate.involvesService(invocationHandler.componentDescriptor.name)) {
                    // recompute new address

                    val newAddress = serviceInstanceRegistry.getServiceAddress(invocationHandler.componentDescriptor, invocationHandler.channel.name)

                    if (!equalObjects(invocationHandler.channel.address, newAddress))
                        invocationHandler.topologyUpdate(newAddress)
                }
        }
    }
}
