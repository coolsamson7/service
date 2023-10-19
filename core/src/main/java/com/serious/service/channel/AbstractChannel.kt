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
abstract class AbstractChannel protected constructor(protected val channelManager: ChannelManager, override val componentDescriptor: ComponentDescriptor<out Component>, override val address: ServiceAddress) : Channel, InvocationHandler {
    // implement Channel

    override val name: String
        get() = address.channel

    override fun setup() {}

    override fun topologyUpdate(newAddress: ServiceAddress) {
    }

    // implement InvocationHandler

    @Throws(Throwable::class)
    override fun invoke(target: Any, method: Method, args: Array<Any>): Any? {
        return this.invoke(SimpleMethodInvocation(target, method, *args))
    }
}
