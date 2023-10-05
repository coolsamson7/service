package com.serious.service.channel;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Channel;
import com.serious.service.ChannelManager;
import com.serious.service.ServiceAddress;
import org.springframework.security.util.SimpleMethodInvocation;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.util.List;

/**
 * @author Andreas Ernst
 */
public abstract class AbstractChannel implements Channel, InvocationHandler {
    // instance data

    protected ServiceAddress serviceAddress;
    protected List<ServiceAddress> serviceAddresses;
    protected ChannelManager channelManager;

    // constructor

    protected AbstractChannel(ChannelManager channelManager) {
        this.channelManager = channelManager;
    }

    // implement Channel

    public ServiceAddress getAddress() {
        return serviceAddress;
    }

    public void setAddress(ServiceAddress serviceAddress) {
        this.serviceAddress = serviceAddress;
    }

    public void setup(Class<com.serious.service.Component> componentClass, List<ServiceAddress> serviceAddresses) {
        this.serviceAddresses = serviceAddresses;
        this.serviceAddress = serviceAddresses.get(0); // ?
    }

    // implement InvocationHandler

    public Object invoke(Object target, Method method, Object[] args) throws Throwable {
        return this.invoke(new SimpleMethodInvocation(target, method, args));
    }
}
