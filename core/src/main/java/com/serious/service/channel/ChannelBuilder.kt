package com.serious.service.channel

import com.serious.service.Channel
import com.serious.service.Component

/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
interface ChannelBuilder<T : Channel?> {
    fun channelClass(): Class<out Channel?>
    fun isApplicable(component: Class<Component?>?): Boolean
}
