package com.serious.service.channel;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Channel;
import com.serious.service.Component;

/**
 * @author Andreas Ernst
 */
public interface ChannelBuilder<T extends Channel> {
    Class<? extends Channel> channelClass();
    boolean isApplicable(Class<Component> component);
}
