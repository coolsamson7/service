package com.serious.service.channel

import com.serious.service.ChannelManager
import com.serious.service.ServiceAddress
import com.serious.service.exception.ServiceRuntimeException
import org.aopalliance.intercept.MethodInvocation

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
class MissingChannel(
    channelManager: ChannelManager, // private
    private val componentName: String
) : AbstractChannel(channelManager) {
    // constructor
    init {
        // TODO KOTLIN serviceAddress = ServiceAddress() // Hmm?
    }

    // implement Channel
    @Throws(Throwable::class)
    override fun invoke(invocation: MethodInvocation): Any? {
        throw ServiceRuntimeException("unresolved channel for component %s", componentName)
    }
}
