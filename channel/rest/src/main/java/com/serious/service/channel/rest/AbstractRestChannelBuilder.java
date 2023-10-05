package com.serious.service.channel.rest;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ChannelManager;
import com.serious.service.channel.AbstractChannelBuilder;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * @author Andreas Ernst
 */
public abstract class AbstractRestChannelBuilder extends AbstractChannelBuilder<RestChannel> {
    // constructor

    protected AbstractRestChannelBuilder(ChannelManager channelManager) {
        super(channelManager);
    }

    // protected

    abstract protected WebClient.Builder build(WebClient.Builder builder); // TODO
}
