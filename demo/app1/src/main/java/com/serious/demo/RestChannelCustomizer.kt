package com.serious.demo
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.ChannelManager
import com.serious.service.channel.RegisterChannelCustomizer
import com.serious.service.channel.rest.AbstractRestChannelCustomizer
import com.serious.service.channel.rest.RestChannel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.reactive.function.client.ClientRequest
import org.springframework.web.reactive.function.client.ExchangeFunction
import org.springframework.web.reactive.function.client.WebClient

 /**
 * @author Andreas Ernst
 */
@RegisterChannelCustomizer(channel = RestChannel::class)
class RestChannelCustomizer @Autowired constructor(channelManager: ChannelManager) : AbstractRestChannelCustomizer(channelManager) {
    // implement AbstractRestChannelBuilder

     override fun apply(channel: RestChannel) {
         channel.roundRobin()
     }

    override fun customize(builder: WebClient.Builder): WebClient.Builder {
        return builder.filter { clientRequest: ClientRequest, nextFilter: ExchangeFunction ->
            nextFilter.exchange(clientRequest)
        }
    }
}
