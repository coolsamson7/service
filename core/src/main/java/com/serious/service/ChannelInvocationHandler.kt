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

    private val componentManager : ComponentManager
        get() = componentDescriptor.componentManager!!

    private var channel: Channel

    // constructor

    init {
        channel = resolveChannel()
    }

    // private
    private fun checkUpdate(channelManager: ChannelManager, delta: ServiceInstanceRegistry.Delta): Boolean {
        if (channel is MissingChannel) {
            val address = componentManager.getServiceAddress(componentDescriptor, address.channel)

            if ( address != null)
                channel = componentManager.getChannel(componentDescriptor, address)
        }
        else {
            if (channel.needsUpdate(delta)) {
                // remove
                log.info("channel {} for {} is dead", address.channel, componentDescriptor.name)

                channelManager.removeChannel(channel)

                // resolve

                resolveChannel()
            }
        }

        return true
    }

    // public
    fun resolveChannel() : Channel {
        channel = componentManager.getChannel(componentDescriptor, address)

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
        fun recheck(channelManager: ChannelManager, delta: ServiceInstanceRegistry.Delta) {
            // recheck missing channels

            for (invocationHandler in handlers.values)
                invocationHandler.checkUpdate(channelManager, delta)
        }
    }
}
