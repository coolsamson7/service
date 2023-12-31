package com.serious.service.channel
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.Channel
import com.serious.service.Component

/**
 * A [ChannelCustomizer] is used to dynamically intercept channel construction with custom logic
 */
interface ChannelCustomizer<T : Channel> {
    /**
     * return the corresponding channel class that this builder is responsible for
     */
    val channelClass: Class<out Channel>

    /**
     * return true if this builder is responsible for a particular [Component]
     */
    fun isApplicable(component: String): Boolean

    /**
     * apply any inital customizations
     *
     * @param channel the [Channel]
     * @return
     */
    fun apply(channel: T)
}
