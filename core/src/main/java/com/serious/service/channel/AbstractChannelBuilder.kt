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
 * abstract base class for [ChannelBuilder]s
 */
open class AbstractChannelBuilder<T : Channel> protected constructor(channelManager: ChannelManager) : ChannelBuilder<T> {
    // instance data

    var channelClass: Class<out Channel>

    // constructor
    init {
        channelClass = javaClass.getAnnotation(RegisterChannelBuilder::class.java).channel.java

        channelManager.registerChannelBuilder(this)
    }

    // implement ChannelBuilder
    override fun channelClass(): Class<out Channel> {
        return channelClass
    }

    override fun isApplicable(component: Class<out Component>): Boolean {
        return true
    }
}
