package com.serious.service;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.channel.MissingChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.ServiceInstance;

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

    public static void recheck(ChannelManager channelManager, Map<String, List<ServiceInstance>> newMap) {
        // recheck missing channels

        for (ChannelInvocationHandler invocationHandler : handlers.values())
            if (invocationHandler.needsUpdate(channelManager, newMap))
                invocationHandler.resolve(null, null);
    }

    // instance data

    private final ComponentDescriptor componentDescriptor;
    private Channel channel;

    // constructor

    private ChannelInvocationHandler(ComponentDescriptor componentDescriptor, String channel, List<ServiceAddress> addresses) {
        this.componentDescriptor = componentDescriptor;

        resolve(channel, addresses);
    }

    // private

    private boolean needsUpdate(ChannelManager channelManager, Map<String, List<ServiceInstance>> newMap) {
        if ( channel instanceof MissingChannel)
            return true;

        // check for channels referencing a dead service instance

        ServiceInstance instance = channel.getAddress().getServiceInstance(); // TODO: what if it is a cluster address?

        if (!newMap.containsKey(componentDescriptor.getName()) || newMap.get(componentDescriptor.getName()).stream().noneMatch(serviceInstance -> serviceInstance.getInstanceId().equals(instance.getInstanceId()))) {
            log.info("channel {} for {} is dead", channel.getAddress(), componentDescriptor.getName());

            channelManager.removeChannel(channel);

            return true;
        }

        return false;
    }

    // public

    public void resolve(String channelName, List<ServiceAddress> addresses) {
        if ( channelName == null)
            channelName = channel.getAddress().getChannel(); // In case of updates?? TODO

        ComponentManager componentManager = componentDescriptor.componentManager;
        List<ServiceAddress> serviceAddresses = addresses != null ? addresses : componentManager.getServiceAddresses(componentDescriptor, channelName);

        channel = componentManager.getChannel(componentDescriptor, channelName, serviceAddresses);

        log.info("resolved channel {} for component {}", channelName, componentDescriptor);
    }

    // implement InvocationHandler

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        return channel.invoke(proxy, method, args);
    }
}
