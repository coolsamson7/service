package com.serious.service.channel;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ChannelManager;
import com.serious.service.ServiceAddress;
import com.serious.service.exception.ServiceRegistryException;
import com.serious.service.exception.ServiceRuntimeException;
import org.aopalliance.intercept.MethodInvocation;

import java.net.URI;

/**
 * @author Andreas Ernst
 */
public class MissingChannel extends AbstractChannel {
    // private

    private final String componentName;

    // constructor

    public MissingChannel(ChannelManager channelManager, String componentName) {
        super(channelManager);

        this.componentName = componentName;
        setAddress(new ServiceAddress());
    }

    // implement Channel

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        throw new ServiceRuntimeException("unresolved channel for component " + this.componentName);
    }
}
