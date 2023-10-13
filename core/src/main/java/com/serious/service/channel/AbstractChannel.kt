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
 * abstract base class for [Channel]s
 */
abstract class AbstractChannel protected constructor(protected val channelManager: ChannelManager, protected val componentClass: Class<out Component>, protected @JvmField val addresses: List<ServiceAddress>) : Channel, InvocationHandler {
    // instance data

    protected @JvmField var primaryAddress: ServiceAddress? = null // TODO

    init {
        primaryAddress = addresses[0] // TODO
    }

    // implement Channel

    override fun setup() {}

    override fun getPrimaryAddress(): ServiceAddress? {
        return primaryAddress
    }
    override fun getAddresses(): List<ServiceAddress> {
        return addresses
    }

    override fun needsUpdate(delta: ServiceInstanceRegistry.Delta): Boolean {
        return delta.isDeleted(getPrimaryAddress()!!.serviceInstance) // TODO cluster??
    }

    // implement InvocationHandler

    @Throws(Throwable::class)
    override fun invoke(target: Any, method: Method, args: Array<Any>): Any {
        return this.invoke(SimpleMethodInvocation(target, method, *args))!!
    }
}
