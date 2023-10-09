package com.serious.demo;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ChannelManager;
import com.serious.service.channel.RegisterChannelBuilder;
import com.serious.service.channel.rest.AbstractRestChannelBuilder;
import com.serious.service.channel.rest.RestChannel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * @author Andreas Ernst
 */
@RegisterChannelBuilder(channel = RestChannel.class)
public class RestChannelBuilder extends AbstractRestChannelBuilder {
    // constructor

    @Autowired
    public RestChannelBuilder(ChannelManager channelManager) {
        super(channelManager);
    }

    // implement AbstractRestChannelBuilder

    public WebClient.Builder build(WebClient.Builder builder) {
        return builder.filter((clientRequest, nextFilter) -> {
            //System.out.println(clientRequest.url().toString());

            return nextFilter.exchange(clientRequest);
        });
    }
}
