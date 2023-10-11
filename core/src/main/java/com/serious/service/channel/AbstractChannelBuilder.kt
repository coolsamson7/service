package com.serious.service.channel

import com.serious.service.Channel
import com.serious.service.ChannelManager
import com.serious.service.Component

/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
open class AbstractChannelBuilder<T : Channel?> protected constructor(channelManager: ChannelManager) :
    ChannelBuilder<T> {
    // instance data

    var channelClass: Class<out Channel?>

    // constructor
    init {
        channelClass = javaClass.getAnnotation(RegisterChannelBuilder::class.java).channel.java

        channelManager.registerChannelBuilder(this)
    }

    // implement ChannelBuilder
    override fun channelClass(): Class<out Channel?> {
        return channelClass
    }

    override fun isApplicable(component: Class<Component?>?): Boolean {
        return true
    }
}
