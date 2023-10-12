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
 * @author Andreas Ernst
 */
class ChannelInvocationHandler private constructor(// instance data
    private val componentDescriptor: ComponentDescriptor<*>, channelName: String, addresses: List<ServiceAddress>?
) : InvocationHandler {
    private var channelName: String? = null
    private var channel: Channel? = null

    // constructor
    init {
        resolve(channelName.also { this.channelName = it }, addresses)
    }

    // private
    private fun checkUpdate(channelManager: ChannelManager, delta: ServiceInstanceRegistry.Delta): Boolean {
        if (channel is MissingChannel) {
            val componentManager = componentDescriptor.componentManager
            val serviceAddresses = componentManager!!.getServiceAddresses(
                componentDescriptor, channelName
            )
            channel = componentManager.getChannel(componentDescriptor, channelName!!, serviceAddresses)
        } else {
            if (channel!!.needsUpdate(delta)) {
                // remove
                log.info("channel {} for {} is dead", channel!!.getPrimaryAddress(), componentDescriptor.name)
                channelManager.removeChannel(channel!!)

                // resolve
                resolve(
                    channelName,
                    componentDescriptor.componentManager!!.getServiceAddresses(componentDescriptor, channelName)
                )
            }
        }
        return true
    }

    // public
    fun resolve(channelName: String?, addresses: List<ServiceAddress>?) {
        channel = componentDescriptor.componentManager!!.getChannel(componentDescriptor, channelName!!, addresses)
        log.info("resolved channel {} for component {}", channelName, componentDescriptor)
    }

    // implement InvocationHandler
    @Throws(Throwable::class)
    override fun invoke(proxy: Any, method: Method, args: Array<out Any>?): Any {
       var b = arrayOf< Any>();
        if ( args != null)
            b = args as Array<Any>; // TODO KOTLIN
        return channel!!.invoke(proxy, method, b)
    }

    companion object {
        // static data
        var log = LoggerFactory.getLogger(ChannelInvocationHandler::class.java)
        private val handlers: MutableMap<String, ChannelInvocationHandler> = ConcurrentHashMap()

        // static methods
        fun forComponent(
            componentDescriptor: ComponentDescriptor<*>,
            channel: String,
            addresses: List<ServiceAddress>?
        ): ChannelInvocationHandler? {
            val key = componentDescriptor.name + ":" + channel
            var handler = handlers[key]
            if (handler == null) handlers[key] =
                ChannelInvocationHandler(componentDescriptor, channel, addresses).also { handler = it }
            return handler
        }

        @JvmStatic
        fun recheck(channelManager: ChannelManager, delta: ServiceInstanceRegistry.Delta) {
            // recheck missing channels
            for (invocationHandler in handlers.values) invocationHandler.checkUpdate(channelManager, delta)
        }
    }
}
