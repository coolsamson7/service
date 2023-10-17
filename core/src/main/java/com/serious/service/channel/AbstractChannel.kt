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
abstract class AbstractChannel protected constructor(protected val channelManager: ChannelManager, protected val componentClass: Class<out Component>, protected @JvmField val address: ServiceAddress) : Channel, InvocationHandler {
    // implement Channel

    override fun setup() {}

    override fun getAddress(): ServiceAddress{
        return address
    }

    override fun needsUpdate(delta: ServiceInstanceRegistry.Delta): Boolean {
        return false
    }

    // implement InvocationHandler

    @Throws(Throwable::class)
    override fun invoke(target: Any, method: Method, args: Array<Any>): Any? {
        return this.invoke(SimpleMethodInvocation(target, method, *args))
    }
}
