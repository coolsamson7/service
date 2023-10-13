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
class ChannelInvocationHandler private constructor(
    private val componentDescriptor: ComponentDescriptor<*>, private val channelName: String, addresses: List<ServiceAddress>) : InvocationHandler {
     // instance data

    private var channel: Channel? = null

    // constructor
    init {
        resolve(channelName, addresses)
    }

    // private
    private fun checkUpdate(channelManager: ChannelManager, delta: ServiceInstanceRegistry.Delta): Boolean {
        if (channel is MissingChannel) {
            val componentManager = componentDescriptor.componentManager!!
            val serviceAddresses = componentManager.getServiceAddresses(componentDescriptor, channelName)

            channel = componentManager.getChannel(componentDescriptor, channelName, serviceAddresses)
        }
        else {
            if (channel!!.needsUpdate(delta)) {
                // remove
                log.info("channel {} for {} is dead", channel!!.getPrimaryAddress(), componentDescriptor.name)

                channelManager.removeChannel(channel!!)

                // resolve

                resolve(channelName, componentDescriptor.componentManager!!.getServiceAddresses(componentDescriptor, channelName)!!)
            }
        }

        return true
    }

    // public
    fun resolve(channelName: String, addresses: List<ServiceAddress>) {
        channel = componentDescriptor.componentManager!!.getChannel(componentDescriptor, channelName, addresses)

        log.info("resolved channel {} for component {}", channelName, componentDescriptor)
    }

    // implement InvocationHandler
    @Throws(Throwable::class)
    override fun invoke(proxy: Any, method: Method, args: Array<out Any>?): Any {
        return channel!!.invoke(proxy, method, args ?: emptyArgs )
    }

    companion object {
        // static data

        var emptyArgs = arrayOf<Any>();

        var log = LoggerFactory.getLogger(ChannelInvocationHandler::class.java)

        private val handlers: MutableMap<String, ChannelInvocationHandler> = ConcurrentHashMap()

        // static methods

        fun forComponent(componentDescriptor: ComponentDescriptor<*>, channel: String, addresses: List<ServiceAddress>): ChannelInvocationHandler {
            val key = componentDescriptor.name + ":" + channel

           return handlers.computeIfAbsent(key) {_ ->  ChannelInvocationHandler(componentDescriptor, channel, addresses)}
        }

        @JvmStatic
        fun recheck(channelManager: ChannelManager, delta: ServiceInstanceRegistry.Delta) {
            // recheck missing channels

            for (invocationHandler in handlers.values)
                invocationHandler.checkUpdate(channelManager, delta)
        }
    }
}
