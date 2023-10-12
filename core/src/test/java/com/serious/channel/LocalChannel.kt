package com.serious.channel;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.BaseDescriptor;
import com.serious.service.ChannelManager;
import com.serious.service.Service;
import com.serious.service.channel.AbstractChannel;
import org.aopalliance.intercept.MethodInvocation;

import java.lang.reflect.Method;

/**
 * @author Andreas Ernst
 */
public class LocalChannel extends AbstractChannel {
    // constructor

    protected LocalChannel(ChannelManager channelManager) {
        super(channelManager);
    }

    // implement

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        Object implementation = BaseDescriptor.forService((Class<Service>)invocation.getMethod().getDeclaringClass()).local;

        Method method = implementation.getClass().getMethod(invocation.getMethod().getName(), invocation.getMethod().getParameterTypes());

        return method.invoke(implementation, invocation.getArguments());
    }
}