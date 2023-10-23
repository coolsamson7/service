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
class ChannelInvocationHandler private constructor(private val componentDescriptor: ComponentDescriptor<*>, private val preferredChannel: String?, private var address: ServiceAddress?) : InvocationHandler {
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
                log.info("channel {} for {} is dead", channel.name, componentDescriptor.name)

                serviceManager.channelManager.removeChannel(channel)

                // resolve to missing channel

                channel = MissingChannel(this.serviceManager.channelManager, componentDescriptor)
            }
            else channel.topologyUpdate(newAddress)
        }
    }

    // public
    fun resolveChannel() : Channel {
        channel = if ( address != null ) serviceManager.getChannel(componentDescriptor, address!!) else MissingChannel(this.serviceManager.channelManager, componentDescriptor)

        log.info("resolved channel {} for component {}", channel.name, componentDescriptor)

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

        // key is <component-name>[:<preferredChannel>]
        private val handlers: MutableMap<String, ChannelInvocationHandler> = ConcurrentHashMap()

        // static methods

        fun forComponent(componentDescriptor: ComponentDescriptor<*>, preferredChannel: String?, address: ServiceAddress?): ChannelInvocationHandler {
            var key = componentDescriptor.name;
            if ( address != null) key += ":$preferredChannel"

           return handlers.computeIfAbsent(key) {_ ->  ChannelInvocationHandler(componentDescriptor, preferredChannel, address)}
        }

        @JvmStatic
        fun updateTopology(serviceInstanceRegistry: ServiceInstanceRegistry, topologyUpdate: ServiceInstanceRegistry.TopologyUpdate) {
            // local functions

            fun addressChanged(a1: ServiceAddress?, a2: ServiceAddress?) : Boolean {
                return if ( a1 === null || a2 === null)
                    a1 !== a2
                else
                    a1.changed(a2)
            }

            // recheck missing channels

            for (invocationHandler in handlers.values)
                if (topologyUpdate.involvesService(invocationHandler.componentDescriptor.name)) {
                    // recompute new address

                    val newAddress = serviceInstanceRegistry.getServiceAddress(invocationHandler.componentDescriptor, invocationHandler.preferredChannel)

                    if (addressChanged(invocationHandler.channel.address, newAddress))
                        invocationHandler.topologyUpdate(newAddress)
                }
        }
    }
}
