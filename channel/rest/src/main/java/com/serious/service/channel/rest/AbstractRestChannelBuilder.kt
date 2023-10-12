package com.serious.service.channel.rest
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.ChannelManager
import com.serious.service.channel.AbstractChannelBuilder
import org.springframework.web.reactive.function.client.WebClient

/**
 * abstract base class for [ChannelBuilder] based on a [WebClient]
 */
abstract class AbstractRestChannelBuilder  // constructor
protected constructor(channelManager: ChannelManager) : AbstractChannelBuilder<RestChannel>(channelManager) {
    // protected
    abstract fun build(builder: WebClient.Builder): WebClient.Builder
}
