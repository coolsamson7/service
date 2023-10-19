package com.serious.channel
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.*
import com.serious.service.BaseDescriptor.Companion.forService
import com.serious.service.channel.AbstractChannel
import org.aopalliance.intercept.MethodInvocation
import org.springframework.beans.factory.annotation.Autowired

/**
 * A <code>LocalChannel</code> is a [Channel] used for test purposed that simply assumes a local implementation
  * that it delegates to
 */
open class LocalChannel(channelManager: ChannelManager, componentDescriptor: ComponentDescriptor<out Component>)
     : AbstractChannel(channelManager, componentDescriptor, ServiceAddress(componentDescriptor.name, "local", emptyList())) {
    // instance data

    @Autowired
    lateinit var manager : ServiceManager

    // implement

    @Throws(Throwable::class)
    override fun invoke(invocation: MethodInvocation): Any? {
        val implementation: Any? = forService(invocation.method.declaringClass as Class<Service>).local
        val method = implementation!!.javaClass.getMethod(invocation.method.name, *invocation.method.parameterTypes)
        try {
            return method.invoke(implementation, *invocation.arguments)
        }
        catch(exception : Throwable) {
            return manager.handleException(invocation.method, exception) // will throw actually!
        }
    }
}