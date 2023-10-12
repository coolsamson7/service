package com.serious.channel
/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.BaseDescriptor.Companion.forService
import com.serious.service.ChannelManager
import com.serious.service.Service
import com.serious.service.channel.AbstractChannel
import org.aopalliance.intercept.MethodInvocation

 /**
 * A <code>LocalChannel</code> is a [Channel] used for test purposed that simply assumes a local implementation
  * that it delegates to
 */
open class LocalChannel(channelManager: ChannelManager) : AbstractChannel(channelManager) {
    // implement
    @Throws(Throwable::class)
    override fun invoke(invocation: MethodInvocation): Any? {
        val implementation: Any? = forService(invocation.method.declaringClass as Class<Service>).local
        val method = implementation!!.javaClass.getMethod(invocation.method.name, *invocation.method.parameterTypes)
        return method.invoke(implementation, *invocation.arguments)
    }
}