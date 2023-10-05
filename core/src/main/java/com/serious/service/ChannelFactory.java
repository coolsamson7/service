package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.List;

/**
 * @author Andreas Ernst
 */
public interface ChannelFactory {
    /**
     * create a new {@link Channel} based on the specified {@link ServiceAddress}.
     *
     * @param serviceAddress a {@link ServiceAddress}
     * @return the created {@link Channel}
     */
    Channel makeChannel(Class<com.serious.service.Component> componentClass, List<ServiceAddress> serviceAddresses);
}

