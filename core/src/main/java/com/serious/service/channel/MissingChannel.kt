package com.serious.service.channel
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.ChannelManager
import com.serious.service.exception.ServiceRuntimeException
import org.aopalliance.intercept.MethodInvocation

/**
 * A channel constructed for non-resolvable addresses
 */
class MissingChannel(channelManager: ChannelManager, private val componentName: String) : AbstractChannel(channelManager) {
    // implement Channel

    @Throws(Throwable::class)
    override fun invoke(invocation: MethodInvocation): Any? {
        throw ServiceRuntimeException("unresolved channel for component %s", componentName)
    }
}
