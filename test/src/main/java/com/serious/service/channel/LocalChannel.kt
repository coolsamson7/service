package com.serious.service.channel
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.BaseDescriptor.Companion.forService
import com.serious.service.ChannelManager
import com.serious.service.Component
import com.serious.service.Service
import com.serious.service.ServiceAddress
import org.aopalliance.intercept.MethodInvocation

/**
 * A <code>LocalChannel</code> is a [Channel] used for test purposed that simply assumes a local implementation
 * that it delegates to
 */
class LocalChannel  // constructor
protected constructor(channelManager: ChannelManager, componentClass: Class<out Component>)
    : AbstractChannel(channelManager, componentClass, ServiceAddress("local", emptyList())) {
    // implement Channel
    @Throws(Throwable::class)
    override fun invoke(invocation: MethodInvocation): Any? {
        val implementation: Any? = forService(invocation.method.declaringClass as Class<Service>).local
        val method = implementation!!.javaClass.getMethod(invocation.method.name, *invocation.method.parameterTypes)

        return method.invoke(implementation, *invocation.arguments)
    }
}