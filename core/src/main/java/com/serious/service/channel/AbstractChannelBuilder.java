package com.serious.service.channel;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Channel;
import com.serious.service.ChannelManager;
import com.serious.service.Component;
import com.serious.service.RegisterChannel;

/**
 * @author Andreas Ernst
 */
public class AbstractChannelBuilder<T extends Channel> implements ChannelBuilder<T> {
    // instance data

    Class<? extends Channel> channelClass;

    // constructor

    protected AbstractChannelBuilder(ChannelManager channelManager) {
        channelClass = getClass().getAnnotation(RegisterChannelBuilder.class).channel();

        channelManager.registerChannelBuilder(this);

    }

    // implement ChannelBuilder

    public Class<? extends Channel> channelClass() {
        return channelClass;
    }

    @Override
    public boolean isApplicable(Class<Component> component) {
        return true;
    }
}
