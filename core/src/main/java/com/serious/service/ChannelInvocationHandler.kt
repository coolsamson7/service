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
class ChannelInvocationHandler : InvocationHandler {
    // instance data

    private val serviceManager : ServiceManager
    private val component: String
    private val preferredChannel: String?
    private var address: ServiceAddress?

    private var channel: Channel

    // constructor

    constructor(serviceManager : ServiceManager, component: String, preferredChannel: String?, address: ServiceAddress?) {
        this.serviceManager = serviceManager
        this.component = component
        this.preferredChannel = preferredChannel
        this.address = address

        channel = resolveChannel()
    }
     constructor(serviceManager : ServiceManager, component: String, channel: Channel) {
         this.serviceManager = serviceManager
         this.component = component
         this.preferredChannel = channel.name
         this.address = channel.address
         this.channel = channel
     }

    // private
    private fun topologyUpdate(newAddress: ServiceAddress?) {
        if (channel is MissingChannel) {
            if ( newAddress != null)
                channel = serviceManager.getChannel(component, newAddress)
        }
        else {
            if ( newAddress == null) {
                log.info("channel {} for {} is dead", channel.name, component)

                serviceManager.channelManager.removeChannel(channel)

                // resolve to missing channel

                channel = MissingChannel(this.serviceManager.channelManager, component)
            }
            else channel.topologyUpdate(newAddress)
        }
    }

    // public
    fun resolveChannel() : Channel {
        channel = if ( address != null ) serviceManager.getChannel(component, address!!) else MissingChannel(this.serviceManager.channelManager, component)

        log.info("resolved channel {} for component {}", channel.name, component)

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
        fun forComponent(serviceManager: ServiceManager, component: String, preferredChannel: String?, address: ServiceAddress?): ChannelInvocationHandler {
            var key = component;
            if ( preferredChannel != null) key += ":$preferredChannel"

           return handlers.computeIfAbsent(key) {_ ->  ChannelInvocationHandler(serviceManager, component, preferredChannel, address)}
        }

        fun forChannel(serviceManager: ServiceManager, component: String, channel: Channel): ChannelInvocationHandler {
            return ChannelInvocationHandler(serviceManager, component, channel)
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
                if (topologyUpdate.involvesService(invocationHandler.component)) {
                    // recompute new address

                    val newAddress = serviceInstanceRegistry.getServiceAddress(invocationHandler.component, invocationHandler.preferredChannel)

                    if (addressChanged(invocationHandler.channel.address, newAddress))
                        invocationHandler.topologyUpdate(newAddress)
                }
        }
    }
}
