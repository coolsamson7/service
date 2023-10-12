package com.serious.service.channel
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.*
import java.lang.reflect.InvocationHandler
import java.lang.reflect.Method

/**
 * @author Andreas Ernst
 */
abstract class AbstractChannel protected constructor(protected var channelManager: ChannelManager) : Channel, InvocationHandler {
    // instance data

    protected @JvmField var primaryAddress: ServiceAddress? = null
    protected @JvmField var addresses: List<ServiceAddress?>? = null

    // implement Channel

    override fun getPrimaryAddress(): ServiceAddress? {
        return primaryAddress
    }
    override fun getAddresses(): List<ServiceAddress?>? {
        return addresses
    }

    override fun needsUpdate(delta: ServiceInstanceRegistry.Delta): Boolean {
        return delta.isDeleted(getPrimaryAddress()!!.serviceInstance) // TODO cluster??
    }

    override fun setup(componentClass: Class<out Component>, serviceAddresses: List<ServiceAddress>?) {
        addresses = serviceAddresses
        primaryAddress = serviceAddresses!![0] // ?
    }

    // implement InvocationHandler
    @Throws(Throwable::class)
    override fun invoke(target: Any, method: Method, args: Array<Any>): Any {
        return this.invoke(SimpleMethodInvocation(target, method, *args))!!
    }
}
