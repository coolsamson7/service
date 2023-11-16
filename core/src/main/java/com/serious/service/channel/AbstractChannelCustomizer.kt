package com.serious.service.channel
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.Channel
import com.serious.service.ChannelManager
import com.serious.service.Component

/**
 * abstract base class for [ChannelCustomizer]s
 */
open class AbstractChannelCustomizer<T : Channel> protected constructor(channelManager: ChannelManager) : ChannelCustomizer<T> {
    // instance data

    override val channelClass: Class<out Channel>

    // constructor
    init {
        channelClass = javaClass.getAnnotation(RegisterChannelCustomizer::class.java).channel.java

        channelManager.registerChannelCustomizer(this)
    }

    // implement ChannelBuilder

    override fun isApplicable(component: String): Boolean {
        return true
    }

    override fun apply(channel: T) {
        // noop
    }
}
