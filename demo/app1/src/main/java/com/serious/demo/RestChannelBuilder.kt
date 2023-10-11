package com.serious.demo
/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.ChannelManager
import com.serious.service.channel.RegisterChannelBuilder
import com.serious.service.channel.rest.AbstractRestChannelBuilder
import com.serious.service.channel.rest.RestChannel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.reactive.function.client.ClientRequest
import org.springframework.web.reactive.function.client.ExchangeFunction
import org.springframework.web.reactive.function.client.WebClient

 /**
 * @author Andreas Ernst
 */
@RegisterChannelBuilder(channel = RestChannel::class)
class RestChannelBuilder  // constructor
@Autowired constructor(channelManager: ChannelManager?) : AbstractRestChannelBuilder(channelManager) {
    // implement AbstractRestChannelBuilder
    public override fun build(builder: WebClient.Builder): WebClient.Builder {
        return builder.filter { clientRequest: ClientRequest?, nextFilter: ExchangeFunction ->
            nextFilter.exchange(
                clientRequest
            )
        }
    }
}
