package com.serious.service;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.channel.MissingChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author Andreas Ernst
 */
public class ChannelInvocationHandler implements InvocationHandler {
    // static data

    static Logger log = LoggerFactory.getLogger(ChannelInvocationHandler.class);

    private static final Map<String, ChannelInvocationHandler> handlers = new ConcurrentHashMap<>();

    // static methods

    public static ChannelInvocationHandler forComponent(ComponentDescriptor componentDescriptor, String channel, List<ServiceAddress> addresses) {
        String key = componentDescriptor.getName() + ":" + channel;
        ChannelInvocationHandler handler = handlers.get(key);
        if ( handler == null)
            handlers.put(key, handler = new ChannelInvocationHandler(componentDescriptor, channel, addresses));

        return handler;
    }

    public static void recheck(ChannelManager channelManager, ServiceInstanceRegistry.Delta delta) {
        // recheck missing channels

        for (ChannelInvocationHandler invocationHandler : handlers.values())
            invocationHandler.checkUpdate(channelManager, delta);
    }

    // instance data

    private final ComponentDescriptor componentDescriptor;
    private final String channelName;
    private Channel channel;

    // constructor

    private ChannelInvocationHandler(ComponentDescriptor componentDescriptor, String channelName, List<ServiceAddress> addresses) {
        this.componentDescriptor = componentDescriptor;

        resolve(this.channelName = channelName, addresses);
    }

    // private

    private boolean checkUpdate(ChannelManager channelManager, ServiceInstanceRegistry.Delta delta) {
        if ( channel instanceof MissingChannel) {
            ComponentManager componentManager = componentDescriptor.componentManager;
            List<ServiceAddress> serviceAddresses = componentManager.getServiceAddresses(componentDescriptor, channelName);

            channel = componentManager.getChannel(componentDescriptor, channelName, serviceAddresses);
        }
        else {
           if (channel.needsUpdate(delta)) {
               // remove

               log.info("channel {} for {} is dead", channel.getPrimaryAddress(), componentDescriptor.getName());

               channelManager.removeChannel(channel);

               // resolve

               resolve(channelName, componentDescriptor.componentManager.getServiceAddresses(componentDescriptor, channelName));
           }
        }

        return true;
    }

    // public

    public void resolve(String channelName, List<ServiceAddress> addresses) {
        channel = componentDescriptor.componentManager.getChannel(componentDescriptor, channelName, addresses);

        log.info("resolved channel {} for component {}", channelName, componentDescriptor);
    }

    // implement InvocationHandler

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        return channel.invoke(proxy, method, args);
    }
}
