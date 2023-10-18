package com.serious.service.channel.rest
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.ChannelManager
import com.serious.service.channel.AbstractChannelCustomizer
import org.springframework.web.reactive.function.client.WebClient

/**
 * abstract base class for [ChannelBuilder] based on a [WebClient]
 */
abstract class AbstractRestChannelCustomizer protected constructor(channelManager: ChannelManager) : AbstractChannelCustomizer<RestChannel>(channelManager) {
    // abstract
    abstract fun customize(builder: WebClient.Builder): WebClient.Builder
}
